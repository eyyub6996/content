"""Figures du guide (matplotlib -> SVG en ligne)."""
import io
import re

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Arc, FancyArrowPatch, Polygon, Rectangle, Wedge, Circle  # noqa: E402

plt.rcParams.update(
    {
        "font.family": "DejaVu Sans",
        "font.size": 10,
        "mathtext.fontset": "dejavusans",
        "axes.linewidth": 0.8,
        "svg.fonttype": "path",
    }
)

NAVY = "#1f4e79"
BLUE = "#2f6db3"
RED = "#c0392b"
GREEN = "#2e7d4f"
ORANGE = "#d9822b"
VIOLET = "#6b3fa0"
GREY = "#8a94a6"
LIGHT = "#dbe7f5"

_cache = {}
_uid = [0]


def _svg(fig):
    buf = io.StringIO()
    fig.savefig(buf, format="svg", bbox_inches="tight", pad_inches=0.04, transparent=True)
    plt.close(fig)
    s = buf.getvalue()
    s = s[s.index("<svg") :]
    # identifiants uniques (plusieurs SVG dans la même page)
    _uid[0] += 1
    p = f"f{_uid[0]}_"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r"url\(#([^)]+)\)", lambda m: f"url(#{p}{m.group(1)})", s)
    s = re.sub(r'((?:xlink:)?href)="#([^"]+)"', lambda m: f'{m.group(1)}="#{p}{m.group(2)}"', s)
    return s


def axes(ax, xlim, ylim, xticks=None, yticks=None, grid=True, labels=("x", "y")):
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.spines["left"].set_position("zero")
    ax.spines["bottom"].set_position("zero")
    ax.spines["right"].set_visible(False)
    ax.spines["top"].set_visible(False)
    ax.spines["left"].set_color("#555")
    ax.spines["bottom"].set_color("#555")
    if xticks is not None:
        ax.set_xticks(xticks)
    if yticks is not None:
        ax.set_yticks(yticks)
    ax.tick_params(labelsize=8, length=3, colors="#444")
    if grid:
        ax.grid(True, color="#e6e9ef", lw=0.6)
        ax.set_axisbelow(True)
    ax.plot(1, 0, ">", color="#555", transform=ax.get_yaxis_transform(), clip_on=False, ms=4)
    ax.plot(0, 1, "^", color="#555", transform=ax.get_xaxis_transform(), clip_on=False, ms=4)
    if labels:
        ax.text(1.0, 0.0, " " + labels[0], transform=ax.get_yaxis_transform(), va="center", ha="left", fontsize=9)
        ax.text(0.0, 1.0, labels[1] + " ", transform=ax.get_xaxis_transform(), va="bottom", ha="right", fontsize=9)


def fig(w=4.2, h=3.0):
    f, ax = plt.subplots(figsize=(w, h))
    return f, ax


def arrow(ax, p, q, color=NAVY, lw=1.8, ms=12, style="-|>"):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle=style, mutation_scale=ms, color=color, lw=lw, shrinkA=0, shrinkB=0))


def numline(ax, lo, hi, y=0):
    ax.plot([lo, hi], [y, y], color="#444", lw=1)
    ax.plot(hi, y, ">", color="#444", ms=5)
    for k in range(int(np.ceil(lo)), int(np.floor(hi)) + 1):
        ax.plot([k, k], [y - 0.08, y + 0.08], color="#444", lw=0.8)
        ax.text(k, y - 0.28, f"{k}".replace("-", "−"), ha="center", va="top", fontsize=8, color="#444")


# ------------------------------------------------------------------ ch. 0

def f_droite_nombres():
    f, ax = fig(6.4, 1.3)
    numline(ax, -6.5, 6.5)
    ax.annotate("", xy=(-3, 0.5), xytext=(0, 0.5), arrowprops=dict(arrowstyle="-|>", color=RED, lw=1.6))
    ax.annotate("", xy=(-7 + 0.001, 0.95), xytext=(-3, 0.95), arrowprops=dict(arrowstyle="-|>", color=RED, lw=1.6))
    ax.text(-1.5, 0.62, "−3", color=RED, ha="center", fontsize=9)
    ax.text(-5, 1.07, "−4 de plus", color=RED, ha="center", fontsize=9)
    ax.annotate("", xy=(4, 0.5), xytext=(0, 0.5), arrowprops=dict(arrowstyle="-|>", color=GREEN, lw=1.6))
    ax.text(2, 0.62, "+4", color=GREEN, ha="center", fontsize=9)
    ax.text(-6.5, -0.75, "← les dettes (négatifs)", fontsize=8.5, color=RED, ha="left")
    ax.text(6.5, -0.75, "l'argent que tu as (positifs) →", fontsize=8.5, color=GREEN, ha="right")
    ax.set_xlim(-7.2, 7)
    ax.set_ylim(-0.95, 1.35)
    ax.axis("off")
    return _svg(f)


def _interval(ax, y, a, b, lc, rc, label, lo=-4.5, hi=7.5):
    numline(ax, lo, hi, y)
    aa = lo if a is None else a
    bb = hi - 0.3 if b is None else b
    ax.plot([aa, bb], [y, y], color=BLUE, lw=5, alpha=0.55, solid_capstyle="butt")
    if a is not None:
        ax.text(a, y + 0.02, "[" if lc else "]", color=BLUE, fontsize=17, ha="center", va="center", fontweight="bold")
    if b is not None:
        ax.text(b, y + 0.02, "]" if rc else "[", color=BLUE, fontsize=17, ha="center", va="center", fontweight="bold")
    ax.text(lo - 0.3, y + 0.42, label, fontsize=9.5, color=NAVY, ha="left")


