import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_mindmap(output_png, output_svg=None):
    fig = plt.figure(figsize=(20, 11.25), facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Minimalist Black & White Palette
    COLOR_BLACK = '#000000'
    COLOR_DARK = '#1F2937'
    COLOR_LIGHT_GRAY = '#F3F4F6'
    COLOR_WHITE = '#FFFFFF'
    COLOR_BORDER = '#111827'

    def draw_rounded_node(x, y, w, h, text, is_center=False, is_sub=False):
        bg = COLOR_LIGHT_GRAY if is_center else (COLOR_LIGHT_GRAY if not is_sub else COLOR_WHITE)
        lw = 2.0 if is_center else (1.4 if not is_sub else 1.0)
        
        rect = patches.FancyBboxPatch(
            (x - w/2, y - h/2), w, h,
            boxstyle="round,pad=0,rounding_size=0.6" if not is_center else "round,pad=0,rounding_size=1.0",
            linewidth=lw,
            edgecolor=COLOR_BORDER,
            facecolor=bg,
            zorder=3
        )
        ax.add_patch(rect)
        
        fontsize = 12.0 if is_center else (9.5 if not is_sub else 8.0)
        fontweight = 'bold' if not is_sub else 'normal'
        
        lines = text.split('\n')
        line_spacing = 2.2 if is_center else 1.8
        start_y = y + ((len(lines) - 1) * line_spacing / 2.0)
        
        for idx, line in enumerate(lines):
            weight = 'bold' if (fontweight == 'bold' or '★' in line or 'BEST' in line) else 'normal'
            ax.text(x, start_y - (idx * line_spacing), line, color=COLOR_BLACK,
                    fontsize=fontsize, fontweight=weight, ha='center', va='center',
                    family='sans-serif', zorder=4)

    def draw_curve(x1, y1, x2, y2, lw=1.5):
        # Draw clean organic connecting curve
        path_data = [
            (patches.Path.MOVETO, (x1, y1)),
            (patches.Path.CURVE4, ((x1 + x2)/2, y1)),
            (patches.Path.CURVE4, ((x1 + x2)/2, y2)),
            (patches.Path.CURVE4, (x2, y2)),
        ]
        codes, verts = zip(*path_data)
        path = patches.Path(verts, codes)
        patch = patches.PathPatch(path, facecolor='none', edgecolor=COLOR_BORDER, lw=lw, zorder=2)
        ax.add_patch(patch)

    # ==============================================================
    # 1. CENTRAL ROOT NODE
    # ==============================================================
    center_x, center_y = 50.0, 50.0
    draw_rounded_node(center_x, center_y, 22.0, 9.0, "MEDICAL COST\nPREDICTION SYSTEM\n(Machine Learning in INR ₹)", is_center=True)

    # ==============================================================
    # 2. FIVE MAIN BRANCHES & SUB-NODES
    # ==============================================================
    # LEFT TOP: 1. DATA SOURCES
    b1_x, b1_y = 24.0, 80.0
    draw_curve(center_x - 11.0, center_y + 2.5, b1_x + 8.5, b1_y, lw=2.0)
    draw_rounded_node(b1_x, b1_y, 17.0, 5.0, "1. DATA COLLECTION\n(Indian Benchmarks)", is_sub=False)
    
    sub1_items = [
        ("8,000 Indian Patient Records", 7.0, 91.0),
        ("MoSPI NSS 75th Round (Health)", 7.0, 84.0),
        ("Ayushman Bharat PM-JAY Tariffs", 7.0, 77.0),
        ("IRDAI Annual Claim Reports", 7.0, 70.0)
    ]
    for text, sx, sy in sub1_items:
        draw_curve(b1_x - 8.5, b1_y, sx + 8.0, sy, lw=1.0)
        draw_rounded_node(sx, sy, 16.0, 3.8, text, is_sub=True)

    # LEFT BOTTOM: 2. INPUT FEATURES
    b2_x, b2_y = 24.0, 22.0
    draw_curve(center_x - 11.0, center_y - 2.5, b2_x + 8.5, b2_y, lw=2.0)
    draw_rounded_node(b2_x, b2_y, 17.0, 5.0, "2. PATIENT FEATURES\n(6 Core Inputs)", is_sub=False)

    sub2_items = [
        ("Age (18–75) & Sex (M/F)", 7.0, 33.0),
        ("BMI (16–46 kg/m² Obesity)", 7.0, 26.0),
        ("Tobacco / Smoker Status", 7.0, 19.0),
        ("City Tiers (Metro, Tier 2, Tier 3)", 7.0, 12.0)
    ]
    for text, sx, sy in sub2_items:
        draw_curve(b2_x - 8.5, b2_y, sx + 8.0, sy, lw=1.0)
        draw_rounded_node(sx, sy, 16.0, 3.8, text, is_sub=True)

    # RIGHT TOP: 3. ML MODELS & TUNING
    b3_x, b3_y = 76.0, 80.0
    draw_curve(center_x + 11.0, center_y + 2.5, b3_x - 8.5, b3_y, lw=2.0)
    draw_rounded_node(b3_x, b3_y, 17.0, 5.0, "3. ML REGRESSION\n(Algorithms & Tuning)", is_sub=False)

    sub3_items = [
        ("Linear & Ridge Regression", 93.0, 91.0),
        ("Support Vector Regressor (SVR)", 93.0, 84.0),
        ("Random Forest (BEST MODEL)", 93.0, 77.0),
        ("GridSearchCV (5-Fold CV)", 93.0, 70.0)
    ]
    for text, sx, sy in sub3_items:
        draw_curve(b3_x + 8.5, b3_y, sx - 8.0, sy, lw=1.0)
        draw_rounded_node(sx, sy, 16.0, 3.8, text, is_sub=True)

    # RIGHT BOTTOM: 4. WEB DEPLOYMENT & OUTPUT
    b4_x, b4_y = 76.0, 22.0
    draw_curve(center_x + 11.0, center_y - 2.5, b4_x - 8.5, b4_y, lw=2.0)
    draw_rounded_node(b4_x, b4_y, 17.0, 5.0, "4. WEB DEPLOYMENT\n(Real-Time Engine)", is_sub=False)

    sub4_items = [
        ("React 19 Frontend + Flask API", 93.0, 33.0),
        ("Zero-Latency AST Traversal (<2ms)", 93.0, 26.0),
        ("Inpatient Cost Output (₹ INR)", 93.0, 19.0),
        ("Matches 8 IRDAI Insurers", 93.0, 12.0)
    ]
    for text, sx, sy in sub4_items:
        draw_curve(b4_x + 8.5, b4_y, sx - 8.0, sy, lw=1.0)
        draw_rounded_node(sx, sy, 16.0, 3.8, text, is_sub=True)

    # TOP CENTER: 5. PERFORMANCE OUTCOMES
    b5_x, b5_y = 50.0, 92.0
    draw_curve(center_x, center_y + 4.5, b5_x, b5_y - 2.5, lw=1.8)
    draw_rounded_node(b5_x, b5_y, 20.0, 5.0, "5. RESULTS: R² ≈ 0.83  |  RMSE = ₹1.91L\n(Smoker drives 54.5% of costs)", is_sub=False)

    # Save
    print(f"Generating mindmap at {output_png}...")
    plt.savefig(output_png, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    if output_svg:
        print(f"Generating mindmap SVG at {output_svg}...")
        plt.savefig(output_svg, format='svg', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print("Mindmap generated successfully!")

if __name__ == '__main__':
    png_path = '/Users/jathinreddy/Desktop/Insurance/mindmap.png'
    svg_path = '/Users/jathinreddy/Desktop/Insurance/mindmap.svg'
    create_mindmap(png_path, svg_path)
