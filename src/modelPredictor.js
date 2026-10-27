import modelTrees from './model_trees.json';

/**
 * Executes zero-latency in-browser inference on the trained 100-estimator
 * Random Forest model (rf_tuned.pkl) trained directly on 8,000 Indian
 * patient records calibrated from MoSPI NSS 75th Round microdata, PM-JAY
 * package tariffs, and IRDAI commercial health insurance claim benchmarks.
 * 
 * Features vector:
 * [age, sex_code, bmi, children, smoker_code, city_tier_code]
 * sex: female=0, male=1
 * smoker: no=0, yes=1
 * city_tier: tier_1=0 (Metros), tier_2=1 (Major Cities), tier_3=2 (Semi-Urban)
 * 
 * Target:
 * Inpatient hospitalization expenditure in Indian Rupees (₹ INR).
 */
export function predictRandomForest(age, sex, bmi, children, smoker, cityTier) {
  const sexCode = sex === 'female' ? 0 : 1;
  const smokerCode = smoker === 'no' ? 0 : 1;
  const tierMap = { tier_1: 0, tier_2: 1, tier_3: 2 };
  const tierCode = tierMap[cityTier] ?? 0;

  const features = [
    Number(age),
    sexCode,
    Number(bmi),
    Number(children),
    smokerCode,
    tierCode
  ];

  let totalSum = 0;
  const treeCount = modelTrees.length;

  for (let i = 0; i < treeCount; i++) {
    const tree = modelTrees[i];
    let node = 0;

    while (tree.children_left[node] !== -1) {
      const featIdx = tree.feature[node];
      if (features[featIdx] <= tree.threshold[node]) {
        node = tree.children_left[node];
      } else {
        node = tree.children_right[node];
      }
    }
    totalSum += tree.value[node];
  }

  const prediction = totalSum / treeCount;
  return Math.round(prediction);
}

/**
 * Computes non-smoker baseline directly in INR to isolate the tobacco surcharge.
 */
export function predictNonSmokerBaseline(age, sex, bmi, children, cityTier) {
  return predictRandomForest(age, sex, bmi, children, 'no', cityTier);
}
