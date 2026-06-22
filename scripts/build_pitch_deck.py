"""Generate Leyton-Arena-Pitch.pptx — 8-slide MD pitch deck.

Operational / people-leader framing, confident-and-punchy tone, Leyton
orange + amber palette. Hand-built layouts on a 16:9 canvas. Designed to
sit in front of a live demo, so it ends on a "let's open the app" slide.

Run: python3 scripts/build_pitch_deck.py
Outputs: Leyton-Arena-Pitch.pptx in the repo root.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# ─── Brand palette ──────────────────────────────────────────────────────────
ORANGE = RGBColor(0xF7, 0x5C, 0x03)
AMBER  = RGBColor(0xFF, 0xC8, 0x00)
INK    = RGBColor(0x1A, 0x1A, 0x26)
INK2   = RGBColor(0x3A, 0x3A, 0x4A)
MUTED  = RGBColor(0x6E, 0x6E, 0x80)
CREAM  = RGBColor(0xFD, 0xFA, 0xF4)
BG2    = RGBColor(0xFF, 0xF5, 0xE6)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
BORDER = RGBColor(0xED, 0xE5, 0xD6)
TEAL   = RGBColor(0x2D, 0xD4, 0xBF)
ROSE   = RGBColor(0xFF, 0x5C, 0x8A)
RED    = RGBColor(0xFF, 0x4B, 0x4B)

# ─── Canvas — 16:9 widescreen ──────────────────────────────────────────────
prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height
BLANK_LAYOUT = prs.slide_layouts[6]

FONT_DISPLAY = "Calibri"  # 'display' family — Calibri is universally available


# ─── Drawing helpers ────────────────────────────────────────────────────────
def add_slide():
    return prs.slides.add_slide(BLANK_LAYOUT)


def set_bg(slide, color):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, SH)
    bg.line.fill.background()
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.shadow.inherit = False
    # Send to back
    spTree = bg._element.getparent()
    spTree.remove(bg._element)
    spTree.insert(2, bg._element)
    return bg


def add_rect(slide, x, y, w, h, fill=None, line=None, rounded=False, radius=0.08):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    rect = slide.shapes.add_shape(shape_type, x, y, w, h)
    if rounded:
        rect.adjustments[0] = radius
    if fill is None:
        rect.fill.background()
    else:
        rect.fill.solid()
        rect.fill.fore_color.rgb = fill
    if line is None:
        rect.line.fill.background()
    else:
        rect.line.color.rgb = line
        rect.line.width = Pt(1)
    rect.shadow.inherit = False
    return rect


def add_text(slide, x, y, w, h, text, *, size=18, bold=False, color=INK,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=FONT_DISPLAY,
             italic=False, line_spacing=1.15):
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame
    tf.margin_left = tf.margin_right = Emu(0)
    tf.margin_top = tf.margin_bottom = Emu(0)
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    lines = text.split("\n") if isinstance(text, str) else text
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        run = p.add_run()
        run.text = line
        run.font.name = font
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.italic = italic
        run.font.color.rgb = color
    return box


def add_pill(slide, x, y, text, *, bg=ORANGE, fg=WHITE, size=10,
             pad_x=Inches(0.14), pad_y=Inches(0.05), bold=True):
    # Measure roughly via character count.
    w = Inches(0.1 + 0.085 * len(text))
    h = Inches(0.28)
    pill = add_rect(slide, x, y, w, h, fill=bg, rounded=True, radius=0.5)
    add_text(slide, x, y, w, h, text,
             size=size, bold=bold, color=fg,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    return pill, w


def add_eyebrow(slide, x, y, text):
    add_text(slide, x, y, Inches(8), Inches(0.3), text.upper(),
             size=10, bold=True, color=ORANGE)


def add_footer(slide, page_num, total):
    # Brand wordmark left, page count right.
    add_text(slide, Inches(0.5), Inches(7.05), Inches(6), Inches(0.3),
             "Leyton Arena · MVP preview", size=10, color=MUTED, bold=True)
    add_text(slide, Inches(0.5), Inches(7.05), Inches(12.3), Inches(0.3),
             f"{page_num} / {total}", size=10, color=MUTED, bold=True,
             align=PP_ALIGN.RIGHT)


def add_logo_mark(slide, x, y, size=Inches(0.55)):
    # A rounded orange tile + cream slash + amber dot — mimics the app's
    # negative-space "O" mark.
    add_rect(slide, x, y, size, size, fill=ORANGE, rounded=True, radius=0.28)
    add_rect(slide, x + Emu(int(size * 0.18)), y + Emu(int(size * 0.4)),
             Emu(int(size * 0.64)), Emu(int(size * 0.2)),
             fill=CREAM, rounded=True, radius=0.5)
    add_rect(slide, x + Emu(int(size * 0.72)), y + Emu(int(size * 0.12)),
             Emu(int(size * 0.22)), Emu(int(size * 0.22)),
             fill=AMBER, rounded=True, radius=0.5)


def add_corner_marks(slide):
    """Decorative gradient orbs to add visual texture without dominating."""
    # Big amber orb top-left (will read as a soft circle).
    orb1 = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(-1.2), Inches(-1.5),
                                  Inches(3.5), Inches(3.5))
    orb1.fill.solid(); orb1.fill.fore_color.rgb = AMBER
    orb1.line.fill.background()
    orb1.shadow.inherit = False
    # Make it semi-transparent via the alpha trick on the XML.
    _set_alpha(orb1, 35000)

    orb2 = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(11), Inches(5),
                                  Inches(4), Inches(4))
    orb2.fill.solid(); orb2.fill.fore_color.rgb = ORANGE
    orb2.line.fill.background()
    orb2.shadow.inherit = False
    _set_alpha(orb2, 30000)


def _set_alpha(shape, alpha):
    """Set fill alpha (0–100000). Used for soft gradient orbs."""
    from lxml import etree
    sp = shape.fill._xPr
    solidFill = sp.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill")
    if solidFill is None:
        return
    srgb = solidFill.find("{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr")
    if srgb is None:
        return
    # Remove any existing alpha then add the new one.
    for child in list(srgb):
        srgb.remove(child)
    alpha_el = etree.SubElement(
        srgb, "{http://schemas.openxmlformats.org/drawingml/2006/main}alpha"
    )
    alpha_el.set("val", str(alpha))


# ─── Slide 1 — Title ────────────────────────────────────────────────────────
def slide_title(idx, total):
    s = add_slide()
    set_bg(s, CREAM)
    add_corner_marks(s)
    # Wordmark
    add_logo_mark(s, Inches(0.7), Inches(0.6), size=Inches(0.6))
    add_text(s, Inches(1.45), Inches(0.6), Inches(6), Inches(0.4),
             "LEYTON ARENA", size=14, bold=True, color=INK,
             anchor=MSO_ANCHOR.TOP)
    add_text(s, Inches(1.45), Inches(0.92), Inches(6), Inches(0.25),
             "R&D delivery · gamified", size=9, bold=True, color=MUTED)

    # Hero headline
    add_text(s, Inches(0.7), Inches(2.4), Inches(12), Inches(1.4),
             "Make every day a winning day.",
             size=66, bold=True, color=INK, line_spacing=1.0)
    # Underline accent
    add_rect(s, Inches(0.7), Inches(3.85), Inches(7.5), Inches(0.12),
             fill=ORANGE, rounded=True, radius=0.5)

    add_text(s, Inches(0.7), Inches(4.2), Inches(11), Inches(0.8),
             "Gamifying the day-to-day of R&D consultants — to flatten the curve,\n"
             "build a culture of healthy competition, and give managers honest signal\n"
             "on who's flying and who needs a hand.",
             size=18, color=INK2, line_spacing=1.35)

    # Tag pills
    pill_y = Inches(6.0)
    pills = [
        ("100+ CONSULTANTS", AMBER, INK),
        ("40+ BADGES", ORANGE, WHITE),
        ("10+ CHALLENGES", TEAL, WHITE),
        ("DAILY, NOT MONTHLY", INK, WHITE),
    ]
    x = Inches(0.7)
    for text, bg, fg in pills:
        _, w = add_pill(s, x, pill_y, text, bg=bg, fg=fg, size=11)
        x += w + Inches(0.18)

    add_footer(s, idx, total)
    return s


# ─── Slide 2 — The problem ─────────────────────────────────────────────────
def slide_problem(idx, total):
    s = add_slide()
    set_bg(s, CREAM)

    add_eyebrow(s, Inches(0.7), Inches(0.55), "The problem")
    add_text(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.9),
             "Month-end is a scramble. Forecasts aren't trusted.",
             size=38, bold=True, color=INK, line_spacing=1.05)
    add_text(s, Inches(0.7), Inches(1.65), Inches(12), Inches(0.6),
             "Consultants do brilliant work — but the system around them rewards "
             "month-end heroics, not steady delivery.",
             size=16, color=INK2)

    # Four problem tiles
    tiles = [
        ("🗓",  "Month-end spike",
         "Most invoices ship in the last week. Cash is lumpy; planning is fiction."),
        ("📊",  "Quarter-end push",
         "Q-close runs ~15–20% above other months. Heroic, not repeatable."),
        ("⏱",  "Late-week slip",
         "Pushes cluster in the final 5 days — committed work quietly slips into next month."),
        ("🪟",  "No early signal",
         "Managers find out at month-end. By then it's coaching after the fact."),
    ]
    x0 = Inches(0.7); y0 = Inches(2.7)
    tile_w = Inches(2.95); tile_h = Inches(2.6); gap = Inches(0.13)
    for i, (emoji, title, body) in enumerate(tiles):
        x = x0 + (tile_w + gap) * i
        add_rect(s, x, y0, tile_w, tile_h, fill=WHITE, line=BORDER, rounded=True, radius=0.06)
        add_text(s, x + Inches(0.3), y0 + Inches(0.22), tile_w - Inches(0.6), Inches(0.7),
                 emoji, size=34)
        add_text(s, x + Inches(0.3), y0 + Inches(0.95), tile_w - Inches(0.6), Inches(0.45),
                 title, size=16, bold=True, color=INK)
        add_text(s, x + Inches(0.3), y0 + Inches(1.45), tile_w - Inches(0.6), Inches(1.0),
                 body, size=12, color=INK2, line_spacing=1.3)

    add_text(s, Inches(0.7), Inches(5.7), Inches(12), Inches(0.5),
             "These aren't tooling gaps. They're behavioural patterns. "
             "Fix them with culture and visibility, not another dashboard.",
             size=15, italic=True, color=INK2)

    add_footer(s, idx, total)
    return s


# ─── Slide 3 — The shift ────────────────────────────────────────────────────
def slide_shift(idx, total):
    s = add_slide()
    set_bg(s, CREAM)

    add_eyebrow(s, Inches(0.7), Inches(0.55), "The shift")
    add_text(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.9),
             "Turn the daily grind into a game worth playing.",
             size=38, bold=True, color=INK, line_spacing=1.05)
    add_text(s, Inches(0.7), Inches(1.65), Inches(12), Inches(0.6),
             "Visibility · streaks · friendly rivalry · real rewards. "
             "The mechanics that make work feel like wins.",
             size=16, color=INK2)

    # Left/right comparison cards
    left_x = Inches(0.7); right_x = Inches(7.0)
    card_w = Inches(5.6); card_h = Inches(4.4); card_y = Inches(2.5)

    # Before
    add_rect(s, left_x, card_y, card_w, card_h, fill=WHITE, line=BORDER, rounded=True, radius=0.05)
    add_pill(s, left_x + Inches(0.4), card_y + Inches(0.35), "BEFORE",
             bg=RED, fg=WHITE, size=10)
    add_text(s, left_x + Inches(0.4), card_y + Inches(0.85), card_w - Inches(0.8), Inches(0.6),
             "Quiet pipeline, loud month-end.",
             size=20, bold=True, color=INK)
    before_bullets = [
        ("•", "Targets show up monthly — invisible on day 4."),
        ("•", "Recognition comes in the form of a Friday email."),
        ("•", "Coaching happens after the slip, not before."),
        ("•", "Best consultants and stragglers look the same on a spreadsheet."),
    ]
    by = card_y + Inches(1.6)
    for bullet, text in before_bullets:
        add_text(s, left_x + Inches(0.45), by, Inches(0.3), Inches(0.4),
                 bullet, size=14, bold=True, color=RED)
        add_text(s, left_x + Inches(0.75), by, card_w - Inches(1.2), Inches(0.5),
                 text, size=13, color=INK2, line_spacing=1.3)
        by += Inches(0.55)

    # After
    add_rect(s, right_x, card_y, card_w, card_h, fill=WHITE, line=ORANGE, rounded=True, radius=0.05)
    add_pill(s, right_x + Inches(0.4), card_y + Inches(0.35), "AFTER · WITH ARENA",
             bg=ORANGE, fg=WHITE, size=10)
    add_text(s, right_x + Inches(0.4), card_y + Inches(0.85), card_w - Inches(0.8), Inches(0.6),
             "Daily wins. Steady cadence. Loud recognition.",
             size=20, bold=True, color=INK)
    after_bullets = [
        ("✓", "Live leaderboard updates as work advances — every day counts."),
        ("✓", "Fire streaks reward consistency over heroics."),
        ("✓", "Coaching insights nudge before month-end, not after."),
        ("✓", "Managers spot late-week pushers and pull-forward stars instantly."),
    ]
    by = card_y + Inches(1.6)
    for bullet, text in after_bullets:
        add_text(s, right_x + Inches(0.45), by, Inches(0.3), Inches(0.4),
                 bullet, size=14, bold=True, color=ORANGE)
        add_text(s, right_x + Inches(0.75), by, card_w - Inches(1.2), Inches(0.5),
                 text, size=13, color=INK2, line_spacing=1.3)
        by += Inches(0.55)

    add_footer(s, idx, total)
    return s


# ─── Slide 4 — How it works ────────────────────────────────────────────────
def slide_how_it_works(idx, total):
    s = add_slide()
    set_bg(s, CREAM)

    add_eyebrow(s, Inches(0.7), Inches(0.55), "How it works")
    add_text(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.9),
             "Four mechanics, one rhythm.",
             size=38, bold=True, color=INK, line_spacing=1.05)
    add_text(s, Inches(0.7), Inches(1.65), Inches(12), Inches(0.5),
             "Each loops daily. Together they replace month-end panic with daily pacing.",
             size=16, color=INK2)

    cards = [
        ("01", "🔥", "Daily fire",
         "Every consultant has a fire that grows when they advance a claim. "
         "Miss a day, it resets. The cheapest, loudest reminder to do today's bit."),
        ("02", "🏆", "Live leaderboard",
         "Top-3 podium, sparkline trends, position deltas. "
         "Filter by office or role. The board updates the moment work advances."),
        ("03", "⚔️", "Duels & challenges",
         "Head-to-head on any metric. Pick a stake, pick a duration. "
         "Spectators cheer. Healthy rivalry, not pressure."),
        ("04", "🎁", "Real rewards",
         "Badges convert to points. Points cash in for 34 real treats — "
         "coffee through to a long weekend. Skin in the game."),
    ]

    x0 = Inches(0.7); y0 = Inches(2.6); gap = Inches(0.18)
    card_w = Inches(2.95); card_h = Inches(3.7)
    for i, (num, emoji, title, body) in enumerate(cards):
        x = x0 + (card_w + gap) * i
        add_rect(s, x, y0, card_w, card_h, fill=WHITE, line=BORDER, rounded=True, radius=0.05)
        # Numbered chip
        add_rect(s, x + Inches(0.3), y0 + Inches(0.3), Inches(0.7), Inches(0.45),
                 fill=ORANGE, rounded=True, radius=0.4)
        add_text(s, x + Inches(0.3), y0 + Inches(0.3), Inches(0.7), Inches(0.45),
                 num, size=12, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        # Emoji
        add_text(s, x + Inches(0.3), y0 + Inches(0.9), card_w - Inches(0.6), Inches(0.8),
                 emoji, size=40)
        # Title
        add_text(s, x + Inches(0.3), y0 + Inches(1.85), card_w - Inches(0.6), Inches(0.5),
                 title, size=17, bold=True, color=INK)
        # Body
        add_text(s, x + Inches(0.3), y0 + Inches(2.4), card_w - Inches(0.6), Inches(1.3),
                 body, size=11.5, color=INK2, line_spacing=1.35)

    add_footer(s, idx, total)
    return s


# ─── Slide 5 — For the consultant ───────────────────────────────────────────
def slide_for_consultant(idx, total):
    s = add_slide()
    set_bg(s, CREAM)

    add_eyebrow(s, Inches(0.7), Inches(0.55), "For the consultant")
    add_text(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.9),
             "A coach in their pocket. Not another KPI dashboard.",
             size=34, bold=True, color=INK, line_spacing=1.05)
    add_text(s, Inches(0.7), Inches(1.65), Inches(12), Inches(0.5),
             "Honest signals, ranked, with confidence labels. Always paired with a concrete next step.",
             size=15, color=INK2)

    # Left — mock coaching card
    lx, ly, lw, lh = Inches(0.7), Inches(2.5), Inches(7.0), Inches(4.4)
    add_rect(s, lx, ly, lw, lh, fill=WHITE, line=BORDER, rounded=True, radius=0.04)
    add_text(s, lx + Inches(0.4), ly + Inches(0.35), lw - Inches(0.8), Inches(0.3),
             "COACHING SUMMARY · LAST 6 MONTHS", size=9, bold=True, color=MUTED)
    add_text(s, lx + Inches(0.4), ly + Inches(0.7), lw - Inches(0.8), Inches(0.6),
             "B · Smooth the line", size=26, bold=True, color=INK)

    # Strength row
    add_rect(s, lx + Inches(0.4), ly + Inches(1.55), lw - Inches(0.8), Inches(0.85),
             fill=BG2, line=BORDER, rounded=True, radius=0.06)
    add_pill(s, lx + Inches(0.6), ly + Inches(1.7), "STRENGTH", bg=TEAL, fg=WHITE, size=9)
    add_text(s, lx + Inches(0.6), ly + Inches(2.0), lw - Inches(1.2), Inches(0.4),
             "Fast closer · 3.2d handover → invoice. Faster than 72% of peers.",
             size=12.5, color=INK2)

    # Lever row
    add_rect(s, lx + Inches(0.4), ly + Inches(2.5), lw - Inches(0.8), Inches(0.85),
             fill=BG2, line=BORDER, rounded=True, radius=0.06)
    add_pill(s, lx + Inches(0.6), ly + Inches(2.65), "LEVER", bg=ROSE, fg=WHITE, size=9)
    add_text(s, lx + Inches(0.6), ly + Inches(2.95), lw - Inches(1.2), Inches(0.4),
             "Last-week pusher · 42% of pushes hit the final week. Surface risk on Tuesdays.",
             size=12.5, color=INK2)

    # Recommendation
    add_rect(s, lx + Inches(0.4), ly + Inches(3.45), lw - Inches(0.8), Inches(0.78),
             fill=AMBER, rounded=True, radius=0.06)
    add_text(s, lx + Inches(0.6), ly + Inches(3.5), Inches(2), Inches(0.3),
             "NEXT MONTH", size=9, bold=True, color=INK)
    add_text(s, lx + Inches(0.6), ly + Inches(3.78), lw - Inches(1.2), Inches(0.4),
             "Ship one claim by day 10 · lifts early-% from 48% to 63%.",
             size=13, bold=True, color=INK)

    # Right — pillars
    rx = Inches(8.0); ry = Inches(2.5)
    pillars = [
        ("Honest signals",   "Every insight carries a confidence label. No false precision."),
        ("Always actionable","Pair each gap with a concrete suggestion — effort and impact tagged."),
        ("Tied to badges",   "Improving and unlocking happen in the same motion."),
        ("Models the upside","Pull these two levers → +2 ops/month, +£18k invoiced."),
    ]
    h = Inches(1.0)
    for i, (title, body) in enumerate(pillars):
        y = ry + (h + Inches(0.05)) * i
        add_rect(s, rx, y, Inches(4.6), h, fill=WHITE, line=BORDER, rounded=True, radius=0.06)
        # Orange dot
        add_rect(s, rx + Inches(0.25), y + Inches(0.32), Inches(0.36), Inches(0.36),
                 fill=ORANGE, rounded=True, radius=0.5)
        add_text(s, rx + Inches(0.8), y + Inches(0.18), Inches(3.7), Inches(0.4),
                 title, size=14, bold=True, color=INK)
        add_text(s, rx + Inches(0.8), y + Inches(0.5), Inches(3.7), Inches(0.5),
                 body, size=11, color=INK2, line_spacing=1.3)

    add_footer(s, idx, total)
    return s


# ─── Slide 6 — For the manager ──────────────────────────────────────────────
def slide_for_manager(idx, total):
    s = add_slide()
    set_bg(s, CREAM)

    add_eyebrow(s, Inches(0.7), Inches(0.55), "For the manager")
    add_text(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.9),
             "See your team the way they actually deliver.",
             size=34, bold=True, color=INK, line_spacing=1.05)
    add_text(s, Inches(0.7), Inches(1.65), Inches(12), Inches(0.5),
             "Three lenses: who's flying, who's slipping, and why the curve looks the way it does.",
             size=15, color=INK2)

    # Three big tiles
    x0 = Inches(0.7); y0 = Inches(2.5); gap = Inches(0.2)
    tw = Inches(4.0); th = Inches(4.4)

    # Trends
    add_rect(s, x0, y0, tw, th, fill=WHITE, line=BORDER, rounded=True, radius=0.04)
    add_text(s, x0 + Inches(0.3), y0 + Inches(0.3), tw - Inches(0.6), Inches(0.3),
             "TRENDS", size=10, bold=True, color=MUTED)
    add_text(s, x0 + Inches(0.3), y0 + Inches(0.6), tw - Inches(0.6), Inches(0.7),
             "Every consultant, segmented by momentum.",
             size=17, bold=True, color=INK, line_spacing=1.2)
    # Segment counts
    segs = [("Improving", "9", TEAL), ("Steady", "7", AMBER),
            ("Spiky", "5", ORANGE), ("Sliding", "3", ROSE)]
    sy = y0 + Inches(1.55)
    for label, count, color in segs:
        add_rect(s, x0 + Inches(0.3), sy, tw - Inches(0.6), Inches(0.5),
                 fill=CREAM, line=BORDER, rounded=True, radius=0.2)
        add_rect(s, x0 + Inches(0.45), sy + Inches(0.17), Inches(0.16), Inches(0.16),
                 fill=color, rounded=True, radius=0.5)
        add_text(s, x0 + Inches(0.75), sy + Inches(0.08), Inches(2), Inches(0.35),
                 label, size=12, bold=True, color=INK)
        add_text(s, x0, sy + Inches(0.08), tw - Inches(0.3), Inches(0.35),
                 count, size=14, bold=True, color=INK, align=PP_ALIGN.RIGHT)
        sy += Inches(0.55)
    add_text(s, x0 + Inches(0.3), y0 + Inches(3.85), tw - Inches(0.6), Inches(0.4),
             "One-tap 'Nudge' — sends coaching prompt to Teams.",
             size=10.5, color=MUTED, italic=True, line_spacing=1.3)

    # The curve
    cx = x0 + tw + gap
    add_rect(s, cx, y0, tw, th, fill=WHITE, line=ORANGE, rounded=True, radius=0.04)
    add_text(s, cx + Inches(0.3), y0 + Inches(0.3), tw - Inches(0.6), Inches(0.3),
             "THE CURVE", size=10, bold=True, color=MUTED)
    add_text(s, cx + Inches(0.3), y0 + Inches(0.6), tw - Inches(0.6), Inches(0.7),
             "Diagnose the spike.",
             size=17, bold=True, color=INK, line_spacing=1.2)

    # Mini bar chart
    cy_chart = y0 + Inches(1.5)
    cb_h_max = Inches(1.8)
    heights = [0.4, 0.5, 0.85, 0.55, 0.65, 1.0]   # last = Q-end
    cb_w = Inches(0.4)
    cb_gap = Inches(0.14)
    cb_x = cx + Inches(0.35)
    for i, frac in enumerate(heights):
        is_q = (i == 5)
        h = Inches(0.2 + frac * 1.6)
        y = cy_chart + (cb_h_max - h)
        add_rect(s, cb_x, y, cb_w, h, fill=AMBER if is_q else ORANGE,
                 rounded=True, radius=0.15)
        cb_x += cb_w + cb_gap
    add_text(s, cx + Inches(0.3), cy_chart + Inches(1.9), tw - Inches(0.6), Inches(0.3),
             "Q-end runs +18% above other months",
             size=10, color=MUTED, italic=True)

    add_text(s, cx + Inches(0.3), y0 + Inches(3.7), tw - Inches(0.6), Inches(0.6),
             "Top back-loaded contributors, office breakdown, "
             "month-over-month invoice trend.",
             size=11, color=INK2, line_spacing=1.3)

    # Pipeline discipline
    px = cx + tw + gap
    add_rect(s, px, y0, tw, th, fill=WHITE, line=BORDER, rounded=True, radius=0.04)
    add_text(s, px + Inches(0.3), y0 + Inches(0.3), tw - Inches(0.6), Inches(0.3),
             "PIPELINE DISCIPLINE", size=10, bold=True, color=MUTED)
    add_text(s, px + Inches(0.3), y0 + Inches(0.6), tw - Inches(0.6), Inches(0.7),
             "Push vs pull behaviour, named.",
             size=17, bold=True, color=INK, line_spacing=1.2)

    # Worst pattern
    add_rect(s, px + Inches(0.3), y0 + Inches(1.5), tw - Inches(0.6), Inches(1.1),
             fill=RGBColor(0xFF, 0xEC, 0xEC), line=ROSE, rounded=True, radius=0.05)
    add_pill(s, px + Inches(0.45), y0 + Inches(1.62), "WORST",
             bg=ROSE, fg=WHITE, size=9)
    add_text(s, px + Inches(0.45), y0 + Inches(1.95), tw - Inches(0.9), Inches(0.35),
             "Last-week pushers",
             size=13, bold=True, color=INK)
    add_text(s, px + Inches(0.45), y0 + Inches(2.25), tw - Inches(0.9), Inches(0.4),
             "Pushes that cluster just before close.",
             size=10.5, color=INK2)

    # Best pattern
    add_rect(s, px + Inches(0.3), y0 + Inches(2.75), tw - Inches(0.6), Inches(1.1),
             fill=RGBColor(0xE9, 0xFA, 0xF6), line=TEAL, rounded=True, radius=0.05)
    add_pill(s, px + Inches(0.45), y0 + Inches(2.87), "BEST",
             bg=TEAL, fg=WHITE, size=9)
    add_text(s, px + Inches(0.45), y0 + Inches(3.2), tw - Inches(0.9), Inches(0.35),
             "Pull-forward heroes",
             size=13, bold=True, color=INK)
    add_text(s, px + Inches(0.45), y0 + Inches(3.5), tw - Inches(0.9), Inches(0.4),
             "Accurate plan + over-delivery.",
             size=10.5, color=INK2)

    add_text(s, px + Inches(0.3), y0 + Inches(3.95), tw - Inches(0.6), Inches(0.4),
             "Coach the left. Celebrate the right.",
             size=11, italic=True, color=MUTED)

    add_footer(s, idx, total)
    return s


# ─── Slide 7 — What changes ────────────────────────────────────────────────
def slide_what_changes(idx, total):
    s = add_slide()
    set_bg(s, CREAM)

    add_eyebrow(s, Inches(0.7), Inches(0.55), "What changes")
    add_text(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.9),
             "A different shape of month.",
             size=38, bold=True, color=INK, line_spacing=1.05)
    add_text(s, Inches(0.7), Inches(1.65), Inches(12), Inches(0.5),
             "Same people. Same workload. Different cadence — and a culture that compounds.",
             size=16, color=INK2)

    # Four impact tiles
    impacts = [
        ("Flatter curve",
         "Work spreads cleanly across the month. Day-1 → day-31, not day-25 → day-31.",
         ORANGE),
        ("Forecasts you trust",
         "Planning accuracy is visible per consultant. Push patterns surface early.",
         AMBER),
        ("Public recognition",
         "Top-3 podium, badges, season trophies. Reward the behaviour you want more of.",
         TEAL),
        ("Less burnout",
         "No more last-week scramble. Pacing replaces panic. Streaks beat heroics.",
         ROSE),
    ]
    x0 = Inches(0.7); y0 = Inches(2.6); gap = Inches(0.18)
    tw = Inches(2.95); th = Inches(3.7)
    for i, (title, body, accent) in enumerate(impacts):
        x = x0 + (tw + gap) * i
        add_rect(s, x, y0, tw, th, fill=WHITE, line=BORDER, rounded=True, radius=0.05)
        # Accent stripe
        add_rect(s, x, y0, tw, Inches(0.18), fill=accent, rounded=False)
        # Big tick
        add_rect(s, x + Inches(0.3), y0 + Inches(0.6), Inches(0.7), Inches(0.7),
                 fill=accent, rounded=True, radius=0.5)
        add_text(s, x + Inches(0.3), y0 + Inches(0.6), Inches(0.7), Inches(0.7),
                 "✓", size=22, bold=True, color=WHITE,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + Inches(0.3), y0 + Inches(1.5), tw - Inches(0.6), Inches(0.6),
                 title, size=18, bold=True, color=INK)
        add_text(s, x + Inches(0.3), y0 + Inches(2.15), tw - Inches(0.6), Inches(1.4),
                 body, size=12, color=INK2, line_spacing=1.4)

    add_footer(s, idx, total)
    return s


# ─── Slide 8 — Demo ─────────────────────────────────────────────────────────
def slide_demo(idx, total):
    s = add_slide()
    set_bg(s, INK)
    add_corner_marks(s)
    # Override orbs to be on dark
    for shp in list(s.shapes):
        if shp.shape_type == 9:  # oval
            pass  # leave them

    # Title
    add_text(s, Inches(0.7), Inches(0.6), Inches(8), Inches(0.4),
             "DEMO TIME", size=12, bold=True, color=AMBER)
    add_text(s, Inches(0.7), Inches(2.3), Inches(12), Inches(1.5),
             "Let's open the app.",
             size=72, bold=True, color=WHITE, line_spacing=1.0)
    add_rect(s, Inches(0.7), Inches(3.85), Inches(7.5), Inches(0.12),
             fill=AMBER, rounded=True, radius=0.5)
    add_text(s, Inches(0.7), Inches(4.2), Inches(11), Inches(1.2),
             "Live walkthrough — landing → login → home → coaching tab → manager curve.\n"
             "Five minutes. Real interactions. Real consultants.",
             size=20, color=RGBColor(0xCC, 0xCC, 0xDD), line_spacing=1.4)

    # Demo route chips
    chips = [
        ("/  ",        "LANDING"),
        ("→",          ""),
        ("/login",     "MOCK LOGIN"),
        ("→",          ""),
        ("/  ",        "HOME"),
        ("→",          ""),
        ("/profile",   "COACHING"),
        ("→",          ""),
        ("/manager",   "CURVE"),
    ]
    cx = Inches(0.7); cy = Inches(6.1)
    for code, label in chips:
        if code == "→":
            add_text(s, cx, cy, Inches(0.4), Inches(0.4), "→",
                     size=18, bold=True, color=AMBER,
                     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            cx += Inches(0.45)
            continue
        # chip
        ch_w = Inches(0.1 + 0.08 * (len(code) + len(label)))
        ch_w = max(ch_w, Inches(1.6))
        add_rect(s, cx, cy, ch_w, Inches(0.55),
                 fill=RGBColor(0x2B, 0x2B, 0x3A), line=AMBER,
                 rounded=True, radius=0.4)
        add_text(s, cx + Inches(0.18), cy + Inches(0.05),
                 Inches(1.2), Inches(0.25),
                 code, size=10, bold=True, color=AMBER, font="Consolas")
        add_text(s, cx + Inches(0.18), cy + Inches(0.27),
                 Inches(1.6), Inches(0.3),
                 label, size=9, bold=True, color=WHITE)
        cx += ch_w + Inches(0.1)

    # Footer in dark
    add_text(s, Inches(0.5), Inches(7.05), Inches(6), Inches(0.3),
             "Leyton Arena · MVP preview", size=10, color=MUTED, bold=True)
    add_text(s, Inches(0.5), Inches(7.05), Inches(12.3), Inches(0.3),
             f"{idx} / {total}", size=10, color=MUTED, bold=True,
             align=PP_ALIGN.RIGHT)
    return s


# ─── Build the deck ─────────────────────────────────────────────────────────
TOTAL = 8
slide_title(1, TOTAL)
slide_problem(2, TOTAL)
slide_shift(3, TOTAL)
slide_how_it_works(4, TOTAL)
slide_for_consultant(5, TOTAL)
slide_for_manager(6, TOTAL)
slide_what_changes(7, TOTAL)
slide_demo(8, TOTAL)

OUT = "Leyton-Arena-Pitch.pptx"
prs.save(OUT)
print(f"Wrote {OUT}")