def f_intervalles():
    f, ax = fig(6.4, 3.3)
    _interval(ax, 3.0, 2, 5, True, True, r"$[2\,;\,5]$ : $2 \leq x \leq 5$ (2 et 5 inclus)")
    _interval(ax, 1.5, -1, 4, False, True, r"$]-1\,;\,4]$ : $-1 < x \leq 4$ (−1 exclu, 4 inclus)")
    _interval(ax, 0.0, 3, None, True, False, r"$[3\,;\,+\infty[$ : $x \geq 3$ (jusqu'à l'infini)")
    ax.set_xlim(-5, 8)
    ax.set_ylim(-0.6, 3.6)
    ax.axis("off")
    return _svg(f)


# ------------------------------------------------------------------ ch. 1

def f_pizza():
    f, axs = plt.subplots(1, 4, figsize=(6.6, 1.9))
    def pie(ax, parts, filled, color, title):
        for k in range(parts):
            ax.add_patch(Wedge((0, 0), 1, 90 - 360 * (k + 1) / parts, 90 - 360 * k / parts,
                               facecolor=color if k < filled else "white", edgecolor=NAVY, lw=1.2))
        ax.set_xlim(-1.15, 1.15)
        ax.set_ylim(-1.15, 1.15)
        ax.set_aspect("equal")
        ax.axis("off")
        ax.set_title(title, fontsize=10, pad=2)
    pie(axs[0], 2, 1, "#f5b971", r"$\frac{1}{2} = \frac{3}{6}$")
    pie(axs[1], 3, 1, "#9cc3e6", r"$\frac{1}{3} = \frac{2}{6}$")
    pie(axs[2], 6, 3, "#f5b971", r"$\frac{3}{6}$")
    ax = axs[3]
    for k in range(6):
        col = "#f5b971" if k < 3 else ("#9cc3e6" if k < 5 else "white")
        ax.add_patch(Wedge((0, 0), 1, 90 - 60 * (k + 1), 90 - 60 * k, facecolor=col, edgecolor=NAVY, lw=1.2))
    ax.set_xlim(-1.15, 1.15)
    ax.set_ylim(-1.15, 1.15)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title(r"$\frac{3}{6} + \frac{2}{6} = \frac{5}{6}$", fontsize=10, pad=2)
    return _svg(f)


def f_carre_identite():
    f, ax = fig(2.9, 2.9)
    a, b = 3, 1.6
    ax.add_patch(Rectangle((0, b), a, a, facecolor="#9cc3e6", edgecolor=NAVY, lw=1.2))
    ax.add_patch(Rectangle((a, b), b, a, facecolor="#f5d49a", edgecolor=NAVY, lw=1.2))
    ax.add_patch(Rectangle((0, 0), a, b, facecolor="#f5d49a", edgecolor=NAVY, lw=1.2))
    ax.add_patch(Rectangle((a, 0), b, b, facecolor="#b9e0c4", edgecolor=NAVY, lw=1.2))
    ax.text(a / 2, b + a / 2, "$a^2$", ha="center", va="center", fontsize=15)
    ax.text(a + b / 2, b + a / 2, "$ab$", ha="center", va="center", fontsize=12)
    ax.text(a / 2, b / 2, "$ab$", ha="center", va="center", fontsize=12)
    ax.text(a + b / 2, b / 2, "$b^2$", ha="center", va="center", fontsize=12)
    ax.text(a / 2, a + b + 0.15, "$a$", ha="center", va="bottom", fontsize=12)
    ax.text(a + b / 2, a + b + 0.15, "$b$", ha="center", va="bottom", fontsize=12)
    ax.text(-0.15, b + a / 2, "$a$", ha="right", va="center", fontsize=12)
    ax.text(-0.15, b / 2, "$b$", ha="right", va="center", fontsize=12)
    ax.set_xlim(-0.6, a + b + 0.2)
    ax.set_ylim(-0.2, a + b + 0.6)
    ax.set_aspect("equal")
    ax.axis("off")
    return _svg(f)


# ------------------------------------------------------------------ ch. 2

def f_balance():
    f, ax = fig(4.8, 2.3)
    ax.add_patch(Polygon([[2.15, 0], [2.85, 0], [2.5, 1.6]], closed=True, facecolor=GREY, edgecolor="#555"))
    ax.plot([0.5, 4.5], [1.6, 1.6], color="#555", lw=3.5, solid_capstyle="round")
    for cx, txt, col in ((0.9, "$3x - 7$", "#9cc3e6"), (4.1, "$5$", "#f5d49a")):
        ax.plot([cx - 0.55, cx, cx + 0.55], [0.55, 1.6, 0.55], color="#777", lw=0.9)
        ax.add_patch(Rectangle((cx - 0.65, 0.45), 1.3, 0.1, facecolor="#666"))
        ax.add_patch(Rectangle((cx - 0.45, 0.55), 0.9, 0.45, facecolor=col, edgecolor=NAVY, lw=1, zorder=3))
        ax.text(cx, 0.78, txt, ha="center", va="center", fontsize=12, zorder=4)
    ax.text(2.5, 1.85, "en équilibre : les deux côtés valent la même chose", ha="center", fontsize=9, color=NAVY)
    ax.set_xlim(0, 5)
    ax.set_ylim(-0.05, 2.1)
    ax.set_aspect("equal")
    ax.axis("off")
    return _svg(f)


