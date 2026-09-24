"""Générateurs d'« automatismes » : séries de calculs courts avec réponses exactes.

Chaque générateur g_nom(rng) renvoie (question, réponse) en balisage du guide
(formules entre $...$). Les réponses sont calculées (fractions exactes / sympy)
et, pour les calculs de dérivées et primitives, vérifiées avec sympy.
"""
import random
from fractions import Fraction as F

import sympy as sp

X = sp.Symbol("x", real=True)
Z = sp.Symbol("z")

# --------------------------------------------------------------- formatage


def fl(r):
    """Fraction -> LaTeX."""
    r = F(r)
    if r.denominator == 1:
        return str(r.numerator)
    s = "-" if r < 0 else ""
    return f"{s}\\frac{{{abs(r.numerator)}}}{{{r.denominator}}}"


def fp(r):
    """Fraction -> LaTeX avec parenthèses si négative."""
    r = F(r)
    s = fl(r)
    if r < 0:
        return f"({s})" if r.denominator == 1 else f"\\left({s}\\right)"
    return s


def cm(c, body):
    """Coefficient c devant body (1 et -1 omis)."""
    c = F(c)
    if c == 1:
        return body
    if c == -1:
        return "-" + body
    if c.denominator != 1:
        return fl(c) + body
    return f"{c.numerator}{body}"


def poly(coefs, var="x"):
    deg = len(coefs) - 1
    out = ""
    for i, c in enumerate(coefs):
        c = F(c)
        p = deg - i
        if c == 0:
            continue
        a = abs(c)
        if p == 0:
            body = fl(a)
        else:
            mon = var if p == 1 else f"{var}^{{{p}}}"
            body = mon if a == 1 else fl(a) + mon
        if not out:
            out = ("-" if c < 0 else "") + body
        else:
            out += (" - " if c < 0 else " + ") + body
    return out or "0"


def lin(a, b, var="x"):
    return poly([a, b], var)


def fset(vals):
    vals = sorted(set(vals), key=lambda v: float(sp.N(v)) if not isinstance(v, (int, F)) else float(v))
    if not vals:
        return "\\varnothing"
    return "\\{" + "\\,;\\,".join(fl(v) if isinstance(v, (int, F)) else sp.latex(v) for v in vals) + "\\}"


def ivl(a, b, lc, rc):
    """Intervalle à la française ; a/b peuvent être '-inf' / '+inf'."""
    L = "-\\infty" if a == "-inf" else (fl(a) if isinstance(a, (int, F)) else a)
    R = "+\\infty" if b == "+inf" else (fl(b) if isinstance(b, (int, F)) else b)
    lb = "[" if lc and a != "-inf" else "]"
    rb = "]" if rc and b != "+inf" else "["
    return f"\\mathopen{{{lb}}}{L}\\,;\\,{R}\\mathclose{{{rb}}}"


def ang(r):
    """r * pi -> LaTeX."""
    r = F(r)
    if r == 0:
        return "0"
    s = "-" if r < 0 else ""
    r = abs(r)
    p, q = r.numerator, r.denominator
    num = "\\pi" if p == 1 else f"{p}\\pi"
    return s + (num if q == 1 else f"\\frac{{{num}}}{{{q}}}")


def sx(e):
    """Expression sympy -> LaTeX (ln, pas log)."""
    return sp.latex(e, ln_notation=True).replace("\\log", "\\ln")


def cz(a, b):
    """a + bi -> LaTeX."""
    a, b = F(a), F(b)
    if b == 0:
        return fl(a)
    if b == 1:
        bi = "i"
    elif b == -1:
        bi = "-i"
    else:
        bi = fl(b) + "i"
    if a == 0:
        return bi
    if b < 0:
        return fl(a) + " - " + bi[1:]
    return fl(a) + " + " + bi


def nz(rng, lo, hi, exclude=(0,)):
    while True:
        v = rng.randint(lo, hi)
        if v not in exclude:
            return v


def M(s):
    return f"${s}$"


# --------------------------------------------------------------- chapitre 0

def g_signes_add(rng):
    a, b = nz(rng, -15, 15), nz(rng, -15, 15)
    kind = rng.choice(["+", "-", "--", "+-"])
    if kind == "+":
        q, r = f"{a} + {fp(b)}" if b < 0 else f"{a} + {b}", a + b
    elif kind == "-":
        q, r = f"{a} - {b}" if b > 0 else f"{a} - {fp(b)}", a - b
    elif kind == "--":
        b = -abs(b)
        q, r = f"{a} - {fp(b)}", a - b
    else:
        q, r = f"{a} + {fp(-abs(b))}", a - abs(b)
    return M(q), M(fl(r))


def g_signes_mul(rng):
    k = rng.choice([2, 2, 3, "div"])
    if k == "div":
        b = nz(rng, -9, 9, (0, 1, -1))
        r = nz(rng, -9, 9)
        a = b * r
        return M(f"{fp(a)} \\div {fp(b)}"), M(fl(r))
    vals = [nz(rng, -9, 9, (0, 1)) for _ in range(k)]
    if all(v > 0 for v in vals):
        vals[0] = -vals[0]
    r = 1
    for v in vals:
        r *= v
    return M(" \\times ".join(fp(v) for v in vals)), M(fl(r))


def g_priorites(rng):
    t = rng.randint(1, 8)
    a, b, c, d = (rng.randint(1, 9) for _ in range(4))
    if t == 1:
        q, r = f"{a} + {b} \\times {c}", a + b * c
    elif t == 2:
        q, r = f"{a} - {b} \\times ({c} - {d})", a - b * (c - d)
    elif t == 3:
        q, r = f"({a} - {b})^{{2}} - {c}", (a - b) ** 2 - c
    elif t == 4:
        q, r = f"-{a}^{{2}} + {b}", -(a**2) + b
    elif t == 5:
        a = rng.randint(1, 4)
        q, r = f"{a} \\times ({b} - {c})^{{2}}", a * (b - c) ** 2
    elif t == 6:
        q, r = f"{a} - ({b} - {c}) \\times {d}", a - (b - c) * d
    elif t == 7:
        c = rng.randint(2, 5)
        s = c * rng.randint(1, 6)
        a = rng.randint(1, s - 1) if s > 1 else 1
        b = s - a
        q, r = f"\\dfrac{{{a} + {b}}}{{{c}}} - {d}", F(a + b, c) - d
    else:
        q, r = f"({a} - {b + a}) \\times ({c} - {c + d})", (a - (b + a)) * (c - (c + d))
    return M(q), M(fl(r))


def g_substitution(rng):
    coefs = [nz(rng, -3, 3), rng.randint(-5, 5), rng.randint(-6, 6)]
    val = rng.choice([-3, -2, -1, 2, 3, F(1, 2), F(-1, 2)])
    r = coefs[0] * val**2 + coefs[1] * val + coefs[2]
    return M(poly(coefs)) + " pour " + M(f"x = {fl(val)}"), M(fl(r))


def g_intervalles(rng):
    a = rng.randint(-6, 6)
    b = a + rng.randint(1, 8)
    k = rng.randint(1, 6)
    if k == 1:
        return M(f"x > {a}"), M(ivl(a, "+inf", False, False))
    if k == 2:
        return M(f"x \\le {a}"), M(ivl("-inf", a, False, True))
    if k == 3:
        return M(f"{a} < x \\le {b}"), M(ivl(a, b, False, True))
    if k == 4:
        return M(f"{a} \\le x < {b}"), M(ivl(a, b, True, False))
    if k == 5:
        return M(f"x < {a} \\text{{ ou }} x \\ge {b}"), M(ivl("-inf", a, False, False) + " \\cup " + ivl(b, "+inf", True, False))
    return M(f"x \\ge {a}"), M(ivl(a, "+inf", True, False))


# --------------------------------------------------------------- chapitre 1

DEN = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15]


def rfrac(rng, dens=DEN, neg=False):
    from math import gcd

    d = rng.choice(dens)
    n = rng.randint(1, 2 * d)
    while gcd(n, d) != 1:
        n = rng.randint(1, 2 * d)
    if neg and rng.random() < 0.35:
        n = -n
    return F(n, d), (n, d)


def raw(n, d):
    s = "-" if n < 0 else ""
    return f"{s}\\frac{{{abs(n)}}}{{{d}}}"


def g_frac_simpl(rng):
    p = F(rng.randint(1, 12), rng.randint(2, 13))
    while p.denominator == 1:
        p = F(rng.randint(1, 12), rng.randint(2, 13))
    k = rng.randint(2, 9)
    n, d = p.numerator * k, p.denominator * k
    return M(f"\\frac{{{n}}}{{{d}}}"), M(fl(p))


def g_frac_add(rng):
    while True:
        (p, (n1, d1)), (q, (n2, d2)) = rfrac(rng), rfrac(rng)
        if d1 != d2:
            break
    op = rng.choice(["+", "-"])
    r = p + q if op == "+" else p - q
    return M(f"{raw(n1, d1)} {op} {raw(n2, d2)}"), M(fl(r))


def g_frac_mul(rng):
    (p, (n1, d1)), (q, (n2, d2)) = rfrac(rng, neg=True), rfrac(rng)
    if rng.random() < 0.5:
        return M(f"{raw(n1, d1)} \\times {raw(n2, d2)}"), M(fl(p * q))
    return M(f"{raw(n1, d1)} \\div {raw(n2, d2)}"), M(fl(p / q))


def g_frac_mixte(rng):
    t = rng.randint(1, 4)
    (p, (n1, d1)), (q, (n2, d2)), (s, (n3, d3)) = rfrac(rng), rfrac(rng), rfrac(rng)
    k = rng.randint(1, 5)
    if t == 1:
        return M(f"{k} - {raw(n1, d1)}"), M(fl(k - p))
    if t == 2:
        return M(f"{raw(n1, d1)} + {raw(n2, d2)} \\times {raw(n3, d3)}"), M(fl(p + q * s))
    if t == 3:
        return M(f"\\dfrac{{{raw(n1, d1)}}}{{{raw(n2, d2)}}}"), M(fl(p / q))
    return M(f"\\left({raw(n1, d1)} - {raw(n2, d2)}\\right) \\times {k}"), M(fl((p - q) * k))


def g_puiss_num(rng):
    t = rng.randint(1, 6)
    if t == 1:
        a, n = rng.choice([2, 3, 5, 10]), rng.randint(1, 3)
        return M(f"{a}^{{-{n}}}"), M(fl(F(1, a**n)))
    if t == 2:
        a, b = rng.randint(1, 4), rng.randint(2, 5)
        if a == b:
            b += 1
        n = rng.randint(1, 2)
        return M(f"\\left(\\frac{{{a}}}{{{b}}}\\right)^{{-{n}}}"), M(fl(F(b, a) ** n))
    if t == 3:
        a, n = rng.randint(2, 5), rng.randint(2, 4)
        return M(f"(-{a})^{{{n}}}"), M(fl((-a) ** n))
    if t == 4:
        a, n = rng.randint(2, 5), rng.randint(2, 3)
        return M(f"-{a}^{{{n}}}"), M(fl(-(a**n)))
    if t == 5:
        p, q, r = rng.randint(2, 7), rng.randint(-4, 3), rng.randint(1, 6)
        return M(f"\\dfrac{{2^{{{p}}} \\times 2^{{{q}}}}}{{2^{{{r}}}}}"), M(fl(F(2) ** (p + q - r)))
    a = rng.randint(2, 12)
    return M(f"{a}^{{0}} + {a}^{{1}}"), M(fl(1 + a))


