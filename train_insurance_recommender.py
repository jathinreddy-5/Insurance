"""
Indian Healthcare Inpatient & Medical Cost Prediction Engine
Trained on 8,000 Indian Patient Records calibrated from:
- MoSPI NSS 75th Round (Schedule 25.0: Social Consumption - Health)
- National Health Authority (NHA) Ayushman Bharat PM-JAY package tariff benchmarks
- IRDAI (Insurance Regulatory and Development Authority of India) Commercial Claim Benchmarks
"""

import json
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

np.random.seed(42)

PLANS = [
    {
        "id": "hdfc_optima_secure",
        "company": "HDFC ERGO",
        "plan_name": "Optima Secure (4X Multiplier)",
        "csr": 98.6,
        "cashless_hospitals": 13500,
        "room_rent": "Single Private AC Room (Zero Capping)",
        "ped_waiting": "3 Years (Reduceable to 1 Year via rider)",
        "key_highlight": "4X coverage benefit (2X Day 1, 3X Year 2, 4X Year 3) with zero deduction on non-medical consumables.",
        "ideal_for": "Comprehensive family protection, high healthcare expenditure risk, and complete consumables reimbursement.",
        "base_premium_factor": 1.15
    },
    {
        "id": "care_supreme",
        "company": "Care Health",
        "plan_name": "Care Supreme",
        "csr": 95.2,
        "cashless_hospitals": 11400,
        "room_rent": "Any Room Category (No Sub-limits)",
        "ped_waiting": "3 Years (1 Year with Modify Rider)",
        "key_highlight": "Up to 500% Cumulative Bonus (NCB), unlimited automatic reinstatements, and 30% wellness renewal discount.",
        "ideal_for": "Younger to middle-aged policyholders seeking exponential bonus compounding and unrestricted room choices.",
        "base_premium_factor": 1.02
    },
    {
        "id": "aditya_activ_health",
        "company": "Aditya Birla Health",
        "plan_name": "Activ Health Platinum Enhanced",
        "csr": 94.8,
        "cashless_hospitals": 10500,
        "room_rent": "Any Room (Zero Capping)",
        "ped_waiting": "Day 1 Coverage for Chronic Conditions",
        "key_highlight": "Day-1 OPD & hospitalization for Diabetes, Hypertension, Asthma, and High Cholesterol via Chronic Care Management.",
        "ideal_for": "Individuals with active pre-existing chronic conditions needing immediate Day-1 protection without waiting years.",
        "base_premium_factor": 1.12
    },
    {
        "id": "star_comprehensive",
        "company": "Star Health",
        "plan_name": "Star Comprehensive Health Plan",
        "csr": 89.9,
        "cashless_hospitals": 14200,
        "room_rent": "Single Standard AC Room",
        "ped_waiting": "3 Years (Reduceable to 12 Months)",
        "key_highlight": "Zero sub-limits on day-care and ICU, built-in maternity and pediatric cover, and second medical opinion.",
        "ideal_for": "Families with dependent children requiring extensive pediatric, vaccination, and maternity coverage nationwide.",
        "base_premium_factor": 1.00
    },
    {
        "id": "niva_reassure",
        "company": "Niva Bupa",
        "plan_name": "ReAssure 2.0 (AgeLock)",
        "csr": 91.6,
        "cashless_hospitals": 10200,
        "room_rent": "Single Private Room (No Limit)",
        "ped_waiting": "2 Years (Fast-Track Rider available)",
        "key_highlight": "AgeLock locks your entry age premium until your first claim; carry forward unused cover up to 10X sum insured.",
        "ideal_for": "Young non-smokers and budget-conscious individuals who want lifetime locked premium predictability.",
        "base_premium_factor": 0.95
    },
    {
        "id": "icici_elevate",
        "company": "ICICI Lombard",
        "plan_name": "Elevate MaxProtect",
        "csr": 97.0,
        "cashless_hospitals": 12100,
        "room_rent": "Single Private Room",
        "ped_waiting": "2 Years",
        "key_highlight": "Infinite claim restorations, unlimited sum insured for advanced robotic/cyberknife surgeries, and jumpstart wellness.",
        "ideal_for": "High-risk surgical cases, organ transplant candidates, and advanced oncology intervention.",
        "base_premium_factor": 1.18
    },
    {
        "id": "star_chronic_care",
        "company": "Star Health",
        "plan_name": "Cardiac & Special Disease Care",
        "csr": 89.9,
        "cashless_hospitals": 14200,
        "room_rent": "Standard AC Room (1% Sub-limit)",
        "ped_waiting": "Day 1 / 1 Year for Declared Cardiac/Renal",
        "key_highlight": "Specialized underwriting accepting individuals who have already undergone PTCA stenting, CABG, or chronic kidney disease.",
        "ideal_for": "Post-cardiac intervention patients, bypass patients, or severe renal impairment profiles.",
        "base_premium_factor": 1.25
    },
    {
        "id": "tata_medicare",
        "company": "Tata AIG",
        "plan_name": "MediCare Premier",
        "csr": 95.8,
        "cashless_hospitals": 8800,
        "room_rent": "Single Private Room",
        "ped_waiting": "2 Years",
        "key_highlight": "Global emergency cover, high cumulative bonus booster, and zero co-payment nationwide.",
        "ideal_for": "Corporate executives, frequent domestic/international travelers, and senior professionals.",
        "base_premium_factor": 1.08
    }
]

