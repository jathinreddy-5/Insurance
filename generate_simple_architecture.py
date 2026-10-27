import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_simple_architecture(output_png, output_svg=None):
    # 16:9 Slide Aspect Ratio (20 x 11.25 inches) @ 300 DPI -> 6000 x 3375 px
    fig = plt.figure(figsize=(20, 11.25), facecolor='#0F172A')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor('#0F172A')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color Palette: Modern, clean, and distinct
    BG_CARD = '#1E293B'
    BG_INNER = '#0F172A'
    TEXT_WHITE = '#FFFFFF'
    TEXT_SLATE = '#94A3B8'
    TEXT_MUTED = '#64748B'

    COLOR_BLUE = '#38BDF8'      # Stage 1: Data
    COLOR_YELLOW = '#FBBF24'    # Stage 2: Preprocessing
    COLOR_GREEN = '#10B981'     # Stage 3: ML Model
    COLOR_PURPLE = '#A855F7'    # Stage 4: Deployment
    COLOR_ORANGE = '#FF6B00'    # Accent

    def draw_rounded_card(x, y, w, h, bg=BG_CARD, border='#334155', lw=1.5, radius=1.2):
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

    def draw_badge(x, y, text, color, bg='#0B1120'):
        bw = len(text) * 0.52 + 1.6
        bh = 2.0
        rect = patches.FancyBboxPatch(
            (x, y), bw, bh,
            boxstyle="round,pad=0,rounding_size=0.6",
            linewidth=1.2,
            edgecolor=color,
            facecolor=bg,
            zorder=4
        )
        ax.add_patch(rect)
        ax.text(x + bw/2, y + bh/2, text, color=color, fontsize=9.0, fontweight='heavy',
                ha='center', va='center', zorder=5, family='sans-serif')
        return bw

    # ==============================================================
    # 1. TOP TITLE HEADER (Simple, Clean, Slide-Friendly)
    # ==============================================================
    draw_rounded_card(3.0, 86.5, 94.0, 10.5, bg='#1E293B', border='#334155', radius=1.0)
    
    ax.text(5.0, 93.5, "SYSTEM ARCHITECTURE PIPELINE",
            color=COLOR_ORANGE, fontsize=19, fontweight='heavy', family='sans-serif', zorder=5)
    ax.text(5.0, 89.8, "Medical Cost Prediction & Health Insurance Matching System (Indian Healthcare)",
            color=TEXT_WHITE, fontsize=12.0, fontweight='medium', family='sans-serif', zorder=5)
    
    # Right Header Info
    ax.text(94.5, 93.2, "The Apollo University  •  SlaskMark IT Solutions",
            color=COLOR_BLUE, fontsize=9.5, fontweight='bold', ha='right', family='sans-serif', zorder=5)
    ax.text(94.5, 89.8, "Guide: Ezhilarasan E  |  B.Tech (AI & DS) 3rd Year",
            color=TEXT_SLATE, fontsize=9.0, ha='right', family='sans-serif', zorder=5)

    # ==============================================================
    # 2. FOUR CLEAN HORIZONTAL PIPELINE STAGES
    # ==============================================================
    col_w = 21.0
    gap = 2.8
    start_x = 3.0
    col_y = 23.0
    col_h = 58.5

    stages = [
        {
            "num": "STAGE 1",
            "title": "DATA COLLECTION",
            "subtitle": "Indian Health Records",
            "color": COLOR_BLUE,
            "badge": "INPUT",
            "icon": "📥",
            "items": [
                ("Dataset File", "indian_insurance.csv (8,000 Rows)"),
                ("Official Sources", "MoSPI NSS 75th Round (Health)\nAB PM-JAY Hospital Tariffs\nIRDAI Commercial Claim Reports"),
                ("Key Features (6)", "• Age (18–75) & Sex (M/F)\n• BMI (16–46 kg/m²)\n• Children (0–4 Dependents)\n• Smoker (Tobacco Consumer)\n• City Tier (Infrastructure)"),
                ("Target Variable", "Hospital Charges in INR (₹)\n(₹85,150 to ₹30,69,660)")
            ]
        },
        {
            "num": "STAGE 2",
            "title": "PREPROCESSING & EDA",
            "subtitle": "Cleaning & Analysis",
            "color": COLOR_YELLOW,
            "badge": "PREPARE",
            "icon": "⚙️",
            "items": [
                ("Data Quality Check", "0 Null / Missing Values\n100% Complete & Clean Data"),
                ("Feature Encoding", "• sex: Female=0, Male=1\n• smoker: No=0, Yes=1\n• city_tier: Metro=0, Tier 2=1, Tier 3=2"),
                ("Key EDA Findings", "• Smokers pay ~3x higher bills\n• Metros carry +35% higher tariffs\n• Obese smokers face extreme risk"),
                ("Train-Test Split", "80% Training Data (6,400 rows)\n20% Testing Data (1,600 rows)")
            ]
        },
        {
            "num": "STAGE 3",
            "title": "MODEL TRAINING",
            "subtitle": "Machine Learning Core",
            "color": COLOR_GREEN,
            "badge": "TRAIN",
            "icon": "🧠",
            "items": [
                ("4 Models Evaluated", "1. Linear Regression (OLS)\n2. Ridge Regression (L2 Penalty)\n3. SVR (RBF Kernel)\n4. Random Forest Regressor"),
                ("Hyperparameter Tuning", "GridSearchCV 5-Fold Cross Validation\n(n_estimators=100, max_depth=12)"),
                ("Best Model (WINNER)", "Random Forest Regressor\n★ R² Score ≈ 0.83 (83% Accuracy)\n★ Lowest RMSE = ₹1.91 Lakhs"),
                ("Model Serialization", "Saved as rf_tuned.pkl &\nExported trees to model_trees.json")
            ]
        },
        {
            "num": "STAGE 4",
            "title": "DEPLOYMENT & OUTPUT",
            "subtitle": "Real-Time Web Application",
            "color": COLOR_PURPLE,
            "badge": "DEPLOY",
            "icon": "🚀",
            "items": [
                ("Web Interface", "React 19 Frontend + Flask API\nZero-latency in-browser AST engine"),
                ("Real-Time Prediction", "Input patient details -> Returns\nestimated hospital cost in < 2ms"),
                ("IRDAI Plan Matcher", "Recommends Best Fit Policy from:\nHDFC, Care, Star, Niva, ICICI, Tata AIG"),
                ("Hospital Network", "Matches patient condition to Apollo,\nManipal, Fortis, Max & AIIMS")
            ]
        }
    ]

    for i, stage in enumerate(stages):
        cx = start_x + i * (col_w + gap)
        accent = stage["color"]

        # Outer Column Card
        draw_rounded_card(cx, col_y, col_w, col_h, bg=BG_CARD, border='#334155', radius=1.0)

        # Stage Header Box
        draw_rounded_card(cx + 0.8, col_y + col_h - 9.5, col_w - 1.6, 8.5, bg='#0F172A', border=accent, lw=1.5, radius=0.8)
        
        # Stage Number Pill
        draw_badge(cx + 1.8, col_y + col_h - 4.5, stage["num"], accent, bg='#1E293B')
        draw_badge(cx + col_w - 7.5, col_y + col_h - 4.5, stage["badge"], accent, bg='#1E293B')
        
        # Stage Title & Subtitle
        ax.text(cx + 1.8, col_y + col_h - 6.6, stage["title"], color=TEXT_WHITE, fontsize=10.2, fontweight='heavy', family='sans-serif')
        ax.text(cx + 1.8, col_y + col_h - 8.3, stage["subtitle"], color=TEXT_SLATE, fontsize=8.2, family='sans-serif')

        # Inside Content Cards (4 Clean Sub-Boxes)
        card_y = col_y + col_h - 11.5
        box_h = 10.5
        box_gap = 1.2

        for heading, body in stage["items"]:
            # Card highlight if best model
            is_best = "WINNER" in body or "rf_tuned.pkl" in body
            card_border = COLOR_GREEN if is_best else '#28354D'
            card_bg = '#132822' if is_best else BG_INNER

            draw_rounded_card(cx + 0.8, card_y - box_h, col_w - 1.6, box_h, bg=card_bg, border=card_border, lw=1.0, radius=0.6)
            
            # Card Heading
            ax.text(cx + 1.6, card_y - 2.0, heading, color=accent, fontsize=8.2, fontweight='bold', family='sans-serif')
            
            # Card Body Text
            lines = body.split('\n')
            for line_idx, line in enumerate(lines):
                text_col = TEXT_WHITE if is_best else (TEXT_WHITE if line.startswith('★') or line.startswith('1.') or line.startswith('4.') else TEXT_SLATE)
                font_weight = 'bold' if is_best or line.startswith('★') else 'normal'
                ax.text(cx + 1.6, card_y - 3.8 - (line_idx * 1.55), line, color=text_col, fontsize=7.2, fontweight=font_weight, family='sans-serif')
            
            card_y -= (box_h + box_gap)

    # ==============================================================
    # 3. DIRECT STRAIGHT CONNECTOR ARROWS (No weird loops!)
    # ==============================================================
    arrow_style = dict(arrowstyle="->,head_width=0.6,head_length=0.9", color='#38BDF8', lw=3.0, zorder=10)
    for i in range(3):
        x1 = start_x + (i * (col_w + gap)) + col_w
        x2 = start_x + ((i + 1) * (col_w + gap))
        y_center = col_y + (col_h / 2.0)
        ax.annotate("", xy=(x2, y_center), xytext=(x1, y_center), arrowprops=arrow_style)

    # ==============================================================
    # 4. BOTTOM BANNER: "HOW TO EXPLAIN IN 30 SECONDS"
    # ==============================================================
    draw_rounded_card(3.0, 3.5, 94.0, 16.5, bg='#0D1526', border='#1E3A5F', lw=1.5, radius=1.0)
    
    # Left Pill Title
    draw_badge(5.0, 15.5, "EASY 30-SECOND VIVA EXPLANATION", COLOR_ORANGE, bg='#1F1815')
    
    explanation_steps = [
        ("Step 1 (Data):", "We collected 8,000 Indian healthcare records calibrated from official MoSPI NSS 75th Round and PM-JAY tariff benchmarks in INR (₹)."),
        ("Step 2 (Preprocess):", "We cleaned the data (0 nulls), encoded categorical features, and classified geographic locations into 3 Indian City Tiers (Metro, Tier 2, Tier 3)."),
        ("Step 3 (Train & Tune):", "We trained 4 regression models with GridSearchCV; the Random Forest Regressor emerged as the best model with R² ≈ 0.83 (lowest RMSE)."),
        ("Step 4 (Deploy):", "We saved the model as rf_tuned.pkl and deployed a real-time React 19 web application that predicts hospital costs and recommends IRDAI insurance plans.")
    ]
    
    exp_y = 13.0
    for prefix, sentence in explanation_steps:
        ax.text(5.0, exp_y, prefix, color=COLOR_BLUE, fontsize=8.5, fontweight='bold', family='sans-serif')
        ax.text(18.5, exp_y, sentence, color=TEXT_WHITE, fontsize=8.2, family='sans-serif')
        exp_y -= 2.6

    # Save outputs
    print(f"Generating clean simple architecture at {output_png}...")
    plt.savefig(output_png, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    if output_svg:
        print(f"Generating clean simple SVG at {output_svg}...")
        plt.savefig(output_svg, format='svg', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print("Simple architecture diagram generated successfully!")

if __name__ == '__main__':
    png_path = '/Users/jathinreddy/Desktop/Insurance/simple_architecture.png'
    svg_path = '/Users/jathinreddy/Desktop/Insurance/simple_architecture.svg'
    create_simple_architecture(png_path, svg_path)