def f_paraboles_delta():
    f, axs = plt.subplots(1, 3, figsize=(7.0, 2.3))
    xs = np.linspace(-1, 5, 200)
    cases = [
        (lambda x: (x - 1) * (x - 3), r"$\Delta > 0$ : 2 solutions", [1, 3], GREEN),
        (lambda x: (x - 2) ** 2, r"$\Delta = 0$ : 1 solution", [2], ORANGE),
        (lambda x: (x - 2) ** 2 + 1, r"$\Delta < 0$ : aucune", [], RED),
    ]
    for ax, (fn, title, roots, col) in zip(axs, cases):
        axes(ax, (-0.8, 4.8), (-1.6, 4.2), xticks=[], yticks=[], grid=False)
        ax.plot(xs, fn(xs), color=col, lw=2)
        for r in roots:
            ax.plot(r, 0, "o", color=col, ms=6, zorder=5)
        ax.set_title(title, fontsize=9.5, pad=3)
    f.tight_layout(w_pad=1.2)
    return _svg(f)


def f_signe_affine():
    f, ax = fig(4.2, 2.6)
    axes(ax, (-1.5, 5), (-4.5, 4.5), xticks=[-1, 1, 2, 3, 4], yticks=[-4, -2, 2, 4])
    xs = np.linspace(-1.5, 4.5, 50)
    ax.plot(xs, 2 * xs - 4, color=BLUE, lw=2)
    ax.plot(2, 0, "o", color=NAVY, ms=6, zorder=5)
    ax.fill_between(xs, 0, 2 * xs - 4, where=xs >= 2, color=GREEN, alpha=0.18)
    ax.fill_between(xs, 0, 2 * xs - 4, where=xs <= 2, color=RED, alpha=0.18)
    ax.text(3.6, 1.2, "+", color=GREEN, fontsize=18, ha="center", fontweight="bold")
    ax.text(0.6, -1.5, "−", color=RED, fontsize=20, ha="center", fontweight="bold")
    ax.text(4.3, 3.8, "$y = 2x - 4$", color=BLUE, fontsize=10, ha="right")
    ax.text(2.1, -0.6, "racine $x = 2$", fontsize=8.5, color=NAVY)
    return _svg(f)


def f_signe_trinome():
    f, axs = plt.subplots(1, 2, figsize=(6.6, 2.4))
    xs = np.linspace(-1.2, 5.2, 200)
    for ax, s, title in ((axs[0], 1, r"$a > 0$ : $+$ dehors, $-$ entre"), (axs[1], -1, r"$a < 0$ : $-$ dehors, $+$ entre")):
        axes(ax, (-1.3, 5.3), (-3.2, 3.2), xticks=[1, 3], yticks=[], grid=False)
        y = s * (xs - 1) * (xs - 3)
        ax.plot(xs, y, color=BLUE, lw=2)
        ax.fill_between(xs, 0, y, where=y >= 0, color=GREEN, alpha=0.2)
        ax.fill_between(xs, 0, y, where=y <= 0, color=RED, alpha=0.2)
        ax.set_title(title, fontsize=9.5, pad=3)
        ax.set_xticklabels(["$x_1$", "$x_2$"])
    f.tight_layout(w_pad=2)
    return _svg(f)


# ------------------------------------------------------------------ ch. 3

def f_triangle_rect():
    f, ax = fig(3.6, 2.4)
    A, B, C = (0, 0), (4, 0), (4, 2.6)
    ax.add_patch(Polygon([A, B, C], closed=True, facecolor="#eef4fb", edgecolor=NAVY, lw=1.6))
    ax.add_patch(Rectangle((3.7, 0), 0.3, 0.3, fill=False, edgecolor=NAVY, lw=1))
    ax.add_patch(Arc(A, 1.6, 1.6, theta1=0, theta2=np.degrees(np.arctan2(2.6, 4)), color=RED, lw=1.5))
    ax.text(0.95, 0.22, r"$\alpha$", color=RED, fontsize=13)
    ax.text(2, -0.12, "côté adjacent", ha="center", va="top", fontsize=9.5, color=GREEN)
    ax.text(4.12, 1.3, "côté\nopposé", ha="left", va="center", fontsize=9.5, color=ORANGE)
    ax.text(1.75, 1.55, "hypoténuse", ha="center", va="bottom", fontsize=9.5, color=VIOLET, rotation=np.degrees(np.arctan2(2.6, 4)))
    ax.set_xlim(-0.3, 5.3)
    ax.set_ylim(-0.6, 2.9)
    ax.set_aspect("equal")
    ax.axis("off")
    return _svg(f)


def f_cercle_trigo():
    f, ax = fig(3.4, 3.4)
    th = np.radians(55)
    ax.add_patch(Circle((0, 0), 1, fill=False, edgecolor=NAVY, lw=1.5))
    axes(ax, (-1.3, 1.35), (-1.3, 1.35), xticks=[-1, 1], yticks=[-1, 1], grid=False, labels=None)
    M = (np.cos(th), np.sin(th))
    ax.plot([0, M[0]], [0, M[1]], color=NAVY, lw=1.4)
    ax.plot([M[0], M[0]], [0, M[1]], "--", color=GREEN, lw=1.3)
    ax.plot([0, M[0]], [M[1], M[1]], "--", color=ORANGE, lw=1.3)
    ax.plot(*M, "o", color=RED, ms=6, zorder=5)
    ax.text(M[0] + 0.06, M[1] + 0.06, "$M$", color=RED, fontsize=11)
    ax.add_patch(Arc((0, 0), 0.6, 0.6, theta1=0, theta2=55, color=RED, lw=1.4))
    ax.text(0.34, 0.14, r"$\theta$", color=RED, fontsize=12)
    ax.plot([M[0]], [0], "o", color=GREEN, ms=4)
    ax.plot([0], [M[1]], "o", color=ORANGE, ms=4)
    ax.text(M[0], -0.2, r"$\cos\theta$", color=GREEN, ha="center", fontsize=10)
    ax.text(-0.05, M[1], r"$\sin\theta$", color=ORANGE, ha="right", va="center", fontsize=10)
    ax.text(1.02, 0.05, "$(1\\,;\\,0)$", fontsize=8, color="#444")
    ax.set_aspect("equal")
    return _svg(f)