def xpow(c, n):
    if n == 0:
        return fl(c)
    body = "x" if n == 1 else f"x^{{{n}}}"
    return cm(c, body)


def g_puiss_lit(rng):
    t = rng.randint(1, 5)
    p, q = rng.randint(2, 7), rng.randint(2, 6)
    if t == 1:
        return M(f"x^{{{p}}} \\times x^{{{q}}}"), M(xpow(1, p + q))
    if t == 2:
        return M(f"\\dfrac{{x^{{{p + q}}}}}{{x^{{{q}}}}}"), M(xpow(1, p))
    if t == 3:
        return M(f"\\left(x^{{{p}}}\\right)^{{{q}}}"), M(xpow(1, p * q))
    if t == 4:
        c, n, e = rng.randint(2, 3), rng.randint(2, 3), rng.randint(1, 3)
        return M(f"\\left({c}x^{{{e}}}\\right)^{{{n}}}"), M(xpow(c**n, e * n))
    a, b, cc = rng.randint(2, 5), -rng.randint(1, 6), -rng.randint(1, 6)
    n = a + b - cc
    ans = xpow(1, n) if n >= 0 else f"\\dfrac{{1}}{{{xpow(1, -n)}}}"
    return M(f"\\dfrac{{x^{{{a}}} \\times x^{{{b}}}}}{{x^{{{cc}}}}}"), M(ans)


def sq_simplify(n):
    k, m = 1, n
    for f in range(2, 20):
        while m % (f * f) == 0:
            k *= f
            m //= f * f
    return k, m


def rt(k, m):
    if m == 1:
        return str(k)
    return (f"{k}" if k != 1 else "") + f"\\sqrt{{{m}}}"


def g_racines(rng):
    t = rng.randint(1, 3)
    if t == 1:
        m = rng.choice([2, 3, 5, 6, 7])
        k = rng.randint(2, 7)
        n = k * k * m
        return M(f"\\sqrt{{{n}}}"), M(rt(k, m))
    if t == 2:
        m = rng.choice([2, 3, 5])
        k1, k2 = rng.sample(range(1, 6), 2)
        s = k1 + k2 if rng.random() < 0.6 else k1 - k2
        op = "+" if s == k1 + k2 else "-"
        q = f"\\sqrt{{{k1 * k1 * m}}} {op} \\sqrt{{{k2 * k2 * m}}}"
        if s == 0:
            return M(q), M("0")
        if s < 0:
            return M(q), M("-" + rt(-s, m))
        return M(q), M(rt(s, m))
    a, b = rng.choice([(2, 8), (3, 12), (2, 18), (5, 20), (3, 27), (6, 24), (2, 32), (7, 28)])
    return M(f"\\sqrt{{{a}}} \\times \\sqrt{{{b}}}"), M(str(int((a * b) ** 0.5)))


def g_rac_denom(rng):
    m = rng.choice([2, 3, 5, 6, 7])
    t = rng.randint(1, 3)
    if t == 1:
        k = m * rng.randint(1, 4)
        # k / sqrt(m) = k sqrt(m) / m
        r = F(k, m)
        if r.denominator == 1:
            return M(f"\\dfrac{{{k}}}{{\\sqrt{{{m}}}}}"), M(rt(r.numerator, m))
        return M(f"\\dfrac{{{k}}}{{\\sqrt{{{m}}}}}"), M(f"\\dfrac{{{rt(r.numerator, m)}}}{{{r.denominator}}}")
    if t == 2:
        return M(f"\\dfrac{{1}}{{\\sqrt{{{m}}}}}"), M(f"\\dfrac{{\\sqrt{{{m}}}}}{{{m}}}")
    a = rng.randint(1, 5)
    d = rng.randint(2, 4)
    r = F(a, d * m)
    num = rt(r.numerator, m)
    return M(f"\\dfrac{{{a}}}{{{d}\\sqrt{{{m}}}}}"), M(num if r.denominator == 1 else f"\\dfrac{{{num}}}{{{r.denominator}}}")


def g_dev_simple(rng):
    k = nz(rng, -6, 6, (0, 1))
    a, b = nz(rng, -5, 5), nz(rng, -9, 9)
    if rng.random() < 0.3:
        kk = cm(k, "x")
        return M(f"{kk}({lin(a, b)})"), M(poly([k * a, k * b, 0]))
    return M(f"{k}({lin(a, b)})"), M(lin(k * a, k * b))


def g_dev_double(rng):
    a, b, c, d = nz(rng, -3, 3), nz(rng, -7, 7), nz(rng, -3, 3), nz(rng, -7, 7)
    if rng.random() < 0.5:
        a, c = 1, 1
    return M(f"({lin(a, b)})({lin(c, d)})"), M(poly([a * c, a * d + b * c, b * d]))


def g_dev_id(rng):
    a, b = rng.randint(1, 5), rng.randint(1, 9)
    t = rng.randint(1, 3)
    if t == 1:
        return M(f"({lin(a, b)})^{{2}}"), M(poly([a * a, 2 * a * b, b * b]))
    if t == 2:
        return M(f"({lin(a, -b)})^{{2}}"), M(poly([a * a, -2 * a * b, b * b]))
    return M(f"({lin(a, b)})({lin(a, -b)})"), M(poly([a * a, 0, -b * b]))


def g_dev_mix(rng):
    t = rng.randint(1, 3)
    if t == 1:
        a, b, c = nz(rng, -5, 5), nz(rng, -5, 5), nz(rng, -5, 5)
        # (x+a)^2 - (x+b)(x+c)
        co = [0, 2 * a - b - c, a * a - b * c]
        return M(f"({lin(1, a)})^{{2}} - ({lin(1, b)})({lin(1, c)})"), M(poly(co[1:]))
    if t == 2:
        p, q, r, s = nz(rng, 2, 6), nz(rng, -6, 6), nz(rng, 2, 6), nz(rng, -6, 6)
        return M(f"{p}({lin(1, q)}) - {r}({lin(1, s)})"), M(lin(p - r, p * q - r * s))
    a, b = nz(rng, 1, 4), nz(rng, -5, 5)
    # (ax+b)^2 - (ax-b)^2 = 4abx
    return M(f"({lin(a, b)})^{{2}} - ({lin(a, -b)})^{{2}}"), M(lin(4 * a * b, 0))


def g_fact_commun(rng):
    t = rng.randint(1, 3)
    k = rng.randint(2, 6)
    if t == 1:
        a, b = rng.randint(1, 7), nz(rng, -9, 9)
        from math import gcd

        while gcd(a, abs(b)) != 1:
            b = nz(rng, -9, 9)
        return M(lin(k * a, k * b)), M(f"{k}({lin(a, b)})")
    if t == 2:
        b = nz(rng, -9, 9)
        return M(poly([1, b, 0])), M(f"x({lin(1, b)})")
    a, b = rng.randint(1, 5), nz(rng, -7, 7)
    from math import gcd

    while gcd(a, abs(b)) != 1:
        b = nz(rng, -7, 7)
    return M(poly([k * a, k * b, 0, 0])), M(f"{k}x^{{2}}({lin(a, b)})")


def g_fact_id(rng):
    a, b = rng.randint(1, 5), rng.randint(1, 9)
    from math import gcd

    while gcd(a, b) != 1:
        b = rng.randint(1, 9)
    t = rng.randint(1, 3)
    if t == 1:
        return M(poly([a * a, 0, -b * b])), M(f"({lin(a, -b)})({lin(a, b)})")
    if t == 2:
        return M(poly([a * a, 2 * a * b, b * b])), M(f"({lin(a, b)})^{{2}}")
    return M(poly([a * a, -2 * a * b, b * b])), M(f"({lin(a, -b)})^{{2}}")


def g_fact_trinome(rng):
    r1, r2 = rng.sample([v for v in range(-7, 8) if v != 0], 2)
    a = rng.choice([1, 1, 1, 2, -1, 3])
    co = [a, -a * (r1 + r2), a * r1 * r2]
    lead = "" if a == 1 else ("-" if a == -1 else str(a))
    return M(poly(co)), M(f"{lead}({lin(1, -r1)})({lin(1, -r2)})")


def g_frac_rat(rng):
    t = rng.randint(1, 5)
    a = rng.randint(1, 7)
    if t == 1:
        return M(f"\\dfrac{{{poly([1, 0, -a * a])}}}{{{lin(1, a)}}}"), M(lin(1, -a)) + f" pour $x \\neq {-a}$"
    if t == 2:
        k = rng.randint(2, 5)
        return (
            M(f"\\dfrac{{{lin(k, k * a)}}}{{{poly([1, 0, -a * a])}}}"),
            M(f"\\dfrac{{{k}}}{{{lin(1, -a)}}}") + f" pour $x \\neq \\pm {a}$",
        )
    if t == 3:
        return (
            M(f"\\dfrac{{{poly([1, -2 * a, a * a])}}}{{{poly([1, 0, -a * a])}}}"),
            M(f"\\dfrac{{{lin(1, -a)}}}{{{lin(1, a)}}}") + f" pour $x \\neq \\pm {a}$",
        )
    if t == 4:
        return M(f"\\dfrac{{{poly([1, 0, -a * a])}}}{{{lin(-1, a)}}}"), M(f"-({lin(1, a)})") + f" pour $x \\neq {a}$"
    k = rng.randint(2, 5)
    return M(f"\\dfrac{{{poly([1, a, 0])}}}{{{lin(k, 0)}}}"), M(f"\\dfrac{{{lin(1, a)}}}{{{k}}}") + " pour $x \\neq 0$"


# --------------------------------------------------------------- chapitre 2

def g_eq1(rng):
    t = rng.randint(1, 3)
    a, b, c, d = nz(rng, -9, 9), rng.randint(-12, 12), rng.randint(-15, 15), nz(rng, -9, 9)
    if t == 1:
        return M(f"{lin(a, b)} = {c}"), M(f"x = {fl(F(c - b, a))}")
    if t == 2:
        while d == a:
            d = nz(rng, -9, 9)
        return M(f"{lin(a, b)} = {lin(d, c)}"), M(f"x = {fl(F(c - b, a - d))}")
    p, q = rng.randint(2, 5), rng.randint(-6, 6)
    while d == p:
        d = nz(rng, -5, 5)
    # p(x+q) = d x + c
    return M(f"{p}({lin(1, q)}) = {lin(d, c)}"), M(f"x = {fl(F(c - p * q, p - d))}")


