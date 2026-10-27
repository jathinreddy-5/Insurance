import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_bw_architecture(output_png, output_svg=None):
    # 16:9 Slide Ratio (20 x 11.25 inches) @ 300 DPI
    fig = plt.figure(figsize=(20, 11.25), facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Pure Black & White / Grayscale Palette
    COLOR_BLACK = '#000000'
    COLOR_DARK = '#1F2937'
    COLOR_BORDER = '#111827'
    COLOR_LIGHT_GRAY = '#F3F4F6'
    COLOR_WHITE = '#FFFFFF'
    COLOR_MUTED = '#4B5563'

    def draw_box(x, y, w, h, bg=COLOR_WHITE, border=COLOR_BORDER, lw=1.5, radius=0.6):
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

    # ==============================================================
    # 1. HEADER (Simple Black & White Text)
    # ==============================================================
    draw_box(4.0, 87.5, 92.0, 9.5, bg=COLOR_LIGHT_GRAY, border=COLOR_BLACK, lw=1.8, radius=0.5)
    
    ax.text(6.0, 93.8, "SYSTEM ARCHITECTURE PIPELINE",
            color=COLOR_BLACK, fontsize=18, fontweight='bold', family='sans-serif', zorder=5)
    ax.text(6.0, 90.0, "Medical Cost Prediction Using Machine Learning (Indian Healthcare Architecture)",
            color=COLOR_MUTED, fontsize=11.5, family='sans-serif', zorder=5)
    
    ax.text(93.5, 93.5, "The Apollo University  •  SlaskMark IT Solutions",
            color=COLOR_BLACK, fontsize=9.5, fontweight='bold', ha='right', family='sans-serif', zorder=5)
    ax.text(93.5, 90.0, "Guide: Ezhilarasan E  |  B.Tech (AI & DS) 3rd Year",
            color=COLOR_MUTED, fontsize=9.0, ha='right', family='sans-serif', zorder=5)

    # ==============================================================
    # 2. FOUR CLEAN LINEAR STAGES (Left to Right)
    # ==============================================================
    col_w = 20.5
    gap = 3.3
    start_x = 4.0
    col_y = 22.0
    col_h = 61.0

    stages = [
        {
            "num": "STEP 1",
            "title": "Data Collection",
            "points": [
                ("Dataset", "indian_insurance.csv (8,000 Records)"),
                ("Sources", "• MoSPI NSS 75th Round (Health)\n• Ayushman Bharat PM-JAY Tariffs\n• IRDAI Annual Claims Reports"),
                ("Input Features", "Age, Sex, BMI, Children,\nSmoker Status, City Tier"),
                ("Target Variable", "Hospital Inpatient Charges (₹ INR)\n(Range: ₹85,150 – ₹30,69,660)")
            ]
        },
        {
            "num": "STEP 2",
            "title": "Preprocessing & EDA",
            "points": [
                ("Data Quality", "Verified 0 missing / null values\n(100% clean complete dataset)"),
                ("Feature Encoding", "• sex: Female=0, Male=1\n• smoker: No=0, Yes=1\n• city_tier: Metro=0, Tier 2=1, Tier 3=2"),
                ("EDA Insights", "• Smokers pay ~3x higher charges\n• Metros carry +35% higher tariffs\n• Non-linear obese smoker risk"),
                ("Train-Test Split", "80% Training Data (6,400 rows)\n20% Testing Data (1,600 rows)")
            ]
        },
        {
            "num": "STEP 3",
            "title": "Model Training & Tuning",
            "points": [
                ("4 Models Evaluated", "1. Linear Regression (Baseline)\n2. Ridge Regression (L2 Penalty)\n3. SVR (RBF Kernel)\n4. Random Forest Regressor"),
                ("Hyperparameter Tuning", "GridSearchCV (5-Fold CV)\n(n_estimators=100, max_depth=12)"),
                ("Best Model (Selected)", "Random Forest Regressor\n• R² Score ≈ 0.83 (Lowest RMSE)\n• Captures non-linear risk splits"),
                ("Model Serialization", "Saved model as rf_tuned.pkl &\nExported trees to model_trees.json")
            ]
        },
        {
            "num": "STEP 4",
            "title": "Deployment & Output",
            "points": [
                ("Web Deployment", "React 19 Frontend + Flask API\nZero-latency in-browser AST engine"),
                ("Real-Time Prediction", "Accepts patient inputs -> Predicts\nexpected hospital cost in < 2ms"),
                ("IRDAI Plan Matcher", "Recommends Best Fit Policy from:\nHDFC, Care, Star, Niva, ICICI, Tata AIG"),
                ("Hospital Network", "Matches patient condition to Apollo,\nManipal, Fortis, Max & AIIMS")
            ]
        }
    ]

    for i, stage in enumerate(stages):
        cx = start_x + i * (col_w + gap)

        # Main Column Outer Box
        draw_box(cx, col_y, col_w, col_h, bg=COLOR_WHITE, border=COLOR_BLACK, lw=1.5, radius=0.6)

        # Column Header (Light Gray Box)
        draw_box(cx, col_y + col_h - 9.0, col_w, 9.0, bg=COLOR_LIGHT_GRAY, border=COLOR_BLACK, lw=1.5, radius=0.6)
        
        # Step Label & Title
        ax.text(cx + col_w/2, col_y + col_h - 3.8, stage["num"], color=COLOR_MUTED, fontsize=9.0, fontweight='bold', ha='center', family='sans-serif')
        ax.text(cx + col_w/2, col_y + col_h - 6.8, stage["title"], color=COLOR_BLACK, fontsize=11.5, fontweight='bold', ha='center', family='sans-serif')

        # Sub-Boxes Inside
        card_y = col_y + col_h - 11.5
        box_h = 11.0
        box_gap = 1.3

        for heading, body in stage["points"]:
            is_best = "Best Model" in heading
            box_bg = COLOR_LIGHT_GRAY if is_best else COLOR_WHITE
            
            draw_box(cx + 0.9, card_y - box_h, col_w - 1.8, box_h, bg=box_bg, border=COLOR_BLACK if is_best else '#9CA3AF', lw=1.2 if is_best else 0.9, radius=0.4)
            
            # Heading
            ax.text(cx + 1.8, card_y - 2.4, heading, color=COLOR_BLACK, fontsize=8.2, fontweight='bold', family='sans-serif')
            
            # Body lines
            lines = body.split('\n')
            for line_idx, line in enumerate(lines):
                ax.text(cx + 1.8, card_y - 4.5 - (line_idx * 1.85), line, color=COLOR_DARK, fontsize=7.4, family='sans-serif')
            
            card_y -= (box_h + box_gap)

    # ==============================================================
    # 3. CLEAN DIRECT ARROWS BETWEEN COLUMNS (Simple Black Arrows)
    # ==============================================================
    arrow_style = dict(arrowstyle="->,head_width=0.5,head_length=0.8", color=COLOR_BLACK, lw=2.4, zorder=10)
    for i in range(3):
        x1 = start_x + (i * (col_w + gap)) + col_w
        x2 = start_x + ((i + 1) * (col_w + gap))
        y_center = col_y + (col_h / 2.0)
        ax.annotate("", xy=(x2, y_center), xytext=(x1, y_center), arrowprops=arrow_style)

    # ==============================================================
    # 4. BOTTOM SIMPLE 1-LINE EXPLANATION BANNER
    # ==============================================================
    draw_box(4.0, 4.0, 92.0, 14.5, bg=COLOR_LIGHT_GRAY, border=COLOR_BLACK, lw=1.5, radius=0.6)
    
    ax.text(6.0, 14.5, "EASY 30-SECOND VIVA EXPLANATION:", color=COLOR_BLACK, fontsize=9.5, fontweight='bold', family='sans-serif')
    
    explanation = [
        ("Step 1 (Data):", "8,000 Indian records calibrated from official MoSPI NSS 75th Round and PM-JAY hospital tariffs in INR (₹)."),
        ("Step 2 (Preprocess):", "Dataset cleaned (0 nulls), categorical features encoded, and locations mapped into 3 City Tiers (Metro, Tier 2, Tier 3)."),
        ("Step 3 (Train & Tune):", "Trained 4 regression models with 5-fold cross validation; Random Forest selected as best model (R² ≈ 0.83)."),
        ("Step 4 (Deploy):", "Model serialized to rf_tuned.pkl and deployed in a React 19 web app for real-time cost prediction and IRDAI plan matching.")
    ]
    
    exp_y = 11.8
    for label, text in explanation:
        ax.text(6.0, exp_y, label, color=COLOR_BLACK, fontsize=8.2, fontweight='bold', family='sans-serif')
        ax.text(18.5, exp_y, text, color=COLOR_DARK, fontsize=8.0, family='sans-serif')
        exp_y -= 2.4

    # Save outputs
    print(f"Generating clean B&W architecture at {output_png}...")
    plt.savefig(output_png, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    if output_svg:
        print(f"Generating clean B&W SVG at {output_svg}...")
        plt.savefig(output_svg, format='svg', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print("Clean B&W architecture diagram generated successfully!")

if __name__ == '__main__':
    png_path = '/Users/jathinreddy/Desktop/Insurance/bw_architecture.png'
    svg_path = '/Users/jathinreddy/Desktop/Insurance/bw_architecture.svg'
    create_bw_architecture(png_path, svg_path)