def f_cercle_valeurs():
    f, ax = fig(5.4, 4.6)
    ax.add_patch(Circle((0, 0), 1, fill=False, edgecolor=NAVY, lw=1.4))
    axes(ax, (-1.45, 2.6), (-1.35, 1.35), xticks=[], yticks=[], grid=False, labels=None)
    labels = {
        0: "0", 30: r"$\frac{\pi}{6}$", 45: r"$\frac{\pi}{4}$", 60: r"$\frac{\pi}{3}$", 90: r"$\frac{\pi}{2}$",
        120: r"$\frac{2\pi}{3}$", 135: r"$\frac{3\pi}{4}$", 150: r"$\frac{5\pi}{6}$", 180: r"$\pi$",
        210: r"$-\frac{5\pi}{6}$", 225: r"$-\frac{3\pi}{4}$", 240: r"$-\frac{2\pi}{3}$", 270: r"$-\frac{\pi}{2}$",
        300: r"$-\frac{\pi}{3}$", 315: r"$-\frac{\pi}{4}$", 330: r"$-\frac{\pi}{6}$",
    }
    for d, lab in labels.items():
        t = np.radians(d)
        c, s_ = np.cos(t), np.sin(t)
        ax.plot([0, c], [0, s_], color="#c9d3e3", lw=0.7)
        ax.plot(c, s_, "o", color=RED if d in (30, 45, 60) else NAVY, ms=4.5, zorder=5)
        ax.text(1.2 * c, 1.15 * s_, lab, ha="center", va="center", fontsize=12)
    rows = [(60, r"$\frac{\pi}{3}$ : $\left(\frac{1}{2}\,;\,\frac{\sqrt{3}}{2}\right)$", 0.95),
            (45, r"$\frac{\pi}{4}$ : $\left(\frac{\sqrt{2}}{2}\,;\,\frac{\sqrt{2}}{2}\right)$", 0.6),
            (30, r"$\frac{\pi}{6}$ : $\left(\frac{\sqrt{3}}{2}\,;\,\frac{1}{2}\right)$", 0.25)]
    for d, txt, y in rows:
        t = np.radians(d)
        ax.annotate(txt, xy=(np.cos(t), np.sin(t)), xytext=(1.45, y), fontsize=11, color=RED, va="center",
                    arrowprops=dict(arrowstyle="-", color=RED, lw=0.6))
    ax.text(1.45, -0.3, "(cos ; sin)", fontsize=10, color="#555")
    ax.set_aspect("equal")
    return _svg(f)


def f_quadrants():
    f, ax = fig(3.2, 3.2)
    ax.add_patch(Circle((0, 0), 1, fill=False, edgecolor=NAVY, lw=1.4))
    axes(ax, (-1.3, 1.3), (-1.3, 1.3), xticks=[], yticks=[], grid=False, labels=None)
    txt = [(0.5, 0.5, "cos +\nsin +", GREEN), (-0.5, 0.5, "cos −\nsin +", ORANGE), (-0.5, -0.5, "cos −\nsin −", RED), (0.5, -0.5, "cos +\nsin −", VIOLET)]
    for x, y, t, c in txt:
        ax.text(x, y, t, ha="center", va="center", fontsize=9.5, color=c, fontweight="bold")
    ax.text(0.95, 1.05, "1er quart", fontsize=8, color=GREEN, ha="center")
    ax.text(-0.95, 1.05, "2e quart", fontsize=8, color=ORANGE, ha="center")
    ax.text(-0.95, -1.12, "3e quart", fontsize=8, color=RED, ha="center")
    ax.text(0.95, -1.12, "4e quart", fontsize=8, color=VIOLET, ha="center")
    ax.set_aspect("equal")
    return _svg(f)


def f_symetries():
    f, ax = fig(3.6, 3.6)
    ax.add_patch(Circle((0, 0), 1, fill=False, edgecolor=NAVY, lw=1.4))
    axes(ax, (-1.45, 1.45), (-1.35, 1.35), xticks=[], yticks=[], grid=False, labels=None)
    t = np.radians(35)
    pts = [(t, r"$\theta$", NAVY), (-t, r"$-\theta$", GREEN), (np.pi - t, r"$\pi-\theta$", ORANGE), (np.pi + t, r"$\pi+\theta$", RED)]
    for a, lab, c in pts:
        x, y = np.cos(a), np.sin(a)
        ax.plot([0, x], [0, y], color=c, lw=1)
        ax.plot(x, y, "o", color=c, ms=6, zorder=5)
        ax.text(1.2 * x, 1.18 * y, lab, color=c, ha="center", va="center", fontsize=11)
    ax.plot([np.cos(t), np.cos(t)], [np.sin(-t), np.sin(t)], ":", color="#999")
    ax.plot([-np.cos(t), np.cos(t)], [np.sin(t), np.sin(t)], ":", color="#999")
    ax.set_aspect("equal")
    return _svg(f)


def f_courbes_trigo():
    f, ax = fig(6.4, 2.3)
    xs = np.linspace(-np.pi, 2 * np.pi, 400)
    axes(ax, (-3.4, 6.7), (-1.4, 1.5), xticks=[-np.pi, -np.pi / 2, np.pi / 2, np.pi, 3 * np.pi / 2, 2 * np.pi], yticks=[-1, 1])
    ax.set_xticklabels([r"$-\pi$", r"$-\frac{\pi}{2}$", r"$\frac{\pi}{2}$", r"$\pi$", r"$\frac{3\pi}{2}$", r"$2\pi$"])
    ax.plot(xs, np.cos(xs), color=GREEN, lw=2, label=r"$\cos x$")
    ax.plot(xs, np.sin(xs), color=ORANGE, lw=2, label=r"$\sin x$")
    ax.legend(loc="upper right", fontsize=8.5, frameon=False, ncol=2)
    return _svg(f)