def g_eq1_frac(rng):
    from math import gcd

    p, q = rng.sample([2, 3, 4, 5, 6], 2)
    c = rng.randint(1, 3) * (p + q) // gcd(p * q, p + q)
    # x/p + x/q = c -> x (p+q)/(pq) = c
    return M(f"\\dfrac{{x}}{{{p}}} + \\dfrac{{x}}{{{q}}} = {c}"), M(f"x = {fl(F(c * p * q, p + q))}")


def g_eq_prod(rng):
    a, b, c, d = nz(rng, -5, 5), rng.randint(-9, 9), nz(rng, -5, 5), nz(rng, -9, 9)
    s = {F(-b, a), F(-d, c)}
    return M(f"({lin(a, b)})({lin(c, d)}) = 0"), M("S = " + fset(s))


def g_eq2_simple(rng):
    t = rng.randint(1, 4)
    if t == 1:
        k = rng.randint(1, 12)
        return M(f"x^{{2}} = {k * k}"), M(f"S = \\{{-{k}\\,;\\,{k}\\}}")
    if t == 2:
        a, b = rng.randint(2, 5), rng.randint(1, 7)
        r = F(b * b, a * a)
        # a^2 x^2 = b^2 written as (a^2) x^2 - b^2 = 0
        return M(f"{a * a}x^{{2}} - {b * b} = 0"), M(f"S = " + fset({F(b, a), F(-b, a)}))
    if t == 3:
        b = nz(rng, -9, 9)
        return M(f"{poly([1, b, 0])} = 0"), M("S = " + fset({0, -b}))
    k = rng.randint(1, 9)
    return M(f"x^{{2}} + {k} = 0"), M("S = \\varnothing") + " (un carré n'est jamais négatif)"


