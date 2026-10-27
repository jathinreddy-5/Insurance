import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_project_architecture(output_png, output_svg=None):
    # High-resolution canvas: 26 x 15 inches
    fig = plt.figure(figsize=(26, 15), facecolor='#0B0F19')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor('#0B0F19')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color Palette
    CARD_BG = '#131B2E'
    INNER_BG = '#1A243B'
    BORDER_DEFAULT = '#263552'
    
    PRIMARY_ORANGE = '#FF6B00'   # SlaskMark / Project Accent
    APOLLO_BLUE = '#0284C7'      # The Apollo University Blue
    CYAN_ACCENT = '#38BDF8'      # Data & Model
    SUCCESS_GREEN = '#10B981'    # Best Model
    PURPLE_ACCENT = '#A855F7'    # Deployment & Web App
    YELLOW_ACCENT = '#FBBF24'    # EDA & Features
    
    TEXT_WHITE = '#FFFFFF'
    TEXT_MUTED = '#94A3B8'
    TEXT_SUBTLE = '#64748B'

    def draw_card(x, y, w, h, bg=CARD_BG, border=BORDER_DEFAULT, lw=1.5, radius=1.0):
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle=f"round,pad=0,rounding_size={radius}",
            linewidth=lw,
            edgecolor=border,
            facecolor=bg,
            zorder=2
        )
        ax.add_patch(rect)
        return rect

    def draw_badge(x, y, text, color, bg='#0F172A', font_size=7.5):
        bw = len(text) * 0.44 + 1.2
        bh = 1.35
        rect = patches.FancyBboxPatch(
            (x, y), bw, bh,
            boxstyle="round,pad=0,rounding_size=0.5",
            linewidth=1.0,
            edgecolor=color,
            facecolor=bg,
            zorder=4
        )
        ax.add_patch(rect)
        ax.text(x + bw/2, y + bh/2, text, color=color, fontsize=font_size, fontweight='bold',
                ha='center', va='center', zorder=5, family='sans-serif')
        return bw

    # ==============================================================
    # 1. TOP HEADER & INSTITUTIONAL / PROJECT PRESENTATION BANNER
    # ==============================================================
    draw_card(2.0, 89.0, 96.0, 9.8, bg='#0F172A', border='#1E293B', radius=1.2)

    # Left: Title & Subtitle
    ax.text(3.6, 96.2, "MEDICAL COST PREDICTION USING MACHINE LEARNING",
            color=PRIMARY_ORANGE, fontsize=18, fontweight='heavy', family='sans-serif', zorder=5)
    ax.text(3.6, 94.0, "INDIAN HEALTHCARE INPATIENT PIPELINE  |  DATA ANALYTICS INTERNSHIP  |  ARCHITECTURE BLUEPRINT",
            color=CYAN_ACCENT, fontsize=10.5, fontweight='bold', family='sans-serif', zorder=5)
    ax.text(3.6, 91.8, "School of Technology  •  Department of Computer Science & Engineering (AI & DS)  •  The Apollo University, Chittoor",
            color=TEXT_WHITE, fontsize=9.2, fontweight='medium', family='sans-serif', zorder=5)

    # Right: Supervisor & Students details card
    draw_card(58.5, 90.0, 38.5, 7.8, bg='#162032', border='#2A3D63', radius=0.8)
    
    # Guide Details
    ax.text(60.0, 96.0, "SUPERVISOR / GUIDE:", color=YELLOW_ACCENT, fontsize=8.0, fontweight='bold', zorder=5)
    ax.text(71.5, 96.0, "Mr. Ezhilarasan E", color=TEXT_WHITE, fontsize=8.5, fontweight='bold', zorder=5)
    ax.text(60.0, 94.5, "ORGANIZATION:", color=TEXT_MUTED, fontsize=7.5, fontweight='bold', zorder=5)
    ax.text(71.5, 94.5, "SlaskMark IT Solutions  &  The Apollo University", color=CYAN_ACCENT, fontsize=7.8, zorder=5)

    # Student Details
    ax.text(60.0, 92.8, "STUDENT TEAM:", color=YELLOW_ACCENT, fontsize=8.0, fontweight='bold', zorder=5)
    ax.text(71.5, 92.8, "Tejoram (122311520103)  •  Jathin Reddy (122311520105)", color=TEXT_WHITE, fontsize=7.8, fontweight='bold', zorder=5)
    ax.text(71.5, 91.2, "Pranay Kumar (122311520133)  |  B.Tech (AI & DS) - 3rd Year", color=TEXT_MUTED, fontsize=7.5, zorder=5)

    # ==============================================================
    # 2. FIVE ARCHITECTURAL PIPELINE COLUMNS
    # ==============================================================
    col_w = 18.0
    col_gap = 1.5
    start_x = 2.0
    
    col_xs = [start_x + i * (col_w + col_gap) for i in range(5)]
    col_y = 17.5
    col_h = 70.0

    col_headers = [
        ("STAGE 1: INDIAN DATA INGESTION", "NSS 75th, PM-JAY & IRDAI Data", "INPUT", CYAN_ACCENT),
        ("STAGE 2: PREPROCESSING & EDA", "City Tiers, Encoding & Skewness", "TRANSFORM", YELLOW_ACCENT),
        ("STAGE 3: MODEL TRAINING", "4 Regressors Trained in INR (₹)", "TRAIN", APOLLO_BLUE),
        ("STAGE 4: EVALUATION & TUNING", "Model Selection (Best: RF R²~0.83)", "EVALUATE", SUCCESS_GREEN),
        ("STAGE 5: REAL-TIME DEPLOYMENT", "Zero-Latency AST & Flask Engine", "SERVE", PURPLE_ACCENT)
    ]

    for i in range(5):
        cx = col_xs[i]
        draw_card(cx, col_y, col_w, col_h, bg='#0E1526', border='#1C283F', radius=1.0)
        
        # Column Header Box
        title, sub, badge, col_accent = col_headers[i]
        draw_card(cx + 0.6, col_y + col_h - 4.5, col_w - 1.2, 3.8, bg='#18233C', border=col_accent, lw=1.4, radius=0.7)
        ax.text(cx + 1.2, col_y + col_h - 2.0, title, color=TEXT_WHITE, fontsize=9.0, fontweight='bold', va='center')
        ax.text(cx + 1.2, col_y + col_h - 3.4, sub, color=TEXT_MUTED, fontsize=7.0, va='center')
        draw_badge(cx + col_w - 5.5, col_y + col_h - 2.7, badge, col_accent, bg='#0C1322', font_size=6.8)

    # -------------------------------------------------------------
    # COLUMN 1: INDIAN DATA INGESTION
    # -------------------------------------------------------------
    c1 = col_xs[0]
    
    # Box 1.1: Dataset Source & Properties
    draw_card(c1 + 0.8, 64.0, col_w - 1.6, 18.0, bg=CARD_BG, border='#23324C')
    ax.text(c1 + 1.5, 80.0, "INDIAN HEALTH DATA SOURCES", color=CYAN_ACCENT, fontsize=8.8, fontweight='bold')
    
    c1_meta = [
        ("MoSPI NSS 75th Round", "Schedule 25.0: Inpatient Health Expenditure"),
        ("Ayushman Bharat PM-JAY", "NHA surgical & tertiary package tariffs"),
        ("IRDAI Annual Reports", "Commercial claim benchmarks & CSR ratios"),
        ("Total Indian Records", "8,000 High-Fidelity Observations"),
        ("Dataset Format", "indian_insurance.csv / insurance.csv"),
        ("Currency Denomination", "100% Native Indian Rupee (₹ INR)")
    ]
    cur_y = 77.0
    for label, val in c1_meta:
        draw_card(c1 + 1.5, cur_y - 1.8, col_w - 3.0, 2.0, bg=INNER_BG, border='#273854', radius=0.4)
        ax.text(c1 + 2.0, cur_y - 0.8, f"{label}:", color=TEXT_MUTED, fontsize=6.8, fontweight='bold')
        ax.text(c1 + 6.8, cur_y - 0.8, val, color=TEXT_WHITE, fontsize=6.6)
        cur_y -= 2.4

    # Box 1.2: Feature Specifications
    draw_card(c1 + 0.8, 19.0, col_w - 1.6, 43.5, bg=CARD_BG, border='#23324C')
    ax.text(c1 + 1.5, 60.5, "INDIAN SCHEMA (7 ATTRIBUTES)", color=PRIMARY_ORANGE, fontsize=8.5, fontweight='bold')
    
    features = [
        ("age", "Numeric (Integer)", "18 - 75 years", "Geriatric cost gradient above 60"),
        ("sex", "Categorical", "female, male", "Demographic balance (0 / 1)"),
        ("bmi", "Numeric (Float)", "16.0 - 46.0 kg/m²", "Indian obesity thresholds (> 25, > 30)"),
        ("children", "Numeric (Integer)", "0 - 4 dependents", "Family dependency load"),
        ("smoker", "Categorical (Binary)", "no, yes", "Tobacco consumption surcharge"),
        ("city_tier", "Categorical (3 Tiers)", "tier_1, tier_2, tier_3", "Metros vs Major Cities vs Districts"),
        ("charges", "Target (Continuous)", "₹85,150 - ₹30,69,660", "Hospital Inpatient Charges (₹ INR)")
    ]
    cur_y = 57.5
    for f_name, f_type, f_range, f_desc in features:
        is_target = (f_name == 'charges')
        border_col = PRIMARY_ORANGE if is_target else (SUCCESS_GREEN if f_name == 'city_tier' else '#2C3D5E')
        bg_col = '#241610' if is_target else INNER_BG
        
        draw_card(c1 + 1.5, cur_y - 4.4, col_w - 3.0, 4.8, bg=bg_col, border=border_col, radius=0.5)
        badge_col = PRIMARY_ORANGE if is_target else CYAN_ACCENT
        ax.text(c1 + 2.0, cur_y - 1.0, f"• {f_name}", color=badge_col, fontsize=7.8, fontweight='bold')
        ax.text(c1 + 7.5, cur_y - 1.0, f"[{f_type}]", color=TEXT_MUTED, fontsize=6.5)
        ax.text(c1 + 2.0, cur_y - 2.2, f"Range: {f_range}", color=TEXT_WHITE, fontsize=6.6)
        ax.text(c1 + 2.0, cur_y - 3.4, f_desc, color=TEXT_MUTED, fontsize=6.3)
        cur_y -= 5.4

    # -------------------------------------------------------------
    # COLUMN 2: PREPROCESSING & EDA
    # -------------------------------------------------------------
    c2 = col_xs[1]

    draw_card(c2 + 0.8, 54.0, col_w - 1.6, 28.0, bg=CARD_BG, border='#23324C')
    ax.text(c2 + 1.5, 80.0, "INDIAN PREPROCESSING PIPELINE", color=YELLOW_ACCENT, fontsize=8.8, fontweight='bold')
    
    prep_steps = [
        ("1. Data Integrity Audit", "Audited 8,000 observations; verified zero missing\nvalues, negative values, or duplicate records."),
        ("2. City Tier Encoding", "Mapped residential healthcare infrastructure:\n• tier_1 (Metros: Mumbai, Delhi, Blr, Hyd, Chennai) = 0\n• tier_2 (Major Cities: Pune, Ahmedabad, Kochi) = 1\n• tier_3 (Semi-Urban & District Centers) = 2"),
        ("3. Binary Encoding", "sex: female=0, male=1; smoker: no=0, yes=1."),
        ("4. Train-Test Partition (80:20)", "6,400 samples Training (5-Fold Cross Validation)\n1,600 samples Unseen Testing (random_state=42)")
    ]
    cur_y = 77.0
    for title, desc in prep_steps:
        draw_card(c2 + 1.5, cur_y - 4.8, col_w - 3.0, 5.2, bg=INNER_BG, border='#2C3D5E', radius=0.5)
        ax.text(c2 + 2.0, cur_y - 0.8, title, color=YELLOW_ACCENT, fontsize=7.5, fontweight='bold')
        lines = desc.split('\n')
        for idx, line in enumerate(lines):
            ax.text(c2 + 2.0, cur_y - 1.8 - (idx * 0.9), line, color=TEXT_MUTED, fontsize=6.4)
        cur_y -= 5.7

    # Box 2.2: EDA & Statistical Correlations
    draw_card(c2 + 0.8, 19.0, col_w - 1.6, 33.5, bg=CARD_BG, border='#23324C')
    ax.text(c2 + 1.5, 50.5, "EXPLORATORY DATA ANALYSIS (EDA)", color=CYAN_ACCENT, fontsize=8.8, fontweight='bold')
    ax.text(c2 + 1.5, 49.0, "Calibrated on Indian Healthcare Economics", color=TEXT_SUBTLE, fontsize=6.8)

    eda_insights = [
        ("City Tier Hospital Tariff Variance", "Tier 1 metros exhibit +35% higher hospital overheads\ncompared to Tier 2 (1.05x) and Tier 3 (0.82x)\ndue to bed tariffs, ICU costs, and infrastructure."),
        ("Tobacco & Smoker Surcharge", "Tobacco consumption raises average inpatient bill from\n₹3.8 Lakhs (non-smoker) to ₹11.2 Lakhs (smoker)\ndue to cardiovascular & respiratory interventions."),
        ("Obesity × Smoker Compounding", "Obese individuals (BMI > 28) who smoke suffer\ncompounding multi-organ complications frequently\nexceeding ₹20 Lakhs in private tertiary care."),
        ("Statistical Correlation Matrix", "Smoker status and age are primary continuous drivers,\nmoderated strongly by residential infrastructure tier.")
    ]
    cur_y = 46.5
    for title, desc in eda_insights:
        draw_card(c2 + 1.5, cur_y - 5.5, col_w - 3.0, 6.0, bg='#16253B', border='#233B5E', radius=0.5)
        ax.text(c2 + 2.0, cur_y - 0.8, title, color=CYAN_ACCENT, fontsize=7.4, fontweight='bold')
        lines = desc.split('\n')
        for idx, line in enumerate(lines):
            ax.text(c2 + 2.0, cur_y - 1.8 - (idx * 0.9), line, color=TEXT_MUTED, fontsize=6.3)
        cur_y -= 6.6

    # -------------------------------------------------------------
    # COLUMN 3: MODEL TRAINING IN INR
    # -------------------------------------------------------------
    c3 = col_xs[2]

    draw_card(c3 + 0.8, 51.0, col_w - 1.6, 31.0, bg=CARD_BG, border='#23324C')
    ax.text(c3 + 1.5, 80.0, "4 REGRESSION MODELS (₹ INR)", color=APOLLO_BLUE, fontsize=8.8, fontweight='bold')
    ax.text(c3 + 1.5, 78.5, "Target: Inpatient Expenditure in Indian Rupees", color=TEXT_SUBTLE, fontsize=6.8)

    models_list = [
        ("1. Linear Regression (Baseline)", "Ordinary Least Squares fit on Indian records.\n• Fast linear baseline\n• Cannot capture smoker × BMI compounding\n• R² = 0.7521 | RMSE = ₹2,30,488"),
        ("2. Ridge Regression (L2)", "L2 regularization prevents overfitting.\n• Alpha hyperparameter tuned\n• Handles collinear biometric factors\n• R² = 0.7521 | RMSE = ₹2,30,491"),
        ("3. SVR (RBF Kernel)", "Non-linear kernel mapping to high dimensions.\n• Effective on non-linear margin bounds\n• Regularized support vectors\n• R² = 0.8040 | RMSE = ₹2,05,320"),
        ("4. Random Forest Regressor (BEST)", "Ensemble of 100 decorrelated Decision Trees.\n• Accurately models non-linear risk splits\n• R² = 0.8285 | RMSE = ₹1,91,714\n• Serialized as rf_tuned.pkl & model_trees.json")
    ]
    cur_y = 76.0
    for title, desc in models_list:
        is_best = "Random Forest" in title
        bcol = SUCCESS_GREEN if is_best else '#2C3D5E'
        bgcol = '#102E24' if is_best else INNER_BG
        tcol = SUCCESS_GREEN if is_best else APOLLO_BLUE
        
        draw_card(c3 + 1.5, cur_y - 5.5, col_w - 3.0, 6.0, bg=bgcol, border=bcol, radius=0.5)
        ax.text(c3 + 2.0, cur_y - 0.8, title, color=tcol, fontsize=7.4, fontweight='bold')
        lines = desc.split('\n')
        for idx, line in enumerate(lines):
            ax.text(c3 + 2.0, cur_y - 1.8 - (idx * 0.9), line, color=TEXT_MUTED, fontsize=6.2)
        cur_y -= 6.6

    # Box 3.2: Secondary Classifier & Regressor
    draw_card(c3 + 0.8, 19.0, col_w - 1.6, 30.5, bg=CARD_BG, border='#23324C')
    ax.text(c3 + 1.5, 47.5, "ACTUARIAL & PLAN MODELS", color=YELLOW_ACCENT, fontsize=8.8, fontweight='bold')
    ax.text(c3 + 1.5, 46.0, "Trained on 8,000 Indian Policyholder Profiles", color=TEXT_SUBTLE, fontsize=6.8)

    tuning_items = [
        ("8-Provider Plan Matcher Classifier", "Random Forest Classifier (100 trees, max_depth=12)\nMatches patient profile to HDFC, Care, Star, Niva, ICICI...\nTest Accuracy: 99.81% across 8 Indian insurers."),
        ("Annual Premium Regressor (INR)", "Gradient Boosting Regressor (100 trees, depth=5)\nPredicts actuarially fair annual policy premium in INR.\nTest R² Score: 0.9969 (Near-perfect calibration)."),
        ("AST Tree Export Architecture", "Exports 100 decision trees to src/model_trees.json;\nEnables in-browser inference without server overhead."),
        ("Serialized Artifacts", "• rf_tuned.pkl (Pickle format for Python/Flask)\n• src/insurance_plans_data.json (IRDAI Catalog)")
    ]
    cur_y = 43.5
    for title, desc in tuning_items:
        draw_card(c3 + 1.5, cur_y - 5.0, col_w - 3.0, 5.4, bg='#242017', border='#4A3B1B', radius=0.5)
        ax.text(c3 + 2.0, cur_y - 0.8, title, color=YELLOW_ACCENT, fontsize=7.2, fontweight='bold')
        lines = desc.split('\n')
        for idx, line in enumerate(lines):
            ax.text(c3 + 2.0, cur_y - 1.8 - (idx * 0.85), line, color=TEXT_MUTED, fontsize=6.2)
        cur_y -= 5.8

    # -------------------------------------------------------------
    # COLUMN 4: EVALUATION & RESULTS COMPARISON
    # -------------------------------------------------------------
    c4 = col_xs[3]

    # Box 4.1: Model Performance Table
    draw_card(c4 + 0.8, 51.5, col_w - 1.6, 30.5, bg=CARD_BG, border='#23324C')
    ax.text(c4 + 1.5, 80.0, "MODEL PERFORMANCE BENCHMARK", color=SUCCESS_GREEN, fontsize=8.8, fontweight='bold')
    ax.text(c4 + 1.5, 78.5, "Evaluation on Unseen 1,600 Indian Test Records", color=TEXT_SUBTLE, fontsize=6.8)

    models_perf = [
        ("Linear Regression", "0.752", "₹2,30,488", "₹1,84,120", '#94A3B8'),
        ("Ridge Regression", "0.752", "₹2,30,491", "₹1,84,135", '#94A3B8'),
        ("SVR (RBF Kernel)", "0.804", "₹2,05,320", "₹1,58,900", '#38BDF8'),
        ("Random Forest (BEST)", "0.829", "₹1,91,714", "₹1,46,508", SUCCESS_GREEN)
    ]
    
    # Table header
    draw_card(c4 + 1.5, 74.0, col_w - 3.0, 2.8, bg='#1F2C46', border='#334B75', radius=0.4)
    ax.text(c4 + 2.0, 75.4, "Model", color=TEXT_WHITE, fontsize=6.8, fontweight='bold')
    ax.text(c4 + 9.5, 75.4, "R² Score", color=TEXT_WHITE, fontsize=6.8, fontweight='bold')
    ax.text(c4 + 12.3, 75.4, "RMSE (INR)", color=TEXT_WHITE, fontsize=6.8, fontweight='bold')
    ax.text(c4 + 15.2, 75.4, "MAE", color=TEXT_WHITE, fontsize=6.8, fontweight='bold')

    cur_y = 70.5
    for m_name, r2, rmse, mae, col in models_perf:
        is_rf = "Random Forest" in m_name
        bgcol = '#102E24' if is_rf else INNER_BG
        bcol = SUCCESS_GREEN if is_rf else '#253754'
        
        draw_card(c4 + 1.5, cur_y - 2.8, col_w - 3.0, 3.2, bg=bgcol, border=bcol, radius=0.4)
        ax.text(c4 + 2.0, cur_y - 1.2, m_name, color=col, fontsize=6.8, fontweight='bold' if is_rf else 'normal')
        ax.text(c4 + 9.8, cur_y - 1.2, r2, color=col, fontsize=7.0, fontweight='bold')
        ax.text(c4 + 12.3, cur_y - 1.2, rmse, color=TEXT_WHITE, fontsize=6.4)
        ax.text(c4 + 15.2, cur_y - 1.2, mae, color=TEXT_WHITE, fontsize=6.4)
        cur_y -= 3.8

    ax.text(c4 + 2.0, 54.0, "★ Random Forest achieves lowest RMSE (₹1.91 Lakhs),", color=SUCCESS_GREEN, fontsize=7.2, fontweight='bold')
    ax.text(c4 + 2.0, 52.6, "capturing complex non-linear Indian healthcare risks.", color=TEXT_MUTED, fontsize=6.5)

    # Box 4.2: Feature Importance Breakdown
    draw_card(c4 + 0.8, 19.0, col_w - 1.6, 31.0, bg=CARD_BG, border='#23324C')
    ax.text(c4 + 1.5, 48.0, "FEATURE IMPORTANCE (INDIAN RF)", color=PRIMARY_ORANGE, fontsize=8.8, fontweight='bold')
    ax.text(c4 + 1.5, 46.5, "Contribution to Inpatient Medical Cost", color=TEXT_SUBTLE, fontsize=6.8)

    feat_imp = [
        ("Smoker / Tobacco Status", 54.5, PRIMARY_ORANGE),
        ("Age (Primary Life Gradient)", 22.1, CYAN_ACCENT),
        ("City Infrastructure Tier", 12.4, SUCCESS_GREEN),
        ("Body Mass Index (BMI)", 8.2, YELLOW_ACCENT),
        ("Children / Family Size", 2.1, '#94A3B8'),
        ("Sex (Biological Gender)", 0.7, '#64748B')
    ]
    cur_y = 43.5
    for fname, pct, fcolor in feat_imp:
        draw_card(c4 + 1.5, cur_y - 2.6, col_w - 3.0, 3.0, bg=INNER_BG, border='#253754', radius=0.4)
        ax.text(c4 + 2.0, cur_y - 0.7, fname, color=TEXT_WHITE, fontsize=6.8, fontweight='bold')
        ax.text(c4 + 13.8, cur_y - 0.7, f"{pct:.1f}%", color=fcolor, fontsize=7.0, fontweight='bold')
        
        # Progress Bar
        bar_bg = patches.Rectangle((c4 + 2.0, cur_y - 2.1), col_w - 4.0, 0.6, fc='#1F293D', ec='none', zorder=3)
        bar_fg = patches.Rectangle((c4 + 2.0, cur_y - 2.1), (col_w - 4.0) * (pct / 100.0), 0.6, fc=fcolor, ec='none', zorder=4)
        ax.add_patch(bar_bg)
        ax.add_patch(bar_fg)
        cur_y -= 3.6

    # -------------------------------------------------------------
    # COLUMN 5: DEPLOYMENT & REAL-TIME INFERENCE
    # -------------------------------------------------------------
    c5 = col_xs[4]

    draw_card(c5 + 0.8, 54.0, col_w - 1.6, 28.0, bg=CARD_BG, border='#23324C')
    ax.text(c5 + 1.5, 80.0, "WEB & EDGE DEPLOYMENT", color=PURPLE_ACCENT, fontsize=8.8, fontweight='bold')
    ax.text(c5 + 1.5, 78.5, "React 19 Frontend + Flask Microservice", color=TEXT_SUBTLE, fontsize=6.8)

    deploy_points = [
        ("Zero-Latency Edge AST Inference", "100 trees evaluated directly in client browser\nvia modelPredictor.js in < 2ms without API calls."),
        ("100% Native Indian Rupee UI", "All inputs, risk scales, smoker surcharges, and plan\npremiums displayed natively in ₹ Lakhs & Crores."),
        ("City Tier Selection Controls", "Allows policyholders to select Tier 1 Metro, Tier 2,\nor Tier 3 Semi-Urban infrastructure live."),
        ("IRDAI Plan & Hospital Matching", "Dynamically scores 8 IRDAI insurers and matches\nempanelled networks (Apollo, Manipal, Fortis, Max).")
    ]
    cur_y = 75.5
    for title, desc in deploy_points:
        draw_card(c5 + 1.5, cur_y - 4.5, col_w - 3.0, 5.0, bg='#241938', border='#422C63', radius=0.5)
        ax.text(c5 + 2.0, cur_y - 0.8, title, color=PURPLE_ACCENT, fontsize=7.4, fontweight='bold')
        lines = desc.split('\n')
        for idx, line in enumerate(lines):
            ax.text(c5 + 2.0, cur_y - 1.8 - (idx * 0.9), line, color=TEXT_MUTED, fontsize=6.2)
        cur_y -= 5.4

    # Box 5.2: Sample Live Prediction Case
    draw_card(c5 + 0.8, 19.0, col_w - 1.6, 33.5, bg=CARD_BG, border='#23324C')
    ax.text(c5 + 1.5, 50.5, "INDIAN VERIFICATION PROFILE", color=CYAN_ACCENT, fontsize=8.8, fontweight='bold')
    ax.text(c5 + 1.5, 49.0, "End-to-End Real Indian Patient Example", color=TEXT_SUBTLE, fontsize=6.8)

    draw_card(c5 + 1.5, 33.5, col_w - 3.0, 14.0, bg=INNER_BG, border='#2C4266', radius=0.6)
    ax.text(c5 + 2.0, 45.8, "POLICYHOLDER INPUTS:", color=YELLOW_ACCENT, fontsize=7.2, fontweight='bold')
    ax.text(c5 + 2.0, 44.0, "• Age: 45 years", color=TEXT_WHITE, fontsize=6.8)
    ax.text(c5 + 2.0, 42.4, "• Gender: Male (sex=1)", color=TEXT_WHITE, fontsize=6.8)
    ax.text(c5 + 2.0, 40.8, "• BMI: 30.0 kg/m² (Obese Grade 1)", color=TEXT_WHITE, fontsize=6.8)
    ax.text(c5 + 2.0, 39.2, "• Dependents: 2 children", color=TEXT_WHITE, fontsize=6.8)
    ax.text(c5 + 2.0, 37.6, "• Smoker: YES (Tobacco User)", color=PRIMARY_ORANGE, fontsize=7.0, fontweight='bold')
    ax.text(c5 + 2.0, 36.0, "• Location: Tier 1 Metro (Mumbai/Delhi)", color=TEXT_WHITE, fontsize=6.8)
    ax.text(c5 + 2.0, 34.4, "• Pre-Existing Condition: None", color=TEXT_MUTED, fontsize=6.5)

    # Prediction Output Box
    draw_card(c5 + 1.5, 20.0, col_w - 3.0, 12.0, bg='#102E24', border=SUCCESS_GREEN, lw=1.5, radius=0.6)
    ax.text(c5 + 2.0, 30.0, "INDIAN INPATIENT PREDICTION:", color=SUCCESS_GREEN, fontsize=7.5, fontweight='bold')
    ax.text(c5 + 2.0, 27.2, "EXPECTED HOSPITAL CHARGE:", color=TEXT_MUTED, fontsize=6.8)
    ax.text(c5 + 2.0, 24.5, "₹8,35,000 INR", color=TEXT_WHITE, fontsize=14.0, fontweight='heavy')
    ax.text(c5 + 2.0, 22.0, "Recommended Sum Insured: ₹25 Lakhs", color=CYAN_ACCENT, fontsize=6.5)
    ax.text(c5 + 2.0, 20.7, "Best Plan Match: Care Supreme (500% NCB)", color=TEXT_MUTED, fontsize=6.0)

    # ==============================================================
    # 3. INTER-STAGE FLOW ARROWS
    # ==============================================================
    arrow_props = dict(arrowstyle="->,head_width=0.45,head_length=0.7", color=CYAN_ACCENT, lw=2.4, zorder=10)
    for i in range(4):
        x_from = col_xs[i] + col_w
        x_to = col_xs[i+1]
        y_pos = 52.0
        ax.annotate("", xy=(x_to, y_pos), xytext=(x_from, y_pos), arrowprops=arrow_props)

    # ==============================================================
    # 4. BOTTOM COMPARISON BANNER
    # ==============================================================
    draw_card(2.0, 8.5, 96.0, 7.8, bg='#0E1626', border='#202E48', radius=0.8)
    
    # Left Box: Existing System
    draw_card(2.8, 9.2, 45.5, 6.4, bg='#241618', border='#5E2729', radius=0.6)
    ax.text(3.8, 14.2, "EXISTING SYSTEM (Manual Actuarial Tables & Static Grids)", color='#F87171', fontsize=8.2, fontweight='bold')
    ax.text(3.8, 12.8, "• Manual static age-band tables and historical insurer claims averages (Slow & prone to human bias)", color=TEXT_MUTED, fontsize=6.8)
    ax.text(3.8, 11.4, "• Low accuracy (~65%), fails to capture metro vs district cost differentials or obese smoker spikes", color=TEXT_MUTED, fontsize=6.8)
    ax.text(3.8, 10.0, "• Incapable of real-time underwriting or personalized hospital network matching for policyholders", color=TEXT_MUTED, fontsize=6.8)

    # Right Box: Proposed System
    draw_card(50.5, 9.2, 46.5, 6.4, bg='#0E2A1E', border='#165E3E', radius=0.6)
    ax.text(51.5, 14.2, "PROPOSED SYSTEM (Calibrated Indian ML Pipeline)", color=SUCCESS_GREEN, fontsize=8.2, fontweight='bold')
    ax.text(51.5, 12.8, "• 100% Data-Driven: Trained on 8,000 Indian records calibrated from NSS 75th, PM-JAY & IRDAI claims", color=TEXT_WHITE, fontsize=6.8)
    ax.text(51.5, 11.4, "• High Accuracy: Tuned Random Forest Regressor captures non-linear compounding and city tier impacts", color=SUCCESS_GREEN, fontsize=6.8, fontweight='bold')
    ax.text(51.5, 10.0, "• Zero-Latency Web UI: Executes AST inference directly in the browser (< 2ms) with native INR outputs", color=TEXT_WHITE, fontsize=6.8)

    # ==============================================================
    # 5. FOOTER: TECHNOLOGIES USED & CITATIONS
    # ==============================================================
    draw_card(2.0, 1.2, 96.0, 6.2, bg='#0A0F1D', border='#1A243B', radius=0.8)
    ax.text(3.6, 5.4, "INDIAN DATA BENCHMARKS:", color=YELLOW_ACCENT, fontsize=8.0, fontweight='bold')
    ax.text(21.0, 5.4, "MoSPI NSS 75th Round (Schedule 25.0)  •  Ayushman Bharat PM-JAY (NHA)  •  IRDAI Annual Commercial Claim Reports  •  Scikit-Learn  •  React 19",
            color=TEXT_WHITE, fontsize=7.8)

    ax.text(3.6, 3.4, "CORE PROJECT OUTCOME:", color=PRIMARY_ORANGE, fontsize=8.0, fontweight='bold')
    ax.text(19.0, 3.4, "End-to-end Indian healthcare inpatient cost prediction and multi-objective insurance recommender with zero-latency browser execution.",
            color=CYAN_ACCENT, fontsize=7.8, fontweight='medium')

    ax.text(3.6, 1.8, "The Apollo University  •  Department of CSE (AI & DS)  •  SlaskMark IT Solutions  •  Review Presentation 2026",
            color=TEXT_SUBTLE, fontsize=6.8)

    # Save outputs
    print(f"Generating updated project architecture at {output_png}...")
    plt.savefig(output_png, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    if output_svg:
        print(f"Generating updated SVG diagram at {output_svg}...")
        plt.savefig(output_svg, format='svg', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print("Updated Indian architecture diagram generation completed successfully!")

if __name__ == '__main__':
    png_path = '/Users/jathinreddy/Desktop/Insurance/project_architecture.png'
    svg_path = '/Users/jathinreddy/Desktop/Insurance/project_architecture.svg'
    create_project_architecture(png_path, svg_path)
