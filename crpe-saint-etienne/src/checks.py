"""Vérification automatique des réponses (@check) avec sympy.

Chaque @check est une expression Python évaluée dans un contexte sympy ;
elle doit valoir True. Fonctions utiles :
  same(a, b)            a et b sont égaux (simplification symbolique)
  sols(eq, [s1, s2])    ensemble des solutions réelles de eq (expr = 0 ou Eq)
  csols(eq, [..])       idem dans C
  der(f, g)             f' = g (variable x)
  prim(F, f)            F' = f (variable x)
  integ(f, a, b, v)     intégrale de a à b de f vaut v
  ineq(rel, ensemble)   ensemble des solutions réelles d'une inéquation
  approx(e, v, tol)     valeur numérique
"""
from sympy import *  # noqa: F401,F403
from sympy import (
    Abs, E, Eq, I, Interval, S, Union, FiniteSet, diff, exp, integrate, log, nsimplify, oo, pi,
    simplify, solveset, sqrt, symbols, sympify, expand, factor, N, Matrix, cos, sin, tan,
    arg as carg, re as cre, im as cim, conjugate, limit, Rational,
)

x, y, z, t, a, b, c, k, m, u, v = symbols("x y z t a b c k m u v", real=True)
X = symbols("X")


def _s(e):
    return sympify(e, locals=CTX) if isinstance(e, str) else e


def same(p, q):
    p, q = _s(p), _s(q)
    d = simplify(expand(p - q))
    if d == 0:
        return True
    try:
        # contrôle numérique en plusieurs points (x > 0 pour ln, racines…)
        import random

        free = sorted(d.free_symbols, key=str)
        rnd = random.Random(1)
        for _ in range(6):
            vals = {s: Rational(rnd.randint(11, 97), 10) for s in free}
            val = complex(N(d.subs(vals), 30))
            if abs(val) > 1e-12:
                return False
        return True
    except Exception:
        return False


def sols(eq, expected, var=None, domain=S.Reals):
    eq = _s(eq)
    var = var or x
    if isinstance(eq, Eq):
        eq = eq.lhs - eq.rhs
    got = solveset(eq, var, domain)
    exp_l = [_s(e) for e in expected]
    if got == FiniteSet(*exp_l):
        return True
    if not isinstance(got, FiniteSet) or len(got) != len(set(exp_l)):
        return False
    got_l = list(got)
    return all(any(abs(complex(N(g - e, 30))) < 1e-12 for g in got_l) for e in exp_l)


def csols(eq, expected, var=None):
    var = var or symbols("z")
    eq = _s(eq)
    if isinstance(eq, Eq):
        eq = eq.lhs - eq.rhs
    got = solveset(eq, var, S.Complexes)
    exp_set = [simplify(_s(e)) for e in expected]
    got_l = [simplify(g) for g in got]
    return len(got_l) == len(exp_set) and all(any(simplify(g - e) == 0 for g in got_l) for e in exp_set)


def der(f, g, var=None):
    var = var or x
    return same(diff(_s(f), var), _s(g))


def prim(F, f, var=None):
    var = var or x
    return same(diff(_s(F), var), _s(f))


def integ(f, lo, hi, val, var=None):
    var = var or x
    return same(integrate(_s(f), (var, _s(lo), _s(hi))), _s(val))


def ineq(rel, expected, var=None):
    var = var or x
    got = solveset(_s(rel), var, S.Reals)
    return simplify(got.symmetric_difference(expected)) == S.EmptySet if hasattr(got, "symmetric_difference") else got == expected


def approx(e, val, tol=1e-6):
    return abs(complex(N(_s(e))) - complex(val)) < tol


def lim(f, point, val, var=None, dir="+-"):
    var = var or x
    if dir == "+-":
        return limit(_s(f), var, _s(point)) == _s(val)
    return limit(_s(f), var, _s(point), dir) == _s(val)


def cmod(zv, val):
    return same(Abs(_s(zv)), _s(val))


def carg_is(zv, val):
    return same(carg(_s(zv)), _s(val))


def dot(p, q):
    return sum(i * j for i, j in zip(p, q))


def cross(p, q):
    return list(Matrix(p).cross(Matrix(q)))


def norm(p):
    return sqrt(sum(i * i for i in p))


def iv(a, b, left_open=False, right_open=False):
    return Interval(_s(a), _s(b), left_open, right_open)


CTX = {k_: v_ for k_, v_ in globals().items() if not k_.startswith("__")}
CTX.update(x=x, y=y, t=t, a=a, b=b, c=c, k=k, m=m, u=u, v=v, e=E, i=I, j=I, z=symbols("z"))


def run(items):
    fails = []
    for label, expr in items:
        try:
            ok = eval(expr, dict(CTX))
            if ok is not True and not (hasattr(ok, "__bool__") and bool(ok) is True):
                fails.append((label, expr, f"résultat {ok}"))
        except Exception as ex:  # noqa: BLE001
            fails.append((label, expr, f"erreur {type(ex).__name__}: {ex}"))
    return fails