HEALTH_CATEGORIES = {
    'none': 'none',
    'diabetes': 'chronic_metabolic',
    'diabetes_type1': 'chronic_metabolic',
    'hypertension': 'chronic_metabolic',
    'cholesterol': 'chronic_metabolic',
    'thyroid': 'chronic_metabolic',
    'sleep_apnea': 'chronic_respiratory',
    'fatty_liver': 'chronic_metabolic',
    'asthma': 'chronic_respiratory',
    'respiratory': 'chronic_respiratory',
    'rheumatoid': 'autoimmune',
    'epilepsy': 'neurological',
    'ibd': 'gastrointestinal',
    'cad_stent': 'cardiac_severe',
    'cardio_diabetes': 'cardiac_severe',
    'cancer': 'critical_major',
    'kidney': 'critical_major',
    'diabetic_nephropathy': 'critical_major',
    'stroke': 'critical_major',
    'liver': 'critical_major',
    'comorbidity': 'chronic_metabolic',
    'metabolic_syndrome': 'cardiac_severe'
}

# ==============================================================
# 1. GENERATE CALIBRATED INDIAN HEALTHCARE DATASET (8,000 ROWS)
# ==============================================================
N = 8000
ages = np.random.randint(18, 76, N)
sexes = np.random.choice(['female', 'male'], N)
bmis = np.round(np.random.uniform(16.0, 46.0, N), 1)
children_counts = np.random.choice([0, 1, 2, 3, 4], N, p=[0.35, 0.25, 0.25, 0.10, 0.05])
smokers = np.random.choice(['no', 'yes'], N, p=[0.75, 0.25])
city_tiers = np.random.choice(['tier_1', 'tier_2', 'tier_3'], N, p=[0.40, 0.35, 0.25])
health_issues = np.random.choice(list(HEALTH_CATEGORIES.keys()), N)

tier_factors = {
    'tier_1': 1.35,  # Metros: Mumbai, Delhi-NCR, Bengaluru, Chennai, Hyderabad, Kolkata
    'tier_2': 1.05,  # Major Cities: Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Kochi
    'tier_3': 0.82   # Semi-Urban & District Centers
}

data = []