def g_eq2_delta(rng):
    t = rng.random()
    if t < 0.6:
        r1, r2 = rng.sample(range(-6, 7), 2)
        a = rng.choice([1, 1, 2, -1])
        co = [a, -a * (r1 + r2), a * r1 * r2]
        D = co[1] ** 2 - 4 * co[0] * co[2]
        return M(f"{poly(co)} = 0"), M(f"\\Delta = {D}") + ", " + M("S = " + fset({r1, r2}))
    if t < 0.75:
        r = rng.randint(-6, 6)
        co = [1, -2 * r, r * r]
        return M(f"{poly(co)} = 0"), M("\\Delta = 0") + ", " + M("S = " + fset({r}))
    if t < 0.88:
        a, b = rng.choice([1, 2, 3]), rng.randint(-5, 5)
        c = rng.randint(b * b // (4 * a) + 1, b * b // (4 * a) + 8)
        D = b * b - 4 * a * c
        return M(f"{poly([a, b, c])} = 0"), M(f"\\Delta = {D} < 0") + ", " + M("S = \\varnothing")
    # racines irrationnelles
    while True:
        a, b, c = 1, rng.randint(-6, 6), rng.randint(-6, 6)
        D = b * b - 4 * c
        if D > 0 and int(D**0.5) ** 2 != D:
            break
    k, m = sq_simplify(D)
    # x = (-b ± k sqrt(m))/2
    if b % 2 == 0:
        c0, kk = -b // 2, k // 2
        r = rt(kk, m)
        xs = [f"{c0} - {r}", f"{c0} + {r}"] if c0 else [f"-{r}", r]
    else:
        xs = [f"\\dfrac{{{-b} - {rt(k, m)}}}{{2}}", f"\\dfrac{{{-b} + {rt(k, m)}}}{{2}}"]
    return M(f"{poly([a, b, c])} = 0"), M(f"\\Delta = {D}") + ", " + M("S = \\left\\{" + "\\,;\\,".join(xs) + "\\right\\}")


def g_somme_produit(rng):
    a, b, c = nz(rng, -5, 5, (0,)), rng.randint(-9, 9), nz(rng, -9, 9)
    return M(f"{poly([a, b, c])} = 0"), M(f"S = {fl(F(-b, a))}") + ", " + M(f"P = {fl(F(c, a))}")


def g_eq_rat(rng):
    c = nz(rng, -6, 6)
    k = nz(rng, -5, 5, (0, 1))
    a, b = nz(rng, -4, 4), rng.randint(-8, 8)
    while a == k:
        a = nz(rng, -4, 4)
    # (ax+b)/(x+c) = k -> ax + b = kx + kc -> x = (kc - b)/(a - k)
    sol = F(k * c - b, a - k)
    if sol == -c:
        return g_eq_rat(rng)
    return M(f"\\dfrac{{{lin(a, b)}}}{{{lin(1, c)}}} = {k}"), M(f"x \\neq {-c}") + " ; " + M(f"x = {fl(sol)}")


def g_ineq1(rng):
    a, b, c = nz(rng, -6, 6, (0, 1, -1)), rng.randint(-10, 10), rng.randint(-10, 10)
    op = rng.choice(["<", ">", "\\le", "\\ge"])
    r = F(c - b, a)
    flip = a < 0
    real = {"<": ">", ">": "<", "\\le": "\\ge", "\\ge": "\\le"}[op] if flip else op
    if real in ("<", "\\le"):
        ans = ivl("-inf", r, False, real == "\\le")
    else:
        ans = ivl(r, "+inf", real == "\\ge", False)
    return M(f"{lin(a, b)} {op} {c}"), M(ans)


def g_ineq2(rng):
    r1, r2 = sorted(rng.sample(range(-6, 7), 2))
    a = rng.choice([1, 1, -1, 2])
    co = [a, -a * (r1 + r2), a * r1 * r2]
    op = rng.choice(["<", ">", "\\le", "\\ge"])
    strict = op in ("<", ">")
    want_pos = op in (">", "\\ge")
    outside_pos = a > 0
    if want_pos == outside_pos:
        ans = ivl("-inf", r1, False, not strict) + " \\cup " + ivl(r2, "+inf", not strict, False)
    else:
        ans = ivl(r1, r2, not strict, not strict)
    return M(f"{poly(co)} {op} 0"), M(ans)


def g_systemes(rng):
    xs, ys = rng.randint(-5, 6), rng.randint(-5, 6)
    while True:
        a, b, c, d = nz(rng, -4, 4), nz(rng, -4, 4), nz(rng, -4, 4), nz(rng, -4, 4)
        if a * d - b * c != 0:
            break
    e1 = poly([a, 0]).replace("x", "x") + (" + " if b > 0 else " - ") + (f"{abs(b)}y" if abs(b) != 1 else "y")
    e2 = poly([c, 0]) + (" + " if d > 0 else " - ") + (f"{abs(d)}y" if abs(d) != 1 else "y")
    q = f"\\begin{{cases}} {e1} = {a * xs + b * ys} \\\\ {e2} = {c * xs + d * ys} \\end{{cases}}"
    return M(q), M(f"(x\\,;\\,y) = ({xs}\\,;\\,{ys})")


# --------------------------------------------------------------- chapitre 3

STD = [F(k, 6) for k in range(-11, 13)] + [F(k, 4) for k in range(-7, 9, 2)]


def g_deg_rad(rng):
    deg = rng.choice([30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, 15, 720])
    if rng.random() < 0.5:
        return M(f"{deg}^\\circ"), M(ang(F(deg, 180)))
    return M(ang(F(deg, 180))), M(f"{deg}^\\circ")


def g_trig_val(rng):
    r = rng.choice(STD)
    f = rng.choice(["cos", "sin"])
    val = sp.cos(sp.pi * sp.Rational(r.numerator, r.denominator)) if f == "cos" else sp.sin(sp.pi * sp.Rational(r.numerator, r.denominator))
    return M(f"\\{f}\\left({ang(r)}\\right)"), M(sx(sp.nsimplify(val)))


def g_angle_cs(rng):
    r = rng.choice([F(k, 6) for k in range(-5, 7)] + [F(k, 4) for k in (-3, -1, 1, 3)])
    c = sp.nsimplify(sp.cos(sp.pi * sp.Rational(r.numerator, r.denominator)))
    s = sp.nsimplify(sp.sin(sp.pi * sp.Rational(r.numerator, r.denominator)))
    return M(f"\\cos\\theta = {sx(c)},\\ \\sin\\theta = {sx(s)}"), M(f"\\theta = {ang(r)}")


def g_trig_eq(rng):
    f = rng.choice(["cos", "sin"])
    vals = {"cos": [1, -1, 0, F(1, 2), F(-1, 2)], "sin": [1, -1, 0, F(1, 2), F(-1, 2)]}
    v = rng.choice(vals[f])
    vs = sp.Rational(v.numerator, v.denominator) if isinstance(v, F) else sp.Integer(v)
    sols = sp.solveset(sp.Eq(getattr(sp, f)(X), vs), X, sp.Interval.Ropen(0, 2 * sp.pi))
    sols = sorted(sols, key=lambda e: float(e))
    lat = "\\{" + "\\,;\\,".join(ang(F(str(sp.nsimplify(s / sp.pi)))) for s in sols) + "\\}"
    return M(f"\\{f} x = {fl(v)}") + " sur " + M("\\fo{0}{2\\pi}"), M("S = " + lat)


# --------------------------------------------------------------- chapitre 4

def g_domaines(rng):
    t = rng.randint(1, 7)
    a = nz(rng, -6, 6)
    if t == 1:
        return M(f"f(x) = \\dfrac{{{lin(2, 1)}}}{{{lin(1, -a)}}}"), M(f"\\R \\setminus \\{{{a}\\}}")
    if t == 2:
        k = rng.randint(1, 6)
        return M(f"f(x) = \\dfrac{{1}}{{x^{{2}} - {k * k}}}"), M(f"\\R \\setminus \\{{-{k}\\,;\\,{k}\\}}")
    if t == 3:
        p, q = nz(rng, -4, 4), rng.randint(-8, 8)
        r = F(-q, p)
        return M(f"f(x) = \\sqrt{{{lin(p, q)}}}"), M(ivl(r, "+inf", True, False) if p > 0 else ivl("-inf", r, False, True))
    if t == 4:
        p, q = nz(rng, -4, 4), rng.randint(-8, 8)
        r = F(-q, p)
        return M(f"f(x) = \\ln({lin(p, q)})"), M(ivl(r, "+inf", False, False) if p > 0 else ivl("-inf", r, False, False))
    if t == 5:
        k = rng.randint(1, 5)
        return M(f"f(x) = \\sqrt{{x^{{2}} - {k * k}}}"), M(ivl("-inf", -k, False, True) + " \\cup " + ivl(k, "+inf", True, False))
    if t == 6:
        k = rng.randint(1, 9)
        return M(f"f(x) = \\ln(x^{{2}} + {k})"), M("\\R")
    return M(f"f(x) = \\dfrac{{\\ln x}}{{{lin(1, -abs(a))}}}"), M(ivl(0, abs(a), False, False) + " \\cup " + ivl(abs(a), "+inf", False, False))


def g_explog(rng):
    t = rng.randint(1, 8)
    p, q = rng.randint(-5, 6), rng.randint(-5, 6)
    if t == 1:
        return M(f"e^{{{p}}} \\times e^{{{q}}}"), M(f"e^{{{p + q}}}" if p + q not in (0, 1) else ("1" if p + q == 0 else "e"))
    if t == 2:
        k = rng.randint(2, 4)
        n = rng.randint(2, 5)
        return M(f"\\left(e^{{{k}}}\\right)^{{{n}}}"), M(f"e^{{{k * n}}}")
    if t == 3:
        return M(f"\\ln\\left(e^{{{p}}}\\right)"), M(str(p))
    if t == 4:
        k = rng.randint(2, 20)
        return M(f"e^{{\\ln {k}}}"), M(str(k))
    if t == 5:
        a, b = rng.randint(2, 9), rng.randint(2, 9)
        return M(f"\\ln {a} + \\ln {b}"), M(f"\\ln {a * b}")
    if t == 6:
        b = rng.randint(2, 6)
        k = rng.randint(2, 6)
        return M(f"\\ln {b * k} - \\ln {b}"), M(f"\\ln {k}")
    if t == 7:
        b, n = rng.choice([2, 3, 5]), rng.randint(2, 5)
        return M(f"\\ln\\left({b}^{{{n}}}\\right)"), M(f"{n}\\ln {b}")
    k = rng.randint(1, 4)
    return M(f"\\ln\\left(\\dfrac{{1}}{{e^{{{k}}}}}\\right)"), M(str(-k))


def g_eq_exp(rng):
    t = rng.randint(1, 4)
    a, b = nz(rng, -4, 4), rng.randint(-5, 5)
    if t == 1:
        k = rng.randint(2, 9)
        num = f"\\ln {k}" + (f" - {b}" if b > 0 else (f" + {-b}" if b < 0 else ""))
        if a == 1:
            ans = num
        elif a == -1:
            ans = f"-({num})" if b != 0 else f"-\\ln {k}"
        elif a < 0:
            ans = f"-\\dfrac{{{num}}}{{{-a}}}"
        else:
            ans = f"\\dfrac{{{num}}}{{{a}}}"
        return M(f"e^{{{lin(a, b)}}} = {k}"), M(f"x = {ans}")
    if t == 2:
        c, d = nz(rng, -4, 4), rng.randint(-6, 6)
        while c == a:
            c = nz(rng, -4, 4)
        return M(f"e^{{{lin(a, b)}}} = e^{{{lin(c, d)}}}"), M(f"x = {fl(F(d - b, a - c))}")
    if t == 3:
        a = abs(a)
        k = rng.randint(0, 3)
        # ln(ax + b) = k -> ax + b = e^k
        if k == 0:
            return M(f"\\ln({lin(a, b)}) = 0"), M(f"x = {fl(F(1 - b, a))}")
        num = f"e^{{{k}}}" if k > 1 else "e"
        num += (f" - {b}" if b > 0 else (f" + {-b}" if b < 0 else ""))
        return M(f"\\ln({lin(a, b)}) = {k}"), M(f"x = " + (num if a == 1 else f"\\dfrac{{{num}}}{{{a}}}"))
    k = rng.randint(1, 9)
    return M(f"e^{{{lin(a, b)}}} = -{k}"), M("S = \\varnothing") + " (une exponentielle est toujours > 0)"


def g_limites(rng):
    p, q = rng.randint(0, 3), rng.randint(1, 3)
    num = [nz(rng, -5, 5)] + [rng.randint(-5, 5) for _ in range(p)]
    den = [nz(rng, 1, 5)] + [rng.randint(-5, 5) for _ in range(q)]
    if rng.random() < 0.5:
        # même degré
        q = p = max(p, 1)
        num = [nz(rng, -6, 6)] + [rng.randint(-5, 5) for _ in range(p)]
        den = [nz(rng, -5, 5)] + [rng.randint(-5, 5) for _ in range(q)]
    ex = sp.Poly(num, X).as_expr() / sp.Poly(den, X).as_expr()
    L = sp.limit(ex, X, sp.oo)
    Ltx = "+\\infty" if L == sp.oo else ("-\\infty" if L == -sp.oo else sx(L))
    return M(f"\\lim\\limits_{{x \\to +\\infty}} \\dfrac{{{poly(num)}}}{{{poly(den)}}}"), M(Ltx)


# --------------------------------------------------------------- chapitre 5

def check_der(f, fp_):
    assert sp.simplify(sp.diff(f, X) - fp_) == 0, (f, fp_)


def g_der_poly(rng):
    deg = rng.randint(2, 4)
    co = [nz(rng, -6, 6)] + [rng.randint(-7, 7) for _ in range(deg)]
    if rng.random() < 0.25:
        co[0] = F(rng.choice([1, 2, 3]), rng.choice([2, 3, 4]))
    f = sum(sp.Rational(str(c)) * X ** (deg - i) for i, c in enumerate(co))
    d = [F(c) * (deg - i) for i, c in enumerate(co[:-1])]
    check_der(f, sum(sp.Rational(str(c)) * X ** (deg - 1 - i) for i, c in enumerate(d)))
    return M(f"f(x) = {poly(co)}"), M(f"f'(x) = {poly(d)}")


def g_der_ref(rng):
    t = rng.randint(1, 6)
    a, b = nz(rng, -6, 6), nz(rng, -6, 6)
    if t == 1:
        f, q, ans = a / X, f"\\dfrac{{{a}}}{{x}}", f"{'-' if a > 0 else ''}\\dfrac{{{abs(a)}}}{{x^{{2}}}}"
        check_der(f, -a / X**2)
    elif t == 2:
        a = abs(a)
        f, q = a * sp.sqrt(X), cm(a, "\\sqrt{x}")
        r = F(a, 2)
        ans = (f"\\dfrac{{{r.numerator}}}{{\\sqrt{{x}}}}" if r.denominator == 1 else f"\\dfrac{{{a}}}{{2\\sqrt{{x}}}}")
        check_der(f, sp.Rational(a, 2) / sp.sqrt(X))
    elif t == 3:
        f = a * sp.exp(X) + b * sp.log(X)
        q = cm(a, "e^{x}") + (" + " if b > 0 else " - ") + cm(abs(b), "\\ln x")
        ans = cm(a, "e^{x}") + (" + " if b > 0 else " - ") + f"\\dfrac{{{abs(b)}}}{{x}}"
        check_der(f, a * sp.exp(X) + sp.Rational(b) / X)
    elif t == 4:
        n = rng.randint(2, 4)
        f = X ** (-n)
        q = f"\\dfrac{{1}}{{x^{{{n}}}}}"
        ans = f"-\\dfrac{{{n}}}{{x^{{{n + 1}}}}}"
        check_der(f, -n * X ** (-n - 1))
    elif t == 5:
        f = a * sp.sin(X) + b * sp.cos(X)
        q = cm(a, "\\sin x") + (" + " if b > 0 else " - ") + cm(abs(b), "\\cos x")
        ans = cm(a, "\\cos x") + (" - " if b > 0 else " + ") + cm(abs(b), "\\sin x")
        check_der(f, a * sp.cos(X) - b * sp.sin(X))
    else:
        f = a * X**3 + b / X
        q = cm(a, "x^{3}") + (" + " if b > 0 else " - ") + f"\\dfrac{{{abs(b)}}}{{x}}"
        ans = cm(3 * a, "x^{2}") + (" - " if b > 0 else " + ") + f"\\dfrac{{{abs(b)}}}{{x^{{2}}}}"
        check_der(f, 3 * a * X**2 - b / X**2)
    return M(f"f(x) = {q}"), M(f"f'(x) = {ans}")


def g_der_prod(rng):
    t = rng.randint(1, 7)
    a, b = nz(rng, -4, 4), rng.randint(-5, 5)
    if t == 1:
        f = (a * X + b) * sp.exp(X)
        q = f"({lin(a, b)})e^{{x}}"
        ans = f"({lin(a, a + b)})e^{{x}}" if a + b else cm(a, "x") + "\\,e^{x}"
        fp_ = (a * X + a + b) * sp.exp(X)
    elif t == 2:
        c = nz(rng, -3, 3, (0, 1))
        f = (a * X + b) * sp.exp(c * X)
        q = f"({lin(a, b)})e^{{{lin(c, 0)}}}"
        ans = f"({lin(a * c, a + b * c)})e^{{{lin(c, 0)}}}" if a + b * c else cm(a * c, "x") + f"\\,e^{{{lin(c, 0)}}}"
        fp_ = (a * c * X + a + b * c) * sp.exp(c * X)
    elif t == 3:
        f = X**2 * sp.exp(X)
        q, ans, fp_ = "x^{2}e^{x}", "(x^{2} + 2x)e^{x} = x(x + 2)e^{x}", (X**2 + 2 * X) * sp.exp(X)
    elif t == 4:
        n = rng.randint(1, 3)
        f = X**n * sp.log(X)
        if n == 1:
            q, ans, fp_ = "x\\ln x", "\\ln x + 1", sp.log(X) + 1
        else:
            q = f"x^{{{n}}}\\ln x"
            ans = f"{n}x{'^{' + str(n - 1) + '}' if n > 2 else ''}\\ln x + x{'^{' + str(n - 1) + '}' if n > 2 else ''}"
            fp_ = n * X ** (n - 1) * sp.log(X) + X ** (n - 1)
    elif t == 5:
        c, d = nz(rng, -3, 3), rng.randint(-5, 5)
        f = (a * X + b) * (c * X**2 + d)
        q = f"({lin(a, b)})({poly([c, 0, d])})"
        co = [3 * a * c, 2 * b * c, a * d]
        ans, fp_ = poly(co), 3 * a * c * X**2 + 2 * b * c * X + a * d
    elif t == 6:
        f = X * sp.sin(X)
        q, ans, fp_ = "x\\sin x", "\\sin x + x\\cos x", sp.sin(X) + X * sp.cos(X)
    else:
        f = X * sp.cos(X)
        q, ans, fp_ = "x\\cos x", "\\cos x - x\\sin x", sp.cos(X) - X * sp.sin(X)
    check_der(f, fp_)
    return M(f"f(x) = {q}"), M(f"f'(x) = {ans}")


def g_der_quot(rng):
    t = rng.randint(1, 6)
    if t == 1:
        while True:
            a, b, c, d = nz(rng, -5, 5), rng.randint(-6, 6), nz(rng, -3, 3), nz(rng, -6, 6)
            if a * d - b * c != 0:
                break
        f = (a * X + b) / (c * X + d)
        num = a * d - b * c
        q = f"\\dfrac{{{lin(a, b)}}}{{{lin(c, d)}}}"
        ans = f"\\dfrac{{{num}}}{{({lin(c, d)})^{{2}}}}"
        if num < 0:
            ans = f"-\\dfrac{{{-num}}}{{({lin(c, d)})^{{2}}}}"
        fp_ = num / (c * X + d) ** 2
    elif t == 2:
        a, b, c = nz(rng, -6, 6), nz(rng, -4, 4), rng.randint(-6, 6)
        f = a / (b * X + c)
        num = -a * b
        q = f"\\dfrac{{{a}}}{{{lin(b, c)}}}"
        ans = f"\\dfrac{{{num}}}{{({lin(b, c)})^{{2}}}}" if num > 0 else f"-\\dfrac{{{-num}}}{{({lin(b, c)})^{{2}}}}"
        fp_ = num / (b * X + c) ** 2
    elif t == 3:
        f = sp.exp(X) / X
        q, ans, fp_ = "\\dfrac{e^{x}}{x}", "\\dfrac{(x - 1)e^{x}}{x^{2}}", (X - 1) * sp.exp(X) / X**2
    elif t == 4:
        f = sp.log(X) / X
        q, ans, fp_ = "\\dfrac{\\ln x}{x}", "\\dfrac{1 - \\ln x}{x^{2}}", (1 - sp.log(X)) / X**2
    elif t == 5:
        k = rng.randint(1, 9)
        f = X / (X**2 + k)
        q, ans, fp_ = f"\\dfrac{{x}}{{x^{{2}} + {k}}}", f"\\dfrac{{{k} - x^{{2}}}}{{(x^{{2}} + {k})^{{2}}}}", (k - X**2) / (X**2 + k) ** 2
    else:
        k = nz(rng, -9, 9)
        f = (X**2 + k) / X
        q = f"\\dfrac{{{poly([1, 0, k])}}}{{x}}"
        ans, fp_ = f"\\dfrac{{{poly([1, 0, -k])}}}{{x^{{2}}}}", (X**2 - k) / X**2
    check_der(f, fp_)
    return M(f"f(x) = {q}"), M(f"f'(x) = {ans}")


def g_der_comp(rng):
    from math import gcd

    t = rng.randint(1, 8)
    a, b = nz(rng, -5, 5), rng.randint(-6, 6)
    while gcd(abs(a), abs(b)) != 1:
        b = rng.randint(-6, 6)
    L = lin(a, b)
    if t == 1:
        f, q = sp.exp(a * X + b), f"e^{{{L}}}"
        ans, fp_ = cm(a, f"e^{{{L}}}"), a * sp.exp(a * X + b)
    elif t == 2:
        k = nz(rng, -3, 3)
        f, q = sp.exp(k * X**2 + b), f"e^{{{poly([k, 0, b])}}}"
        ans, fp_ = cm(2 * k, "x") + f"e^{{{poly([k, 0, b])}}}", 2 * k * X * sp.exp(k * X**2 + b)
    elif t == 3:
        f, q = sp.log(a * X + b), f"\\ln({L})"
        ans, fp_ = f"\\dfrac{{{a}}}{{{L}}}", sp.Rational(a) / (a * X + b)
    elif t == 4:
        k = rng.randint(1, 9)
        f, q = sp.log(X**2 + k), f"\\ln(x^{{2}} + {k})"
        ans, fp_ = f"\\dfrac{{2x}}{{x^{{2}} + {k}}}", 2 * X / (X**2 + k)
    elif t == 5:
        n = rng.randint(2, 6)
        f, q = (a * X + b) ** n, f"({L})^{{{n}}}"
        ans, fp_ = f"{n * a}({L})" + (f"^{{{n - 1}}}" if n > 2 else ""), n * a * (a * X + b) ** (n - 1)
    elif t == 6:
        a = abs(a)
        f, q = sp.sqrt(a * X + b), f"\\sqrt{{{lin(a, b)}}}"
        ans, fp_ = f"\\dfrac{{{a}}}{{2\\sqrt{{{lin(a, b)}}}}}", sp.Rational(a, 2) / sp.sqrt(a * X + b)
    elif t == 7:
        f, q = sp.cos(a * X + b), f"\\cos({L})"
        ans, fp_ = cm(-a, f"\\sin({L})"), -a * sp.sin(a * X + b)
    else:
        f, q = sp.sin(a * X + b), f"\\sin({L})"
        ans, fp_ = cm(a, f"\\cos({L})"), a * sp.cos(a * X + b)
    check_der(f, fp_)
    return M(f"f(x) = {q}"), M(f"f'(x) = {ans}")


def g_tangente(rng):
    co = [nz(rng, -2, 2), rng.randint(-4, 4), rng.randint(-5, 5)]
    if rng.random() < 0.4:
        co = [nz(rng, -1, 1), 0, rng.randint(-4, 4), rng.randint(-4, 4)]
    a0 = rng.randint(-2, 2)
    f = sum(c * X ** (len(co) - 1 - i) for i, c in enumerate(co))
    fa = f.subs(X, a0)
    fpa = sp.diff(f, X).subs(X, a0)
    m, p = int(fpa), int(fa - fpa * a0)
    return M(f"f(x) = {poly(co)}") + ", en " + M(f"a = {a0}"), M(f"y = {lin(m, p)}")


# --------------------------------------------------------------- chapitre 6

def check_prim(F_, f):
    assert sp.simplify(sp.diff(F_, X) - f) == 0, (F_, f)


def g_prim_poly(rng):
    deg = rng.randint(1, 3)
    co = [nz(rng, -6, 6)] + [rng.randint(-6, 6) for _ in range(deg)]
    # choisir des coefficients divisibles pour de jolies réponses
    co = [c * (deg - i + 1) if rng.random() < 0.7 else c for i, c in enumerate(co)]
    f = sum(c * X ** (deg - i) for i, c in enumerate(co))
    P = [F(c, deg - i + 1) for i, c in enumerate(co)] + [0]
    Fx = sum(sp.Rational(str(c)) * X ** (deg + 1 - i) for i, c in enumerate(P))
    check_prim(Fx, f)
    return M(f"f(x) = {poly(co)}"), M(f"F(x) = {poly(P)}")


def g_prim_ref(rng):
    t = rng.randint(1, 8)
    a = nz(rng, -5, 5, (0, 1))
    if t == 1:
        f, q, Fx, ans = sp.exp(a * X), f"e^{{{lin(a, 0)}}}", sp.exp(a * X) / a, cm(F(1, a), f"e^{{{lin(a, 0)}}}")
    elif t == 2:
        a = abs(a)
        ax = "x" if a == 1 else f"{a}x"
        f, q, Fx, ans = sp.cos(a * X), f"\\cos({ax})", sp.sin(a * X) / a, cm(F(1, a), f"\\sin({ax})")
    elif t == 3:
        a = abs(a)
        ax = "x" if a == 1 else f"{a}x"
        f, q, Fx, ans = sp.sin(a * X), f"\\sin({ax})", -sp.cos(a * X) / a, cm(F(-1, a), f"\\cos({ax})")
    elif t == 4:
        k = rng.randint(1, 6)
        f, q, Fx, ans = sp.Integer(k) / X, f"\\dfrac{{{k}}}{{x}}\\ (x>0)", k * sp.log(X), cm(k, "\\ln x")
    elif t == 5:
        k = rng.randint(1, 6)
        f, q, Fx, ans = sp.Integer(k) / X**2, f"\\dfrac{{{k}}}{{x^{{2}}}}", -sp.Integer(k) / X, f"-\\dfrac{{{k}}}{{x}}"
    elif t == 6:
        f, q, Fx, ans = 1 / sp.sqrt(X), "\\dfrac{1}{\\sqrt{x}}", 2 * sp.sqrt(X), "2\\sqrt{x}"
    elif t == 7:
        p, b, n = nz(rng, 1, 4), rng.randint(-5, 5), rng.randint(2, 4)
        f, q = (p * X + b) ** n, f"({lin(p, b)})^{{{n}}}"
        Fx = (p * X + b) ** (n + 1) / (p * (n + 1))
        ans = f"\\dfrac{{({lin(p, b)})^{{{n + 1}}}}}{{{p * (n + 1)}}}"
    else:
        p, b = nz(rng, 1, 5), rng.randint(-5, 5)
        f, q = 1 / (p * X + b), f"\\dfrac{{1}}{{{lin(p, b)}}}"
        Fx = sp.log(p * X + b) / p
        ans = cm(F(1, p), f"\\ln({lin(p, b)})")
    check_prim(Fx, f)
    return M(f"f(x) = {q}"), M(f"F(x) = {ans}")


def g_prim_comp(rng):
    t = rng.randint(1, 6)
    k = rng.randint(1, 9)
    if t == 1:
        f, q, Fx, ans = 2 * X * sp.exp(X**2), "2x\\,e^{x^{2}}", sp.exp(X**2), "e^{x^{2}}"
    elif t == 2:
        c = rng.randint(2, 6)
        f, q, Fx = c * X * sp.exp(X**2), f"{c}x\\,e^{{x^{{2}}}}", sp.Rational(c, 2) * sp.exp(X**2)
        ans = cm(F(c, 2), "e^{x^{2}}")
    elif t == 3:
        f, q = 2 * X / (X**2 + k), f"\\dfrac{{2x}}{{x^{{2}} + {k}}}"
        Fx, ans = sp.log(X**2 + k), f"\\ln(x^{{2}} + {k})"
    elif t == 4:
        f, q = X / (X**2 + k), f"\\dfrac{{x}}{{x^{{2}} + {k}}}"
        Fx, ans = sp.log(X**2 + k) / 2, f"\\dfrac{{1}}{{2}}\\ln(x^{{2}} + {k})"
    elif t == 5:
        n = rng.randint(2, 5)
        f, q = 2 * X * (X**2 + k) ** n, f"2x(x^{{2}} + {k})^{{{n}}}"
        Fx, ans = (X**2 + k) ** (n + 1) / (n + 1), f"\\dfrac{{(x^{{2}} + {k})^{{{n + 1}}}}}{{{n + 1}}}"
    else:
        f, q = sp.cos(X) * sp.exp(sp.sin(X)), "\\cos x\\,e^{\\sin x}"
        Fx, ans = sp.exp(sp.sin(X)), "e^{\\sin x}"
    check_prim(Fx, f)
    return M(f"f(x) = {q}"), M(f"F(x) = {ans}")


def g_integ_poly(rng):
    deg = rng.randint(1, 3)
    co = [nz(rng, -4, 4)] + [rng.randint(-5, 5) for _ in range(deg)]
    lo = rng.randint(-2, 1)
    hi = lo + rng.randint(1, 3)
    f = sum(c * X ** (deg - i) for i, c in enumerate(co))
    val = sp.integrate(f, (X, lo, hi))
    return M(f"\\displaystyle\\int_{{{lo}}}^{{{hi}}} ({poly(co)})\\dx"), M(sx(val))


def g_integ_ref(rng):
    t = rng.randint(1, 6)
    if t == 1:
        a = rng.choice([1, 2, 3])
        ans = "e - 1" if a == 1 else f"\\dfrac{{e^{{{a}}} - 1}}{{{a}}}"
        return M(f"\\displaystyle\\int_{{0}}^{{1}} e^{{{lin(a, 0)}}}\\dx"), M(ans)
    if t == 2:
        hi = rng.choice([2, 3, 4])
        return M(f"\\displaystyle\\int_{{1}}^{{{hi}}} \\dfrac{{1}}{{x}}\\dx"), M(f"\\ln {hi}")
    if t == 3:
        hi = rng.choice([F(1, 2), F(1, 1), F(1, 3), F(1, 6)])
        hs = sp.pi * sp.Rational(hi.numerator, hi.denominator)
        val = sp.integrate(sp.cos(X), (X, 0, hs))
        return M(f"\\displaystyle\\int_{{0}}^{{{ang(hi)}}} \\cos x\\dx"), M(sx(sp.nsimplify(val)))
    if t == 4:
        hi = rng.choice([F(1, 2), F(1, 1), F(1, 3), F(2, 3)])
        hs = sp.pi * sp.Rational(hi.numerator, hi.denominator)
        val = sp.integrate(sp.sin(X), (X, 0, hs))
        return M(f"\\displaystyle\\int_{{0}}^{{{ang(hi)}}} \\sin x\\dx"), M(sx(sp.nsimplify(val)))
    if t == 5:
        hi = rng.choice([1, 4, 9])
        val = sp.integrate(1 / sp.sqrt(X), (X, 0, hi))
        return M(f"\\displaystyle\\int_{{0}}^{{{hi}}} \\dfrac{{1}}{{\\sqrt{{x}}}}\\dx"), M(sx(val))
    k = rng.randint(1, 3)
    ans = "1 - e^{-1} = 1 - \\dfrac{1}{e}" if k == 1 else f"1 - e^{{-{k}}}"
    return M(f"\\displaystyle\\int_{{0}}^{{{k}}} e^{{-x}}\\dx"), M(ans)


# --------------------------------------------------------------- chapitre 7

def pt(*c):
    return "(" + "\\,;\\,".join(fl(v) for v in c) + ")"


def rootlatex(n):
    k, m = sq_simplify(n)
    return rt(k, m) if n else "0"


def g_vec_AB(rng):
    A = (rng.randint(-5, 5), rng.randint(-5, 5))
    d = rng.choice([(3, 4), (4, 3), (-3, 4), (6, -8), (5, 12), (1, 2), (2, -2), (-1, 3), (0, 5), (4, -1)])
    B = (A[0] + d[0], A[1] + d[1])
    return M(f"A{pt(*A)},\\ B{pt(*B)}"), M(f"\\V{{AB}}{pt(*d)},\\ AB = {rootlatex(d[0] ** 2 + d[1] ** 2)}")


def g_vec_milieu(rng):
    A = (rng.randint(-6, 6), rng.randint(-6, 6))
    B = (rng.randint(-6, 6), rng.randint(-6, 6))
    return M(f"A{pt(*A)},\\ B{pt(*B)}"), M(f"I{pt(F(A[0] + B[0], 2), F(A[1] + B[1], 2))}")


def g_vec_ops(rng):
    u = (rng.randint(-5, 5), rng.randint(-5, 5))
    v = (rng.randint(-5, 5), rng.randint(-5, 5))
    a, b = nz(rng, -3, 3), nz(rng, -3, 3)
    w = (a * u[0] + b * v[0], a * u[1] + b * v[1])
    expr = cm(a, "\\vec u") + (" + " if b > 0 else " - ") + cm(abs(b), "\\vec v")
    return M(f"\\vec u{pt(*u)},\\ \\vec v{pt(*v)} :\\ {expr}"), M(pt(*w))


def g_vec_scal(rng):
    dim = rng.choice([2, 2, 3])
    u = [rng.randint(-5, 5) for _ in range(dim)]
    v = [rng.randint(-5, 5) for _ in range(dim)]
    if rng.random() < 0.25 and dim == 2:
        mm = rng.choice([1, 2, -1])
        v = [-u[1] * mm, u[0] * mm]
    s = sum(i * j for i, j in zip(u, v))
    return M(f"\\vec u{pt(*u)} \\cdot \\vec v{pt(*v)}"), M(str(s)) + (" (orthogonaux)" if s == 0 else "")


def g_vec_param(rng):
    t = rng.randint(1, 2)
    if t == 1:
        a, b, c = nz(rng, -5, 5), nz(rng, -5, 5), nz(rng, -5, 5)
        # u(m ; a) ⟂ v(b ; c) -> m b + a c = 0 -> m = -ac/b
        m = F(-a * c, b)
        return M(f"\\vec u(m\\,;\\,{a}) \\perp \\vec v{pt(b, c)}"), M(f"m = {fl(m)}")
    a, b, c = nz(rng, -5, 5), nz(rng, -5, 5), nz(rng, -5, 5)
    # u(a ; k) colinéaire à v(b ; c) : a c - k b = 0 -> k = ac/b
    return M(f"\\vec u({a}\\,;\\,k) \\parallel \\vec v{pt(b, c)}"), M(f"k = {fl(F(a * c, b))}")


def g_vec_cross(rng):
    u = [rng.randint(-3, 3) for _ in range(3)]
    v = [rng.randint(-3, 3) for _ in range(3)]
    w = (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])
    return M(f"{pt(*u)} \\wedge {pt(*v)}"), M(pt(*w))


