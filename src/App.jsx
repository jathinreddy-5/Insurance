import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Check, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Filter,
  CheckCircle2,
  ExternalLink,
  Award,
  Sparkles,
  Activity,
  ArrowUp,
  ChevronRight
} from 'lucide-react';
import { predictRandomForest, predictNonSmokerBaseline } from './modelPredictor.js';
import { matchInsurancePlans } from './insurancePlanMatcher.js';

// Native Indian Healthcare Inpatient Cost & Actuarial Insurance Predictor
// Calibrated from MoSPI NSS 75th Round, PM-JAY Tariffs & IRDAI Commercial Claims

// Pre-existing medical conditions categorized with actuarial risk factors
const HEALTH_ISSUES = [
  // Baseline
  { 
    id: 'none', 
    label: 'None (No Chronic Pre-Existing Conditions)', 
    category: 'Standard Baseline', 
    factor: 1.0, 
    specialtyMatch: [] 
  },

  // Critical & Major Organ Conditions
  { 
    id: 'cancer', 
    label: 'Cancer History (In Remission / Post-Treatment)', 
    category: 'Critical & Major Organ Conditions', 
    factor: 1.60, 
    specialtyMatch: ['Oncology', 'Cancer Care', 'Head & Neck Oncology'] 
  },
  { 
    id: 'cad_stent', 
    label: 'Coronary Artery Disease / Post-Stent / CABG', 
    category: 'Critical & Major Organ Conditions', 
    factor: 1.45, 
    specialtyMatch: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology', 'Cardiovascular Sciences'] 
  },
  { 
    id: 'kidney', 
    label: 'Chronic Kidney Disease (Stage 3+ / Dialysis)', 
    category: 'Critical & Major Organ Conditions', 
    factor: 1.50, 
    specialtyMatch: ['Nephrology', 'Renal Sciences', 'Kidney Transplants'] 
  },
  { 
    id: 'stroke', 
    label: 'Stroke / Cerebrovascular Disease (TIA)', 
    category: 'Critical & Major Organ Conditions', 
    factor: 1.45, 
    specialtyMatch: ['Neurosciences'] 
  },
  { 
    id: 'liver', 
    label: 'Chronic Liver Disease / Cirrhosis / Hepatitis B/C', 
    category: 'Critical & Major Organ Conditions', 
    factor: 1.40, 
    specialtyMatch: ['Gastroenterology', 'Organ Transplant'] 
  },

  // Common Metabolic & Lifestyle Disorders
  { 
    id: 'diabetes', 
    label: 'Type 2 Diabetes Mellitus', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.20, 
    specialtyMatch: ['General Medicine'] 
  },
  { 
    id: 'diabetes_type1', 
    label: 'Type 1 Diabetes (Insulin-Dependent)', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.30, 
    specialtyMatch: ['General Medicine', 'Paediatric Care'] 
  },
  { 
    id: 'hypertension', 
    label: 'Hypertension / High Blood Pressure', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.15, 
    specialtyMatch: ['Cardiology', 'General Medicine'] 
  },
  { 
    id: 'cholesterol', 
    label: 'Dyslipidemia / High Cholesterol', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.12, 
    specialtyMatch: ['Cardiology', 'General Medicine'] 
  },
  { 
    id: 'thyroid', 
    label: 'Thyroid Disorder (Hypo / Hyperthyroid)', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.10, 
    specialtyMatch: ['General Medicine'] 
  },
  { 
    id: 'sleep_apnea', 
    label: 'Severe Obstructive Sleep Apnea (OSA / CPAP)', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.18, 
    specialtyMatch: ['Pulmonology', 'Critical Care'] 
  },
  { 
    id: 'fatty_liver', 
    label: 'Grade II/III Fatty Liver (NAFLD / NASH)', 
    category: 'Metabolic & Lifestyle Disorders', 
    factor: 1.15, 
    specialtyMatch: ['Gastroenterology'] 
  },

  // Respiratory, Autoimmune & Neurological
  { 
    id: 'asthma', 
    label: 'Asthma / Bronchial Hyperreactivity', 
    category: 'Respiratory, Autoimmune & Neurological', 
    factor: 1.15, 
    specialtyMatch: ['Pulmonology'] 
  },
  { 
    id: 'respiratory', 
    label: 'Chronic Obstructive Pulmonary Disease (COPD)', 
    category: 'Respiratory, Autoimmune & Neurological', 
    factor: 1.28, 
    specialtyMatch: ['Pulmonology', 'Critical Care'] 
  },
  { 
    id: 'rheumatoid', 
    label: 'Rheumatoid Arthritis / Systemic Lupus (SLE)', 
    category: 'Respiratory, Autoimmune & Neurological', 
    factor: 1.25, 
    specialtyMatch: ['Orthopaedics', 'General Medicine'] 
  },
  { 
    id: 'epilepsy', 
    label: 'Epilepsy / Seizure Disorder', 
    category: 'Respiratory, Autoimmune & Neurological', 
    factor: 1.20, 
    specialtyMatch: ['Neurosciences'] 
  },
  { 
    id: 'ibd', 
    label: 'Inflammatory Bowel Disease (Ulcerative Colitis / Crohn\'s)', 
    category: 'Respiratory, Autoimmune & Neurological', 
    factor: 1.22, 
    specialtyMatch: ['Gastroenterology'] 
  },

  // High-Impact Multi-Morbidities
  { 
    id: 'comorbidity', 
    label: 'Dual: Type 2 Diabetes + Hypertension', 
    category: 'High-Impact Multi-Morbidities', 
    factor: 1.35, 
    specialtyMatch: ['Cardiology', 'Nephrology', 'General Medicine'] 
  },
  { 
    id: 'cardio_diabetes', 
    label: 'Dual: Cardiovascular Disease + Diabetes', 
    category: 'High-Impact Multi-Morbidities', 
    factor: 1.55, 
    specialtyMatch: ['Cardiology', 'Cardiac Surgery', 'Cardiovascular Sciences'] 
  },
  { 
    id: 'diabetic_nephropathy', 
    label: 'Dual: Diabetic Nephropathy (Diabetes + Kidney Disease)', 
    category: 'High-Impact Multi-Morbidities', 
    factor: 1.60, 
    specialtyMatch: ['Nephrology', 'Renal Sciences', 'Kidney Transplants'] 
  },
  { 
    id: 'metabolic_syndrome', 
    label: 'Triple: Metabolic Syndrome (Severe Obesity + BP + Sugar)', 
    category: 'High-Impact Multi-Morbidities', 
    factor: 1.45, 
    specialtyMatch: ['Cardiology', 'Critical Care', 'General Medicine'] 
  },
];

const HEALTH_CATEGORIES = Array.from(new Set(HEALTH_ISSUES.map(h => h.category)));

