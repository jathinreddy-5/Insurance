# MediPredict — Indian Healthcare Inpatient & Insurance Cost Predictor

A precision inpatient healthcare cost prediction workbench and insurance recommendation platform utilizing a hyperparameter-tuned Random Forest regression engine trained on Indian healthcare microdata calibrated from MoSPI NSS 75th Round, PM-JAY package tariff benchmarks, and IRDAI commercial claim standards.

---

## 🚀 Key Features

- **Actuarial Cost Prediction**: Real-time hospital inpatient cost estimation driven by an ensemble Random Forest Regressor ($R^2 = 0.8285$) serialized to JSON tree structures for client-side evaluation without backend latency.
- **Microdata Calibration**: Calibrated against:
  - **MoSPI NSS 75th Round** (Schedule 25.0: Social Consumption - Health)
  - **National Health Authority (NHA)** Ayushman Bharat PM-JAY package tariff benchmarks
  - **IRDAI** Commercial Claim Benchmarks
- **Intelligent Insurance Matching**: Automatic matching of IRDAI-compliant health insurance policies (HDFC ERGO, Care Health, Star Health, ICICI Lombard, Niva Bupa, etc.) based on predicted cost exposure, room rent capping, pre-existing disease (PED) waiting periods, and network cashless hospitals.
- **Interactive Workbench**: Built with modern React 19 and Vite with interactive risk profiling, hospital research guides, and architecture visualizations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons
- **ML / Data Science**: Python 3, scikit-learn, NumPy, pandas
- **Models**: Tuned Random Forest Regressor (`rf_tuned.pkl`, exported client-side trees `model_trees.json`)

---

## 📦 Getting Started

### 1. Web Application

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

### 2. Model Training & Exploration

To train or recalibrate the model:

```bash
python3 train_insurance_recommender.py
```

To generate system architecture diagrams and mindmaps:

```bash
python3 generate_architecture_diagram.py
python3 generate_mindmap.py
python3 generate_simple_architecture.py
```