def g_droites(rng):
    while True:
        A = (rng.randint(-4, 4), rng.randint(-4, 4))
        B = (rng.randint(-4, 4), rng.randint(-4, 4))
        if A[0] != B[0]:
            break
    m = F(B[1] - A[1], B[0] - A[0])
    p = A[1] - m * A[0]
    return M(f"(AB) : A{pt(*A)},\\ B{pt(*B)}"), M(f"y = {lin(m, p)}")


# --------------------------------------------------------------- chapitre 8

def cmul(p, q):
    return (p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0])


def cdiv(p, q):
    d = q[0] ** 2 + q[1] ** 2
    n = cmul(p, (q[0], -q[1]))
    return (F(n[0], d), F(n[1], d))


def rc(rng, lo=-5, hi=5):
    while True:
        a, b = rng.randint(lo, hi), rng.randint(lo, hi)
        if b != 0:
            return (a, b)


def g_c_ops(rng):
    p, q = rc(rng), rc(rng)
    t = rng.randint(1, 4)
    if t == 1:
        return M(f"({cz(*p)}) + ({cz(*q)})"), M(cz(p[0] + q[0], p[1] + q[1]))
    if t == 2:
        return M(f"({cz(*p)}) - ({cz(*q)})"), M(cz(p[0] - q[0], p[1] - q[1]))
    if t == 3:
        return M(f"({cz(*p)})({cz(*q)})"), M(cz(*cmul(p, q)))
    return M(f"({cz(*p)})^{{2}}"), M(cz(*cmul(p, p)))