# ------------------------------------------------------------------ ch. 4

def f_ref_fonctions():
    f, axs = plt.subplots(2, 3, figsize=(7.0, 4.3))
    specs = [
        (r"$x^2$", lambda x: x**2, (-2.2, 2.2), (-0.8, 4.2), None),
        (r"$x^3$", lambda x: x**3, (-1.8, 1.8), (-3.5, 3.5), None),
        (r"$\frac{1}{x}$", lambda x: 1 / x, (-3.2, 3.2), (-3.2, 3.2), 0),
        (r"$\sqrt{x}$", lambda x: np.sqrt(x), (-0.8, 4.5), (-0.6, 2.4), "pos"),
        (r"$e^x$", np.exp, (-3, 2), (-0.6, 5), None),
        (r"$\ln x$", np.log, (-0.6, 5), (-2.8, 2), "ln"),
    ]
    for ax, (t, fn, xl, yl, special) in zip(axs.flat, specs):
        axes(ax, xl, yl, xticks=[], yticks=[], grid=False)
        if special == 0:
            for seg in (np.linspace(xl[0], -0.3, 100), np.linspace(0.3, xl[1], 100)):
                ax.plot(seg, fn(seg), color=BLUE, lw=2)
        elif special == "pos":
            xs = np.linspace(0, xl[1], 200)
            ax.plot(xs, fn(xs), color=BLUE, lw=2)
            ax.plot(0, 0, "o", color=BLUE, ms=4)
        elif special == "ln":
            xs = np.linspace(0.06, xl[1], 200)
            ax.plot(xs, fn(xs), color=BLUE, lw=2)
            ax.plot(1, 0, "o", color=RED, ms=4)
            ax.text(1.05, -0.5, "1", fontsize=8, color=RED)
        else:
            xs = np.linspace(*xl, 200)
            ax.plot(xs, fn(xs), color=BLUE, lw=2)
        if t == r"$e^x$":
            ax.plot(0, 1, "o", color=RED, ms=4)
            ax.text(0.12, 1.1, "1", fontsize=8, color=RED)
        ax.set_title(t, fontsize=12, pad=2)
    f.tight_layout(h_pad=1.2, w_pad=1.2)
    return _svg(f)


def f_exp_ln():
    f, ax = fig(3.4, 3.4)
    axes(ax, (-3, 4.5), (-3, 4.5), xticks=[1], yticks=[1])
    xs = np.linspace(-3, 1.5, 200)
    ax.plot(xs, np.exp(xs), color=RED, lw=2, label=r"$e^x$")
    xs = np.linspace(0.05, 4.5, 200)
    ax.plot(xs, np.log(xs), color=BLUE, lw=2, label=r"$\ln x$")
    xs = np.linspace(-3, 4.5, 10)
    ax.plot(xs, xs, "--", color=GREY, lw=1, label="$y = x$ (miroir)")
    ax.plot(0, 1, "o", color=RED, ms=4)
    ax.plot(1, 0, "o", color=BLUE, ms=4)
    ax.legend(loc="lower right", fontsize=8, frameon=False)
    ax.set_aspect("equal")
    return _svg(f)


def f_asymptotes():
    f, ax = fig(4.4, 3.2)
    axes(ax, (-4, 10), (-6, 10), xticks=[3], yticks=[2])
    for seg in (np.linspace(-4, 2.6, 200), np.linspace(3.4, 10, 200)):
        ax.plot(seg, (2 * seg + 1) / (seg - 3), color=BLUE, lw=2)
    ax.axhline(2, color=RED, ls="--", lw=1.2)
    ax.axvline(3, color=GREEN, ls="--", lw=1.2)
    ax.text(9.8, 2.4, "$y = 2$", color=RED, ha="right", fontsize=9.5)
    ax.text(3.2, 9.2, "$x = 3$", color=GREEN, fontsize=9.5)
    ax.text(6, 6.5, r"$f(x) = \frac{2x+1}{x-3}$", color=BLUE, fontsize=10)
    return _svg(f)


# ------------------------------------------------------------------ ch. 5

def f_tangente():
    f, ax = fig(4.2, 3.0)
    axes(ax, (-0.8, 3.6), (-0.8, 5), xticks=[1, 2, 3], yticks=[1, 2, 3, 4])
    xs = np.linspace(-0.8, 3.4, 200)
    ax.plot(xs, xs**2 / 2 + 0.0, color=BLUE, lw=2, label=r"courbe $y = \frac{x^2}{2}$")
    # tangente en 2 : pente 2, point (2 ; 2)
    ax.plot(xs, 2 * (xs - 2) + 2, color=RED, lw=1.5, label="tangente en $x = 2$")
    ax.plot(2, 2, "o", color=RED, ms=6, zorder=5)
    ax.plot([2, 3], [2, 2], color=GREEN, lw=1.5)
    ax.plot([3, 3], [2, 4], color=GREEN, lw=1.5)
    ax.text(2.5, 1.65, "+1", color=GREEN, ha="center", fontsize=9)
    ax.text(3.08, 3, "+2", color=GREEN, fontsize=9)
    ax.legend(loc="upper left", fontsize=8, frameon=False)
    return _svg(f)