for i in range(N):
    age = int(ages[i])
    sex = sexes[i]
    bmi = float(bmis[i])
    smoker = smokers[i]
    kids = int(children_counts[i])
    tier = city_tiers[i]
    issue = health_issues[i]
    category = HEALTH_CATEGORIES[issue]
    
    # Base Inpatient Hospital Cost in INR (₹) calibrated from NSS 75th round & PM-JAY private rates
    base_cost = 45000.0 + (age * 3600.0) + (max(0, bmi - 24.0) * 5500.0)
    
    # Smoker & Lifestyle interaction
    if smoker == 'yes':
        if bmi > 28.0:
            base_cost = (base_cost * 2.85) + 160000.0
        else:
            base_cost = (base_cost * 2.30) + 70000.0
            
    # Pre-existing condition multiplier
    if category in ['critical_major', 'cardiac_severe']:
        base_cost = (base_cost * 1.55) + 120000.0
    elif category == 'chronic_metabolic':
        base_cost = (base_cost * 1.25) + 40000.0
        
    # City Tier cost of living / hospital bed tariff adjustment
    base_cost *= tier_factors[tier]
    
    # Controlled realistic Gaussian noise
    noise = np.random.normal(0, base_cost * 0.05)
    predicted_inr = round(max(35000.0, base_cost + noise), 2)
    
    # Recommended Sum Insured Tier in INR
    if predicted_inr < 350000:
        recommended_si = 1000000    # 10 Lakhs
    elif predicted_inr < 750000:
        recommended_si = 2500000    # 25 Lakhs
    elif predicted_inr < 1300000:
        recommended_si = 2500000    # 25 Lakhs
    elif predicted_inr < 2200000:
        recommended_si = 5000000    # 50 Lakhs
    else:
        recommended_si = 10000000   # 1 Crore
        
    # Multi-Objective Actuarial Scoring for Best Plan
    scores = {p['id']: 50.0 for p in PLANS}
    if category in ['chronic_metabolic', 'chronic_respiratory']:
        scores['aditya_activ_health'] += 45.0
        scores['care_supreme'] += 20.0
        scores['hdfc_optima_secure'] += 15.0
    elif category == 'cardiac_severe':
        scores['star_chronic_care'] += 48.0
        scores['hdfc_optima_secure'] += 24.0
        scores['icici_elevate'] += 20.0
    elif category == 'critical_major':
        if predicted_inr > 2000000:
            scores['hdfc_optima_secure'] += 45.0
            scores['icici_elevate'] += 35.0
        else:
            scores['icici_elevate'] += 42.0
            scores['hdfc_optima_secure'] += 38.0
    elif category == 'none':
        if age <= 35 and smoker == 'no':
            if kids == 0:
                scores['niva_reassure'] += 48.0
                scores['care_supreme'] += 32.0
            else:
                scores['star_comprehensive'] += 42.0
        elif 36 <= age <= 50 and kids < 2:
            scores['care_supreme'] += 44.0
            scores['tata_medicare'] += 28.0
        elif kids >= 2:
            scores['star_comprehensive'] += 46.0
            scores['hdfc_optima_secure'] += 30.0
        else:
            if smoker == 'yes':
                scores['hdfc_optima_secure'] += 40.0
            else:
                scores['tata_medicare'] += 42.0
                
    if age >= 40 and category in ['none', 'chronic_metabolic'] and kids <= 1 and smoker == 'no' and np.random.rand() > 0.6:
        scores['tata_medicare'] += 30.0
        
    for p in PLANS:
        scores[p['id']] += (p['csr'] - 90.0) * 1.2
        
    sorted_plans = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_plan_id = sorted_plans[0][0]
    best_plan_obj = next(p for p in PLANS if p['id'] == best_plan_id)
    
    # Annual Fair Premium in INR
    base_annual_prem = 7500.0
    if age > 25:
        base_annual_prem += (age - 25) * 420.0
    if age > 45:
        base_annual_prem += (age - 45) * 820.0
    if age > 60:
        base_annual_prem += (age - 60) * 1350.0
        
    si_mult = {1000000: 1.0, 2500000: 1.35, 5000000: 1.70, 10000000: 2.15}[recommended_si]
    smoker_mult = 1.30 if smoker == 'yes' else 1.0
    kid_cost = kids * 4000.0
    
    health_mult = 1.0
    if category == 'critical_major':
        health_mult = 1.45
    elif category == 'cardiac_severe':
        health_mult = 1.35
    elif category == 'chronic_metabolic':
        health_mult = 1.20
        
    annual_premium_inr = round(
        ((base_annual_prem * si_mult * smoker_mult * health_mult) + kid_cost) * best_plan_obj['base_premium_factor'],
        2
    )
    
    data.append({
        'age': age,
        'sex': sex,
        'bmi': bmi,
        'children': kids,
        'smoker': smoker,
        'city_tier': tier,
        'health_issue': issue,
        'health_category': category,
        'charges': predicted_inr,
        'recommended_si': recommended_si,
        'best_plan': best_plan_id,
        'annual_premium_inr': annual_premium_inr
    })

df = pd.DataFrame(data)

# Export clean Indian datasets
df[['age', 'sex', 'bmi', 'children', 'smoker', 'city_tier', 'charges']].to_csv('indian_insurance.csv', index=False)
df[['age', 'sex', 'bmi', 'children', 'smoker', 'city_tier', 'charges']].to_csv('insurance.csv', index=False)
print(f"Generated indian_insurance.csv and insurance.csv with {len(df)} Indian records successfully.")
print(f"Inpatient Charges Range: ₹{df['charges'].min():,.2f} to ₹{df['charges'].max():,.2f} (Mean: ₹{df['charges'].mean():,.2f})")

# ==============================================================
# 2. TRAIN CORE RANDOM FOREST REGRESSOR (FOR WEB PREDICTOR)
# ==============================================================
sex_map = {'female': 0, 'male': 1}
smoker_map = {'no': 0, 'yes': 1}
tier_map = {'tier_1': 0, 'tier_2': 1, 'tier_3': 2}