def g_c_div(rng):
    q = rc(rng, -4, 4)
    if rng.random() < 0.5:
        # quotient « tombe juste »
        r = rc(rng, -4, 4)
        p = cmul(q, r)
    else:
        p = rc(rng)
    return M(f"\\dfrac{{{cz(*p)}}}{{{cz(*q)}}}"), M(cz(*cdiv(p, q)))


def g_c_pow_i(rng):
    n = rng.randint(3, 2030)
    r = ["1", "i", "-1", "-i"][n % 4]
    return M(f"i^{{{n}}}"), M(r)


def g_c_mod(rng):
    a, b = rng.choice([(3, 4), (5, 12), (6, 8), (1, 1), (1, 2), (2, 3), (8, 15), (0, 7), (1, 3), (2, 2)])
    a, b = a * rng.choice([1, -1]), b * rng.choice([1, -1])
    if rng.random() < 0.5:
        a, b = b, a
    return M(f"|{cz(a, b)}|"), M(rootlatex(a * a + b * b))


NICE = [
    (1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1),
    (sp.sqrt(3), 1), (sp.sqrt(3), -1), (-sp.sqrt(3), 1), (-sp.sqrt(3), -1),
    (1, sp.sqrt(3)), (1, -sp.sqrt(3)), (-1, sp.sqrt(3)), (-1, -sp.sqrt(3)),
]


def czs(a, b):
    """a + bi (a, b sympy exacts) -> LaTeX."""
    a, b = sp.nsimplify(a), sp.nsimplify(b)
    if b == 0:
        return sx(a)
    if b == 1:
        bi = "i"
    elif b == -1:
        bi = "-i"
    else:
        bi = sx(b) + "i"
    if a == 0:
        return bi
    if b.could_extract_minus_sign():
        return sx(a) + " - " + (sx(-b) + "i" if b != -1 else "i")
    return sx(a) + " + " + bi


def eexp(r, th):
    rl = sx(r) if r != 1 else ""
    if th < 0:
        return f"{rl}e^{{-i{ang(-th)}}}"
    return f"{rl}e^{{i{ang(th)}}}"


def g_c_arg(rng):
    a, b = rng.choice(NICE)
    k = rng.choice([1, 1, 2, 3])
    a, b = k * a, k * b
    zz = sp.nsimplify(a + sp.I * b)
    r = sp.simplify(sp.Abs(zz))
    th = sp.simplify(sp.arg(zz))
    thf = F(str(sp.nsimplify(th / sp.pi)))
    rl = sx(r) if r != 1 else ""
    return M(f"z = {czs(a, b)}"), M(f"|z| = {sx(r)},\\ \\arg z = {ang(thf)},\\ z = {eexp(r, thf)}")


def g_c_exp2alg(rng):
    th = rng.choice([F(k, 6) for k in range(-5, 7)] + [F(k, 4) for k in (-3, -1, 1, 3)])
    r = rng.choice([1, 2, 2, 4, 6])
    ths = sp.pi * sp.Rational(th.numerator, th.denominator)
    re_, im_ = sp.nsimplify(r * sp.cos(ths)), sp.nsimplify(r * sp.sin(ths))
    return M(eexp(r, th)), M(czs(re_, im_))


def g_c_eq2(rng):
    p, q = rng.randint(-4, 4), rng.randint(1, 5)
    # racines p ± qi : z^2 - 2p z + (p^2+q^2)
    a = rng.choice([1, 1, 2])
    co = [a, -2 * p * a, (p * p + q * q) * a]
    D = co[1] ** 2 - 4 * co[0] * co[2]
    return M(f"{poly(co, 'z')} = 0"), M(f"\\Delta = {D},\\ z = {cz(p, q)}") + " ou " + M(f"z = {cz(p, -q)}")


def g_c_eq1(rng):
    p, q = rc(rng, -4, 4), rc(rng, -5, 5)
    s = cdiv(q, p)
    return M(f"({cz(*p)})z = {cz(*q)}"), M(f"z = {cz(*s)}")


# --------------------------------------------------------------- CRPE : nombres et mesures