def f_variations():
    f, ax = fig(4.6, 3.0)
    axes(ax, (-2.4, 2.4), (-2.5, 4.2), xticks=[-1, 1], yticks=[-1, 1, 3])
    xs = np.linspace(-2.25, 2.25, 300)
    y = xs**3 - 3 * xs + 1
    ax.plot(xs, y, color=BLUE, lw=2)
    ax.plot(-1, 3, "o", color=GREEN, ms=6)
    ax.plot(1, -1, "o", color=RED, ms=6)
    ax.text(-1, 3.35, "max : $f(-1) = 3$", ha="center", fontsize=8.5, color=GREEN)
    ax.text(1, -1.75, "min : $f(1) = -1$", ha="center", fontsize=8.5, color=RED)
    ax.text(-1.95, 0.6, "↗\n$f'>0$", fontsize=9, color=GREEN, ha="center")
    ax.text(0.1, 1.6, "↘  $f'<0$", fontsize=9, color=RED, ha="center")
    ax.text(1.95, 1.2, "↗\n$f'>0$", fontsize=9, color=GREEN, ha="center")
    return _svg(f)


def f_optim_rect():
    f, axs = plt.subplots(1, 2, figsize=(6.6, 2.5), gridspec_kw={"width_ratios": [1, 1.3]})
    ax = axs[0]
    ax.add_patch(Rectangle((0, 0), 3.2, 1.8, facecolor="#eef4fb", edgecolor=NAVY, lw=1.6))
    ax.text(1.6, -0.12, "$x$", ha="center", va="top", fontsize=12)
    ax.text(3.32, 0.9, "$10 - x$", ha="left", va="center", fontsize=12)
    ax.text(1.6, 0.9, "aire\n$A = x(10-x)$", ha="center", va="center", fontsize=10)
    ax.set_xlim(-0.2, 4.7)
    ax.set_ylim(-0.6, 2.1)
    ax.set_aspect("equal")
    ax.axis("off")
    ax = axs[1]
    axes(ax, (-0.5, 11), (-3, 29), xticks=[5, 10], yticks=[25], labels=("x", "A"))
    xs = np.linspace(0, 10, 200)
    ax.plot(xs, xs * (10 - xs), color=BLUE, lw=2)
    ax.plot(5, 25, "o", color=GREEN, ms=6)
    ax.plot([5, 5], [0, 25], ":", color=GREEN)
    ax.text(5.3, 26.5, "max", color=GREEN, fontsize=9)
    f.tight_layout(w_pad=2)
    return _svg(f)


# ------------------------------------------------------------------ ch. 6

def f_aire_rect():
    f, axs = plt.subplots(1, 2, figsize=(6.6, 2.5))
    fn = lambda x: 0.25 * x**2 + 0.5
    for ax, n in zip(axs, (4, 16)):
        axes(ax, (-0.3, 3.4), (-0.3, 3.2), xticks=[0, 3], yticks=[], grid=False)
        dx = 3 / n
        for k in range(n):
            x0 = k * dx
            ax.add_patch(Rectangle((x0, 0), dx, fn(x0 + dx / 2), facecolor="#f5d49a", edgecolor=ORANGE, lw=0.6))
        xs = np.linspace(0, 3.3, 200)
        ax.plot(xs, fn(xs), color=BLUE, lw=2)
        ax.set_title(f"{n} rectangles", fontsize=9.5, pad=2)
    f.tight_layout(w_pad=2)
    return _svg(f)


def f_aire_sous_courbe():
    f, ax = fig(4.0, 2.8)
    axes(ax, (-0.5, 4.2), (-0.6, 5), xticks=[1, 3], yticks=[])
    ax.set_xticklabels(["$a$", "$b$"])
    xs = np.linspace(-0.3, 4, 200)
    fn = lambda x: 0.35 * (x - 2) ** 3 - 0.6 * (x - 2) + 2.6
    ax.plot(xs, fn(xs), color=BLUE, lw=2)
    xx = np.linspace(1, 3, 100)
    ax.fill_between(xx, 0, fn(xx), color=LIGHT, edgecolor=BLUE, lw=0)
    ax.text(2, 1.2, r"$\int_a^b f(x)\,\mathrm{d}x$", ha="center", fontsize=12, color=NAVY)
    ax.text(3.7, fn(3.7) - 0.1, "$C_f$", color=BLUE, fontsize=10, ha="left")
    return _svg(f)


def f_aire_signe():
    f, ax = fig(4.2, 2.8)
    axes(ax, (-0.3, 6.6), (-1.5, 1.6), xticks=[np.pi, 2 * np.pi], yticks=[-1, 1])
    ax.set_xticklabels([r"$\pi$", r"$2\pi$"])
    xs = np.linspace(0, 6.4, 300)
    ax.plot(xs, np.sin(xs), color=BLUE, lw=2)
    x1 = np.linspace(0, np.pi, 100)
    x2 = np.linspace(np.pi, 2 * np.pi, 100)
    ax.fill_between(x1, 0, np.sin(x1), color=GREEN, alpha=0.25)
    ax.fill_between(x2, 0, np.sin(x2), color=RED, alpha=0.25)
    ax.text(np.pi / 2, 0.35, "+2", ha="center", color=GREEN, fontsize=12, fontweight="bold")
    ax.text(3 * np.pi / 2, -0.5, "−2", ha="center", color=RED, fontsize=12, fontweight="bold")
    return _svg(f)


def f_aire_entre():
    f, ax = fig(3.4, 3.0)
    axes(ax, (-0.3, 1.4), (-0.2, 1.45), xticks=[1], yticks=[1])
    xs = np.linspace(0, 1.3, 200)
    ax.plot(xs, xs, color=RED, lw=2, label="$y = x$ (dessus)")
    ax.plot(xs, xs**2, color=BLUE, lw=2, label="$y = x^2$ (dessous)")
    xx = np.linspace(0, 1, 100)
    ax.fill_between(xx, xx**2, xx, color=VIOLET, alpha=0.25)
    ax.legend(loc="upper left", fontsize=8, frameon=False)
    return _svg(f)