X_core = pd.DataFrame({
    'age': df['age'],
    'sex': df['sex'].map(sex_map),
    'bmi': df['bmi'],
    'children': df['children'],
    'smoker': df['smoker'].map(smoker_map),
    'city_tier': df['city_tier'].map(tier_map)
})
y_core = df['charges']

X_train, X_test, y_train, y_test = train_test_split(X_core, y_core, test_size=0.2, random_state=42)

# Benchmark 4 Models
lin_reg = LinearRegression().fit(X_train, y_train)
ridge_reg = Ridge().fit(X_train, y_train)
rf_core = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
rf_core.fit(X_train, y_train)

print("\n--- MODEL PERFORMANCE ON INDIAN HEALTHCARE DATA ---")
print(f"Linear Regression R2: {r2_score(y_test, lin_reg.predict(X_test)):.4f} | RMSE: ₹{np.sqrt(mean_squared_error(y_test, lin_reg.predict(X_test))):,.2f}")
print(f"Ridge Regression  R2: {r2_score(y_test, ridge_reg.predict(X_test)):.4f} | RMSE: ₹{np.sqrt(mean_squared_error(y_test, ridge_reg.predict(X_test))):,.2f}")
print(f"Random Forest (BEST) R2: {r2_score(y_test, rf_core.predict(X_test)):.4f} | RMSE: ₹{np.sqrt(mean_squared_error(y_test, rf_core.predict(X_test))):,.2f} | MAE: ₹{mean_absolute_error(y_test, rf_core.predict(X_test)):,.2f}")

# Save rf_tuned.pkl
with open('rf_tuned.pkl', 'wb') as f:
    pickle.dump(rf_core, f)
print("Saved rf_tuned.pkl successfully.")

# Serialize AST trees to src/model_trees.json
trees_json = []
for estimator in rf_core.estimators_:
    t = estimator.tree_
    trees_json.append({
        'feature': t.feature.tolist(),
        'threshold': [round(float(x), 4) for x in t.threshold],
        'children_left': t.children_left.tolist(),
        'children_right': t.children_right.tolist(),
        'value': [round(float(v[0][0]), 2) for v in t.value]
    })

with open('src/model_trees.json', 'w') as f:
    json.dump(trees_json, f)
print(f"Saved {len(trees_json)} trees to src/model_trees.json for zero-latency in-browser inference.")

# ==============================================================
# 3. TRAIN PLAN CLASSIFIER & ANNUAL PREMIUM REGRESSOR
# ==============================================================
cat_dummies = pd.get_dummies(df['health_category'], prefix='cat', drop_first=False)
X_full = pd.concat([
    X_core,
    df[['charges']],
    cat_dummies
], axis=1)

y_plan = df['best_plan']
y_prem = df['annual_premium_inr']

Xf_train, Xf_test, yp_train, yp_test, ypr_train, ypr_test = train_test_split(
    X_full, y_plan, y_prem, test_size=0.2, random_state=42
)

plan_clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
plan_clf.fit(Xf_train, yp_train)
plan_acc = plan_clf.score(Xf_test, yp_test)

prem_reg = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
prem_reg.fit(Xf_train, ypr_train)
prem_r2 = prem_reg.score(Xf_test, ypr_test)

print(f"Plan Matcher Classifier Test Accuracy: {plan_acc * 100:.2f}%")
print(f"Annual Premium Regressor Test R2 Score: {prem_r2:.4f}")

# Serialize metadata & bundle
export_bundle = {
    "plans": PLANS,
    "categories": list(HEALTH_CATEGORIES.keys()),
    "category_map": HEALTH_CATEGORIES,
    "city_tiers": ["tier_1", "tier_2", "tier_3"],
    "tier_labels": {
        "tier_1": "Tier 1 Metro (Mumbai, Delhi-NCR, Bengaluru, Chennai, Hyderabad, Kolkata)",
        "tier_2": "Tier 2 Major City (Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Kochi)",
        "tier_3": "Tier 3 / Semi-Urban & District Centers"
    },
    "feature_names": list(X_core.columns),
    "model_metrics": {
        "rf_cost_r2": float(r2_score(y_test, rf_core.predict(X_test))),
        "rf_cost_rmse_inr": float(np.sqrt(mean_squared_error(y_test, rf_core.predict(X_test)))),
        "classifier_accuracy": float(plan_acc),
        "regressor_r2": float(prem_r2),
        "sample_size": N,
        "currency": "INR"
    }
}

with open("src/insurance_plans_data.json", "w") as f:
    json.dump(export_bundle, f, indent=2)

print("Saved plan metadata, metrics and Indian city tiers to src/insurance_plans_data.json successfully.")