def dec(x, nd=4):
    """Nombre (Fraction/int/float) -> écriture décimale française (virgule)."""
    x = F(x).limit_denominator(10**6) if not isinstance(x, F) else x
    if x.denominator == 1:
        v = str(x.numerator)
    else:
        f = float(x)
        v = f"{f:.{nd}f}".rstrip("0").rstrip(".")
    if v.startswith("-"):
        return "-" + dec(-x, nd)
    ent, _, frac = v.partition(".")
    # séparateur de milliers
    if len(ent) > 4:
        g = []
        while len(ent) > 3:
            g.insert(0, ent[-3:])
            ent = ent[:-3]
        g.insert(0, ent)
        ent = "\\,".join(g)
    return ent + ("{,}" + frac if frac else "")


def is_dec(x):
    x = F(x)
    d = x.denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    return d == 1


def pc(x):
    return f"{x}\\,\\%"


def arrow_(a, b):
    return f"{a} \\to {b}"


def hm(h, m):
    return f"{h}\\text{{ h }}{m:02d}"


def hmin(h, m):
    if h == 0:
        return f"{m}\\text{{ min}}"
    return f"{h}\\text{{ h }}{m}\\text{{ min}}"


def frac1(e):
    return "1/" + dec(e)


def times_cm(a, b):
    return f"{a}\\text{{ cm}} \\times {b}\\text{{ cm}}"


def times3(a, b, c):
    return f"{a} \\times {b} \\times {c}"


def cm2(x):
    return f"{x}\\text{{ cm}}^2"


def fx(a, b):
    return "f(x) = " + lin(a, b)


def fx0(x0):
    return f"f({x0})"


def g_pourcent(rng):
    t = rng.randint(1, 5)
    if t == 1:
        p, b = rng.choice([5, 10, 15, 20, 25, 30, 40, 50, 75, 12, 8]), rng.choice([40, 60, 80, 120, 150, 200, 240, 360, 500])
        return M(f"{p}\\,\\%\\text{{ de }}{b}"), M(dec(F(p * b, 100)))
    if t == 2:
        p, b = rng.choice([10, 20, 25, 5, 15, 30]), rng.choice([40, 60, 80, 120, 200, 250])
        up = rng.random() < 0.5
        r = F(b) * (1 + F(p, 100) if up else 1 - F(p, 100))
        return f"{'Augmenter' if up else 'Diminuer'} {M(str(b))} de {M(pc(p))}", M(dec(r))
    if t == 3:
        a = rng.choice([40, 50, 80, 120, 200, 250])
        p = rng.choice([10, 20, 25, 50, -10, -20, -25, -40])
        b = a * (100 + p) // 100
        return f"Un prix passe de {M(str(a))} € à {M(str(b))} € : évolution en %", M(("+" if p > 0 else "") + str(p) + "\\,\\%")
    if t == 4:
        p = rng.choice([10, 20, 25, 50])
        orig = rng.choice([40, 60, 80, 120, 200])
        final = orig * (100 - p) // 100
        return f"Après une baisse de {M(pc(p))}, un article coûte {M(str(final))} € : prix initial", M(str(orig)) + " €"
    up = rng.random() < 0.6
    p = rng.choice([5, 12, 20, 35, 60, 150] if up else [5, 12, 20, 35, 60, 80])
    return f"Coefficient multiplicateur d'une {'hausse' if up else 'baisse'} de {M(pc(p))}", M(dec(1 + F(p, 100) if up else 1 - F(p, 100)))


def g_proportion(rng):
    t = rng.randint(1, 3)
    if t == 1:
        q1 = rng.randint(2, 6)
        unit = F(rng.randint(12, 60), 10)
        q2 = rng.randint(2, 12)
        while q2 == q1:
            q2 = rng.randint(2, 12)
        return f"{M(str(q1))} kg coûtent {M(dec(unit * q1))} € : prix de {M(str(q2))} kg", M(dec(unit * q2)) + " €"
    if t == 2:
        a = rng.randint(2, 9)
        b = a * rng.randint(2, 7)
        c = rng.randint(2, 12)
        while c == a:
            c = rng.randint(2, 12)
        return f"Quatrième proportionnelle : {M(arrow_(a, b))}, {M(arrow_(c, '?'))}", M(dec(F(b * c, a)))
    while True:
        ppl = rng.choice([4, 6, 8])
        g = rng.choice([200, 240, 300, 360])
        n = rng.choice([2, 3, 5, 10, 12])
        if n != ppl and is_dec(F(g * n, ppl)):
            break
    return f"Recette pour {M(str(ppl))} personnes : {M(str(g))} g de farine. Pour {M(str(n))} personnes ?", M(dec(F(g * n, ppl))) + " g"


def g_vitesse(rng):
    t = rng.randint(1, 3)
    v = rng.choice([30, 40, 45, 60, 72, 80, 90, 100, 120])
    mins = rng.choice([15, 20, 30, 40, 45, 90, 150])
    d = F(v * mins, 60)
    if t == 1 and d.denominator == 1:
        h, m = divmod(mins, 60)
        dur = (f"{h}\\text{{ h }}" if h else "") + (f"{m}\\text{{ min}}" if m else "")
        return f"{M(dec(d))} km parcourus en {M(dur)} : vitesse moyenne", M(str(v)) + " km/h"
    if t == 2 and d.denominator == 1:
        return f"À {M(str(v))} km/h pendant {M(str(mins))} min : distance", M(dec(d)) + " km"
    kmh = rng.choice([18, 36, 54, 72, 90, 108, 3.6 * 5])
    kmh = F(str(kmh))
    return f"Convertir {M(dec(kmh))} km/h en m/s", M(dec(kmh / F(36, 10)))  + " m/s"


def g_echelle(rng):
    e = rng.choice([100, 200, 500, 1000, 25000, 50000, 100000])
    cm = rng.choice([2, 3, 4, 5, F(5, 2), 6, 8])
    real_cm = F(cm) * e
    if real_cm >= 100000:
        ans = dec(real_cm / 100000) + "\\text{ km}"
    else:
        ans = dec(real_cm / 100) + "\\text{ m}"
    return f"Échelle {M(frac1(e))} : {M(dec(cm))} cm sur le plan représentent", M(ans)


CONV = [
    ("km", "m", 1000), ("m", "cm", 100), ("m", "mm", 1000), ("cm", "mm", 10), ("hm", "m", 100),
    ("m^2", "cm^2", 10000), ("km^2", "m^2", 1000000), ("ha", "m^2", 10000), ("dm^2", "cm^2", 100),
    ("m^3", "dm^3", 1000), ("dm^3", "cm^3", 1000), ("L", "cL", 100), ("L", "mL", 1000), ("m^3", "L", 1000),
    ("dm^3", "L", 1), ("kg", "g", 1000), ("t", "kg", 1000), ("g", "mg", 1000),
]


def u(s):
    return "\\text{" + s.replace("^2", "}^2\\text{").replace("^3", "}^3\\text{") + "}"


def g_conversions(rng):
    big, small, f = rng.choice(CONV)
    val = F(rng.choice([1, 2, 3, 5, 7, 12, 25, 35, 150, 4]) * rng.choice([1, 1, F(1, 10), F(1, 100), 10]))
    if rng.random() < 0.5:
        return M(f"{dec(val)}\\ {u(big)} = \\ ?\\ {u(small)}"), M(f"{dec(val * f)}\\ {u(small)}")
    return M(f"{dec(val)}\\ {u(small)} = \\ ?\\ {u(big)}"), M(f"{dec(val / f, 6)}\\ {u(big)}")


def g_durees(rng):
    t = rng.randint(1, 3)
    if t == 1:
        h = F(rng.choice([15, 25, 5, 75, 4, 2, 35]), 10) + rng.randint(0, 3)
        mins = h * 60
        H, m = divmod(int(mins), 60)
        return f"Convertir {M(dec(h))} h en heures et minutes", M(f"{H}\\text{{ h }}{m}\\text{{ min}}")
    if t == 2:
        H, m = rng.randint(0, 3), rng.choice([6, 12, 15, 18, 24, 30, 36, 42, 45, 48])
        return f"Convertir {M(hmin(H, m))} en heures décimales", M(dec(H + F(m, 60))) + " h"
    h1, m1 = rng.randint(7, 15), rng.choice([0, 10, 25, 35, 45, 50])
    dh, dm = rng.randint(0, 3), rng.choice([15, 20, 40, 45, 55])
    tot = h1 * 60 + m1 + dh * 60 + dm
    return f"Départ à {M(hm(h1, m1))}, durée {M(hmin(dh, dm))} : arrivée", M(f"{tot // 60}\\text{{ h }}{tot % 60:02d}")


def factor_str(n):
    fs = sp.factorint(n)
    return " \\times ".join(f"{p}^{{{e}}}" if e > 1 else str(p) for p, e in sorted(fs.items()))


def g_arith(rng):
    t = rng.randint(1, 4)
    if t == 1:
        n = rng.choice([36, 48, 60, 72, 84, 90, 96, 120, 126, 150, 180, 210, 252, 360, 392, 450])
        return f"Décomposer {M(str(n))} en produit de facteurs premiers", M(factor_str(n))
    if t == 2:
        g = rng.choice([2, 3, 4, 6, 7, 8, 9, 12, 14, 15])
        a, b = rng.sample([2, 3, 5, 7, 11], 2)
        return M(f"\\text{{PGCD}}({g * a}\\,;\\,{g * b})"), M(str(g))
    if t == 3:
        a, b = rng.choice([(4, 6), (6, 8), (10, 15), (12, 18), (9, 12), (14, 21), (15, 20), (8, 12), (6, 10)])
        return M(f"\\text{{PPCM}}({a}\\,;\\,{b})"), M(str(sp.ilcm(a, b)))
    n = rng.choice([91, 97, 51, 57, 87, 101, 119, 127, 143, 161, 89, 73])
    pr = sp.isprime(n)
    return f"{M(str(n))} est-il premier ?", ("oui" if pr else "non : " + M(factor_str(n)))


def g_aires(rng):
    t = rng.randint(1, 5)
    a, b = rng.randint(3, 12), rng.randint(2, 10)
    if t == 1:
        return f"Aire d'un rectangle {M(times_cm(a, b))}", M(f"{a * b}\\text{{ cm}}^2")
    if t == 2:
        return f"Aire d'un triangle de base {M(str(a))} cm et de hauteur {M(str(b))} cm", M(f"{dec(F(a * b, 2))}\\text{{ cm}}^2")
    if t == 3:
        r = rng.randint(2, 9)
        return f"Aire d'un disque de rayon {M(str(r))} cm (valeur exacte)", M(f"{r * r}\\pi\\text{{ cm}}^2")
    if t == 4:
        r = rng.randint(2, 9)
        return f"Périmètre d'un cercle de rayon {M(str(r))} cm (valeur exacte)", M(f"{2 * r}\\pi\\text{{ cm}}")
    c = rng.randint(2, 8)
    return f"Aire d'un trapèze de bases {M(str(a))} et {M(str(c))} cm, hauteur {M(str(b))} cm", M(f"{dec(F((a + c) * b, 2))}\\text{{ cm}}^2")