# ------------------------------------------------------------------ ch. 7

def f_vecteur_coord():
    f, ax = fig(3.8, 3.2)
    axes(ax, (-0.5, 6.5), (-2, 4.5), xticks=range(1, 7), yticks=range(-1, 5))
    A, B = (2, -1), (5, 3)
    arrow(ax, A, B, NAVY)
    ax.plot([A[0], B[0]], [A[1], A[1]], "--", color=GREEN, lw=1.3)
    ax.plot([B[0], B[0]], [A[1], B[1]], "--", color=ORANGE, lw=1.3)
    ax.text(3.5, -1.45, "+3", color=GREEN, ha="center", fontsize=10)
    ax.text(5.15, 1, "+4", color=ORANGE, fontsize=10)
    ax.plot(*A, "o", color=NAVY, ms=5)
    ax.text(A[0] - 0.2, A[1] + 0.2, "$A(2\\,;\\,-1)$", ha="right", fontsize=9)
    ax.text(B[0] - 0.15, B[1] + 0.2, "$B(5\\,;\\,3)$", ha="right", fontsize=9)
    ax.text(3.0, 1.6, r"$\overrightarrow{AB}\,(3\,;\,4)$", color=NAVY, fontsize=10, ha="right")
    return _svg(f)


def f_chasles():
    f, ax = fig(3.6, 2.4)
    A, B, C = (0, 0), (3, 1.8), (5, 0.3)
    arrow(ax, A, B, BLUE)
    arrow(ax, B, C, GREEN)
    arrow(ax, A, C, RED, lw=2.2)
    for p, n, dx, dy in ((A, "A", -0.25, 0), (B, "B", 0, 0.2), (C, "C", 0.25, 0)):
        ax.plot(*p, "o", color="#333", ms=4)
        ax.text(p[0] + dx, p[1] + dy, n, fontsize=11, ha="center")
    ax.text(1.2, 1.2, r"$\overrightarrow{AB}$", color=BLUE, fontsize=11)
    ax.text(4.2, 1.2, r"$\overrightarrow{BC}$", color=GREEN, fontsize=11)
    ax.text(2.5, -0.35, r"$\overrightarrow{AC} = \overrightarrow{AB} + \overrightarrow{BC}$", color=RED, fontsize=10, ha="center")
    ax.set_xlim(-0.6, 5.6)
    ax.set_ylim(-0.7, 2.3)
    ax.set_aspect("equal")
    ax.axis("off")
    return _svg(f)


def f_somme_vect():
    f, ax = fig(3.6, 2.6)
    O, U, V = np.array((0, 0)), np.array((3, 0.8)), np.array((1, 1.8))
    arrow(ax, O, U, BLUE)
    arrow(ax, O, V, GREEN)
    arrow(ax, U, U + V, GREEN, lw=1, style="-|>")
    arrow(ax, V, U + V, BLUE, lw=1, style="-|>")
    arrow(ax, O, U + V, RED, lw=2.2)
    ax.text(1.6, 0.1, r"$\vec u$", color=BLUE, fontsize=12)
    ax.text(0.2, 1.1, r"$\vec v$", color=GREEN, fontsize=12)
    ax.text(2.1, 1.8, r"$\vec u + \vec v$", color=RED, fontsize=12, ha="right")
    ax.set_xlim(-0.3, 4.4)
    ax.set_ylim(-0.3, 2.9)
    ax.set_aspect("equal")
    ax.axis("off")
    return _svg(f)


def f_produit_scalaire():
    f, axs = plt.subplots(1, 3, figsize=(6.8, 2.0))
    cases = [(35, r"$\vec u\cdot\vec v > 0$" + "\nangle aigu", GREEN), (90, r"$\vec u\cdot\vec v = 0$" + "\nangle droit", ORANGE), (140, r"$\vec u\cdot\vec v < 0$" + "\nangle obtus", RED)]
    for ax, (deg, t, c) in zip(axs, cases):
        arrow(ax, (0, 0), (1.6, 0), BLUE)
        th = np.radians(deg)
        arrow(ax, (0, 0), (1.3 * np.cos(th), 1.3 * np.sin(th)), c)
        ax.add_patch(Arc((0, 0), 0.7, 0.7, theta1=0, theta2=deg, color="#555", lw=1))
        ax.text(1.5, -0.25, r"$\vec u$", color=BLUE, fontsize=11)
        ax.text(1.3 * np.cos(th) + 0.08, 1.3 * np.sin(th), r"$\vec v$", color=c, fontsize=11)
        ax.set_title(t, fontsize=9, pad=2)
        ax.set_xlim(-1.2, 1.9)
        ax.set_ylim(-0.4, 1.4)
        ax.set_aspect("equal")
        ax.axis("off")
    f.tight_layout()
    return _svg(f)


def f_produit_vectoriel():
    f, ax = fig(3.2, 2.8)
    O = np.array((0, 0))
    u, v, w = np.array((2.4, -0.3)), np.array((1.0, 0.9)), np.array((0, 2.2))
    ax.add_patch(Polygon([O, u, u + v, v], closed=True, facecolor=LIGHT, edgecolor="none", alpha=0.9))
    arrow(ax, O, u, BLUE)
    arrow(ax, O, v, GREEN)
    arrow(ax, O, w, RED, lw=2.2)
    ax.text(2.3, -0.6, r"$\vec u$", color=BLUE, fontsize=12)
    ax.text(1.05, 1.0, r"$\vec v$", color=GREEN, fontsize=12)
    ax.text(0.12, 2.1, r"$\vec u \wedge \vec v$", color=RED, fontsize=12)
    ax.text(1.75, 0.2, "aire =\n" + r"$\|\vec u \wedge \vec v\|$", fontsize=8.5, color=NAVY, ha="center")
    ax.add_patch(Rectangle((0, 0), 0.18, 0.18, fill=False, edgecolor="#555", lw=0.8))
    ax.set_xlim(-0.4, 3.7)
    ax.set_ylim(-0.8, 2.5)
    ax.set_aspect("equal")
    ax.axis("off")
    return _svg(f)