function formatINR(val, digits = 2) {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  return '₹' + Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// Empanelled Indian Hospitals Database
const HOSPITALS_DATABASE = [
  {
    id: 'apollo-chennai',
    name: 'Apollo Hospitals',
    location: 'Greams Road, Chennai, Tamil Nadu',
    tier: 'Tier 1 Metro (Chennai)',
    type: 'Private Multi-Specialty Quaternary',
    accreditation: 'JCI & NABH Accredited',
    schemes: ['Cashless TPA', 'Corporate Mediclaim', 'Select PM-JAY Units'],
    insurers: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health', 'Niva Bupa', 'Bajaj Allianz'],
    turnaround: 'Under 2 hours electronic pre-authorization',
    specialties: ['Cardiology', 'Oncology', 'Organ Transplant', 'Orthopaedics'],
    tpaContact: '1800-425-2335'
  },
  {
    id: 'narayana-bengaluru',
    name: 'Narayana Health City',
    location: 'Bommasandra, Bengaluru, Karnataka',
    tier: 'Tier 1 Metro (Bengaluru)',
    type: 'Super-Specialty Tertiary Network',
    accreditation: 'NABH & NABL Accredited',
    schemes: ['Cashless TPA', 'Ayushman Bharat PM-JAY', 'State Health Schemes'],
    insurers: ['Ayushman Bharat PM-JAY', 'Star Health', 'United India', 'New India Assurance', 'HDFC ERGO', 'Tata AIG'],
    turnaround: 'Dedicated Ayushman Mitra & TPA Desk (Instant Pre-Auth)',
    specialties: ['Cardiac Surgery', 'Nephrology', 'Paediatric Care', 'Neurosciences'],
    tpaContact: '1800-309-0309'
  },
  {
    id: 'manipal-bengaluru',
    name: 'Manipal Hospital',
    location: 'HAL Old Airport Road, Bengaluru, Karnataka',
    tier: 'Tier 1 Metro (Bengaluru)',
    type: 'Private Tertiary Teaching Hospital',
    accreditation: 'NABH & Green Hospital Certified',
    schemes: ['Cashless TPA', 'Corporate Group Mediclaim', 'Government ECHS'],
    insurers: ['HDFC ERGO', 'ICICI Lombard', 'Care Health', 'Niva Bupa', 'Aditya Birla Health', 'Star Health'],
    turnaround: '1.5 hours average cashless approval clearance',
    specialties: ['Gastroenterology', 'Pulmonology', 'Orthopaedics', 'Renal Sciences'],
    tpaContact: '080-2502-4444'
  },
  {
    id: 'fortis-delhi',
    name: 'Fortis Memorial Research Institute',
    location: 'Sector 44, Gurugram / Delhi NCR',
    tier: 'Tier 1 Metro (Delhi-NCR)',
    type: 'Private Multi-Organ Super Specialty',
    accreditation: 'NABH & JCI Accredited',
    schemes: ['Cashless TPA', 'Private Mediclaim', 'International Insurance'],
    insurers: ['Star Health', 'Max Bupa / Niva', 'ICICI Lombard', 'HDFC ERGO', 'Reliance General', 'Universal Sompo'],
    turnaround: '24/7 dedicated cashless insurance facilitation',
    specialties: ['BMT', 'Interventional Cardiology', 'Minimal Access Surgery', 'Critical Care'],
    tpaContact: '0124-4962200'
  },
  {
    id: 'max-delhi',
    name: 'Max Super Speciality Hospital',
    location: 'Saket, New Delhi',
    tier: 'Tier 1 Metro (Delhi-NCR)',
    type: 'Private Quaternary Super Specialty',
    accreditation: 'NABH & JCI Certified',
    schemes: ['Cashless TPA', 'CGHS', 'ECHS', 'Commercial Group Insurance'],
    insurers: ['HDFC ERGO', 'Star Health', 'Care Health', 'ICICI Lombard', 'Future Generali', 'SBI General'],
    turnaround: 'Fast-track electronic pre-auth via National Health Claims Exchange (NHCX)',
    specialties: ['Cancer Care', 'Cardiovascular Sciences', 'Neurosciences', 'Orthopaedics'],
    tpaContact: '011-2651-5050'
  },
  {
    id: 'aiims-newdelhi',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    location: 'Ansari Nagar, New Delhi',
    tier: 'Apex National Center (Delhi)',
    type: 'Central Public Apex Autonomous Institute',
    accreditation: 'Statutory Institute of National Importance',
    schemes: ['Ayushman Bharat PM-JAY (100% Free)', 'CGHS', 'State BPL Schemes'],
    insurers: ['Ayushman Bharat PM-JAY', 'Government Social Health Insurance', 'RAN Funds'],
    turnaround: 'Immediate on-spot PM-JAY golden card counter admission',
    specialties: ['All Specialties & Complex Multi-System Disease'],
    tpaContact: '011-2658-8500'
  },
  {
    id: 'kims-hyderabad',
    name: 'KIMS Hospitals (Krishna Institute of Medical Sciences)',
    location: 'Secunderabad / Hyderabad, Telangana',
    tier: 'Tier 1 Metro (Hyderabad)',
    type: 'Private Quaternary Care Network',
    accreditation: 'NABH Accredited',
    schemes: ['Cashless TPA', 'Aarogyasri Health Scheme', 'PM-JAY'],
    insurers: ['Star Health', 'Care Health', 'HDFC ERGO', 'Telangana Aarogyasri', 'PM-JAY', 'ICICI Lombard'],
    turnaround: 'Under 2 hours cashless pre-authorization desk',
    specialties: ['Cardiology', 'Pulmonology', 'Kidney Transplants', 'Vascular Surgery'],
    tpaContact: '040-4488-5000'
  },
  {
    id: 'amrita-kochi',
    name: 'Amrita Hospital',
    location: 'Ponekkara, Kochi, Kerala',
    tier: 'Tier 2 Major City (Kochi)',
    type: 'Non-Profit Quaternary Super Specialty',
    accreditation: 'NABH & NABL Accredited',
    schemes: ['Cashless TPA', 'Ayushman Bharat PM-JAY', 'Karunya Benevolent Fund'],
    insurers: ['PM-JAY', 'Star Health', 'United India Insurance', 'National Insurance', 'HDFC ERGO', 'Care Health'],
    turnaround: 'Subsidized & cashless insurance processing unit',
    specialties: ['Head & Neck Oncology', 'Pediatric Cardiology', 'Robotic Surgery', 'Gastroenterology'],
    tpaContact: '0484-285-1234'
  },
  {
    id: 'tata-memorial-mumbai',
    name: 'Tata Memorial Centre (TMC & ACTREC)',
    location: 'Parel, Mumbai, Maharashtra',
    tier: 'Tier 1 Metro (Mumbai)',
    type: 'Apex National Comprehensive Cancer Institute',
    accreditation: 'AERB, NABH & NABL Accredited',
    schemes: ['Cashless TPA', 'Ayushman Bharat PM-JAY', 'CGHS & ECHS', 'State Relief Funds'],
    insurers: ['Ayushman Bharat PM-JAY', 'Star Health', 'HDFC ERGO', 'ICICI Lombard', 'New India Assurance', 'United India'],
    turnaround: 'Instant PM-JAY Golden Card Fast-Track & 24/7 TPA Desk',
    specialties: ['Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Bone Marrow Transplant', 'Breast Cancer', 'Gynecological Oncology', 'Prostate Cancer'],
    tpaContact: '022-2417-7000'
  },
  {
    id: 'medanta-gurugram',
    name: 'Medanta - The Medicity',
    location: 'Sector 38, Gurugram / Delhi NCR',
    tier: 'Tier 1 Metro (Delhi-NCR)',
    type: 'Private Multi-Organ Quaternary Institute',
    accreditation: 'JCI & NABH Accredited',
    schemes: ['Cashless TPA', 'Corporate Mediclaim', 'International Insurance'],
    insurers: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health', 'Niva Bupa', 'Bajaj Allianz'],
    turnaround: 'Under 1 hour digital pre-authorization clearance',
    specialties: ['Liver Transplant', 'Robotic Urology', 'Andrology', 'Cardiac Surgery', 'Neurology', 'Nephrology'],
    tpaContact: '0124-414-1414'
  },
  {
    id: 'rainbow-hyderabad',
    name: "Rainbow Children's Hospital & BirthRight",
    location: 'Road No. 2, Banjara Hills, Hyderabad, Telangana',
    tier: 'Tier 1 Metro (Hyderabad)',
    type: 'Tertiary Quaternary Mother & Child Super Specialty',
    accreditation: 'JCI & NABH Accredited',
    schemes: ['Cashless TPA', 'Corporate Group Mediclaim', 'Select Government Panels'],
    insurers: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health', 'Niva Bupa', 'Aditya Birla Health'],
    turnaround: 'Instant cashless maternity & emergency pediatric admission desk',
    specialties: ['High-Risk Obstetrics', 'Maternal Fetal Medicine', 'Gynecology', 'Laparoscopic Surgery', 'IVF & Infertility', 'PCOS Care', 'Pediatric Intensive Care'],
    tpaContact: '040-4242-5000'
  },
  {
    id: 'sankara-nethralaya',
    name: 'Sankara Nethralaya',
    location: 'College Road, Nungambakkam, Chennai, Tamil Nadu',
    tier: 'Tier 1 Metro (Chennai)',
    type: 'Apex Non-Profit Tertiary Ophthalmic Research Institute',
    accreditation: 'NABH & NABL Accredited',
    schemes: ['Cashless TPA', 'Ayushman Bharat PM-JAY', 'Government Subsidized'],
    insurers: ['Star Health', 'HDFC ERGO', 'United India', 'National Insurance', 'ICICI Lombard', 'PM-JAY'],
    turnaround: 'Same-day cashless day-care surgical clearance',
    specialties: ['Vitreoretinal Surgery', 'Cornea Transplants', 'Glaucoma', 'Pediatric Ophthalmology', 'Refractive Laser Surgery'],
    tpaContact: '044-4227-1500'
  }
];

// Comprehensive World Health Conditions Database mapped to Best Empanelled Hospital in India
const ALL_WORLD_HEALTH_ISSUES = [
  // MEN'S HEALTH SPECIFIC
  {
    id: 'men_prostate_cancer',
    name: 'Prostate Cancer (Robotic Radical Prostatectomy)',
    gender: 'men',
    domain: "Men's Urologic Oncology",
    bestHospitalId: 'medanta-gurugram',
    bestHospitalReason: "India's highest volume Da Vinci Xi robotic radical prostatectomy center with 98% nerve-sparing continence and potency preservation.",
    alternativeHospitalIds: ['tata-memorial-mumbai', 'fortis-delhi', 'apollo-chennai']
  },
  {
    id: 'men_bph',
    name: 'Benign Prostatic Hyperplasia (Enlarged Prostate / HoLEP)',
    gender: 'men',
    domain: "Men's Endourology",
    bestHospitalId: 'fortis-delhi',
    bestHospitalReason: 'Pioneered day-care Holmium Laser Enucleation of Prostate (HoLEP) and Rezūm water vapor thermal therapy with zero blood loss.',
    alternativeHospitalIds: ['medanta-gurugram', 'manipal-bengaluru', 'max-delhi']
  },
  {
    id: 'men_infertility',
    name: 'Male Infertility & Non-Obstructive Azoospermia (Micro-TESE)',
    gender: 'men',
    domain: "Men's Andrology",
    bestHospitalId: 'medanta-gurugram',
    bestHospitalReason: 'Dedicated Institute of Andrology featuring operating microscope guided testicular sperm extraction (Micro-TESE) and cryo-banking.',
    alternativeHospitalIds: ['apollo-chennai', 'aiims-newdelhi', 'rainbow-hyderabad']
  },
  {
    id: 'men_ed_prosthesis',
    name: 'Severe Erectile Dysfunction & Inflatable Penile Prosthesis',
    gender: 'men',
    domain: "Men's Sexual Medicine",
    bestHospitalId: 'fortis-delhi',
    bestHospitalReason: 'Dedicated Center for Andrology with specialized suites for AMS 700 and Coloplast 3-piece inflatable penile prosthesis surgery.',
    alternativeHospitalIds: ['medanta-gurugram', 'apollo-chennai', 'kims-hyderabad']
  },
  {
    id: 'men_testicular_cancer',
    name: 'Testicular Cancer & Retroperitoneal Lymph Node Dissection',
    gender: 'men',
    domain: "Men's Urologic Oncology",
    bestHospitalId: 'tata-memorial-mumbai',
    bestHospitalReason: 'Apex national genitourinary oncology protocol delivering >96% overall 5-year survival via nerve-sparing retroperitoneal lymph node dissection.',
    alternativeHospitalIds: ['aiims-newdelhi', 'medanta-gurugram', 'max-delhi']
  },
  {
    id: 'men_varicocele',
    name: 'Varicocele & Chronic Male Pelvic Pain',
    gender: 'men',
    domain: "Men's Vascular & Andrology",
    bestHospitalId: 'apollo-chennai',
    bestHospitalReason: 'Subinguinal microsurgical varicocelectomy under 20x magnification and catheter-guided coil embolization with instant recovery.',
    alternativeHospitalIds: ['kims-hyderabad', 'manipal-bengaluru', 'amrita-kochi']
  },
  {
    id: 'men_hypogonadism',
    name: 'Male Hypogonadism & Testosterone Deficiency (Andropause)',
    gender: 'men',
    domain: "Men's Endocrinology",
    bestHospitalId: 'aiims-newdelhi',
    bestHospitalReason: 'Apex Department of Endocrinology with specialized male reproductive hormone profiling and long-acting testosterone replacement therapy.',
    alternativeHospitalIds: ['apollo-chennai', 'fortis-delhi', 'max-delhi']
  },
  {
    id: 'men_gynecomastia',
    name: 'Gynecomastia (Male Chest Glandular Correction)',
    gender: 'men',
    domain: "Men's Aesthetic & Reconstructive",
    bestHospitalId: 'max-delhi',
    bestHospitalReason: 'Minimally invasive VASER ultrasound-assisted lipolysis with glandular excision ensuring scar-free chest contouring.',
    alternativeHospitalIds: ['apollo-chennai', 'manipal-bengaluru', 'fortis-delhi']
  },

  // WOMEN'S HEALTH SPECIFIC
  {
    id: 'women_breast_cancer',
    name: 'Breast Cancer (Triple Negative / HER2+ / Luminal)',
    gender: 'women',
    domain: "Women's Oncology",
    bestHospitalId: 'tata-memorial-mumbai',
    bestHospitalReason: "National Apex Women's Cancer Centre managing over 8,000 breast cases annually with oncoplastic breast conservation and intraoperative radiation.",
    alternativeHospitalIds: ['apollo-chennai', 'max-delhi', 'amrita-kochi']
  },
  {
    id: 'women_cervical_ovarian_cancer',
    name: 'Cervical & Advanced Ovarian Cancer (Cytoreductive & HIPEC)',
    gender: 'women',
    domain: "Women's Gynecologic Oncology",
    bestHospitalId: 'tata-memorial-mumbai',
    bestHospitalReason: 'Pioneered Hyperthermic Intraperitoneal Chemotherapy (HIPEC) and robotic radical hysterectomy with clinical multidisciplinary tumor boards.',
    alternativeHospitalIds: ['apollo-chennai', 'max-delhi', 'aiims-newdelhi']
  },
  {
    id: 'women_pcos',
    name: 'Polycystic Ovary Syndrome (PCOS / PCOD) & Metabolic Sub-types',
    gender: 'women',
    domain: "Women's Reproductive Endocrinology",
    bestHospitalId: 'rainbow-hyderabad',
    bestHospitalReason: 'Integrated BirthRight reproductive endocrinology clinic combining metabolic insulin sensitization, ovulation induction, and lifestyle intervention.',
    alternativeHospitalIds: ['manipal-bengaluru', 'apollo-chennai', 'amrita-kochi']
  },
  {
    id: 'women_endometriosis',
    name: 'Deep Infiltrating Endometriosis & Adenomyosis',
    gender: 'women',
    domain: "Women's Advanced Gynecologic Surgery",
    bestHospitalId: 'rainbow-hyderabad',
    bestHospitalReason: 'BirthRight Specialized Endometriosis Center providing 4K laparoscopic and robotic radical excision of deep infiltrating pelvic endometriosis.',
    alternativeHospitalIds: ['manipal-bengaluru', 'amrita-kochi', 'apollo-chennai']
  },
  {
    id: 'women_fibroids',
    name: 'Uterine Fibroids (Laparoscopic / Robotic Myomectomy)',
    gender: 'women',
    domain: "Women's Benign Gynecology",
    bestHospitalId: 'manipal-bengaluru',
    bestHospitalReason: 'Pioneering uterus-preserving robotic myomectomy and uterine artery embolization (UAE) preventing unnecessary hysterectomy.',
    alternativeHospitalIds: ['rainbow-hyderabad', 'apollo-chennai', 'max-delhi']
  },
  {
    id: 'women_high_risk_pregnancy',
    name: 'High-Risk Pregnancy & Maternal-Fetal Complications',
    gender: 'women',
    domain: "Women's Maternal-Fetal Medicine",
    bestHospitalId: 'rainbow-hyderabad',
    bestHospitalReason: 'Equipped with Level-IV NICU, dedicated maternal critical care unit (MICU), and fetal medicine fetal surgery capabilities.',
    alternativeHospitalIds: ['aiims-newdelhi', 'manipal-bengaluru', 'amrita-kochi']
  },
  {
    id: 'women_ivf_infertility',
    name: 'Advanced Infertility, IVF / ICSI & Blastocyst Transfer',
    gender: 'women',
    domain: "Women's Reproductive Medicine",
    bestHospitalId: 'rainbow-hyderabad',
    bestHospitalReason: 'BirthRight Fertility Center with cleanroom class-10,000 embryology labs, time-lapse embryo monitoring, and PGT-A genetic screening.',
    alternativeHospitalIds: ['manipal-bengaluru', 'apollo-chennai', 'max-delhi']
  },
  {
    id: 'women_pelvic_prolapse',
    name: 'Pelvic Organ Prolapse & Urogynecology',
    gender: 'women',
    domain: "Women's Urogynecology",
    bestHospitalId: 'amrita-kochi',
    bestHospitalReason: 'Dedicated Department of Urogynecology performing robotic sacrocolpopexy and native tissue pelvic floor reconstruction.',
    alternativeHospitalIds: ['apollo-chennai', 'manipal-bengaluru', 'kims-hyderabad']
  },
  {
    id: 'women_menopause_osteoporosis',
    name: 'Menopausal Syndrome & Severe Post-Menopausal Osteoporosis',
    gender: 'women',
    domain: "Women's Preventive Health",
    bestHospitalId: 'apollo-chennai',
    bestHospitalReason: "Comprehensive Apollo Women's Health Institute equipped with dual-energy X-ray absorptiometry (DEXA) and hormone replacement surveillance.",
    alternativeHospitalIds: ['manipal-bengaluru', 'max-delhi', 'aiims-newdelhi']
  },
  {
    id: 'women_endometrial_cancer',
    name: 'Uterine / Endometrial Cancer (Robotic Staging)',
    gender: 'women',
    domain: "Women's Gynecologic Oncology",
    bestHospitalId: 'max-delhi',
    bestHospitalReason: 'Pioneers in Da Vinci robotic staging with indocyanine green (ICG) sentinel lymph node biopsy reducing lower-limb lymphedema.',
    alternativeHospitalIds: ['tata-memorial-mumbai', 'apollo-chennai', 'aiims-newdelhi']
  },

  // UNIVERSAL & CRITICAL CONDITIONS
  {
    id: 'heart_attack_cad',
    name: 'Coronary Artery Disease & Acute Heart Attack (STEMI)',
    gender: 'universal',
    domain: 'Cardiology & Cardiac Surgery',
    bestHospitalId: 'narayana-bengaluru',
    bestHospitalReason: "Largest cardiac care hospital network in the world with 24/7 primary angioplasty door-to-balloon time under 45 minutes.",
    alternativeHospitalIds: ['apollo-chennai', 'fortis-delhi', 'medanta-gurugram']
  },
  {
    id: 'heart_failure_transplant',
    name: 'End-Stage Heart Failure & Heart Transplantation',
    gender: 'universal',
    domain: 'Cardiology & Organ Transplant',
    bestHospitalId: 'kims-hyderabad',
    bestHospitalReason: 'Ranked #1 in India for dual heart-lung transplants, artificial heart (LVAD) implantations, and advanced heart failure ICU.',
    alternativeHospitalIds: ['narayana-bengaluru', 'apollo-chennai', 'aiims-newdelhi']
  },
  {
    id: 'arrhythmia_pacemaker',
    name: 'Cardiac Arrhythmia, Atrial Fibrillation & Leadless Pacemaker',
    gender: 'universal',
    domain: 'Cardiology & Electrophysiology',
    bestHospitalId: 'apollo-chennai',
    bestHospitalReason: 'Equipped with CARTO 3 3D electro-anatomical mapping, cryoballoon ablation, and Micra leadless pacemaker implantation.',
    alternativeHospitalIds: ['fortis-delhi', 'narayana-bengaluru', 'max-delhi']
  },
  {
    id: 'blood_cancer_leukemia',
    name: 'Leukemia, Lymphoma & Multiple Myeloma',
    gender: 'universal',
    domain: 'Oncology & Hematology',
    bestHospitalId: 'tata-memorial-mumbai',
    bestHospitalReason: 'National Apex Hematolymphoid Center with CAR-T cell therapy, precision cytogenetics, and specialized clinical protocols.',
    alternativeHospitalIds: ['fortis-delhi', 'apollo-chennai', 'aiims-newdelhi']
  },
  {
    id: 'bmt_stem_cell',
    name: 'Bone Marrow Transplant (Allogeneic / Haploidentical BMT)',
    gender: 'universal',
    domain: 'Oncology & Stem Cell Transplant',
    bestHospitalId: 'fortis-delhi',
    bestHospitalReason: 'Over 1,500 bone marrow transplants with HEPA-filtered positive pressure BMT suites and pediatric transplant teams.',
    alternativeHospitalIds: ['tata-memorial-mumbai', 'apollo-chennai', 'narayana-bengaluru']
  },
  {
    id: 'lung_cancer',
    name: 'Lung Cancer & Mediastinal Tumors',
    gender: 'universal',
    domain: 'Oncology & Thoracic Surgery',
    bestHospitalId: 'tata-memorial-mumbai',
    bestHospitalReason: 'Dedicated Thoracic Disease Management Group with robotic VATS lobectomy and next-generation sequencing for targeted therapies.',
    alternativeHospitalIds: ['max-delhi', 'apollo-chennai', 'fortis-delhi']
  },
  {
    id: 'brain_tumor_glioma',
    name: 'Brain Tumor, Glioma & Skull Base Lesions',
    gender: 'universal',
    domain: 'Neurology & Neurosurgery',
    bestHospitalId: 'max-delhi',
    bestHospitalReason: 'Features BrainSuite with intraoperative 3T MRI, neuro-navigation, and robotic tumor resection under awake craniotomy.',
    alternativeHospitalIds: ['aiims-newdelhi', 'apollo-chennai', 'medanta-gurugram']
  },
  {
    id: 'stroke_aneurysm',
    name: 'Acute Stroke, Brain Aneurysm & Neurovascular Intervention',
    gender: 'universal',
    domain: 'Neurology & Neuro-Intervention',
    bestHospitalId: 'medanta-gurugram',
    bestHospitalReason: 'Comprehensive 24/7 Stroke Institute with biplane neuro-interventional catheterization for instant mechanical thrombectomy.',
    alternativeHospitalIds: ['manipal-bengaluru', 'max-delhi', 'apollo-chennai']
  },
  {
    id: 'refractory_epilepsy',
    name: 'Refractory Epilepsy & Neurological Seizures',
    gender: 'universal',
    domain: 'Neurology & Neuro-Electrophysiology',
    bestHospitalId: 'aiims-newdelhi',
    bestHospitalReason: 'Autonomous Center of Excellence for Epilepsy Surgery with Magnetoencephalography (MEG) and stereo-EEG invasive monitoring.',
    alternativeHospitalIds: ['narayana-bengaluru', 'amrita-kochi', 'max-delhi']
  },
  {
    id: 'ckd_kidney_transplant',
    name: 'End-Stage Renal Disease & Kidney Transplantation',
    gender: 'universal',
    domain: 'Nephrology & Organ Transplant',
    bestHospitalId: 'apollo-chennai',
    bestHospitalReason: 'Over 21,000 kidney transplants performed with ABO-incompatible and robotic donor nephrectomy protocols.',
    alternativeHospitalIds: ['kims-hyderabad', 'narayana-bengaluru', 'manipal-bengaluru']
  },
  {
    id: 'kidney_stones',
    name: 'Complex Kidney Stones & Obstructive Uropathy',
    gender: 'universal',
    domain: 'Urology & Endourology',
    bestHospitalId: 'medanta-gurugram',
    bestHospitalReason: 'Advanced endourology suite with high-power Thulium Fiber Laser (TFL) and mini-PCNL for scarless stone clearance.',
    alternativeHospitalIds: ['fortis-delhi', 'manipal-bengaluru', 'max-delhi']
  },
  {
    id: 'liver_cirrhosis_transplant',
    name: 'Decompensated Liver Cirrhosis & Liver Transplantation',
    gender: 'universal',
    domain: 'Gastroenterology & Organ Transplant',
    bestHospitalId: 'medanta-gurugram',
    bestHospitalReason: 'Medanta Liver Institute has conducted over 4,000 living donor liver transplants with a 95% 1-year graft survival rate.',
    alternativeHospitalIds: ['apollo-chennai', 'manipal-bengaluru', 'amrita-kochi']
  },
  {
    id: 'copd_respiratory_failure',
    name: 'Severe COPD, Acute Respiratory Failure & ECMO',
    gender: 'universal',
    domain: 'Pulmonology & Critical Care',
    bestHospitalId: 'manipal-bengaluru',
    bestHospitalReason: 'Comprehensive respiratory intensive care with 24/7 veno-venous ECMO support and bronchial thermoplasty.',
    alternativeHospitalIds: ['kims-hyderabad', 'fortis-delhi', 'max-delhi']
  },
  {
    id: 'interstitial_lung_disease',
    name: 'Pulmonary Fibrosis (ILD) & Lung Transplantation',
    gender: 'universal',
    domain: 'Pulmonology & Organ Transplant',
    bestHospitalId: 'kims-hyderabad',
    bestHospitalReason: 'Largest dedicated lung transplant program in South Asia with comprehensive pulmonary rehabilitation.',
    alternativeHospitalIds: ['apollo-chennai', 'manipal-bengaluru', 'aiims-newdelhi']
  },
  {
    id: 'pancreatitis_gi_bleed',
    name: 'Acute Severe Pancreatitis & Upper GI Bleeding',
    gender: 'universal',
    domain: 'Gastroenterology & Endoscopy',
    bestHospitalId: 'manipal-bengaluru',
    bestHospitalReason: 'Specialized Institute of Gastroenterology & Hepatobiliary Sciences with 24/7 therapeutic ERCP and endoscopic necrosectomy.',
    alternativeHospitalIds: ['apollo-chennai', 'medanta-gurugram', 'amrita-kochi']
  },
  {
    id: 'joint_replacement_knee_hip',
    name: 'Total Knee & Total Hip Joint Replacement',
    gender: 'universal',
    domain: 'Orthopaedics & Joint Reconstruction',
    bestHospitalId: 'apollo-chennai',
    bestHospitalReason: 'Mako 3D CT-based robotic arm assisted joint replacement center delivering sub-millimeter surgical accuracy and same-day walking.',
    alternativeHospitalIds: ['max-delhi', 'manipal-bengaluru', 'fortis-delhi']
  },
  {
    id: 'spine_surgery_slipped_disc',
    name: 'Slipped Disc, Sciatica & Complex Spine Deformity',
    gender: 'universal',
    domain: 'Orthopaedics & Spine Surgery',
    bestHospitalId: 'max-delhi',
    bestHospitalReason: 'Equipped with Mazor X Stealth robotic guidance and O-arm 3D imaging for ultra-minimally invasive endoscopic spine surgery.',
    alternativeHospitalIds: ['apollo-chennai', 'manipal-bengaluru', 'medanta-gurugram']
  },
  {
    id: 'diabetes_complications',
    name: 'Severe Brittle Diabetes & Diabetic Foot Ulcer Salvage',
    gender: 'universal',
    domain: 'Endocrinology & Vascular Surgery',
    bestHospitalId: 'apollo-chennai',
    bestHospitalReason: 'Integrated Apollo Centre for Endocrinology & Diabetes with hyperbaric oxygen therapy and dedicated limb salvage team.',
    alternativeHospitalIds: ['aiims-newdelhi', 'manipal-bengaluru', 'narayana-bengaluru']
  },
  {
    id: 'lupus_autoimmune_disease',
    name: 'Systemic Lupus Erythematosus (SLE), Vasculitis & Rheumatoid Arthritis',
    gender: 'universal',
    domain: 'Rheumatology & Autoimmune',
    bestHospitalId: 'aiims-newdelhi',
    bestHospitalReason: 'Premier Department of Clinical Immunology and Rheumatology with specialized autoantibody profiling and biologic therapies.',
    alternativeHospitalIds: ['kims-hyderabad', 'apollo-chennai', 'manipal-bengaluru']
  },
  {
    id: 'retina_eye_surgery',
    name: 'Retinal Detachment, Vitrectomy & Cornea Transplants',
    gender: 'universal',
    domain: 'Ophthalmology & Eye Care',
    bestHospitalId: 'sankara-nethralaya',
    bestHospitalReason: 'Apex ophthalmic referral center in Asia for 25-gauge sutureless vitrectomy, keratoprosthesis, and pediatric eye diseases.',
    alternativeHospitalIds: ['aiims-newdelhi', 'apollo-chennai', 'amrita-kochi']
  },
  {
    id: 'ent_cochlear_implant',
    name: 'Severe Hearing Loss & Cochlear Implantation',
    gender: 'universal',
    domain: 'ENT & Head/Neck Surgery',
    bestHospitalId: 'amrita-kochi',
    bestHospitalReason: 'Dedicated Center for Head & Neck Surgery and Cochlear Implants with auditory verbal therapy and robotic skull-base access.',
    alternativeHospitalIds: ['apollo-chennai', 'fortis-delhi', 'max-delhi']
  }
];

export default function App() {
  // Navigation active section & smooth scroll tracking (Supaste reference)
  const [activeSection, setActiveSection] = useState('predictor');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHasScrolled(scrollY > 20);
      setShowBackToTop(scrollY > 400);

      const predictorEl = document.getElementById('predictor');
      const plansEl = document.getElementById('plans');
      const hospitalsEl = document.getElementById('hospitals');

      const offset = 220;
      if (hospitalsEl && scrollY >= hospitalsEl.offsetTop - offset) {
        setActiveSection('hospitals');
      } else if (plansEl && scrollY >= plansEl.offsetTop - offset) {
        setActiveSection('plans');
      } else {
        setActiveSection('predictor');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    if (e && e.preventDefault) e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const navOffset = 90;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('predictor');
  };

  // Input Biometric Vectors
  const [age, setAge] = useState(45);
  const [bmi, setBmi] = useState(30.0);
  const [sex, setSex] = useState('male');
  const [children, setChildren] = useState(2);
  const [smoker, setSmoker] = useState('yes');
  const [cityTier, setCityTier] = useState('tier_1');
  const [healthIssue, setHealthIssue] = useState('none');

  // Hospital filter options
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState('all');

  // World Health Conditions and Gender Hospital Matcher State
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'men' | 'women'
  const [selectedHospitalCondition, setSelectedHospitalCondition] = useState('');

  // Active chosen world condition
  const activeHospitalCondition = useMemo(() => {
    return ALL_WORLD_HEALTH_ISSUES.find(c => c.id === selectedHospitalCondition) || null;
  }, [selectedHospitalCondition]);

  const handleGenderChange = (newGender) => {
    setGenderFilter(newGender);
    if (newGender === 'men' && activeHospitalCondition && activeHospitalCondition.gender === 'women') {
      setSelectedHospitalCondition('');
    } else if (newGender === 'women' && activeHospitalCondition && activeHospitalCondition.gender === 'men') {
      setSelectedHospitalCondition('');
    }
  };

  // Conditions filtered by selected gender
  const availableConditions = useMemo(() => {
    if (genderFilter === 'men') {
      return ALL_WORLD_HEALTH_ISSUES.filter(c => c.gender === 'men');
    }
    if (genderFilter === 'women') {
      return ALL_WORLD_HEALTH_ISSUES.filter(c => c.gender === 'women');
    }
    return ALL_WORLD_HEALTH_ISSUES;
  }, [genderFilter]);

  // Group conditions by domain or category for clean optgroups
  const conditionGroups = useMemo(() => {
    const groups = {};
    availableConditions.forEach(cond => {
      const groupName = cond.gender === 'men' 
        ? "Men's Health Specific" 
        : cond.gender === 'women' 
          ? "Women's Health Specific" 
          : cond.domain;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(cond);
    });
    return Object.keys(groups).map(name => ({
      name,
      items: groups[name]
    }));
  }, [availableConditions]);

  // Best hospital for selected condition
  const bestHospitalForCondition = useMemo(() => {
    if (!activeHospitalCondition) return null;
    return HOSPITALS_DATABASE.find(h => h.id === activeHospitalCondition.bestHospitalId) || null;
  }, [activeHospitalCondition]);

  // Selected health issue factor
  const activeCondition = useMemo(() => {
    return HEALTH_ISSUES.find(h => h.id === healthIssue) || HEALTH_ISSUES[0];
  }, [healthIssue]);

  // Real model prediction using the exported 100-tree Random Forest directly in INR
  const baseRFChargeINR = useMemo(() => {
    return predictRandomForest(age, sex, bmi, children, smoker, cityTier);
  }, [age, sex, bmi, children, smoker, cityTier]);

  const predictedValueINR = useMemo(() => {
    return Math.round(baseRFChargeINR * activeCondition.factor);
  }, [baseRFChargeINR, activeCondition]);

  const healthIssueSurchargeINR = useMemo(() => {
    return Math.max(0, predictedValueINR - baseRFChargeINR);
  }, [baseRFChargeINR, predictedValueINR]);

  // Non-smoker baseline prediction to isolate tobacco variance directly in INR
  const nonSmokerBaselineINR = useMemo(() => {
    const rawBase = predictNonSmokerBaseline(age, sex, bmi, children, cityTier);
    return Math.round(rawBase * activeCondition.factor);
  }, [age, sex, bmi, children, cityTier, activeCondition]);

  const smokerSurchargeINR = useMemo(() => {
    return Math.max(0, predictedValueINR - nonSmokerBaselineINR);
  }, [predictedValueINR, nonSmokerBaselineINR]);

  const loadPreset = (pAge, pSex, pBmi, pChildren, pSmoker, pCityTier, pHealth = 'none') => {
    setAge(pAge);
    setSex(pSex);
    setBmi(pBmi);
    setChildren(pChildren);
    setSmoker(pSmoker);
    setCityTier(pCityTier);
    setHealthIssue(pHealth);
  };

  // Filtered hospitals list
  const filteredHospitals = useMemo(() => {
    return HOSPITALS_DATABASE.filter(h => {
      if (selectedSchemeFilter === 'pmjay') {
        return h.schemes.some(s => s.toLowerCase().includes('pm-jay'));
      }
      if (selectedSchemeFilter === 'tpa') {
        return h.schemes.some(s => s.toLowerCase().includes('cashless tpa'));
      }
      return true;
    });
  }, [selectedSchemeFilter]);

  // Sort hospitals so that the #1 best hospital for selected condition is shown first,
  // followed by alternative centers, then other empanelled hospitals.
  const displayHospitals = useMemo(() => {
    let list = [...filteredHospitals];
    if (activeHospitalCondition) {
      list.sort((a, b) => {
        if (a.id === activeHospitalCondition.bestHospitalId) return -1;
        if (b.id === activeHospitalCondition.bestHospitalId) return 1;
        const aIsAlt = (activeHospitalCondition.alternativeHospitalIds || []).includes(a.id);
        const bIsAlt = (activeHospitalCondition.alternativeHospitalIds || []).includes(b.id);
        if (aIsAlt && !bIsAlt) return -1;
        if (!aIsAlt && bIsAlt) return 1;
        return 0;
      });
    }
    return list;
  }, [filteredHospitals, activeHospitalCondition]);

  // Actuarial Health Insurance Plan Matching Engine
  const insuranceMatchResult = useMemo(() => {
    return matchInsurancePlans(age, bmi, smoker, children, healthIssue, predictedValueINR);
  }, [age, bmi, smoker, children, healthIssue, predictedValueINR]);

  return (
    <div className="workbench-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Supaste-inspired Floating Sticky Navigation Dock */}
      <header className="supaste-nav-wrapper">
        <nav className={`supaste-nav ${hasScrolled ? 'scrolled' : ''}`}>
          {/* Left: Brand Name */}
          <a 
            href="#predictor" 
            onClick={(e) => scrollToSection(e, 'predictor')} 
            className="supaste-nav-left"
          >
            <span className="supaste-brand-name">Insure</span>
          </a>

          {/* Center: The 3 Core Section Links */}
          <div className="supaste-nav-tabs">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'predictor')}
              className={`supaste-tab-link ${activeSection === 'predictor' ? 'active' : ''}`}
            >
              {activeSection === 'predictor' && <span className="supaste-active-dot" />}
              <span>Healthcare Expense Predictor</span>
            </button>

            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'plans')}
              className={`supaste-tab-link ${activeSection === 'plans' ? 'active' : ''}`}
            >
              {activeSection === 'plans' && <span className="supaste-active-dot" />}
              <span>Matched Insurance Policies</span>
            </button>

            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'hospitals')}
              className={`supaste-tab-link ${activeSection === 'hospitals' ? 'active' : ''}`}
            >
              {activeSection === 'hospitals' && <span className="supaste-active-dot" />}
              <span>Accredited Partner Hospitals</span>
            </button>
          </div>

          {/* Right: Action Button */}
          <div className="supaste-nav-right">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'plans')}
              className="supaste-action-btn"
            >
              <span>Explore Plans</span>
              <ChevronRight size={13} strokeWidth={2.4} />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Interactive Instrument / Workbench (The Exact Scale from your Screenshot) */}
      <main id="predictor" style={{ flex: 1, padding: '36px 0 64px' }}>
        <div className="container">
          <div className="section-heading-block" style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 600, 
              color: 'var(--color-ink)', 
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}>
              Healthcare Expense Predictor
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-graphite)', maxWidth: '780px', lineHeight: 1.5 }}>
              Execute live predictions directly in your browser through the 100-tree ensemble trained on Indian healthcare microdata (8,000 patient records calibrated from MoSPI NSS 75th Round, PM-JAY and IRDAI benchmarks). All outputs calculated in native Indian Rupee (₹ INR).
            </p>
          </div>

          {/* Quick Presets Strip */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-pewter)', marginRight: '8px' }}>
              Reference Profiles:
            </span>
            <button 
              type="button" 
              className="btn-outline"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => loadPreset(45, 'male', 30.0, 2, 'yes', 'tier_1', 'none')}
            >
              Benchmark: 45y Smoker, BMI 30, 2 Kids (Tier 1 Metro)
            </button>
            <button 
              type="button" 
              className="btn-outline"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => loadPreset(24, 'female', 22.0, 0, 'no', 'tier_2', 'none')}
            >
              Low-Risk: 24y Non-Smoker, BMI 22 (Tier 2 City)
            </button>
            <button 
              type="button" 
              className="btn-outline"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => loadPreset(58, 'male', 36.4, 3, 'yes', 'tier_1', 'diabetes')}
            >
              High-Risk: 58y Obese Smoker, Diabetes (Tier 1 Metro)
            </button>
          </div>

          {/* Prediction Two-Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: '32px', alignItems: 'start', marginBottom: '64px' }}>
            {/* Left Card: Input Controls */}
            <div className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Age Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>Age</label>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-graphite)' }}>{age} years</span>
                  </div>
                  <input 
                    type="range" 
                    min="18" 
                    max="75" 
                    value={age} 
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--color-ink)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-steel)', marginTop: '4px' }}>
                    <span>18</span>
                    <span>45</span>
                    <span>75</span>
                  </div>
                </div>

                {/* BMI Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>Body Mass Index</label>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-graphite)' }}>{bmi.toFixed(1)} kg/m²</span>
                  </div>
                  <input 
                    type="range" 
                    min="15.0" 
                    max="50.0" 
                    step="0.1" 
                    value={bmi} 
                    onChange={(e) => setBmi(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-ink)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-steel)', marginTop: '4px' }}>
                    <span>15.0 (Normal)</span>
                    <span>30.0 (Obese)</span>
                    <span>50.0</span>
                  </div>
                </div>

                {/* Sex Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
                    Biological Sex
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      className={sex === 'male' ? 'btn-outline' : 'btn-ghost'}
                      style={{ 
                        border: sex === 'male' ? '1.5px solid var(--color-ink)' : '1px solid var(--color-mist)',
                        borderRadius: 'var(--radius-inputs)',
                        padding: '10px',
                        justifyContent: 'center',
                        fontWeight: 600
                      }}
                      onClick={() => setSex('male')}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      className={sex === 'female' ? 'btn-outline' : 'btn-ghost'}
                      style={{ 
                        border: sex === 'female' ? '1.5px solid var(--color-ink)' : '1px solid var(--color-mist)',
                        borderRadius: 'var(--radius-inputs)',
                        padding: '10px',
                        justifyContent: 'center',
                        fontWeight: 600
                      }}
                      onClick={() => setSex('female')}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Dependents */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
                    Dependent Children
                  </label>
                  <select 
                    className="input-field" 
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                  >
                    <option value={0}>0 dependents</option>
                    <option value={1}>1 dependent</option>
                    <option value={2}>2 dependents</option>
                    <option value={3}>3 dependents</option>
                    <option value={4}>4 dependents</option>
                    <option value={5}>5 or more</option>
                  </select>
                </div>

                {/* Pre-Existing Medical Issues Dropdown */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                      Previous Health Issues / Pre-Existing Medical Conditions
                    </label>
                    <span className="tag-badge">ACTUARIAL FACTOR</span>
                  </div>
                  <select 
                    className="input-field" 
                    value={healthIssue}
                    onChange={(e) => setHealthIssue(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {HEALTH_CATEGORIES.map(cat => (
                      <optgroup key={cat} label={cat}>
                        {HEALTH_ISSUES.filter(issue => issue.category === cat).map(issue => (
                          <option key={issue.id} value={issue.id}>
                            {issue.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Smoker Selector */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                      Tobacco Inhalation (69.4% Model Feature Weight)
                    </label>
                    <span className="tag-badge">PRIMARY FACTOR</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div 
                      onClick={() => setSmoker('no')}
                      style={{
                        border: smoker === 'no' ? '1.5px solid var(--color-ink)' : '1px solid var(--color-mist)',
                        borderRadius: 'var(--radius-cards)',
                        padding: '14px',
                        cursor: 'pointer',
                        backgroundColor: smoker === 'no' ? 'var(--color-fog)' : 'transparent'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Non-Smoker</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '2px' }}>Baseline risk cohort</div>
                    </div>

                    <div 
                      onClick={() => setSmoker('yes')}
                      style={{
                        border: smoker === 'yes' ? '1.5px solid var(--color-ink)' : '1px solid var(--color-mist)',
                        borderRadius: 'var(--radius-cards)',
                        padding: '14px',
                        cursor: 'pointer',
                        backgroundColor: smoker === 'yes' ? 'var(--color-fog)' : 'transparent'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Smoker</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-pewter)', marginTop: '2px' }}>Elevated non-linear risk compounding</div>
                    </div>
                  </div>
                </div>

                {/* Indian City Tier / Healthcare Infrastructure */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
                    Residential City Tier & Healthcare Infrastructure
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'tier_1', label: 'Tier 1 Metro', desc: 'Mumbai, Delhi-NCR, Bengaluru, Chennai, Hyd, Kolkata' },
                      { id: 'tier_2', label: 'Tier 2 Major City', desc: 'Pune, Ahmedabad, Jaipur, Lucknow, Kochi, Indore' },
                      { id: 'tier_3', label: 'Tier 3 / District', desc: 'District Centers, Semi-Urban & Sub-District Towns' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCityTier(t.id)}
                        className={cityTier === t.id ? 'btn-outline' : 'btn-ghost'}
                        style={{
                          border: cityTier === t.id ? '1.5px solid var(--color-ink)' : '1px solid var(--color-mist)',
                          borderRadius: 'var(--radius-inputs)',
                          padding: '8px 6px',
                          textAlign: 'center',
                          backgroundColor: cityTier === t.id ? 'var(--color-paper)' : 'transparent'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)' }}>{t.label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-pewter)', marginTop: '2px' }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card: Inference Result Card */}
            <div className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="section-eyebrow" style={{ margin: 0 }}>PREDICTED ANNUAL EXPENDITURE (₹ INR)</span>
                <span className="tag-badge">RF_TUNED.PKL</span>
              </div>

              <div style={{ 
                fontSize: '44px', 
                fontWeight: 600, 
                color: 'var(--color-ink)', 
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                marginBottom: '8px'
              }}>
                {formatINR(predictedValueINR)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-pewter)', marginBottom: '24px' }}>
                Evaluated through 100 Scikit-learn estimator trees (Denominated in Indian Rupee).
              </div>

              {/* Attribution Breakdown */}
              <div style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-pewter)', marginBottom: '12px' }}>
                  Attribution & Risk Multipliers (₹ INR)
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-graphite)' }}>Smoker Compounding Surcharge</span>
                    <span style={{ color: smoker === 'yes' ? 'var(--color-ember)' : 'var(--color-ink)', fontWeight: 600 }}>
                      {smoker === 'yes' ? `+${formatINR(smokerSurchargeINR, 0)}` : '₹0'}
                    </span>
                  </div>

                  {healthIssue !== 'none' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-graphite)' }}>
                        Prior Health Condition Surcharge ({activeCondition.label.split('(')[0].trim()})
                      </span>
                      <span style={{ color: 'var(--color-ember)', fontWeight: 600 }}>
                        +{formatINR(healthIssueSurchargeINR, 0)}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-graphite)' }}>Non-Smoker Equivalent Baseline</span>
                    <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
                      {formatINR(nonSmokerBaselineINR)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-graphite)' }}>Adiposity Tier (BMI {bmi.toFixed(1)})</span>
                    <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
                      {bmi >= 30 ? 'Obese Class I+ (Elevated)' : bmi >= 25 ? 'Overweight' : 'Normal Range'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tobacco Delta Callout */}
              {smoker === 'yes' && (
                <div className="card-fog" style={{ padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    Smoking Cessation Sensitivity (₹ INR)
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.4 }}>
                    Eliminating tobacco reduces predicted annual expenditure by approximately <strong>{formatINR(smokerSurchargeINR, 0)} INR</strong>, confirming the ~3.8x disparity documented in literature.
                  </p>
                </div>
              )}

              {/* Single Primary Action: Ember Button */}
              <button 
                type="button" 
                className="btn-ember"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                onClick={() => alert(`Inference Output (Indian Rupee):\nPredicted Charge: ${formatINR(predictedValueINR)}\nPre-Existing Condition: ${activeCondition.label}\nCondition Surcharge: +${formatINR(healthIssueSurchargeINR)}\nNon-Smoker Baseline: ${formatINR(nonSmokerBaselineINR)}\nTobacco Surcharge: ${formatINR(smokerSurchargeINR)}`)}
              >
                Log calculation record
              </button>
            </div>
          </div>

          {/* IN-BETWEEN SECTION: Actuarial Insurance Plan Matching Engine */}
          <section id="plans" style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '48px', marginBottom: '64px' }}>
            <div className="section-heading-block" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div className="section-eyebrow" style={{ color: 'var(--color-ember)' }}>
                    ACTUARIAL POLICY MATCHING ENGINE
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                    Matched Insurance Policies
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-graphite)', maxWidth: '780px' }}>
                    Our trained multi-objective actuarial model evaluates your predicted annual medical expenditure ({formatINR(predictedValueINR)}), age ({age}y), tobacco risk, and pre-existing condition against leading IRDAI-regulated health insurers.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tag-badge active" style={{ backgroundColor: 'var(--color-ink)', color: '#ffffff' }}>
                    MODEL FIT: {insuranceMatchResult.bestPlan.fitScore}%
                  </span>
                  <span className="tag-badge">
                    {insuranceMatchResult.allPlans.length} PLANS EVALUATED
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Expenditure Scale Tier Tracker */}
            <div className="card-paper" style={{ padding: '20px 24px', marginBottom: '28px', border: '1px solid var(--color-mist)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tag-badge active" style={{ backgroundColor: 'var(--color-ember)', color: '#ffffff', fontWeight: 600 }}>
                    ACTIVE SCALE BRACKET
                  </span>
                  <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                    {insuranceMatchResult.scaleTierName}
                  </strong>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-graphite)' }}>
                  Inference Expenditure: <strong style={{ color: 'var(--color-ink)' }}>{formatINR(predictedValueINR)}</strong>
                </div>
              </div>

              {/* Multi-tier Scale Track */}
              <div style={{ position: 'relative', margin: '24px 0 12px' }}>
                {/* 5-Segment Track */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', height: '10px', borderRadius: '5px', overflow: 'hidden', backgroundColor: 'var(--color-fog)' }}>
                  <div style={{ backgroundColor: insuranceMatchResult.scaleTierId === 1 ? 'var(--color-ember)' : 'var(--color-mist)', opacity: insuranceMatchResult.scaleTierId >= 1 ? 1 : 0.4 }} />
                  <div style={{ backgroundColor: insuranceMatchResult.scaleTierId === 2 ? 'var(--color-ember)' : 'var(--color-mist)', opacity: insuranceMatchResult.scaleTierId >= 2 ? 1 : 0.4 }} />
                  <div style={{ backgroundColor: insuranceMatchResult.scaleTierId === 3 ? 'var(--color-ember)' : 'var(--color-mist)', opacity: insuranceMatchResult.scaleTierId >= 3 ? 1 : 0.4 }} />
                  <div style={{ backgroundColor: insuranceMatchResult.scaleTierId === 4 ? 'var(--color-ember)' : 'var(--color-mist)', opacity: insuranceMatchResult.scaleTierId >= 4 ? 1 : 0.4 }} />
                  <div style={{ backgroundColor: insuranceMatchResult.scaleTierId === 5 ? 'var(--color-ember)' : 'var(--color-mist)', opacity: insuranceMatchResult.scaleTierId >= 5 ? 1 : 0.4 }} />
                </div>

                {/* Pin indicator */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: `${insuranceMatchResult.scalePositionPct}%`,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'left 0.25s ease'
                }}>
                  <div style={{
                    backgroundColor: 'var(--color-ink)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatINR(predictedValueINR, 0)}
                  </div>
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid var(--color-ink)'
                  }} />
                </div>
              </div>

              {/* Tier Labels Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', fontSize: '11px', color: 'var(--color-graphite)', marginTop: '8px' }}>
                <div style={{ fontWeight: insuranceMatchResult.scaleTierId === 1 ? 700 : 500, color: insuranceMatchResult.scaleTierId === 1 ? 'var(--color-ember)' : 'var(--color-pewter)' }}>
                  Starter (&lt; ₹3.5L)<br />
                  <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Niva Bupa AgeLock</span>
                </div>
                <div style={{ fontWeight: insuranceMatchResult.scaleTierId === 2 ? 700 : 500, color: insuranceMatchResult.scaleTierId === 2 ? 'var(--color-ember)' : 'var(--color-pewter)' }}>
                  Moderate (₹3.5L-₹7.5L)<br />
                  <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Care Supreme / Star</span>
                </div>
                <div style={{ fontWeight: insuranceMatchResult.scaleTierId === 3 ? 700 : 500, color: insuranceMatchResult.scaleTierId === 3 ? 'var(--color-ember)' : 'var(--color-pewter)' }}>
                  Comprehensive (₹7.5L-₹13L)<br />
                  <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Tata AIG / Star Fam</span>
                </div>
                <div style={{ fontWeight: insuranceMatchResult.scaleTierId === 4 ? 700 : 500, color: insuranceMatchResult.scaleTierId === 4 ? 'var(--color-ember)' : 'var(--color-pewter)' }}>
                  High-Risk (₹13L-₹22L)<br />
                  <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>HDFC Optima 4X</span>
                </div>
                <div style={{ fontWeight: insuranceMatchResult.scaleTierId === 5 ? 700 : 500, color: insuranceMatchResult.scaleTierId === 5 ? 'var(--color-ember)' : 'var(--color-pewter)' }}>
                  Catastrophic (&gt; ₹22L)<br />
                  <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>ICICI Infinite / Cardiac</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-fog)', marginTop: '14px', paddingTop: '10px', fontSize: '12px', color: 'var(--color-graphite)' }}>
                <strong>Scale Dynamic Underwriting Insight: </strong>{insuranceMatchResult.scaleDescription}
              </div>
            </div>

            {/* Actuarial Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div className="card-paper" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-pewter)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Recommended Sum Insured
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {insuranceMatchResult.siTierLabel.split('(')[0].trim()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
                  Calibrated at &ge;1.5x predicted cost buffer
                </div>
              </div>

              <div className="card-paper" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-pewter)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Top Ranked Insurer
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ember)' }}>
                  {insuranceMatchResult.bestPlan.company}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
                  {insuranceMatchResult.bestPlan.planName}
                </div>
              </div>

              <div className="card-paper" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-pewter)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Estimated Fair Premium
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {formatINR(insuranceMatchResult.bestPlan.annualPremiumINR, 0)}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-steel)' }}> / yr</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
                  ~{formatINR(insuranceMatchResult.bestPlan.monthlyPremiumINR, 0)} / mo (indicative)
                </div>
              </div>

              <div className="card-paper" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-pewter)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Underwriting Clearance
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }}>
                  {insuranceMatchResult.bestPlan.pedWaiting}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
                  CSR: <strong>{insuranceMatchResult.bestPlan.csr}%</strong> &bull; {insuranceMatchResult.bestPlan.cashlessHospitals.toLocaleString('en-IN')}+ Hospitals
                </div>
              </div>
            </div>

            {/* Plan Comparison Cards Grid: Top 3 Actuarial Matches */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {insuranceMatchResult.topPlans.map((plan, idx) => {
                const isBest = idx === 0;

                return (
                  <div 
                    key={plan.id}
                    className="card-paper policy-card-interactive"
                    style={{
                      padding: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isBest ? '2px solid var(--color-ember)' : '1px solid var(--color-mist)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span 
                          className="tag-badge active"
                          style={{
                            backgroundColor: isBest ? 'var(--color-ember)' : 'var(--color-fog)',
                            color: isBest ? '#ffffff' : 'var(--color-ink)',
                            borderColor: isBest ? 'var(--color-ember)' : 'var(--color-mist)',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}
                        >
                          {isBest ? '#1 ACTUARIAL BEST FIT' : `RUNNER UP #${idx + 1}`}
                        </span>

                        <div style={{ fontSize: '13px', fontWeight: 700, color: isBest ? 'var(--color-ember)' : 'var(--color-ink)' }}>
                          {plan.fitScore}% Match
                        </div>
                      </div>

                      {/* Insurer & Plan Name */}
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {plan.company}
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px', marginBottom: '8px', lineHeight: 1.25 }}>
                        {plan.planName}
                      </h3>

                      {/* Premium & Sum Insured Box */}
                      <div style={{ backgroundColor: 'var(--color-fog)', padding: '14px', borderRadius: 'var(--radius-inputs)', margin: '14px 0 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-graphite)' }}>Recommended Cover:</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>
                            {plan.siTierLabel.split('(')[0].trim()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-graphite)' }}>Estimated Premium:</span>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: isBest ? 'var(--color-ember)' : 'var(--color-ink)' }}>
                            {formatINR(plan.annualPremiumINR, 0)}
                            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-steel)' }}> / yr</span>
                          </span>
                        </div>
                      </div>

                      {/* Match Justification */}
                      <div style={{ fontSize: '13px', lineHeight: 1.45, color: 'var(--color-ink)', marginBottom: '16px' }}>
                        <strong style={{ color: isBest ? 'var(--color-ember)' : 'var(--color-ink)' }}>Why it matches: </strong>
                        {plan.matchReason}
                      </div>

                      {/* Specs List */}
                      <div style={{ borderTop: '1px solid var(--color-fog)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-graphite)' }}>Pre-Existing Waiting:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-ink)', textAlign: 'right' }}>{plan.pedWaiting}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-graphite)' }}>Room Rent Limit:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-ink)', textAlign: 'right' }}>{plan.roomRent}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-graphite)' }}>Co-Payment:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{plan.copay}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-graphite)' }}>Claim Settlement (CSR):</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{plan.csr}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-graphite)' }}>Cashless Network:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{plan.cashlessHospitals.toLocaleString('en-IN')}+ Hospitals</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '16px', marginTop: '20px' }}>
                      <button
                        type="button"
                        className={isBest ? 'btn-ember' : 'btn-outline'}
                        style={{ width: '100%', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                        onClick={() => alert(`Policy Underwriting Details:\n\nCompany: ${plan.company}\nPlan: ${plan.planName}\nRecommended Sum Insured: ${plan.siTierLabel}\nEstimated Annual Premium: ${formatINR(plan.annualPremiumINR, 0)}\nWaiting Period: ${plan.pedWaiting}\nRoom Rent: ${plan.roomRent}\nCo-Pay: ${plan.copay}\nClaim Settlement Ratio: ${plan.csr}%\nNetwork Hospitals: ${plan.cashlessHospitals.toLocaleString('en-IN')}+\n\nKey Feature: ${plan.keyHighlight}`)}
                      >
                        {isBest ? 'Apply Matched Policy Terms' : 'View Policy Structure'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BELOW THE SCALE: Empanelled Hospital Recommendations Section */}
          <section id="hospitals" style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div className="section-eyebrow" style={{ color: 'var(--color-ember)' }}>
                  HOSPITAL HEALTH INSURANCE RECOGNITION
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  Accredited Partner Hospitals
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-graphite)', maxWidth: '640px' }}>
                  Accredited hospitals across India providing cashless pre-authorization, TPA desk clearance, and Ayushman Bharat PM-JAY coverage for your predicted healthcare expenses.
                </p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-pewter)' }}>Scheme:</span>
                <button
                  type="button"
                  className={selectedSchemeFilter === 'all' ? 'btn-outline' : 'btn-ghost'}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderColor: selectedSchemeFilter === 'all' ? 'var(--color-ink)' : 'transparent',
                    backgroundColor: selectedSchemeFilter === 'all' ? 'var(--color-paper)' : 'transparent'
                  }}
                  onClick={() => setSelectedSchemeFilter('all')}
                >
                  All ({HOSPITALS_DATABASE.length})
                </button>
                <button
                  type="button"
                  className={selectedSchemeFilter === 'tpa' ? 'btn-outline' : 'btn-ghost'}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderColor: selectedSchemeFilter === 'tpa' ? 'var(--color-ink)' : 'transparent',
                    backgroundColor: selectedSchemeFilter === 'tpa' ? 'var(--color-paper)' : 'transparent'
                  }}
                  onClick={() => setSelectedSchemeFilter('tpa')}
                >
                  Cashless TPA
                </button>
                <button
                  type="button"
                  className={selectedSchemeFilter === 'pmjay' ? 'btn-outline' : 'btn-ghost'}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderColor: selectedSchemeFilter === 'pmjay' ? 'var(--color-ink)' : 'transparent',
                    backgroundColor: selectedSchemeFilter === 'pmjay' ? 'var(--color-paper)' : 'transparent'
                  }}
                  onClick={() => setSelectedSchemeFilter('pmjay')}
                >
                  Ayushman Bharat PM-JAY
                </button>
              </div>
            </div>

            {/* Specialized Health Issue & Gender Hospital Recommendation Selector */}
            <div className="card-paper" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--color-mist)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div className="section-eyebrow" style={{ color: 'var(--color-ember)', margin: 0 }}>
                    CLINICAL CONDITION MATCHING ENGINE
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px' }}>
                    Find the Best Hospital for Any Health Issue (Men & Women)
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-graphite)', margin: '4px 0 0' }}>
                    Select Men's Health, Women's Health, or Universal conditions to reveal the verified #1 hospital in India with accredited Centers of Excellence.
                  </p>
                </div>

                {/* Gender Tabs */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--color-fog)', padding: '4px', borderRadius: 'var(--radius-inputs)' }}>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('all')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: genderFilter === 'all' ? 'var(--color-paper)' : 'transparent',
                      color: genderFilter === 'all' ? 'var(--color-ink)' : 'var(--color-graphite)'
                    }}
                  >
                    All Universal & Gender ({ALL_WORLD_HEALTH_ISSUES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('men')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: genderFilter === 'men' ? 'var(--color-paper)' : 'transparent',
                      color: genderFilter === 'men' ? 'var(--color-ink)' : 'var(--color-graphite)'
                    }}
                  >
                    Men's Health ({ALL_WORLD_HEALTH_ISSUES.filter(c => c.gender === 'men').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('women')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: genderFilter === 'women' ? 'var(--color-paper)' : 'transparent',
                      color: genderFilter === 'women' ? 'var(--color-ink)' : 'var(--color-graphite)'
                    }}
                  >
                    Women's Health ({ALL_WORLD_HEALTH_ISSUES.filter(c => c.gender === 'women').length})
                  </button>
                </div>
              </div>

              {/* Dropdown Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
                  Select Health Issue or Clinical Procedure:
                </label>
                <select
                  className="input-field"
                  value={selectedHospitalCondition}
                  onChange={(e) => setSelectedHospitalCondition(e.target.value)}
                  style={{
                    fontSize: '14px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    width: '100%',
                    borderColor: selectedHospitalCondition ? 'var(--color-ember)' : 'var(--color-mist)'
                  }}
                >
                  <option value="">-- Choose Any Health Issue to View the Best Hospital in India --</option>
                  {conditionGroups.map(group => (
                    <optgroup key={group.name} label={group.name}>
                      {group.items.map(issue => (
                        <option key={issue.id} value={issue.id}>
                          {issue.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Active Best Hospital Spotlight Card (shown when an issue is selected) */}
              {activeHospitalCondition && bestHospitalForCondition && (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: 'var(--radius-cards)',
                  border: '1.5px solid var(--color-ember)',
                  backgroundColor: 'var(--color-paper)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="tag-badge active" style={{ backgroundColor: 'var(--color-ember)', color: '#ffffff', fontWeight: 600 }}>
                        RANK #1 BEST HOSPITAL IN INDIA
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                        for {activeHospitalCondition.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedHospitalCondition('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-steel)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                        {bestHospitalForCondition.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-graphite)', marginBottom: '12px' }}>
                        <MapPin size={14} color="var(--color-steel)" />
                        <span>{bestHospitalForCondition.location}</span>
                        <span>&bull;</span>
                        <strong style={{ color: 'var(--color-ink)' }}>{bestHospitalForCondition.accreditation}</strong>
                      </div>

                      <div style={{ backgroundColor: 'var(--color-fog)', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.5, color: 'var(--color-ink)' }}>
                        <strong style={{ color: 'var(--color-ember)' }}>Clinical Justification: </strong>
                        {activeHospitalCondition.bestHospitalReason}
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid var(--color-fog)', paddingLeft: '20px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-pewter)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Cashless Turnaround & TPAs:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-graphite)', marginBottom: '10px' }}>
                        <Clock size={14} color="var(--color-ember)" />
                        <span>{bestHospitalForCondition.turnaround}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginBottom: '14px' }}>
                        TPA Helpline: <strong style={{ color: 'var(--color-ink)' }}>{bestHospitalForCondition.tpaContact}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn-ember"
                        style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                        onClick={() => alert(`Pre-authorization Facilitation:\nHospital: ${bestHospitalForCondition.name}\nSpecialty: ${activeHospitalCondition.name}\nTPA Helpline: ${bestHospitalForCondition.tpaContact}\nAccepted Insurers: ${bestHospitalForCondition.insurers.join(', ')}`)}
                      >
                        Facilitate Cashless Pre-Auth
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hospital Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
              {displayHospitals.map(hospital => {
                const isRankOneBest = activeHospitalCondition && hospital.id === activeHospitalCondition.bestHospitalId;
                const isAlternativeCenter = activeHospitalCondition && (activeHospitalCondition.alternativeHospitalIds || []).includes(hospital.id);

                const matchedSpecialties = (activeCondition.specialtyMatch || []).filter(spec => 
                  hospital.specialties.some(s => s.toLowerCase().includes(spec.toLowerCase()) || spec.toLowerCase().includes(s.toLowerCase()))
                );
                const isApexAllSpecialties = hospital.specialties.some(s => s.toLowerCase().includes('all specialties'));
                const hasScaleMatch = (matchedSpecialties.length > 0 || isApexAllSpecialties) && activeCondition.id !== 'none';

                return (
                  <div 
                    key={hospital.id} 
                    className="card-paper hospital-card-interactive" 
                    style={{ 
                      padding: '24px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      border: isRankOneBest 
                        ? '2px solid var(--color-ember)' 
                        : isAlternativeCenter
                          ? '1.5px solid var(--color-ink)'
                          : hasScaleMatch 
                            ? '1.5px solid var(--color-ember)' 
                            : '1px solid var(--color-mist)',
                      transition: 'border-color 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Priority Match Banner */}
                      {isRankOneBest && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--color-ember)',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#ffffff',
                          letterSpacing: '0.02em'
                        }}>
                          <Award size={13} strokeWidth={2.5} />
                          <span>RANK #1 RECOMMENDED CENTER FOR THIS ISSUE</span>
                        </div>
                      )}

                      {isAlternativeCenter && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--color-fog)',
                          border: '1px solid var(--color-mist)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--color-ink)'
                        }}>
                          <Check size={12} strokeWidth={2.5} />
                          <span>EMPANELLED ALTERNATIVE CENTER</span>
                        </div>
                      )}

                      {!activeHospitalCondition && hasScaleMatch && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(255, 89, 0, 0.06)',
                          border: '1px solid var(--color-ember)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--color-ember)'
                        }}>
                          <Check size={12} strokeWidth={2.5} />
                          <span>
                            {isApexAllSpecialties 
                              ? 'Apex Institute: All Specialties Empanelled' 
                              : `Recommended Specialty: ${matchedSpecialties.join(', ')}`}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.3 }}>
                            {hospital.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
                            <MapPin size={13} color="var(--color-steel)" />
                            <span>{hospital.location}</span>
                          </div>
                        </div>
                        <span className="tag-badge">
                          {hospital.tier}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--color-pewter)', marginBottom: '14px' }}>
                        {hospital.type} &bull; <strong style={{ color: 'var(--color-ink)' }}>{hospital.accreditation}</strong>
                      </div>

                      {/* Schemes Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {hospital.schemes.map(s => (
                          <span key={s} className="tag-badge active" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Empanelled Insurers List */}
                      <div style={{ borderTop: '1px solid var(--color-fog)', paddingTop: '12px', marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-pewter)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Empanelled Insurers & TPAs:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {hospital.insurers.map(ins => (
                            <span key={ins} style={{ 
                              fontSize: '11px', 
                              background: 'var(--color-fog)', 
                              color: 'var(--color-ink)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: 500
                            }}>
                              {ins}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Turnaround speed */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-graphite)', marginBottom: '12px' }}>
                        <Clock size={14} color="var(--color-ember)" />
                        <span>{hospital.turnaround}</span>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div style={{ borderTop: '1px solid var(--color-mist)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-graphite)' }}>
                        TPA Desk: <strong style={{ color: 'var(--color-ink)' }}>{hospital.tpaContact}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => alert(`${hospital.name}\nLocation: ${hospital.location}\nAccreditation: ${hospital.accreditation}\nTPA Desk: ${hospital.tpaContact}\nEmpanelled for: ${hospital.insurers.join(', ')}`)}
                      >
                        Insurance Details &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Floating Back to Top Button (Supaste Fluid Micro-interaction) */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`floating-back-to-top ${showBackToTop ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <ArrowUp size={13} strokeWidth={2.4} />
        <span>Top</span>
      </button>

      {/* Minimal Clean Abyss Footer */}
      <footer className="footer-abyss" style={{ padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-paper)', fontSize: '15px' }}>Insure</div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel)', marginTop: '2px' }}>
              Healthcare Expense Predictor, Matched Insurance Policies & Accredited Partner Hospitals. Denominated in Indian Rupee (₹ INR).
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-steel)' }}>
            &copy; 2024-2026 Insure. All hospital insurance empanelments subject to TPA verification.
          </div>
        </div>
      </footer>
    </div>
  );
}