def g_volumes(rng):
    t = rng.randint(1, 4)
    a, b, c = rng.randint(2, 9), rng.randint(2, 8), rng.randint(2, 10)
    if t == 1:
        return f"Volume d'un pavé {M(times3(a, b, c))} (en cm)", M(f"{a * b * c}\\text{{ cm}}^3")
    if t == 2:
        return f"Volume d'un cube d'arête {M(str(a))} cm", M(f"{a ** 3}\\text{{ cm}}^3")
    if t == 3:
        return f"Volume d'un cylindre de rayon {M(str(a))} cm et de hauteur {M(str(c))} cm (exact)", M(f"{a * a * c}\\pi\\text{{ cm}}^3")
    base = a * b
    h = 3 * rng.randint(1, 4)
    return f"Volume d'une pyramide de base {M(cm2(base))} et de hauteur {M(str(h))} cm", M(f"{base * h // 3}\\text{{ cm}}^3")


TRIPLES = [(3, 4, 5), (6, 8, 10), (5, 12, 13), (8, 15, 17), (9, 12, 15), (12, 16, 20), (7, 24, 25)]


def g_pythagore(rng):
    a, b, c = rng.choice(TRIPLES)
    if rng.random() < 0.5:
        return f"Triangle rectangle, côtés de l'angle droit {M(str(a))} et {M(str(b))} : hypoténuse", M(str(c))
    return f"Triangle rectangle d'hypoténuse {M(str(c))}, un côté {M(str(a))} : l'autre côté", M(str(b))


def g_stats(rng):
    n = rng.choice([5, 6, 7, 8])
    vals = [rng.randint(2, 20) for _ in range(n)]
    s = sorted(vals)
    mean = F(sum(vals), n)
    med = F(s[n // 2]) if n % 2 else F(s[n // 2 - 1] + s[n // 2], 2)
    return (
        "Série : " + M(" \\,;\\, ".join(map(str, vals))) + " — moyenne, médiane, étendue",
        M(f"\\bar x = {dec(mean)}" if is_dec(mean) else f"\\bar x \\approx {dec(mean, 2)}") + ", " + M(f"\\text{{méd.}} = {dec(med)}") + ", " + M(f"e = {s[-1] - s[0]}"),
    )


def g_proba(rng):
    r, b, v = rng.randint(2, 8), rng.randint(2, 8), rng.choice([0, 0, 2, 3, 4, 5])
    tot = r + b + v
    col = rng.choice(["rouge", "bleue"] + (["verte"] if v else []))
    k = {"rouge": r, "bleue": b, "verte": v}[col]
    urne = f"{r} rouges, {b} bleues" + (f", {v} vertes" if v else "")
    return f"Urne : {urne}. Probabilité de tirer une boule {col}", M(fl(F(k, tot)))


def g_decimaux(rng):
    t = rng.randint(1, 4)
    a = F(rng.randint(11, 999), rng.choice([10, 100]))
    b = F(rng.randint(11, 999), rng.choice([10, 100]))
    if t == 1:
        return M(f"{dec(a)} + {dec(b)}"), M(dec(a + b))
    if t == 2:
        a, b = max(a, b), min(a, b)
        return M(f"{dec(a)} - {dec(b)}"), M(dec(a - b))
    if t == 3:
        k = rng.choice([10, 100, 1000, F(1, 10), F(1, 100)])
        return M(f"{dec(a)} \\times {dec(k)}"), M(dec(a * k))
    c = F(rng.randint(2, 9)) + F(rng.randint(1, 9), 10)
    d_ = rng.randint(2, 9)
    return M(f"{dec(c)} \\times {d_}"), M(dec(c * d_))


def g_ecritures(rng):
    fr_ = rng.choice([F(1, 2), F(1, 4), F(3, 4), F(1, 5), F(2, 5), F(3, 5), F(1, 8), F(3, 8), F(7, 10), F(3, 20), F(1, 20), F(9, 25), F(5, 4)])
    t = rng.randint(1, 3)
    pct = fr_ * 100
    if t == 1:
        return f"Écrire {M(fl(fr_))} en décimal et en pourcentage", M(dec(fr_)) + " ; " + M(dec(pct) + "\\,\\%")
    if t == 2:
        return f"Écrire {M(dec(fr_))} en fraction irréductible", M(fl(fr_))
    return f"Écrire {M(pc(dec(pct)))} en fraction irréductible", M(fl(fr_))


def g_affine(rng):
    a, b = nz(rng, -5, 5), rng.randint(-6, 6)
    x0 = rng.randint(-4, 5)
    if rng.random() < 0.5:
        return f"{M(fx(a, b))} : calculer {M(fx0(x0))}", M(str(a * x0 + b))
    y0 = a * x0 + b
    return f"{M(fx(a, b))} : antécédent de {M(str(y0))}", M(f"x = {x0}")


# --------------------------------------------------------------- registre

CONSIGNE = {
    "pourcent": "Calcule (sans calculatrice).",
    "proportion": "Utilise la proportionnalité (passage à l'unité, coefficient, linéarité).",
    "vitesse": "Rappel : $d = v \\times t$ ; attention aux minutes !",
    "echelle": "Donne la longueur réelle (dans l'unité la plus adaptée).",
    "conversions": "Convertis (attention aux unités d'aire et de volume !).",
    "durees": "Rappel : 1 h = 60 min, et 0,5 h = 30 min.",
    "arith": "Arithmétique : décomposition, PGCD, PPCM, nombres premiers.",
    "aires": "Calcule (formulaire du chapitre M6).",
    "volumes": "Calcule (formulaire du chapitre M6).",
    "pythagore": "Utilise le théorème de Pythagore.",
    "stats": "Calcule la moyenne, la médiane et l'étendue.",
    "proba": "Situation d'équiprobabilité : cas favorables / cas possibles.",
    "decimaux": "Calcule (sans calculatrice, pose l'opération si besoin).",
    "ecritures": "Passe d'une écriture à l'autre.",
    "affine": "Calcule.",
    "signes_add": "Calcule (sans calculatrice).",
    "signes_mul": "Calcule en appliquant la règle des signes.",
    "priorites": "Calcule en respectant les priorités.",
    "substitution": "Calcule la valeur de l'expression (mets le nombre entre parenthèses !).",
    "intervalles": "Écris sous forme d'intervalle.",
    "frac_simpl": "Simplifie au maximum.",
    "frac_add": "Calcule et simplifie.",
    "frac_mul": "Calcule et simplifie.",
    "frac_mixte": "Calcule et simplifie (priorités !).",
    "puiss_num": "Donne la valeur exacte (fraction ou entier).",
    "puiss_lit": "Écris sous la forme $x^n$ (ou $k x^n$).",
    "racines": "Simplifie.",
    "rac_denom": "Écris sans racine au dénominateur.",
    "dev_simple": "Développe et réduis.",
    "dev_double": "Développe et réduis.",
    "dev_id": "Développe avec une identité remarquable.",
    "dev_mix": "Développe et réduis.",
    "fact_commun": "Factorise avec un facteur commun.",
    "fact_id": "Factorise avec une identité remarquable.",
    "fact_trinome": "Factorise (trouve les racines, puis $a(x - x_1)(x - x_2)$).",
    "frac_rat": "Simplifie (factorise d'abord !) et donne la condition.",
    "eq1": "Résous.",
    "eq1_frac": "Résous.",
    "eq_prod": "Résous (produit nul).",
    "eq2_simple": "Résous sans $\\Delta$.",
    "eq2_delta": "Calcule $\\Delta$ puis résous dans $\\R$.",
    "somme_produit": "Donne la somme $S$ et le produit $P$ des racines (sans les calculer).",
    "eq_rat": "Donne la condition, puis résous.",
    "ineq1": "Résous (attention au sens !).",
    "ineq2": "Résous (signe du trinôme).",
    "systemes": "Résous le système.",
    "deg_rad": "Convertis (degrés ↔ radians).",
    "trig_val": "Donne la valeur exacte (dessine le cercle).",
    "angle_cs": "Trouve $\\theta \\in \\mathopen{]}-\\pi\\,;\\,\\pi\\mathclose{]}$.",
    "trig_eq": "Résous.",
    "domaines": "Donne l'ensemble de définition.",
    "explog": "Simplifie.",
    "eq_exp": "Résous.",
    "limites": "Calcule la limite (termes de plus haut degré).",
    "der_poly": "Dérive.",
    "der_ref": "Dérive (tableau des dérivées).",
    "der_prod": "Dérive (produit $u \\times v$).",
    "der_quot": "Dérive (quotient $u / v$).",
    "der_comp": "Dérive (fonction composée : × la dérivée de l'intérieur).",
    "tangente": "Donne l'équation de la tangente au point d'abscisse $a$.",
    "prim_poly": "Donne une primitive $F$.",
    "prim_ref": "Donne une primitive $F$ (contrôle : $F' = f$).",
    "prim_comp": "Donne une primitive $F$ (reconnais $u'e^u$, $u'/u$ ou $u'u^n$).",
    "integ_poly": "Calcule l'intégrale.",
    "integ_ref": "Calcule l'intégrale (valeur exacte).",
    "vec_AB": "Calcule les coordonnées de $\\V{AB}$ et la distance $AB$.",
    "vec_milieu": "Donne le milieu $I$ de $[AB]$.",
    "vec_ops": "Calcule les coordonnées.",
    "vec_scal": "Calcule le produit scalaire.",
    "vec_param": "Trouve le paramètre.",
    "vec_cross": "Calcule le produit vectoriel.",
    "droites": "Donne l'équation réduite de la droite $(AB)$.",
    "c_ops": "Donne la forme algébrique $a + bi$.",
    "c_div": "Donne la forme algébrique (multiplie par le conjugué).",
    "c_pow_i": "Simplifie (reste de la division par 4).",
    "c_mod": "Calcule le module.",
    "c_arg": "Module, argument (dans $\\mathopen{]}-\\pi\\,;\\,\\pi\\mathclose{]}$) et forme exponentielle.",
    "c_exp2alg": "Donne la forme algébrique.",
    "c_eq2": "Résous dans $\\C$.",
    "c_eq1": "Résous dans $\\C$.",
}


def generate(name, n, seed):
    fn = globals()["g_" + name]
    rng = random.Random(seed * 7919 + hash(name) % 1000 if False else seed * 7919 + sum(map(ord, name)))
    seen, out = set(), []
    tries = 0
    while len(out) < n and tries < n * 200:
        tries += 1
        q, a = fn(rng)
        if q in seen:
            continue
        seen.add(q)
        out.append((q, a))
    if len(out) < n:
        raise SystemExit(f"Générateur {name} : seulement {len(out)} items distincts")
    return out


if __name__ == "__main__":
    import sys

    for name in sys.argv[1:] or [k[2:] for k in list(globals()) if k.startswith("g_")]:
        for q, a in generate(name, 6, 1):
            print(f"{name}: {q}  =>  {a}")