# ------------------------------------------------------------------ ch. 8

def f_plan_complexe():
    f, ax = fig(3.6, 3.2)
    axes(ax, (-1, 4.2), (-1, 3.4), xticks=[3], yticks=[2], labels=("Re", "Im"))
    a, b = 3, 2
    arrow(ax, (0, 0), (a, b), NAVY)
    ax.plot([a, a], [0, b], "--", color=GREEN, lw=1.2)
    ax.plot([0, a], [b, b], "--", color=ORANGE, lw=1.2)
    ax.plot(a, b, "o", color=RED, ms=6, zorder=5)
    ax.text(a + 0.1, b + 0.15, "$M(z)$, $z = 3 + 2i$", fontsize=9.5, color=RED)
    ax.add_patch(Arc((0, 0), 1.4, 1.4, theta1=0, theta2=np.degrees(np.arctan2(b, a)), color=VIOLET, lw=1.4))
    ax.text(0.8, 0.22, r"$\theta = \arg z$", fontsize=9, color=VIOLET)
    ax.text(1.1, 1.15, r"$r = |z|$", fontsize=9.5, color=NAVY, rotation=np.degrees(np.arctan2(b, a)), ha="center")
    ax.set_xticklabels(["$a = 3$"])
    ax.set_yticklabels(["$b = 2$"])
    return _svg(f)


def f_conjugue():
    f, ax = fig(3.0, 3.0)
    axes(ax, (-0.8, 3.8), (-2.8, 2.8), xticks=[], yticks=[], labels=("Re", "Im"))
    ax.plot(3, 2, "o", color=NAVY, ms=6)
    ax.plot(3, -2, "o", color=RED, ms=6)
    ax.plot([3, 3], [-2, 2], ":", color="#999")
    ax.text(2.9, 2.3, "$z = a + ib$", ha="right", fontsize=9.5, color=NAVY)
    ax.text(2.9, -2.6, r"$\bar z = a - ib$", ha="right", fontsize=9.5, color=RED)
    return _svg(f)


def f_rotation_i():
    f, ax = fig(3.2, 3.2)
    axes(ax, (-2.8, 3.2), (-1, 3.4), xticks=[], yticks=[], labels=("Re", "Im"))
    z = np.array((2.5, 1))
    iz = np.array((-1, 2.5))
    arrow(ax, (0, 0), z, NAVY)
    arrow(ax, (0, 0), iz, RED)
    ax.add_patch(Arc((0, 0), 1.2, 1.2, theta1=np.degrees(np.arctan2(1, 2.5)), theta2=np.degrees(np.arctan2(2.5, -1)), color=GREEN, lw=1.4))
    ax.text(2.55, 1.1, "$z$", fontsize=12, color=NAVY)
    ax.text(-1.1, 2.6, "$iz$", fontsize=12, color=RED, ha="right")
    ax.text(0.35, 0.8, "+90°", fontsize=9, color=GREEN)
    ax.set_aspect("equal")
    return _svg(f)


def f_racines_conj():
    f, ax = fig(3.0, 3.0)
    axes(ax, (-0.8, 3.5), (-3.6, 3.6), xticks=[2], yticks=[-3, 3], labels=("Re", "Im"))
    ax.plot(2, 3, "o", color=NAVY, ms=6)
    ax.plot(2, -3, "o", color=RED, ms=6)
    ax.text(2.15, 3.1, "$2 + 3i$", fontsize=9.5, color=NAVY)
    ax.text(2.15, -3.3, "$2 - 3i$", fontsize=9.5, color=RED)
    ax.plot([2, 2], [-3, 3], ":", color="#999")
    return _svg(f)


def f_impedance():
    f, ax = fig(3.4, 2.8)
    axes(ax, (-0.5, 4.2), (-0.5, 4.8), xticks=[3], yticks=[4], labels=("R", "X"))
    arrow(ax, (0, 0), (3, 0), GREEN, lw=1.5)
    arrow(ax, (3, 0), (3, 4), ORANGE, lw=1.5)
    arrow(ax, (0, 0), (3, 4), NAVY, lw=2)
    ax.add_patch(Arc((0, 0), 1.4, 1.4, theta1=0, theta2=53.13, color=VIOLET, lw=1.3))
    ax.text(0.8, 0.25, r"$\varphi$", color=VIOLET, fontsize=12)
    ax.text(1.5, -0.35, "$R = 30$", color=GREEN, ha="center", fontsize=9)
    ax.text(3.1, 2, r"$L\omega = 40$", color=ORANGE, fontsize=9)
    ax.text(1.2, 2.2, r"$|Z| = 50$", color=NAVY, fontsize=9.5, ha="center", rotation=53)
    ax.set_xticklabels(["30"])
    ax.set_yticklabels(["40"])
    return _svg(f)


def get(key):
    if key not in _cache:
        fn = globals().get("f_" + key)
        if fn is None:
            raise SystemExit(f"Figure inconnue : {key}")
        _cache[key] = fn()
    return _cache[key]


if __name__ == "__main__":
    import sys
    from pathlib import Path

    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("figs")
    out.mkdir(exist_ok=True)
    for k in [n[2:] for n in list(globals()) if n.startswith("f_")]:
        (out / f"{k}.svg").write_text(get(k))
        print(k)
