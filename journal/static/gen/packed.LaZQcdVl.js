var e,
	t,
	i,
	n,
	r = !1,
	s = !1,
	o = [],
	a = -1;
function l(e) {
	!(function (e) {
		o.includes(e) || o.push(e);
		s || r || ((r = !0), queueMicrotask(c));
	})(e);
}
function h(e) {
	let t = o.indexOf(e);
	-1 !== t && t > a && o.splice(t, 1);
}
function c() {
	(r = !1), (s = !0);
	for (let e = 0; e < o.length; e++) o[e](), (a = e);
	(o.length = 0), (a = -1), (s = !1);
}
var u = !0;
function f(e) {
	t = e;
}
function O(e, n) {
	let r,
		s = !0,
		o = t(() => {
			let t = e();
			JSON.stringify(t),
				s
					? (r = t)
					: queueMicrotask(() => {
							n(t, r), (r = t);
						}),
				(s = !1);
		});
	return () => i(o);
}
var d = [],
	p = [],
	m = [];
function g(e, t) {
	"function" == typeof t
		? (e._x_cleanups || (e._x_cleanups = []), e._x_cleanups.push(t))
		: ((t = e), p.push(t));
}
function x(e) {
	d.push(e);
}
function b(e, t, i) {
	e._x_attributeCleanups || (e._x_attributeCleanups = {}),
		e._x_attributeCleanups[t] || (e._x_attributeCleanups[t] = []),
		e._x_attributeCleanups[t].push(i);
}
function S(e, t) {
	e._x_attributeCleanups &&
		Object.entries(e._x_attributeCleanups).forEach(([i, n]) => {
			(void 0 === t || t.includes(i)) &&
				(n.forEach((e) => e()), delete e._x_attributeCleanups[i]);
		});
}
var y = new MutationObserver(_),
	Q = !1;
function w() {
	y.observe(document, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeOldValue: !0,
	}),
		(Q = !0);
}
function k() {
	!(function () {
		let e = y.takeRecords();
		v.push(() => e.length > 0 && _(e));
		let t = v.length;
		queueMicrotask(() => {
			if (v.length === t) for (; v.length > 0; ) v.shift()();
		});
	})(),
		y.disconnect(),
		(Q = !1);
}
var v = [];
function $(e) {
	if (!Q) return e();
	k();
	let t = e();
	return w(), t;
}
var P = !1,
	Z = [];
function _(e) {
	if (P) return void (Z = Z.concat(e));
	let t = [],
		i = new Set(),
		n = new Map(),
		r = new Map();
	for (let s = 0; s < e.length; s++)
		if (
			!e[s].target._x_ignoreMutationObserver &&
			("childList" === e[s].type &&
				(e[s].removedNodes.forEach((e) => {
					1 === e.nodeType && e._x_marker && i.add(e);
				}),
				e[s].addedNodes.forEach((e) => {
					1 === e.nodeType &&
						(i.has(e) ? i.delete(e) : e._x_marker || t.push(e));
				})),
			"attributes" === e[s].type)
		) {
			let t = e[s].target,
				i = e[s].attributeName,
				o = e[s].oldValue,
				a = () => {
					n.has(t) || n.set(t, []),
						n.get(t).push({ name: i, value: t.getAttribute(i) });
				},
				l = () => {
					r.has(t) || r.set(t, []), r.get(t).push(i);
				};
			t.hasAttribute(i) && null === o
				? a()
				: t.hasAttribute(i)
					? (l(), a())
					: l();
		}
	r.forEach((e, t) => {
		S(t, e);
	}),
		n.forEach((e, t) => {
			d.forEach((i) => i(t, e));
		});
	for (let e of i) t.some((t) => t.contains(e)) || p.forEach((t) => t(e));
	for (let e of t) e.isConnected && m.forEach((t) => t(e));
	(t = null), (i = null), (n = null), (r = null);
}
function T(e) {
	return C(A(e));
}
function X(e, t, i) {
	return (
		(e._x_dataStack = [t, ...A(i || e)]),
		() => {
			e._x_dataStack = e._x_dataStack.filter((e) => e !== t);
		}
	);
}
function A(e) {
	return e._x_dataStack
		? e._x_dataStack
		: "function" == typeof ShadowRoot && e instanceof ShadowRoot
			? A(e.host)
			: e.parentNode
				? A(e.parentNode)
				: [];
}
function C(e) {
	return new Proxy({ objects: e }, R);
}
var R = {
	ownKeys: ({ objects: e }) =>
		Array.from(new Set(e.flatMap((e) => Object.keys(e)))),
	has: ({ objects: e }, t) =>
		t != Symbol.unscopables &&
		e.some(
			(e) => Object.prototype.hasOwnProperty.call(e, t) || Reflect.has(e, t),
		),
	get: ({ objects: e }, t, i) =>
		"toJSON" == t
			? M
			: Reflect.get(e.find((e) => Reflect.has(e, t)) || {}, t, i),
	set({ objects: e }, t, i, n) {
		const r =
				e.find((e) => Object.prototype.hasOwnProperty.call(e, t)) ||
				e[e.length - 1],
			s = Object.getOwnPropertyDescriptor(r, t);
		return s?.set && s?.get ? s.set.call(n, i) || !0 : Reflect.set(r, t, i);
	},
};
function M() {
	return Reflect.ownKeys(this).reduce(
		(e, t) => ((e[t] = Reflect.get(this, t)), e),
		{},
	);
}
function j(e) {
	let t = (i, n = "") => {
		Object.entries(Object.getOwnPropertyDescriptors(i)).forEach(
			([r, { value: s, enumerable: o }]) => {
				if (!1 === o || void 0 === s) return;
				if ("object" == typeof s && null !== s && s.__v_skip) return;
				let a = "" === n ? r : `${n}.${r}`;
				var l;
				"object" == typeof s && null !== s && s._x_interceptor
					? (i[r] = s.initialize(e, a, r))
					: "object" != typeof (l = s) ||
						Array.isArray(l) ||
						null === l ||
						s === i ||
						s instanceof Element ||
						t(s, a);
			},
		);
	};
	return t(e);
}
function E(e, t = () => {}) {
	let i = {
		initialValue: void 0,
		_x_interceptor: !0,
		initialize(t, i, n) {
			return e(
				this.initialValue,
				() =>
					(function (e, t) {
						return t.split(".").reduce((e, t) => e[t], e);
					})(t, i),
				(e) => q(t, i, e),
				i,
				n,
			);
		},
	};
	return (
		t(i),
		(e) => {
			if ("object" == typeof e && null !== e && e._x_interceptor) {
				let t = i.initialize.bind(i);
				i.initialize = (n, r, s) => {
					let o = e.initialize(n, r, s);
					return (i.initialValue = o), t(n, r, s);
				};
			} else i.initialValue = e;
			return i;
		}
	);
}
function q(e, t, i) {
	if (("string" == typeof t && (t = t.split(".")), 1 !== t.length)) {
		if (0 === t.length) throw error;
		return e[t[0]] || (e[t[0]] = {}), q(e[t[0]], t.slice(1), i);
	}
	e[t[0]] = i;
}
var V = {};
function L(e, t) {
	V[e] = t;
}
function W(e, t) {
	let i = (function (e) {
		let [t, i] = ae(e),
			n = { interceptor: E, ...t };
		return g(e, i), n;
	})(t);
	return (
		Object.entries(V).forEach(([n, r]) => {
			Object.defineProperty(e, `$${n}`, { get: () => r(t, i), enumerable: !1 });
		}),
		e
	);
}
function z(e, t, i, ...n) {
	try {
		return i(...n);
	} catch (i) {
		Y(i, e, t);
	}
}
function Y(e, t, i = void 0) {
	(e = Object.assign(e ?? { message: "No error message given." }, {
		el: t,
		expression: i,
	})),
		console.warn(
			`Alpine Expression Error: ${e.message}\n\n${i ? 'Expression: "' + i + '"\n\n' : ""}`,
			t,
		),
		setTimeout(() => {
			throw e;
		}, 0);
}
var D = !0;
function B(e) {
	let t = D;
	D = !1;
	let i = e();
	return (D = t), i;
}
function I(e, t, i = {}) {
	let n;
	return U(e, t)((e) => (n = e), i), n;
}
function U(...e) {
	return G(...e);
}
var G = N;
function N(e, t) {
	let i = {};
	W(i, e);
	let n = [i, ...A(e)],
		r =
			"function" == typeof t
				? (function (e, t) {
						return (i = () => {}, { scope: n = {}, params: r = [] } = {}) => {
							F(i, t.apply(C([n, ...e]), r));
						};
					})(n, t)
				: (function (e, t, i) {
						let n = (function (e, t) {
							if (H[e]) return H[e];
							let i = Object.getPrototypeOf(async function () {}).constructor,
								n =
									/^[\n\s]*if.*\(.*\)/.test(e.trim()) ||
									/^(let|const)\s/.test(e.trim())
										? `(async()=>{ ${e} })()`
										: e;
							const r = () => {
								try {
									let t = new i(
										["__self", "scope"],
										`with (scope) { __self.result = ${n} }; __self.finished = true; return __self.result;`,
									);
									return (
										Object.defineProperty(t, "name", {
											value: `[Alpine] ${e}`,
										}),
										t
									);
								} catch (i) {
									return Y(i, t, e), Promise.resolve();
								}
							};
							let s = r();
							return (H[e] = s), s;
						})(t, i);
						return (r = () => {}, { scope: s = {}, params: o = [] } = {}) => {
							(n.result = void 0), (n.finished = !1);
							let a = C([s, ...e]);
							if ("function" == typeof n) {
								let e = n(n, a).catch((e) => Y(e, i, t));
								n.finished
									? (F(r, n.result, a, o, i), (n.result = void 0))
									: e
											.then((e) => {
												F(r, e, a, o, i);
											})
											.catch((e) => Y(e, i, t))
											.finally(() => (n.result = void 0));
							}
						};
					})(n, t, e);
	return z.bind(null, e, t, r);
}
var H = {};
function F(e, t, i, n, r) {
	if (D && "function" == typeof t) {
		let s = t.apply(i, n);
		s instanceof Promise
			? s.then((t) => F(e, t, i, n)).catch((e) => Y(e, r, t))
			: e(s);
	} else
		"object" == typeof t && t instanceof Promise ? t.then((t) => e(t)) : e(t);
}
var K = "x-";
function J(e = "") {
	return K + e;
}
var ee = {};
function te(e, t) {
	return (
		(ee[e] = t),
		{
			before(t) {
				if (!ee[t])
					return void console.warn(
						String.raw`Cannot find directive \`${t}\`. \`${e}\` will use the default order of execution`,
					);
				const i = pe.indexOf(t);
				pe.splice(i >= 0 ? i : pe.indexOf("DEFAULT"), 0, e);
			},
		}
	);
}
function ie(e, t, i) {
	if (((t = Array.from(t)), e._x_virtualDirectives)) {
		let i = Object.entries(e._x_virtualDirectives).map(([e, t]) => ({
				name: e,
				value: t,
			})),
			n = ne(i);
		(i = i.map((e) =>
			n.find((t) => t.name === e.name)
				? { name: `x-bind:${e.name}`, value: `"${e.value}"` }
				: e,
		)),
			(t = t.concat(i));
	}
	let n = {},
		r = t
			.map(he((e, t) => (n[e] = t)))
			.filter(fe)
			.map(
				(function (e, t) {
					return ({ name: i, value: n }) => {
						let r = i.match(Oe()),
							s = i.match(/:([a-zA-Z0-9\-_:]+)/),
							o = i.match(/\.[^.\]]+(?=[^\]]*$)/g) || [],
							a = t || e[i] || i;
						return {
							type: r ? r[1] : null,
							value: s ? s[1] : null,
							modifiers: o.map((e) => e.replace(".", "")),
							expression: n,
							original: a,
						};
					};
				})(n, i),
			)
			.sort(me);
	return r.map((t) =>
		(function (e, t) {
			let i = () => {},
				n = ee[t.type] || i,
				[r, s] = ae(e);
			b(e, t.original, s);
			let o = () => {
				e._x_ignore ||
					e._x_ignoreSelf ||
					(n.inline && n.inline(e, t, r),
					(n = n.bind(n, e, t, r)),
					re ? se.get(oe).push(n) : n());
			};
			return (o.runCleanups = s), o;
		})(e, t),
	);
}
function ne(e) {
	return Array.from(e)
		.map(he())
		.filter((e) => !fe(e));
}
var re = !1,
	se = new Map(),
	oe = Symbol();
function ae(e) {
	let n = [],
		[r, s] = (function (e) {
			let n = () => {};
			return [
				(r) => {
					let s = t(r);
					return (
						e._x_effects ||
							((e._x_effects = new Set()),
							(e._x_runEffects = () => {
								e._x_effects.forEach((e) => e());
							})),
						e._x_effects.add(s),
						(n = () => {
							void 0 !== s && (e._x_effects.delete(s), i(s));
						}),
						s
					);
				},
				() => {
					n();
				},
			];
		})(e);
	n.push(s);
	return [
		{
			Alpine: mt,
			effect: r,
			cleanup: (e) => n.push(e),
			evaluateLater: U.bind(U, e),
			evaluate: I.bind(I, e),
		},
		() => n.forEach((e) => e()),
	];
}
var le =
	(e, t) =>
	({ name: i, value: n }) => (
		i.startsWith(e) && (i = i.replace(e, t)), { name: i, value: n }
	);
function he(e = () => {}) {
	return ({ name: t, value: i }) => {
		let { name: n, value: r } = ce.reduce((e, t) => t(e), {
			name: t,
			value: i,
		});
		return n !== t && e(n, t), { name: n, value: r };
	};
}
var ce = [];
function ue(e) {
	ce.push(e);
}
function fe({ name: e }) {
	return Oe().test(e);
}
var Oe = () => new RegExp(`^${K}([^:^.]+)\\b`);
var de = "DEFAULT",
	pe = [
		"ignore",
		"ref",
		"data",
		"id",
		"anchor",
		"bind",
		"init",
		"for",
		"model",
		"modelable",
		"transition",
		"show",
		"if",
		de,
		"teleport",
	];
function me(e, t) {
	let i = -1 === pe.indexOf(e.type) ? de : e.type,
		n = -1 === pe.indexOf(t.type) ? de : t.type;
	return pe.indexOf(i) - pe.indexOf(n);
}
function ge(e, t, i = {}) {
	e.dispatchEvent(
		new CustomEvent(t, {
			detail: i,
			bubbles: !0,
			composed: !0,
			cancelable: !0,
		}),
	);
}
function xe(e, t) {
	if ("function" == typeof ShadowRoot && e instanceof ShadowRoot)
		return void Array.from(e.children).forEach((e) => xe(e, t));
	let i = !1;
	if ((t(e, () => (i = !0)), i)) return;
	let n = e.firstElementChild;
	for (; n; ) xe(n, t), (n = n.nextElementSibling);
}
function be(e, ...t) {
	console.warn(`Alpine Warning: ${e}`, ...t);
}
var Se = !1;
var ye = [],
	Qe = [];
function we() {
	return ye.map((e) => e());
}
function ke() {
	return ye.concat(Qe).map((e) => e());
}
function ve(e) {
	ye.push(e);
}
function $e(e) {
	Qe.push(e);
}
function Pe(e, t = !1) {
	return Ze(e, (e) => {
		if ((t ? ke() : we()).some((t) => e.matches(t))) return !0;
	});
}
function Ze(e, t) {
	if (e) {
		if (t(e)) return e;
		if ((e._x_teleportBack && (e = e._x_teleportBack), e.parentElement))
			return Ze(e.parentElement, t);
	}
}
var _e = [];
var Te = 1;
function Xe(e, t = xe, i = () => {}) {
	Ze(e, (e) => e._x_ignore) ||
		(function (e) {
			re = !0;
			let t = Symbol();
			(oe = t), se.set(t, []);
			let i = () => {
				for (; se.get(t).length; ) se.get(t).shift()();
				se.delete(t);
			};
			e(i), (re = !1), i();
		})(() => {
			t(e, (e, t) => {
				e._x_marker ||
					(i(e, t),
					_e.forEach((i) => i(e, t)),
					ie(e, e.attributes).forEach((e) => e()),
					e._x_ignore || (e._x_marker = Te++),
					e._x_ignore && t());
			});
		});
}
function Ae(e, t = xe) {
	t(e, (e) => {
		!(function (e) {
			for (e._x_effects?.forEach(h); e._x_cleanups?.length; )
				e._x_cleanups.pop()();
		})(e),
			S(e),
			delete e._x_marker;
	});
}
var Ce = [],
	Re = !1;
function Me(e = () => {}) {
	return (
		queueMicrotask(() => {
			Re ||
				setTimeout(() => {
					je();
				});
		}),
		new Promise((t) => {
			Ce.push(() => {
				e(), t();
			});
		})
	);
}
function je() {
	for (Re = !1; Ce.length; ) Ce.shift()();
}
function Ee(e, t) {
	return Array.isArray(t)
		? qe(e, t.join(" "))
		: "object" == typeof t && null !== t
			? (function (e, t) {
					let i = (e) => e.split(" ").filter(Boolean),
						n = Object.entries(t)
							.flatMap(([e, t]) => !!t && i(e))
							.filter(Boolean),
						r = Object.entries(t)
							.flatMap(([e, t]) => !t && i(e))
							.filter(Boolean),
						s = [],
						o = [];
					return (
						r.forEach((t) => {
							e.classList.contains(t) && (e.classList.remove(t), o.push(t));
						}),
						n.forEach((t) => {
							e.classList.contains(t) || (e.classList.add(t), s.push(t));
						}),
						() => {
							o.forEach((t) => e.classList.add(t)),
								s.forEach((t) => e.classList.remove(t));
						}
					);
				})(e, t)
			: "function" == typeof t
				? Ee(e, t())
				: qe(e, t);
}
function qe(e, t) {
	return (
		(t = !0 === t ? (t = "") : t || ""),
		(i = t
			.split(" ")
			.filter((t) => !e.classList.contains(t))
			.filter(Boolean)),
		e.classList.add(...i),
		() => {
			e.classList.remove(...i);
		}
	);
	var i;
}
function Ve(e, t) {
	return "object" == typeof t && null !== t
		? (function (e, t) {
				let i = {};
				return (
					Object.entries(t).forEach(([t, n]) => {
						(i[t] = e.style[t]),
							t.startsWith("--") ||
								(t = t.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()),
							e.style.setProperty(t, n);
					}),
					setTimeout(() => {
						0 === e.style.length && e.removeAttribute("style");
					}),
					() => {
						Ve(e, i);
					}
				);
			})(e, t)
		: (function (e, t) {
				let i = e.getAttribute("style", t);
				return (
					e.setAttribute("style", t),
					() => {
						e.setAttribute("style", i || "");
					}
				);
			})(e, t);
}
function Le(e, t = () => {}) {
	let i = !1;
	return function () {
		i ? t.apply(this, arguments) : ((i = !0), e.apply(this, arguments));
	};
}
function We(e, t, i = {}) {
	e._x_transition ||
		(e._x_transition = {
			enter: { during: i, start: i, end: i },
			leave: { during: i, start: i, end: i },
			in(i = () => {}, n = () => {}) {
				Ye(
					e,
					t,
					{
						during: this.enter.during,
						start: this.enter.start,
						end: this.enter.end,
					},
					i,
					n,
				);
			},
			out(i = () => {}, n = () => {}) {
				Ye(
					e,
					t,
					{
						during: this.leave.during,
						start: this.leave.start,
						end: this.leave.end,
					},
					i,
					n,
				);
			},
		});
}
function ze(e) {
	let t = e.parentNode;
	if (t) return t._x_hidePromise ? t : ze(t);
}
function Ye(
	e,
	t,
	{ during: i, start: n, end: r } = {},
	s = () => {},
	o = () => {},
) {
	if (
		(e._x_transitioning && e._x_transitioning.cancel(),
		0 === Object.keys(i).length &&
			0 === Object.keys(n).length &&
			0 === Object.keys(r).length)
	)
		return s(), void o();
	let a, l, h;
	!(function (e, t) {
		let i,
			n,
			r,
			s = Le(() => {
				$(() => {
					(i = !0),
						n || t.before(),
						r || (t.end(), je()),
						t.after(),
						e.isConnected && t.cleanup(),
						delete e._x_transitioning;
				});
			});
		(e._x_transitioning = {
			beforeCancels: [],
			beforeCancel(e) {
				this.beforeCancels.push(e);
			},
			cancel: Le(function () {
				for (; this.beforeCancels.length; ) this.beforeCancels.shift()();
				s();
			}),
			finish: s,
		}),
			$(() => {
				t.start(), t.during();
			}),
			(Re = !0),
			requestAnimationFrame(() => {
				if (i) return;
				let s =
						1e3 *
						Number(
							getComputedStyle(e)
								.transitionDuration.replace(/,.*/, "")
								.replace("s", ""),
						),
					o =
						1e3 *
						Number(
							getComputedStyle(e)
								.transitionDelay.replace(/,.*/, "")
								.replace("s", ""),
						);
				0 === s &&
					(s =
						1e3 *
						Number(getComputedStyle(e).animationDuration.replace("s", ""))),
					$(() => {
						t.before();
					}),
					(n = !0),
					requestAnimationFrame(() => {
						i ||
							($(() => {
								t.end();
							}),
							je(),
							setTimeout(e._x_transitioning.finish, s + o),
							(r = !0));
					});
			});
	})(e, {
		start() {
			a = t(e, n);
		},
		during() {
			l = t(e, i);
		},
		before: s,
		end() {
			a(), (h = t(e, r));
		},
		after: o,
		cleanup() {
			l(), h();
		},
	});
}
function De(e, t, i) {
	if (-1 === e.indexOf(t)) return i;
	const n = e[e.indexOf(t) + 1];
	if (!n) return i;
	if ("scale" === t && isNaN(n)) return i;
	if ("duration" === t || "delay" === t) {
		let e = n.match(/([0-9]+)ms/);
		if (e) return e[1];
	}
	return "origin" === t &&
		["top", "right", "left", "center", "bottom"].includes(e[e.indexOf(t) + 2])
		? [n, e[e.indexOf(t) + 2]].join(" ")
		: n;
}
te(
	"transition",
	(e, { value: t, modifiers: i, expression: n }, { evaluate: r }) => {
		"function" == typeof n && (n = r(n)),
			!1 !== n &&
				(n && "boolean" != typeof n
					? (function (e, t, i) {
							We(e, Ee, "");
							let n = {
								enter: (t) => {
									e._x_transition.enter.during = t;
								},
								"enter-start": (t) => {
									e._x_transition.enter.start = t;
								},
								"enter-end": (t) => {
									e._x_transition.enter.end = t;
								},
								leave: (t) => {
									e._x_transition.leave.during = t;
								},
								"leave-start": (t) => {
									e._x_transition.leave.start = t;
								},
								"leave-end": (t) => {
									e._x_transition.leave.end = t;
								},
							};
							n[i](t);
						})(e, n, t)
					: (function (e, t, i) {
							We(e, Ve);
							let n = !t.includes("in") && !t.includes("out") && !i,
								r = n || t.includes("in") || ["enter"].includes(i),
								s = n || t.includes("out") || ["leave"].includes(i);
							t.includes("in") &&
								!n &&
								(t = t.filter((e, i) => i < t.indexOf("out")));
							t.includes("out") &&
								!n &&
								(t = t.filter((e, i) => i > t.indexOf("out")));
							let o = !t.includes("opacity") && !t.includes("scale"),
								a = o || t.includes("opacity"),
								l = o || t.includes("scale"),
								h = a ? 0 : 1,
								c = l ? De(t, "scale", 95) / 100 : 1,
								u = De(t, "delay", 0) / 1e3,
								f = De(t, "origin", "center"),
								O = "opacity, transform",
								d = De(t, "duration", 150) / 1e3,
								p = De(t, "duration", 75) / 1e3,
								m = "cubic-bezier(0.4, 0.0, 0.2, 1)";
							r &&
								((e._x_transition.enter.during = {
									transformOrigin: f,
									transitionDelay: `${u}s`,
									transitionProperty: O,
									transitionDuration: `${d}s`,
									transitionTimingFunction: m,
								}),
								(e._x_transition.enter.start = {
									opacity: h,
									transform: `scale(${c})`,
								}),
								(e._x_transition.enter.end = {
									opacity: 1,
									transform: "scale(1)",
								}));
							s &&
								((e._x_transition.leave.during = {
									transformOrigin: f,
									transitionDelay: `${u}s`,
									transitionProperty: O,
									transitionDuration: `${p}s`,
									transitionTimingFunction: m,
								}),
								(e._x_transition.leave.start = {
									opacity: 1,
									transform: "scale(1)",
								}),
								(e._x_transition.leave.end = {
									opacity: h,
									transform: `scale(${c})`,
								}));
						})(e, i, t));
	},
),
	(window.Element.prototype._x_toggleAndCascadeWithTransitions = function (
		e,
		t,
		i,
		n,
	) {
		const r =
			"visible" === document.visibilityState
				? requestAnimationFrame
				: setTimeout;
		let s = () => r(i);
		t
			? e._x_transition && (e._x_transition.enter || e._x_transition.leave)
				? e._x_transition.enter &&
					(Object.entries(e._x_transition.enter.during).length ||
						Object.entries(e._x_transition.enter.start).length ||
						Object.entries(e._x_transition.enter.end).length)
					? e._x_transition.in(i)
					: s()
				: e._x_transition
					? e._x_transition.in(i)
					: s()
			: ((e._x_hidePromise = e._x_transition
					? new Promise((t, i) => {
							e._x_transition.out(
								() => {},
								() => t(n),
							),
								e._x_transitioning &&
									e._x_transitioning.beforeCancel(() =>
										i({ isFromCancelledTransition: !0 }),
									);
						})
					: Promise.resolve(n)),
				queueMicrotask(() => {
					let t = ze(e);
					t
						? (t._x_hideChildren || (t._x_hideChildren = []),
							t._x_hideChildren.push(e))
						: r(() => {
								let t = (e) => {
									let i = Promise.all([
										e._x_hidePromise,
										...(e._x_hideChildren || []).map(t),
									]).then(([e]) => e?.());
									return delete e._x_hidePromise, delete e._x_hideChildren, i;
								};
								t(e).catch((e) => {
									if (!e.isFromCancelledTransition) throw e;
								});
							});
				}));
	});
var Be = !1;
function Ie(e, t = () => {}) {
	return (...i) => (Be ? t(...i) : e(...i));
}
var Ue = [];
function Ge(e) {
	Ue.push(e);
}
var Ne = !1;
function He(e) {
	let n = t;
	f((e, t) => {
		let r = n(e);
		return i(r), () => {};
	}),
		e(),
		f(n);
}
function Fe(t, i, n, r = []) {
	switch (
		(t._x_bindings || (t._x_bindings = e({})),
		(t._x_bindings[i] = n),
		(i = r.includes("camel")
			? i.toLowerCase().replace(/-(\w)/g, (e, t) => t.toUpperCase())
			: i))
	) {
		case "value":
			!(function (e, t) {
				if (st(e))
					void 0 === e.attributes.value && (e.value = t),
						window.fromModel &&
							(e.checked =
								"boolean" == typeof t ? et(e.value) === t : Je(e.value, t));
				else if (rt(e))
					Number.isInteger(t)
						? (e.value = t)
						: Array.isArray(t) ||
								"boolean" == typeof t ||
								[null, void 0].includes(t)
							? Array.isArray(t)
								? (e.checked = t.some((t) => Je(t, e.value)))
								: (e.checked = !!t)
							: (e.value = String(t));
				else if ("SELECT" === e.tagName)
					!(function (e, t) {
						const i = [].concat(t).map((e) => e + "");
						Array.from(e.options).forEach((e) => {
							e.selected = i.includes(e.value);
						});
					})(e, t);
				else {
					if (e.value === t) return;
					e.value = void 0 === t ? "" : t;
				}
			})(t, n);
			break;
		case "style":
			!(function (e, t) {
				e._x_undoAddedStyles && e._x_undoAddedStyles();
				e._x_undoAddedStyles = Ve(e, t);
			})(t, n);
			break;
		case "class":
			!(function (e, t) {
				e._x_undoAddedClasses && e._x_undoAddedClasses();
				e._x_undoAddedClasses = Ee(e, t);
			})(t, n);
			break;
		case "selected":
		case "checked":
			!(function (e, t, i) {
				Ke(e, t, i),
					(function (e, t, i) {
						e[t] !== i && (e[t] = i);
					})(e, t, i);
			})(t, i, n);
			break;
		default:
			Ke(t, i, n);
	}
}
function Ke(e, t, i) {
	[null, void 0, !1].includes(i) &&
	(function (e) {
		return ![
			"aria-pressed",
			"aria-checked",
			"aria-expanded",
			"aria-selected",
		].includes(e);
	})(t)
		? e.removeAttribute(t)
		: (it(t) && (i = t),
			(function (e, t, i) {
				e.getAttribute(t) != i && e.setAttribute(t, i);
			})(e, t, i));
}
function Je(e, t) {
	return e == t;
}
function et(e) {
	return (
		!![1, "1", "true", "on", "yes", !0].includes(e) ||
		(![0, "0", "false", "off", "no", !1].includes(e) && (e ? Boolean(e) : null))
	);
}
var tt = new Set([
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"defer",
	"disabled",
	"formnovalidate",
	"inert",
	"ismap",
	"itemscope",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"selected",
	"shadowrootclonable",
	"shadowrootdelegatesfocus",
	"shadowrootserializable",
]);
function it(e) {
	return tt.has(e);
}
function nt(e, t, i) {
	let n = e.getAttribute(t);
	return null === n
		? "function" == typeof i
			? i()
			: i
		: "" === n || (it(t) ? !![t, "true"].includes(n) : n);
}
function rt(e) {
	return (
		"checkbox" === e.type ||
		"ui-checkbox" === e.localName ||
		"ui-switch" === e.localName
	);
}
function st(e) {
	return "radio" === e.type || "ui-radio" === e.localName;
}
function ot(e, t) {
	var i;
	return function () {
		var n = this,
			r = arguments;
		clearTimeout(i),
			(i = setTimeout(function () {
				(i = null), e.apply(n, r);
			}, t));
	};
}
function at(e, t) {
	let i;
	return function () {
		let n = this,
			r = arguments;
		i || (e.apply(n, r), (i = !0), setTimeout(() => (i = !1), t));
	};
}
function lt({ get: e, set: n }, { get: r, set: s }) {
	let o,
		a = !0,
		l = t(() => {
			let t = e(),
				i = r();
			if (a) s(ht(t)), (a = !1);
			else {
				let e = JSON.stringify(t),
					r = JSON.stringify(i);
				e !== o ? s(ht(t)) : e !== r && n(ht(i));
			}
			(o = JSON.stringify(e())), JSON.stringify(r());
		});
	return () => {
		i(l);
	};
}
function ht(e) {
	return "object" == typeof e ? JSON.parse(JSON.stringify(e)) : e;
}
var ct = {},
	ut = !1;
var ft = {};
function Ot(e, t, i) {
	let n = [];
	for (; n.length; ) n.pop()();
	let r = Object.entries(t).map(([e, t]) => ({ name: e, value: t })),
		s = ne(r);
	return (
		(r = r.map((e) =>
			s.find((t) => t.name === e.name)
				? { name: `x-bind:${e.name}`, value: `"${e.value}"` }
				: e,
		)),
		ie(e, r, i).map((e) => {
			n.push(e.runCleanups), e();
		}),
		() => {
			for (; n.length; ) n.pop()();
		}
	);
}
var dt = {};
var pt = {
		get reactive() {
			return e;
		},
		get release() {
			return i;
		},
		get effect() {
			return t;
		},
		get raw() {
			return n;
		},
		version: "3.14.9",
		flushAndStopDeferringMutations: function () {
			(P = !1), _(Z), (Z = []);
		},
		dontAutoEvaluateFunctions: B,
		disableEffectScheduling: function (e) {
			(u = !1), e(), (u = !0);
		},
		startObservingMutations: w,
		stopObservingMutations: k,
		setReactivityEngine: function (r) {
			(e = r.reactive),
				(i = r.release),
				(t = (e) =>
					r.effect(e, {
						scheduler: (e) => {
							u ? l(e) : e();
						},
					})),
				(n = r.raw);
		},
		onAttributeRemoved: b,
		onAttributesAdded: x,
		closestDataStack: A,
		skipDuringClone: Ie,
		onlyDuringClone: function (e) {
			return (...t) => Be && e(...t);
		},
		addRootSelector: ve,
		addInitSelector: $e,
		interceptClone: Ge,
		addScopeToNode: X,
		deferMutations: function () {
			P = !0;
		},
		mapAttributes: ue,
		evaluateLater: U,
		interceptInit: function (e) {
			_e.push(e);
		},
		setEvaluator: function (e) {
			G = e;
		},
		mergeProxies: C,
		extractProp: function (e, t, i, n = !0) {
			if (e._x_bindings && void 0 !== e._x_bindings[t]) return e._x_bindings[t];
			if (e._x_inlineBindings && void 0 !== e._x_inlineBindings[t]) {
				let i = e._x_inlineBindings[t];
				return (i.extract = n), B(() => I(e, i.expression));
			}
			return nt(e, t, i);
		},
		findClosest: Ze,
		onElRemoved: g,
		closestRoot: Pe,
		destroyTree: Ae,
		interceptor: E,
		transition: Ye,
		setStyles: Ve,
		mutateDom: $,
		directive: te,
		entangle: lt,
		throttle: at,
		debounce: ot,
		evaluate: I,
		initTree: Xe,
		nextTick: Me,
		prefixed: J,
		prefix: function (e) {
			K = e;
		},
		plugin: function (e) {
			(Array.isArray(e) ? e : [e]).forEach((e) => e(mt));
		},
		magic: L,
		store: function (t, i) {
			if ((ut || ((ct = e(ct)), (ut = !0)), void 0 === i)) return ct[t];
			(ct[t] = i),
				j(ct[t]),
				"object" == typeof i &&
					null !== i &&
					i.hasOwnProperty("init") &&
					"function" == typeof i.init &&
					ct[t].init();
		},
		start: function () {
			var e;
			Se &&
				be(
					"Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.",
				),
				(Se = !0),
				document.body ||
					be(
						"Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?",
					),
				ge(document, "alpine:init"),
				ge(document, "alpine:initializing"),
				w(),
				(e = (e) => Xe(e, xe)),
				m.push(e),
				g((e) => Ae(e)),
				x((e, t) => {
					ie(e, t).forEach((e) => e());
				}),
				Array.from(document.querySelectorAll(ke().join(",")))
					.filter((e) => !Pe(e.parentElement, !0))
					.forEach((e) => {
						Xe(e);
					}),
				ge(document, "alpine:initialized"),
				setTimeout(() => {
					[
						["ui", "dialog", ["[x-dialog], [x-popover]"]],
						["anchor", "anchor", ["[x-anchor]"]],
						["sort", "sort", ["[x-sort]"]],
					].forEach(([e, t, i]) => {
						(function (e) {
							return Object.keys(ee).includes(e);
						})(t) ||
							i.some((t) => {
								if (document.querySelector(t))
									return be(`found "${t}", but missing ${e} plugin`), !0;
							});
					});
				});
		},
		clone: function (e, t) {
			t._x_dataStack || (t._x_dataStack = e._x_dataStack),
				(Be = !0),
				(Ne = !0),
				He(() => {
					!(function (e) {
						let t = !1;
						Xe(e, (e, i) => {
							xe(e, (e, n) => {
								if (
									t &&
									(function (e) {
										return we().some((t) => e.matches(t));
									})(e)
								)
									return n();
								(t = !0), i(e, n);
							});
						});
					})(t);
				}),
				(Be = !1),
				(Ne = !1);
		},
		cloneNode: function (e, t) {
			Ue.forEach((i) => i(e, t)),
				(Be = !0),
				He(() => {
					Xe(t, (e, t) => {
						t(e, () => {});
					});
				}),
				(Be = !1);
		},
		bound: function (e, t, i) {
			return e._x_bindings && void 0 !== e._x_bindings[t]
				? e._x_bindings[t]
				: nt(e, t, i);
		},
		$data: T,
		watch: O,
		walk: xe,
		data: function (e, t) {
			dt[e] = t;
		},
		bind: function (e, t) {
			let i = "function" != typeof t ? () => t : t;
			return e instanceof Element ? Ot(e, i()) : ((ft[e] = i), () => {});
		},
	},
	mt = pt;
function gt(e, t) {
	const i = Object.create(null),
		n = e.split(",");
	for (let e = 0; e < n.length; e++) i[n[e]] = !0;
	return (e) => !!i[e];
}
var xt,
	bt = Object.freeze({}),
	St = Object.prototype.hasOwnProperty,
	yt = (e, t) => St.call(e, t),
	Qt = Array.isArray,
	wt = (e) => "[object Map]" === Pt(e),
	kt = (e) => "symbol" == typeof e,
	vt = (e) => null !== e && "object" == typeof e,
	$t = Object.prototype.toString,
	Pt = (e) => $t.call(e),
	Zt = (e) => Pt(e).slice(8, -1),
	_t = (e) =>
		"string" == typeof e &&
		"NaN" !== e &&
		"-" !== e[0] &&
		"" + parseInt(e, 10) === e,
	Tt = ((e) => {
		const t = Object.create(null);
		return (i) => t[i] || (t[i] = e(i));
	})((e) => e.charAt(0).toUpperCase() + e.slice(1)),
	Xt = (e, t) => e !== t && (e == e || t == t),
	At = new WeakMap(),
	Ct = [],
	Rt = Symbol("iterate"),
	Mt = Symbol("Map key iterate");
var jt = 0;
function Et(e) {
	const { deps: t } = e;
	if (t.length) {
		for (let i = 0; i < t.length; i++) t[i].delete(e);
		t.length = 0;
	}
}
var qt = !0,
	Vt = [];
function Lt() {
	const e = Vt.pop();
	qt = void 0 === e || e;
}
function Wt(e, t, i) {
	if (!qt || void 0 === xt) return;
	let n = At.get(e);
	n || At.set(e, (n = new Map()));
	let r = n.get(i);
	r || n.set(i, (r = new Set())),
		r.has(xt) ||
			(r.add(xt),
			xt.deps.push(r),
			xt.options.onTrack &&
				xt.options.onTrack({ effect: xt, target: e, type: t, key: i }));
}
function zt(e, t, i, n, r, s) {
	const o = At.get(e);
	if (!o) return;
	const a = new Set(),
		l = (e) => {
			e &&
				e.forEach((e) => {
					(e !== xt || e.allowRecurse) && a.add(e);
				});
		};
	if ("clear" === t) o.forEach(l);
	else if ("length" === i && Qt(e))
		o.forEach((e, t) => {
			("length" === t || t >= n) && l(e);
		});
	else
		switch ((void 0 !== i && l(o.get(i)), t)) {
			case "add":
				Qt(e)
					? _t(i) && l(o.get("length"))
					: (l(o.get(Rt)), wt(e) && l(o.get(Mt)));
				break;
			case "delete":
				Qt(e) || (l(o.get(Rt)), wt(e) && l(o.get(Mt)));
				break;
			case "set":
				wt(e) && l(o.get(Rt));
		}
	a.forEach((o) => {
		o.options.onTrigger &&
			o.options.onTrigger({
				effect: o,
				target: e,
				key: i,
				type: t,
				newValue: n,
				oldValue: r,
				oldTarget: s,
			}),
			o.options.scheduler ? o.options.scheduler(o) : o();
	});
}
var Yt = gt("__proto__,__v_isRef,__isVue"),
	Dt = new Set(
		Object.getOwnPropertyNames(Symbol)
			.map((e) => Symbol[e])
			.filter(kt),
	),
	Bt = Nt(),
	It = Nt(!0),
	Ut = Gt();
function Gt() {
	const e = {};
	return (
		["includes", "indexOf", "lastIndexOf"].forEach((t) => {
			e[t] = function (...e) {
				const i = _i(this);
				for (let e = 0, t = this.length; e < t; e++) Wt(i, "get", e + "");
				const n = i[t](...e);
				return -1 === n || !1 === n ? i[t](...e.map(_i)) : n;
			};
		}),
		["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
			e[t] = function (...e) {
				Vt.push(qt), (qt = !1);
				const i = _i(this)[t].apply(this, e);
				return Lt(), i;
			};
		}),
		e
	);
}
function Nt(e = !1, t = !1) {
	return function (i, n, r) {
		if ("__v_isReactive" === n) return !e;
		if ("__v_isReadonly" === n) return e;
		if ("__v_raw" === n && r === (e ? (t ? vi : ki) : t ? wi : Qi).get(i))
			return i;
		const s = Qt(i);
		if (!e && s && yt(Ut, n)) return Reflect.get(Ut, n, r);
		const o = Reflect.get(i, n, r);
		if (kt(n) ? Dt.has(n) : Yt(n)) return o;
		if ((e || Wt(i, "get", n), t)) return o;
		if (Ti(o)) {
			return !s || !_t(n) ? o.value : o;
		}
		return vt(o) ? (e ? Pi(o) : $i(o)) : o;
	};
}
function Ht(e = !1) {
	return function (t, i, n, r) {
		let s = t[i];
		if (!e && ((n = _i(n)), (s = _i(s)), !Qt(t) && Ti(s) && !Ti(n)))
			return (s.value = n), !0;
		const o = Qt(t) && _t(i) ? Number(i) < t.length : yt(t, i),
			a = Reflect.set(t, i, n, r);
		return (
			t === _i(r) &&
				(o ? Xt(n, s) && zt(t, "set", i, n, s) : zt(t, "add", i, n)),
			a
		);
	};
}
var Ft = {
		get: Bt,
		set: Ht(),
		deleteProperty: function (e, t) {
			const i = yt(e, t),
				n = e[t],
				r = Reflect.deleteProperty(e, t);
			return r && i && zt(e, "delete", t, void 0, n), r;
		},
		has: function (e, t) {
			const i = Reflect.has(e, t);
			return (kt(t) && Dt.has(t)) || Wt(e, "has", t), i;
		},
		ownKeys: function (e) {
			return Wt(e, "iterate", Qt(e) ? "length" : Rt), Reflect.ownKeys(e);
		},
	},
	Kt = {
		get: It,
		set: (e, t) => (
			console.warn(
				`Set operation on key "${String(t)}" failed: target is readonly.`,
				e,
			),
			!0
		),
		deleteProperty: (e, t) => (
			console.warn(
				`Delete operation on key "${String(t)}" failed: target is readonly.`,
				e,
			),
			!0
		),
	},
	Jt = (e) => (vt(e) ? $i(e) : e),
	ei = (e) => (vt(e) ? Pi(e) : e),
	ti = (e) => e,
	ii = (e) => Reflect.getPrototypeOf(e);
function ni(e, t, i = !1, n = !1) {
	const r = _i((e = e.__v_raw)),
		s = _i(t);
	t !== s && !i && Wt(r, "get", t), !i && Wt(r, "get", s);
	const { has: o } = ii(r),
		a = n ? ti : i ? ei : Jt;
	return o.call(r, t)
		? a(e.get(t))
		: o.call(r, s)
			? a(e.get(s))
			: void (e !== r && e.get(t));
}
function ri(e, t = !1) {
	const i = this.__v_raw,
		n = _i(i),
		r = _i(e);
	return (
		e !== r && !t && Wt(n, "has", e),
		!t && Wt(n, "has", r),
		e === r ? i.has(e) : i.has(e) || i.has(r)
	);
}
function si(e, t = !1) {
	return (
		(e = e.__v_raw), !t && Wt(_i(e), "iterate", Rt), Reflect.get(e, "size", e)
	);
}
function oi(e) {
	e = _i(e);
	const t = _i(this);
	return ii(t).has.call(t, e) || (t.add(e), zt(t, "add", e, e)), this;
}
function ai(e, t) {
	t = _i(t);
	const i = _i(this),
		{ has: n, get: r } = ii(i);
	let s = n.call(i, e);
	s ? yi(i, n, e) : ((e = _i(e)), (s = n.call(i, e)));
	const o = r.call(i, e);
	return (
		i.set(e, t),
		s ? Xt(t, o) && zt(i, "set", e, t, o) : zt(i, "add", e, t),
		this
	);
}
function li(e) {
	const t = _i(this),
		{ has: i, get: n } = ii(t);
	let r = i.call(t, e);
	r ? yi(t, i, e) : ((e = _i(e)), (r = i.call(t, e)));
	const s = n ? n.call(t, e) : void 0,
		o = t.delete(e);
	return r && zt(t, "delete", e, void 0, s), o;
}
function hi() {
	const e = _i(this),
		t = 0 !== e.size,
		i = wt(e) ? new Map(e) : new Set(e),
		n = e.clear();
	return t && zt(e, "clear", void 0, void 0, i), n;
}
function ci(e, t) {
	return function (i, n) {
		const r = this,
			s = r.__v_raw,
			o = _i(s),
			a = t ? ti : e ? ei : Jt;
		return (
			!e && Wt(o, "iterate", Rt), s.forEach((e, t) => i.call(n, a(e), a(t), r))
		);
	};
}
function ui(e, t, i) {
	return function (...n) {
		const r = this.__v_raw,
			s = _i(r),
			o = wt(s),
			a = "entries" === e || (e === Symbol.iterator && o),
			l = "keys" === e && o,
			h = r[e](...n),
			c = i ? ti : t ? ei : Jt;
		return (
			!t && Wt(s, "iterate", l ? Mt : Rt),
			{
				next() {
					const { value: e, done: t } = h.next();
					return t
						? { value: e, done: t }
						: { value: a ? [c(e[0]), c(e[1])] : c(e), done: t };
				},
				[Symbol.iterator]() {
					return this;
				},
			}
		);
	};
}
function fi(e) {
	return function (...t) {
		{
			const i = t[0] ? `on key "${t[0]}" ` : "";
			console.warn(
				`${Tt(e)} operation ${i}failed: target is readonly.`,
				_i(this),
			);
		}
		return "delete" !== e && this;
	};
}
function Oi() {
	const e = {
			get(e) {
				return ni(this, e);
			},
			get size() {
				return si(this);
			},
			has: ri,
			add: oi,
			set: ai,
			delete: li,
			clear: hi,
			forEach: ci(!1, !1),
		},
		t = {
			get(e) {
				return ni(this, e, !1, !0);
			},
			get size() {
				return si(this);
			},
			has: ri,
			add: oi,
			set: ai,
			delete: li,
			clear: hi,
			forEach: ci(!1, !0),
		},
		i = {
			get(e) {
				return ni(this, e, !0);
			},
			get size() {
				return si(this, !0);
			},
			has(e) {
				return ri.call(this, e, !0);
			},
			add: fi("add"),
			set: fi("set"),
			delete: fi("delete"),
			clear: fi("clear"),
			forEach: ci(!0, !1),
		},
		n = {
			get(e) {
				return ni(this, e, !0, !0);
			},
			get size() {
				return si(this, !0);
			},
			has(e) {
				return ri.call(this, e, !0);
			},
			add: fi("add"),
			set: fi("set"),
			delete: fi("delete"),
			clear: fi("clear"),
			forEach: ci(!0, !0),
		};
	return (
		["keys", "values", "entries", Symbol.iterator].forEach((r) => {
			(e[r] = ui(r, !1, !1)),
				(i[r] = ui(r, !0, !1)),
				(t[r] = ui(r, !1, !0)),
				(n[r] = ui(r, !0, !0));
		}),
		[e, i, t, n]
	);
}
var [di, pi, mi, gi] = Oi();
function xi(e, t) {
	const i = e ? pi : di;
	return (t, n, r) =>
		"__v_isReactive" === n
			? !e
			: "__v_isReadonly" === n
				? e
				: "__v_raw" === n
					? t
					: Reflect.get(yt(i, n) && n in t ? i : t, n, r);
}
var bi = { get: xi(!1) },
	Si = { get: xi(!0) };
function yi(e, t, i) {
	const n = _i(i);
	if (n !== i && t.call(e, n)) {
		const t = Zt(e);
		console.warn(
			`Reactive ${t} contains both the raw and reactive versions of the same object${"Map" === t ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`,
		);
	}
}
var Qi = new WeakMap(),
	wi = new WeakMap(),
	ki = new WeakMap(),
	vi = new WeakMap();
function $i(e) {
	return e && e.__v_isReadonly ? e : Zi(e, !1, Ft, bi, Qi);
}
function Pi(e) {
	return Zi(e, !0, Kt, Si, ki);
}
function Zi(e, t, i, n, r) {
	if (!vt(e))
		return console.warn(`value cannot be made reactive: ${String(e)}`), e;
	if (e.__v_raw && (!t || !e.__v_isReactive)) return e;
	const s = r.get(e);
	if (s) return s;
	const o =
		(a = e).__v_skip || !Object.isExtensible(a)
			? 0
			: (function (e) {
					switch (e) {
						case "Object":
						case "Array":
							return 1;
						case "Map":
						case "Set":
						case "WeakMap":
						case "WeakSet":
							return 2;
						default:
							return 0;
					}
				})(Zt(a));
	var a;
	if (0 === o) return e;
	const l = new Proxy(e, 2 === o ? n : i);
	return r.set(e, l), l;
}
function _i(e) {
	return (e && _i(e.__v_raw)) || e;
}
function Ti(e) {
	return Boolean(e && !0 === e.__v_isRef);
}
L("nextTick", () => Me),
	L("dispatch", (e) => ge.bind(ge, e)),
	L("watch", (e, { evaluateLater: t, cleanup: i }) => (e, n) => {
		let r = t(e),
			s = O(() => {
				let e;
				return r((t) => (e = t)), e;
			}, n);
		i(s);
	}),
	L("store", function () {
		return ct;
	}),
	L("data", (e) => T(e)),
	L("root", (e) => Pe(e)),
	L(
		"refs",
		(e) => (
			e._x_refs_proxy ||
				(e._x_refs_proxy = C(
					(function (e) {
						let t = [];
						return (
							Ze(e, (e) => {
								e._x_refs && t.push(e._x_refs);
							}),
							t
						);
					})(e),
				)),
			e._x_refs_proxy
		),
	);
var Xi = {};
function Ai(e) {
	return Xi[e] || (Xi[e] = 0), ++Xi[e];
}
function Ci(e, t, i) {
	L(t, (n) =>
		be(
			`You can't use [$${t}] without first installing the "${e}" plugin here: https://alpinejs.dev/plugins/${i}`,
			n,
		),
	);
}
L(
	"id",
	(e, { cleanup: t }) =>
		(i, n = null) =>
			(function (e, t, i, n) {
				e._x_id || (e._x_id = {});
				if (e._x_id[t]) return e._x_id[t];
				let r = n();
				return (
					(e._x_id[t] = r),
					i(() => {
						delete e._x_id[t];
					}),
					r
				);
			})(e, `${i}${n ? `-${n}` : ""}`, t, () => {
				let t = (function (e, t) {
						return Ze(e, (e) => {
							if (e._x_ids && e._x_ids[t]) return !0;
						});
					})(e, i),
					r = t ? t._x_ids[i] : Ai(i);
				return n ? `${i}-${r}-${n}` : `${i}-${r}`;
			}),
),
	Ge((e, t) => {
		e._x_id && (t._x_id = e._x_id);
	}),
	L("el", (e) => e),
	Ci("Focus", "focus", "focus"),
	Ci("Persist", "persist", "persist"),
	te(
		"modelable",
		(e, { expression: t }, { effect: i, evaluateLater: n, cleanup: r }) => {
			let s = n(t),
				o = () => {
					let e;
					return s((t) => (e = t)), e;
				},
				a = n(`${t} = __placeholder`),
				l = (e) => a(() => {}, { scope: { __placeholder: e } }),
				h = o();
			l(h),
				queueMicrotask(() => {
					if (!e._x_model) return;
					e._x_removeModelListeners.default();
					let t = e._x_model.get,
						i = e._x_model.set,
						n = lt(
							{
								get: () => t(),
								set(e) {
									i(e);
								},
							},
							{
								get: () => o(),
								set(e) {
									l(e);
								},
							},
						);
					r(n);
				});
		},
	),
	te("teleport", (e, { modifiers: t, expression: i }, { cleanup: n }) => {
		"template" !== e.tagName.toLowerCase() &&
			be("x-teleport can only be used on a <template> tag", e);
		let r = Mi(i),
			s = e.content.cloneNode(!0).firstElementChild;
		(e._x_teleport = s),
			(s._x_teleportBack = e),
			e.setAttribute("data-teleport-template", !0),
			s.setAttribute("data-teleport-target", !0),
			e._x_forwardEvents &&
				e._x_forwardEvents.forEach((t) => {
					s.addEventListener(t, (t) => {
						t.stopPropagation(), e.dispatchEvent(new t.constructor(t.type, t));
					});
				}),
			X(s, {}, e);
		let o = (e, t, i) => {
			i.includes("prepend")
				? t.parentNode.insertBefore(e, t)
				: i.includes("append")
					? t.parentNode.insertBefore(e, t.nextSibling)
					: t.appendChild(e);
		};
		$(() => {
			o(s, r, t),
				Ie(() => {
					Xe(s);
				})();
		}),
			(e._x_teleportPutBack = () => {
				let n = Mi(i);
				$(() => {
					o(e._x_teleport, n, t);
				});
			}),
			n(() =>
				$(() => {
					s.remove(), Ae(s);
				}),
			);
	});
var Ri = document.createElement("div");
function Mi(e) {
	let t = Ie(
		() => document.querySelector(e),
		() => Ri,
	)();
	return t || be(`Cannot find x-teleport element for selector: "${e}"`), t;
}
var ji = () => {};
function Ei(e, t, i, n) {
	let r = e,
		s = (e) => n(e),
		o = {},
		a = (e, t) => (i) => t(e, i);
	if (
		(i.includes("dot") && (t = t.replace(/-/g, ".")),
		i.includes("camel") &&
			(t = (function (e) {
				return e.toLowerCase().replace(/-(\w)/g, (e, t) => t.toUpperCase());
			})(t)),
		i.includes("passive") && (o.passive = !0),
		i.includes("capture") && (o.capture = !0),
		i.includes("window") && (r = window),
		i.includes("document") && (r = document),
		i.includes("debounce"))
	) {
		let e = i[i.indexOf("debounce") + 1] || "invalid-wait",
			t = qi(e.split("ms")[0]) ? Number(e.split("ms")[0]) : 250;
		s = ot(s, t);
	}
	if (i.includes("throttle")) {
		let e = i[i.indexOf("throttle") + 1] || "invalid-wait",
			t = qi(e.split("ms")[0]) ? Number(e.split("ms")[0]) : 250;
		s = at(s, t);
	}
	return (
		i.includes("prevent") &&
			(s = a(s, (e, t) => {
				t.preventDefault(), e(t);
			})),
		i.includes("stop") &&
			(s = a(s, (e, t) => {
				t.stopPropagation(), e(t);
			})),
		i.includes("once") &&
			(s = a(s, (e, i) => {
				e(i), r.removeEventListener(t, s, o);
			})),
		(i.includes("away") || i.includes("outside")) &&
			((r = document),
			(s = a(s, (t, i) => {
				e.contains(i.target) ||
					(!1 !== i.target.isConnected &&
						((e.offsetWidth < 1 && e.offsetHeight < 1) ||
							(!1 !== e._x_isShown && t(i))));
			}))),
		i.includes("self") &&
			(s = a(s, (t, i) => {
				i.target === e && t(i);
			})),
		((function (e) {
			return ["keydown", "keyup"].includes(e);
		})(t) ||
			Vi(t)) &&
			(s = a(s, (e, t) => {
				(function (e, t) {
					let i = t.filter(
						(e) =>
							![
								"window",
								"document",
								"prevent",
								"stop",
								"once",
								"capture",
								"self",
								"away",
								"outside",
								"passive",
							].includes(e),
					);
					if (i.includes("debounce")) {
						let e = i.indexOf("debounce");
						i.splice(
							e,
							qi((i[e + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1,
						);
					}
					if (i.includes("throttle")) {
						let e = i.indexOf("throttle");
						i.splice(
							e,
							qi((i[e + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1,
						);
					}
					if (0 === i.length) return !1;
					if (1 === i.length && Li(e.key).includes(i[0])) return !1;
					const n = ["ctrl", "shift", "alt", "meta", "cmd", "super"].filter(
						(e) => i.includes(e),
					);
					if (((i = i.filter((e) => !n.includes(e))), n.length > 0)) {
						if (
							n.filter(
								(t) => (
									("cmd" !== t && "super" !== t) || (t = "meta"), e[`${t}Key`]
								),
							).length === n.length
						) {
							if (Vi(e.type)) return !1;
							if (Li(e.key).includes(i[0])) return !1;
						}
					}
					return !0;
				})(t, i) || e(t);
			})),
		r.addEventListener(t, s, o),
		() => {
			r.removeEventListener(t, s, o);
		}
	);
}
function qi(e) {
	return !Array.isArray(e) && !isNaN(e);
}
function Vi(e) {
	return ["contextmenu", "click", "mouse"].some((t) => e.includes(t));
}
function Li(e) {
	if (!e) return [];
	var t;
	e = [" ", "_"].includes((t = e))
		? t
		: t
				.replace(/([a-z])([A-Z])/g, "$1-$2")
				.replace(/[_\s]/, "-")
				.toLowerCase();
	let i = {
		ctrl: "control",
		slash: "/",
		space: " ",
		spacebar: " ",
		cmd: "meta",
		esc: "escape",
		up: "arrow-up",
		down: "arrow-down",
		left: "arrow-left",
		right: "arrow-right",
		period: ".",
		comma: ",",
		equal: "=",
		minus: "-",
		underscore: "_",
	};
	return (
		(i[e] = e),
		Object.keys(i)
			.map((t) => {
				if (i[t] === e) return t;
			})
			.filter((e) => e)
	);
}
function Wi(e, t, i, n) {
	return $(() => {
		if (i instanceof CustomEvent && void 0 !== i.detail)
			return null !== i.detail && void 0 !== i.detail
				? i.detail
				: i.target.value;
		if (rt(e)) {
			if (Array.isArray(n)) {
				let e = null;
				return (
					(e = t.includes("number")
						? zi(i.target.value)
						: t.includes("boolean")
							? et(i.target.value)
							: i.target.value),
					i.target.checked
						? n.includes(e)
							? n
							: n.concat([e])
						: n.filter((t) => !(t == e))
				);
			}
			return i.target.checked;
		}
		if ("select" === e.tagName.toLowerCase() && e.multiple)
			return t.includes("number")
				? Array.from(i.target.selectedOptions).map((e) => zi(e.value || e.text))
				: t.includes("boolean")
					? Array.from(i.target.selectedOptions).map((e) =>
							et(e.value || e.text),
						)
					: Array.from(i.target.selectedOptions).map((e) => e.value || e.text);
		{
			let r;
			return (
				(r = st(e) ? (i.target.checked ? i.target.value : n) : i.target.value),
				t.includes("number")
					? zi(r)
					: t.includes("boolean")
						? et(r)
						: t.includes("trim")
							? r.trim()
							: r
			);
		}
	});
}
function zi(e) {
	let t = e ? parseFloat(e) : null;
	return (i = t), Array.isArray(i) || isNaN(i) ? e : t;
	var i;
}
function Yi(e) {
	return (
		null !== e &&
		"object" == typeof e &&
		"function" == typeof e.get &&
		"function" == typeof e.set
	);
}
(ji.inline = (e, { modifiers: t }, { cleanup: i }) => {
	t.includes("self") ? (e._x_ignoreSelf = !0) : (e._x_ignore = !0),
		i(() => {
			t.includes("self") ? delete e._x_ignoreSelf : delete e._x_ignore;
		});
}),
	te("ignore", ji),
	te(
		"effect",
		Ie((e, { expression: t }, { effect: i }) => {
			i(U(e, t));
		}),
	),
	te(
		"model",
		(e, { modifiers: t, expression: i }, { effect: n, cleanup: r }) => {
			let s = e;
			t.includes("parent") && (s = e.parentNode);
			let o,
				a = U(s, i);
			o =
				"string" == typeof i
					? U(s, `${i} = __placeholder`)
					: "function" == typeof i && "string" == typeof i()
						? U(s, `${i()} = __placeholder`)
						: () => {};
			let l = () => {
					let e;
					return a((t) => (e = t)), Yi(e) ? e.get() : e;
				},
				h = (e) => {
					let t;
					a((e) => (t = e)),
						Yi(t) ? t.set(e) : o(() => {}, { scope: { __placeholder: e } });
				};
			"string" == typeof i &&
				"radio" === e.type &&
				$(() => {
					e.hasAttribute("name") || e.setAttribute("name", i);
				});
			var c =
				"select" === e.tagName.toLowerCase() ||
				["checkbox", "radio"].includes(e.type) ||
				t.includes("lazy")
					? "change"
					: "input";
			let u = Be
				? () => {}
				: Ei(e, c, t, (i) => {
						h(Wi(e, t, i, l()));
					});
			if (
				(t.includes("fill") &&
					([void 0, null, ""].includes(l()) ||
						(rt(e) && Array.isArray(l())) ||
						("select" === e.tagName.toLowerCase() && e.multiple)) &&
					h(Wi(e, t, { target: e }, l())),
				e._x_removeModelListeners || (e._x_removeModelListeners = {}),
				(e._x_removeModelListeners.default = u),
				r(() => e._x_removeModelListeners.default()),
				e.form)
			) {
				let i = Ei(e.form, "reset", [], (i) => {
					Me(() => e._x_model && e._x_model.set(Wi(e, t, { target: e }, l())));
				});
				r(() => i());
			}
			(e._x_model = {
				get: () => l(),
				set(e) {
					h(e);
				},
			}),
				(e._x_forceModelUpdate = (t) => {
					void 0 === t && "string" == typeof i && i.match(/\./) && (t = ""),
						(window.fromModel = !0),
						$(() => Fe(e, "value", t)),
						delete window.fromModel;
				}),
				n(() => {
					let i = l();
					(t.includes("unintrusive") && document.activeElement.isSameNode(e)) ||
						e._x_forceModelUpdate(i);
				});
		},
	),
	te("cloak", (e) =>
		queueMicrotask(() => $(() => e.removeAttribute(J("cloak")))),
	),
	$e(() => `[${J("init")}]`),
	te(
		"init",
		Ie((e, { expression: t }, { evaluate: i }) =>
			"string" == typeof t ? !!t.trim() && i(t, {}, !1) : i(t, {}, !1),
		),
	),
	te("text", (e, { expression: t }, { effect: i, evaluateLater: n }) => {
		let r = n(t);
		i(() => {
			r((t) => {
				$(() => {
					e.textContent = t;
				});
			});
		});
	}),
	te("html", (e, { expression: t }, { effect: i, evaluateLater: n }) => {
		let r = n(t);
		i(() => {
			r((t) => {
				$(() => {
					(e.innerHTML = t),
						(e._x_ignoreSelf = !0),
						Xe(e),
						delete e._x_ignoreSelf;
				});
			});
		});
	}),
	ue(le(":", J("bind:")));
var Di = (
	e,
	{ value: t, modifiers: i, expression: n, original: r },
	{ effect: s, cleanup: o },
) => {
	if (!t) {
		let t = {};
		return (
			(a = t),
			Object.entries(ft).forEach(([e, t]) => {
				Object.defineProperty(a, e, {
					get:
						() =>
						(...e) =>
							t(...e),
				});
			}),
			void U(e, n)(
				(t) => {
					Ot(e, t, r);
				},
				{ scope: t },
			)
		);
	}
	var a;
	if ("key" === t)
		return (function (e, t) {
			e._x_keyExpression = t;
		})(e, n);
	if (
		e._x_inlineBindings &&
		e._x_inlineBindings[t] &&
		e._x_inlineBindings[t].extract
	)
		return;
	let l = U(e, n);
	s(() =>
		l((r) => {
			void 0 === r && "string" == typeof n && n.match(/\./) && (r = ""),
				$(() => Fe(e, t, r, i));
		}),
	),
		o(() => {
			e._x_undoAddedClasses && e._x_undoAddedClasses(),
				e._x_undoAddedStyles && e._x_undoAddedStyles();
		});
};
function Bi(e, t, i, n) {
	let r = {};
	if (/^\[.*\]$/.test(e.item) && Array.isArray(t)) {
		let i = e.item
			.replace("[", "")
			.replace("]", "")
			.split(",")
			.map((e) => e.trim());
		i.forEach((e, i) => {
			r[e] = t[i];
		});
	} else if (
		/^\{.*\}$/.test(e.item) &&
		!Array.isArray(t) &&
		"object" == typeof t
	) {
		let i = e.item
			.replace("{", "")
			.replace("}", "")
			.split(",")
			.map((e) => e.trim());
		i.forEach((e) => {
			r[e] = t[e];
		});
	} else r[e.item] = t;
	return e.index && (r[e.index] = i), e.collection && (r[e.collection] = n), r;
}
function Ii() {}
function Ui(e, t, i) {
	te(t, (n) =>
		be(
			`You can't use [x-${t}] without first installing the "${e}" plugin here: https://alpinejs.dev/plugins/${i}`,
			n,
		),
	);
}
(Di.inline = (e, { value: t, modifiers: i, expression: n }) => {
	t &&
		(e._x_inlineBindings || (e._x_inlineBindings = {}),
		(e._x_inlineBindings[t] = { expression: n, extract: !1 }));
}),
	te("bind", Di),
	ve(() => `[${J("data")}]`),
	te("data", (t, { expression: i }, { cleanup: n }) => {
		if (
			(function (e) {
				return !!Be && (!!Ne || e.hasAttribute("data-has-alpine-state"));
			})(t)
		)
			return;
		i = "" === i ? "{}" : i;
		let r = {};
		W(r, t);
		let s = {};
		var o, a;
		(o = s),
			(a = r),
			Object.entries(dt).forEach(([e, t]) => {
				Object.defineProperty(o, e, {
					get:
						() =>
						(...e) =>
							t.bind(a)(...e),
					enumerable: !1,
				});
			});
		let l = I(t, i, { scope: s });
		(void 0 !== l && !0 !== l) || (l = {}), W(l, t);
		let h = e(l);
		j(h);
		let c = X(t, h);
		h.init && I(t, h.init),
			n(() => {
				h.destroy && I(t, h.destroy), c();
			});
	}),
	Ge((e, t) => {
		e._x_dataStack &&
			((t._x_dataStack = e._x_dataStack),
			t.setAttribute("data-has-alpine-state", !0));
	}),
	te("show", (e, { modifiers: t, expression: i }, { effect: n }) => {
		let r = U(e, i);
		e._x_doHide ||
			(e._x_doHide = () => {
				$(() => {
					e.style.setProperty(
						"display",
						"none",
						t.includes("important") ? "important" : void 0,
					);
				});
			}),
			e._x_doShow ||
				(e._x_doShow = () => {
					$(() => {
						1 === e.style.length && "none" === e.style.display
							? e.removeAttribute("style")
							: e.style.removeProperty("display");
					});
				});
		let s,
			o = () => {
				e._x_doHide(), (e._x_isShown = !1);
			},
			a = () => {
				e._x_doShow(), (e._x_isShown = !0);
			},
			l = () => setTimeout(a),
			h = Le(
				(e) => (e ? a() : o()),
				(t) => {
					"function" == typeof e._x_toggleAndCascadeWithTransitions
						? e._x_toggleAndCascadeWithTransitions(e, t, a, o)
						: t
							? l()
							: o();
				},
			),
			c = !0;
		n(() =>
			r((e) => {
				(c || e !== s) &&
					(t.includes("immediate") && (e ? l() : o()), h(e), (s = e), (c = !1));
			}),
		);
	}),
	te("for", (t, { expression: i }, { effect: n, cleanup: r }) => {
		let s = (function (e) {
				let t = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/,
					i = /^\s*\(|\)\s*$/g,
					n = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
					r = e.match(n);
				if (!r) return;
				let s = {};
				s.items = r[2].trim();
				let o = r[1].replace(i, "").trim(),
					a = o.match(t);
				a
					? ((s.item = o.replace(t, "").trim()),
						(s.index = a[1].trim()),
						a[2] && (s.collection = a[2].trim()))
					: (s.item = o);
				return s;
			})(i),
			o = U(t, s.items),
			a = U(t, t._x_keyExpression || "index");
		(t._x_prevKeys = []),
			(t._x_lookup = {}),
			n(() =>
				(function (t, i, n, r) {
					let s = (e) => "object" == typeof e && !Array.isArray(e),
						o = t;
					n((n) => {
						var a;
						(a = n),
							!Array.isArray(a) &&
								!isNaN(a) &&
								n >= 0 &&
								(n = Array.from(Array(n).keys(), (e) => e + 1)),
							void 0 === n && (n = []);
						let l = t._x_lookup,
							h = t._x_prevKeys,
							c = [],
							u = [];
						if (s(n))
							n = Object.entries(n).map(([e, s]) => {
								let o = Bi(i, s, e, n);
								r(
									(e) => {
										u.includes(e) && be("Duplicate key on x-for", t), u.push(e);
									},
									{ scope: { index: e, ...o } },
								),
									c.push(o);
							});
						else
							for (let e = 0; e < n.length; e++) {
								let s = Bi(i, n[e], e, n);
								r(
									(e) => {
										u.includes(e) && be("Duplicate key on x-for", t), u.push(e);
									},
									{ scope: { index: e, ...s } },
								),
									c.push(s);
							}
						let f = [],
							O = [],
							d = [],
							p = [];
						for (let e = 0; e < h.length; e++) {
							let t = h[e];
							-1 === u.indexOf(t) && d.push(t);
						}
						h = h.filter((e) => !d.includes(e));
						let m = "template";
						for (let e = 0; e < u.length; e++) {
							let t = u[e],
								i = h.indexOf(t);
							if (-1 === i) h.splice(e, 0, t), f.push([m, e]);
							else if (i !== e) {
								let t = h.splice(e, 1)[0],
									n = h.splice(i - 1, 1)[0];
								h.splice(e, 0, n), h.splice(i, 0, t), O.push([t, n]);
							} else p.push(t);
							m = t;
						}
						for (let e = 0; e < d.length; e++) {
							let t = d[e];
							t in l &&
								($(() => {
									Ae(l[t]), l[t].remove();
								}),
								delete l[t]);
						}
						for (let e = 0; e < O.length; e++) {
							let [t, i] = O[e],
								n = l[t],
								r = l[i],
								s = document.createElement("div");
							$(() => {
								r || be('x-for ":key" is undefined or invalid', o, i, l),
									r.after(s),
									n.after(r),
									r._x_currentIfEl && r.after(r._x_currentIfEl),
									s.before(n),
									n._x_currentIfEl && n.after(n._x_currentIfEl),
									s.remove();
							}),
								r._x_refreshXForScope(c[u.indexOf(i)]);
						}
						for (let t = 0; t < f.length; t++) {
							let [i, n] = f[t],
								r = "template" === i ? o : l[i];
							r._x_currentIfEl && (r = r._x_currentIfEl);
							let s = c[n],
								a = u[n],
								h = document.importNode(o.content, !0).firstElementChild,
								O = e(s);
							X(h, O, o),
								(h._x_refreshXForScope = (e) => {
									Object.entries(e).forEach(([e, t]) => {
										O[e] = t;
									});
								}),
								$(() => {
									r.after(h), Ie(() => Xe(h))();
								}),
								"object" == typeof a &&
									be(
										"x-for key cannot be an object, it must be a string or an integer",
										o,
									),
								(l[a] = h);
						}
						for (let e = 0; e < p.length; e++)
							l[p[e]]._x_refreshXForScope(c[u.indexOf(p[e])]);
						o._x_prevKeys = u;
					});
				})(t, s, o, a),
			),
			r(() => {
				Object.values(t._x_lookup).forEach((e) =>
					$(() => {
						Ae(e), e.remove();
					}),
				),
					delete t._x_prevKeys,
					delete t._x_lookup;
			});
	}),
	(Ii.inline = (e, { expression: t }, { cleanup: i }) => {
		let n = Pe(e);
		n._x_refs || (n._x_refs = {}),
			(n._x_refs[t] = e),
			i(() => delete n._x_refs[t]);
	}),
	te("ref", Ii),
	te("if", (e, { expression: t }, { effect: i, cleanup: n }) => {
		"template" !== e.tagName.toLowerCase() &&
			be("x-if can only be used on a <template> tag", e);
		let r = U(e, t);
		i(() =>
			r((t) => {
				t
					? (() => {
							if (e._x_currentIfEl) return e._x_currentIfEl;
							let t = e.content.cloneNode(!0).firstElementChild;
							X(t, {}, e),
								$(() => {
									e.after(t), Ie(() => Xe(t))();
								}),
								(e._x_currentIfEl = t),
								(e._x_undoIf = () => {
									$(() => {
										Ae(t), t.remove();
									}),
										delete e._x_currentIfEl;
								});
						})()
					: e._x_undoIf && (e._x_undoIf(), delete e._x_undoIf);
			}),
		),
			n(() => e._x_undoIf && e._x_undoIf());
	}),
	te("id", (e, { expression: t }, { evaluate: i }) => {
		i(t).forEach((t) =>
			(function (e, t) {
				e._x_ids || (e._x_ids = {}), e._x_ids[t] || (e._x_ids[t] = Ai(t));
			})(e, t),
		);
	}),
	Ge((e, t) => {
		e._x_ids && (t._x_ids = e._x_ids);
	}),
	ue(le("@", J("on:"))),
	te(
		"on",
		Ie((e, { value: t, modifiers: i, expression: n }, { cleanup: r }) => {
			let s = n ? U(e, n) : () => {};
			"template" === e.tagName.toLowerCase() &&
				(e._x_forwardEvents || (e._x_forwardEvents = []),
				e._x_forwardEvents.includes(t) || e._x_forwardEvents.push(t));
			let o = Ei(e, t, i, (e) => {
				s(() => {}, { scope: { $event: e }, params: [e] });
			});
			r(() => o());
		}),
	),
	Ui("Collapse", "collapse", "collapse"),
	Ui("Intersect", "intersect", "intersect"),
	Ui("Focus", "trap", "focus"),
	Ui("Mask", "mask", "mask"),
	mt.setEvaluator(N),
	mt.setReactivityEngine({
		reactive: $i,
		effect: function (e, t = bt) {
			(function (e) {
				return e && !0 === e._isEffect;
			})(e) && (e = e.raw);
			const i = (function (e, t) {
				const i = function () {
					if (!i.active) return e();
					if (!Ct.includes(i)) {
						Et(i);
						try {
							return Vt.push(qt), (qt = !0), Ct.push(i), (xt = i), e();
						} finally {
							Ct.pop(), Lt(), (xt = Ct[Ct.length - 1]);
						}
					}
				};
				return (
					(i.id = jt++),
					(i.allowRecurse = !!t.allowRecurse),
					(i._isEffect = !0),
					(i.active = !0),
					(i.raw = e),
					(i.deps = []),
					(i.options = t),
					i
				);
			})(e, t);
			return t.lazy || i(), i;
		},
		release: function (e) {
			e.active &&
				(Et(e), e.options.onStop && e.options.onStop(), (e.active = !1));
		},
		raw: _i,
	});
var Gi = mt;
let Ni = [],
	Hi = [];
function Fi(e) {
	if (e < 768) return !1;
	for (let t = 0, i = Ni.length; ; ) {
		let n = (t + i) >> 1;
		if (e < Ni[n]) i = n;
		else {
			if (!(e >= Hi[n])) return !0;
			t = n + 1;
		}
		if (t == i) return !1;
	}
}
function Ki(e) {
	return e >= 127462 && e <= 127487;
}
(() => {
	let e =
		"lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o"
			.split(",")
			.map((e) => (e ? parseInt(e, 36) : 1));
	for (let t = 0, i = 0; t < e.length; t++) (t % 2 ? Hi : Ni).push((i += e[t]));
})();
function Ji(e, t, i = !0, n = !0) {
	return (i ? en : tn)(e, t, n);
}
function en(e, t, i) {
	if (t == e.length) return t;
	t && rn(e.charCodeAt(t)) && sn(e.charCodeAt(t - 1)) && t--;
	let n = nn(e, t);
	for (t += on(n); t < e.length; ) {
		let r = nn(e, t);
		if (8205 == n || 8205 == r || (i && Fi(r))) (t += on(r)), (n = r);
		else {
			if (!Ki(r)) break;
			{
				let i = 0,
					n = t - 2;
				for (; n >= 0 && Ki(nn(e, n)); ) i++, (n -= 2);
				if (i % 2 == 0) break;
				t += 2;
			}
		}
	}
	return t;
}
function tn(e, t, i) {
	for (; t > 0; ) {
		let n = en(e, t - 2, i);
		if (n < t) return n;
		t--;
	}
	return 0;
}
function nn(e, t) {
	let i = e.charCodeAt(t);
	if (!sn(i) || t + 1 == e.length) return i;
	let n = e.charCodeAt(t + 1);
	return rn(n) ? n - 56320 + ((i - 55296) << 10) + 65536 : i;
}
function rn(e) {
	return e >= 56320 && e < 57344;
}
function sn(e) {
	return e >= 55296 && e < 56320;
}
function on(e) {
	return e < 65536 ? 1 : 2;
}
class an {
	lineAt(e) {
		if (e < 0 || e > this.length)
			throw new RangeError(
				`Invalid position ${e} in document of length ${this.length}`,
			);
		return this.lineInner(e, !1, 1, 0);
	}
	line(e) {
		if (e < 1 || e > this.lines)
			throw new RangeError(
				`Invalid line number ${e} in ${this.lines}-line document`,
			);
		return this.lineInner(e, !0, 1, 0);
	}
	replace(e, t, i) {
		[e, t] = mn(this, e, t);
		let n = [];
		return (
			this.decompose(0, e, n, 2),
			i.length && i.decompose(0, i.length, n, 3),
			this.decompose(t, this.length, n, 1),
			hn.from(n, this.length - (t - e) + i.length)
		);
	}
	append(e) {
		return this.replace(this.length, this.length, e);
	}
	slice(e, t = this.length) {
		[e, t] = mn(this, e, t);
		let i = [];
		return this.decompose(e, t, i, 0), hn.from(i, t - e);
	}
	eq(e) {
		if (e == this) return !0;
		if (e.length != this.length || e.lines != this.lines) return !1;
		let t = this.scanIdentical(e, 1),
			i = this.length - this.scanIdentical(e, -1),
			n = new fn(this),
			r = new fn(e);
		for (let e = t, s = t; ; ) {
			if (
				(n.next(e),
				r.next(e),
				(e = 0),
				n.lineBreak != r.lineBreak || n.done != r.done || n.value != r.value)
			)
				return !1;
			if (((s += n.value.length), n.done || s >= i)) return !0;
		}
	}
	iter(e = 1) {
		return new fn(this, e);
	}
	iterRange(e, t = this.length) {
		return new On(this, e, t);
	}
	iterLines(e, t) {
		let i;
		if (null == e) i = this.iter();
		else {
			null == t && (t = this.lines + 1);
			let n = this.line(e).from;
			i = this.iterRange(
				n,
				Math.max(
					n,
					t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to,
				),
			);
		}
		return new dn(i);
	}
	toString() {
		return this.sliceString(0);
	}
	toJSON() {
		let e = [];
		return this.flatten(e), e;
	}
	constructor() {}
	static of(e) {
		if (0 == e.length)
			throw new RangeError("A document must have at least one line");
		return 1 != e.length || e[0]
			? e.length <= 32
				? new ln(e)
				: hn.from(ln.split(e, []))
			: an.empty;
	}
}
class ln extends an {
	constructor(
		e,
		t = (function (e) {
			let t = -1;
			for (let i of e) t += i.length + 1;
			return t;
		})(e),
	) {
		super(), (this.text = e), (this.length = t);
	}
	get lines() {
		return this.text.length;
	}
	get children() {
		return null;
	}
	lineInner(e, t, i, n) {
		for (let r = 0; ; r++) {
			let s = this.text[r],
				o = n + s.length;
			if ((t ? i : o) >= e) return new pn(n, o, i, s);
			(n = o + 1), i++;
		}
	}
	decompose(e, t, i, n) {
		let r =
			e <= 0 && t >= this.length
				? this
				: new ln(
						un(this.text, e, t),
						Math.min(t, this.length) - Math.max(0, e),
					);
		if (1 & n) {
			let e = i.pop(),
				t = cn(r.text, e.text.slice(), 0, r.length);
			if (t.length <= 32) i.push(new ln(t, e.length + r.length));
			else {
				let e = t.length >> 1;
				i.push(new ln(t.slice(0, e)), new ln(t.slice(e)));
			}
		} else i.push(r);
	}
	replace(e, t, i) {
		if (!(i instanceof ln)) return super.replace(e, t, i);
		[e, t] = mn(this, e, t);
		let n = cn(this.text, cn(i.text, un(this.text, 0, e)), t),
			r = this.length + i.length - (t - e);
		return n.length <= 32 ? new ln(n, r) : hn.from(ln.split(n, []), r);
	}
	sliceString(e, t = this.length, i = "\n") {
		[e, t] = mn(this, e, t);
		let n = "";
		for (let r = 0, s = 0; r <= t && s < this.text.length; s++) {
			let o = this.text[s],
				a = r + o.length;
			r > e && s && (n += i),
				e < a && t > r && (n += o.slice(Math.max(0, e - r), t - r)),
				(r = a + 1);
		}
		return n;
	}
	flatten(e) {
		for (let t of this.text) e.push(t);
	}
	scanIdentical() {
		return 0;
	}
	static split(e, t) {
		let i = [],
			n = -1;
		for (let r of e)
			i.push(r),
				(n += r.length + 1),
				32 == i.length && (t.push(new ln(i, n)), (i = []), (n = -1));
		return n > -1 && t.push(new ln(i, n)), t;
	}
}
class hn extends an {
	constructor(e, t) {
		super(), (this.children = e), (this.length = t), (this.lines = 0);
		for (let t of e) this.lines += t.lines;
	}
	lineInner(e, t, i, n) {
		for (let r = 0; ; r++) {
			let s = this.children[r],
				o = n + s.length,
				a = i + s.lines - 1;
			if ((t ? a : o) >= e) return s.lineInner(e, t, i, n);
			(n = o + 1), (i = a + 1);
		}
	}
	decompose(e, t, i, n) {
		for (let r = 0, s = 0; s <= t && r < this.children.length; r++) {
			let o = this.children[r],
				a = s + o.length;
			if (e <= a && t >= s) {
				let r = n & ((s <= e ? 1 : 0) | (a >= t ? 2 : 0));
				s >= e && a <= t && !r ? i.push(o) : o.decompose(e - s, t - s, i, r);
			}
			s = a + 1;
		}
	}
	replace(e, t, i) {
		if ((([e, t] = mn(this, e, t)), i.lines < this.lines))
			for (let n = 0, r = 0; n < this.children.length; n++) {
				let s = this.children[n],
					o = r + s.length;
				if (e >= r && t <= o) {
					let a = s.replace(e - r, t - r, i),
						l = this.lines - s.lines + a.lines;
					if (a.lines < l >> 4 && a.lines > l >> 6) {
						let r = this.children.slice();
						return (r[n] = a), new hn(r, this.length - (t - e) + i.length);
					}
					return super.replace(r, o, a);
				}
				r = o + 1;
			}
		return super.replace(e, t, i);
	}
	sliceString(e, t = this.length, i = "\n") {
		[e, t] = mn(this, e, t);
		let n = "";
		for (let r = 0, s = 0; r < this.children.length && s <= t; r++) {
			let o = this.children[r],
				a = s + o.length;
			s > e && r && (n += i),
				e < a && t > s && (n += o.sliceString(e - s, t - s, i)),
				(s = a + 1);
		}
		return n;
	}
	flatten(e) {
		for (let t of this.children) t.flatten(e);
	}
	scanIdentical(e, t) {
		if (!(e instanceof hn)) return 0;
		let i = 0,
			[n, r, s, o] =
				t > 0
					? [0, 0, this.children.length, e.children.length]
					: [this.children.length - 1, e.children.length - 1, -1, -1];
		for (; ; n += t, r += t) {
			if (n == s || r == o) return i;
			let a = this.children[n],
				l = e.children[r];
			if (a != l) return i + a.scanIdentical(l, t);
			i += a.length + 1;
		}
	}
	static from(e, t = e.reduce((e, t) => e + t.length + 1, -1)) {
		let i = 0;
		for (let t of e) i += t.lines;
		if (i < 32) {
			let i = [];
			for (let t of e) t.flatten(i);
			return new ln(i, t);
		}
		let n = Math.max(32, i >> 5),
			r = n << 1,
			s = n >> 1,
			o = [],
			a = 0,
			l = -1,
			h = [];
		function c(e) {
			let t;
			if (e.lines > r && e instanceof hn) for (let t of e.children) c(t);
			else
				e.lines > s && (a > s || !a)
					? (u(), o.push(e))
					: e instanceof ln &&
							a &&
							(t = h[h.length - 1]) instanceof ln &&
							e.lines + t.lines <= 32
						? ((a += e.lines),
							(l += e.length + 1),
							(h[h.length - 1] = new ln(
								t.text.concat(e.text),
								t.length + 1 + e.length,
							)))
						: (a + e.lines > n && u(),
							(a += e.lines),
							(l += e.length + 1),
							h.push(e));
		}
		function u() {
			0 != a &&
				(o.push(1 == h.length ? h[0] : hn.from(h, l)),
				(l = -1),
				(a = h.length = 0));
		}
		for (let t of e) c(t);
		return u(), 1 == o.length ? o[0] : new hn(o, t);
	}
}
function cn(e, t, i = 0, n = 1e9) {
	for (let r = 0, s = 0, o = !0; s < e.length && r <= n; s++) {
		let a = e[s],
			l = r + a.length;
		l >= i &&
			(l > n && (a = a.slice(0, n - r)),
			r < i && (a = a.slice(i - r)),
			o ? ((t[t.length - 1] += a), (o = !1)) : t.push(a)),
			(r = l + 1);
	}
	return t;
}
function un(e, t, i) {
	return cn(e, [""], t, i);
}
an.empty = new ln([""], 0);
class fn {
	constructor(e, t = 1) {
		(this.dir = t),
			(this.done = !1),
			(this.lineBreak = !1),
			(this.value = ""),
			(this.nodes = [e]),
			(this.offsets = [
				t > 0 ? 1 : (e instanceof ln ? e.text.length : e.children.length) << 1,
			]);
	}
	nextInner(e, t) {
		for (this.done = this.lineBreak = !1; ; ) {
			let i = this.nodes.length - 1,
				n = this.nodes[i],
				r = this.offsets[i],
				s = r >> 1,
				o = n instanceof ln ? n.text.length : n.children.length;
			if (s == (t > 0 ? o : 0)) {
				if (0 == i) return (this.done = !0), (this.value = ""), this;
				t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
			} else if ((1 & r) == (t > 0 ? 0 : 1)) {
				if (((this.offsets[i] += t), 0 == e))
					return (this.lineBreak = !0), (this.value = "\n"), this;
				e--;
			} else if (n instanceof ln) {
				let r = n.text[s + (t < 0 ? -1 : 0)];
				if (((this.offsets[i] += t), r.length > Math.max(0, e)))
					return (
						(this.value =
							0 == e ? r : t > 0 ? r.slice(e) : r.slice(0, r.length - e)),
						this
					);
				e -= r.length;
			} else {
				let r = n.children[s + (t < 0 ? -1 : 0)];
				e > r.length
					? ((e -= r.length), (this.offsets[i] += t))
					: (t < 0 && this.offsets[i]--,
						this.nodes.push(r),
						this.offsets.push(
							t > 0
								? 1
								: (r instanceof ln ? r.text.length : r.children.length) << 1,
						));
			}
		}
	}
	next(e = 0) {
		return (
			e < 0 && (this.nextInner(-e, -this.dir), (e = this.value.length)),
			this.nextInner(e, this.dir)
		);
	}
}
class On {
	constructor(e, t, i) {
		(this.value = ""),
			(this.done = !1),
			(this.cursor = new fn(e, t > i ? -1 : 1)),
			(this.pos = t > i ? e.length : 0),
			(this.from = Math.min(t, i)),
			(this.to = Math.max(t, i));
	}
	nextInner(e, t) {
		if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
			return (this.value = ""), (this.done = !0), this;
		e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
		let i = t < 0 ? this.pos - this.from : this.to - this.pos;
		e > i && (e = i), (i -= e);
		let { value: n } = this.cursor.next(e);
		return (
			(this.pos += (n.length + e) * t),
			(this.value =
				n.length <= i ? n : t < 0 ? n.slice(n.length - i) : n.slice(0, i)),
			(this.done = !this.value),
			this
		);
	}
	next(e = 0) {
		return (
			e < 0
				? (e = Math.max(e, this.from - this.pos))
				: e > 0 && (e = Math.min(e, this.to - this.pos)),
			this.nextInner(e, this.cursor.dir)
		);
	}
	get lineBreak() {
		return this.cursor.lineBreak && "" != this.value;
	}
}
class dn {
	constructor(e) {
		(this.inner = e),
			(this.afterBreak = !0),
			(this.value = ""),
			(this.done = !1);
	}
	next(e = 0) {
		let { done: t, lineBreak: i, value: n } = this.inner.next(e);
		return (
			t && this.afterBreak
				? ((this.value = ""), (this.afterBreak = !1))
				: t
					? ((this.done = !0), (this.value = ""))
					: i
						? this.afterBreak
							? (this.value = "")
							: ((this.afterBreak = !0), this.next())
						: ((this.value = n), (this.afterBreak = !1)),
			this
		);
	}
	get lineBreak() {
		return !1;
	}
}
"undefined" != typeof Symbol &&
	((an.prototype[Symbol.iterator] = function () {
		return this.iter();
	}),
	(fn.prototype[Symbol.iterator] =
		On.prototype[Symbol.iterator] =
		dn.prototype[Symbol.iterator] =
			function () {
				return this;
			}));
let pn = class {
	constructor(e, t, i, n) {
		(this.from = e), (this.to = t), (this.number = i), (this.text = n);
	}
	get length() {
		return this.to - this.from;
	}
};
function mn(e, t, i) {
	return [
		(t = Math.max(0, Math.min(e.length, t))),
		Math.max(t, Math.min(e.length, i)),
	];
}
function gn(e, t, i = !0, n = !0) {
	return Ji(e, t, i, n);
}
const xn = /\r\n?|\n/;
var bn = (function (e) {
	return (
		(e[(e.Simple = 0)] = "Simple"),
		(e[(e.TrackDel = 1)] = "TrackDel"),
		(e[(e.TrackBefore = 2)] = "TrackBefore"),
		(e[(e.TrackAfter = 3)] = "TrackAfter"),
		e
	);
})(bn || (bn = {}));
class Sn {
	constructor(e) {
		this.sections = e;
	}
	get length() {
		let e = 0;
		for (let t = 0; t < this.sections.length; t += 2) e += this.sections[t];
		return e;
	}
	get newLength() {
		let e = 0;
		for (let t = 0; t < this.sections.length; t += 2) {
			let i = this.sections[t + 1];
			e += i < 0 ? this.sections[t] : i;
		}
		return e;
	}
	get empty() {
		return (
			0 == this.sections.length ||
			(2 == this.sections.length && this.sections[1] < 0)
		);
	}
	iterGaps(e) {
		for (let t = 0, i = 0, n = 0; t < this.sections.length; ) {
			let r = this.sections[t++],
				s = this.sections[t++];
			s < 0 ? (e(i, n, r), (n += r)) : (n += s), (i += r);
		}
	}
	iterChangedRanges(e, t = !1) {
		kn(this, e, t);
	}
	get invertedDesc() {
		let e = [];
		for (let t = 0; t < this.sections.length; ) {
			let i = this.sections[t++],
				n = this.sections[t++];
			n < 0 ? e.push(i, n) : e.push(n, i);
		}
		return new Sn(e);
	}
	composeDesc(e) {
		return this.empty ? e : e.empty ? this : $n(this, e);
	}
	mapDesc(e, t = !1) {
		return e.empty ? this : vn(this, e, t);
	}
	mapPos(e, t = -1, i = bn.Simple) {
		let n = 0,
			r = 0;
		for (let s = 0; s < this.sections.length; ) {
			let o = this.sections[s++],
				a = this.sections[s++],
				l = n + o;
			if (a < 0) {
				if (l > e) return r + (e - n);
				r += o;
			} else {
				if (
					i != bn.Simple &&
					l >= e &&
					((i == bn.TrackDel && n < e && l > e) ||
						(i == bn.TrackBefore && n < e) ||
						(i == bn.TrackAfter && l > e))
				)
					return null;
				if (l > e || (l == e && t < 0 && !o))
					return e == n || t < 0 ? r : r + a;
				r += a;
			}
			n = l;
		}
		if (e > n)
			throw new RangeError(
				`Position ${e} is out of range for changeset of length ${n}`,
			);
		return r;
	}
	touchesRange(e, t = e) {
		for (let i = 0, n = 0; i < this.sections.length && n <= t; ) {
			let r = n + this.sections[i++];
			if (this.sections[i++] >= 0 && n <= t && r >= e)
				return !(n < e && r > t) || "cover";
			n = r;
		}
		return !1;
	}
	toString() {
		let e = "";
		for (let t = 0; t < this.sections.length; ) {
			let i = this.sections[t++],
				n = this.sections[t++];
			e += (e ? " " : "") + i + (n >= 0 ? ":" + n : "");
		}
		return e;
	}
	toJSON() {
		return this.sections;
	}
	static fromJSON(e) {
		if (
			!Array.isArray(e) ||
			e.length % 2 ||
			e.some((e) => "number" != typeof e)
		)
			throw new RangeError("Invalid JSON representation of ChangeDesc");
		return new Sn(e);
	}
	static create(e) {
		return new Sn(e);
	}
}
class yn extends Sn {
	constructor(e, t) {
		super(e), (this.inserted = t);
	}
	apply(e) {
		if (this.length != e.length)
			throw new RangeError(
				"Applying change set to a document with the wrong length",
			);
		return (
			kn(this, (t, i, n, r, s) => (e = e.replace(n, n + (i - t), s)), !1), e
		);
	}
	mapDesc(e, t = !1) {
		return vn(this, e, t, !0);
	}
	invert(e) {
		let t = this.sections.slice(),
			i = [];
		for (let n = 0, r = 0; n < t.length; n += 2) {
			let s = t[n],
				o = t[n + 1];
			if (o >= 0) {
				(t[n] = o), (t[n + 1] = s);
				let a = n >> 1;
				for (; i.length < a; ) i.push(an.empty);
				i.push(s ? e.slice(r, r + s) : an.empty);
			}
			r += s;
		}
		return new yn(t, i);
	}
	compose(e) {
		return this.empty ? e : e.empty ? this : $n(this, e, !0);
	}
	map(e, t = !1) {
		return e.empty ? this : vn(this, e, t, !0);
	}
	iterChanges(e, t = !1) {
		kn(this, e, t);
	}
	get desc() {
		return Sn.create(this.sections);
	}
	filter(e) {
		let t = [],
			i = [],
			n = [],
			r = new Pn(this);
		e: for (let s = 0, o = 0; ; ) {
			let a = s == e.length ? 1e9 : e[s++];
			for (; o < a || (o == a && 0 == r.len); ) {
				if (r.done) break e;
				let e = Math.min(r.len, a - o);
				Qn(n, e, -1);
				let s = -1 == r.ins ? -1 : 0 == r.off ? r.ins : 0;
				Qn(t, e, s), s > 0 && wn(i, t, r.text), r.forward(e), (o += e);
			}
			let l = e[s++];
			for (; o < l; ) {
				if (r.done) break e;
				let e = Math.min(r.len, l - o);
				Qn(t, e, -1),
					Qn(n, e, -1 == r.ins ? -1 : 0 == r.off ? r.ins : 0),
					r.forward(e),
					(o += e);
			}
		}
		return { changes: new yn(t, i), filtered: Sn.create(n) };
	}
	toJSON() {
		let e = [];
		for (let t = 0; t < this.sections.length; t += 2) {
			let i = this.sections[t],
				n = this.sections[t + 1];
			n < 0
				? e.push(i)
				: 0 == n
					? e.push([i])
					: e.push([i].concat(this.inserted[t >> 1].toJSON()));
		}
		return e;
	}
	static of(e, t, i) {
		let n = [],
			r = [],
			s = 0,
			o = null;
		function a(e = !1) {
			if (!e && !n.length) return;
			s < t && Qn(n, t - s, -1);
			let i = new yn(n, r);
			(o = o ? o.compose(i.map(o)) : i), (n = []), (r = []), (s = 0);
		}
		return (
			(function e(l) {
				if (Array.isArray(l)) for (let t of l) e(t);
				else if (l instanceof yn) {
					if (l.length != t)
						throw new RangeError(
							`Mismatched change set length (got ${l.length}, expected ${t})`,
						);
					a(), (o = o ? o.compose(l.map(o)) : l);
				} else {
					let { from: e, to: o = e, insert: h } = l;
					if (e > o || e < 0 || o > t)
						throw new RangeError(
							`Invalid change range ${e} to ${o} (in doc of length ${t})`,
						);
					let c = h
							? "string" == typeof h
								? an.of(h.split(i || xn))
								: h
							: an.empty,
						u = c.length;
					if (e == o && 0 == u) return;
					e < s && a(),
						e > s && Qn(n, e - s, -1),
						Qn(n, o - e, u),
						wn(r, n, c),
						(s = o);
				}
			})(e),
			a(!o),
			o
		);
	}
	static empty(e) {
		return new yn(e ? [e, -1] : [], []);
	}
	static fromJSON(e) {
		if (!Array.isArray(e))
			throw new RangeError("Invalid JSON representation of ChangeSet");
		let t = [],
			i = [];
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if ("number" == typeof r) t.push(r, -1);
			else {
				if (
					!Array.isArray(r) ||
					"number" != typeof r[0] ||
					r.some((e, t) => t && "string" != typeof e)
				)
					throw new RangeError("Invalid JSON representation of ChangeSet");
				if (1 == r.length) t.push(r[0], 0);
				else {
					for (; i.length < n; ) i.push(an.empty);
					(i[n] = an.of(r.slice(1))), t.push(r[0], i[n].length);
				}
			}
		}
		return new yn(t, i);
	}
	static createSet(e, t) {
		return new yn(e, t);
	}
}
function Qn(e, t, i, n = !1) {
	if (0 == t && i <= 0) return;
	let r = e.length - 2;
	r >= 0 && i <= 0 && i == e[r + 1]
		? (e[r] += t)
		: r >= 0 && 0 == t && 0 == e[r]
			? (e[r + 1] += i)
			: n
				? ((e[r] += t), (e[r + 1] += i))
				: e.push(t, i);
}
function wn(e, t, i) {
	if (0 == i.length) return;
	let n = (t.length - 2) >> 1;
	if (n < e.length) e[e.length - 1] = e[e.length - 1].append(i);
	else {
		for (; e.length < n; ) e.push(an.empty);
		e.push(i);
	}
}
function kn(e, t, i) {
	let n = e.inserted;
	for (let r = 0, s = 0, o = 0; o < e.sections.length; ) {
		let a = e.sections[o++],
			l = e.sections[o++];
		if (l < 0) (r += a), (s += a);
		else {
			let h = r,
				c = s,
				u = an.empty;
			for (
				;
				(h += a),
					(c += l),
					l && n && (u = u.append(n[(o - 2) >> 1])),
					!(i || o == e.sections.length || e.sections[o + 1] < 0);
			)
				(a = e.sections[o++]), (l = e.sections[o++]);
			t(r, h, s, c, u), (r = h), (s = c);
		}
	}
}
function vn(e, t, i, n = !1) {
	let r = [],
		s = n ? [] : null,
		o = new Pn(e),
		a = new Pn(t);
	for (let e = -1; ; ) {
		if ((o.done && a.len) || (a.done && o.len))
			throw new Error("Mismatched change set lengths");
		if (-1 == o.ins && -1 == a.ins) {
			let e = Math.min(o.len, a.len);
			Qn(r, e, -1), o.forward(e), a.forward(e);
		} else if (
			a.ins >= 0 &&
			(o.ins < 0 ||
				e == o.i ||
				(0 == o.off && (a.len < o.len || (a.len == o.len && !i))))
		) {
			let t = a.len;
			for (Qn(r, a.ins, -1); t; ) {
				let i = Math.min(o.len, t);
				o.ins >= 0 &&
					e < o.i &&
					o.len <= i &&
					(Qn(r, 0, o.ins), s && wn(s, r, o.text), (e = o.i)),
					o.forward(i),
					(t -= i);
			}
			a.next();
		} else {
			if (!(o.ins >= 0)) {
				if (o.done && a.done) return s ? yn.createSet(r, s) : Sn.create(r);
				throw new Error("Mismatched change set lengths");
			}
			{
				let t = 0,
					i = o.len;
				for (; i; )
					if (-1 == a.ins) {
						let e = Math.min(i, a.len);
						(t += e), (i -= e), a.forward(e);
					} else {
						if (!(0 == a.ins && a.len < i)) break;
						(i -= a.len), a.next();
					}
				Qn(r, t, e < o.i ? o.ins : 0),
					s && e < o.i && wn(s, r, o.text),
					(e = o.i),
					o.forward(o.len - i);
			}
		}
	}
}
function $n(e, t, i = !1) {
	let n = [],
		r = i ? [] : null,
		s = new Pn(e),
		o = new Pn(t);
	for (let e = !1; ; ) {
		if (s.done && o.done) return r ? yn.createSet(n, r) : Sn.create(n);
		if (0 == s.ins) Qn(n, s.len, 0, e), s.next();
		else if (0 != o.len || o.done) {
			if (s.done || o.done) throw new Error("Mismatched change set lengths");
			{
				let t = Math.min(s.len2, o.len),
					i = n.length;
				if (-1 == s.ins) {
					let i = -1 == o.ins ? -1 : o.off ? 0 : o.ins;
					Qn(n, t, i, e), r && i && wn(r, n, o.text);
				} else
					-1 == o.ins
						? (Qn(n, s.off ? 0 : s.len, t, e), r && wn(r, n, s.textBit(t)))
						: (Qn(n, s.off ? 0 : s.len, o.off ? 0 : o.ins, e),
							r && !o.off && wn(r, n, o.text));
				(e = (s.ins > t || (o.ins >= 0 && o.len > t)) && (e || n.length > i)),
					s.forward2(t),
					o.forward(t);
			}
		} else Qn(n, 0, o.ins, e), r && wn(r, n, o.text), o.next();
	}
}
class Pn {
	constructor(e) {
		(this.set = e), (this.i = 0), this.next();
	}
	next() {
		let { sections: e } = this.set;
		this.i < e.length
			? ((this.len = e[this.i++]), (this.ins = e[this.i++]))
			: ((this.len = 0), (this.ins = -2)),
			(this.off = 0);
	}
	get done() {
		return -2 == this.ins;
	}
	get len2() {
		return this.ins < 0 ? this.len : this.ins;
	}
	get text() {
		let { inserted: e } = this.set,
			t = (this.i - 2) >> 1;
		return t >= e.length ? an.empty : e[t];
	}
	textBit(e) {
		let { inserted: t } = this.set,
			i = (this.i - 2) >> 1;
		return i >= t.length && !e
			? an.empty
			: t[i].slice(this.off, null == e ? void 0 : this.off + e);
	}
	forward(e) {
		e == this.len ? this.next() : ((this.len -= e), (this.off += e));
	}
	forward2(e) {
		-1 == this.ins
			? this.forward(e)
			: e == this.ins
				? this.next()
				: ((this.ins -= e), (this.off += e));
	}
}
class Zn {
	constructor(e, t, i) {
		(this.from = e), (this.to = t), (this.flags = i);
	}
	get anchor() {
		return 32 & this.flags ? this.to : this.from;
	}
	get head() {
		return 32 & this.flags ? this.from : this.to;
	}
	get empty() {
		return this.from == this.to;
	}
	get assoc() {
		return 8 & this.flags ? -1 : 16 & this.flags ? 1 : 0;
	}
	get bidiLevel() {
		let e = 7 & this.flags;
		return 7 == e ? null : e;
	}
	get goalColumn() {
		let e = this.flags >> 6;
		return 16777215 == e ? void 0 : e;
	}
	map(e, t = -1) {
		let i, n;
		return (
			this.empty
				? (i = n = e.mapPos(this.from, t))
				: ((i = e.mapPos(this.from, 1)), (n = e.mapPos(this.to, -1))),
			i == this.from && n == this.to ? this : new Zn(i, n, this.flags)
		);
	}
	extend(e, t = e) {
		if (e <= this.anchor && t >= this.anchor) return _n.range(e, t);
		let i = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
		return _n.range(this.anchor, i);
	}
	eq(e, t = !1) {
		return !(
			this.anchor != e.anchor ||
			this.head != e.head ||
			(t && this.empty && this.assoc != e.assoc)
		);
	}
	toJSON() {
		return { anchor: this.anchor, head: this.head };
	}
	static fromJSON(e) {
		if (!e || "number" != typeof e.anchor || "number" != typeof e.head)
			throw new RangeError("Invalid JSON representation for SelectionRange");
		return _n.range(e.anchor, e.head);
	}
	static create(e, t, i) {
		return new Zn(e, t, i);
	}
}
class _n {
	constructor(e, t) {
		(this.ranges = e), (this.mainIndex = t);
	}
	map(e, t = -1) {
		return e.empty
			? this
			: _n.create(
					this.ranges.map((i) => i.map(e, t)),
					this.mainIndex,
				);
	}
	eq(e, t = !1) {
		if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
			return !1;
		for (let i = 0; i < this.ranges.length; i++)
			if (!this.ranges[i].eq(e.ranges[i], t)) return !1;
		return !0;
	}
	get main() {
		return this.ranges[this.mainIndex];
	}
	asSingle() {
		return 1 == this.ranges.length ? this : new _n([this.main], 0);
	}
	addRange(e, t = !0) {
		return _n.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
	}
	replaceRange(e, t = this.mainIndex) {
		let i = this.ranges.slice();
		return (i[t] = e), _n.create(i, this.mainIndex);
	}
	toJSON() {
		return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
	}
	static fromJSON(e) {
		if (
			!e ||
			!Array.isArray(e.ranges) ||
			"number" != typeof e.main ||
			e.main >= e.ranges.length
		)
			throw new RangeError("Invalid JSON representation for EditorSelection");
		return new _n(
			e.ranges.map((e) => Zn.fromJSON(e)),
			e.main,
		);
	}
	static single(e, t = e) {
		return new _n([_n.range(e, t)], 0);
	}
	static create(e, t = 0) {
		if (0 == e.length)
			throw new RangeError("A selection needs at least one range");
		for (let i = 0, n = 0; n < e.length; n++) {
			let r = e[n];
			if (r.empty ? r.from <= i : r.from < i)
				return _n.normalized(e.slice(), t);
			i = r.to;
		}
		return new _n(e, t);
	}
	static cursor(e, t = 0, i, n) {
		return Zn.create(
			e,
			e,
			(0 == t ? 0 : t < 0 ? 8 : 16) |
				(null == i ? 7 : Math.min(6, i)) |
				((null != n ? n : 16777215) << 6),
		);
	}
	static range(e, t, i, n) {
		let r =
			((null != i ? i : 16777215) << 6) | (null == n ? 7 : Math.min(6, n));
		return t < e
			? Zn.create(t, e, 48 | r)
			: Zn.create(e, t, (t > e ? 8 : 0) | r);
	}
	static normalized(e, t = 0) {
		let i = e[t];
		e.sort((e, t) => e.from - t.from), (t = e.indexOf(i));
		for (let i = 1; i < e.length; i++) {
			let n = e[i],
				r = e[i - 1];
			if (n.empty ? n.from <= r.to : n.from < r.to) {
				let s = r.from,
					o = Math.max(n.to, r.to);
				i <= t && t--,
					e.splice(--i, 2, n.anchor > n.head ? _n.range(o, s) : _n.range(s, o));
			}
		}
		return new _n(e, t);
	}
}
function Tn(e, t) {
	for (let i of e.ranges)
		if (i.to > t) throw new RangeError("Selection points outside of document");
}
let Xn = 0;
class An {
	constructor(e, t, i, n, r) {
		(this.combine = e),
			(this.compareInput = t),
			(this.compare = i),
			(this.isStatic = n),
			(this.id = Xn++),
			(this.default = e([])),
			(this.extensions = "function" == typeof r ? r(this) : r);
	}
	get reader() {
		return this;
	}
	static define(e = {}) {
		return new An(
			e.combine || ((e) => e),
			e.compareInput || ((e, t) => e === t),
			e.compare || (e.combine ? (e, t) => e === t : Cn),
			!!e.static,
			e.enables,
		);
	}
	of(e) {
		return new Rn([], this, 0, e);
	}
	compute(e, t) {
		if (this.isStatic) throw new Error("Can't compute a static facet");
		return new Rn(e, this, 1, t);
	}
	computeN(e, t) {
		if (this.isStatic) throw new Error("Can't compute a static facet");
		return new Rn(e, this, 2, t);
	}
	from(e, t) {
		return t || (t = (e) => e), this.compute([e], (i) => t(i.field(e)));
	}
}
function Cn(e, t) {
	return e == t || (e.length == t.length && e.every((e, i) => e === t[i]));
}
class Rn {
	constructor(e, t, i, n) {
		(this.dependencies = e),
			(this.facet = t),
			(this.type = i),
			(this.value = n),
			(this.id = Xn++);
	}
	dynamicSlot(e) {
		var t;
		let i = this.value,
			n = this.facet.compareInput,
			r = this.id,
			s = e[r] >> 1,
			o = 2 == this.type,
			a = !1,
			l = !1,
			h = [];
		for (let i of this.dependencies)
			"doc" == i
				? (a = !0)
				: "selection" == i
					? (l = !0)
					: 1 & (null !== (t = e[i.id]) && void 0 !== t ? t : 1) ||
						h.push(e[i.id]);
		return {
			create: (e) => ((e.values[s] = i(e)), 1),
			update(e, t) {
				if (
					(a && t.docChanged) ||
					(l && (t.docChanged || t.selection)) ||
					jn(e, h)
				) {
					let t = i(e);
					if (o ? !Mn(t, e.values[s], n) : !n(t, e.values[s]))
						return (e.values[s] = t), 1;
				}
				return 0;
			},
			reconfigure: (e, t) => {
				let a,
					l = t.config.address[r];
				if (null != l) {
					let r = Fn(t, l);
					if (
						this.dependencies.every((i) =>
							i instanceof An
								? t.facet(i) === e.facet(i)
								: !(i instanceof Vn) || t.field(i, !1) == e.field(i, !1),
						) ||
						(o ? Mn((a = i(e)), r, n) : n((a = i(e)), r))
					)
						return (e.values[s] = r), 0;
				} else a = i(e);
				return (e.values[s] = a), 1;
			},
		};
	}
}
function Mn(e, t, i) {
	if (e.length != t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!i(e[n], t[n])) return !1;
	return !0;
}
function jn(e, t) {
	let i = !1;
	for (let n of t) 1 & Hn(e, n) && (i = !0);
	return i;
}
function En(e, t, i) {
	let n = i.map((t) => e[t.id]),
		r = i.map((e) => e.type),
		s = n.filter((e) => !(1 & e)),
		o = e[t.id] >> 1;
	function a(e) {
		let i = [];
		for (let t = 0; t < n.length; t++) {
			let s = Fn(e, n[t]);
			if (2 == r[t]) for (let e of s) i.push(e);
			else i.push(s);
		}
		return t.combine(i);
	}
	return {
		create(e) {
			for (let t of n) Hn(e, t);
			return (e.values[o] = a(e)), 1;
		},
		update(e, i) {
			if (!jn(e, s)) return 0;
			let n = a(e);
			return t.compare(n, e.values[o]) ? 0 : ((e.values[o] = n), 1);
		},
		reconfigure(e, r) {
			let s = jn(e, n),
				l = r.config.facets[t.id],
				h = r.facet(t);
			if (l && !s && Cn(i, l)) return (e.values[o] = h), 0;
			let c = a(e);
			return t.compare(c, h) ? ((e.values[o] = h), 0) : ((e.values[o] = c), 1);
		},
	};
}
const qn = An.define({ static: !0 });
class Vn {
	constructor(e, t, i, n, r) {
		(this.id = e),
			(this.createF = t),
			(this.updateF = i),
			(this.compareF = n),
			(this.spec = r),
			(this.provides = void 0);
	}
	static define(e) {
		let t = new Vn(
			Xn++,
			e.create,
			e.update,
			e.compare || ((e, t) => e === t),
			e,
		);
		return e.provide && (t.provides = e.provide(t)), t;
	}
	create(e) {
		let t = e.facet(qn).find((e) => e.field == this);
		return ((null == t ? void 0 : t.create) || this.createF)(e);
	}
	slot(e) {
		let t = e[this.id] >> 1;
		return {
			create: (e) => ((e.values[t] = this.create(e)), 1),
			update: (e, i) => {
				let n = e.values[t],
					r = this.updateF(n, i);
				return this.compareF(n, r) ? 0 : ((e.values[t] = r), 1);
			},
			reconfigure: (e, i) => {
				let n,
					r = e.facet(qn),
					s = i.facet(qn);
				return (n = r.find((e) => e.field == this)) &&
					n != s.find((e) => e.field == this)
					? ((e.values[t] = n.create(e)), 1)
					: null != i.config.address[this.id]
						? ((e.values[t] = i.field(this)), 0)
						: ((e.values[t] = this.create(e)), 1);
			},
		};
	}
	init(e) {
		return [this, qn.of({ field: this, create: e })];
	}
	get extension() {
		return this;
	}
}
const Ln = 4,
	Wn = 3,
	zn = 2,
	Yn = 1;
function Dn(e) {
	return (t) => new In(t, e);
}
const Bn = {
	highest: Dn(0),
	high: Dn(Yn),
	default: Dn(zn),
	low: Dn(Wn),
	lowest: Dn(Ln),
};
class In {
	constructor(e, t) {
		(this.inner = e), (this.prec = t);
	}
}
class Un {
	of(e) {
		return new Gn(this, e);
	}
	reconfigure(e) {
		return Un.reconfigure.of({ compartment: this, extension: e });
	}
	get(e) {
		return e.config.compartments.get(this);
	}
}
class Gn {
	constructor(e, t) {
		(this.compartment = e), (this.inner = t);
	}
}
class Nn {
	constructor(e, t, i, n, r, s) {
		for (
			this.base = e,
				this.compartments = t,
				this.dynamicSlots = i,
				this.address = n,
				this.staticValues = r,
				this.facets = s,
				this.statusTemplate = [];
			this.statusTemplate.length < i.length;
		)
			this.statusTemplate.push(0);
	}
	staticFacet(e) {
		let t = this.address[e.id];
		return null == t ? e.default : this.staticValues[t >> 1];
	}
	static resolve(e, t, i) {
		let n = [],
			r = Object.create(null),
			s = new Map();
		for (let i of (function (e, t, i) {
			let n = [[], [], [], [], []],
				r = new Map();
			function s(e, o) {
				let a = r.get(e);
				if (null != a) {
					if (a <= o) return;
					let t = n[a].indexOf(e);
					t > -1 && n[a].splice(t, 1),
						e instanceof Gn && i.delete(e.compartment);
				}
				if ((r.set(e, o), Array.isArray(e))) for (let t of e) s(t, o);
				else if (e instanceof Gn) {
					if (i.has(e.compartment))
						throw new RangeError("Duplicate use of compartment in extensions");
					let n = t.get(e.compartment) || e.inner;
					i.set(e.compartment, n), s(n, o);
				} else if (e instanceof In) s(e.inner, e.prec);
				else if (e instanceof Vn) n[o].push(e), e.provides && s(e.provides, o);
				else if (e instanceof Rn)
					n[o].push(e), e.facet.extensions && s(e.facet.extensions, zn);
				else {
					let t = e.extension;
					if (!t)
						throw new Error(
							`Unrecognized extension value in extension set (${e}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`,
						);
					s(t, o);
				}
			}
			return s(e, zn), n.reduce((e, t) => e.concat(t));
		})(e, t, s))
			i instanceof Vn
				? n.push(i)
				: (r[i.facet.id] || (r[i.facet.id] = [])).push(i);
		let o = Object.create(null),
			a = [],
			l = [];
		for (let e of n) (o[e.id] = l.length << 1), l.push((t) => e.slot(t));
		let h = null == i ? void 0 : i.config.facets;
		for (let e in r) {
			let t = r[e],
				n = t[0].facet,
				s = (h && h[e]) || [];
			if (t.every((e) => 0 == e.type))
				if (((o[n.id] = (a.length << 1) | 1), Cn(s, t))) a.push(i.facet(n));
				else {
					let e = n.combine(t.map((e) => e.value));
					a.push(i && n.compare(e, i.facet(n)) ? i.facet(n) : e);
				}
			else {
				for (let e of t)
					0 == e.type
						? ((o[e.id] = (a.length << 1) | 1), a.push(e.value))
						: ((o[e.id] = l.length << 1), l.push((t) => e.dynamicSlot(t)));
				(o[n.id] = l.length << 1), l.push((e) => En(e, n, t));
			}
		}
		let c = l.map((e) => e(o));
		return new Nn(e, s, c, o, a, r);
	}
}
function Hn(e, t) {
	if (1 & t) return 2;
	let i = t >> 1,
		n = e.status[i];
	if (4 == n) throw new Error("Cyclic dependency between fields and/or facets");
	if (2 & n) return n;
	e.status[i] = 4;
	let r = e.computeSlot(e, e.config.dynamicSlots[i]);
	return (e.status[i] = 2 | r);
}
function Fn(e, t) {
	return 1 & t ? e.config.staticValues[t >> 1] : e.values[t >> 1];
}
const Kn = An.define(),
	Jn = An.define({ combine: (e) => e.some((e) => e), static: !0 }),
	er = An.define({ combine: (e) => (e.length ? e[0] : void 0), static: !0 }),
	tr = An.define(),
	ir = An.define(),
	nr = An.define(),
	rr = An.define({ combine: (e) => !!e.length && e[0] });
class sr {
	constructor(e, t) {
		(this.type = e), (this.value = t);
	}
	static define() {
		return new or();
	}
}
class or {
	of(e) {
		return new sr(this, e);
	}
}
class ar {
	constructor(e) {
		this.map = e;
	}
	of(e) {
		return new lr(this, e);
	}
}
class lr {
	constructor(e, t) {
		(this.type = e), (this.value = t);
	}
	map(e) {
		let t = this.type.map(this.value, e);
		return void 0 === t
			? void 0
			: t == this.value
				? this
				: new lr(this.type, t);
	}
	is(e) {
		return this.type == e;
	}
	static define(e = {}) {
		return new ar(e.map || ((e) => e));
	}
	static mapEffects(e, t) {
		if (!e.length) return e;
		let i = [];
		for (let n of e) {
			let e = n.map(t);
			e && i.push(e);
		}
		return i;
	}
}
(lr.reconfigure = lr.define()), (lr.appendConfig = lr.define());
class hr {
	constructor(e, t, i, n, r, s) {
		(this.startState = e),
			(this.changes = t),
			(this.selection = i),
			(this.effects = n),
			(this.annotations = r),
			(this.scrollIntoView = s),
			(this._doc = null),
			(this._state = null),
			i && Tn(i, t.newLength),
			r.some((e) => e.type == hr.time) ||
				(this.annotations = r.concat(hr.time.of(Date.now())));
	}
	static create(e, t, i, n, r, s) {
		return new hr(e, t, i, n, r, s);
	}
	get newDoc() {
		return this._doc || (this._doc = this.changes.apply(this.startState.doc));
	}
	get newSelection() {
		return this.selection || this.startState.selection.map(this.changes);
	}
	get state() {
		return this._state || this.startState.applyTransaction(this), this._state;
	}
	annotation(e) {
		for (let t of this.annotations) if (t.type == e) return t.value;
	}
	get docChanged() {
		return !this.changes.empty;
	}
	get reconfigured() {
		return this.startState.config != this.state.config;
	}
	isUserEvent(e) {
		let t = this.annotation(hr.userEvent);
		return !(
			!t ||
			!(
				t == e ||
				(t.length > e.length && t.slice(0, e.length) == e && "." == t[e.length])
			)
		);
	}
}
function cr(e, t) {
	let i = [];
	for (let n = 0, r = 0; ; ) {
		let s, o;
		if (n < e.length && (r == t.length || t[r] >= e[n]))
			(s = e[n++]), (o = e[n++]);
		else {
			if (!(r < t.length)) return i;
			(s = t[r++]), (o = t[r++]);
		}
		!i.length || i[i.length - 1] < s
			? i.push(s, o)
			: i[i.length - 1] < o && (i[i.length - 1] = o);
	}
}
function ur(e, t, i) {
	var n;
	let r, s, o;
	return (
		i
			? ((r = t.changes),
				(s = yn.empty(t.changes.length)),
				(o = e.changes.compose(t.changes)))
			: ((r = t.changes.map(e.changes)),
				(s = e.changes.mapDesc(t.changes, !0)),
				(o = e.changes.compose(r))),
		{
			changes: o,
			selection: t.selection
				? t.selection.map(s)
				: null === (n = e.selection) || void 0 === n
					? void 0
					: n.map(r),
			effects: lr.mapEffects(e.effects, r).concat(lr.mapEffects(t.effects, s)),
			annotations: e.annotations.length
				? e.annotations.concat(t.annotations)
				: t.annotations,
			scrollIntoView: e.scrollIntoView || t.scrollIntoView,
		}
	);
}
function fr(e, t, i) {
	let n = t.selection,
		r = pr(t.annotations);
	return (
		t.userEvent && (r = r.concat(hr.userEvent.of(t.userEvent))),
		{
			changes:
				t.changes instanceof yn
					? t.changes
					: yn.of(t.changes || [], i, e.facet(er)),
			selection: n && (n instanceof _n ? n : _n.single(n.anchor, n.head)),
			effects: pr(t.effects),
			annotations: r,
			scrollIntoView: !!t.scrollIntoView,
		}
	);
}
function Or(e, t, i) {
	let n = fr(e, t.length ? t[0] : {}, e.doc.length);
	t.length && !1 === t[0].filter && (i = !1);
	for (let r = 1; r < t.length; r++) {
		!1 === t[r].filter && (i = !1);
		let s = !!t[r].sequential;
		n = ur(n, fr(e, t[r], s ? n.changes.newLength : e.doc.length), s);
	}
	let r = hr.create(
		e,
		n.changes,
		n.selection,
		n.effects,
		n.annotations,
		n.scrollIntoView,
	);
	return (function (e) {
		let t = e.startState,
			i = t.facet(nr),
			n = e;
		for (let r = i.length - 1; r >= 0; r--) {
			let s = i[r](e);
			s &&
				Object.keys(s).length &&
				(n = ur(n, fr(t, s, e.changes.newLength), !0));
		}
		return n == e
			? e
			: hr.create(
					t,
					e.changes,
					e.selection,
					n.effects,
					n.annotations,
					n.scrollIntoView,
				);
	})(
		i
			? (function (e) {
					let t = e.startState,
						i = !0;
					for (let n of t.facet(tr)) {
						let t = n(e);
						if (!1 === t) {
							i = !1;
							break;
						}
						Array.isArray(t) && (i = !0 === i ? t : cr(i, t));
					}
					if (!0 !== i) {
						let n, r;
						if (!1 === i)
							(r = e.changes.invertedDesc), (n = yn.empty(t.doc.length));
						else {
							let t = e.changes.filter(i);
							(n = t.changes), (r = t.filtered.mapDesc(t.changes).invertedDesc);
						}
						e = hr.create(
							t,
							n,
							e.selection && e.selection.map(r),
							lr.mapEffects(e.effects, r),
							e.annotations,
							e.scrollIntoView,
						);
					}
					let n = t.facet(ir);
					for (let i = n.length - 1; i >= 0; i--) {
						let r = n[i](e);
						e =
							r instanceof hr
								? r
								: Array.isArray(r) && 1 == r.length && r[0] instanceof hr
									? r[0]
									: Or(t, pr(r), !1);
					}
					return e;
				})(r)
			: r,
	);
}
(hr.time = sr.define()),
	(hr.userEvent = sr.define()),
	(hr.addToHistory = sr.define()),
	(hr.remote = sr.define());
const dr = [];
function pr(e) {
	return null == e ? dr : Array.isArray(e) ? e : [e];
}
var mr = (function (e) {
	return (
		(e[(e.Word = 0)] = "Word"),
		(e[(e.Space = 1)] = "Space"),
		(e[(e.Other = 2)] = "Other"),
		e
	);
})(mr || (mr = {}));
const gr =
	/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let xr;
try {
	xr = new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch (e) {}
function br(e) {
	return (t) => {
		if (!/\S/.test(t)) return mr.Space;
		if (
			(function (e) {
				if (xr) return xr.test(e);
				for (let t = 0; t < e.length; t++) {
					let i = e[t];
					if (
						/\w/.test(i) ||
						(i > "" && (i.toUpperCase() != i.toLowerCase() || gr.test(i)))
					)
						return !0;
				}
				return !1;
			})(t)
		)
			return mr.Word;
		for (let i = 0; i < e.length; i++) if (t.indexOf(e[i]) > -1) return mr.Word;
		return mr.Other;
	};
}
class Sr {
	constructor(e, t, i, n, r, s) {
		(this.config = e),
			(this.doc = t),
			(this.selection = i),
			(this.values = n),
			(this.status = e.statusTemplate.slice()),
			(this.computeSlot = r),
			s && (s._state = this);
		for (let e = 0; e < this.config.dynamicSlots.length; e++) Hn(this, e << 1);
		this.computeSlot = null;
	}
	field(e, t = !0) {
		let i = this.config.address[e.id];
		if (null != i) return Hn(this, i), Fn(this, i);
		if (t) throw new RangeError("Field is not present in this state");
	}
	update(...e) {
		return Or(this, e, !0);
	}
	applyTransaction(e) {
		let t,
			i = this.config,
			{ base: n, compartments: r } = i;
		for (let t of e.effects)
			t.is(Un.reconfigure)
				? (i &&
						((r = new Map()),
						i.compartments.forEach((e, t) => r.set(t, e)),
						(i = null)),
					r.set(t.value.compartment, t.value.extension))
				: t.is(lr.reconfigure)
					? ((i = null), (n = t.value))
					: t.is(lr.appendConfig) && ((i = null), (n = pr(n).concat(t.value)));
		if (i) t = e.startState.values.slice();
		else {
			(i = Nn.resolve(n, r, this)),
				(t = new Sr(
					i,
					this.doc,
					this.selection,
					i.dynamicSlots.map(() => null),
					(e, t) => t.reconfigure(e, this),
					null,
				).values);
		}
		let s = e.startState.facet(Jn) ? e.newSelection : e.newSelection.asSingle();
		new Sr(i, e.newDoc, s, t, (t, i) => i.update(t, e), e);
	}
	replaceSelection(e) {
		return (
			"string" == typeof e && (e = this.toText(e)),
			this.changeByRange((t) => ({
				changes: { from: t.from, to: t.to, insert: e },
				range: _n.cursor(t.from + e.length),
			}))
		);
	}
	changeByRange(e) {
		let t = this.selection,
			i = e(t.ranges[0]),
			n = this.changes(i.changes),
			r = [i.range],
			s = pr(i.effects);
		for (let i = 1; i < t.ranges.length; i++) {
			let o = e(t.ranges[i]),
				a = this.changes(o.changes),
				l = a.map(n);
			for (let e = 0; e < i; e++) r[e] = r[e].map(l);
			let h = n.mapDesc(a, !0);
			r.push(o.range.map(h)),
				(n = n.compose(l)),
				(s = lr.mapEffects(s, l).concat(lr.mapEffects(pr(o.effects), h)));
		}
		return { changes: n, selection: _n.create(r, t.mainIndex), effects: s };
	}
	changes(e = []) {
		return e instanceof yn
			? e
			: yn.of(e, this.doc.length, this.facet(Sr.lineSeparator));
	}
	toText(e) {
		return an.of(e.split(this.facet(Sr.lineSeparator) || xn));
	}
	sliceDoc(e = 0, t = this.doc.length) {
		return this.doc.sliceString(e, t, this.lineBreak);
	}
	facet(e) {
		let t = this.config.address[e.id];
		return null == t ? e.default : (Hn(this, t), Fn(this, t));
	}
	toJSON(e) {
		let t = { doc: this.sliceDoc(), selection: this.selection.toJSON() };
		if (e)
			for (let i in e) {
				let n = e[i];
				n instanceof Vn &&
					null != this.config.address[n.id] &&
					(t[i] = n.spec.toJSON(this.field(e[i]), this));
			}
		return t;
	}
	static fromJSON(e, t = {}, i) {
		if (!e || "string" != typeof e.doc)
			throw new RangeError("Invalid JSON representation for EditorState");
		let n = [];
		if (i)
			for (let t in i)
				if (Object.prototype.hasOwnProperty.call(e, t)) {
					let r = i[t],
						s = e[t];
					n.push(r.init((e) => r.spec.fromJSON(s, e)));
				}
		return Sr.create({
			doc: e.doc,
			selection: _n.fromJSON(e.selection),
			extensions: t.extensions ? n.concat([t.extensions]) : n,
		});
	}
	static create(e = {}) {
		let t = Nn.resolve(e.extensions || [], new Map()),
			i =
				e.doc instanceof an
					? e.doc
					: an.of((e.doc || "").split(t.staticFacet(Sr.lineSeparator) || xn)),
			n = e.selection
				? e.selection instanceof _n
					? e.selection
					: _n.single(e.selection.anchor, e.selection.head)
				: _n.single(0);
		return (
			Tn(n, i.length),
			t.staticFacet(Jn) || (n = n.asSingle()),
			new Sr(
				t,
				i,
				n,
				t.dynamicSlots.map(() => null),
				(e, t) => t.create(e),
				null,
			)
		);
	}
	get tabSize() {
		return this.facet(Sr.tabSize);
	}
	get lineBreak() {
		return this.facet(Sr.lineSeparator) || "\n";
	}
	get readOnly() {
		return this.facet(rr);
	}
	phrase(e, ...t) {
		for (let t of this.facet(Sr.phrases))
			if (Object.prototype.hasOwnProperty.call(t, e)) {
				e = t[e];
				break;
			}
		return (
			t.length &&
				(e = e.replace(/\$(\$|\d*)/g, (e, i) => {
					if ("$" == i) return "$";
					let n = +(i || 1);
					return !n || n > t.length ? e : t[n - 1];
				})),
			e
		);
	}
	languageDataAt(e, t, i = -1) {
		let n = [];
		for (let r of this.facet(Kn))
			for (let s of r(this, t, i))
				Object.prototype.hasOwnProperty.call(s, e) && n.push(s[e]);
		return n;
	}
	charCategorizer(e) {
		return br(this.languageDataAt("wordChars", e).join(""));
	}
	wordAt(e) {
		let { text: t, from: i, length: n } = this.doc.lineAt(e),
			r = this.charCategorizer(e),
			s = e - i,
			o = e - i;
		for (; s > 0; ) {
			let e = gn(t, s, !1);
			if (r(t.slice(e, s)) != mr.Word) break;
			s = e;
		}
		for (; o < n; ) {
			let e = gn(t, o);
			if (r(t.slice(o, e)) != mr.Word) break;
			o = e;
		}
		return s == o ? null : _n.range(s + i, o + i);
	}
}
(Sr.allowMultipleSelections = Jn),
	(Sr.tabSize = An.define({ combine: (e) => (e.length ? e[0] : 4) })),
	(Sr.lineSeparator = er),
	(Sr.readOnly = rr),
	(Sr.phrases = An.define({
		compare(e, t) {
			let i = Object.keys(e),
				n = Object.keys(t);
			return i.length == n.length && i.every((i) => e[i] == t[i]);
		},
	})),
	(Sr.languageData = Kn),
	(Sr.changeFilter = tr),
	(Sr.transactionFilter = ir),
	(Sr.transactionExtender = nr),
	(Un.reconfigure = lr.define());
class yr {
	eq(e) {
		return this == e;
	}
	range(e, t = e) {
		return Qr.create(e, t, this);
	}
}
(yr.prototype.startSide = yr.prototype.endSide = 0),
	(yr.prototype.point = !1),
	(yr.prototype.mapMode = bn.TrackDel);
let Qr = class e {
	constructor(e, t, i) {
		(this.from = e), (this.to = t), (this.value = i);
	}
	static create(t, i, n) {
		return new e(t, i, n);
	}
};
function wr(e, t) {
	return e.from - t.from || e.value.startSide - t.value.startSide;
}
class kr {
	constructor(e, t, i, n) {
		(this.from = e), (this.to = t), (this.value = i), (this.maxPoint = n);
	}
	get length() {
		return this.to[this.to.length - 1];
	}
	findIndex(e, t, i, n = 0) {
		let r = i ? this.to : this.from;
		for (let s = n, o = r.length; ; ) {
			if (s == o) return s;
			let n = (s + o) >> 1,
				a =
					r[n] - e || (i ? this.value[n].endSide : this.value[n].startSide) - t;
			if (n == s) return a >= 0 ? s : o;
			a >= 0 ? (o = n) : (s = n + 1);
		}
	}
	between(e, t, i, n) {
		for (
			let r = this.findIndex(t, -1e9, !0), s = this.findIndex(i, 1e9, !1, r);
			r < s;
			r++
		)
			if (!1 === n(this.from[r] + e, this.to[r] + e, this.value[r])) return !1;
	}
	map(e, t) {
		let i = [],
			n = [],
			r = [],
			s = -1,
			o = -1;
		for (let a = 0; a < this.value.length; a++) {
			let l,
				h,
				c = this.value[a],
				u = this.from[a] + e,
				f = this.to[a] + e;
			if (u == f) {
				let e = t.mapPos(u, c.startSide, c.mapMode);
				if (null == e) continue;
				if (
					((l = h = e),
					c.startSide != c.endSide && ((h = t.mapPos(u, c.endSide)), h < l))
				)
					continue;
			} else if (
				((l = t.mapPos(u, c.startSide)),
				(h = t.mapPos(f, c.endSide)),
				l > h || (l == h && c.startSide > 0 && c.endSide <= 0))
			)
				continue;
			(h - l || c.endSide - c.startSide) < 0 ||
				(s < 0 && (s = l),
				c.point && (o = Math.max(o, h - l)),
				i.push(c),
				n.push(l - s),
				r.push(h - s));
		}
		return { mapped: i.length ? new kr(n, r, i, o) : null, pos: s };
	}
}
class vr {
	constructor(e, t, i, n) {
		(this.chunkPos = e),
			(this.chunk = t),
			(this.nextLayer = i),
			(this.maxPoint = n);
	}
	static create(e, t, i, n) {
		return new vr(e, t, i, n);
	}
	get length() {
		let e = this.chunk.length - 1;
		return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
	}
	get size() {
		if (this.isEmpty) return 0;
		let e = this.nextLayer.size;
		for (let t of this.chunk) e += t.value.length;
		return e;
	}
	chunkEnd(e) {
		return this.chunkPos[e] + this.chunk[e].length;
	}
	update(e) {
		let {
				add: t = [],
				sort: i = !1,
				filterFrom: n = 0,
				filterTo: r = this.length,
			} = e,
			s = e.filter;
		if (0 == t.length && !s) return this;
		if ((i && (t = t.slice().sort(wr)), this.isEmpty))
			return t.length ? vr.of(t) : this;
		let o = new Zr(this, null, -1).goto(0),
			a = 0,
			l = [],
			h = new $r();
		for (; o.value || a < t.length; )
			if (
				a < t.length &&
				(o.from - t[a].from || o.startSide - t[a].value.startSide) >= 0
			) {
				let e = t[a++];
				h.addInner(e.from, e.to, e.value) || l.push(e);
			} else
				1 == o.rangeIndex &&
				o.chunkIndex < this.chunk.length &&
				(a == t.length || this.chunkEnd(o.chunkIndex) < t[a].from) &&
				(!s ||
					n > this.chunkEnd(o.chunkIndex) ||
					r < this.chunkPos[o.chunkIndex]) &&
				h.addChunk(this.chunkPos[o.chunkIndex], this.chunk[o.chunkIndex])
					? o.nextChunk()
					: ((!s || n > o.to || r < o.from || s(o.from, o.to, o.value)) &&
							(h.addInner(o.from, o.to, o.value) ||
								l.push(Qr.create(o.from, o.to, o.value))),
						o.next());
		return h.finishInner(
			this.nextLayer.isEmpty && !l.length
				? vr.empty
				: this.nextLayer.update({
						add: l,
						filter: s,
						filterFrom: n,
						filterTo: r,
					}),
		);
	}
	map(e) {
		if (e.empty || this.isEmpty) return this;
		let t = [],
			i = [],
			n = -1;
		for (let r = 0; r < this.chunk.length; r++) {
			let s = this.chunkPos[r],
				o = this.chunk[r],
				a = e.touchesRange(s, s + o.length);
			if (!1 === a)
				(n = Math.max(n, o.maxPoint)), t.push(o), i.push(e.mapPos(s));
			else if (!0 === a) {
				let { mapped: r, pos: a } = o.map(s, e);
				r && ((n = Math.max(n, r.maxPoint)), t.push(r), i.push(a));
			}
		}
		let r = this.nextLayer.map(e);
		return 0 == t.length ? r : new vr(i, t, r || vr.empty, n);
	}
	between(e, t, i) {
		if (!this.isEmpty) {
			for (let n = 0; n < this.chunk.length; n++) {
				let r = this.chunkPos[n],
					s = this.chunk[n];
				if (t >= r && e <= r + s.length && !1 === s.between(r, e - r, t - r, i))
					return;
			}
			this.nextLayer.between(e, t, i);
		}
	}
	iter(e = 0) {
		return _r.from([this]).goto(e);
	}
	get isEmpty() {
		return this.nextLayer == this;
	}
	static iter(e, t = 0) {
		return _r.from(e).goto(t);
	}
	static compare(e, t, i, n, r = -1) {
		let s = e.filter((e) => e.maxPoint > 0 || (!e.isEmpty && e.maxPoint >= r)),
			o = t.filter((e) => e.maxPoint > 0 || (!e.isEmpty && e.maxPoint >= r)),
			a = Pr(s, o, i),
			l = new Xr(s, a, r),
			h = new Xr(o, a, r);
		i.iterGaps((e, t, i) => Ar(l, e, h, t, i, n)),
			i.empty && 0 == i.length && Ar(l, 0, h, 0, 0, n);
	}
	static eq(e, t, i = 0, n) {
		null == n && (n = 999999999);
		let r = e.filter((e) => !e.isEmpty && t.indexOf(e) < 0),
			s = t.filter((t) => !t.isEmpty && e.indexOf(t) < 0);
		if (r.length != s.length) return !1;
		if (!r.length) return !0;
		let o = Pr(r, s),
			a = new Xr(r, o, 0).goto(i),
			l = new Xr(s, o, 0).goto(i);
		for (;;) {
			if (
				a.to != l.to ||
				!Cr(a.active, l.active) ||
				(a.point && (!l.point || !a.point.eq(l.point)))
			)
				return !1;
			if (a.to > n) return !0;
			a.next(), l.next();
		}
	}
	static spans(e, t, i, n, r = -1) {
		let s = new Xr(e, null, r).goto(t),
			o = t,
			a = s.openStart;
		for (;;) {
			let e = Math.min(s.to, i);
			if (s.point) {
				let i = s.activeForPoint(s.to),
					r =
						s.pointFrom < t
							? i.length + 1
							: s.point.startSide < 0
								? i.length
								: Math.min(i.length, a);
				n.point(o, e, s.point, i, r, s.pointRank),
					(a = Math.min(s.openEnd(e), i.length));
			} else e > o && (n.span(o, e, s.active, a), (a = s.openEnd(e)));
			if (s.to > i) return a + (s.point && s.to > i ? 1 : 0);
			(o = s.to), s.next();
		}
	}
	static of(e, t = !1) {
		let i = new $r();
		for (let n of e instanceof Qr
			? [e]
			: t
				? (function (e) {
						if (e.length > 1)
							for (let t = e[0], i = 1; i < e.length; i++) {
								let n = e[i];
								if (wr(t, n) > 0) return e.slice().sort(wr);
								t = n;
							}
						return e;
					})(e)
				: e)
			i.add(n.from, n.to, n.value);
		return i.finish();
	}
	static join(e) {
		if (!e.length) return vr.empty;
		let t = e[e.length - 1];
		for (let i = e.length - 2; i >= 0; i--)
			for (let n = e[i]; n != vr.empty; n = n.nextLayer)
				t = new vr(n.chunkPos, n.chunk, t, Math.max(n.maxPoint, t.maxPoint));
		return t;
	}
}
(vr.empty = new vr([], [], null, -1)), (vr.empty.nextLayer = vr.empty);
class $r {
	finishChunk(e) {
		this.chunks.push(new kr(this.from, this.to, this.value, this.maxPoint)),
			this.chunkPos.push(this.chunkStart),
			(this.chunkStart = -1),
			(this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint)),
			(this.maxPoint = -1),
			e && ((this.from = []), (this.to = []), (this.value = []));
	}
	constructor() {
		(this.chunks = []),
			(this.chunkPos = []),
			(this.chunkStart = -1),
			(this.last = null),
			(this.lastFrom = -1e9),
			(this.lastTo = -1e9),
			(this.from = []),
			(this.to = []),
			(this.value = []),
			(this.maxPoint = -1),
			(this.setMaxPoint = -1),
			(this.nextLayer = null);
	}
	add(e, t, i) {
		this.addInner(e, t, i) ||
			(this.nextLayer || (this.nextLayer = new $r())).add(e, t, i);
	}
	addInner(e, t, i) {
		let n = e - this.lastTo || i.startSide - this.last.endSide;
		if (n <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
			throw new Error(
				"Ranges must be added sorted by `from` position and `startSide`",
			);
		return (
			!(n < 0) &&
			(250 == this.from.length && this.finishChunk(!0),
			this.chunkStart < 0 && (this.chunkStart = e),
			this.from.push(e - this.chunkStart),
			this.to.push(t - this.chunkStart),
			(this.last = i),
			(this.lastFrom = e),
			(this.lastTo = t),
			this.value.push(i),
			i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)),
			!0)
		);
	}
	addChunk(e, t) {
		if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
			return !1;
		this.from.length && this.finishChunk(!0),
			(this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint)),
			this.chunks.push(t),
			this.chunkPos.push(e);
		let i = t.value.length - 1;
		return (
			(this.last = t.value[i]),
			(this.lastFrom = t.from[i] + e),
			(this.lastTo = t.to[i] + e),
			!0
		);
	}
	finish() {
		return this.finishInner(vr.empty);
	}
	finishInner(e) {
		if ((this.from.length && this.finishChunk(!1), 0 == this.chunks.length))
			return e;
		let t = vr.create(
			this.chunkPos,
			this.chunks,
			this.nextLayer ? this.nextLayer.finishInner(e) : e,
			this.setMaxPoint,
		);
		return (this.from = null), t;
	}
}
function Pr(e, t, i) {
	let n = new Map();
	for (let t of e)
		for (let e = 0; e < t.chunk.length; e++)
			t.chunk[e].maxPoint <= 0 && n.set(t.chunk[e], t.chunkPos[e]);
	let r = new Set();
	for (let e of t)
		for (let t = 0; t < e.chunk.length; t++) {
			let s = n.get(e.chunk[t]);
			null == s ||
				(i ? i.mapPos(s) : s) != e.chunkPos[t] ||
				(null == i ? void 0 : i.touchesRange(s, s + e.chunk[t].length)) ||
				r.add(e.chunk[t]);
		}
	return r;
}
class Zr {
	constructor(e, t, i, n = 0) {
		(this.layer = e), (this.skip = t), (this.minPoint = i), (this.rank = n);
	}
	get startSide() {
		return this.value ? this.value.startSide : 0;
	}
	get endSide() {
		return this.value ? this.value.endSide : 0;
	}
	goto(e, t = -1e9) {
		return (
			(this.chunkIndex = this.rangeIndex = 0), this.gotoInner(e, t, !1), this
		);
	}
	gotoInner(e, t, i) {
		for (; this.chunkIndex < this.layer.chunk.length; ) {
			let t = this.layer.chunk[this.chunkIndex];
			if (
				!(
					(this.skip && this.skip.has(t)) ||
					this.layer.chunkEnd(this.chunkIndex) < e ||
					t.maxPoint < this.minPoint
				)
			)
				break;
			this.chunkIndex++, (i = !1);
		}
		if (this.chunkIndex < this.layer.chunk.length) {
			let n = this.layer.chunk[this.chunkIndex].findIndex(
				e - this.layer.chunkPos[this.chunkIndex],
				t,
				!0,
			);
			(!i || this.rangeIndex < n) && this.setRangeIndex(n);
		}
		this.next();
	}
	forward(e, t) {
		(this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
	}
	next() {
		for (;;) {
			if (this.chunkIndex == this.layer.chunk.length) {
				(this.from = this.to = 1e9), (this.value = null);
				break;
			}
			{
				let e = this.layer.chunkPos[this.chunkIndex],
					t = this.layer.chunk[this.chunkIndex],
					i = e + t.from[this.rangeIndex];
				if (
					((this.from = i),
					(this.to = e + t.to[this.rangeIndex]),
					(this.value = t.value[this.rangeIndex]),
					this.setRangeIndex(this.rangeIndex + 1),
					this.minPoint < 0 ||
						(this.value.point && this.to - this.from >= this.minPoint))
				)
					break;
			}
		}
	}
	setRangeIndex(e) {
		if (e == this.layer.chunk[this.chunkIndex].value.length) {
			if ((this.chunkIndex++, this.skip))
				for (
					;
					this.chunkIndex < this.layer.chunk.length &&
					this.skip.has(this.layer.chunk[this.chunkIndex]);
				)
					this.chunkIndex++;
			this.rangeIndex = 0;
		} else this.rangeIndex = e;
	}
	nextChunk() {
		this.chunkIndex++, (this.rangeIndex = 0), this.next();
	}
	compare(e) {
		return (
			this.from - e.from ||
			this.startSide - e.startSide ||
			this.rank - e.rank ||
			this.to - e.to ||
			this.endSide - e.endSide
		);
	}
}
class _r {
	constructor(e) {
		this.heap = e;
	}
	static from(e, t = null, i = -1) {
		let n = [];
		for (let r = 0; r < e.length; r++)
			for (let s = e[r]; !s.isEmpty; s = s.nextLayer)
				s.maxPoint >= i && n.push(new Zr(s, t, i, r));
		return 1 == n.length ? n[0] : new _r(n);
	}
	get startSide() {
		return this.value ? this.value.startSide : 0;
	}
	goto(e, t = -1e9) {
		for (let i of this.heap) i.goto(e, t);
		for (let e = this.heap.length >> 1; e >= 0; e--) Tr(this.heap, e);
		return this.next(), this;
	}
	forward(e, t) {
		for (let i of this.heap) i.forward(e, t);
		for (let e = this.heap.length >> 1; e >= 0; e--) Tr(this.heap, e);
		(this.to - e || this.value.endSide - t) < 0 && this.next();
	}
	next() {
		if (0 == this.heap.length)
			(this.from = this.to = 1e9), (this.value = null), (this.rank = -1);
		else {
			let e = this.heap[0];
			(this.from = e.from),
				(this.to = e.to),
				(this.value = e.value),
				(this.rank = e.rank),
				e.value && e.next(),
				Tr(this.heap, 0);
		}
	}
}
function Tr(e, t) {
	for (let i = e[t]; ; ) {
		let n = 1 + (t << 1);
		if (n >= e.length) break;
		let r = e[n];
		if (
			(n + 1 < e.length && r.compare(e[n + 1]) >= 0 && ((r = e[n + 1]), n++),
			i.compare(r) < 0)
		)
			break;
		(e[n] = i), (e[t] = r), (t = n);
	}
}
class Xr {
	constructor(e, t, i) {
		(this.minPoint = i),
			(this.active = []),
			(this.activeTo = []),
			(this.activeRank = []),
			(this.minActive = -1),
			(this.point = null),
			(this.pointFrom = 0),
			(this.pointRank = 0),
			(this.to = -1e9),
			(this.endSide = 0),
			(this.openStart = -1),
			(this.cursor = _r.from(e, t, i));
	}
	goto(e, t = -1e9) {
		return (
			this.cursor.goto(e, t),
			(this.active.length = this.activeTo.length = this.activeRank.length = 0),
			(this.minActive = -1),
			(this.to = e),
			(this.endSide = t),
			(this.openStart = -1),
			this.next(),
			this
		);
	}
	forward(e, t) {
		for (
			;
			this.minActive > -1 &&
			(this.activeTo[this.minActive] - e ||
				this.active[this.minActive].endSide - t) < 0;
		)
			this.removeActive(this.minActive);
		this.cursor.forward(e, t);
	}
	removeActive(e) {
		Rr(this.active, e),
			Rr(this.activeTo, e),
			Rr(this.activeRank, e),
			(this.minActive = jr(this.active, this.activeTo));
	}
	addActive(e) {
		let t = 0,
			{ value: i, to: n, rank: r } = this.cursor;
		for (
			;
			t < this.activeRank.length &&
			(r - this.activeRank[t] || n - this.activeTo[t]) > 0;
		)
			t++;
		Mr(this.active, t, i),
			Mr(this.activeTo, t, n),
			Mr(this.activeRank, t, r),
			e && Mr(e, t, this.cursor.from),
			(this.minActive = jr(this.active, this.activeTo));
	}
	next() {
		let e = this.to,
			t = this.point;
		this.point = null;
		let i = this.openStart < 0 ? [] : null;
		for (;;) {
			let n = this.minActive;
			if (
				n > -1 &&
				(this.activeTo[n] - this.cursor.from ||
					this.active[n].endSide - this.cursor.startSide) < 0
			) {
				if (this.activeTo[n] > e) {
					(this.to = this.activeTo[n]), (this.endSide = this.active[n].endSide);
					break;
				}
				this.removeActive(n), i && Rr(i, n);
			} else {
				if (!this.cursor.value) {
					this.to = this.endSide = 1e9;
					break;
				}
				if (this.cursor.from > e) {
					(this.to = this.cursor.from), (this.endSide = this.cursor.startSide);
					break;
				}
				{
					let e = this.cursor.value;
					if (e.point) {
						if (
							!(
								t &&
								this.cursor.to == this.to &&
								this.cursor.from < this.cursor.to
							)
						) {
							(this.point = e),
								(this.pointFrom = this.cursor.from),
								(this.pointRank = this.cursor.rank),
								(this.to = this.cursor.to),
								(this.endSide = e.endSide),
								this.cursor.next(),
								this.forward(this.to, this.endSide);
							break;
						}
						this.cursor.next();
					} else this.addActive(i), this.cursor.next();
				}
			}
		}
		if (i) {
			this.openStart = 0;
			for (let t = i.length - 1; t >= 0 && i[t] < e; t--) this.openStart++;
		}
	}
	activeForPoint(e) {
		if (!this.active.length) return this.active;
		let t = [];
		for (
			let i = this.active.length - 1;
			i >= 0 && !(this.activeRank[i] < this.pointRank);
			i--
		)
			(this.activeTo[i] > e ||
				(this.activeTo[i] == e &&
					this.active[i].endSide >= this.point.endSide)) &&
				t.push(this.active[i]);
		return t.reverse();
	}
	openEnd(e) {
		let t = 0;
		for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > e; i--)
			t++;
		return t;
	}
}
function Ar(e, t, i, n, r, s) {
	e.goto(t), i.goto(n);
	let o = n + r,
		a = n,
		l = n - t;
	for (;;) {
		let t = e.to + l - i.to,
			n = t || e.endSide - i.endSide,
			r = n < 0 ? e.to + l : i.to,
			h = Math.min(r, o);
		if (
			(e.point || i.point
				? (e.point &&
						i.point &&
						(e.point == i.point || e.point.eq(i.point)) &&
						Cr(e.activeForPoint(e.to), i.activeForPoint(i.to))) ||
					s.comparePoint(a, h, e.point, i.point)
				: h > a &&
					!Cr(e.active, i.active) &&
					s.compareRange(a, h, e.active, i.active),
			r > o)
		)
			break;
		(t || e.openEnd != i.openEnd) && s.boundChange && s.boundChange(r),
			(a = r),
			n <= 0 && e.next(),
			n >= 0 && i.next();
	}
}
function Cr(e, t) {
	if (e.length != t.length) return !1;
	for (let i = 0; i < e.length; i++)
		if (e[i] != t[i] && !e[i].eq(t[i])) return !1;
	return !0;
}
function Rr(e, t) {
	for (let i = t, n = e.length - 1; i < n; i++) e[i] = e[i + 1];
	e.pop();
}
function Mr(e, t, i) {
	for (let i = e.length - 1; i >= t; i--) e[i + 1] = e[i];
	e[t] = i;
}
function jr(e, t) {
	let i = -1,
		n = 1e9;
	for (let r = 0; r < t.length; r++)
		(t[r] - n || e[r].endSide - e[i].endSide) < 0 && ((i = r), (n = t[r]));
	return i;
}
function Er(e, t, i = e.length) {
	let n = 0;
	for (let r = 0; r < i && r < e.length; )
		9 == e.charCodeAt(r) ? ((n += t - (n % t)), r++) : (n++, (r = gn(e, r)));
	return n;
}
const qr = "undefined" == typeof Symbol ? "__ͼ" : Symbol.for("ͼ"),
	Vr =
		"undefined" == typeof Symbol
			? "__styleSet" + Math.floor(1e8 * Math.random())
			: Symbol("styleSet"),
	Lr =
		"undefined" != typeof globalThis
			? globalThis
			: "undefined" != typeof window
				? window
				: {};
class Wr {
	constructor(e, t) {
		this.rules = [];
		let { finish: i } = t || {};
		function n(e) {
			return /^@/.test(e) ? [e] : e.split(/,\s*/);
		}
		function r(e, t, s, o) {
			let a = [],
				l = /^@(\w+)\b/.exec(e[0]),
				h = l && "keyframes" == l[1];
			if (l && null == t) return s.push(e[0] + ";");
			for (let i in t) {
				let o = t[i];
				if (/&/.test(i))
					r(
						i
							.split(/,\s*/)
							.map((t) => e.map((e) => t.replace(/&/, e)))
							.reduce((e, t) => e.concat(t)),
						o,
						s,
					);
				else if (o && "object" == typeof o) {
					if (!l)
						throw new RangeError(
							"The value of a property (" +
								i +
								") should be a primitive value.",
						);
					r(n(i), o, a, h);
				} else
					null != o &&
						a.push(
							i
								.replace(/_.*/, "")
								.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase()) +
								": " +
								o +
								";",
						);
			}
			(a.length || h) &&
				s.push(
					(!i || l || o ? e : e.map(i)).join(", ") + " {" + a.join(" ") + "}",
				);
		}
		for (let t in e) r(n(t), e[t], this.rules);
	}
	getRules() {
		return this.rules.join("\n");
	}
	static newName() {
		let e = Lr[qr] || 1;
		return (Lr[qr] = e + 1), "ͼ" + e.toString(36);
	}
	static mount(e, t, i) {
		let n = e[Vr],
			r = i && i.nonce;
		n ? r && n.setNonce(r) : (n = new Yr(e, r)),
			n.mount(Array.isArray(t) ? t : [t], e);
	}
}
let zr = new Map();
class Yr {
	constructor(e, t) {
		let i = e.ownerDocument || e,
			n = i.defaultView;
		if (!e.head && e.adoptedStyleSheets && n.CSSStyleSheet) {
			let t = zr.get(i);
			if (t) return (e[Vr] = t);
			(this.sheet = new n.CSSStyleSheet()), zr.set(i, this);
		} else
			(this.styleTag = i.createElement("style")),
				t && this.styleTag.setAttribute("nonce", t);
		(this.modules = []), (e[Vr] = this);
	}
	mount(e, t) {
		let i = this.sheet,
			n = 0,
			r = 0;
		for (let t = 0; t < e.length; t++) {
			let s = e[t],
				o = this.modules.indexOf(s);
			if (
				(o < r && o > -1 && (this.modules.splice(o, 1), r--, (o = -1)), -1 == o)
			) {
				if ((this.modules.splice(r++, 0, s), i))
					for (let e = 0; e < s.rules.length; e++)
						i.insertRule(s.rules[e], n++);
			} else {
				for (; r < o; ) n += this.modules[r++].rules.length;
				(n += s.rules.length), r++;
			}
		}
		if (i)
			t.adoptedStyleSheets.indexOf(this.sheet) < 0 &&
				(t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
		else {
			let e = "";
			for (let t = 0; t < this.modules.length; t++)
				e += this.modules[t].getRules() + "\n";
			this.styleTag.textContent = e;
			let i = t.head || t;
			this.styleTag.parentNode != i &&
				i.insertBefore(this.styleTag, i.firstChild);
		}
	}
	setNonce(e) {
		this.styleTag &&
			this.styleTag.getAttribute("nonce") != e &&
			this.styleTag.setAttribute("nonce", e);
	}
}
for (
	var Dr = {
			8: "Backspace",
			9: "Tab",
			10: "Enter",
			12: "NumLock",
			13: "Enter",
			16: "Shift",
			17: "Control",
			18: "Alt",
			20: "CapsLock",
			27: "Escape",
			32: " ",
			33: "PageUp",
			34: "PageDown",
			35: "End",
			36: "Home",
			37: "ArrowLeft",
			38: "ArrowUp",
			39: "ArrowRight",
			40: "ArrowDown",
			44: "PrintScreen",
			45: "Insert",
			46: "Delete",
			59: ";",
			61: "=",
			91: "Meta",
			92: "Meta",
			106: "*",
			107: "+",
			108: ",",
			109: "-",
			110: ".",
			111: "/",
			144: "NumLock",
			145: "ScrollLock",
			160: "Shift",
			161: "Shift",
			162: "Control",
			163: "Control",
			164: "Alt",
			165: "Alt",
			173: "-",
			186: ";",
			187: "=",
			188: ",",
			189: "-",
			190: ".",
			191: "/",
			192: "`",
			219: "[",
			220: "\\",
			221: "]",
			222: "'",
		},
		Br = {
			48: ")",
			49: "!",
			50: "@",
			51: "#",
			52: "$",
			53: "%",
			54: "^",
			55: "&",
			56: "*",
			57: "(",
			59: ":",
			61: "+",
			173: "_",
			186: ":",
			187: "+",
			188: "<",
			189: "_",
			190: ">",
			191: "?",
			192: "~",
			219: "{",
			220: "|",
			221: "}",
			222: '"',
		},
		Ir = "undefined" != typeof navigator && /Mac/.test(navigator.platform),
		Ur =
			"undefined" != typeof navigator &&
			/MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent),
		Gr = 0;
	Gr < 10;
	Gr++
)
	Dr[48 + Gr] = Dr[96 + Gr] = String(Gr);
for (Gr = 1; Gr <= 24; Gr++) Dr[Gr + 111] = "F" + Gr;
for (Gr = 65; Gr <= 90; Gr++)
	(Dr[Gr] = String.fromCharCode(Gr + 32)), (Br[Gr] = String.fromCharCode(Gr));
for (var Nr in Dr) Br.hasOwnProperty(Nr) || (Br[Nr] = Dr[Nr]);
function Hr(e) {
	let t;
	return (
		(t = 11 == e.nodeType ? (e.getSelection ? e : e.ownerDocument) : e),
		t.getSelection()
	);
}
function Fr(e, t) {
	return !!t && (e == t || e.contains(1 != t.nodeType ? t.parentNode : t));
}
function Kr(e, t) {
	if (!t.anchorNode) return !1;
	try {
		return Fr(e, t.anchorNode);
	} catch (e) {
		return !1;
	}
}
function Jr(e) {
	return 3 == e.nodeType
		? fs(e, 0, e.nodeValue.length).getClientRects()
		: 1 == e.nodeType
			? e.getClientRects()
			: [];
}
function es(e, t, i, n) {
	return !!i && (ns(e, t, i, n, -1) || ns(e, t, i, n, 1));
}
function ts(e) {
	for (var t = 0; ; t++) if (!(e = e.previousSibling)) return t;
}
function is(e) {
	return (
		1 == e.nodeType &&
		/^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(e.nodeName)
	);
}
function ns(e, t, i, n, r) {
	for (;;) {
		if (e == i && t == n) return !0;
		if (t == (r < 0 ? 0 : rs(e))) {
			if ("DIV" == e.nodeName) return !1;
			let i = e.parentNode;
			if (!i || 1 != i.nodeType) return !1;
			(t = ts(e) + (r < 0 ? 0 : 1)), (e = i);
		} else {
			if (1 != e.nodeType) return !1;
			if (
				1 == (e = e.childNodes[t + (r < 0 ? -1 : 0)]).nodeType &&
				"false" == e.contentEditable
			)
				return !1;
			t = r < 0 ? rs(e) : 0;
		}
	}
}
function rs(e) {
	return 3 == e.nodeType ? e.nodeValue.length : e.childNodes.length;
}
function ss(e, t) {
	let i = t ? e.left : e.right;
	return { left: i, right: i, top: e.top, bottom: e.bottom };
}
function os(e) {
	let t = e.visualViewport;
	return t
		? { left: 0, right: t.width, top: 0, bottom: t.height }
		: { left: 0, right: e.innerWidth, top: 0, bottom: e.innerHeight };
}
function as(e, t) {
	let i = t.width / e.offsetWidth,
		n = t.height / e.offsetHeight;
	return (
		((i > 0.995 && i < 1.005) ||
			!isFinite(i) ||
			Math.abs(t.width - e.offsetWidth) < 1) &&
			(i = 1),
		((n > 0.995 && n < 1.005) ||
			!isFinite(n) ||
			Math.abs(t.height - e.offsetHeight) < 1) &&
			(n = 1),
		{ scaleX: i, scaleY: n }
	);
}
class ls {
	constructor() {
		(this.anchorNode = null),
			(this.anchorOffset = 0),
			(this.focusNode = null),
			(this.focusOffset = 0);
	}
	eq(e) {
		return (
			this.anchorNode == e.anchorNode &&
			this.anchorOffset == e.anchorOffset &&
			this.focusNode == e.focusNode &&
			this.focusOffset == e.focusOffset
		);
	}
	setRange(e) {
		let { anchorNode: t, focusNode: i } = e;
		this.set(
			t,
			Math.min(e.anchorOffset, t ? rs(t) : 0),
			i,
			Math.min(e.focusOffset, i ? rs(i) : 0),
		);
	}
	set(e, t, i, n) {
		(this.anchorNode = e),
			(this.anchorOffset = t),
			(this.focusNode = i),
			(this.focusOffset = n);
	}
}
let hs,
	cs = null;
function us(e) {
	if (e.setActive) return e.setActive();
	if (cs) return e.focus(cs);
	let t = [];
	for (
		let i = e;
		i && (t.push(i, i.scrollTop, i.scrollLeft), i != i.ownerDocument);
		i = i.parentNode
	);
	if (
		(e.focus(
			null == cs
				? {
						get preventScroll() {
							return (cs = { preventScroll: !0 }), !0;
						},
					}
				: void 0,
		),
		!cs)
	) {
		cs = !1;
		for (let e = 0; e < t.length; ) {
			let i = t[e++],
				n = t[e++],
				r = t[e++];
			i.scrollTop != n && (i.scrollTop = n),
				i.scrollLeft != r && (i.scrollLeft = r);
		}
	}
}
function fs(e, t, i = t) {
	let n = hs || (hs = document.createRange());
	return n.setEnd(e, i), n.setStart(e, t), n;
}
function Os(e, t, i, n) {
	let r = { key: t, code: t, keyCode: i, which: i, cancelable: !0 };
	n &&
		({
			altKey: r.altKey,
			ctrlKey: r.ctrlKey,
			shiftKey: r.shiftKey,
			metaKey: r.metaKey,
		} = n);
	let s = new KeyboardEvent("keydown", r);
	(s.synthetic = !0), e.dispatchEvent(s);
	let o = new KeyboardEvent("keyup", r);
	return (
		(o.synthetic = !0),
		e.dispatchEvent(o),
		s.defaultPrevented || o.defaultPrevented
	);
}
function ds(e) {
	for (; e.attributes.length; ) e.removeAttributeNode(e.attributes[0]);
}
function ps(e) {
	return e.scrollTop > Math.max(1, e.scrollHeight - e.clientHeight - 4);
}
function ms(e, t) {
	for (let i = e, n = t; ; ) {
		if (3 == i.nodeType && n > 0) return { node: i, offset: n };
		if (1 == i.nodeType && n > 0) {
			if ("false" == i.contentEditable) return null;
			(i = i.childNodes[n - 1]), (n = rs(i));
		} else {
			if (!i.parentNode || is(i)) return null;
			(n = ts(i)), (i = i.parentNode);
		}
	}
}
function gs(e, t) {
	for (let i = e, n = t; ; ) {
		if (3 == i.nodeType && n < i.nodeValue.length)
			return { node: i, offset: n };
		if (1 == i.nodeType && n < i.childNodes.length) {
			if ("false" == i.contentEditable) return null;
			(i = i.childNodes[n]), (n = 0);
		} else {
			if (!i.parentNode || is(i)) return null;
			(n = ts(i) + 1), (i = i.parentNode);
		}
	}
}
class xs {
	constructor(e, t, i = !0) {
		(this.node = e), (this.offset = t), (this.precise = i);
	}
	static before(e, t) {
		return new xs(e.parentNode, ts(e), t);
	}
	static after(e, t) {
		return new xs(e.parentNode, ts(e) + 1, t);
	}
}
const bs = [];
class Ss {
	constructor() {
		(this.parent = null), (this.dom = null), (this.flags = 2);
	}
	get overrideDOMText() {
		return null;
	}
	get posAtStart() {
		return this.parent ? this.parent.posBefore(this) : 0;
	}
	get posAtEnd() {
		return this.posAtStart + this.length;
	}
	posBefore(e) {
		let t = this.posAtStart;
		for (let i of this.children) {
			if (i == e) return t;
			t += i.length + i.breakAfter;
		}
		throw new RangeError("Invalid child in posBefore");
	}
	posAfter(e) {
		return this.posBefore(e) + e.length;
	}
	sync(e, t) {
		if (2 & this.flags) {
			let i,
				n = this.dom,
				r = null;
			for (let s of this.children) {
				if (7 & s.flags) {
					if (!s.dom && (i = r ? r.nextSibling : n.firstChild)) {
						let e = Ss.get(i);
						(!e || (!e.parent && e.canReuseDOM(s))) && s.reuseDOM(i);
					}
					s.sync(e, t), (s.flags &= -8);
				}
				if (
					((i = r ? r.nextSibling : n.firstChild),
					t && !t.written && t.node == n && i != s.dom && (t.written = !0),
					s.dom.parentNode == n)
				)
					for (; i && i != s.dom; ) i = ys(i);
				else n.insertBefore(s.dom, i);
				r = s.dom;
			}
			for (
				i = r ? r.nextSibling : n.firstChild,
					i && t && t.node == n && (t.written = !0);
				i;
			)
				i = ys(i);
		} else if (1 & this.flags)
			for (let i of this.children)
				7 & i.flags && (i.sync(e, t), (i.flags &= -8));
	}
	reuseDOM(e) {}
	localPosFromDOM(e, t) {
		let i;
		if (e == this.dom) i = this.dom.childNodes[t];
		else {
			let n = 0 == rs(e) ? 0 : 0 == t ? -1 : 1;
			for (;;) {
				let t = e.parentNode;
				if (t == this.dom) break;
				0 == n &&
					t.firstChild != t.lastChild &&
					(n = e == t.firstChild ? -1 : 1),
					(e = t);
			}
			i = n < 0 ? e : e.nextSibling;
		}
		if (i == this.dom.firstChild) return 0;
		for (; i && !Ss.get(i); ) i = i.nextSibling;
		if (!i) return this.length;
		for (let e = 0, t = 0; ; e++) {
			let n = this.children[e];
			if (n.dom == i) return t;
			t += n.length + n.breakAfter;
		}
	}
	domBoundsAround(e, t, i = 0) {
		let n = -1,
			r = -1,
			s = -1,
			o = -1;
		for (let a = 0, l = i, h = i; a < this.children.length; a++) {
			let i = this.children[a],
				c = l + i.length;
			if (l < e && c > t) return i.domBoundsAround(e, t, l);
			if (
				(c >= e && -1 == n && ((n = a), (r = l)),
				l > t && i.dom.parentNode == this.dom)
			) {
				(s = a), (o = h);
				break;
			}
			(h = c), (l = c + i.breakAfter);
		}
		return {
			from: r,
			to: o < 0 ? i + this.length : o,
			startDOM:
				(n ? this.children[n - 1].dom.nextSibling : null) ||
				this.dom.firstChild,
			endDOM: s < this.children.length && s >= 0 ? this.children[s].dom : null,
		};
	}
	markDirty(e = !1) {
		(this.flags |= 2), this.markParentsDirty(e);
	}
	markParentsDirty(e) {
		for (let t = this.parent; t; t = t.parent) {
			if ((e && (t.flags |= 2), 1 & t.flags)) return;
			(t.flags |= 1), (e = !1);
		}
	}
	setParent(e) {
		this.parent != e &&
			((this.parent = e), 7 & this.flags && this.markParentsDirty(!0));
	}
	setDOM(e) {
		this.dom != e &&
			(this.dom && (this.dom.cmView = null), (this.dom = e), (e.cmView = this));
	}
	get rootView() {
		for (let e = this; ; ) {
			let t = e.parent;
			if (!t) return e;
			e = t;
		}
	}
	replaceChildren(e, t, i = bs) {
		this.markDirty();
		for (let n = e; n < t; n++) {
			let e = this.children[n];
			e.parent == this && i.indexOf(e) < 0 && e.destroy();
		}
		i.length < 250
			? this.children.splice(e, t - e, ...i)
			: (this.children = [].concat(
					this.children.slice(0, e),
					i,
					this.children.slice(t),
				));
		for (let e = 0; e < i.length; e++) i[e].setParent(this);
	}
	ignoreMutation(e) {
		return !1;
	}
	ignoreEvent(e) {
		return !1;
	}
	childCursor(e = this.length) {
		return new Qs(this.children, e, this.children.length);
	}
	childPos(e, t = 1) {
		return this.childCursor().findPos(e, t);
	}
	toString() {
		let e = this.constructor.name.replace("View", "");
		return (
			e +
			(this.children.length
				? "(" + this.children.join() + ")"
				: this.length
					? "[" + ("Text" == e ? this.text : this.length) + "]"
					: "") +
			(this.breakAfter ? "#" : "")
		);
	}
	static get(e) {
		return e.cmView;
	}
	get isEditable() {
		return !0;
	}
	get isWidget() {
		return !1;
	}
	get isHidden() {
		return !1;
	}
	merge(e, t, i, n, r, s) {
		return !1;
	}
	become(e) {
		return !1;
	}
	canReuseDOM(e) {
		return e.constructor == this.constructor && !(8 & (this.flags | e.flags));
	}
	getSide() {
		return 0;
	}
	destroy() {
		for (let e of this.children) e.parent == this && e.destroy();
		this.parent = null;
	}
}
function ys(e) {
	let t = e.nextSibling;
	return e.parentNode.removeChild(e), t;
}
Ss.prototype.breakAfter = 0;
class Qs {
	constructor(e, t, i) {
		(this.children = e), (this.pos = t), (this.i = i), (this.off = 0);
	}
	findPos(e, t = 1) {
		for (;;) {
			if (
				e > this.pos ||
				(e == this.pos &&
					(t > 0 || 0 == this.i || this.children[this.i - 1].breakAfter))
			)
				return (this.off = e - this.pos), this;
			let i = this.children[--this.i];
			this.pos -= i.length + i.breakAfter;
		}
	}
}
function ws(e, t, i, n, r, s, o, a, l) {
	let { children: h } = e,
		c = h.length ? h[t] : null,
		u = s.length ? s[s.length - 1] : null,
		f = u ? u.breakAfter : o;
	if (
		!(
			t == n &&
			c &&
			!o &&
			!f &&
			s.length < 2 &&
			c.merge(i, r, s.length ? u : null, 0 == i, a, l)
		)
	) {
		if (n < h.length) {
			let e = h[n];
			e &&
			(r < e.length || (e.breakAfter && (null == u ? void 0 : u.breakAfter)))
				? (t == n && ((e = e.split(r)), (r = 0)),
					!f && u && e.merge(0, r, u, !0, 0, l)
						? (s[s.length - 1] = e)
						: ((r || (e.children.length && !e.children[0].length)) &&
								e.merge(0, r, null, !1, 0, l),
							s.push(e)))
				: (null == e ? void 0 : e.breakAfter) &&
					(u ? (u.breakAfter = 1) : (o = 1)),
				n++;
		}
		for (
			c &&
			((c.breakAfter = o),
			i > 0 &&
				(!o && s.length && c.merge(i, c.length, s[0], !1, a, 0)
					? (c.breakAfter = s.shift().breakAfter)
					: (i < c.length ||
							(c.children.length &&
								0 == c.children[c.children.length - 1].length)) &&
						c.merge(i, c.length, null, !1, a, 0),
				t++));
			t < n && s.length;
		)
			if (h[n - 1].become(s[s.length - 1]))
				n--, s.pop(), (l = s.length ? 0 : a);
			else {
				if (!h[t].become(s[0])) break;
				t++, s.shift(), (a = s.length ? 0 : l);
			}
		!s.length &&
			t &&
			n < h.length &&
			!h[t - 1].breakAfter &&
			h[n].merge(0, 0, h[t - 1], !1, a, l) &&
			t--,
			(t < n || s.length) && e.replaceChildren(t, n, s);
	}
}
function ks(e, t, i, n, r, s) {
	let o = e.childCursor(),
		{ i: a, off: l } = o.findPos(i, 1),
		{ i: h, off: c } = o.findPos(t, -1),
		u = t - i;
	for (let e of n) u += e.length;
	(e.length += u), ws(e, h, c, a, l, n, 0, r, s);
}
let vs =
		"undefined" != typeof navigator
			? navigator
			: { userAgent: "", vendor: "", platform: "" },
	$s =
		"undefined" != typeof document
			? document
			: { documentElement: { style: {} } };
const Ps = /Edge\/(\d+)/.exec(vs.userAgent),
	Zs = /MSIE \d/.test(vs.userAgent),
	_s = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(vs.userAgent),
	Ts = !!(Zs || _s || Ps),
	Xs = !Ts && /gecko\/(\d+)/i.test(vs.userAgent),
	As = !Ts && /Chrome\/(\d+)/.exec(vs.userAgent),
	Cs = "webkitFontSmoothing" in $s.documentElement.style,
	Rs = !Ts && /Apple Computer/.test(vs.vendor),
	Ms = Rs && (/Mobile\/\w+/.test(vs.userAgent) || vs.maxTouchPoints > 2);
var js = {
	mac: Ms || /Mac/.test(vs.platform),
	windows: /Win/.test(vs.platform),
	linux: /Linux|X11/.test(vs.platform),
	ie: Ts,
	ie_version: Zs ? $s.documentMode || 6 : _s ? +_s[1] : Ps ? +Ps[1] : 0,
	gecko: Xs,
	gecko_version: Xs ? +(/Firefox\/(\d+)/.exec(vs.userAgent) || [0, 0])[1] : 0,
	chrome: !!As,
	chrome_version: As ? +As[1] : 0,
	ios: Ms,
	android: /Android\b/.test(vs.userAgent),
	safari: Rs,
	webkit_version: Cs
		? +(/\bAppleWebKit\/(\d+)/.exec(vs.userAgent) || [0, 0])[1]
		: 0,
	tabSize:
		null != $s.documentElement.style.tabSize ? "tab-size" : "-moz-tab-size",
};
class Es extends Ss {
	constructor(e) {
		super(), (this.text = e);
	}
	get length() {
		return this.text.length;
	}
	createDOM(e) {
		this.setDOM(e || document.createTextNode(this.text));
	}
	sync(e, t) {
		this.dom || this.createDOM(),
			this.dom.nodeValue != this.text &&
				(t && t.node == this.dom && (t.written = !0),
				(this.dom.nodeValue = this.text));
	}
	reuseDOM(e) {
		3 == e.nodeType && this.createDOM(e);
	}
	merge(e, t, i) {
		return (
			!(
				8 & this.flags ||
				(i &&
					(!(i instanceof Es) ||
						this.length - (t - e) + i.length > 256 ||
						8 & i.flags))
			) &&
			((this.text =
				this.text.slice(0, e) + (i ? i.text : "") + this.text.slice(t)),
			this.markDirty(),
			!0)
		);
	}
	split(e) {
		let t = new Es(this.text.slice(e));
		return (
			(this.text = this.text.slice(0, e)),
			this.markDirty(),
			(t.flags |= 8 & this.flags),
			t
		);
	}
	localPosFromDOM(e, t) {
		return e == this.dom ? t : t ? this.text.length : 0;
	}
	domAtPos(e) {
		return new xs(this.dom, e);
	}
	domBoundsAround(e, t, i) {
		return {
			from: i,
			to: i + this.length,
			startDOM: this.dom,
			endDOM: this.dom.nextSibling,
		};
	}
	coordsAt(e, t) {
		return (function (e, t, i) {
			let n = e.nodeValue.length;
			t > n && (t = n);
			let r = t,
				s = t,
				o = 0;
			(0 == t && i < 0) || (t == n && i >= 0)
				? js.chrome ||
					js.gecko ||
					(t ? (r--, (o = 1)) : s < n && (s++, (o = -1)))
				: i < 0
					? r--
					: s < n && s++;
			let a = fs(e, r, s).getClientRects();
			if (!a.length) return null;
			let l = a[(o ? o < 0 : i >= 0) ? 0 : a.length - 1];
			js.safari &&
				!o &&
				0 == l.width &&
				(l = Array.prototype.find.call(a, (e) => e.width) || l);
			return o ? ss(l, o < 0) : l || null;
		})(this.dom, e, t);
	}
}
class qs extends Ss {
	constructor(e, t = [], i = 0) {
		super(), (this.mark = e), (this.children = t), (this.length = i);
		for (let e of t) e.setParent(this);
	}
	setAttrs(e) {
		if (
			(ds(e),
			this.mark.class && (e.className = this.mark.class),
			this.mark.attrs)
		)
			for (let t in this.mark.attrs) e.setAttribute(t, this.mark.attrs[t]);
		return e;
	}
	canReuseDOM(e) {
		return super.canReuseDOM(e) && !(8 & (this.flags | e.flags));
	}
	reuseDOM(e) {
		e.nodeName == this.mark.tagName.toUpperCase() &&
			(this.setDOM(e), (this.flags |= 6));
	}
	sync(e, t) {
		this.dom
			? 4 & this.flags && this.setAttrs(this.dom)
			: this.setDOM(this.setAttrs(document.createElement(this.mark.tagName))),
			super.sync(e, t);
	}
	merge(e, t, i, n, r, s) {
		return (
			(!i ||
				!(
					!(i instanceof qs && i.mark.eq(this.mark)) ||
					(e && r <= 0) ||
					(t < this.length && s <= 0)
				)) &&
			(ks(this, e, t, i ? i.children.slice() : [], r - 1, s - 1),
			this.markDirty(),
			!0)
		);
	}
	split(e) {
		let t = [],
			i = 0,
			n = -1,
			r = 0;
		for (let s of this.children) {
			let o = i + s.length;
			o > e && t.push(i < e ? s.split(e - i) : s),
				n < 0 && i >= e && (n = r),
				(i = o),
				r++;
		}
		let s = this.length - e;
		return (
			(this.length = e),
			n > -1 && ((this.children.length = n), this.markDirty()),
			new qs(this.mark, t, s)
		);
	}
	domAtPos(e) {
		return Ws(this, e);
	}
	coordsAt(e, t) {
		return Ys(this, e, t);
	}
}
class Vs extends Ss {
	static create(e, t, i) {
		return new Vs(e, t, i);
	}
	constructor(e, t, i) {
		super(),
			(this.widget = e),
			(this.length = t),
			(this.side = i),
			(this.prevWidget = null);
	}
	split(e) {
		let t = Vs.create(this.widget, this.length - e, this.side);
		return (this.length -= e), t;
	}
	sync(e) {
		(this.dom && this.widget.updateDOM(this.dom, e)) ||
			(this.dom && this.prevWidget && this.prevWidget.destroy(this.dom),
			(this.prevWidget = null),
			this.setDOM(this.widget.toDOM(e)),
			this.widget.editable || (this.dom.contentEditable = "false"));
	}
	getSide() {
		return this.side;
	}
	merge(e, t, i, n, r, s) {
		return (
			!(
				i &&
				(!(i instanceof Vs && this.widget.compare(i.widget)) ||
					(e > 0 && r <= 0) ||
					(t < this.length && s <= 0))
			) && ((this.length = e + (i ? i.length : 0) + (this.length - t)), !0)
		);
	}
	become(e) {
		return (
			e instanceof Vs &&
			e.side == this.side &&
			this.widget.constructor == e.widget.constructor &&
			(this.widget.compare(e.widget) || this.markDirty(!0),
			this.dom && !this.prevWidget && (this.prevWidget = this.widget),
			(this.widget = e.widget),
			(this.length = e.length),
			!0)
		);
	}
	ignoreMutation() {
		return !0;
	}
	ignoreEvent(e) {
		return this.widget.ignoreEvent(e);
	}
	get overrideDOMText() {
		if (0 == this.length) return an.empty;
		let e = this;
		for (; e.parent; ) e = e.parent;
		let { view: t } = e,
			i = t && t.state.doc,
			n = this.posAtStart;
		return i ? i.slice(n, n + this.length) : an.empty;
	}
	domAtPos(e) {
		return (this.length ? 0 == e : this.side > 0)
			? xs.before(this.dom)
			: xs.after(this.dom, e == this.length);
	}
	domBoundsAround() {
		return null;
	}
	coordsAt(e, t) {
		let i = this.widget.coordsAt(this.dom, e, t);
		if (i) return i;
		let n = this.dom.getClientRects(),
			r = null;
		if (!n.length) return null;
		let s = this.side ? this.side < 0 : e > 0;
		for (
			let t = s ? n.length - 1 : 0;
			(r = n[t]), !(e > 0 ? 0 == t : t == n.length - 1 || r.top < r.bottom);
			t += s ? -1 : 1
		);
		return ss(r, !s);
	}
	get isEditable() {
		return !1;
	}
	get isWidget() {
		return !0;
	}
	get isHidden() {
		return this.widget.isHidden;
	}
	destroy() {
		super.destroy(), this.dom && this.widget.destroy(this.dom);
	}
}
class Ls extends Ss {
	constructor(e) {
		super(), (this.side = e);
	}
	get length() {
		return 0;
	}
	merge() {
		return !1;
	}
	become(e) {
		return e instanceof Ls && e.side == this.side;
	}
	split() {
		return new Ls(this.side);
	}
	sync() {
		if (!this.dom) {
			let e = document.createElement("img");
			(e.className = "cm-widgetBuffer"),
				e.setAttribute("aria-hidden", "true"),
				this.setDOM(e);
		}
	}
	getSide() {
		return this.side;
	}
	domAtPos(e) {
		return this.side > 0 ? xs.before(this.dom) : xs.after(this.dom);
	}
	localPosFromDOM() {
		return 0;
	}
	domBoundsAround() {
		return null;
	}
	coordsAt(e) {
		return this.dom.getBoundingClientRect();
	}
	get overrideDOMText() {
		return an.empty;
	}
	get isHidden() {
		return !0;
	}
}
function Ws(e, t) {
	let i = e.dom,
		{ children: n } = e,
		r = 0;
	for (let e = 0; r < n.length; r++) {
		let s = n[r],
			o = e + s.length;
		if (!(o == e && s.getSide() <= 0)) {
			if (t > e && t < o && s.dom.parentNode == i) return s.domAtPos(t - e);
			if (t <= e) break;
			e = o;
		}
	}
	for (let e = r; e > 0; e--) {
		let t = n[e - 1];
		if (t.dom.parentNode == i) return t.domAtPos(t.length);
	}
	for (let e = r; e < n.length; e++) {
		let t = n[e];
		if (t.dom.parentNode == i) return t.domAtPos(0);
	}
	return new xs(i, 0);
}
function zs(e, t, i) {
	let n,
		{ children: r } = e;
	i > 0 &&
	t instanceof qs &&
	r.length &&
	(n = r[r.length - 1]) instanceof qs &&
	n.mark.eq(t.mark)
		? zs(n, t.children[0], i - 1)
		: (r.push(t), t.setParent(e)),
		(e.length += t.length);
}
function Ys(e, t, i) {
	let n = null,
		r = -1,
		s = null,
		o = -1;
	!(function e(t, a) {
		for (let l = 0, h = 0; l < t.children.length && h <= a; l++) {
			let c = t.children[l],
				u = h + c.length;
			u >= a &&
				(c.children.length
					? e(c, a - h)
					: (!s || (s.isHidden && (i > 0 || Ds(s, c)))) &&
							(u > a || (h == u && c.getSide() > 0))
						? ((s = c), (o = a - h))
						: (h < a || (h == u && c.getSide() < 0 && !c.isHidden)) &&
							((n = c), (r = a - h))),
				(h = u);
		}
	})(e, t);
	let a = (i < 0 ? n : s) || n || s;
	return a
		? a.coordsAt(Math.max(0, a == n ? r : o), i)
		: (function (e) {
				let t = e.dom.lastChild;
				if (!t) return e.dom.getBoundingClientRect();
				let i = Jr(t);
				return i[i.length - 1] || null;
			})(e);
}
function Ds(e, t) {
	let i = e.coordsAt(0, 1),
		n = t.coordsAt(0, 1);
	return i && n && n.top < i.bottom;
}
function Bs(e, t) {
	for (let i in e)
		"class" == i && t.class
			? (t.class += " " + e.class)
			: "style" == i && t.style
				? (t.style += ";" + e.style)
				: (t[i] = e[i]);
	return t;
}
Es.prototype.children = Vs.prototype.children = Ls.prototype.children = bs;
const Is = Object.create(null);
function Us(e, t, i) {
	if (e == t) return !0;
	e || (e = Is), t || (t = Is);
	let n = Object.keys(e),
		r = Object.keys(t);
	if (
		n.length - (i && n.indexOf(i) > -1 ? 1 : 0) !=
		r.length - (i && r.indexOf(i) > -1 ? 1 : 0)
	)
		return !1;
	for (let s of n)
		if (s != i && (-1 == r.indexOf(s) || e[s] !== t[s])) return !1;
	return !0;
}
function Gs(e, t, i) {
	let n = !1;
	if (t)
		for (let r in t)
			(i && r in i) ||
				((n = !0),
				"style" == r ? (e.style.cssText = "") : e.removeAttribute(r));
	if (i)
		for (let r in i)
			(t && t[r] == i[r]) ||
				((n = !0),
				"style" == r ? (e.style.cssText = i[r]) : e.setAttribute(r, i[r]));
	return n;
}
function Ns(e) {
	let t = Object.create(null);
	for (let i = 0; i < e.attributes.length; i++) {
		let n = e.attributes[i];
		t[n.name] = n.value;
	}
	return t;
}
class Hs {
	eq(e) {
		return !1;
	}
	updateDOM(e, t) {
		return !1;
	}
	compare(e) {
		return this == e || (this.constructor == e.constructor && this.eq(e));
	}
	get estimatedHeight() {
		return -1;
	}
	get lineBreaks() {
		return 0;
	}
	ignoreEvent(e) {
		return !0;
	}
	coordsAt(e, t, i) {
		return null;
	}
	get isHidden() {
		return !1;
	}
	get editable() {
		return !1;
	}
	destroy(e) {}
}
var Fs = (function (e) {
	return (
		(e[(e.Text = 0)] = "Text"),
		(e[(e.WidgetBefore = 1)] = "WidgetBefore"),
		(e[(e.WidgetAfter = 2)] = "WidgetAfter"),
		(e[(e.WidgetRange = 3)] = "WidgetRange"),
		e
	);
})(Fs || (Fs = {}));
class Ks extends yr {
	constructor(e, t, i, n) {
		super(),
			(this.startSide = e),
			(this.endSide = t),
			(this.widget = i),
			(this.spec = n);
	}
	get heightRelevant() {
		return !1;
	}
	static mark(e) {
		return new Js(e);
	}
	static widget(e) {
		let t = Math.max(-1e4, Math.min(1e4, e.side || 0)),
			i = !!e.block;
		return (
			(t += i && !e.inlineOrder ? (t > 0 ? 3e8 : -4e8) : t > 0 ? 1e8 : -1e8),
			new to(e, t, t, i, e.widget || null, !1)
		);
	}
	static replace(e) {
		let t,
			i,
			n = !!e.block;
		if (e.isBlockGap) (t = -5e8), (i = 4e8);
		else {
			let { start: r, end: s } = io(e, n);
			(t = (r ? (n ? -3e8 : -1) : 5e8) - 1),
				(i = 1 + (s ? (n ? 2e8 : 1) : -6e8));
		}
		return new to(e, t, i, n, e.widget || null, !0);
	}
	static line(e) {
		return new eo(e);
	}
	static set(e, t = !1) {
		return vr.of(e, t);
	}
	hasHeight() {
		return !!this.widget && this.widget.estimatedHeight > -1;
	}
}
Ks.none = vr.empty;
class Js extends Ks {
	constructor(e) {
		let { start: t, end: i } = io(e);
		super(t ? -1 : 5e8, i ? 1 : -6e8, null, e),
			(this.tagName = e.tagName || "span"),
			(this.class = e.class || ""),
			(this.attrs = e.attributes || null);
	}
	eq(e) {
		var t, i;
		return (
			this == e ||
			(e instanceof Js &&
				this.tagName == e.tagName &&
				(this.class ||
					(null === (t = this.attrs) || void 0 === t ? void 0 : t.class)) ==
					(e.class ||
						(null === (i = e.attrs) || void 0 === i ? void 0 : i.class)) &&
				Us(this.attrs, e.attrs, "class"))
		);
	}
	range(e, t = e) {
		if (e >= t) throw new RangeError("Mark decorations may not be empty");
		return super.range(e, t);
	}
}
Js.prototype.point = !1;
class eo extends Ks {
	constructor(e) {
		super(-2e8, -2e8, null, e);
	}
	eq(e) {
		return (
			e instanceof eo &&
			this.spec.class == e.spec.class &&
			Us(this.spec.attributes, e.spec.attributes)
		);
	}
	range(e, t = e) {
		if (t != e)
			throw new RangeError("Line decoration ranges must be zero-length");
		return super.range(e, t);
	}
}
(eo.prototype.mapMode = bn.TrackBefore), (eo.prototype.point = !0);
class to extends Ks {
	constructor(e, t, i, n, r, s) {
		super(t, i, r, e),
			(this.block = n),
			(this.isReplace = s),
			(this.mapMode = n
				? t <= 0
					? bn.TrackBefore
					: bn.TrackAfter
				: bn.TrackDel);
	}
	get type() {
		return this.startSide != this.endSide
			? Fs.WidgetRange
			: this.startSide <= 0
				? Fs.WidgetBefore
				: Fs.WidgetAfter;
	}
	get heightRelevant() {
		return (
			this.block ||
			(!!this.widget &&
				(this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0))
		);
	}
	eq(e) {
		return (
			e instanceof to &&
			((t = this.widget),
			(i = e.widget),
			t == i || !!(t && i && t.compare(i))) &&
			this.block == e.block &&
			this.startSide == e.startSide &&
			this.endSide == e.endSide
		);
		var t, i;
	}
	range(e, t = e) {
		if (
			this.isReplace &&
			(e > t || (e == t && this.startSide > 0 && this.endSide <= 0))
		)
			throw new RangeError("Invalid range for replacement decoration");
		if (!this.isReplace && t != e)
			throw new RangeError(
				"Widget decorations can only have zero-length ranges",
			);
		return super.range(e, t);
	}
}
function io(e, t = !1) {
	let { inclusiveStart: i, inclusiveEnd: n } = e;
	return (
		null == i && (i = e.inclusive),
		null == n && (n = e.inclusive),
		{ start: null != i ? i : t, end: null != n ? n : t }
	);
}
function no(e, t, i, n = 0) {
	let r = i.length - 1;
	r >= 0 && i[r] + n >= e ? (i[r] = Math.max(i[r], t)) : i.push(e, t);
}
to.prototype.point = !0;
class ro extends Ss {
	constructor() {
		super(...arguments),
			(this.children = []),
			(this.length = 0),
			(this.prevAttrs = void 0),
			(this.attrs = null),
			(this.breakAfter = 0);
	}
	merge(e, t, i, n, r, s) {
		if (i) {
			if (!(i instanceof ro)) return !1;
			this.dom || i.transferDOM(this);
		}
		return (
			n && this.setDeco(i ? i.attrs : null),
			ks(this, e, t, i ? i.children.slice() : [], r, s),
			!0
		);
	}
	split(e) {
		let t = new ro();
		if (((t.breakAfter = this.breakAfter), 0 == this.length)) return t;
		let { i: i, off: n } = this.childPos(e);
		n &&
			(t.append(this.children[i].split(n), 0),
			this.children[i].merge(n, this.children[i].length, null, !1, 0, 0),
			i++);
		for (let e = i; e < this.children.length; e++)
			t.append(this.children[e], 0);
		for (; i > 0 && 0 == this.children[i - 1].length; )
			this.children[--i].destroy();
		return (this.children.length = i), this.markDirty(), (this.length = e), t;
	}
	transferDOM(e) {
		this.dom &&
			(this.markDirty(),
			e.setDOM(this.dom),
			(e.prevAttrs = void 0 === this.prevAttrs ? this.attrs : this.prevAttrs),
			(this.prevAttrs = void 0),
			(this.dom = null));
	}
	setDeco(e) {
		Us(this.attrs, e) ||
			(this.dom && ((this.prevAttrs = this.attrs), this.markDirty()),
			(this.attrs = e));
	}
	append(e, t) {
		zs(this, e, t);
	}
	addLineDeco(e) {
		let t = e.spec.attributes,
			i = e.spec.class;
		t && (this.attrs = Bs(t, this.attrs || {})),
			i && (this.attrs = Bs({ class: i }, this.attrs || {}));
	}
	domAtPos(e) {
		return Ws(this, e);
	}
	reuseDOM(e) {
		"DIV" == e.nodeName && (this.setDOM(e), (this.flags |= 6));
	}
	sync(e, t) {
		var i;
		this.dom
			? 4 & this.flags &&
				(ds(this.dom),
				(this.dom.className = "cm-line"),
				(this.prevAttrs = this.attrs ? null : void 0))
			: (this.setDOM(document.createElement("div")),
				(this.dom.className = "cm-line"),
				(this.prevAttrs = this.attrs ? null : void 0)),
			void 0 !== this.prevAttrs &&
				(Gs(this.dom, this.prevAttrs, this.attrs),
				this.dom.classList.add("cm-line"),
				(this.prevAttrs = void 0)),
			super.sync(e, t);
		let n = this.dom.lastChild;
		for (; n && Ss.get(n) instanceof qs; ) n = n.lastChild;
		if (
			!(
				n &&
				this.length &&
				("BR" == n.nodeName ||
					0 !=
						(null === (i = Ss.get(n)) || void 0 === i
							? void 0
							: i.isEditable) ||
					(js.ios && this.children.some((e) => e instanceof Es)))
			)
		) {
			let e = document.createElement("BR");
			(e.cmIgnore = !0), this.dom.appendChild(e);
		}
	}
	measureTextSize() {
		if (0 == this.children.length || this.length > 20) return null;
		let e,
			t = 0;
		for (let i of this.children) {
			if (!(i instanceof Es) || /[^ -~]/.test(i.text)) return null;
			let n = Jr(i.dom);
			if (1 != n.length) return null;
			(t += n[0].width), (e = n[0].height);
		}
		return t
			? {
					lineHeight: this.dom.getBoundingClientRect().height,
					charWidth: t / this.length,
					textHeight: e,
				}
			: null;
	}
	coordsAt(e, t) {
		let i = Ys(this, e, t);
		if (!this.children.length && i && this.parent) {
			let { heightOracle: e } = this.parent.view.viewState,
				t = i.bottom - i.top;
			if (Math.abs(t - e.lineHeight) < 2 && e.textHeight < t) {
				let n = (t - e.textHeight) / 2;
				return {
					top: i.top + n,
					bottom: i.bottom - n,
					left: i.left,
					right: i.left,
				};
			}
		}
		return i;
	}
	become(e) {
		return (
			e instanceof ro &&
			0 == this.children.length &&
			0 == e.children.length &&
			Us(this.attrs, e.attrs) &&
			this.breakAfter == e.breakAfter
		);
	}
	covers() {
		return !0;
	}
	static find(e, t) {
		for (let i = 0, n = 0; i < e.children.length; i++) {
			let r = e.children[i],
				s = n + r.length;
			if (s >= t) {
				if (r instanceof ro) return r;
				if (s > t) break;
			}
			n = s + r.breakAfter;
		}
		return null;
	}
}
class so extends Ss {
	constructor(e, t, i) {
		super(),
			(this.widget = e),
			(this.length = t),
			(this.deco = i),
			(this.breakAfter = 0),
			(this.prevWidget = null);
	}
	merge(e, t, i, n, r, s) {
		return (
			!(
				i &&
				(!(i instanceof so && this.widget.compare(i.widget)) ||
					(e > 0 && r <= 0) ||
					(t < this.length && s <= 0))
			) && ((this.length = e + (i ? i.length : 0) + (this.length - t)), !0)
		);
	}
	domAtPos(e) {
		return 0 == e ? xs.before(this.dom) : xs.after(this.dom, e == this.length);
	}
	split(e) {
		let t = this.length - e;
		this.length = e;
		let i = new so(this.widget, t, this.deco);
		return (i.breakAfter = this.breakAfter), i;
	}
	get children() {
		return bs;
	}
	sync(e) {
		(this.dom && this.widget.updateDOM(this.dom, e)) ||
			(this.dom && this.prevWidget && this.prevWidget.destroy(this.dom),
			(this.prevWidget = null),
			this.setDOM(this.widget.toDOM(e)),
			this.widget.editable || (this.dom.contentEditable = "false"));
	}
	get overrideDOMText() {
		return this.parent
			? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd)
			: an.empty;
	}
	domBoundsAround() {
		return null;
	}
	become(e) {
		return (
			e instanceof so &&
			e.widget.constructor == this.widget.constructor &&
			(e.widget.compare(this.widget) || this.markDirty(!0),
			this.dom && !this.prevWidget && (this.prevWidget = this.widget),
			(this.widget = e.widget),
			(this.length = e.length),
			(this.deco = e.deco),
			(this.breakAfter = e.breakAfter),
			!0)
		);
	}
	ignoreMutation() {
		return !0;
	}
	ignoreEvent(e) {
		return this.widget.ignoreEvent(e);
	}
	get isEditable() {
		return !1;
	}
	get isWidget() {
		return !0;
	}
	coordsAt(e, t) {
		let i = this.widget.coordsAt(this.dom, e, t);
		return (
			i ||
			(this.widget instanceof oo
				? null
				: ss(this.dom.getBoundingClientRect(), this.length ? 0 == e : t <= 0))
		);
	}
	destroy() {
		super.destroy(), this.dom && this.widget.destroy(this.dom);
	}
	covers(e) {
		let { startSide: t, endSide: i } = this.deco;
		return t != i && (e < 0 ? t < 0 : i > 0);
	}
}
class oo extends Hs {
	constructor(e) {
		super(), (this.height = e);
	}
	toDOM() {
		let e = document.createElement("div");
		return (e.className = "cm-gap"), this.updateDOM(e), e;
	}
	eq(e) {
		return e.height == this.height;
	}
	updateDOM(e) {
		return (e.style.height = this.height + "px"), !0;
	}
	get editable() {
		return !0;
	}
	get estimatedHeight() {
		return this.height;
	}
	ignoreEvent() {
		return !1;
	}
}
class ao {
	constructor(e, t, i, n) {
		(this.doc = e),
			(this.pos = t),
			(this.end = i),
			(this.disallowBlockEffectsFor = n),
			(this.content = []),
			(this.curLine = null),
			(this.breakAtStart = 0),
			(this.pendingBuffer = 0),
			(this.bufferMarks = []),
			(this.atCursorPos = !0),
			(this.openStart = -1),
			(this.openEnd = -1),
			(this.text = ""),
			(this.textOff = 0),
			(this.cursor = e.iter()),
			(this.skip = t);
	}
	posCovered() {
		if (0 == this.content.length)
			return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
		let e = this.content[this.content.length - 1];
		return !(e.breakAfter || (e instanceof so && e.deco.endSide < 0));
	}
	getLine() {
		return (
			this.curLine ||
				(this.content.push((this.curLine = new ro())), (this.atCursorPos = !0)),
			this.curLine
		);
	}
	flushBuffer(e = this.bufferMarks) {
		this.pendingBuffer &&
			(this.curLine.append(lo(new Ls(-1), e), e.length),
			(this.pendingBuffer = 0));
	}
	addBlockWidget(e) {
		this.flushBuffer(), (this.curLine = null), this.content.push(e);
	}
	finish(e) {
		this.pendingBuffer && e <= this.bufferMarks.length
			? this.flushBuffer()
			: (this.pendingBuffer = 0),
			this.posCovered() ||
				(e &&
					this.content.length &&
					this.content[this.content.length - 1] instanceof so) ||
				this.getLine();
	}
	buildText(e, t, i) {
		for (; e > 0; ) {
			if (this.textOff == this.text.length) {
				let { value: t, lineBreak: i, done: n } = this.cursor.next(this.skip);
				if (((this.skip = 0), n))
					throw new Error("Ran out of text content when drawing inline views");
				if (i) {
					this.posCovered() || this.getLine(),
						this.content.length
							? (this.content[this.content.length - 1].breakAfter = 1)
							: (this.breakAtStart = 1),
						this.flushBuffer(),
						(this.curLine = null),
						(this.atCursorPos = !0),
						e--;
					continue;
				}
				(this.text = t), (this.textOff = 0);
			}
			let n = Math.min(this.text.length - this.textOff, e, 512);
			this.flushBuffer(t.slice(t.length - i)),
				this.getLine().append(
					lo(new Es(this.text.slice(this.textOff, this.textOff + n)), t),
					i,
				),
				(this.atCursorPos = !0),
				(this.textOff += n),
				(e -= n),
				(i = 0);
		}
	}
	span(e, t, i, n) {
		this.buildText(t - e, i, n),
			(this.pos = t),
			this.openStart < 0 && (this.openStart = n);
	}
	point(e, t, i, n, r, s) {
		if (this.disallowBlockEffectsFor[s] && i instanceof to) {
			if (i.block)
				throw new RangeError(
					"Block decorations may not be specified via plugins",
				);
			if (t > this.doc.lineAt(this.pos).to)
				throw new RangeError(
					"Decorations that replace line breaks may not be specified via plugins",
				);
		}
		let o = t - e;
		if (i instanceof to)
			if (i.block)
				i.startSide > 0 && !this.posCovered() && this.getLine(),
					this.addBlockWidget(new so(i.widget || ho.block, o, i));
			else {
				let s = Vs.create(i.widget || ho.inline, o, o ? 0 : i.startSide),
					a =
						this.atCursorPos &&
						!s.isEditable &&
						r <= n.length &&
						(e < t || i.startSide > 0),
					l = !s.isEditable && (e < t || r > n.length || i.startSide <= 0),
					h = this.getLine();
				2 != this.pendingBuffer ||
					a ||
					s.isEditable ||
					(this.pendingBuffer = 0),
					this.flushBuffer(n),
					a &&
						(h.append(lo(new Ls(1), n), r),
						(r = n.length + Math.max(0, r - n.length))),
					h.append(lo(s, n), r),
					(this.atCursorPos = l),
					(this.pendingBuffer = l ? (e < t || r > n.length ? 1 : 2) : 0),
					this.pendingBuffer && (this.bufferMarks = n.slice());
			}
		else
			this.doc.lineAt(this.pos).from == this.pos &&
				this.getLine().addLineDeco(i);
		o &&
			(this.textOff + o <= this.text.length
				? (this.textOff += o)
				: ((this.skip += o - (this.text.length - this.textOff)),
					(this.text = ""),
					(this.textOff = 0)),
			(this.pos = t)),
			this.openStart < 0 && (this.openStart = r);
	}
	static build(e, t, i, n, r) {
		let s = new ao(e, t, i, r);
		return (
			(s.openEnd = vr.spans(n, t, i, s)),
			s.openStart < 0 && (s.openStart = s.openEnd),
			s.finish(s.openEnd),
			s
		);
	}
}
function lo(e, t) {
	for (let i of t) e = new qs(i, [e], e.length);
	return e;
}
class ho extends Hs {
	constructor(e) {
		super(), (this.tag = e);
	}
	eq(e) {
		return e.tag == this.tag;
	}
	toDOM() {
		return document.createElement(this.tag);
	}
	updateDOM(e) {
		return e.nodeName.toLowerCase() == this.tag;
	}
	get isHidden() {
		return !0;
	}
}
(ho.inline = new ho("span")), (ho.block = new ho("div"));
var co = (function (e) {
	return (e[(e.LTR = 0)] = "LTR"), (e[(e.RTL = 1)] = "RTL"), e;
})(co || (co = {}));
const uo = co.LTR,
	fo = co.RTL;
function Oo(e) {
	let t = [];
	for (let i = 0; i < e.length; i++) t.push(1 << +e[i]);
	return t;
}
const po = Oo(
		"88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008",
	),
	mo = Oo(
		"4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333",
	),
	go = Object.create(null),
	xo = [];
for (let e of ["()", "[]", "{}"]) {
	let t = e.charCodeAt(0),
		i = e.charCodeAt(1);
	(go[t] = i), (go[i] = -t);
}
function bo(e) {
	return e <= 247
		? po[e]
		: 1424 <= e && e <= 1524
			? 2
			: 1536 <= e && e <= 1785
				? mo[e - 1536]
				: 1774 <= e && e <= 2220
					? 4
					: 8192 <= e && e <= 8204
						? 256
						: 64336 <= e && e <= 65023
							? 4
							: 1;
}
const So = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class yo {
	get dir() {
		return this.level % 2 ? fo : uo;
	}
	constructor(e, t, i) {
		(this.from = e), (this.to = t), (this.level = i);
	}
	side(e, t) {
		return (this.dir == t) == e ? this.to : this.from;
	}
	forward(e, t) {
		return e == (this.dir == t);
	}
	static find(e, t, i, n) {
		let r = -1;
		for (let s = 0; s < e.length; s++) {
			let o = e[s];
			if (o.from <= t && o.to >= t) {
				if (o.level == i) return s;
				(r < 0 ||
					(0 != n ? (n < 0 ? o.from < t : o.to > t) : e[r].level > o.level)) &&
					(r = s);
			}
		}
		if (r < 0) throw new RangeError("Index out of range");
		return r;
	}
}
function Qo(e, t) {
	if (e.length != t.length) return !1;
	for (let i = 0; i < e.length; i++) {
		let n = e[i],
			r = t[i];
		if (
			n.from != r.from ||
			n.to != r.to ||
			n.direction != r.direction ||
			!Qo(n.inner, r.inner)
		)
			return !1;
	}
	return !0;
}
const wo = [];
function ko(e, t, i, n, r, s, o) {
	let a = n % 2 ? 2 : 1;
	if (n % 2 == r % 2)
		for (let l = t, h = 0; l < i; ) {
			let t = !0,
				c = !1;
			if (h == s.length || l < s[h].from) {
				let e = wo[l];
				e != a && ((t = !1), (c = 16 == e));
			}
			let u = t || 1 != a ? null : [],
				f = t ? n : n + 1,
				O = l;
			e: for (;;)
				if (h < s.length && O == s[h].from) {
					if (c) break e;
					let d = s[h];
					if (!t)
						for (let e = d.to, t = h + 1; ; ) {
							if (e == i) break e;
							if (!(t < s.length && s[t].from == e)) {
								if (wo[e] == a) break e;
								break;
							}
							e = s[t++].to;
						}
					if ((h++, u)) u.push(d);
					else {
						d.from > l && o.push(new yo(l, d.from, f)),
							vo(
								e,
								(d.direction == uo) != !(f % 2) ? n + 1 : n,
								r,
								d.inner,
								d.from,
								d.to,
								o,
							),
							(l = d.to);
					}
					O = d.to;
				} else {
					if (O == i || (t ? wo[O] != a : wo[O] == a)) break;
					O++;
				}
			u ? ko(e, l, O, n + 1, r, u, o) : l < O && o.push(new yo(l, O, f)),
				(l = O);
		}
	else
		for (let l = i, h = s.length; l > t; ) {
			let i = !0,
				c = !1;
			if (!h || l > s[h - 1].to) {
				let e = wo[l - 1];
				e != a && ((i = !1), (c = 16 == e));
			}
			let u = i || 1 != a ? null : [],
				f = i ? n : n + 1,
				O = l;
			e: for (;;)
				if (h && O == s[h - 1].to) {
					if (c) break e;
					let d = s[--h];
					if (!i)
						for (let e = d.from, i = h; ; ) {
							if (e == t) break e;
							if (!i || s[i - 1].to != e) {
								if (wo[e - 1] == a) break e;
								break;
							}
							e = s[--i].from;
						}
					if (u) u.push(d);
					else {
						d.to < l && o.push(new yo(d.to, l, f)),
							vo(
								e,
								(d.direction == uo) != !(f % 2) ? n + 1 : n,
								r,
								d.inner,
								d.from,
								d.to,
								o,
							),
							(l = d.from);
					}
					O = d.from;
				} else {
					if (O == t || (i ? wo[O - 1] != a : wo[O - 1] == a)) break;
					O--;
				}
			u ? ko(e, O, l, n + 1, r, u, o) : O < l && o.push(new yo(O, l, f)),
				(l = O);
		}
}
function vo(e, t, i, n, r, s, o) {
	let a = t % 2 ? 2 : 1;
	!(function (e, t, i, n, r) {
		for (let s = 0; s <= n.length; s++) {
			let o = s ? n[s - 1].to : t,
				a = s < n.length ? n[s].from : i,
				l = s ? 256 : r;
			for (let t = o, i = l, n = l; t < a; t++) {
				let r = bo(e.charCodeAt(t));
				512 == r ? (r = i) : 8 == r && 4 == n && (r = 16),
					(wo[t] = 4 == r ? 2 : r),
					7 & r && (n = r),
					(i = r);
			}
			for (let e = o, t = l, n = l; e < a; e++) {
				let r = wo[e];
				if (128 == r)
					e < a - 1 && t == wo[e + 1] && 24 & t
						? (r = wo[e] = t)
						: (wo[e] = 256);
				else if (64 == r) {
					let r = e + 1;
					for (; r < a && 64 == wo[r]; ) r++;
					let s =
						(e && 8 == t) || (r < i && 8 == wo[r]) ? (1 == n ? 1 : 8) : 256;
					for (let t = e; t < r; t++) wo[t] = s;
					e = r - 1;
				} else 8 == r && 1 == n && (wo[e] = 1);
				(t = r), 7 & r && (n = r);
			}
		}
	})(e, r, s, n, a),
		(function (e, t, i, n, r) {
			let s = 1 == r ? 2 : 1;
			for (let o = 0, a = 0, l = 0; o <= n.length; o++) {
				let h = o ? n[o - 1].to : t,
					c = o < n.length ? n[o].from : i;
				for (let t, i, n, o = h; o < c; o++)
					if ((i = go[(t = e.charCodeAt(o))]))
						if (i < 0) {
							for (let e = a - 3; e >= 0; e -= 3)
								if (xo[e + 1] == -i) {
									let t = xo[e + 2],
										i = 2 & t ? r : 4 & t ? (1 & t ? s : r) : 0;
									i && (wo[o] = wo[xo[e]] = i), (a = e);
									break;
								}
						} else {
							if (189 == xo.length) break;
							(xo[a++] = o), (xo[a++] = t), (xo[a++] = l);
						}
					else if (2 == (n = wo[o]) || 1 == n) {
						let e = n == r;
						l = e ? 0 : 1;
						for (let t = a - 3; t >= 0; t -= 3) {
							let i = xo[t + 2];
							if (2 & i) break;
							if (e) xo[t + 2] |= 2;
							else {
								if (4 & i) break;
								xo[t + 2] |= 4;
							}
						}
					}
			}
		})(e, r, s, n, a),
		(function (e, t, i, n) {
			for (let r = 0, s = n; r <= i.length; r++) {
				let o = r ? i[r - 1].to : e,
					a = r < i.length ? i[r].from : t;
				for (let l = o; l < a; ) {
					let o = wo[l];
					if (256 == o) {
						let o = l + 1;
						for (;;)
							if (o == a) {
								if (r == i.length) break;
								(o = i[r++].to), (a = r < i.length ? i[r].from : t);
							} else {
								if (256 != wo[o]) break;
								o++;
							}
						let h = 1 == s,
							c = h == (1 == (o < t ? wo[o] : n)) ? (h ? 1 : 2) : n;
						for (let t = o, n = r, s = n ? i[n - 1].to : e; t > l; )
							t == s && ((t = i[--n].from), (s = n ? i[n - 1].to : e)),
								(wo[--t] = c);
						l = o;
					} else (s = o), l++;
				}
			}
		})(r, s, n, a),
		ko(e, r, s, t, i, n, o);
}
function $o(e) {
	return [new yo(0, e, 0)];
}
let Po = "";
function Zo(e, t, i, n, r) {
	var s;
	let o = n.head - e.from,
		a = yo.find(
			t,
			o,
			null !== (s = n.bidiLevel) && void 0 !== s ? s : -1,
			n.assoc,
		),
		l = t[a],
		h = l.side(r, i);
	if (o == h) {
		let e = (a += r ? 1 : -1);
		if (e < 0 || e >= t.length) return null;
		(l = t[(a = e)]), (o = l.side(!r, i)), (h = l.side(r, i));
	}
	let c = gn(e.text, o, l.forward(r, i));
	(c < l.from || c > l.to) && (c = h),
		(Po = e.text.slice(Math.min(o, c), Math.max(o, c)));
	let u = a == (r ? t.length - 1 : 0) ? null : t[a + (r ? 1 : -1)];
	return u && c == h && u.level + (r ? 0 : 1) < l.level
		? _n.cursor(u.side(!r, i) + e.from, u.forward(r, i) ? 1 : -1, u.level)
		: _n.cursor(c + e.from, l.forward(r, i) ? -1 : 1, l.level);
}
function _o(e, t, i) {
	for (let n = t; n < i; n++) {
		let t = bo(e.charCodeAt(n));
		if (1 == t) return uo;
		if (2 == t || 4 == t) return fo;
	}
	return uo;
}
const To = An.define(),
	Xo = An.define(),
	Ao = An.define(),
	Co = An.define(),
	Ro = An.define(),
	Mo = An.define(),
	jo = An.define(),
	Eo = An.define(),
	qo = An.define(),
	Vo = An.define({ combine: (e) => e.some((e) => e) }),
	Lo = An.define({ combine: (e) => e.some((e) => e) }),
	Wo = An.define();
class zo {
	constructor(e, t = "nearest", i = "nearest", n = 5, r = 5, s = !1) {
		(this.range = e),
			(this.y = t),
			(this.x = i),
			(this.yMargin = n),
			(this.xMargin = r),
			(this.isSnapshot = s);
	}
	map(e) {
		return e.empty
			? this
			: new zo(
					this.range.map(e),
					this.y,
					this.x,
					this.yMargin,
					this.xMargin,
					this.isSnapshot,
				);
	}
	clip(e) {
		return this.range.to <= e.doc.length
			? this
			: new zo(
					_n.cursor(e.doc.length),
					this.y,
					this.x,
					this.yMargin,
					this.xMargin,
					this.isSnapshot,
				);
	}
}
const Yo = lr.define({ map: (e, t) => e.map(t) }),
	Do = lr.define();
function Bo(e, t, i) {
	let n = e.facet(Co);
	n.length
		? n[0](t)
		: window.onerror
			? window.onerror(String(t), i, void 0, void 0, t)
			: i
				? console.error(i + ":", t)
				: console.error(t);
}
const Io = An.define({ combine: (e) => !e.length || e[0] });
let Uo = 0;
const Go = An.define();
class No {
	constructor(e, t, i, n, r) {
		(this.id = e),
			(this.create = t),
			(this.domEventHandlers = i),
			(this.domEventObservers = n),
			(this.extension = r(this));
	}
	static define(e, t) {
		const {
			eventHandlers: i,
			eventObservers: n,
			provide: r,
			decorations: s,
		} = t || {};
		return new No(Uo++, e, i, n, (e) => {
			let t = [Go.of(e)];
			return (
				s &&
					t.push(
						Jo.of((t) => {
							let i = t.plugin(e);
							return i ? s(i) : Ks.none;
						}),
					),
				r && t.push(r(e)),
				t
			);
		});
	}
	static fromClass(e, t) {
		return No.define((t) => new e(t), t);
	}
}
class Ho {
	constructor(e) {
		(this.spec = e), (this.mustUpdate = null), (this.value = null);
	}
	update(e) {
		if (this.value) {
			if (this.mustUpdate) {
				let e = this.mustUpdate;
				if (((this.mustUpdate = null), this.value.update))
					try {
						this.value.update(e);
					} catch (t) {
						if (
							(Bo(e.state, t, "CodeMirror plugin crashed"), this.value.destroy)
						)
							try {
								this.value.destroy();
							} catch (e) {}
						this.deactivate();
					}
			}
		} else if (this.spec)
			try {
				this.value = this.spec.create(e);
			} catch (t) {
				Bo(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
			}
		return this;
	}
	destroy(e) {
		var t;
		if (null === (t = this.value) || void 0 === t ? void 0 : t.destroy)
			try {
				this.value.destroy();
			} catch (t) {
				Bo(e.state, t, "CodeMirror plugin crashed");
			}
	}
	deactivate() {
		this.spec = this.value = null;
	}
}
const Fo = An.define(),
	Ko = An.define(),
	Jo = An.define(),
	ea = An.define(),
	ta = An.define(),
	ia = An.define();
function na(e, t) {
	let i = e.state.facet(ia);
	if (!i.length) return i;
	let n = i.map((t) => (t instanceof Function ? t(e) : t)),
		r = [];
	return (
		vr.spans(n, t.from, t.to, {
			point() {},
			span(e, i, n, s) {
				let o = e - t.from,
					a = i - t.from,
					l = r;
				for (let e = n.length - 1; e >= 0; e--, s--) {
					let i,
						r = n[e].spec.bidiIsolate;
					if (
						(null == r && (r = _o(t.text, o, a)),
						s > 0 &&
							l.length &&
							(i = l[l.length - 1]).to == o &&
							i.direction == r)
					)
						(i.to = a), (l = i.inner);
					else {
						let e = { from: o, to: a, direction: r, inner: [] };
						l.push(e), (l = e.inner);
					}
				}
			},
		}),
		r
	);
}
const ra = An.define();
function sa(e) {
	let t = 0,
		i = 0,
		n = 0,
		r = 0;
	for (let s of e.state.facet(ra)) {
		let o = s(e);
		o &&
			(null != o.left && (t = Math.max(t, o.left)),
			null != o.right && (i = Math.max(i, o.right)),
			null != o.top && (n = Math.max(n, o.top)),
			null != o.bottom && (r = Math.max(r, o.bottom)));
	}
	return { left: t, right: i, top: n, bottom: r };
}
const oa = An.define();
class aa {
	constructor(e, t, i, n) {
		(this.fromA = e), (this.toA = t), (this.fromB = i), (this.toB = n);
	}
	join(e) {
		return new aa(
			Math.min(this.fromA, e.fromA),
			Math.max(this.toA, e.toA),
			Math.min(this.fromB, e.fromB),
			Math.max(this.toB, e.toB),
		);
	}
	addToSet(e) {
		let t = e.length,
			i = this;
		for (; t > 0; t--) {
			let n = e[t - 1];
			if (!(n.fromA > i.toA)) {
				if (n.toA < i.fromA) break;
				(i = i.join(n)), e.splice(t - 1, 1);
			}
		}
		return e.splice(t, 0, i), e;
	}
	static extendWithRanges(e, t) {
		if (0 == t.length) return e;
		let i = [];
		for (let n = 0, r = 0, s = 0, o = 0; ; n++) {
			let a = n == e.length ? null : e[n],
				l = s - o,
				h = a ? a.fromB : 1e9;
			for (; r < t.length && t[r] < h; ) {
				let e = t[r],
					n = t[r + 1],
					s = Math.max(o, e),
					a = Math.min(h, n);
				if ((s <= a && new aa(s + l, a + l, s, a).addToSet(i), n > h)) break;
				r += 2;
			}
			if (!a) return i;
			new aa(a.fromA, a.toA, a.fromB, a.toB).addToSet(i),
				(s = a.toA),
				(o = a.toB);
		}
	}
}
class la {
	constructor(e, t, i) {
		(this.view = e),
			(this.state = t),
			(this.transactions = i),
			(this.flags = 0),
			(this.startState = e.state),
			(this.changes = yn.empty(this.startState.doc.length));
		for (let e of i) this.changes = this.changes.compose(e.changes);
		let n = [];
		this.changes.iterChangedRanges((e, t, i, r) => n.push(new aa(e, t, i, r))),
			(this.changedRanges = n);
	}
	static create(e, t, i) {
		return new la(e, t, i);
	}
	get viewportChanged() {
		return (4 & this.flags) > 0;
	}
	get viewportMoved() {
		return (8 & this.flags) > 0;
	}
	get heightChanged() {
		return (2 & this.flags) > 0;
	}
	get geometryChanged() {
		return this.docChanged || (18 & this.flags) > 0;
	}
	get focusChanged() {
		return (1 & this.flags) > 0;
	}
	get docChanged() {
		return !this.changes.empty;
	}
	get selectionSet() {
		return this.transactions.some((e) => e.selection);
	}
	get empty() {
		return 0 == this.flags && 0 == this.transactions.length;
	}
}
class ha extends Ss {
	get length() {
		return this.view.state.doc.length;
	}
	constructor(e) {
		super(),
			(this.view = e),
			(this.decorations = []),
			(this.dynamicDecorationMap = [!1]),
			(this.domChanged = null),
			(this.hasComposition = null),
			(this.markedForComposition = new Set()),
			(this.editContextFormatting = Ks.none),
			(this.lastCompositionAfterCursor = !1),
			(this.minWidth = 0),
			(this.minWidthFrom = 0),
			(this.minWidthTo = 0),
			(this.impreciseAnchor = null),
			(this.impreciseHead = null),
			(this.forceSelection = !1),
			(this.lastUpdate = Date.now()),
			this.setDOM(e.contentDOM),
			(this.children = [new ro()]),
			this.children[0].setParent(this),
			this.updateDeco(),
			this.updateInner([new aa(0, 0, 0, e.state.doc.length)], 0, null);
	}
	update(e) {
		var t;
		let i = e.changedRanges;
		this.minWidth > 0 &&
			i.length &&
			(i.every(
				({ fromA: e, toA: t }) => t < this.minWidthFrom || e > this.minWidthTo,
			)
				? ((this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1)),
					(this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)))
				: (this.minWidth = this.minWidthFrom = this.minWidthTo = 0)),
			this.updateEditContextFormatting(e);
		let n = -1;
		this.view.inputState.composing >= 0 &&
			!this.view.observer.editContext &&
			((null === (t = this.domChanged) || void 0 === t ? void 0 : t.newSel)
				? (n = this.domChanged.newSel.head)
				: (function (e, t) {
						let i = !1;
						t &&
							e.iterChangedRanges((e, n) => {
								e < t.to && n > t.from && (i = !0);
							});
						return i;
					})(e.changes, this.hasComposition) ||
					e.selectionSet ||
					(n = e.state.selection.main.head));
		let r =
			n > -1
				? (function (e, t, i) {
						let n = ca(e, i);
						if (!n) return null;
						let { node: r, from: s, to: o } = n,
							a = r.nodeValue;
						if (/[\n\r]/.test(a)) return null;
						if (e.state.doc.sliceString(n.from, n.to) != a) return null;
						let l = t.invertedDesc,
							h = new aa(l.mapPos(s), l.mapPos(o), s, o),
							c = [];
						for (let t = r.parentNode; ; t = t.parentNode) {
							let i = Ss.get(t);
							if (i instanceof qs) c.push({ node: t, deco: i.mark });
							else {
								if (
									i instanceof ro ||
									("DIV" == t.nodeName && t.parentNode == e.contentDOM)
								)
									return { range: h, text: r, marks: c, line: t };
								if (t == e.contentDOM) return null;
								c.push({
									node: t,
									deco: new Js({
										inclusive: !0,
										attributes: Ns(t),
										tagName: t.tagName.toLowerCase(),
									}),
								});
							}
						}
					})(this.view, e.changes, n)
				: null;
		if (((this.domChanged = null), this.hasComposition)) {
			this.markedForComposition.clear();
			let { from: t, to: n } = this.hasComposition;
			i = new aa(
				t,
				n,
				e.changes.mapPos(t, -1),
				e.changes.mapPos(n, 1),
			).addToSet(i.slice());
		}
		(this.hasComposition = r ? { from: r.range.fromB, to: r.range.toB } : null),
			(js.ie || js.chrome) &&
				!r &&
				e &&
				e.state.doc.lines != e.startState.doc.lines &&
				(this.forceSelection = !0);
		let s = (function (e, t, i) {
			let n = new ua();
			return vr.compare(e, t, i, n), n.changes;
		})(this.decorations, this.updateDeco(), e.changes);
		return (
			(i = aa.extendWithRanges(i, s)),
			!!(7 & this.flags || 0 != i.length) &&
				(this.updateInner(i, e.startState.doc.length, r),
				e.transactions.length && (this.lastUpdate = Date.now()),
				!0)
		);
	}
	updateInner(e, t, i) {
		(this.view.viewState.mustMeasureContent = !0), this.updateChildren(e, t, i);
		let { observer: n } = this.view;
		n.ignore(() => {
			(this.dom.style.height =
				this.view.viewState.contentHeight / this.view.scaleY + "px"),
				(this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "");
			let e =
				js.chrome || js.ios
					? { node: n.selectionRange.focusNode, written: !1 }
					: void 0;
			this.sync(this.view, e),
				(this.flags &= -8),
				e &&
					(e.written || n.selectionRange.focusNode != e.node) &&
					(this.forceSelection = !0),
				(this.dom.style.height = "");
		}),
			this.markedForComposition.forEach((e) => (e.flags &= -9));
		let r = [];
		if (
			this.view.viewport.from ||
			this.view.viewport.to < this.view.state.doc.length
		)
			for (let e of this.children)
				e instanceof so && e.widget instanceof oo && r.push(e.dom);
		n.updateGaps(r);
	}
	updateChildren(e, t, i) {
		let n = i ? i.range.addToSet(e.slice()) : e,
			r = this.childCursor(t);
		for (let e = n.length - 1; ; e--) {
			let t = e >= 0 ? n[e] : null;
			if (!t) break;
			let s,
				o,
				a,
				l,
				{ fromA: h, toA: c, fromB: u, toB: f } = t;
			if (i && i.range.fromB < f && i.range.toB > u) {
				let e = ao.build(
						this.view.state.doc,
						u,
						i.range.fromB,
						this.decorations,
						this.dynamicDecorationMap,
					),
					t = ao.build(
						this.view.state.doc,
						i.range.toB,
						f,
						this.decorations,
						this.dynamicDecorationMap,
					);
				(o = e.breakAtStart), (a = e.openStart), (l = t.openEnd);
				let n = this.compositionView(i);
				t.breakAtStart
					? (n.breakAfter = 1)
					: t.content.length &&
						n.merge(n.length, n.length, t.content[0], !1, t.openStart, 0) &&
						((n.breakAfter = t.content[0].breakAfter), t.content.shift()),
					e.content.length &&
						n.merge(0, 0, e.content[e.content.length - 1], !0, 0, e.openEnd) &&
						e.content.pop(),
					(s = e.content.concat(n).concat(t.content));
			} else
				({
					content: s,
					breakAtStart: o,
					openStart: a,
					openEnd: l,
				} = ao.build(
					this.view.state.doc,
					u,
					f,
					this.decorations,
					this.dynamicDecorationMap,
				));
			let { i: O, off: d } = r.findPos(c, 1),
				{ i: p, off: m } = r.findPos(h, -1);
			ws(this, p, m, O, d, s, o, a, l);
		}
		i && this.fixCompositionDOM(i);
	}
	updateEditContextFormatting(e) {
		this.editContextFormatting = this.editContextFormatting.map(e.changes);
		for (let t of e.transactions)
			for (let e of t.effects)
				e.is(Do) && (this.editContextFormatting = e.value);
	}
	compositionView(e) {
		let t = new Es(e.text.nodeValue);
		t.flags |= 8;
		for (let { deco: i } of e.marks) t = new qs(i, [t], t.length);
		let i = new ro();
		return i.append(t, 0), i;
	}
	fixCompositionDOM(e) {
		let t = (e, t) => {
				(t.flags |= 8 | (t.children.some((e) => 7 & e.flags) ? 1 : 0)),
					this.markedForComposition.add(t);
				let i = Ss.get(e);
				i && i != t && (i.dom = null), t.setDOM(e);
			},
			i = this.childPos(e.range.fromB, 1),
			n = this.children[i.i];
		t(e.line, n);
		for (let r = e.marks.length - 1; r >= -1; r--)
			(i = n.childPos(i.off, 1)),
				(n = n.children[i.i]),
				t(r >= 0 ? e.marks[r].node : e.text, n);
	}
	updateSelection(e = !1, t = !1) {
		(!e && this.view.observer.selectionRange.focusNode) ||
			this.view.observer.readSelectionRange();
		let i = this.view.root.activeElement,
			n = i == this.dom,
			r =
				!n &&
				!(this.view.state.facet(Io) || this.dom.tabIndex > -1) &&
				Kr(this.dom, this.view.observer.selectionRange) &&
				!(i && this.dom.contains(i));
		if (!(n || t || r)) return;
		let s = this.forceSelection;
		this.forceSelection = !1;
		let o = this.view.state.selection.main,
			a = this.moveToLine(this.domAtPos(o.anchor)),
			l = o.empty ? a : this.moveToLine(this.domAtPos(o.head));
		if (
			js.gecko &&
			o.empty &&
			!this.hasComposition &&
			1 == (h = a).node.nodeType &&
			h.node.firstChild &&
			(0 == h.offset ||
				"false" == h.node.childNodes[h.offset - 1].contentEditable) &&
			(h.offset == h.node.childNodes.length ||
				"false" == h.node.childNodes[h.offset].contentEditable)
		) {
			let e = document.createTextNode("");
			this.view.observer.ignore(() =>
				a.node.insertBefore(e, a.node.childNodes[a.offset] || null),
			),
				(a = l = new xs(e, 0)),
				(s = !0);
		}
		var h;
		let c = this.view.observer.selectionRange;
		(!s &&
			c.focusNode &&
			((es(a.node, a.offset, c.anchorNode, c.anchorOffset) &&
				es(l.node, l.offset, c.focusNode, c.focusOffset)) ||
				this.suppressWidgetCursorChange(c, o))) ||
			(this.view.observer.ignore(() => {
				js.android &&
					js.chrome &&
					this.dom.contains(c.focusNode) &&
					(function (e, t) {
						for (let i = e; i && i != t; i = i.assignedSlot || i.parentNode)
							if (1 == i.nodeType && "false" == i.contentEditable) return !0;
						return !1;
					})(c.focusNode, this.dom) &&
					(this.dom.blur(), this.dom.focus({ preventScroll: !0 }));
				let e = Hr(this.view.root);
				if (e)
					if (o.empty) {
						if (js.gecko) {
							let e =
								((t = a.node),
								(n = a.offset),
								1 != t.nodeType
									? 0
									: (n && "false" == t.childNodes[n - 1].contentEditable
											? 1
											: 0) |
										(n < t.childNodes.length &&
										"false" == t.childNodes[n].contentEditable
											? 2
											: 0));
							if (e && 3 != e) {
								let t = (1 == e ? ms : gs)(a.node, a.offset);
								t && (a = new xs(t.node, t.offset));
							}
						}
						e.collapse(a.node, a.offset),
							null != o.bidiLevel &&
								void 0 !== e.caretBidiLevel &&
								(e.caretBidiLevel = o.bidiLevel);
					} else if (e.extend) {
						e.collapse(a.node, a.offset);
						try {
							e.extend(l.node, l.offset);
						} catch (e) {}
					} else {
						let t = document.createRange();
						o.anchor > o.head && ([a, l] = [l, a]),
							t.setEnd(l.node, l.offset),
							t.setStart(a.node, a.offset),
							e.removeAllRanges(),
							e.addRange(t);
					}
				else;
				var t, n;
				r &&
					this.view.root.activeElement == this.dom &&
					(this.dom.blur(), i && i.focus());
			}),
			this.view.observer.setSelectionRange(a, l)),
			(this.impreciseAnchor = a.precise
				? null
				: new xs(c.anchorNode, c.anchorOffset)),
			(this.impreciseHead = l.precise
				? null
				: new xs(c.focusNode, c.focusOffset));
	}
	suppressWidgetCursorChange(e, t) {
		return (
			this.hasComposition &&
			t.empty &&
			es(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) &&
			this.posFromDOM(e.focusNode, e.focusOffset) == t.head
		);
	}
	enforceCursorAssoc() {
		if (this.hasComposition) return;
		let { view: e } = this,
			t = e.state.selection.main,
			i = Hr(e.root),
			{ anchorNode: n, anchorOffset: r } = e.observer.selectionRange;
		if (!(i && t.empty && t.assoc && i.modify)) return;
		let s = ro.find(this, t.head);
		if (!s) return;
		let o = s.posAtStart;
		if (t.head == o || t.head == o + s.length) return;
		let a = this.coordsAt(t.head, -1),
			l = this.coordsAt(t.head, 1);
		if (!a || !l || a.bottom > l.top) return;
		let h = this.domAtPos(t.head + t.assoc);
		i.collapse(h.node, h.offset),
			i.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"),
			e.observer.readSelectionRange();
		let c = e.observer.selectionRange;
		e.docView.posFromDOM(c.anchorNode, c.anchorOffset) != t.from &&
			i.collapse(n, r);
	}
	moveToLine(e) {
		let t,
			i = this.dom;
		if (e.node != i) return e;
		for (let n = e.offset; !t && n < i.childNodes.length; n++) {
			let e = Ss.get(i.childNodes[n]);
			e instanceof ro && (t = e.domAtPos(0));
		}
		for (let n = e.offset - 1; !t && n >= 0; n--) {
			let e = Ss.get(i.childNodes[n]);
			e instanceof ro && (t = e.domAtPos(e.length));
		}
		return t ? new xs(t.node, t.offset, !0) : e;
	}
	nearest(e) {
		for (let t = e; t; ) {
			let e = Ss.get(t);
			if (e && e.rootView == this) return e;
			t = t.parentNode;
		}
		return null;
	}
	posFromDOM(e, t) {
		let i = this.nearest(e);
		if (!i)
			throw new RangeError(
				"Trying to find position for a DOM position outside of the document",
			);
		return i.localPosFromDOM(e, t) + i.posAtStart;
	}
	domAtPos(e) {
		let { i: t, off: i } = this.childCursor().findPos(e, -1);
		for (; t < this.children.length - 1; ) {
			let e = this.children[t];
			if (i < e.length || e instanceof ro) break;
			t++, (i = 0);
		}
		return this.children[t].domAtPos(i);
	}
	coordsAt(e, t) {
		let i = null,
			n = 0;
		for (let r = this.length, s = this.children.length - 1; s >= 0; s--) {
			let o = this.children[s],
				a = r - o.breakAfter,
				l = a - o.length;
			if (a < e) break;
			if (
				l <= e &&
				(l < e || o.covers(-1)) &&
				(a > e || o.covers(1)) &&
				(!i || (o instanceof ro && !(i instanceof ro && t >= 0)))
			)
				(i = o), (n = l);
			else if (i && l == e && a == e && o instanceof so && Math.abs(t) < 2) {
				if (o.deco.startSide < 0) break;
				s && (i = null);
			}
			r = l;
		}
		return i ? i.coordsAt(e - n, t) : null;
	}
	coordsForChar(e) {
		let { i: t, off: i } = this.childPos(e, 1),
			n = this.children[t];
		if (!(n instanceof ro)) return null;
		for (; n.children.length; ) {
			let { i: e, off: t } = n.childPos(i, 1);
			for (; ; e++) {
				if (e == n.children.length) return null;
				if ((n = n.children[e]).length) break;
			}
			i = t;
		}
		if (!(n instanceof Es)) return null;
		let r = gn(n.text, i);
		if (r == i) return null;
		let s = fs(n.dom, i, r).getClientRects();
		for (let e = 0; e < s.length; e++) {
			let t = s[e];
			if (e == s.length - 1 || (t.top < t.bottom && t.left < t.right)) return t;
		}
		return null;
	}
	measureVisibleLineHeights(e) {
		let t = [],
			{ from: i, to: n } = e,
			r = this.view.contentDOM.clientWidth,
			s = r > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1,
			o = -1,
			a = this.view.textDirection == co.LTR;
		for (let e = 0, l = 0; l < this.children.length; l++) {
			let h = this.children[l],
				c = e + h.length;
			if (c > n) break;
			if (e >= i) {
				let i = h.dom.getBoundingClientRect();
				if ((t.push(i.height), s)) {
					let t = h.dom.lastChild,
						n = t ? Jr(t) : [];
					if (n.length) {
						let t = n[n.length - 1],
							s = a ? t.right - i.left : i.right - t.left;
						s > o &&
							((o = s),
							(this.minWidth = r),
							(this.minWidthFrom = e),
							(this.minWidthTo = c));
					}
				}
			}
			e = c + h.breakAfter;
		}
		return t;
	}
	textDirectionAt(e) {
		let { i: t } = this.childPos(e, 1);
		return "rtl" == getComputedStyle(this.children[t].dom).direction
			? co.RTL
			: co.LTR;
	}
	measureTextSize() {
		for (let e of this.children)
			if (e instanceof ro) {
				let t = e.measureTextSize();
				if (t) return t;
			}
		let e,
			t,
			i,
			n = document.createElement("div");
		return (
			(n.className = "cm-line"),
			(n.style.width = "99999px"),
			(n.style.position = "absolute"),
			(n.textContent = "abc def ghi jkl mno pqr stu"),
			this.view.observer.ignore(() => {
				this.dom.appendChild(n);
				let r = Jr(n.firstChild)[0];
				(e = n.getBoundingClientRect().height),
					(t = r ? r.width / 27 : 7),
					(i = r ? r.height : e),
					n.remove();
			}),
			{ lineHeight: e, charWidth: t, textHeight: i }
		);
	}
	childCursor(e = this.length) {
		let t = this.children.length;
		return t && (e -= this.children[--t].length), new Qs(this.children, e, t);
	}
	computeBlockGapDeco() {
		let e = [],
			t = this.view.viewState;
		for (let i = 0, n = 0; ; n++) {
			let r = n == t.viewports.length ? null : t.viewports[n],
				s = r ? r.from - 1 : this.length;
			if (s > i) {
				let n =
					(t.lineBlockAt(s).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
				e.push(
					Ks.replace({
						widget: new oo(n),
						block: !0,
						inclusive: !0,
						isBlockGap: !0,
					}).range(i, s),
				);
			}
			if (!r) break;
			i = r.to + 1;
		}
		return Ks.set(e);
	}
	updateDeco() {
		let e = 1,
			t = this.view.state
				.facet(Jo)
				.map((t) =>
					(this.dynamicDecorationMap[e++] = "function" == typeof t)
						? t(this.view)
						: t,
				),
			i = !1,
			n = this.view.state.facet(ea).map((e, t) => {
				let n = "function" == typeof e;
				return n && (i = !0), n ? e(this.view) : e;
			});
		for (
			n.length && ((this.dynamicDecorationMap[e++] = i), t.push(vr.join(n))),
				this.decorations = [
					this.editContextFormatting,
					...t,
					this.computeBlockGapDeco(),
					this.view.viewState.lineGapDeco,
				];
			e < this.decorations.length;
		)
			this.dynamicDecorationMap[e++] = !1;
		return this.decorations;
	}
	scrollIntoView(e) {
		if (e.isSnapshot) {
			let t = this.view.viewState.lineBlockAt(e.range.head);
			return (
				(this.view.scrollDOM.scrollTop = t.top - e.yMargin),
				void (this.view.scrollDOM.scrollLeft = e.xMargin)
			);
		}
		for (let t of this.view.state.facet(Wo))
			try {
				if (t(this.view, e.range, e)) return !0;
			} catch (e) {
				Bo(this.view.state, e, "scroll handler");
			}
		let t,
			{ range: i } = e,
			n = this.coordsAt(i.head, i.empty ? i.assoc : i.head > i.anchor ? -1 : 1);
		if (!n) return;
		!i.empty &&
			(t = this.coordsAt(i.anchor, i.anchor > i.head ? -1 : 1)) &&
			(n = {
				left: Math.min(n.left, t.left),
				top: Math.min(n.top, t.top),
				right: Math.max(n.right, t.right),
				bottom: Math.max(n.bottom, t.bottom),
			});
		let r = sa(this.view),
			s = {
				left: n.left - r.left,
				top: n.top - r.top,
				right: n.right + r.right,
				bottom: n.bottom + r.bottom,
			},
			{ offsetWidth: o, offsetHeight: a } = this.view.scrollDOM;
		!(function (e, t, i, n, r, s, o, a) {
			let l = e.ownerDocument,
				h = l.defaultView || window;
			for (let c = e, u = !1; c && !u; )
				if (1 == c.nodeType) {
					let e,
						f = c == l.body,
						O = 1,
						d = 1;
					if (f) e = os(h);
					else {
						if (
							(/^(fixed|sticky)$/.test(getComputedStyle(c).position) &&
								(u = !0),
							c.scrollHeight <= c.clientHeight &&
								c.scrollWidth <= c.clientWidth)
						) {
							c = c.assignedSlot || c.parentNode;
							continue;
						}
						let t = c.getBoundingClientRect();
						({ scaleX: O, scaleY: d } = as(c, t)),
							(e = {
								left: t.left,
								right: t.left + c.clientWidth * O,
								top: t.top,
								bottom: t.top + c.clientHeight * d,
							});
					}
					let p = 0,
						m = 0;
					if ("nearest" == r)
						t.top < e.top
							? ((m = t.top - (e.top + o)),
								i > 0 &&
									t.bottom > e.bottom + m &&
									(m = t.bottom - e.bottom + o))
							: t.bottom > e.bottom &&
								((m = t.bottom - e.bottom + o),
								i < 0 && t.top - m < e.top && (m = t.top - (e.top + o)));
					else {
						let n = t.bottom - t.top,
							s = e.bottom - e.top;
						m =
							("center" == r && n <= s
								? t.top + n / 2 - s / 2
								: "start" == r || ("center" == r && i < 0)
									? t.top - o
									: t.bottom - s + o) - e.top;
					}
					if (
						("nearest" == n
							? t.left < e.left
								? ((p = t.left - (e.left + s)),
									i > 0 && t.right > e.right + p && (p = t.right - e.right + s))
								: t.right > e.right &&
									((p = t.right - e.right + s),
									i < 0 && t.left < e.left + p && (p = t.left - (e.left + s)))
							: (p =
									("center" == n
										? t.left + (t.right - t.left) / 2 - (e.right - e.left) / 2
										: ("start" == n) == a
											? t.left - s
											: t.right - (e.right - e.left) + s) - e.left),
						p || m)
					)
						if (f) h.scrollBy(p, m);
						else {
							let e = 0,
								i = 0;
							if (m) {
								let e = c.scrollTop;
								(c.scrollTop += m / d), (i = (c.scrollTop - e) * d);
							}
							if (p) {
								let t = c.scrollLeft;
								(c.scrollLeft += p / O), (e = (c.scrollLeft - t) * O);
							}
							(t = {
								left: t.left - e,
								top: t.top - i,
								right: t.right - e,
								bottom: t.bottom - i,
							}),
								e && Math.abs(e - p) < 1 && (n = "nearest"),
								i && Math.abs(i - m) < 1 && (r = "nearest");
						}
					if (f) break;
					(t.top < e.top ||
						t.bottom > e.bottom ||
						t.left < e.left ||
						t.right > e.right) &&
						(t = {
							left: Math.max(t.left, e.left),
							right: Math.min(t.right, e.right),
							top: Math.max(t.top, e.top),
							bottom: Math.min(t.bottom, e.bottom),
						}),
						(c = c.assignedSlot || c.parentNode);
				} else {
					if (11 != c.nodeType) break;
					c = c.host;
				}
		})(
			this.view.scrollDOM,
			s,
			i.head < i.anchor ? -1 : 1,
			e.x,
			e.y,
			Math.max(Math.min(e.xMargin, o), -o),
			Math.max(Math.min(e.yMargin, a), -a),
			this.view.textDirection == co.LTR,
		);
	}
}
function ca(e, t) {
	let i = e.observer.selectionRange;
	if (!i.focusNode) return null;
	let n = ms(i.focusNode, i.focusOffset),
		r = gs(i.focusNode, i.focusOffset),
		s = n || r;
	if (r && n && r.node != n.node) {
		let t = Ss.get(r.node);
		if (!t || (t instanceof Es && t.text != r.node.nodeValue)) s = r;
		else if (e.docView.lastCompositionAfterCursor) {
			let e = Ss.get(n.node);
			!e || (e instanceof Es && e.text != n.node.nodeValue) || (s = r);
		}
	}
	if (((e.docView.lastCompositionAfterCursor = s != n), !s)) return null;
	let o = t - s.offset;
	return { from: o, to: o + s.node.nodeValue.length, node: s.node };
}
let ua = class {
	constructor() {
		this.changes = [];
	}
	compareRange(e, t) {
		no(e, t, this.changes);
	}
	comparePoint(e, t) {
		no(e, t, this.changes);
	}
	boundChange(e) {
		no(e, e, this.changes);
	}
};
function fa(e, t) {
	return t.left > e ? t.left - e : Math.max(0, e - t.right);
}
function Oa(e, t) {
	return t.top > e ? t.top - e : Math.max(0, e - t.bottom);
}
function da(e, t) {
	return e.top < t.bottom - 1 && e.bottom > t.top + 1;
}
function pa(e, t) {
	return t < e.top
		? { top: t, left: e.left, right: e.right, bottom: e.bottom }
		: e;
}
function ma(e, t) {
	return t > e.bottom
		? { top: e.top, left: e.left, right: e.right, bottom: t }
		: e;
}
function ga(e, t, i) {
	let n,
		r,
		s,
		o,
		a,
		l,
		h,
		c,
		u = !1;
	for (let f = e.firstChild; f; f = f.nextSibling) {
		let e = Jr(f);
		for (let O = 0; O < e.length; O++) {
			let d = e[O];
			r && da(r, d) && (d = pa(ma(d, r.bottom), r.top));
			let p = fa(t, d),
				m = Oa(i, d);
			if (0 == p && 0 == m) return 3 == f.nodeType ? xa(f, t, i) : ga(f, t, i);
			if (!n || o > m || (o == m && s > p)) {
				(n = f), (r = d), (s = p), (o = m);
				let a = m ? (i < d.top ? -1 : 1) : p ? (t < d.left ? -1 : 1) : 0;
				u = !a || (a > 0 ? O < e.length - 1 : O > 0);
			}
			0 == p
				? i > d.bottom && (!h || h.bottom < d.bottom)
					? ((a = f), (h = d))
					: i < d.top && (!c || c.top > d.top) && ((l = f), (c = d))
				: h && da(h, d)
					? (h = ma(h, d.bottom))
					: c && da(c, d) && (c = pa(c, d.top));
		}
	}
	if (
		(h && h.bottom >= i
			? ((n = a), (r = h))
			: c && c.top <= i && ((n = l), (r = c)),
		!n)
	)
		return { node: e, offset: 0 };
	let f = Math.max(r.left, Math.min(r.right, t));
	return 3 == n.nodeType
		? xa(n, f, i)
		: u && "false" != n.contentEditable
			? ga(n, f, i)
			: {
					node: e,
					offset:
						Array.prototype.indexOf.call(e.childNodes, n) +
						(t >= (r.left + r.right) / 2 ? 1 : 0),
				};
}
function xa(e, t, i) {
	let n = e.nodeValue.length,
		r = -1,
		s = 1e9,
		o = 0;
	for (let a = 0; a < n; a++) {
		let n = fs(e, a, a + 1).getClientRects();
		for (let l = 0; l < n.length; l++) {
			let h = n[l];
			if (h.top == h.bottom) continue;
			o || (o = t - h.left);
			let c = (h.top > i ? h.top - i : i - h.bottom) - 1;
			if (h.left - 1 <= t && h.right + 1 >= t && c < s) {
				let i = t >= (h.left + h.right) / 2,
					n = i;
				if (js.chrome || js.gecko) {
					fs(e, a).getBoundingClientRect().left == h.right && (n = !i);
				}
				if (c <= 0) return { node: e, offset: a + (n ? 1 : 0) };
				(r = a + (n ? 1 : 0)), (s = c);
			}
		}
	}
	return { node: e, offset: r > -1 ? r : o > 0 ? e.nodeValue.length : 0 };
}
function ba(e, t, i, n = -1) {
	var r, s;
	let o,
		a = e.contentDOM.getBoundingClientRect(),
		l = a.top + e.viewState.paddingTop,
		{ docHeight: h } = e.viewState,
		{ x: c, y: u } = t,
		f = u - l;
	if (f < 0) return 0;
	if (f > h) return e.state.doc.length;
	for (
		let t = e.viewState.heightOracle.textHeight / 2, r = !1;
		(o = e.elementAtHeight(f)), o.type != Fs.Text;
	)
		for (; (f = n > 0 ? o.bottom + t : o.top - t), !(f >= 0 && f <= h); ) {
			if (r) return i ? null : 0;
			(r = !0), (n = -n);
		}
	u = l + f;
	let O = o.from;
	if (O < e.viewport.from)
		return 0 == e.viewport.from ? 0 : i ? null : Sa(e, a, o, c, u);
	if (O > e.viewport.to)
		return e.viewport.to == e.state.doc.length
			? e.state.doc.length
			: i
				? null
				: Sa(e, a, o, c, u);
	let d = e.dom.ownerDocument,
		p = e.root.elementFromPoint ? e.root : d,
		m = p.elementFromPoint(c, u);
	m && !e.contentDOM.contains(m) && (m = null),
		m ||
			((c = Math.max(a.left + 1, Math.min(a.right - 1, c))),
			(m = p.elementFromPoint(c, u)),
			m && !e.contentDOM.contains(m) && (m = null));
	let g,
		x = -1;
	if (
		m &&
		0 !=
			(null === (r = e.docView.nearest(m)) || void 0 === r
				? void 0
				: r.isEditable)
	) {
		if (d.caretPositionFromPoint) {
			let e = d.caretPositionFromPoint(c, u);
			e && ({ offsetNode: g, offset: x } = e);
		} else if (d.caretRangeFromPoint) {
			let t = d.caretRangeFromPoint(c, u);
			t &&
				(({ startContainer: g, startOffset: x } = t),
				(!e.contentDOM.contains(g) ||
					(js.safari &&
						(function (e, t, i) {
							let n;
							if (3 != e.nodeType || t != (n = e.nodeValue.length)) return !1;
							for (let t = e.nextSibling; t; t = t.nextSibling)
								if (1 != t.nodeType || "BR" != t.nodeName) return !1;
							return fs(e, n - 1, n).getBoundingClientRect().left > i;
						})(g, x, c)) ||
					(js.chrome &&
						(function (e, t, i) {
							if (0 != t) return !1;
							for (let t = e; ; ) {
								let e = t.parentNode;
								if (!e || 1 != e.nodeType || e.firstChild != t) return !1;
								if (e.classList.contains("cm-line")) break;
								t = e;
							}
							let n =
								1 == e.nodeType
									? e.getBoundingClientRect()
									: fs(
											e,
											0,
											Math.max(e.nodeValue.length, 1),
										).getBoundingClientRect();
							return i - n.left > 5;
						})(g, x, c))) &&
					(g = void 0));
		}
		g && (x = Math.min(rs(g), x));
	}
	if (!g || !e.docView.dom.contains(g)) {
		let t = ro.find(e.docView, O);
		if (!t) return f > o.top + o.height / 2 ? o.to : o.from;
		({ node: g, offset: x } = ga(t.dom, c, u));
	}
	let b = e.docView.nearest(g);
	if (!b) return null;
	if (
		b.isWidget &&
		1 == (null === (s = b.dom) || void 0 === s ? void 0 : s.nodeType)
	) {
		let e = b.dom.getBoundingClientRect();
		return t.y < e.top || (t.y <= e.bottom && t.x <= (e.left + e.right) / 2)
			? b.posAtStart
			: b.posAtEnd;
	}
	return b.localPosFromDOM(g, x) + b.posAtStart;
}
function Sa(e, t, i, n, r) {
	let s = Math.round((n - t.left) * e.defaultCharacterWidth);
	if (e.lineWrapping && i.height > 1.5 * e.defaultLineHeight) {
		let t = e.viewState.heightOracle.textHeight;
		s +=
			Math.floor((r - i.top - 0.5 * (e.defaultLineHeight - t)) / t) *
			e.viewState.heightOracle.lineLength;
	}
	let o = e.state.sliceDoc(i.from, i.to);
	return (
		i.from +
		(function (e, t, i) {
			for (let n = 0, r = 0; ; ) {
				if (r >= t) return n;
				if (n == e.length) break;
				(r += 9 == e.charCodeAt(n) ? i - (r % i) : 1), (n = gn(e, n));
			}
			return e.length;
		})(o, s, e.state.tabSize)
	);
}
function ya(e, t, i, n) {
	let r = (function (e, t) {
			let i = e.lineBlockAt(t);
			if (Array.isArray(i.type))
				for (let e of i.type)
					if (e.to > t || (e.to == t && (e.to == i.to || e.type == Fs.Text)))
						return e;
			return i;
		})(e, t.head),
		s =
			n && r.type == Fs.Text && (e.lineWrapping || r.widgetLineBreaks)
				? e.coordsAtPos(t.assoc < 0 && t.head > r.from ? t.head - 1 : t.head)
				: null;
	if (s) {
		let t = e.dom.getBoundingClientRect(),
			n = e.textDirectionAt(r.from),
			o = e.posAtCoords({
				x: i == (n == co.LTR) ? t.right - 1 : t.left + 1,
				y: (s.top + s.bottom) / 2,
			});
		if (null != o) return _n.cursor(o, i ? -1 : 1);
	}
	return _n.cursor(i ? r.to : r.from, i ? -1 : 1);
}
function Qa(e, t, i, n) {
	let r = e.state.doc.lineAt(t.head),
		s = e.bidiSpans(r),
		o = e.textDirectionAt(r.from);
	for (let a = t, l = null; ; ) {
		let t = Zo(r, s, o, a, i),
			h = Po;
		if (!t) {
			if (r.number == (i ? e.state.doc.lines : 1)) return a;
			(h = "\n"),
				(r = e.state.doc.line(r.number + (i ? 1 : -1))),
				(s = e.bidiSpans(r)),
				(t = e.visualLineSide(r, !i));
		}
		if (l) {
			if (!l(h)) return a;
		} else {
			if (!n) return t;
			l = n(h);
		}
		a = t;
	}
}
function wa(e, t, i) {
	for (;;) {
		let n = 0;
		for (let r of e)
			r.between(t - 1, t + 1, (e, r, s) => {
				if (t > e && t < r) {
					let s = n || i || (t - e < r - t ? -1 : 1);
					(t = s < 0 ? e : r), (n = s);
				}
			});
		if (!n) return t;
	}
}
function ka(e, t, i) {
	let n = wa(
		e.state.facet(ta).map((t) => t(e)),
		i.from,
		t.head > i.from ? -1 : 1,
	);
	return n == i.from ? i : _n.cursor(n, n < i.from ? 1 : -1);
}
const va = "￿";
class $a {
	constructor(e, t) {
		(this.points = e),
			(this.text = ""),
			(this.lineSeparator = t.facet(Sr.lineSeparator));
	}
	append(e) {
		this.text += e;
	}
	lineBreak() {
		this.text += va;
	}
	readRange(e, t) {
		if (!e) return this;
		let i = e.parentNode;
		for (let n = e; ; ) {
			this.findPointBefore(i, n);
			let e = this.text.length;
			this.readNode(n);
			let r = n.nextSibling;
			if (r == t) break;
			let s = Ss.get(n),
				o = Ss.get(r);
			(s && o
				? s.breakAfter
				: (s ? s.breakAfter : is(n)) ||
					(is(r) &&
						("BR" != n.nodeName || n.cmIgnore) &&
						this.text.length > e)) && this.lineBreak(),
				(n = r);
		}
		return this.findPointBefore(i, t), this;
	}
	readTextNode(e) {
		let t = e.nodeValue;
		for (let i of this.points)
			i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
		for (let i = 0, n = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
			let r,
				s = -1,
				o = 1;
			if (
				(this.lineSeparator
					? ((s = t.indexOf(this.lineSeparator, i)),
						(o = this.lineSeparator.length))
					: (r = n.exec(t)) && ((s = r.index), (o = r[0].length)),
				this.append(t.slice(i, s < 0 ? t.length : s)),
				s < 0)
			)
				break;
			if ((this.lineBreak(), o > 1))
				for (let t of this.points)
					t.node == e && t.pos > this.text.length && (t.pos -= o - 1);
			i = s + o;
		}
	}
	readNode(e) {
		if (e.cmIgnore) return;
		let t = Ss.get(e),
			i = t && t.overrideDOMText;
		if (null != i) {
			this.findPointInside(e, i.length);
			for (let e = i.iter(); !e.next().done; )
				e.lineBreak ? this.lineBreak() : this.append(e.value);
		} else
			3 == e.nodeType
				? this.readTextNode(e)
				: "BR" == e.nodeName
					? e.nextSibling && this.lineBreak()
					: 1 == e.nodeType && this.readRange(e.firstChild, null);
	}
	findPointBefore(e, t) {
		for (let i of this.points)
			i.node == e && e.childNodes[i.offset] == t && (i.pos = this.text.length);
	}
	findPointInside(e, t) {
		for (let i of this.points)
			(3 == e.nodeType ? i.node == e : e.contains(i.node)) &&
				(i.pos = this.text.length + (Pa(e, i.node, i.offset) ? t : 0));
	}
}
function Pa(e, t, i) {
	for (;;) {
		if (!t || i < rs(t)) return !1;
		if (t == e) return !0;
		(i = ts(t) + 1), (t = t.parentNode);
	}
}
class Za {
	constructor(e, t) {
		(this.node = e), (this.offset = t), (this.pos = -1);
	}
}
class _a {
	constructor(e, t, i, n) {
		(this.typeOver = n),
			(this.bounds = null),
			(this.text = ""),
			(this.domChanged = t > -1);
		let { impreciseHead: r, impreciseAnchor: s } = e.docView;
		if (e.state.readOnly && t > -1) this.newSel = null;
		else if (t > -1 && (this.bounds = e.docView.domBoundsAround(t, i, 0))) {
			let t =
					r || s
						? []
						: (function (e) {
								let t = [];
								if (e.root.activeElement != e.contentDOM) return t;
								let {
									anchorNode: i,
									anchorOffset: n,
									focusNode: r,
									focusOffset: s,
								} = e.observer.selectionRange;
								i &&
									(t.push(new Za(i, n)),
									(r == i && s == n) || t.push(new Za(r, s)));
								return t;
							})(e),
				i = new $a(t, e.state);
			i.readRange(this.bounds.startDOM, this.bounds.endDOM),
				(this.text = i.text),
				(this.newSel = (function (e, t) {
					if (0 == e.length) return null;
					let i = e[0].pos,
						n = 2 == e.length ? e[1].pos : i;
					return i > -1 && n > -1 ? _n.single(i + t, n + t) : null;
				})(t, this.bounds.from));
		} else {
			let t = e.observer.selectionRange,
				i =
					(r && r.node == t.focusNode && r.offset == t.focusOffset) ||
					!Fr(e.contentDOM, t.focusNode)
						? e.state.selection.main.head
						: e.docView.posFromDOM(t.focusNode, t.focusOffset),
				n =
					(s && s.node == t.anchorNode && s.offset == t.anchorOffset) ||
					!Fr(e.contentDOM, t.anchorNode)
						? e.state.selection.main.anchor
						: e.docView.posFromDOM(t.anchorNode, t.anchorOffset),
				o = e.viewport;
			if (
				(js.ios || js.chrome) &&
				e.state.selection.main.empty &&
				i != n &&
				(o.from > 0 || o.to < e.state.doc.length)
			) {
				let t = Math.min(i, n),
					r = Math.max(i, n),
					s = o.from - t,
					a = o.to - r;
				(0 != s && 1 != s && 0 != t) ||
					(0 != a && -1 != a && r != e.state.doc.length) ||
					((i = 0), (n = e.state.doc.length));
			}
			this.newSel = _n.single(n, i);
		}
	}
}
function Ta(e, t) {
	let i,
		{ newSel: n } = t,
		r = e.state.selection.main,
		s =
			e.inputState.lastKeyTime > Date.now() - 100
				? e.inputState.lastKeyCode
				: -1;
	if (t.bounds) {
		let { from: n, to: o } = t.bounds,
			a = r.from,
			l = null;
		(8 === s || (js.android && t.text.length < o - n)) &&
			((a = r.to), (l = "end"));
		let h = (function (e, t, i, n) {
			let r = Math.min(e.length, t.length),
				s = 0;
			for (; s < r && e.charCodeAt(s) == t.charCodeAt(s); ) s++;
			if (s == r && e.length == t.length) return null;
			let o = e.length,
				a = t.length;
			for (; o > 0 && a > 0 && e.charCodeAt(o - 1) == t.charCodeAt(a - 1); )
				o--, a--;
			if ("end" == n) {
				i -= o + Math.max(0, s - Math.min(o, a)) - s;
			}
			if (o < s && e.length < t.length) {
				(s -= i <= s && i >= o ? s - i : 0), (a = s + (a - o)), (o = s);
			} else if (a < s) {
				(s -= i <= s && i >= a ? s - i : 0), (o = s + (o - a)), (a = s);
			}
			return { from: s, toA: o, toB: a };
		})(e.state.doc.sliceString(n, o, va), t.text, a - n, l);
		h &&
			(js.chrome &&
				13 == s &&
				h.toB == h.from + 2 &&
				t.text.slice(h.from, h.toB) == va + va &&
				h.toB--,
			(i = {
				from: n + h.from,
				to: n + h.toA,
				insert: an.of(t.text.slice(h.from, h.toB).split(va)),
			}));
	} else
		n && ((!e.hasFocus && e.state.facet(Io)) || n.main.eq(r)) && (n = null);
	if (!i && !n) return !1;
	if (
		(!i && t.typeOver && !r.empty && n && n.main.empty
			? (i = {
					from: r.from,
					to: r.to,
					insert: e.state.doc.slice(r.from, r.to),
				})
			: (js.mac || js.android) &&
					i &&
					i.from == i.to &&
					i.from == r.head - 1 &&
					/^\. ?$/.test(i.insert.toString()) &&
					"off" == e.contentDOM.getAttribute("autocorrect")
				? (n &&
						2 == i.insert.length &&
						(n = _n.single(n.main.anchor - 1, n.main.head - 1)),
					(i = {
						from: i.from,
						to: i.to,
						insert: an.of([i.insert.toString().replace(".", " ")]),
					}))
				: i &&
						i.from >= r.from &&
						i.to <= r.to &&
						(i.from != r.from || i.to != r.to) &&
						r.to - r.from - (i.to - i.from) <= 4
					? (i = {
							from: r.from,
							to: r.to,
							insert: e.state.doc
								.slice(r.from, i.from)
								.append(i.insert)
								.append(e.state.doc.slice(i.to, r.to)),
						})
					: js.chrome &&
						i &&
						i.from == i.to &&
						i.from == r.head &&
						"\n " == i.insert.toString() &&
						e.lineWrapping &&
						(n && (n = _n.single(n.main.anchor - 1, n.main.head - 1)),
						(i = { from: r.from, to: r.to, insert: an.of([" "]) })),
		i)
	)
		return Xa(e, i, n, s);
	if (n && !n.main.eq(r)) {
		let t = !1,
			i = "select";
		return (
			e.inputState.lastSelectionTime > Date.now() - 50 &&
				("select" == e.inputState.lastSelectionOrigin && (t = !0),
				(i = e.inputState.lastSelectionOrigin)),
			e.dispatch({ selection: n, scrollIntoView: t, userEvent: i }),
			!0
		);
	}
	return !1;
}
function Xa(e, t, i, n = -1) {
	if (js.ios && e.inputState.flushIOSKey(t)) return !0;
	let r = e.state.selection.main;
	if (
		js.android &&
		((t.to == r.to &&
			(t.from == r.from ||
				(t.from == r.from - 1 && " " == e.state.sliceDoc(t.from, r.from))) &&
			1 == t.insert.length &&
			2 == t.insert.lines &&
			Os(e.contentDOM, "Enter", 13)) ||
			(((t.from == r.from - 1 && t.to == r.to && 0 == t.insert.length) ||
				(8 == n && t.insert.length < t.to - t.from && t.to > r.head)) &&
				Os(e.contentDOM, "Backspace", 8)) ||
			(t.from == r.from &&
				t.to == r.to + 1 &&
				0 == t.insert.length &&
				Os(e.contentDOM, "Delete", 46)))
	)
		return !0;
	let s,
		o = t.insert.toString();
	e.inputState.composing >= 0 && e.inputState.composing++;
	let a = () =>
		s ||
		(s = (function (e, t, i) {
			let n,
				r = e.state,
				s = r.selection.main;
			if (
				t.from >= s.from &&
				t.to <= s.to &&
				t.to - t.from >= (s.to - s.from) / 3 &&
				(!i || (i.main.empty && i.main.from == t.from + t.insert.length)) &&
				e.inputState.composing < 0
			) {
				let i = s.from < t.from ? r.sliceDoc(s.from, t.from) : "",
					o = s.to > t.to ? r.sliceDoc(t.to, s.to) : "";
				n = r.replaceSelection(
					e.state.toText(
						i + t.insert.sliceString(0, void 0, e.state.lineBreak) + o,
					),
				);
			} else {
				let o = r.changes(t),
					a = i && i.main.to <= o.newLength ? i.main : void 0;
				if (
					r.selection.ranges.length > 1 &&
					e.inputState.composing >= 0 &&
					t.to <= s.to &&
					t.to >= s.to - 10
				) {
					let l,
						h = e.state.sliceDoc(t.from, t.to),
						c = i && ca(e, i.main.head);
					if (c) {
						let e = t.insert.length - (t.to - t.from);
						l = { from: c.from, to: c.to - e };
					} else l = e.state.doc.lineAt(s.head);
					let u = s.to - t.to,
						f = s.to - s.from;
					n = r.changeByRange((i) => {
						if (i.from == s.from && i.to == s.to)
							return { changes: o, range: a || i.map(o) };
						let n = i.to - u,
							c = n - h.length;
						if (
							i.to - i.from != f ||
							e.state.sliceDoc(c, n) != h ||
							(i.to >= l.from && i.from <= l.to)
						)
							return { range: i };
						let O = r.changes({ from: c, to: n, insert: t.insert }),
							d = i.to - s.to;
						return {
							changes: O,
							range: a
								? _n.range(Math.max(0, a.anchor + d), Math.max(0, a.head + d))
								: i.map(O),
						};
					});
				} else n = { changes: o, selection: a && r.selection.replaceRange(a) };
			}
			let o = "input.type";
			(e.composing ||
				(e.inputState.compositionPendingChange &&
					e.inputState.compositionEndedAt > Date.now() - 50)) &&
				((e.inputState.compositionPendingChange = !1),
				(o += ".compose"),
				e.inputState.compositionFirstChange &&
					((o += ".start"), (e.inputState.compositionFirstChange = !1)));
			return r.update(n, { userEvent: o, scrollIntoView: !0 });
		})(e, t, i));
	return (
		e.state.facet(Mo).some((i) => i(e, t.from, t.to, o, a)) || e.dispatch(a()),
		!0
	);
}
class Aa {
	setSelectionOrigin(e) {
		(this.lastSelectionOrigin = e), (this.lastSelectionTime = Date.now());
	}
	constructor(e) {
		(this.view = e),
			(this.lastKeyCode = 0),
			(this.lastKeyTime = 0),
			(this.lastTouchTime = 0),
			(this.lastFocusTime = 0),
			(this.lastScrollTop = 0),
			(this.lastScrollLeft = 0),
			(this.pendingIOSKey = void 0),
			(this.tabFocusMode = -1),
			(this.lastSelectionOrigin = null),
			(this.lastSelectionTime = 0),
			(this.lastContextMenu = 0),
			(this.scrollHandlers = []),
			(this.handlers = Object.create(null)),
			(this.composing = -1),
			(this.compositionFirstChange = null),
			(this.compositionEndedAt = 0),
			(this.compositionPendingKey = !1),
			(this.compositionPendingChange = !1),
			(this.mouseSelection = null),
			(this.draggedContent = null),
			(this.handleEvent = this.handleEvent.bind(this)),
			(this.notifiedFocused = e.hasFocus),
			js.safari && e.contentDOM.addEventListener("input", () => null),
			js.gecko &&
				(function (e) {
					sl.has(e) ||
						(sl.add(e),
						e.addEventListener("copy", () => {}),
						e.addEventListener("cut", () => {}));
				})(e.contentDOM.ownerDocument);
	}
	handleEvent(e) {
		(function (e, t) {
			if (!t.bubbles) return !0;
			if (t.defaultPrevented) return !1;
			for (let i, n = t.target; n != e.contentDOM; n = n.parentNode)
				if (!n || 11 == n.nodeType || ((i = Ss.get(n)) && i.ignoreEvent(t)))
					return !1;
			return !0;
		})(this.view, e) &&
			!this.ignoreDuringComposition(e) &&
			(("keydown" == e.type && this.keydown(e)) ||
				(0 != this.view.updateState
					? Promise.resolve().then(() => this.runHandlers(e.type, e))
					: this.runHandlers(e.type, e)));
	}
	runHandlers(e, t) {
		let i = this.handlers[e];
		if (i) {
			for (let e of i.observers) e(this.view, t);
			for (let e of i.handlers) {
				if (t.defaultPrevented) break;
				if (e(this.view, t)) {
					t.preventDefault();
					break;
				}
			}
		}
	}
	ensureHandlers(e) {
		let t = Ra(e),
			i = this.handlers,
			n = this.view.contentDOM;
		for (let e in t)
			if ("scroll" != e) {
				let r = !t[e].handlers.length,
					s = i[e];
				s &&
					r != !s.handlers.length &&
					(n.removeEventListener(e, this.handleEvent), (s = null)),
					s || n.addEventListener(e, this.handleEvent, { passive: r });
			}
		for (let e in i)
			"scroll" == e || t[e] || n.removeEventListener(e, this.handleEvent);
		this.handlers = t;
	}
	keydown(e) {
		if (
			((this.lastKeyCode = e.keyCode),
			(this.lastKeyTime = Date.now()),
			9 == e.keyCode &&
				this.tabFocusMode > -1 &&
				(!this.tabFocusMode || Date.now() <= this.tabFocusMode))
		)
			return !0;
		if (
			(this.tabFocusMode > 0 &&
				27 != e.keyCode &&
				Ea.indexOf(e.keyCode) < 0 &&
				(this.tabFocusMode = -1),
			js.android &&
				js.chrome &&
				!e.synthetic &&
				(13 == e.keyCode || 8 == e.keyCode))
		)
			return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
		let t;
		return !js.ios ||
			e.synthetic ||
			e.altKey ||
			e.metaKey ||
			!(
				((t = Ma.find((t) => t.keyCode == e.keyCode)) && !e.ctrlKey) ||
				(ja.indexOf(e.key) > -1 && e.ctrlKey && !e.shiftKey)
			)
			? (229 != e.keyCode && this.view.observer.forceFlush(), !1)
			: ((this.pendingIOSKey = t || e),
				setTimeout(() => this.flushIOSKey(), 250),
				!0);
	}
	flushIOSKey(e) {
		let t = this.pendingIOSKey;
		return (
			!!t &&
			!(
				"Enter" == t.key &&
				e &&
				e.from < e.to &&
				/^\S+$/.test(e.insert.toString())
			) &&
			((this.pendingIOSKey = void 0),
			Os(
				this.view.contentDOM,
				t.key,
				t.keyCode,
				t instanceof KeyboardEvent ? t : void 0,
			))
		);
	}
	ignoreDuringComposition(e) {
		return (
			!!/^key/.test(e.type) &&
			(this.composing > 0 ||
				(!!(
					js.safari &&
					!js.ios &&
					this.compositionPendingKey &&
					Date.now() - this.compositionEndedAt < 100
				) &&
					((this.compositionPendingKey = !1), !0)))
		);
	}
	startMouseSelection(e) {
		this.mouseSelection && this.mouseSelection.destroy(),
			(this.mouseSelection = e);
	}
	update(e) {
		this.view.observer.update(e),
			this.mouseSelection && this.mouseSelection.update(e),
			this.draggedContent &&
				e.docChanged &&
				(this.draggedContent = this.draggedContent.map(e.changes)),
			e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
	}
	destroy() {
		this.mouseSelection && this.mouseSelection.destroy();
	}
}
function Ca(e, t) {
	return (i, n) => {
		try {
			return t.call(e, n, i);
		} catch (e) {
			Bo(i.state, e);
		}
	};
}
function Ra(e) {
	let t = Object.create(null);
	function i(e) {
		return t[e] || (t[e] = { observers: [], handlers: [] });
	}
	for (let t of e) {
		let e = t.spec;
		if (e && e.domEventHandlers)
			for (let n in e.domEventHandlers) {
				let r = e.domEventHandlers[n];
				r && i(n).handlers.push(Ca(t.value, r));
			}
		if (e && e.domEventObservers)
			for (let n in e.domEventObservers) {
				let r = e.domEventObservers[n];
				r && i(n).observers.push(Ca(t.value, r));
			}
	}
	for (let e in La) i(e).handlers.push(La[e]);
	for (let e in Wa) i(e).observers.push(Wa[e]);
	return t;
}
const Ma = [
		{ key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
		{ key: "Enter", keyCode: 13, inputType: "insertParagraph" },
		{ key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
		{ key: "Delete", keyCode: 46, inputType: "deleteContentForward" },
	],
	ja = "dthko",
	Ea = [16, 17, 18, 20, 91, 92, 224, 225];
function qa(e) {
	return 0.7 * Math.max(0, e) + 8;
}
class Va {
	constructor(e, t, i, n) {
		(this.view = e),
			(this.startEvent = t),
			(this.style = i),
			(this.mustSelect = n),
			(this.scrollSpeed = { x: 0, y: 0 }),
			(this.scrolling = -1),
			(this.lastEvent = t),
			(this.scrollParents = (function (e) {
				let t,
					i,
					n = e.ownerDocument;
				for (let r = e.parentNode; r && !(r == n.body || (t && i)); )
					if (1 == r.nodeType)
						!i && r.scrollHeight > r.clientHeight && (i = r),
							!t && r.scrollWidth > r.clientWidth && (t = r),
							(r = r.assignedSlot || r.parentNode);
					else {
						if (11 != r.nodeType) break;
						r = r.host;
					}
				return { x: t, y: i };
			})(e.contentDOM)),
			(this.atoms = e.state.facet(ta).map((t) => t(e)));
		let r = e.contentDOM.ownerDocument;
		r.addEventListener("mousemove", (this.move = this.move.bind(this))),
			r.addEventListener("mouseup", (this.up = this.up.bind(this))),
			(this.extend = t.shiftKey),
			(this.multiple =
				e.state.facet(Sr.allowMultipleSelections) &&
				(function (e, t) {
					let i = e.state.facet(To);
					return i.length ? i[0](t) : js.mac ? t.metaKey : t.ctrlKey;
				})(e, t)),
			(this.dragging =
				!(
					!(function (e, t) {
						let { main: i } = e.state.selection;
						if (i.empty) return !1;
						let n = Hr(e.root);
						if (!n || 0 == n.rangeCount) return !0;
						let r = n.getRangeAt(0).getClientRects();
						for (let e = 0; e < r.length; e++) {
							let i = r[e];
							if (
								i.left <= t.clientX &&
								i.right >= t.clientX &&
								i.top <= t.clientY &&
								i.bottom >= t.clientY
							)
								return !0;
						}
						return !1;
					})(e, t) || 1 != Ja(t)
				) && null);
	}
	start(e) {
		!1 === this.dragging && this.select(e);
	}
	move(e) {
		if (0 == e.buttons) return this.destroy();
		if (
			this.dragging ||
			(null == this.dragging &&
				((t = this.startEvent),
				(i = e),
				Math.max(
					Math.abs(t.clientX - i.clientX),
					Math.abs(t.clientY - i.clientY),
				) < 10))
		)
			return;
		var t, i;
		this.select((this.lastEvent = e));
		let n = 0,
			r = 0,
			s = 0,
			o = 0,
			a = this.view.win.innerWidth,
			l = this.view.win.innerHeight;
		this.scrollParents.x &&
			({ left: s, right: a } = this.scrollParents.x.getBoundingClientRect()),
			this.scrollParents.y &&
				({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
		let h = sa(this.view);
		e.clientX - h.left <= s + 6
			? (n = -qa(s - e.clientX))
			: e.clientX + h.right >= a - 6 && (n = qa(e.clientX - a)),
			e.clientY - h.top <= o + 6
				? (r = -qa(o - e.clientY))
				: e.clientY + h.bottom >= l - 6 && (r = qa(e.clientY - l)),
			this.setScrollSpeed(n, r);
	}
	up(e) {
		null == this.dragging && this.select(this.lastEvent),
			this.dragging || e.preventDefault(),
			this.destroy();
	}
	destroy() {
		this.setScrollSpeed(0, 0);
		let e = this.view.contentDOM.ownerDocument;
		e.removeEventListener("mousemove", this.move),
			e.removeEventListener("mouseup", this.up),
			(this.view.inputState.mouseSelection =
				this.view.inputState.draggedContent =
					null);
	}
	setScrollSpeed(e, t) {
		(this.scrollSpeed = { x: e, y: t }),
			e || t
				? this.scrolling < 0 &&
					(this.scrolling = setInterval(() => this.scroll(), 50))
				: this.scrolling > -1 &&
					(clearInterval(this.scrolling), (this.scrolling = -1));
	}
	scroll() {
		let { x: e, y: t } = this.scrollSpeed;
		e &&
			this.scrollParents.x &&
			((this.scrollParents.x.scrollLeft += e), (e = 0)),
			t &&
				this.scrollParents.y &&
				((this.scrollParents.y.scrollTop += t), (t = 0)),
			(e || t) && this.view.win.scrollBy(e, t),
			!1 === this.dragging && this.select(this.lastEvent);
	}
	skipAtoms(e) {
		let t = null;
		for (let i = 0; i < e.ranges.length; i++) {
			let n = e.ranges[i],
				r = null;
			if (n.empty) {
				let e = wa(this.atoms, n.from, 0);
				e != n.from && (r = _n.cursor(e, -1));
			} else {
				let e = wa(this.atoms, n.from, -1),
					t = wa(this.atoms, n.to, 1);
				(e == n.from && t == n.to) ||
					(r = _n.range(n.from == n.anchor ? e : t, n.from == n.head ? e : t));
			}
			r && (t || (t = e.ranges.slice()), (t[i] = r));
		}
		return t ? _n.create(t, e.mainIndex) : e;
	}
	select(e) {
		let { view: t } = this,
			i = this.skipAtoms(this.style.get(e, this.extend, this.multiple));
		(!this.mustSelect && i.eq(t.state.selection, !1 === this.dragging)) ||
			this.view.dispatch({ selection: i, userEvent: "select.pointer" }),
			(this.mustSelect = !1);
	}
	update(e) {
		e.transactions.some((e) => e.isUserEvent("input.type"))
			? this.destroy()
			: this.style.update(e) &&
				setTimeout(() => this.select(this.lastEvent), 20);
	}
}
const La = Object.create(null),
	Wa = Object.create(null),
	za = (js.ie && js.ie_version < 15) || (js.ios && js.webkit_version < 604);
function Ya(e, t, i) {
	for (let n of e.facet(t)) i = n(i, e);
	return i;
}
function Da(e, t) {
	t = Ya(e.state, Eo, t);
	let i,
		{ state: n } = e,
		r = 1,
		s = n.toText(t),
		o = s.lines == n.selection.ranges.length;
	if (
		null != tl &&
		n.selection.ranges.every((e) => e.empty) &&
		tl == s.toString()
	) {
		let e = -1;
		i = n.changeByRange((i) => {
			let a = n.doc.lineAt(i.from);
			if (a.from == e) return { range: i };
			e = a.from;
			let l = n.toText((o ? s.line(r++).text : t) + n.lineBreak);
			return {
				changes: { from: a.from, insert: l },
				range: _n.cursor(i.from + l.length),
			};
		});
	} else
		i = o
			? n.changeByRange((e) => {
					let t = s.line(r++);
					return {
						changes: { from: e.from, to: e.to, insert: t.text },
						range: _n.cursor(e.from + t.length),
					};
				})
			: n.replaceSelection(s);
	e.dispatch(i, { userEvent: "input.paste", scrollIntoView: !0 });
}
function Ba(e, t, i, n) {
	if (1 == n) return _n.cursor(t, i);
	if (2 == n)
		return (function (e, t, i = 1) {
			let n = e.charCategorizer(t),
				r = e.doc.lineAt(t),
				s = t - r.from;
			if (0 == r.length) return _n.cursor(t);
			0 == s ? (i = 1) : s == r.length && (i = -1);
			let o = s,
				a = s;
			i < 0 ? (o = gn(r.text, s, !1)) : (a = gn(r.text, s));
			let l = n(r.text.slice(o, a));
			for (; o > 0; ) {
				let e = gn(r.text, o, !1);
				if (n(r.text.slice(e, o)) != l) break;
				o = e;
			}
			for (; a < r.length; ) {
				let e = gn(r.text, a);
				if (n(r.text.slice(a, e)) != l) break;
				a = e;
			}
			return _n.range(o + r.from, a + r.from);
		})(e.state, t, i);
	{
		let i = ro.find(e.docView, t),
			n = e.state.doc.lineAt(i ? i.posAtEnd : t),
			r = i ? i.posAtStart : n.from,
			s = i ? i.posAtEnd : n.to;
		return s < e.state.doc.length && s == n.to && s++, _n.range(r, s);
	}
}
(Wa.scroll = (e) => {
	(e.inputState.lastScrollTop = e.scrollDOM.scrollTop),
		(e.inputState.lastScrollLeft = e.scrollDOM.scrollLeft);
}),
	(La.keydown = (e, t) => (
		e.inputState.setSelectionOrigin("select"),
		27 == t.keyCode &&
			0 != e.inputState.tabFocusMode &&
			(e.inputState.tabFocusMode = Date.now() + 2e3),
		!1
	)),
	(Wa.touchstart = (e, t) => {
		(e.inputState.lastTouchTime = Date.now()),
			e.inputState.setSelectionOrigin("select.pointer");
	}),
	(Wa.touchmove = (e) => {
		e.inputState.setSelectionOrigin("select.pointer");
	}),
	(La.mousedown = (e, t) => {
		if ((e.observer.flush(), e.inputState.lastTouchTime > Date.now() - 2e3))
			return !1;
		let i = null;
		for (let n of e.state.facet(Ao)) if (((i = n(e, t)), i)) break;
		if (
			(i ||
				0 != t.button ||
				(i = (function (e, t) {
					let i = Ga(e, t),
						n = Ja(t),
						r = e.state.selection;
					return {
						update(e) {
							e.docChanged &&
								((i.pos = e.changes.mapPos(i.pos)), (r = r.map(e.changes)));
						},
						get(t, s, o) {
							let a,
								l = Ga(e, t),
								h = Ba(e, l.pos, l.bias, n);
							if (i.pos != l.pos && !s) {
								let t = Ba(e, i.pos, i.bias, n),
									r = Math.min(t.from, h.from),
									s = Math.max(t.to, h.to);
								h = r < h.from ? _n.range(r, s) : _n.range(s, r);
							}
							return s
								? r.replaceRange(r.main.extend(h.from, h.to))
								: o &&
										1 == n &&
										r.ranges.length > 1 &&
										(a = (function (e, t) {
											for (let i = 0; i < e.ranges.length; i++) {
												let { from: n, to: r } = e.ranges[i];
												if (n <= t && r >= t)
													return _n.create(
														e.ranges.slice(0, i).concat(e.ranges.slice(i + 1)),
														e.mainIndex == i
															? 0
															: e.mainIndex - (e.mainIndex > i ? 1 : 0),
													);
											}
											return null;
										})(r, l.pos))
									? a
									: o
										? r.addRange(h)
										: _n.create([h]);
						},
					};
				})(e, t)),
			i)
		) {
			let n = !e.hasFocus;
			e.inputState.startMouseSelection(new Va(e, t, i, n)),
				n &&
					e.observer.ignore(() => {
						us(e.contentDOM);
						let t = e.root.activeElement;
						t && !t.contains(e.contentDOM) && t.blur();
					});
			let r = e.inputState.mouseSelection;
			if (r) return r.start(t), !1 === r.dragging;
		}
		return !1;
	});
let Ia = (e, t, i) =>
	t >= i.top && t <= i.bottom && e >= i.left && e <= i.right;
function Ua(e, t, i, n) {
	let r = ro.find(e.docView, t);
	if (!r) return 1;
	let s = t - r.posAtStart;
	if (0 == s) return 1;
	if (s == r.length) return -1;
	let o = r.coordsAt(s, -1);
	if (o && Ia(i, n, o)) return -1;
	let a = r.coordsAt(s, 1);
	return a && Ia(i, n, a) ? 1 : o && o.bottom >= n ? -1 : 1;
}
function Ga(e, t) {
	let i = e.posAtCoords({ x: t.clientX, y: t.clientY }, !1);
	return { pos: i, bias: Ua(e, i, t.clientX, t.clientY) };
}
const Na = js.ie && js.ie_version <= 11;
let Ha = null,
	Fa = 0,
	Ka = 0;
function Ja(e) {
	if (!Na) return e.detail;
	let t = Ha,
		i = Ka;
	return (
		(Ha = e),
		(Ka = Date.now()),
		(Fa =
			!t ||
			(i > Date.now() - 400 &&
				Math.abs(t.clientX - e.clientX) < 2 &&
				Math.abs(t.clientY - e.clientY) < 2)
				? (Fa + 1) % 3
				: 1)
	);
}
function el(e, t, i, n) {
	if (!(i = Ya(e.state, Eo, i))) return;
	let r = e.posAtCoords({ x: t.clientX, y: t.clientY }, !1),
		{ draggedContent: s } = e.inputState,
		o =
			n &&
			s &&
			(function (e, t) {
				let i = e.state.facet(Xo);
				return i.length ? i[0](t) : js.mac ? !t.altKey : !t.ctrlKey;
			})(e, t)
				? { from: s.from, to: s.to }
				: null,
		a = { from: r, insert: i },
		l = e.state.changes(o ? [o, a] : a);
	e.focus(),
		e.dispatch({
			changes: l,
			selection: { anchor: l.mapPos(r, -1), head: l.mapPos(r, 1) },
			userEvent: o ? "move.drop" : "input.drop",
		}),
		(e.inputState.draggedContent = null);
}
(La.dragstart = (e, t) => {
	let {
		selection: { main: i },
	} = e.state;
	if (t.target.draggable) {
		let n = e.docView.nearest(t.target);
		if (n && n.isWidget) {
			let e = n.posAtStart,
				t = e + n.length;
			(e >= i.to || t <= i.from) && (i = _n.range(e, t));
		}
	}
	let { inputState: n } = e;
	return (
		n.mouseSelection && (n.mouseSelection.dragging = !0),
		(n.draggedContent = i),
		t.dataTransfer &&
			(t.dataTransfer.setData(
				"Text",
				Ya(e.state, qo, e.state.sliceDoc(i.from, i.to)),
			),
			(t.dataTransfer.effectAllowed = "copyMove")),
		!1
	);
}),
	(La.dragend = (e) => ((e.inputState.draggedContent = null), !1)),
	(La.drop = (e, t) => {
		if (!t.dataTransfer) return !1;
		if (e.state.readOnly) return !0;
		let i = t.dataTransfer.files;
		if (i && i.length) {
			let n = Array(i.length),
				r = 0,
				s = () => {
					++r == i.length &&
						el(e, t, n.filter((e) => null != e).join(e.state.lineBreak), !1);
				};
			for (let e = 0; e < i.length; e++) {
				let t = new FileReader();
				(t.onerror = s),
					(t.onload = () => {
						/[\x00-\x08\x0e-\x1f]{2}/.test(t.result) || (n[e] = t.result), s();
					}),
					t.readAsText(i[e]);
			}
			return !0;
		}
		{
			let i = t.dataTransfer.getData("Text");
			if (i) return el(e, t, i, !0), !0;
		}
		return !1;
	}),
	(La.paste = (e, t) => {
		if (e.state.readOnly) return !0;
		e.observer.flush();
		let i = za ? null : t.clipboardData;
		return i
			? (Da(e, i.getData("text/plain") || i.getData("text/uri-list")), !0)
			: ((function (e) {
					let t = e.dom.parentNode;
					if (!t) return;
					let i = t.appendChild(document.createElement("textarea"));
					(i.style.cssText = "position: fixed; left: -10000px; top: 10px"),
						i.focus(),
						setTimeout(() => {
							e.focus(), i.remove(), Da(e, i.value);
						}, 50);
				})(e),
				!1);
	});
let tl = null;
La.copy = La.cut = (e, t) => {
	let {
		text: i,
		ranges: n,
		linewise: r,
	} = (function (e) {
		let t = [],
			i = [],
			n = !1;
		for (let n of e.selection.ranges)
			n.empty || (t.push(e.sliceDoc(n.from, n.to)), i.push(n));
		if (!t.length) {
			let r = -1;
			for (let { from: n } of e.selection.ranges) {
				let s = e.doc.lineAt(n);
				s.number > r &&
					(t.push(s.text),
					i.push({ from: s.from, to: Math.min(e.doc.length, s.to + 1) })),
					(r = s.number);
			}
			n = !0;
		}
		return { text: Ya(e, qo, t.join(e.lineBreak)), ranges: i, linewise: n };
	})(e.state);
	if (!i && !r) return !1;
	(tl = r ? i : null),
		"cut" != t.type ||
			e.state.readOnly ||
			e.dispatch({ changes: n, scrollIntoView: !0, userEvent: "delete.cut" });
	let s = za ? null : t.clipboardData;
	return s
		? (s.clearData(), s.setData("text/plain", i), !0)
		: ((function (e, t) {
				let i = e.dom.parentNode;
				if (!i) return;
				let n = i.appendChild(document.createElement("textarea"));
				(n.style.cssText = "position: fixed; left: -10000px; top: 10px"),
					(n.value = t),
					n.focus(),
					(n.selectionEnd = t.length),
					(n.selectionStart = 0),
					setTimeout(() => {
						n.remove(), e.focus();
					}, 50);
			})(e, i),
			!1);
};
const il = sr.define();
function nl(e, t) {
	let i = [];
	for (let n of e.facet(jo)) {
		let r = n(e, t);
		r && i.push(r);
	}
	return i ? e.update({ effects: i, annotations: il.of(!0) }) : null;
}
function rl(e) {
	setTimeout(() => {
		let t = e.hasFocus;
		if (t != e.inputState.notifiedFocused) {
			let i = nl(e.state, t);
			i ? e.dispatch(i) : e.update([]);
		}
	}, 10);
}
(Wa.focus = (e) => {
	(e.inputState.lastFocusTime = Date.now()),
		e.scrollDOM.scrollTop ||
			(!e.inputState.lastScrollTop && !e.inputState.lastScrollLeft) ||
			((e.scrollDOM.scrollTop = e.inputState.lastScrollTop),
			(e.scrollDOM.scrollLeft = e.inputState.lastScrollLeft)),
		rl(e);
}),
	(Wa.blur = (e) => {
		e.observer.clearSelectionRange(), rl(e);
	}),
	(Wa.compositionstart = Wa.compositionupdate =
		(e) => {
			e.observer.editContext ||
				(null == e.inputState.compositionFirstChange &&
					(e.inputState.compositionFirstChange = !0),
				e.inputState.composing < 0 && (e.inputState.composing = 0));
		}),
	(Wa.compositionend = (e) => {
		e.observer.editContext ||
			((e.inputState.composing = -1),
			(e.inputState.compositionEndedAt = Date.now()),
			(e.inputState.compositionPendingKey = !0),
			(e.inputState.compositionPendingChange =
				e.observer.pendingRecords().length > 0),
			(e.inputState.compositionFirstChange = null),
			js.chrome && js.android
				? e.observer.flushSoon()
				: e.inputState.compositionPendingChange
					? Promise.resolve().then(() => e.observer.flush())
					: setTimeout(() => {
							e.inputState.composing < 0 &&
								e.docView.hasComposition &&
								e.update([]);
						}, 50));
	}),
	(Wa.contextmenu = (e) => {
		e.inputState.lastContextMenu = Date.now();
	}),
	(La.beforeinput = (e, t) => {
		var i, n;
		if ("insertReplacementText" == t.inputType && e.observer.editContext) {
			let n =
					null === (i = t.dataTransfer) || void 0 === i
						? void 0
						: i.getData("text/plain"),
				r = t.getTargetRanges();
			if (n && r.length) {
				let t = r[0],
					i = e.posAtDOM(t.startContainer, t.startOffset),
					s = e.posAtDOM(t.endContainer, t.endOffset);
				return Xa(e, { from: i, to: s, insert: e.state.toText(n) }, null), !0;
			}
		}
		let r;
		if (
			js.chrome &&
			js.android &&
			(r = Ma.find((e) => e.inputType == t.inputType)) &&
			(e.observer.delayAndroidKey(r.key, r.keyCode),
			"Backspace" == r.key || "Delete" == r.key)
		) {
			let t =
				(null === (n = window.visualViewport) || void 0 === n
					? void 0
					: n.height) || 0;
			setTimeout(() => {
				var i;
				((null === (i = window.visualViewport) || void 0 === i
					? void 0
					: i.height) || 0) >
					t + 10 &&
					e.hasFocus &&
					(e.contentDOM.blur(), e.focus());
			}, 100);
		}
		return (
			js.ios && "deleteContentForward" == t.inputType && e.observer.flushSoon(),
			js.safari &&
				"insertText" == t.inputType &&
				e.inputState.composing >= 0 &&
				setTimeout(() => Wa.compositionend(e, t), 20),
			!1
		);
	});
const sl = new Set();
const ol = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let al = !1;
function ll() {
	al = !1;
}
class hl {
	constructor(e) {
		(this.lineWrapping = e),
			(this.doc = an.empty),
			(this.heightSamples = {}),
			(this.lineHeight = 14),
			(this.charWidth = 7),
			(this.textHeight = 14),
			(this.lineLength = 30);
	}
	heightForGap(e, t) {
		let i = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
		return (
			this.lineWrapping &&
				(i += Math.max(
					0,
					Math.ceil((t - e - i * this.lineLength * 0.5) / this.lineLength),
				)),
			this.lineHeight * i
		);
	}
	heightForLine(e) {
		if (!this.lineWrapping) return this.lineHeight;
		return (
			(1 +
				Math.max(0, Math.ceil((e - this.lineLength) / (this.lineLength - 5)))) *
			this.lineHeight
		);
	}
	setDoc(e) {
		return (this.doc = e), this;
	}
	mustRefreshForWrapping(e) {
		return ol.indexOf(e) > -1 != this.lineWrapping;
	}
	mustRefreshForHeights(e) {
		let t = !1;
		for (let i = 0; i < e.length; i++) {
			let n = e[i];
			n < 0
				? i++
				: this.heightSamples[Math.floor(10 * n)] ||
					((t = !0), (this.heightSamples[Math.floor(10 * n)] = !0));
		}
		return t;
	}
	refresh(e, t, i, n, r, s) {
		let o = ol.indexOf(e) > -1,
			a =
				Math.round(t) != Math.round(this.lineHeight) || this.lineWrapping != o;
		if (
			((this.lineWrapping = o),
			(this.lineHeight = t),
			(this.charWidth = i),
			(this.textHeight = n),
			(this.lineLength = r),
			a)
		) {
			this.heightSamples = {};
			for (let e = 0; e < s.length; e++) {
				let t = s[e];
				t < 0 ? e++ : (this.heightSamples[Math.floor(10 * t)] = !0);
			}
		}
		return a;
	}
}
class cl {
	constructor(e, t) {
		(this.from = e), (this.heights = t), (this.index = 0);
	}
	get more() {
		return this.index < this.heights.length;
	}
}
class ul {
	constructor(e, t, i, n, r) {
		(this.from = e),
			(this.length = t),
			(this.top = i),
			(this.height = n),
			(this._content = r);
	}
	get type() {
		return "number" == typeof this._content
			? Fs.Text
			: Array.isArray(this._content)
				? this._content
				: this._content.type;
	}
	get to() {
		return this.from + this.length;
	}
	get bottom() {
		return this.top + this.height;
	}
	get widget() {
		return this._content instanceof to ? this._content.widget : null;
	}
	get widgetLineBreaks() {
		return "number" == typeof this._content ? this._content : 0;
	}
	join(e) {
		let t = (Array.isArray(this._content) ? this._content : [this]).concat(
			Array.isArray(e._content) ? e._content : [e],
		);
		return new ul(
			this.from,
			this.length + e.length,
			this.top,
			this.height + e.height,
			t,
		);
	}
}
var fl = (function (e) {
	return (
		(e[(e.ByPos = 0)] = "ByPos"),
		(e[(e.ByHeight = 1)] = "ByHeight"),
		(e[(e.ByPosNoHeight = 2)] = "ByPosNoHeight"),
		e
	);
})(fl || (fl = {}));
const Ol = 0.001;
class dl {
	constructor(e, t, i = 2) {
		(this.length = e), (this.height = t), (this.flags = i);
	}
	get outdated() {
		return (2 & this.flags) > 0;
	}
	set outdated(e) {
		this.flags = (e ? 2 : 0) | (-3 & this.flags);
	}
	setHeight(e) {
		this.height != e &&
			(Math.abs(this.height - e) > Ol && (al = !0), (this.height = e));
	}
	replace(e, t, i) {
		return dl.of(i);
	}
	decomposeLeft(e, t) {
		t.push(this);
	}
	decomposeRight(e, t) {
		t.push(this);
	}
	applyChanges(e, t, i, n) {
		let r = this,
			s = i.doc;
		for (let o = n.length - 1; o >= 0; o--) {
			let { fromA: a, toA: l, fromB: h, toB: c } = n[o],
				u = r.lineAt(a, fl.ByPosNoHeight, i.setDoc(t), 0, 0),
				f = u.to >= l ? u : r.lineAt(l, fl.ByPosNoHeight, i, 0, 0);
			for (c += f.to - l, l = f.to; o > 0 && u.from <= n[o - 1].toA; )
				(a = n[o - 1].fromA),
					(h = n[o - 1].fromB),
					o--,
					a < u.from && (u = r.lineAt(a, fl.ByPosNoHeight, i, 0, 0));
			(h += u.from - a), (a = u.from);
			let O = yl.build(i.setDoc(s), e, h, c);
			r = pl(r, r.replace(a, l, O));
		}
		return r.updateHeight(i, 0);
	}
	static empty() {
		return new gl(0, 0);
	}
	static of(e) {
		if (1 == e.length) return e[0];
		let t = 0,
			i = e.length,
			n = 0,
			r = 0;
		for (;;)
			if (t == i)
				if (n > 2 * r) {
					let r = e[t - 1];
					r.break
						? e.splice(--t, 1, r.left, null, r.right)
						: e.splice(--t, 1, r.left, r.right),
						(i += 1 + r.break),
						(n -= r.size);
				} else {
					if (!(r > 2 * n)) break;
					{
						let t = e[i];
						t.break
							? e.splice(i, 1, t.left, null, t.right)
							: e.splice(i, 1, t.left, t.right),
							(i += 2 + t.break),
							(r -= t.size);
					}
				}
			else if (n < r) {
				let i = e[t++];
				i && (n += i.size);
			} else {
				let t = e[--i];
				t && (r += t.size);
			}
		let s = 0;
		return (
			null == e[t - 1] ? ((s = 1), t--) : null == e[t] && ((s = 1), i++),
			new bl(dl.of(e.slice(0, t)), s, dl.of(e.slice(i)))
		);
	}
}
function pl(e, t) {
	return e == t ? e : (e.constructor != t.constructor && (al = !0), t);
}
dl.prototype.size = 1;
class ml extends dl {
	constructor(e, t, i) {
		super(e, t), (this.deco = i);
	}
	blockAt(e, t, i, n) {
		return new ul(n, this.length, i, this.height, this.deco || 0);
	}
	lineAt(e, t, i, n, r) {
		return this.blockAt(0, i, n, r);
	}
	forEachLine(e, t, i, n, r, s) {
		e <= r + this.length && t >= r && s(this.blockAt(0, i, n, r));
	}
	updateHeight(e, t = 0, i = !1, n) {
		return (
			n && n.from <= t && n.more && this.setHeight(n.heights[n.index++]),
			(this.outdated = !1),
			this
		);
	}
	toString() {
		return `block(${this.length})`;
	}
}
class gl extends ml {
	constructor(e, t) {
		super(e, t, null),
			(this.collapsed = 0),
			(this.widgetHeight = 0),
			(this.breaks = 0);
	}
	blockAt(e, t, i, n) {
		return new ul(n, this.length, i, this.height, this.breaks);
	}
	replace(e, t, i) {
		let n = i[0];
		return 1 == i.length &&
			(n instanceof gl || (n instanceof xl && 4 & n.flags)) &&
			Math.abs(this.length - n.length) < 10
			? (n instanceof xl
					? (n = new gl(n.length, this.height))
					: (n.height = this.height),
				this.outdated || (n.outdated = !1),
				n)
			: dl.of(i);
	}
	updateHeight(e, t = 0, i = !1, n) {
		return (
			n && n.from <= t && n.more
				? this.setHeight(n.heights[n.index++])
				: (i || this.outdated) &&
					this.setHeight(
						Math.max(
							this.widgetHeight,
							e.heightForLine(this.length - this.collapsed),
						) +
							this.breaks * e.lineHeight,
					),
			(this.outdated = !1),
			this
		);
	}
	toString() {
		return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
	}
}
class xl extends dl {
	constructor(e) {
		super(e, 0);
	}
	heightMetrics(e, t) {
		let i,
			n = e.doc.lineAt(t).number,
			r = e.doc.lineAt(t + this.length).number,
			s = r - n + 1,
			o = 0;
		if (e.lineWrapping) {
			let t = Math.min(this.height, e.lineHeight * s);
			(i = t / s),
				this.length > s + 1 && (o = (this.height - t) / (this.length - s - 1));
		} else i = this.height / s;
		return { firstLine: n, lastLine: r, perLine: i, perChar: o };
	}
	blockAt(e, t, i, n) {
		let {
			firstLine: r,
			lastLine: s,
			perLine: o,
			perChar: a,
		} = this.heightMetrics(t, n);
		if (t.lineWrapping) {
			let r =
					n +
					(e < t.lineHeight
						? 0
						: Math.round(
								Math.max(0, Math.min(1, (e - i) / this.height)) * this.length,
							)),
				s = t.doc.lineAt(r),
				l = o + s.length * a,
				h = Math.max(i, e - l / 2);
			return new ul(s.from, s.length, h, l, 0);
		}
		{
			let n = Math.max(0, Math.min(s - r, Math.floor((e - i) / o))),
				{ from: a, length: l } = t.doc.line(r + n);
			return new ul(a, l, i + o * n, o, 0);
		}
	}
	lineAt(e, t, i, n, r) {
		if (t == fl.ByHeight) return this.blockAt(e, i, n, r);
		if (t == fl.ByPosNoHeight) {
			let { from: t, to: n } = i.doc.lineAt(e);
			return new ul(t, n - t, 0, 0, 0);
		}
		let { firstLine: s, perLine: o, perChar: a } = this.heightMetrics(i, r),
			l = i.doc.lineAt(e),
			h = o + l.length * a,
			c = l.number - s,
			u = n + o * c + a * (l.from - r - c);
		return new ul(
			l.from,
			l.length,
			Math.max(n, Math.min(u, n + this.height - h)),
			h,
			0,
		);
	}
	forEachLine(e, t, i, n, r, s) {
		(e = Math.max(e, r)), (t = Math.min(t, r + this.length));
		let { firstLine: o, perLine: a, perChar: l } = this.heightMetrics(i, r);
		for (let h = e, c = n; h <= t; ) {
			let t = i.doc.lineAt(h);
			if (h == e) {
				let i = t.number - o;
				c += a * i + l * (e - r - i);
			}
			let n = a + l * t.length;
			s(new ul(t.from, t.length, c, n, 0)), (c += n), (h = t.to + 1);
		}
	}
	replace(e, t, i) {
		let n = this.length - t;
		if (n > 0) {
			let e = i[i.length - 1];
			e instanceof xl
				? (i[i.length - 1] = new xl(e.length + n))
				: i.push(null, new xl(n - 1));
		}
		if (e > 0) {
			let t = i[0];
			t instanceof xl
				? (i[0] = new xl(e + t.length))
				: i.unshift(new xl(e - 1), null);
		}
		return dl.of(i);
	}
	decomposeLeft(e, t) {
		t.push(new xl(e - 1), null);
	}
	decomposeRight(e, t) {
		t.push(null, new xl(this.length - e - 1));
	}
	updateHeight(e, t = 0, i = !1, n) {
		let r = t + this.length;
		if (n && n.from <= t + this.length && n.more) {
			let i = [],
				s = Math.max(t, n.from),
				o = -1;
			for (
				n.from > t && i.push(new xl(n.from - t - 1).updateHeight(e, t));
				s <= r && n.more;
			) {
				let t = e.doc.lineAt(s).length;
				i.length && i.push(null);
				let r = n.heights[n.index++];
				-1 == o ? (o = r) : Math.abs(r - o) >= Ol && (o = -2);
				let a = new gl(t, r);
				(a.outdated = !1), i.push(a), (s += t + 1);
			}
			s <= r && i.push(null, new xl(r - s).updateHeight(e, s));
			let a = dl.of(i);
			return (
				(o < 0 ||
					Math.abs(a.height - this.height) >= Ol ||
					Math.abs(o - this.heightMetrics(e, t).perLine) >= Ol) &&
					(al = !0),
				pl(this, a)
			);
		}
		return (
			(i || this.outdated) &&
				(this.setHeight(e.heightForGap(t, t + this.length)),
				(this.outdated = !1)),
			this
		);
	}
	toString() {
		return `gap(${this.length})`;
	}
}
class bl extends dl {
	constructor(e, t, i) {
		super(
			e.length + t + i.length,
			e.height + i.height,
			t | (e.outdated || i.outdated ? 2 : 0),
		),
			(this.left = e),
			(this.right = i),
			(this.size = e.size + i.size);
	}
	get break() {
		return 1 & this.flags;
	}
	blockAt(e, t, i, n) {
		let r = i + this.left.height;
		return e < r
			? this.left.blockAt(e, t, i, n)
			: this.right.blockAt(e, t, r, n + this.left.length + this.break);
	}
	lineAt(e, t, i, n, r) {
		let s = n + this.left.height,
			o = r + this.left.length + this.break,
			a = t == fl.ByHeight ? e < s : e < o,
			l = a
				? this.left.lineAt(e, t, i, n, r)
				: this.right.lineAt(e, t, i, s, o);
		if (this.break || (a ? l.to < o : l.from > o)) return l;
		let h = t == fl.ByPosNoHeight ? fl.ByPosNoHeight : fl.ByPos;
		return a
			? l.join(this.right.lineAt(o, h, i, s, o))
			: this.left.lineAt(o, h, i, n, r).join(l);
	}
	forEachLine(e, t, i, n, r, s) {
		let o = n + this.left.height,
			a = r + this.left.length + this.break;
		if (this.break)
			e < a && this.left.forEachLine(e, t, i, n, r, s),
				t >= a && this.right.forEachLine(e, t, i, o, a, s);
		else {
			let l = this.lineAt(a, fl.ByPos, i, n, r);
			e < l.from && this.left.forEachLine(e, l.from - 1, i, n, r, s),
				l.to >= e && l.from <= t && s(l),
				t > l.to && this.right.forEachLine(l.to + 1, t, i, o, a, s);
		}
	}
	replace(e, t, i) {
		let n = this.left.length + this.break;
		if (t < n) return this.balanced(this.left.replace(e, t, i), this.right);
		if (e > this.left.length)
			return this.balanced(this.left, this.right.replace(e - n, t - n, i));
		let r = [];
		e > 0 && this.decomposeLeft(e, r);
		let s = r.length;
		for (let e of i) r.push(e);
		if ((e > 0 && Sl(r, s - 1), t < this.length)) {
			let e = r.length;
			this.decomposeRight(t, r), Sl(r, e);
		}
		return dl.of(r);
	}
	decomposeLeft(e, t) {
		let i = this.left.length;
		if (e <= i) return this.left.decomposeLeft(e, t);
		t.push(this.left),
			this.break && (i++, e >= i && t.push(null)),
			e > i && this.right.decomposeLeft(e - i, t);
	}
	decomposeRight(e, t) {
		let i = this.left.length,
			n = i + this.break;
		if (e >= n) return this.right.decomposeRight(e - n, t);
		e < i && this.left.decomposeRight(e, t),
			this.break && e < n && t.push(null),
			t.push(this.right);
	}
	balanced(e, t) {
		return e.size > 2 * t.size || t.size > 2 * e.size
			? dl.of(this.break ? [e, null, t] : [e, t])
			: ((this.left = pl(this.left, e)),
				(this.right = pl(this.right, t)),
				this.setHeight(e.height + t.height),
				(this.outdated = e.outdated || t.outdated),
				(this.size = e.size + t.size),
				(this.length = e.length + this.break + t.length),
				this);
	}
	updateHeight(e, t = 0, i = !1, n) {
		let { left: r, right: s } = this,
			o = t + r.length + this.break,
			a = null;
		return (
			n && n.from <= t + r.length && n.more
				? (a = r = r.updateHeight(e, t, i, n))
				: r.updateHeight(e, t, i),
			n && n.from <= o + s.length && n.more
				? (a = s = s.updateHeight(e, o, i, n))
				: s.updateHeight(e, o, i),
			a
				? this.balanced(r, s)
				: ((this.height = this.left.height + this.right.height),
					(this.outdated = !1),
					this)
		);
	}
	toString() {
		return this.left + (this.break ? " " : "-") + this.right;
	}
}
function Sl(e, t) {
	let i, n;
	null == e[t] &&
		(i = e[t - 1]) instanceof xl &&
		(n = e[t + 1]) instanceof xl &&
		e.splice(t - 1, 3, new xl(i.length + 1 + n.length));
}
class yl {
	constructor(e, t) {
		(this.pos = e),
			(this.oracle = t),
			(this.nodes = []),
			(this.lineStart = -1),
			(this.lineEnd = -1),
			(this.covering = null),
			(this.writtenTo = e);
	}
	get isCovered() {
		return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
	}
	span(e, t) {
		if (this.lineStart > -1) {
			let e = Math.min(t, this.lineEnd),
				i = this.nodes[this.nodes.length - 1];
			i instanceof gl
				? (i.length += e - this.pos)
				: (e > this.pos || !this.isCovered) &&
					this.nodes.push(new gl(e - this.pos, -1)),
				(this.writtenTo = e),
				t > e &&
					(this.nodes.push(null), this.writtenTo++, (this.lineStart = -1));
		}
		this.pos = t;
	}
	point(e, t, i) {
		if (e < t || i.heightRelevant) {
			let n = i.widget ? i.widget.estimatedHeight : 0,
				r = i.widget ? i.widget.lineBreaks : 0;
			n < 0 && (n = this.oracle.lineHeight);
			let s = t - e;
			i.block
				? this.addBlock(new ml(s, n, i))
				: (s || r || n >= 5) && this.addLineDeco(n, r, s);
		} else t > e && this.span(e, t);
		this.lineEnd > -1 &&
			this.lineEnd < this.pos &&
			(this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
	}
	enterLine() {
		if (this.lineStart > -1) return;
		let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
		(this.lineStart = e),
			(this.lineEnd = t),
			this.writtenTo < e &&
				((this.writtenTo < e - 1 ||
					null == this.nodes[this.nodes.length - 1]) &&
					this.nodes.push(this.blankContent(this.writtenTo, e - 1)),
				this.nodes.push(null)),
			this.pos > e && this.nodes.push(new gl(this.pos - e, -1)),
			(this.writtenTo = this.pos);
	}
	blankContent(e, t) {
		let i = new xl(t - e);
		return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
	}
	ensureLine() {
		this.enterLine();
		let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
		if (e instanceof gl) return e;
		let t = new gl(0, -1);
		return this.nodes.push(t), t;
	}
	addBlock(e) {
		this.enterLine();
		let t = e.deco;
		t && t.startSide > 0 && !this.isCovered && this.ensureLine(),
			this.nodes.push(e),
			(this.writtenTo = this.pos = this.pos + e.length),
			t && t.endSide > 0 && (this.covering = e);
	}
	addLineDeco(e, t, i) {
		let n = this.ensureLine();
		(n.length += i),
			(n.collapsed += i),
			(n.widgetHeight = Math.max(n.widgetHeight, e)),
			(n.breaks += t),
			(this.writtenTo = this.pos = this.pos + i);
	}
	finish(e) {
		let t = 0 == this.nodes.length ? null : this.nodes[this.nodes.length - 1];
		!(this.lineStart > -1) || t instanceof gl || this.isCovered
			? (this.writtenTo < this.pos || null == t) &&
				this.nodes.push(this.blankContent(this.writtenTo, this.pos))
			: this.nodes.push(new gl(0, -1));
		let i = e;
		for (let e of this.nodes)
			e instanceof gl && e.updateHeight(this.oracle, i),
				(i += e ? e.length : 1);
		return this.nodes;
	}
	static build(e, t, i, n) {
		let r = new yl(i, e);
		return vr.spans(t, i, n, r, 0), r.finish(i);
	}
}
class Ql {
	constructor() {
		this.changes = [];
	}
	compareRange() {}
	comparePoint(e, t, i, n) {
		(e < t || (i && i.heightRelevant) || (n && n.heightRelevant)) &&
			no(e, t, this.changes, 5);
	}
}
function wl(e, t) {
	let i = e.getBoundingClientRect(),
		n = e.ownerDocument,
		r = n.defaultView || window,
		s = Math.max(0, i.left),
		o = Math.min(r.innerWidth, i.right),
		a = Math.max(0, i.top),
		l = Math.min(r.innerHeight, i.bottom);
	for (let t = e.parentNode; t && t != n.body; )
		if (1 == t.nodeType) {
			let i = t,
				n = window.getComputedStyle(i);
			if (
				(i.scrollHeight > i.clientHeight || i.scrollWidth > i.clientWidth) &&
				"visible" != n.overflow
			) {
				let n = i.getBoundingClientRect();
				(s = Math.max(s, n.left)),
					(o = Math.min(o, n.right)),
					(a = Math.max(a, n.top)),
					(l = Math.min(t == e.parentNode ? r.innerHeight : l, n.bottom));
			}
			t =
				"absolute" == n.position || "fixed" == n.position
					? i.offsetParent
					: i.parentNode;
		} else {
			if (11 != t.nodeType) break;
			t = t.host;
		}
	return {
		left: s - i.left,
		right: Math.max(s, o) - i.left,
		top: a - (i.top + t),
		bottom: Math.max(a, l) - (i.top + t),
	};
}
function kl(e, t) {
	let i = e.getBoundingClientRect();
	return {
		left: 0,
		right: i.right - i.left,
		top: t,
		bottom: i.bottom - (i.top + t),
	};
}
class vl {
	constructor(e, t, i, n) {
		(this.from = e), (this.to = t), (this.size = i), (this.displaySize = n);
	}
	static same(e, t) {
		if (e.length != t.length) return !1;
		for (let i = 0; i < e.length; i++) {
			let n = e[i],
				r = t[i];
			if (n.from != r.from || n.to != r.to || n.size != r.size) return !1;
		}
		return !0;
	}
	draw(e, t) {
		return Ks.replace({
			widget: new $l(this.displaySize * (t ? e.scaleY : e.scaleX), t),
		}).range(this.from, this.to);
	}
}
class $l extends Hs {
	constructor(e, t) {
		super(), (this.size = e), (this.vertical = t);
	}
	eq(e) {
		return e.size == this.size && e.vertical == this.vertical;
	}
	toDOM() {
		let e = document.createElement("div");
		return (
			this.vertical
				? (e.style.height = this.size + "px")
				: ((e.style.width = this.size + "px"),
					(e.style.height = "2px"),
					(e.style.display = "inline-block")),
			e
		);
	}
	get estimatedHeight() {
		return this.vertical ? this.size : -1;
	}
}
class Pl {
	constructor(e) {
		(this.state = e),
			(this.pixelViewport = {
				left: 0,
				right: window.innerWidth,
				top: 0,
				bottom: 0,
			}),
			(this.inView = !0),
			(this.paddingTop = 0),
			(this.paddingBottom = 0),
			(this.contentDOMWidth = 0),
			(this.contentDOMHeight = 0),
			(this.editorHeight = 0),
			(this.editorWidth = 0),
			(this.scrollTop = 0),
			(this.scrolledToBottom = !1),
			(this.scaleX = 1),
			(this.scaleY = 1),
			(this.scrollAnchorPos = 0),
			(this.scrollAnchorHeight = -1),
			(this.scaler = Xl),
			(this.scrollTarget = null),
			(this.printing = !1),
			(this.mustMeasureContent = !0),
			(this.defaultTextDirection = co.LTR),
			(this.visibleRanges = []),
			(this.mustEnforceCursorAssoc = !1);
		let t = e
			.facet(Ko)
			.some((e) => "function" != typeof e && "cm-lineWrapping" == e.class);
		(this.heightOracle = new hl(t)),
			(this.stateDeco = e.facet(Jo).filter((e) => "function" != typeof e)),
			(this.heightMap = dl
				.empty()
				.applyChanges(
					this.stateDeco,
					an.empty,
					this.heightOracle.setDoc(e.doc),
					[new aa(0, 0, 0, e.doc.length)],
				));
		for (
			let e = 0;
			e < 2 &&
			((this.viewport = this.getViewport(0, null)), this.updateForViewport());
			e++
		);
		this.updateViewportLines(),
			(this.lineGaps = this.ensureLineGaps([])),
			(this.lineGapDeco = Ks.set(this.lineGaps.map((e) => e.draw(this, !1)))),
			this.computeVisibleRanges();
	}
	updateForViewport() {
		let e = [this.viewport],
			{ main: t } = this.state.selection;
		for (let i = 0; i <= 1; i++) {
			let n = i ? t.head : t.anchor;
			if (!e.some(({ from: e, to: t }) => n >= e && n <= t)) {
				let { from: t, to: i } = this.lineBlockAt(n);
				e.push(new Zl(t, i));
			}
		}
		return (
			(this.viewports = e.sort((e, t) => e.from - t.from)), this.updateScaler()
		);
	}
	updateScaler() {
		let e = this.scaler;
		return (
			(this.scaler =
				this.heightMap.height <= 7e6
					? Xl
					: new Al(this.heightOracle, this.heightMap, this.viewports)),
			e.eq(this.scaler) ? 0 : 2
		);
	}
	updateViewportLines() {
		(this.viewportLines = []),
			this.heightMap.forEachLine(
				this.viewport.from,
				this.viewport.to,
				this.heightOracle.setDoc(this.state.doc),
				0,
				0,
				(e) => {
					this.viewportLines.push(Cl(e, this.scaler));
				},
			);
	}
	update(e, t = null) {
		this.state = e.state;
		let i = this.stateDeco;
		this.stateDeco = this.state.facet(Jo).filter((e) => "function" != typeof e);
		let n = e.changedRanges,
			r = aa.extendWithRanges(
				n,
				(function (e, t, i) {
					let n = new Ql();
					return vr.compare(e, t, i, n, 0), n.changes;
				})(i, this.stateDeco, e ? e.changes : yn.empty(this.state.doc.length)),
			),
			s = this.heightMap.height,
			o = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
		ll(),
			(this.heightMap = this.heightMap.applyChanges(
				this.stateDeco,
				e.startState.doc,
				this.heightOracle.setDoc(this.state.doc),
				r,
			)),
			(this.heightMap.height != s || al) && (e.flags |= 2),
			o
				? ((this.scrollAnchorPos = e.changes.mapPos(o.from, -1)),
					(this.scrollAnchorHeight = o.top))
				: ((this.scrollAnchorPos = -1),
					(this.scrollAnchorHeight = this.heightMap.height));
		let a = r.length
			? this.mapViewport(this.viewport, e.changes)
			: this.viewport;
		((t && (t.range.head < a.from || t.range.head > a.to)) ||
			!this.viewportIsAppropriate(a)) &&
			(a = this.getViewport(0, t));
		let l = a.from != this.viewport.from || a.to != this.viewport.to;
		(this.viewport = a),
			(e.flags |= this.updateForViewport()),
			(l || !e.changes.empty || 2 & e.flags) && this.updateViewportLines(),
			(this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) &&
				this.updateLineGaps(
					this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes)),
				),
			(e.flags |= this.computeVisibleRanges(e.changes)),
			t && (this.scrollTarget = t),
			!this.mustEnforceCursorAssoc &&
				e.selectionSet &&
				e.view.lineWrapping &&
				e.state.selection.main.empty &&
				e.state.selection.main.assoc &&
				!e.state.facet(Lo) &&
				(this.mustEnforceCursorAssoc = !0);
	}
	measure(e) {
		let t = e.contentDOM,
			i = window.getComputedStyle(t),
			n = this.heightOracle,
			r = i.whiteSpace;
		this.defaultTextDirection = "rtl" == i.direction ? co.RTL : co.LTR;
		let s = this.heightOracle.mustRefreshForWrapping(r),
			o = t.getBoundingClientRect(),
			a = s || this.mustMeasureContent || this.contentDOMHeight != o.height;
		(this.contentDOMHeight = o.height), (this.mustMeasureContent = !1);
		let l = 0,
			h = 0;
		if (o.width && o.height) {
			let { scaleX: e, scaleY: i } = as(t, o);
			((e > 0.005 && Math.abs(this.scaleX - e) > 0.005) ||
				(i > 0.005 && Math.abs(this.scaleY - i) > 0.005)) &&
				((this.scaleX = e), (this.scaleY = i), (l |= 16), (s = a = !0));
		}
		let c = (parseInt(i.paddingTop) || 0) * this.scaleY,
			u = (parseInt(i.paddingBottom) || 0) * this.scaleY;
		(this.paddingTop == c && this.paddingBottom == u) ||
			((this.paddingTop = c), (this.paddingBottom = u), (l |= 18)),
			this.editorWidth != e.scrollDOM.clientWidth &&
				(n.lineWrapping && (a = !0),
				(this.editorWidth = e.scrollDOM.clientWidth),
				(l |= 16));
		let f = e.scrollDOM.scrollTop * this.scaleY;
		this.scrollTop != f &&
			((this.scrollAnchorHeight = -1), (this.scrollTop = f)),
			(this.scrolledToBottom = ps(e.scrollDOM));
		let O = (this.printing ? kl : wl)(t, this.paddingTop),
			d = O.top - this.pixelViewport.top,
			p = O.bottom - this.pixelViewport.bottom;
		this.pixelViewport = O;
		let m =
			this.pixelViewport.bottom > this.pixelViewport.top &&
			this.pixelViewport.right > this.pixelViewport.left;
		if (
			(m != this.inView && ((this.inView = m), m && (a = !0)),
			!this.inView &&
				!this.scrollTarget &&
				!(function (e) {
					let t = e.getBoundingClientRect(),
						i = e.ownerDocument.defaultView || window;
					return (
						t.left < i.innerWidth &&
						t.right > 0 &&
						t.top < i.innerHeight &&
						t.bottom > 0
					);
				})(e.dom))
		)
			return 0;
		let g = o.width;
		if (
			((this.contentDOMWidth == g &&
				this.editorHeight == e.scrollDOM.clientHeight) ||
				((this.contentDOMWidth = o.width),
				(this.editorHeight = e.scrollDOM.clientHeight),
				(l |= 16)),
			a)
		) {
			let t = e.docView.measureVisibleLineHeights(this.viewport);
			if (
				(n.mustRefreshForHeights(t) && (s = !0),
				s ||
					(n.lineWrapping && Math.abs(g - this.contentDOMWidth) > n.charWidth))
			) {
				let {
					lineHeight: i,
					charWidth: o,
					textHeight: a,
				} = e.docView.measureTextSize();
				(s = i > 0 && n.refresh(r, i, o, a, g / o, t)),
					s && ((e.docView.minWidth = 0), (l |= 16));
			}
			d > 0 && p > 0
				? (h = Math.max(d, p))
				: d < 0 && p < 0 && (h = Math.min(d, p)),
				ll();
			for (let i of this.viewports) {
				let r =
					i.from == this.viewport.from
						? t
						: e.docView.measureVisibleLineHeights(i);
				this.heightMap = (
					s
						? dl
								.empty()
								.applyChanges(this.stateDeco, an.empty, this.heightOracle, [
									new aa(0, 0, 0, e.state.doc.length),
								])
						: this.heightMap
				).updateHeight(n, 0, s, new cl(i.from, r));
			}
			al && (l |= 2);
		}
		let x =
			!this.viewportIsAppropriate(this.viewport, h) ||
			(this.scrollTarget &&
				(this.scrollTarget.range.head < this.viewport.from ||
					this.scrollTarget.range.head > this.viewport.to));
		return (
			x &&
				(2 & l && (l |= this.updateScaler()),
				(this.viewport = this.getViewport(h, this.scrollTarget)),
				(l |= this.updateForViewport())),
			(2 & l || x) && this.updateViewportLines(),
			(this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) &&
				this.updateLineGaps(this.ensureLineGaps(s ? [] : this.lineGaps, e)),
			(l |= this.computeVisibleRanges()),
			this.mustEnforceCursorAssoc &&
				((this.mustEnforceCursorAssoc = !1), e.docView.enforceCursorAssoc()),
			l
		);
	}
	get visibleTop() {
		return this.scaler.fromDOM(this.pixelViewport.top);
	}
	get visibleBottom() {
		return this.scaler.fromDOM(this.pixelViewport.bottom);
	}
	getViewport(e, t) {
		let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)),
			n = this.heightMap,
			r = this.heightOracle,
			{ visibleTop: s, visibleBottom: o } = this,
			a = new Zl(
				n.lineAt(s - 1e3 * i, fl.ByHeight, r, 0, 0).from,
				n.lineAt(o + 1e3 * (1 - i), fl.ByHeight, r, 0, 0).to,
			);
		if (t) {
			let { head: e } = t.range;
			if (e < a.from || e > a.to) {
				let i,
					s = Math.min(
						this.editorHeight,
						this.pixelViewport.bottom - this.pixelViewport.top,
					),
					o = n.lineAt(e, fl.ByPos, r, 0, 0);
				(i =
					"center" == t.y
						? (o.top + o.bottom) / 2 - s / 2
						: "start" == t.y || ("nearest" == t.y && e < a.from)
							? o.top
							: o.bottom - s),
					(a = new Zl(
						n.lineAt(i - 500, fl.ByHeight, r, 0, 0).from,
						n.lineAt(i + s + 500, fl.ByHeight, r, 0, 0).to,
					));
			}
		}
		return a;
	}
	mapViewport(e, t) {
		let i = t.mapPos(e.from, -1),
			n = t.mapPos(e.to, 1);
		return new Zl(
			this.heightMap.lineAt(i, fl.ByPos, this.heightOracle, 0, 0).from,
			this.heightMap.lineAt(n, fl.ByPos, this.heightOracle, 0, 0).to,
		);
	}
	viewportIsAppropriate({ from: e, to: t }, i = 0) {
		if (!this.inView) return !0;
		let { top: n } = this.heightMap.lineAt(
				e,
				fl.ByPos,
				this.heightOracle,
				0,
				0,
			),
			{ bottom: r } = this.heightMap.lineAt(
				t,
				fl.ByPos,
				this.heightOracle,
				0,
				0,
			),
			{ visibleTop: s, visibleBottom: o } = this;
		return (
			(0 == e || n <= s - Math.max(10, Math.min(-i, 250))) &&
			(t == this.state.doc.length || r >= o + Math.max(10, Math.min(i, 250))) &&
			n > s - 2e3 &&
			r < o + 2e3
		);
	}
	mapLineGaps(e, t) {
		if (!e.length || t.empty) return e;
		let i = [];
		for (let n of e)
			t.touchesRange(n.from, n.to) ||
				i.push(new vl(t.mapPos(n.from), t.mapPos(n.to), n.size, n.displaySize));
		return i;
	}
	ensureLineGaps(e, t) {
		let i = this.heightOracle.lineWrapping,
			n = i ? 1e4 : 2e3,
			r = n >> 1,
			s = n << 1;
		if (this.defaultTextDirection != co.LTR && !i) return [];
		let o = [],
			a = (n, s, l, h) => {
				if (s - n < r) return;
				let c = this.state.selection.main,
					u = [c.from];
				c.empty || u.push(c.to);
				for (let e of u)
					if (e > n && e < s)
						return a(n, e - 10, l, h), void a(e + 10, s, l, h);
				let f = (function (e, t) {
					for (let i of e) if (t(i)) return i;
					return;
				})(
					e,
					(e) =>
						e.from >= l.from &&
						e.to <= l.to &&
						Math.abs(e.from - n) < r &&
						Math.abs(e.to - s) < r &&
						!u.some((t) => e.from < t && e.to > t),
				);
				if (!f) {
					if (
						s < l.to &&
						t &&
						i &&
						t.visibleRanges.some((e) => e.from <= s && e.to >= s)
					) {
						let e = t.moveToLineBoundary(_n.cursor(s), !1, !0).head;
						e > n && (s = e);
					}
					let e = this.gapSize(l, n, s, h);
					f = new vl(n, s, e, i || e < 2e6 ? e : 2e6);
				}
				o.push(f);
			},
			l = (t) => {
				if (t.length < s || t.type != Fs.Text) return;
				let r = (function (e, t, i) {
					let n = [],
						r = e,
						s = 0;
					vr.spans(
						i,
						e,
						t,
						{
							span() {},
							point(e, t) {
								e > r && (n.push({ from: r, to: e }), (s += e - r)), (r = t);
							},
						},
						20,
					),
						r < t && (n.push({ from: r, to: t }), (s += t - r));
					return { total: s, ranges: n };
				})(t.from, t.to, this.stateDeco);
				if (r.total < s) return;
				let o,
					l,
					h = this.scrollTarget ? this.scrollTarget.range.head : null;
				if (i) {
					let e,
						i,
						s =
							(n / this.heightOracle.lineLength) * this.heightOracle.lineHeight;
					if (null != h) {
						let n = Tl(r, h),
							o = ((this.visibleBottom - this.visibleTop) / 2 + s) / t.height;
						(e = n - o), (i = n + o);
					} else
						(e = (this.visibleTop - t.top - s) / t.height),
							(i = (this.visibleBottom - t.top + s) / t.height);
					(o = _l(r, e)), (l = _l(r, i));
				} else {
					let i = r.total * this.heightOracle.charWidth,
						s = n * this.heightOracle.charWidth,
						a = 0;
					if (i > 2e6)
						for (let i of e)
							i.from >= t.from &&
								i.from < t.to &&
								i.size != i.displaySize &&
								i.from * this.heightOracle.charWidth + a <
									this.pixelViewport.left &&
								(a = i.size - i.displaySize);
					let c,
						u,
						f = this.pixelViewport.left + a,
						O = this.pixelViewport.right + a;
					if (null != h) {
						let e = Tl(r, h),
							t = ((O - f) / 2 + s) / i;
						(c = e - t), (u = e + t);
					} else (c = (f - s) / i), (u = (O + s) / i);
					(o = _l(r, c)), (l = _l(r, u));
				}
				o > t.from && a(t.from, o, t, r), l < t.to && a(l, t.to, t, r);
			};
		for (let e of this.viewportLines)
			Array.isArray(e.type) ? e.type.forEach(l) : l(e);
		return o;
	}
	gapSize(e, t, i, n) {
		let r = Tl(n, i) - Tl(n, t);
		return this.heightOracle.lineWrapping
			? e.height * r
			: n.total * this.heightOracle.charWidth * r;
	}
	updateLineGaps(e) {
		vl.same(e, this.lineGaps) ||
			((this.lineGaps = e),
			(this.lineGapDeco = Ks.set(
				e.map((e) => e.draw(this, this.heightOracle.lineWrapping)),
			)));
	}
	computeVisibleRanges(e) {
		let t = this.stateDeco;
		this.lineGaps.length && (t = t.concat(this.lineGapDeco));
		let i = [];
		vr.spans(
			t,
			this.viewport.from,
			this.viewport.to,
			{
				span(e, t) {
					i.push({ from: e, to: t });
				},
				point() {},
			},
			20,
		);
		let n = 0;
		if (i.length != this.visibleRanges.length) n = 12;
		else
			for (let t = 0; t < i.length && !(8 & n); t++) {
				let r = this.visibleRanges[t],
					s = i[t];
				(r.from == s.from && r.to == s.to) ||
					((n |= 4),
					(e && e.mapPos(r.from, -1) == s.from && e.mapPos(r.to, 1) == s.to) ||
						(n |= 8));
			}
		return (this.visibleRanges = i), n;
	}
	lineBlockAt(e) {
		return (
			(e >= this.viewport.from &&
				e <= this.viewport.to &&
				this.viewportLines.find((t) => t.from <= e && t.to >= e)) ||
			Cl(
				this.heightMap.lineAt(e, fl.ByPos, this.heightOracle, 0, 0),
				this.scaler,
			)
		);
	}
	lineBlockAtHeight(e) {
		return (
			(e >= this.viewportLines[0].top &&
				e <= this.viewportLines[this.viewportLines.length - 1].bottom &&
				this.viewportLines.find((t) => t.top <= e && t.bottom >= e)) ||
			Cl(
				this.heightMap.lineAt(
					this.scaler.fromDOM(e),
					fl.ByHeight,
					this.heightOracle,
					0,
					0,
				),
				this.scaler,
			)
		);
	}
	scrollAnchorAt(e) {
		let t = this.lineBlockAtHeight(e + 8);
		return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200
			? t
			: this.viewportLines[0];
	}
	elementAtHeight(e) {
		return Cl(
			this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0),
			this.scaler,
		);
	}
	get docHeight() {
		return this.scaler.toDOM(this.heightMap.height);
	}
	get contentHeight() {
		return this.docHeight + this.paddingTop + this.paddingBottom;
	}
}
class Zl {
	constructor(e, t) {
		(this.from = e), (this.to = t);
	}
}
function _l({ total: e, ranges: t }, i) {
	if (i <= 0) return t[0].from;
	if (i >= 1) return t[t.length - 1].to;
	let n = Math.floor(e * i);
	for (let e = 0; ; e++) {
		let { from: i, to: r } = t[e],
			s = r - i;
		if (n <= s) return i + n;
		n -= s;
	}
}
function Tl(e, t) {
	let i = 0;
	for (let { from: n, to: r } of e.ranges) {
		if (t <= r) {
			i += t - n;
			break;
		}
		i += r - n;
	}
	return i / e.total;
}
const Xl = {
	toDOM: (e) => e,
	fromDOM: (e) => e,
	scale: 1,
	eq(e) {
		return e == this;
	},
};
class Al {
	constructor(e, t, i) {
		let n = 0,
			r = 0,
			s = 0;
		(this.viewports = i.map(({ from: i, to: r }) => {
			let s = t.lineAt(i, fl.ByPos, e, 0, 0).top,
				o = t.lineAt(r, fl.ByPos, e, 0, 0).bottom;
			return (
				(n += o - s),
				{ from: i, to: r, top: s, bottom: o, domTop: 0, domBottom: 0 }
			);
		})),
			(this.scale = (7e6 - n) / (t.height - n));
		for (let e of this.viewports)
			(e.domTop = s + (e.top - r) * this.scale),
				(s = e.domBottom = e.domTop + (e.bottom - e.top)),
				(r = e.bottom);
	}
	toDOM(e) {
		for (let t = 0, i = 0, n = 0; ; t++) {
			let r = t < this.viewports.length ? this.viewports[t] : null;
			if (!r || e < r.top) return n + (e - i) * this.scale;
			if (e <= r.bottom) return r.domTop + (e - r.top);
			(i = r.bottom), (n = r.domBottom);
		}
	}
	fromDOM(e) {
		for (let t = 0, i = 0, n = 0; ; t++) {
			let r = t < this.viewports.length ? this.viewports[t] : null;
			if (!r || e < r.domTop) return i + (e - n) / this.scale;
			if (e <= r.domBottom) return r.top + (e - r.domTop);
			(i = r.bottom), (n = r.domBottom);
		}
	}
	eq(e) {
		return (
			e instanceof Al &&
			this.scale == e.scale &&
			this.viewports.length == e.viewports.length &&
			this.viewports.every(
				(t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to,
			)
		);
	}
}
function Cl(e, t) {
	if (1 == t.scale) return e;
	let i = t.toDOM(e.top),
		n = t.toDOM(e.bottom);
	return new ul(
		e.from,
		e.length,
		i,
		n - i,
		Array.isArray(e._content) ? e._content.map((e) => Cl(e, t)) : e._content,
	);
}
const Rl = An.define({ combine: (e) => e.join(" ") }),
	Ml = An.define({ combine: (e) => e.indexOf(!0) > -1 }),
	jl = Wr.newName(),
	El = Wr.newName(),
	ql = Wr.newName(),
	Vl = { "&light": "." + El, "&dark": "." + ql };
function Ll(e, t, i) {
	return new Wr(t, {
		finish: (t) =>
			/&/.test(t)
				? t.replace(/&\w*/, (t) => {
						if ("&" == t) return e;
						if (!i || !i[t]) throw new RangeError(`Unsupported selector: ${t}`);
						return i[t];
					})
				: e + " " + t,
	});
}
const Wl = Ll(
		"." + jl,
		{
			"&": {
				position: "relative !important",
				boxSizing: "border-box",
				"&.cm-focused": { outline: "1px dotted #212121" },
				display: "flex !important",
				flexDirection: "column",
			},
			".cm-scroller": {
				display: "flex !important",
				alignItems: "flex-start !important",
				fontFamily: "monospace",
				lineHeight: 1.4,
				height: "100%",
				overflowX: "auto",
				position: "relative",
				zIndex: 0,
				overflowAnchor: "none",
			},
			".cm-content": {
				margin: 0,
				flexGrow: 2,
				flexShrink: 0,
				display: "block",
				whiteSpace: "pre",
				wordWrap: "normal",
				boxSizing: "border-box",
				minHeight: "100%",
				padding: "4px 0",
				outline: "none",
				"&[contenteditable=true]": {
					WebkitUserModify: "read-write-plaintext-only",
				},
			},
			".cm-lineWrapping": {
				whiteSpace_fallback: "pre-wrap",
				whiteSpace: "break-spaces",
				wordBreak: "break-word",
				overflowWrap: "anywhere",
				flexShrink: 1,
			},
			"&light .cm-content": { caretColor: "black" },
			"&dark .cm-content": { caretColor: "white" },
			".cm-line": { display: "block", padding: "0 2px 0 6px" },
			".cm-layer": {
				position: "absolute",
				left: 0,
				top: 0,
				contain: "size style",
				"& > *": { position: "absolute" },
			},
			"&light .cm-selectionBackground": { background: "#d9d9d9" },
			"&dark .cm-selectionBackground": { background: "#222" },
			"&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":
				{ background: "#d7d4f0" },
			"&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":
				{ background: "#233" },
			".cm-cursorLayer": { pointerEvents: "none" },
			"&.cm-focused > .cm-scroller > .cm-cursorLayer": {
				animation: "steps(1) cm-blink 1.2s infinite",
			},
			"@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
			"@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
			".cm-cursor, .cm-dropCursor": {
				borderLeft: "1.2px solid black",
				marginLeft: "-0.6px",
				pointerEvents: "none",
			},
			".cm-cursor": { display: "none" },
			"&dark .cm-cursor": { borderLeftColor: "#ddd" },
			".cm-dropCursor": { position: "absolute" },
			"&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
				display: "block",
			},
			".cm-iso": { unicodeBidi: "isolate" },
			".cm-announced": { position: "fixed", top: "-10000px" },
			"@media print": { ".cm-announced": { display: "none" } },
			"&light .cm-activeLine": { backgroundColor: "#cceeff44" },
			"&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
			"&light .cm-specialChar": { color: "red" },
			"&dark .cm-specialChar": { color: "#f78" },
			".cm-gutters": {
				flexShrink: 0,
				display: "flex",
				height: "100%",
				boxSizing: "border-box",
				insetInlineStart: 0,
				zIndex: 200,
			},
			"&light .cm-gutters": {
				backgroundColor: "#f5f5f5",
				color: "#6c6c6c",
				borderRight: "1px solid #ddd",
			},
			"&dark .cm-gutters": { backgroundColor: "#333338", color: "#ccc" },
			".cm-gutter": {
				display: "flex !important",
				flexDirection: "column",
				flexShrink: 0,
				boxSizing: "border-box",
				minHeight: "100%",
				overflow: "hidden",
			},
			".cm-gutterElement": { boxSizing: "border-box" },
			".cm-lineNumbers .cm-gutterElement": {
				padding: "0 3px 0 5px",
				minWidth: "20px",
				textAlign: "right",
				whiteSpace: "nowrap",
			},
			"&light .cm-activeLineGutter": { backgroundColor: "#e2f2ff" },
			"&dark .cm-activeLineGutter": { backgroundColor: "#222227" },
			".cm-panels": {
				boxSizing: "border-box",
				position: "sticky",
				left: 0,
				right: 0,
				zIndex: 300,
			},
			"&light .cm-panels": { backgroundColor: "#f5f5f5", color: "black" },
			"&light .cm-panels-top": { borderBottom: "1px solid #ddd" },
			"&light .cm-panels-bottom": { borderTop: "1px solid #ddd" },
			"&dark .cm-panels": { backgroundColor: "#333338", color: "white" },
			".cm-tab": {
				display: "inline-block",
				overflow: "hidden",
				verticalAlign: "bottom",
			},
			".cm-widgetBuffer": {
				verticalAlign: "text-top",
				height: "1em",
				width: 0,
				display: "inline",
			},
			".cm-placeholder": {
				color: "#888",
				display: "inline-block",
				verticalAlign: "top",
				userSelect: "none",
			},
			".cm-highlightSpace": {
				backgroundImage:
					"radial-gradient(circle at 50% 55%, #aaa 20%, transparent 5%)",
				backgroundPosition: "center",
			},
			".cm-highlightTab": {
				backgroundImage:
					'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>\')',
				backgroundSize: "auto 100%",
				backgroundPosition: "right 90%",
				backgroundRepeat: "no-repeat",
			},
			".cm-trailingSpace": { backgroundColor: "#ff332255" },
			".cm-button": {
				verticalAlign: "middle",
				color: "inherit",
				fontSize: "70%",
				padding: ".2em 1em",
				borderRadius: "1px",
			},
			"&light .cm-button": {
				backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
				border: "1px solid #888",
				"&:active": { backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)" },
			},
			"&dark .cm-button": {
				backgroundImage: "linear-gradient(#393939, #111)",
				border: "1px solid #888",
				"&:active": { backgroundImage: "linear-gradient(#111, #333)" },
			},
			".cm-textfield": {
				verticalAlign: "middle",
				color: "inherit",
				fontSize: "70%",
				border: "1px solid silver",
				padding: ".2em .5em",
			},
			"&light .cm-textfield": { backgroundColor: "white" },
			"&dark .cm-textfield": {
				border: "1px solid #555",
				backgroundColor: "inherit",
			},
		},
		Vl,
	),
	zl = {
		childList: !0,
		characterData: !0,
		subtree: !0,
		attributes: !0,
		characterDataOldValue: !0,
	},
	Yl = js.ie && js.ie_version <= 11;
class Dl {
	constructor(e) {
		(this.view = e),
			(this.active = !1),
			(this.editContext = null),
			(this.selectionRange = new ls()),
			(this.selectionChanged = !1),
			(this.delayedFlush = -1),
			(this.resizeTimeout = -1),
			(this.queue = []),
			(this.delayedAndroidKey = null),
			(this.flushingAndroidKey = -1),
			(this.lastChange = 0),
			(this.scrollTargets = []),
			(this.intersection = null),
			(this.resizeScroll = null),
			(this.intersecting = !1),
			(this.gapIntersection = null),
			(this.gaps = []),
			(this.printQuery = null),
			(this.parentCheck = -1),
			(this.dom = e.contentDOM),
			(this.observer = new MutationObserver((t) => {
				for (let e of t) this.queue.push(e);
				((js.ie && js.ie_version <= 11) || (js.ios && e.composing)) &&
				t.some(
					(e) =>
						("childList" == e.type && e.removedNodes.length) ||
						("characterData" == e.type &&
							e.oldValue.length > e.target.nodeValue.length),
				)
					? this.flushSoon()
					: this.flush();
			})),
			!window.EditContext ||
				!1 === e.constructor.EDIT_CONTEXT ||
				(js.chrome && js.chrome_version < 126) ||
				((this.editContext = new Ul(e)),
				e.state.facet(Io) &&
					(e.contentDOM.editContext = this.editContext.editContext)),
			Yl &&
				(this.onCharData = (e) => {
					this.queue.push({
						target: e.target,
						type: "characterData",
						oldValue: e.prevValue,
					}),
						this.flushSoon();
				}),
			(this.onSelectionChange = this.onSelectionChange.bind(this)),
			(this.onResize = this.onResize.bind(this)),
			(this.onPrint = this.onPrint.bind(this)),
			(this.onScroll = this.onScroll.bind(this)),
			window.matchMedia && (this.printQuery = window.matchMedia("print")),
			"function" == typeof ResizeObserver &&
				((this.resizeScroll = new ResizeObserver(() => {
					var e;
					(null === (e = this.view.docView) || void 0 === e
						? void 0
						: e.lastUpdate) <
						Date.now() - 75 && this.onResize();
				})),
				this.resizeScroll.observe(e.scrollDOM)),
			this.addWindowListeners((this.win = e.win)),
			this.start(),
			"function" == typeof IntersectionObserver &&
				((this.intersection = new IntersectionObserver(
					(e) => {
						this.parentCheck < 0 &&
							(this.parentCheck = setTimeout(
								this.listenForScroll.bind(this),
								1e3,
							)),
							e.length > 0 &&
								e[e.length - 1].intersectionRatio > 0 != this.intersecting &&
								((this.intersecting = !this.intersecting),
								this.intersecting != this.view.inView &&
									this.onScrollChanged(document.createEvent("Event")));
					},
					{ threshold: [0, 0.001] },
				)),
				this.intersection.observe(this.dom),
				(this.gapIntersection = new IntersectionObserver((e) => {
					e.length > 0 &&
						e[e.length - 1].intersectionRatio > 0 &&
						this.onScrollChanged(document.createEvent("Event"));
				}, {}))),
			this.listenForScroll(),
			this.readSelectionRange();
	}
	onScrollChanged(e) {
		this.view.inputState.runHandlers("scroll", e),
			this.intersecting && this.view.measure();
	}
	onScroll(e) {
		this.intersecting && this.flush(!1),
			this.editContext && this.view.requestMeasure(this.editContext.measureReq),
			this.onScrollChanged(e);
	}
	onResize() {
		this.resizeTimeout < 0 &&
			(this.resizeTimeout = setTimeout(() => {
				(this.resizeTimeout = -1), this.view.requestMeasure();
			}, 50));
	}
	onPrint(e) {
		(("change" != e.type && e.type) || e.matches) &&
			((this.view.viewState.printing = !0),
			this.view.measure(),
			setTimeout(() => {
				(this.view.viewState.printing = !1), this.view.requestMeasure();
			}, 500));
	}
	updateGaps(e) {
		if (
			this.gapIntersection &&
			(e.length != this.gaps.length || this.gaps.some((t, i) => t != e[i]))
		) {
			this.gapIntersection.disconnect();
			for (let t of e) this.gapIntersection.observe(t);
			this.gaps = e;
		}
	}
	onSelectionChange(e) {
		let t = this.selectionChanged;
		if (!this.readSelectionRange() || this.delayedAndroidKey) return;
		let { view: i } = this,
			n = this.selectionRange;
		if (i.state.facet(Io) ? i.root.activeElement != this.dom : !Kr(this.dom, n))
			return;
		let r = n.anchorNode && i.docView.nearest(n.anchorNode);
		r && r.ignoreEvent(e)
			? t || (this.selectionChanged = !1)
			: ((js.ie && js.ie_version <= 11) || (js.android && js.chrome)) &&
					!i.state.selection.main.empty &&
					n.focusNode &&
					es(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset)
				? this.flushSoon()
				: this.flush(!1);
	}
	readSelectionRange() {
		let { view: e } = this,
			t = Hr(e.root);
		if (!t) return !1;
		let i =
			(js.safari &&
				11 == e.root.nodeType &&
				e.root.activeElement == this.dom &&
				(function (e, t) {
					if (t.getComposedRanges) {
						let i = t.getComposedRanges(e.root)[0];
						if (i) return Il(e, i);
					}
					let i = null;
					function n(e) {
						e.preventDefault(),
							e.stopImmediatePropagation(),
							(i = e.getTargetRanges()[0]);
					}
					return (
						e.contentDOM.addEventListener("beforeinput", n, !0),
						e.dom.ownerDocument.execCommand("indent"),
						e.contentDOM.removeEventListener("beforeinput", n, !0),
						i ? Il(e, i) : null
					);
				})(this.view, t)) ||
			t;
		if (!i || this.selectionRange.eq(i)) return !1;
		let n = Kr(this.dom, i);
		return n &&
			!this.selectionChanged &&
			e.inputState.lastFocusTime > Date.now() - 200 &&
			e.inputState.lastTouchTime < Date.now() - 300 &&
			(function (e, t) {
				let i = t.focusNode,
					n = t.focusOffset;
				if (!i || t.anchorNode != i || t.anchorOffset != n) return !1;
				for (n = Math.min(n, rs(i)); ; )
					if (n) {
						if (1 != i.nodeType) return !1;
						let e = i.childNodes[n - 1];
						"false" == e.contentEditable ? n-- : ((i = e), (n = rs(i)));
					} else {
						if (i == e) return !0;
						(n = ts(i)), (i = i.parentNode);
					}
			})(this.dom, i)
			? ((this.view.inputState.lastFocusTime = 0),
				e.docView.updateSelection(),
				!1)
			: (this.selectionRange.setRange(i),
				n && (this.selectionChanged = !0),
				!0);
	}
	setSelectionRange(e, t) {
		this.selectionRange.set(e.node, e.offset, t.node, t.offset),
			(this.selectionChanged = !1);
	}
	clearSelectionRange() {
		this.selectionRange.set(null, 0, null, 0);
	}
	listenForScroll() {
		this.parentCheck = -1;
		let e = 0,
			t = null;
		for (let i = this.dom; i; )
			if (1 == i.nodeType)
				!t && e < this.scrollTargets.length && this.scrollTargets[e] == i
					? e++
					: t || (t = this.scrollTargets.slice(0, e)),
					t && t.push(i),
					(i = i.assignedSlot || i.parentNode);
			else {
				if (11 != i.nodeType) break;
				i = i.host;
			}
		if (
			(e < this.scrollTargets.length &&
				!t &&
				(t = this.scrollTargets.slice(0, e)),
			t)
		) {
			for (let e of this.scrollTargets)
				e.removeEventListener("scroll", this.onScroll);
			for (let e of (this.scrollTargets = t))
				e.addEventListener("scroll", this.onScroll);
		}
	}
	ignore(e) {
		if (!this.active) return e();
		try {
			return this.stop(), e();
		} finally {
			this.start(), this.clear();
		}
	}
	start() {
		this.active ||
			(this.observer.observe(this.dom, zl),
			Yl &&
				this.dom.addEventListener("DOMCharacterDataModified", this.onCharData),
			(this.active = !0));
	}
	stop() {
		this.active &&
			((this.active = !1),
			this.observer.disconnect(),
			Yl &&
				this.dom.removeEventListener(
					"DOMCharacterDataModified",
					this.onCharData,
				));
	}
	clear() {
		this.processRecords(),
			(this.queue.length = 0),
			(this.selectionChanged = !1);
	}
	delayAndroidKey(e, t) {
		var i;
		if (!this.delayedAndroidKey) {
			let e = () => {
				let e = this.delayedAndroidKey;
				if (e) {
					this.clearDelayedAndroidKey(),
						(this.view.inputState.lastKeyCode = e.keyCode),
						(this.view.inputState.lastKeyTime = Date.now()),
						!this.flush() && e.force && Os(this.dom, e.key, e.keyCode);
				}
			};
			this.flushingAndroidKey = this.view.win.requestAnimationFrame(e);
		}
		(this.delayedAndroidKey && "Enter" != e) ||
			(this.delayedAndroidKey = {
				key: e,
				keyCode: t,
				force:
					this.lastChange < Date.now() - 50 ||
					!!(null === (i = this.delayedAndroidKey) || void 0 === i
						? void 0
						: i.force),
			});
	}
	clearDelayedAndroidKey() {
		this.win.cancelAnimationFrame(this.flushingAndroidKey),
			(this.delayedAndroidKey = null),
			(this.flushingAndroidKey = -1);
	}
	flushSoon() {
		this.delayedFlush < 0 &&
			(this.delayedFlush = this.view.win.requestAnimationFrame(() => {
				(this.delayedFlush = -1), this.flush();
			}));
	}
	forceFlush() {
		this.delayedFlush >= 0 &&
			(this.view.win.cancelAnimationFrame(this.delayedFlush),
			(this.delayedFlush = -1)),
			this.flush();
	}
	pendingRecords() {
		for (let e of this.observer.takeRecords()) this.queue.push(e);
		return this.queue;
	}
	processRecords() {
		let e = this.pendingRecords();
		e.length && (this.queue = []);
		let t = -1,
			i = -1,
			n = !1;
		for (let r of e) {
			let e = this.readMutation(r);
			e &&
				(e.typeOver && (n = !0),
				-1 == t
					? ({ from: t, to: i } = e)
					: ((t = Math.min(e.from, t)), (i = Math.max(e.to, i))));
		}
		return { from: t, to: i, typeOver: n };
	}
	readChange() {
		let { from: e, to: t, typeOver: i } = this.processRecords(),
			n = this.selectionChanged && Kr(this.dom, this.selectionRange);
		if (e < 0 && !n) return null;
		e > -1 && (this.lastChange = Date.now()),
			(this.view.inputState.lastFocusTime = 0),
			(this.selectionChanged = !1);
		let r = new _a(this.view, e, t, i);
		return (
			(this.view.docView.domChanged = {
				newSel: r.newSel ? r.newSel.main : null,
			}),
			r
		);
	}
	flush(e = !0) {
		if (this.delayedFlush >= 0 || this.delayedAndroidKey) return !1;
		e && this.readSelectionRange();
		let t = this.readChange();
		if (!t) return this.view.requestMeasure(), !1;
		let i = this.view.state,
			n = Ta(this.view, t);
		return (
			this.view.state == i &&
				(t.domChanged ||
					(t.newSel && !t.newSel.main.eq(this.view.state.selection.main))) &&
				this.view.update([]),
			n
		);
	}
	readMutation(e) {
		let t = this.view.docView.nearest(e.target);
		if (!t || t.ignoreMutation(e)) return null;
		if (
			(t.markDirty("attributes" == e.type),
			"attributes" == e.type && (t.flags |= 4),
			"childList" == e.type)
		) {
			let i = Bl(t, e.previousSibling || e.target.previousSibling, -1),
				n = Bl(t, e.nextSibling || e.target.nextSibling, 1);
			return {
				from: i ? t.posAfter(i) : t.posAtStart,
				to: n ? t.posBefore(n) : t.posAtEnd,
				typeOver: !1,
			};
		}
		return "characterData" == e.type
			? {
					from: t.posAtStart,
					to: t.posAtEnd,
					typeOver: e.target.nodeValue == e.oldValue,
				}
			: null;
	}
	setWindow(e) {
		e != this.win &&
			(this.removeWindowListeners(this.win),
			(this.win = e),
			this.addWindowListeners(this.win));
	}
	addWindowListeners(e) {
		e.addEventListener("resize", this.onResize),
			this.printQuery
				? this.printQuery.addEventListener
					? this.printQuery.addEventListener("change", this.onPrint)
					: this.printQuery.addListener(this.onPrint)
				: e.addEventListener("beforeprint", this.onPrint),
			e.addEventListener("scroll", this.onScroll),
			e.document.addEventListener("selectionchange", this.onSelectionChange);
	}
	removeWindowListeners(e) {
		e.removeEventListener("scroll", this.onScroll),
			e.removeEventListener("resize", this.onResize),
			this.printQuery
				? this.printQuery.removeEventListener
					? this.printQuery.removeEventListener("change", this.onPrint)
					: this.printQuery.removeListener(this.onPrint)
				: e.removeEventListener("beforeprint", this.onPrint),
			e.document.removeEventListener("selectionchange", this.onSelectionChange);
	}
	update(e) {
		this.editContext &&
			(this.editContext.update(e),
			e.startState.facet(Io) != e.state.facet(Io) &&
				(e.view.contentDOM.editContext = e.state.facet(Io)
					? this.editContext.editContext
					: null));
	}
	destroy() {
		var e, t, i;
		this.stop(),
			null === (e = this.intersection) || void 0 === e || e.disconnect(),
			null === (t = this.gapIntersection) || void 0 === t || t.disconnect(),
			null === (i = this.resizeScroll) || void 0 === i || i.disconnect();
		for (let e of this.scrollTargets)
			e.removeEventListener("scroll", this.onScroll);
		this.removeWindowListeners(this.win),
			clearTimeout(this.parentCheck),
			clearTimeout(this.resizeTimeout),
			this.win.cancelAnimationFrame(this.delayedFlush),
			this.win.cancelAnimationFrame(this.flushingAndroidKey),
			this.editContext &&
				((this.view.contentDOM.editContext = null), this.editContext.destroy());
	}
}
function Bl(e, t, i) {
	for (; t; ) {
		let n = Ss.get(t);
		if (n && n.parent == e) return n;
		let r = t.parentNode;
		t = r != e.dom ? r : i > 0 ? t.nextSibling : t.previousSibling;
	}
	return null;
}
function Il(e, t) {
	let i = t.startContainer,
		n = t.startOffset,
		r = t.endContainer,
		s = t.endOffset,
		o = e.docView.domAtPos(e.state.selection.main.anchor);
	return (
		es(o.node, o.offset, r, s) && ([i, n, r, s] = [r, s, i, n]),
		{ anchorNode: i, anchorOffset: n, focusNode: r, focusOffset: s }
	);
}
class Ul {
	constructor(e) {
		(this.from = 0),
			(this.to = 0),
			(this.pendingContextChange = null),
			(this.handlers = Object.create(null)),
			(this.composing = null),
			this.resetRange(e.state);
		let t = (this.editContext = new window.EditContext({
			text: e.state.doc.sliceString(this.from, this.to),
			selectionStart: this.toContextPos(
				Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor)),
			),
			selectionEnd: this.toContextPos(e.state.selection.main.head),
		}));
		(this.handlers.textupdate = (t) => {
			let i = e.state.selection.main,
				{ anchor: n, head: r } = i,
				s = this.toEditorPos(t.updateRangeStart),
				o = this.toEditorPos(t.updateRangeEnd);
			e.inputState.composing >= 0 &&
				!this.composing &&
				(this.composing = {
					contextBase: t.updateRangeStart,
					editorBase: s,
					drifted: !1,
				});
			let a = { from: s, to: o, insert: an.of(t.text.split("\n")) };
			if (
				(a.from == this.from && n < this.from
					? (a.from = n)
					: a.to == this.to && n > this.to && (a.to = n),
				a.from != a.to || a.insert.length)
			) {
				if (
					((js.mac || js.android) &&
						a.from == r - 1 &&
						/^\. ?$/.test(t.text) &&
						"off" == e.contentDOM.getAttribute("autocorrect") &&
						(a = { from: s, to: o, insert: an.of([t.text.replace(".", " ")]) }),
					(this.pendingContextChange = a),
					!e.state.readOnly)
				) {
					let i = this.to - this.from + (a.to - a.from + a.insert.length);
					Xa(
						e,
						a,
						_n.single(
							this.toEditorPos(t.selectionStart, i),
							this.toEditorPos(t.selectionEnd, i),
						),
					);
				}
				this.pendingContextChange &&
					(this.revertPending(e.state), this.setSelection(e.state));
			} else {
				let n = _n.single(
					this.toEditorPos(t.selectionStart),
					this.toEditorPos(t.selectionEnd),
				);
				n.main.eq(i) || e.dispatch({ selection: n, userEvent: "select" });
			}
		}),
			(this.handlers.characterboundsupdate = (i) => {
				let n = [],
					r = null;
				for (
					let t = this.toEditorPos(i.rangeStart),
						s = this.toEditorPos(i.rangeEnd);
					t < s;
					t++
				) {
					let i = e.coordsForChar(t);
					(r =
						(i &&
							new DOMRect(i.left, i.top, i.right - i.left, i.bottom - i.top)) ||
						r ||
						new DOMRect()),
						n.push(r);
				}
				t.updateCharacterBounds(i.rangeStart, n);
			}),
			(this.handlers.textformatupdate = (t) => {
				let i = [];
				for (let e of t.getTextFormats()) {
					let t = e.underlineStyle,
						n = e.underlineThickness;
					if ("None" != t && "None" != n) {
						let r = this.toEditorPos(e.rangeStart),
							s = this.toEditorPos(e.rangeEnd);
						if (r < s) {
							let e = `text-decoration: underline ${"Dashed" == t ? "dashed " : "Squiggle" == t ? "wavy " : ""}${"Thin" == n ? 1 : 2}px`;
							i.push(Ks.mark({ attributes: { style: e } }).range(r, s));
						}
					}
				}
				e.dispatch({ effects: Do.of(Ks.set(i)) });
			}),
			(this.handlers.compositionstart = () => {
				e.inputState.composing < 0 &&
					((e.inputState.composing = 0),
					(e.inputState.compositionFirstChange = !0));
			}),
			(this.handlers.compositionend = () => {
				if (
					((e.inputState.composing = -1),
					(e.inputState.compositionFirstChange = null),
					this.composing)
				) {
					let { drifted: t } = this.composing;
					(this.composing = null), t && this.reset(e.state);
				}
			});
		for (let e in this.handlers) t.addEventListener(e, this.handlers[e]);
		this.measureReq = {
			read: (e) => {
				this.editContext.updateControlBounds(
					e.contentDOM.getBoundingClientRect(),
				);
				let t = Hr(e.root);
				t &&
					t.rangeCount &&
					this.editContext.updateSelectionBounds(
						t.getRangeAt(0).getBoundingClientRect(),
					);
			},
		};
	}
	applyEdits(e) {
		let t = 0,
			i = !1,
			n = this.pendingContextChange;
		return (
			e.changes.iterChanges((r, s, o, a, l) => {
				if (i) return;
				let h = l.length - (s - r);
				if (n && s >= n.to) {
					if (n.from == r && n.to == s && n.insert.eq(l))
						return (
							(n = this.pendingContextChange = null),
							(t += h),
							void (this.to += h)
						);
					(n = null), this.revertPending(e.state);
				}
				if (((r += t), (s += t) <= this.from)) (this.from += h), (this.to += h);
				else if (r < this.to) {
					if (
						r < this.from ||
						s > this.to ||
						this.to - this.from + l.length > 3e4
					)
						return void (i = !0);
					this.editContext.updateText(
						this.toContextPos(r),
						this.toContextPos(s),
						l.toString(),
					),
						(this.to += h);
				}
				t += h;
			}),
			n && !i && this.revertPending(e.state),
			!i
		);
	}
	update(e) {
		let t = this.pendingContextChange,
			i = e.startState.selection.main;
		this.composing &&
		(this.composing.drifted ||
			(!e.changes.touchesRange(i.from, i.to) &&
				e.transactions.some(
					(e) =>
						!e.isUserEvent("input.type") &&
						e.changes.touchesRange(this.from, this.to),
				)))
			? ((this.composing.drifted = !0),
				(this.composing.editorBase = e.changes.mapPos(
					this.composing.editorBase,
				)))
			: this.applyEdits(e) && this.rangeIsValid(e.state)
				? (e.docChanged || e.selectionSet || t) && this.setSelection(e.state)
				: ((this.pendingContextChange = null), this.reset(e.state)),
			(e.geometryChanged || e.docChanged || e.selectionSet) &&
				e.view.requestMeasure(this.measureReq);
	}
	resetRange(e) {
		let { head: t } = e.selection.main;
		(this.from = Math.max(0, t - 1e4)),
			(this.to = Math.min(e.doc.length, t + 1e4));
	}
	reset(e) {
		this.resetRange(e),
			this.editContext.updateText(
				0,
				this.editContext.text.length,
				e.doc.sliceString(this.from, this.to),
			),
			this.setSelection(e);
	}
	revertPending(e) {
		let t = this.pendingContextChange;
		(this.pendingContextChange = null),
			this.editContext.updateText(
				this.toContextPos(t.from),
				this.toContextPos(t.from + t.insert.length),
				e.doc.sliceString(t.from, t.to),
			);
	}
	setSelection(e) {
		let { main: t } = e.selection,
			i = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))),
			n = this.toContextPos(t.head);
		(this.editContext.selectionStart == i &&
			this.editContext.selectionEnd == n) ||
			this.editContext.updateSelection(i, n);
	}
	rangeIsValid(e) {
		let { head: t } = e.selection.main;
		return !(
			(this.from > 0 && t - this.from < 500) ||
			(this.to < e.doc.length && this.to - t < 500) ||
			this.to - this.from > 3e4
		);
	}
	toEditorPos(e, t = this.to - this.from) {
		e = Math.min(e, t);
		let i = this.composing;
		return i && i.drifted ? i.editorBase + (e - i.contextBase) : e + this.from;
	}
	toContextPos(e) {
		let t = this.composing;
		return t && t.drifted ? t.contextBase + (e - t.editorBase) : e - this.from;
	}
	destroy() {
		for (let e in this.handlers)
			this.editContext.removeEventListener(e, this.handlers[e]);
	}
}
class Gl {
	get state() {
		return this.viewState.state;
	}
	get viewport() {
		return this.viewState.viewport;
	}
	get visibleRanges() {
		return this.viewState.visibleRanges;
	}
	get inView() {
		return this.viewState.inView;
	}
	get composing() {
		return this.inputState.composing > 0;
	}
	get compositionStarted() {
		return this.inputState.composing >= 0;
	}
	get root() {
		return this._root;
	}
	get win() {
		return this.dom.ownerDocument.defaultView || window;
	}
	constructor(e = {}) {
		var t;
		(this.plugins = []),
			(this.pluginMap = new Map()),
			(this.editorAttrs = {}),
			(this.contentAttrs = {}),
			(this.bidiCache = []),
			(this.destroyed = !1),
			(this.updateState = 2),
			(this.measureScheduled = -1),
			(this.measureRequests = []),
			(this.contentDOM = document.createElement("div")),
			(this.scrollDOM = document.createElement("div")),
			(this.scrollDOM.tabIndex = -1),
			(this.scrollDOM.className = "cm-scroller"),
			this.scrollDOM.appendChild(this.contentDOM),
			(this.announceDOM = document.createElement("div")),
			(this.announceDOM.className = "cm-announced"),
			this.announceDOM.setAttribute("aria-live", "polite"),
			(this.dom = document.createElement("div")),
			this.dom.appendChild(this.announceDOM),
			this.dom.appendChild(this.scrollDOM),
			e.parent && e.parent.appendChild(this.dom);
		let { dispatch: i } = e;
		(this.dispatchTransactions =
			e.dispatchTransactions ||
			(i && ((e) => e.forEach((e) => i(e, this)))) ||
			((e) => this.update(e))),
			(this.dispatch = this.dispatch.bind(this)),
			(this._root =
				e.root ||
				(function (e) {
					for (; e; ) {
						if (e && (9 == e.nodeType || (11 == e.nodeType && e.host)))
							return e;
						e = e.assignedSlot || e.parentNode;
					}
					return null;
				})(e.parent) ||
				document),
			(this.viewState = new Pl(e.state || Sr.create(e))),
			e.scrollTo &&
				e.scrollTo.is(Yo) &&
				(this.viewState.scrollTarget = e.scrollTo.value.clip(
					this.viewState.state,
				)),
			(this.plugins = this.state.facet(Go).map((e) => new Ho(e)));
		for (let e of this.plugins) e.update(this);
		(this.observer = new Dl(this)),
			(this.inputState = new Aa(this)),
			this.inputState.ensureHandlers(this.plugins),
			(this.docView = new ha(this)),
			this.mountStyles(),
			this.updateAttrs(),
			(this.updateState = 0),
			this.requestMeasure(),
			(null === (t = document.fonts) || void 0 === t ? void 0 : t.ready) &&
				document.fonts.ready.then(() => this.requestMeasure());
	}
	dispatch(...e) {
		let t =
			1 == e.length && e[0] instanceof hr
				? e
				: 1 == e.length && Array.isArray(e[0])
					? e[0]
					: [this.state.update(...e)];
		this.dispatchTransactions(t, this);
	}
	update(e) {
		if (0 != this.updateState)
			throw new Error(
				"Calls to EditorView.update are not allowed while an update is in progress",
			);
		let t,
			i = !1,
			n = !1,
			r = this.state;
		for (let t of e) {
			if (t.startState != r)
				throw new RangeError(
					"Trying to update state with a transaction that doesn't start from the previous state.",
				);
			r = t.state;
		}
		if (this.destroyed) return void (this.viewState.state = r);
		let s = this.hasFocus,
			o = 0,
			a = null;
		e.some((e) => e.annotation(il))
			? ((this.inputState.notifiedFocused = s), (o = 1))
			: s != this.inputState.notifiedFocused &&
				((this.inputState.notifiedFocused = s), (a = nl(r, s)), a || (o = 1));
		let l = this.observer.delayedAndroidKey,
			h = null;
		if (
			(l
				? (this.observer.clearDelayedAndroidKey(),
					(h = this.observer.readChange()),
					((h && !this.state.doc.eq(r.doc)) ||
						!this.state.selection.eq(r.selection)) &&
						(h = null))
				: this.observer.clear(),
			r.facet(Sr.phrases) != this.state.facet(Sr.phrases))
		)
			return this.setState(r);
		(t = la.create(this, r, e)), (t.flags |= o);
		let c = this.viewState.scrollTarget;
		try {
			this.updateState = 2;
			for (let t of e) {
				if ((c && (c = c.map(t.changes)), t.scrollIntoView)) {
					let { main: e } = t.state.selection;
					c = new zo(
						e.empty ? e : _n.cursor(e.head, e.head > e.anchor ? -1 : 1),
					);
				}
				for (let e of t.effects) e.is(Yo) && (c = e.value.clip(this.state));
			}
			this.viewState.update(t, c),
				(this.bidiCache = Fl.update(this.bidiCache, t.changes)),
				t.empty || (this.updatePlugins(t), this.inputState.update(t)),
				(i = this.docView.update(t)),
				this.state.facet(oa) != this.styleModules && this.mountStyles(),
				(n = this.updateAttrs()),
				this.showAnnouncements(e),
				this.docView.updateSelection(
					i,
					e.some((e) => e.isUserEvent("select.pointer")),
				);
		} finally {
			this.updateState = 0;
		}
		if (
			(t.startState.facet(Rl) != t.state.facet(Rl) &&
				(this.viewState.mustMeasureContent = !0),
			(i ||
				n ||
				c ||
				this.viewState.mustEnforceCursorAssoc ||
				this.viewState.mustMeasureContent) &&
				this.requestMeasure(),
			i && this.docViewUpdate(),
			!t.empty)
		)
			for (let e of this.state.facet(Ro))
				try {
					e(t);
				} catch (e) {
					Bo(this.state, e, "update listener");
				}
		(a || h) &&
			Promise.resolve().then(() => {
				a && this.state == a.startState && this.dispatch(a),
					h && !Ta(this, h) && l.force && Os(this.contentDOM, l.key, l.keyCode);
			});
	}
	setState(e) {
		if (0 != this.updateState)
			throw new Error(
				"Calls to EditorView.setState are not allowed while an update is in progress",
			);
		if (this.destroyed) return void (this.viewState.state = e);
		this.updateState = 2;
		let t = this.hasFocus;
		try {
			for (let e of this.plugins) e.destroy(this);
			(this.viewState = new Pl(e)),
				(this.plugins = e.facet(Go).map((e) => new Ho(e))),
				this.pluginMap.clear();
			for (let e of this.plugins) e.update(this);
			this.docView.destroy(),
				(this.docView = new ha(this)),
				this.inputState.ensureHandlers(this.plugins),
				this.mountStyles(),
				this.updateAttrs(),
				(this.bidiCache = []);
		} finally {
			this.updateState = 0;
		}
		t && this.focus(), this.requestMeasure();
	}
	updatePlugins(e) {
		let t = e.startState.facet(Go),
			i = e.state.facet(Go);
		if (t != i) {
			let n = [];
			for (let r of i) {
				let i = t.indexOf(r);
				if (i < 0) n.push(new Ho(r));
				else {
					let t = this.plugins[i];
					(t.mustUpdate = e), n.push(t);
				}
			}
			for (let t of this.plugins) t.mustUpdate != e && t.destroy(this);
			(this.plugins = n), this.pluginMap.clear();
		} else for (let t of this.plugins) t.mustUpdate = e;
		for (let e = 0; e < this.plugins.length; e++) this.plugins[e].update(this);
		t != i && this.inputState.ensureHandlers(this.plugins);
	}
	docViewUpdate() {
		for (let e of this.plugins) {
			let t = e.value;
			if (t && t.docViewUpdate)
				try {
					t.docViewUpdate(this);
				} catch (e) {
					Bo(this.state, e, "doc view update listener");
				}
		}
	}
	measure(e = !0) {
		if (this.destroyed) return;
		if (
			(this.measureScheduled > -1 &&
				this.win.cancelAnimationFrame(this.measureScheduled),
			this.observer.delayedAndroidKey)
		)
			return (this.measureScheduled = -1), void this.requestMeasure();
		(this.measureScheduled = 0), e && this.observer.forceFlush();
		let t = null,
			i = this.scrollDOM,
			n = i.scrollTop * this.scaleY,
			{ scrollAnchorPos: r, scrollAnchorHeight: s } = this.viewState;
		Math.abs(n - this.viewState.scrollTop) > 1 && (s = -1),
			(this.viewState.scrollAnchorHeight = -1);
		try {
			for (let e = 0; ; e++) {
				if (s < 0)
					if (ps(i)) (r = -1), (s = this.viewState.heightMap.height);
					else {
						let e = this.viewState.scrollAnchorAt(n);
						(r = e.from), (s = e.top);
					}
				this.updateState = 1;
				let o = this.viewState.measure(this);
				if (
					!o &&
					!this.measureRequests.length &&
					null == this.viewState.scrollTarget
				)
					break;
				if (e > 5) {
					console.warn(
						this.measureRequests.length
							? "Measure loop restarted more than 5 times"
							: "Viewport failed to stabilize",
					);
					break;
				}
				let a = [];
				4 & o || ([this.measureRequests, a] = [a, this.measureRequests]);
				let l = a.map((e) => {
						try {
							return e.read(this);
						} catch (e) {
							return Bo(this.state, e), Hl;
						}
					}),
					h = la.create(this, this.state, []),
					c = !1;
				(h.flags |= o),
					t ? (t.flags |= o) : (t = h),
					(this.updateState = 2),
					h.empty ||
						(this.updatePlugins(h),
						this.inputState.update(h),
						this.updateAttrs(),
						(c = this.docView.update(h)),
						c && this.docViewUpdate());
				for (let e = 0; e < a.length; e++)
					if (l[e] != Hl)
						try {
							let t = a[e];
							t.write && t.write(l[e], this);
						} catch (e) {
							Bo(this.state, e);
						}
				if (
					(c && this.docView.updateSelection(!0),
					!h.viewportChanged && 0 == this.measureRequests.length)
				) {
					if (this.viewState.editorHeight) {
						if (this.viewState.scrollTarget) {
							this.docView.scrollIntoView(this.viewState.scrollTarget),
								(this.viewState.scrollTarget = null),
								(s = -1);
							continue;
						}
						{
							let e =
								(r < 0
									? this.viewState.heightMap.height
									: this.viewState.lineBlockAt(r).top) - s;
							if (e > 1 || e < -1) {
								(n += e), (i.scrollTop = n / this.scaleY), (s = -1);
								continue;
							}
						}
					}
					break;
				}
			}
		} finally {
			(this.updateState = 0), (this.measureScheduled = -1);
		}
		if (t && !t.empty) for (let e of this.state.facet(Ro)) e(t);
	}
	get themeClasses() {
		return (
			jl + " " + (this.state.facet(Ml) ? ql : El) + " " + this.state.facet(Rl)
		);
	}
	updateAttrs() {
		let e = Kl(this, Fo, {
				class:
					"cm-editor" +
					(this.hasFocus ? " cm-focused " : " ") +
					this.themeClasses,
			}),
			t = {
				spellcheck: "false",
				autocorrect: "off",
				autocapitalize: "off",
				writingsuggestions: "false",
				translate: "no",
				contenteditable: this.state.facet(Io) ? "true" : "false",
				class: "cm-content",
				style: `${js.tabSize}: ${this.state.tabSize}`,
				role: "textbox",
				"aria-multiline": "true",
			};
		this.state.readOnly && (t["aria-readonly"] = "true"), Kl(this, Ko, t);
		let i = this.observer.ignore(() => {
			let i = Gs(this.contentDOM, this.contentAttrs, t),
				n = Gs(this.dom, this.editorAttrs, e);
			return i || n;
		});
		return (this.editorAttrs = e), (this.contentAttrs = t), i;
	}
	showAnnouncements(e) {
		let t = !0;
		for (let i of e)
			for (let e of i.effects)
				if (e.is(Gl.announce)) {
					t && (this.announceDOM.textContent = ""),
						(t = !1),
						(this.announceDOM.appendChild(
							document.createElement("div"),
						).textContent = e.value);
				}
	}
	mountStyles() {
		this.styleModules = this.state.facet(oa);
		let e = this.state.facet(Gl.cspNonce);
		Wr.mount(
			this.root,
			this.styleModules.concat(Wl).reverse(),
			e ? { nonce: e } : void 0,
		);
	}
	readMeasured() {
		if (2 == this.updateState)
			throw new Error(
				"Reading the editor layout isn't allowed during an update",
			);
		0 == this.updateState && this.measureScheduled > -1 && this.measure(!1);
	}
	requestMeasure(e) {
		if (
			(this.measureScheduled < 0 &&
				(this.measureScheduled = this.win.requestAnimationFrame(() =>
					this.measure(),
				)),
			e)
		) {
			if (this.measureRequests.indexOf(e) > -1) return;
			if (null != e.key)
				for (let t = 0; t < this.measureRequests.length; t++)
					if (this.measureRequests[t].key === e.key)
						return void (this.measureRequests[t] = e);
			this.measureRequests.push(e);
		}
	}
	plugin(e) {
		let t = this.pluginMap.get(e);
		return (
			(void 0 === t || (t && t.spec != e)) &&
				this.pluginMap.set(
					e,
					(t = this.plugins.find((t) => t.spec == e) || null),
				),
			t && t.update(this).value
		);
	}
	get documentTop() {
		return (
			this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop
		);
	}
	get documentPadding() {
		return {
			top: this.viewState.paddingTop,
			bottom: this.viewState.paddingBottom,
		};
	}
	get scaleX() {
		return this.viewState.scaleX;
	}
	get scaleY() {
		return this.viewState.scaleY;
	}
	elementAtHeight(e) {
		return this.readMeasured(), this.viewState.elementAtHeight(e);
	}
	lineBlockAtHeight(e) {
		return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
	}
	get viewportLineBlocks() {
		return this.viewState.viewportLines;
	}
	lineBlockAt(e) {
		return this.viewState.lineBlockAt(e);
	}
	get contentHeight() {
		return this.viewState.contentHeight;
	}
	moveByChar(e, t, i) {
		return ka(this, e, Qa(this, e, t, i));
	}
	moveByGroup(e, t) {
		return ka(
			this,
			e,
			Qa(this, e, t, (t) =>
				(function (e, t, i) {
					let n = e.state.charCategorizer(t),
						r = n(i);
					return (e) => {
						let t = n(e);
						return r == mr.Space && (r = t), r == t;
					};
				})(this, e.head, t),
			),
		);
	}
	visualLineSide(e, t) {
		let i = this.bidiSpans(e),
			n = this.textDirectionAt(e.from),
			r = i[t ? i.length - 1 : 0];
		return _n.cursor(r.side(t, n) + e.from, r.forward(!t, n) ? 1 : -1);
	}
	moveToLineBoundary(e, t, i = !0) {
		return ya(this, e, t, i);
	}
	moveVertically(e, t, i) {
		return ka(
			this,
			e,
			(function (e, t, i, n) {
				let r = t.head,
					s = i ? 1 : -1;
				if (r == (i ? e.state.doc.length : 0)) return _n.cursor(r, t.assoc);
				let o,
					a = t.goalColumn,
					l = e.contentDOM.getBoundingClientRect(),
					h = e.coordsAtPos(r, t.assoc || -1),
					c = e.documentTop;
				if (h)
					null == a && (a = h.left - l.left), (o = s < 0 ? h.top : h.bottom);
				else {
					let t = e.viewState.lineBlockAt(r);
					null == a &&
						(a = Math.min(
							l.right - l.left,
							e.defaultCharacterWidth * (r - t.from),
						)),
						(o = (s < 0 ? t.top : t.bottom) + c);
				}
				let u = l.left + a,
					f = null != n ? n : e.viewState.heightOracle.textHeight >> 1;
				for (let t = 0; ; t += 10) {
					let i = o + (f + t) * s,
						n = ba(e, { x: u, y: i }, !1, s);
					if (i < l.top || i > l.bottom || (s < 0 ? n < r : n > r)) {
						let t = e.docView.coordsForChar(n),
							r = !t || i < t.top ? -1 : 1;
						return _n.cursor(n, r, void 0, a);
					}
				}
			})(this, e, t, i),
		);
	}
	domAtPos(e) {
		return this.docView.domAtPos(e);
	}
	posAtDOM(e, t = 0) {
		return this.docView.posFromDOM(e, t);
	}
	posAtCoords(e, t = !0) {
		return this.readMeasured(), ba(this, e, t);
	}
	coordsAtPos(e, t = 1) {
		this.readMeasured();
		let i = this.docView.coordsAt(e, t);
		if (!i || i.left == i.right) return i;
		let n = this.state.doc.lineAt(e),
			r = this.bidiSpans(n);
		return ss(i, (r[yo.find(r, e - n.from, -1, t)].dir == co.LTR) == t > 0);
	}
	coordsForChar(e) {
		return this.readMeasured(), this.docView.coordsForChar(e);
	}
	get defaultCharacterWidth() {
		return this.viewState.heightOracle.charWidth;
	}
	get defaultLineHeight() {
		return this.viewState.heightOracle.lineHeight;
	}
	get textDirection() {
		return this.viewState.defaultTextDirection;
	}
	textDirectionAt(e) {
		return !this.state.facet(Vo) ||
			e < this.viewport.from ||
			e > this.viewport.to
			? this.textDirection
			: (this.readMeasured(), this.docView.textDirectionAt(e));
	}
	get lineWrapping() {
		return this.viewState.heightOracle.lineWrapping;
	}
	bidiSpans(e) {
		if (e.length > Nl) return $o(e.length);
		let t,
			i = this.textDirectionAt(e.from);
		for (let n of this.bidiCache)
			if (
				n.from == e.from &&
				n.dir == i &&
				(n.fresh || Qo(n.isolates, (t = na(this, e))))
			)
				return n.order;
		t || (t = na(this, e));
		let n = (function (e, t, i) {
			if (!e) return [new yo(0, 0, t == fo ? 1 : 0)];
			if (t == uo && !i.length && !So.test(e)) return $o(e.length);
			if (i.length) for (; e.length > wo.length; ) wo[wo.length] = 256;
			let n = [],
				r = t == uo ? 0 : 1;
			return vo(e, r, r, i, 0, e.length, n), n;
		})(e.text, i, t);
		return this.bidiCache.push(new Fl(e.from, e.to, i, t, !0, n)), n;
	}
	get hasFocus() {
		var e;
		return (
			(this.dom.ownerDocument.hasFocus() ||
				(js.safari &&
					(null === (e = this.inputState) || void 0 === e
						? void 0
						: e.lastContextMenu) >
						Date.now() - 3e4)) &&
			this.root.activeElement == this.contentDOM
		);
	}
	focus() {
		this.observer.ignore(() => {
			us(this.contentDOM), this.docView.updateSelection();
		});
	}
	setRoot(e) {
		this._root != e &&
			((this._root = e),
			this.observer.setWindow(
				(9 == e.nodeType ? e : e.ownerDocument).defaultView || window,
			),
			this.mountStyles());
	}
	destroy() {
		this.root.activeElement == this.contentDOM && this.contentDOM.blur();
		for (let e of this.plugins) e.destroy(this);
		(this.plugins = []),
			this.inputState.destroy(),
			this.docView.destroy(),
			this.dom.remove(),
			this.observer.destroy(),
			this.measureScheduled > -1 &&
				this.win.cancelAnimationFrame(this.measureScheduled),
			(this.destroyed = !0);
	}
	static scrollIntoView(e, t = {}) {
		return Yo.of(
			new zo(
				"number" == typeof e ? _n.cursor(e) : e,
				t.y,
				t.x,
				t.yMargin,
				t.xMargin,
			),
		);
	}
	scrollSnapshot() {
		let { scrollTop: e, scrollLeft: t } = this.scrollDOM,
			i = this.viewState.scrollAnchorAt(e);
		return Yo.of(new zo(_n.cursor(i.from), "start", "start", i.top - e, t, !0));
	}
	setTabFocusMode(e) {
		null == e
			? (this.inputState.tabFocusMode =
					this.inputState.tabFocusMode < 0 ? 0 : -1)
			: "boolean" == typeof e
				? (this.inputState.tabFocusMode = e ? 0 : -1)
				: 0 != this.inputState.tabFocusMode &&
					(this.inputState.tabFocusMode = Date.now() + e);
	}
	static domEventHandlers(e) {
		return No.define(() => ({}), { eventHandlers: e });
	}
	static domEventObservers(e) {
		return No.define(() => ({}), { eventObservers: e });
	}
	static theme(e, t) {
		let i = Wr.newName(),
			n = [Rl.of(i), oa.of(Ll(`.${i}`, e))];
		return t && t.dark && n.push(Ml.of(!0)), n;
	}
	static baseTheme(e) {
		return Bn.lowest(oa.of(Ll("." + jl, e, Vl)));
	}
	static findFromDOM(e) {
		var t;
		let i = e.querySelector(".cm-content"),
			n = (i && Ss.get(i)) || Ss.get(e);
		return (
			(null === (t = null == n ? void 0 : n.rootView) || void 0 === t
				? void 0
				: t.view) || null
		);
	}
}
(Gl.styleModule = oa),
	(Gl.inputHandler = Mo),
	(Gl.clipboardInputFilter = Eo),
	(Gl.clipboardOutputFilter = qo),
	(Gl.scrollHandler = Wo),
	(Gl.focusChangeEffect = jo),
	(Gl.perLineTextDirection = Vo),
	(Gl.exceptionSink = Co),
	(Gl.updateListener = Ro),
	(Gl.editable = Io),
	(Gl.mouseSelectionStyle = Ao),
	(Gl.dragMovesSelection = Xo),
	(Gl.clickAddsSelectionRange = To),
	(Gl.decorations = Jo),
	(Gl.outerDecorations = ea),
	(Gl.atomicRanges = ta),
	(Gl.bidiIsolatedRanges = ia),
	(Gl.scrollMargins = ra),
	(Gl.darkTheme = Ml),
	(Gl.cspNonce = An.define({ combine: (e) => (e.length ? e[0] : "") })),
	(Gl.contentAttributes = Ko),
	(Gl.editorAttributes = Fo),
	(Gl.lineWrapping = Gl.contentAttributes.of({ class: "cm-lineWrapping" })),
	(Gl.announce = lr.define());
const Nl = 4096,
	Hl = {};
class Fl {
	constructor(e, t, i, n, r, s) {
		(this.from = e),
			(this.to = t),
			(this.dir = i),
			(this.isolates = n),
			(this.fresh = r),
			(this.order = s);
	}
	static update(e, t) {
		if (t.empty && !e.some((e) => e.fresh)) return e;
		let i = [],
			n = e.length ? e[e.length - 1].dir : co.LTR;
		for (let r = Math.max(0, e.length - 10); r < e.length; r++) {
			let s = e[r];
			s.dir != n ||
				t.touchesRange(s.from, s.to) ||
				i.push(
					new Fl(
						t.mapPos(s.from, 1),
						t.mapPos(s.to, -1),
						s.dir,
						s.isolates,
						!1,
						s.order,
					),
				);
		}
		return i;
	}
}
function Kl(e, t, i) {
	for (let n = e.state.facet(t), r = n.length - 1; r >= 0; r--) {
		let t = n[r],
			s = "function" == typeof t ? t(e) : t;
		s && Bs(s, i);
	}
	return i;
}
const Jl = js.mac ? "mac" : js.windows ? "win" : js.linux ? "linux" : "key";
function eh(e, t, i) {
	return (
		t.altKey && (e = "Alt-" + e),
		t.ctrlKey && (e = "Ctrl-" + e),
		t.metaKey && (e = "Meta-" + e),
		!1 !== i && t.shiftKey && (e = "Shift-" + e),
		e
	);
}
const th = Bn.default(
		Gl.domEventHandlers({
			keydown: (e, t) =>
				(function (e, t, i, n) {
					oh = t;
					let r = (function (e) {
							var t =
								(!(
									(Ir && e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey) ||
									(Ur && e.shiftKey && e.key && 1 == e.key.length) ||
									"Unidentified" == e.key
								) &&
									e.key) ||
								(e.shiftKey ? Br : Dr)[e.keyCode] ||
								e.key ||
								"Unidentified";
							return (
								"Esc" == t && (t = "Escape"),
								"Del" == t && (t = "Delete"),
								"Left" == t && (t = "ArrowLeft"),
								"Up" == t && (t = "ArrowUp"),
								"Right" == t && (t = "ArrowRight"),
								"Down" == t && (t = "ArrowDown"),
								t
							);
						})(t),
						s = (function (e, t) {
							let i = e.charCodeAt(t);
							if (((n = i), !(n >= 55296 && n < 56320 && t + 1 != e.length)))
								return i;
							var n;
							let r = e.charCodeAt(t + 1);
							return (function (e) {
								return e >= 56320 && e < 57344;
							})(r)
								? r - 56320 + ((i - 55296) << 10) + 65536
								: i;
						})(r, 0),
						o =
							(function (e) {
								return e < 65536 ? 1 : 2;
							})(s) == r.length && " " != r,
						a = "",
						l = !1,
						h = !1,
						c = !1;
					rh &&
						rh.view == i &&
						rh.scope == n &&
						((a = rh.prefix + " "),
						Ea.indexOf(t.keyCode) < 0 && ((h = !0), (rh = null)));
					let u,
						f,
						O = new Set(),
						d = (e) => {
							if (e) {
								for (let t of e.run)
									if (!O.has(t) && (O.add(t), t(i)))
										return e.stopPropagation && (c = !0), !0;
								e.preventDefault && (e.stopPropagation && (c = !0), (h = !0));
							}
							return !1;
						},
						p = e[n];
					p &&
						(d(p[a + eh(r, t, !o)])
							? (l = !0)
							: o &&
									(t.altKey || t.metaKey || t.ctrlKey) &&
									!(js.windows && t.ctrlKey && t.altKey) &&
									(u = Dr[t.keyCode]) &&
									u != r
								? (d(p[a + eh(u, t, !0)]) ||
										(t.shiftKey &&
											(f = Br[t.keyCode]) != r &&
											f != u &&
											d(p[a + eh(f, t, !1)]))) &&
									(l = !0)
								: o && t.shiftKey && d(p[a + eh(r, t, !0)]) && (l = !0),
						!l && d(p._any) && (l = !0));
					h && (l = !0);
					l && c && t.stopPropagation();
					return (oh = null), l;
				})(
					(function (e) {
						let t = e.facet(ih),
							i = nh.get(t);
						i ||
							nh.set(
								t,
								(i = (function (e, t = Jl) {
									let i = Object.create(null),
										n = Object.create(null),
										r = (e, t) => {
											let i = n[e];
											if (null == i) n[e] = t;
											else if (i != t)
												throw new Error(
													"Key binding " +
														e +
														" is used both as a regular binding and as a multi-stroke prefix",
												);
										},
										s = (e, n, s, o, a) => {
											var l, h;
											let c = i[e] || (i[e] = Object.create(null)),
												u = n.split(/ (?!$)/).map((e) =>
													(function (e, t) {
														const i = e.split(/-(?!$)/);
														let n,
															r,
															s,
															o,
															a = i[i.length - 1];
														"Space" == a && (a = " ");
														for (let e = 0; e < i.length - 1; ++e) {
															const a = i[e];
															if (/^(cmd|meta|m)$/i.test(a)) o = !0;
															else if (/^a(lt)?$/i.test(a)) n = !0;
															else if (/^(c|ctrl|control)$/i.test(a)) r = !0;
															else if (/^s(hift)?$/i.test(a)) s = !0;
															else {
																if (!/^mod$/i.test(a))
																	throw new Error(
																		"Unrecognized modifier name: " + a,
																	);
																"mac" == t ? (o = !0) : (r = !0);
															}
														}
														return (
															n && (a = "Alt-" + a),
															r && (a = "Ctrl-" + a),
															o && (a = "Meta-" + a),
															s && (a = "Shift-" + a),
															a
														);
													})(e, t),
												);
											for (let t = 1; t < u.length; t++) {
												let i = u.slice(0, t).join(" ");
												r(i, !0),
													c[i] ||
														(c[i] = {
															preventDefault: !0,
															stopPropagation: !1,
															run: [
																(t) => {
																	let n = (rh = {
																		view: t,
																		prefix: i,
																		scope: e,
																	});
																	return (
																		setTimeout(() => {
																			rh == n && (rh = null);
																		}, sh),
																		!0
																	);
																},
															],
														});
											}
											let f = u.join(" ");
											r(f, !1);
											let O =
												c[f] ||
												(c[f] = {
													preventDefault: !1,
													stopPropagation: !1,
													run:
														(null ===
															(h =
																null === (l = c._any) || void 0 === l
																	? void 0
																	: l.run) || void 0 === h
															? void 0
															: h.slice()) || [],
												});
											s && O.run.push(s),
												o && (O.preventDefault = !0),
												a && (O.stopPropagation = !0);
										};
									for (let n of e) {
										let e = n.scope ? n.scope.split(" ") : ["editor"];
										if (n.any)
											for (let t of e) {
												let e = i[t] || (i[t] = Object.create(null));
												e._any ||
													(e._any = {
														preventDefault: !1,
														stopPropagation: !1,
														run: [],
													});
												let { any: r } = n;
												for (let t in e) e[t].run.push((e) => r(e, oh));
											}
										let r = n[t] || n.key;
										if (r)
											for (let t of e)
												s(t, r, n.run, n.preventDefault, n.stopPropagation),
													n.shift &&
														s(
															t,
															"Shift-" + r,
															n.shift,
															n.preventDefault,
															n.stopPropagation,
														);
									}
									return i;
								})(t.reduce((e, t) => e.concat(t), []))),
							);
						return i;
					})(t.state),
					e,
					t,
					"editor",
				),
		}),
	),
	ih = An.define({ enables: th }),
	nh = new WeakMap();
let rh = null;
const sh = 4e3;
let oh = null;
class ah extends yr {
	compare(e) {
		return this == e || (this.constructor == e.constructor && this.eq(e));
	}
	eq(e) {
		return !1;
	}
	destroy(e) {}
}
(ah.prototype.elementClass = ""),
	(ah.prototype.toDOM = void 0),
	(ah.prototype.mapMode = bn.TrackBefore),
	(ah.prototype.startSide = ah.prototype.endSide = -1),
	(ah.prototype.point = !0);
const lh = 1024;
let hh = 0;
class ch {
	constructor(e, t) {
		(this.from = e), (this.to = t);
	}
}
class uh {
	constructor(e = {}) {
		(this.id = hh++),
			(this.perNode = !!e.perNode),
			(this.deserialize =
				e.deserialize ||
				(() => {
					throw new Error(
						"This node type doesn't define a deserialize function",
					);
				}));
	}
	add(e) {
		if (this.perNode)
			throw new RangeError("Can't add per-node props to node types");
		return (
			"function" != typeof e && (e = dh.match(e)),
			(t) => {
				let i = e(t);
				return void 0 === i ? null : [this, i];
			}
		);
	}
}
(uh.closedBy = new uh({ deserialize: (e) => e.split(" ") })),
	(uh.openedBy = new uh({ deserialize: (e) => e.split(" ") })),
	(uh.group = new uh({ deserialize: (e) => e.split(" ") })),
	(uh.isolate = new uh({
		deserialize: (e) => {
			if (e && "rtl" != e && "ltr" != e && "auto" != e)
				throw new RangeError("Invalid value for isolate: " + e);
			return e || "auto";
		},
	})),
	(uh.contextHash = new uh({ perNode: !0 })),
	(uh.lookAhead = new uh({ perNode: !0 })),
	(uh.mounted = new uh({ perNode: !0 }));
class fh {
	constructor(e, t, i) {
		(this.tree = e), (this.overlay = t), (this.parser = i);
	}
	static get(e) {
		return e && e.props && e.props[uh.mounted.id];
	}
}
const Oh = Object.create(null);
class dh {
	constructor(e, t, i, n = 0) {
		(this.name = e), (this.props = t), (this.id = i), (this.flags = n);
	}
	static define(e) {
		let t = e.props && e.props.length ? Object.create(null) : Oh,
			i =
				(e.top ? 1 : 0) |
				(e.skipped ? 2 : 0) |
				(e.error ? 4 : 0) |
				(null == e.name ? 8 : 0),
			n = new dh(e.name || "", t, e.id, i);
		if (e.props)
			for (let i of e.props)
				if ((Array.isArray(i) || (i = i(n)), i)) {
					if (i[0].perNode)
						throw new RangeError("Can't store a per-node prop on a node type");
					t[i[0].id] = i[1];
				}
		return n;
	}
	prop(e) {
		return this.props[e.id];
	}
	get isTop() {
		return (1 & this.flags) > 0;
	}
	get isSkipped() {
		return (2 & this.flags) > 0;
	}
	get isError() {
		return (4 & this.flags) > 0;
	}
	get isAnonymous() {
		return (8 & this.flags) > 0;
	}
	is(e) {
		if ("string" == typeof e) {
			if (this.name == e) return !0;
			let t = this.prop(uh.group);
			return !!t && t.indexOf(e) > -1;
		}
		return this.id == e;
	}
	static match(e) {
		let t = Object.create(null);
		for (let i in e) for (let n of i.split(" ")) t[n] = e[i];
		return (e) => {
			for (let i = e.prop(uh.group), n = -1; n < (i ? i.length : 0); n++) {
				let r = t[n < 0 ? e.name : i[n]];
				if (r) return r;
			}
		};
	}
}
dh.none = new dh("", Object.create(null), 0, 8);
class ph {
	constructor(e) {
		this.types = e;
		for (let t = 0; t < e.length; t++)
			if (e[t].id != t)
				throw new RangeError(
					"Node type ids should correspond to array positions when creating a node set",
				);
	}
	extend(...e) {
		let t = [];
		for (let i of this.types) {
			let n = null;
			for (let t of e) {
				let e = t(i);
				e && (n || (n = Object.assign({}, i.props)), (n[e[0].id] = e[1]));
			}
			t.push(n ? new dh(i.name, n, i.id, i.flags) : i);
		}
		return new ph(t);
	}
}
const mh = new WeakMap(),
	gh = new WeakMap();
var xh;
!(function (e) {
	(e[(e.ExcludeBuffers = 1)] = "ExcludeBuffers"),
		(e[(e.IncludeAnonymous = 2)] = "IncludeAnonymous"),
		(e[(e.IgnoreMounts = 4)] = "IgnoreMounts"),
		(e[(e.IgnoreOverlays = 8)] = "IgnoreOverlays");
})(xh || (xh = {}));
class bh {
	constructor(e, t, i, n, r) {
		if (
			((this.type = e),
			(this.children = t),
			(this.positions = i),
			(this.length = n),
			(this.props = null),
			r && r.length)
		) {
			this.props = Object.create(null);
			for (let [e, t] of r) this.props["number" == typeof e ? e : e.id] = t;
		}
	}
	toString() {
		let e = fh.get(this);
		if (e && !e.overlay) return e.tree.toString();
		let t = "";
		for (let e of this.children) {
			let i = e.toString();
			i && (t && (t += ","), (t += i));
		}
		return this.type.name
			? (/\W/.test(this.type.name) && !this.type.isError
					? JSON.stringify(this.type.name)
					: this.type.name) + (t.length ? "(" + t + ")" : "")
			: t;
	}
	cursor(e = 0) {
		return new Ah(this.topNode, e);
	}
	cursorAt(e, t = 0, i = 0) {
		let n = mh.get(this) || this.topNode,
			r = new Ah(n);
		return r.moveTo(e, t), mh.set(this, r._tree), r;
	}
	get topNode() {
		return new vh(this, 0, 0, null);
	}
	resolve(e, t = 0) {
		let i = wh(mh.get(this) || this.topNode, e, t, !1);
		return mh.set(this, i), i;
	}
	resolveInner(e, t = 0) {
		let i = wh(gh.get(this) || this.topNode, e, t, !0);
		return gh.set(this, i), i;
	}
	resolveStack(e, t = 0) {
		return (function (e, t, i) {
			let n = e.resolveInner(t, i),
				r = null;
			for (let e = n instanceof vh ? n : n.context.parent; e; e = e.parent)
				if (e.index < 0) {
					let s = e.parent;
					(r || (r = [n])).push(s.resolve(t, i)), (e = s);
				} else {
					let s = fh.get(e.tree);
					if (
						s &&
						s.overlay &&
						s.overlay[0].from <= t &&
						s.overlay[s.overlay.length - 1].to >= t
					) {
						let o = new vh(s.tree, s.overlay[0].from + e.from, -1, e);
						(r || (r = [n])).push(wh(o, t, i, !1));
					}
				}
			return r ? Th(r) : n;
		})(this, e, t);
	}
	iterate(e) {
		let { enter: t, leave: i, from: n = 0, to: r = this.length } = e,
			s = e.mode || 0,
			o = (s & xh.IncludeAnonymous) > 0;
		for (let e = this.cursor(s | xh.IncludeAnonymous); ; ) {
			let s = !1;
			if (
				e.from <= r &&
				e.to >= n &&
				((!o && e.type.isAnonymous) || !1 !== t(e))
			) {
				if (e.firstChild()) continue;
				s = !0;
			}
			for (; s && i && (o || !e.type.isAnonymous) && i(e), !e.nextSibling(); ) {
				if (!e.parent()) return;
				s = !0;
			}
		}
	}
	prop(e) {
		return e.perNode
			? this.props
				? this.props[e.id]
				: void 0
			: this.type.prop(e);
	}
	get propValues() {
		let e = [];
		if (this.props) for (let t in this.props) e.push([+t, this.props[t]]);
		return e;
	}
	balance(e = {}) {
		return this.children.length <= 8
			? this
			: jh(
					dh.none,
					this.children,
					this.positions,
					0,
					this.children.length,
					0,
					this.length,
					(e, t, i) => new bh(this.type, e, t, i, this.propValues),
					e.makeTree || ((e, t, i) => new bh(dh.none, e, t, i)),
				);
	}
	static build(e) {
		return (function (e) {
			var t;
			let {
					buffer: i,
					nodeSet: n,
					maxBufferLength: r = lh,
					reused: s = [],
					minRepeatType: o = n.types.length,
				} = e,
				a = Array.isArray(i) ? new Sh(i, i.length) : i,
				l = n.types,
				h = 0,
				c = 0;
			function u(e, t, i, x, b, S) {
				let { id: y, start: Q, end: w, size: k } = a,
					v = c,
					$ = h;
				for (; k < 0; ) {
					if ((a.next(), -1 == k)) {
						let t = s[y];
						return i.push(t), void x.push(Q - e);
					}
					if (-3 == k) return void (h = y);
					if (-4 == k) return void (c = y);
					throw new RangeError(`Unrecognized record size: ${k}`);
				}
				let P,
					Z,
					_ = l[y],
					T = Q - e;
				if (w - Q <= r && (Z = m(a.pos - t, b))) {
					let t = new Uint16Array(Z.size - Z.skip),
						i = a.pos - Z.size,
						r = t.length;
					for (; a.pos > i; ) r = g(Z.start, t, r);
					(P = new yh(t, w - Z.start, n)), (T = Z.start - e);
				} else {
					let e = a.pos - k;
					a.next();
					let t = [],
						i = [],
						n = y >= o ? y : -1,
						s = 0,
						l = w;
					for (; a.pos > e; )
						n >= 0 && a.id == n && a.size >= 0
							? (a.end <= l - r &&
									(d(t, i, Q, s, a.end, l, n, v, $),
									(s = t.length),
									(l = a.end)),
								a.next())
							: S > 2500
								? f(Q, e, t, i)
								: u(Q, e, t, i, n, S + 1);
					if (
						(n >= 0 && s > 0 && s < t.length && d(t, i, Q, s, Q, l, n, v, $),
						t.reverse(),
						i.reverse(),
						n > -1 && s > 0)
					) {
						let e = O(_, $);
						P = jh(_, t, i, 0, t.length, 0, w - Q, e, e);
					} else P = p(_, t, i, w - Q, v - w, $);
				}
				i.push(P), x.push(T);
			}
			function f(e, t, i, s) {
				let o = [],
					l = 0,
					h = -1;
				for (; a.pos > t; ) {
					let { id: e, start: t, end: i, size: n } = a;
					if (n > 4) a.next();
					else {
						if (h > -1 && t < h) break;
						h < 0 && (h = i - r), o.push(e, t, i), l++, a.next();
					}
				}
				if (l) {
					let t = new Uint16Array(4 * l),
						r = o[o.length - 2];
					for (let e = o.length - 3, i = 0; e >= 0; e -= 3)
						(t[i++] = o[e]),
							(t[i++] = o[e + 1] - r),
							(t[i++] = o[e + 2] - r),
							(t[i++] = i);
					i.push(new yh(t, o[2] - r, n)), s.push(r - e);
				}
			}
			function O(e, t) {
				return (i, n, r) => {
					let s,
						o,
						a = 0,
						l = i.length - 1;
					if (l >= 0 && (s = i[l]) instanceof bh) {
						if (!l && s.type == e && s.length == r) return s;
						(o = s.prop(uh.lookAhead)) && (a = n[l] + s.length + o);
					}
					return p(e, i, n, r, a, t);
				};
			}
			function d(e, t, i, r, s, o, a, l, h) {
				let c = [],
					u = [];
				for (; e.length > r; ) c.push(e.pop()), u.push(t.pop() + i - s);
				e.push(p(n.types[a], c, u, o - s, l - o, h)), t.push(s - i);
			}
			function p(e, t, i, n, r, s, o) {
				if (s) {
					let e = [uh.contextHash, s];
					o = o ? [e].concat(o) : [e];
				}
				if (r > 25) {
					let e = [uh.lookAhead, r];
					o = o ? [e].concat(o) : [e];
				}
				return new bh(e, t, i, n, o);
			}
			function m(e, t) {
				let i = a.fork(),
					n = 0,
					s = 0,
					l = 0,
					h = i.end - r,
					c = { size: 0, start: 0, skip: 0 };
				e: for (let r = i.pos - e; i.pos > r; ) {
					let e = i.size;
					if (i.id == t && e >= 0) {
						(c.size = n),
							(c.start = s),
							(c.skip = l),
							(l += 4),
							(n += 4),
							i.next();
						continue;
					}
					let a = i.pos - e;
					if (e < 0 || a < r || i.start < h) break;
					let u = i.id >= o ? 4 : 0,
						f = i.start;
					for (i.next(); i.pos > a; ) {
						if (i.size < 0) {
							if (-3 != i.size) break e;
							u += 4;
						} else i.id >= o && (u += 4);
						i.next();
					}
					(s = f), (n += e), (l += u);
				}
				return (
					(t < 0 || n == e) && ((c.size = n), (c.start = s), (c.skip = l)),
					c.size > 4 ? c : void 0
				);
			}
			function g(e, t, i) {
				let { id: n, start: r, end: s, size: l } = a;
				if ((a.next(), l >= 0 && n < o)) {
					let o = i;
					if (l > 4) {
						let n = a.pos - (l - 4);
						for (; a.pos > n; ) i = g(e, t, i);
					}
					(t[--i] = o), (t[--i] = s - e), (t[--i] = r - e), (t[--i] = n);
				} else -3 == l ? (h = n) : -4 == l && (c = n);
				return i;
			}
			let x = [],
				b = [];
			for (; a.pos > 0; ) u(e.start || 0, e.bufferStart || 0, x, b, -1, 0);
			let S =
				null !== (t = e.length) && void 0 !== t
					? t
					: x.length
						? b[0] + x[0].length
						: 0;
			return new bh(l[e.topID], x.reverse(), b.reverse(), S);
		})(e);
	}
}
bh.empty = new bh(dh.none, [], [], 0);
class Sh {
	constructor(e, t) {
		(this.buffer = e), (this.index = t);
	}
	get id() {
		return this.buffer[this.index - 4];
	}
	get start() {
		return this.buffer[this.index - 3];
	}
	get end() {
		return this.buffer[this.index - 2];
	}
	get size() {
		return this.buffer[this.index - 1];
	}
	get pos() {
		return this.index;
	}
	next() {
		this.index -= 4;
	}
	fork() {
		return new Sh(this.buffer, this.index);
	}
}
class yh {
	constructor(e, t, i) {
		(this.buffer = e), (this.length = t), (this.set = i);
	}
	get type() {
		return dh.none;
	}
	toString() {
		let e = [];
		for (let t = 0; t < this.buffer.length; )
			e.push(this.childString(t)), (t = this.buffer[t + 3]);
		return e.join(",");
	}
	childString(e) {
		let t = this.buffer[e],
			i = this.buffer[e + 3],
			n = this.set.types[t],
			r = n.name;
		if ((/\W/.test(r) && !n.isError && (r = JSON.stringify(r)), i == (e += 4)))
			return r;
		let s = [];
		for (; e < i; ) s.push(this.childString(e)), (e = this.buffer[e + 3]);
		return r + "(" + s.join(",") + ")";
	}
	findChild(e, t, i, n, r) {
		let { buffer: s } = this,
			o = -1;
		for (
			let a = e;
			a != t && !(Qh(r, n, s[a + 1], s[a + 2]) && ((o = a), i > 0));
			a = s[a + 3]
		);
		return o;
	}
	slice(e, t, i) {
		let n = this.buffer,
			r = new Uint16Array(t - e),
			s = 0;
		for (let o = e, a = 0; o < t; ) {
			(r[a++] = n[o++]), (r[a++] = n[o++] - i);
			let t = (r[a++] = n[o++] - i);
			(r[a++] = n[o++] - e), (s = Math.max(s, t));
		}
		return new yh(r, s, this.set);
	}
}
function Qh(e, t, i, n) {
	switch (e) {
		case -2:
			return i < t;
		case -1:
			return n >= t && i < t;
		case 0:
			return i < t && n > t;
		case 1:
			return i <= t && n > t;
		case 2:
			return n > t;
		case 4:
			return !0;
	}
}
function wh(e, t, i, n) {
	for (
		var r;
		e.from == e.to ||
		(i < 1 ? e.from >= t : e.from > t) ||
		(i > -1 ? e.to <= t : e.to < t);
	) {
		let t = !n && e instanceof vh && e.index < 0 ? null : e.parent;
		if (!t) return e;
		e = t;
	}
	let s = n ? 0 : xh.IgnoreOverlays;
	if (n)
		for (let n = e, o = n.parent; o; n = o, o = n.parent)
			n instanceof vh &&
				n.index < 0 &&
				(null === (r = o.enter(t, i, s)) || void 0 === r ? void 0 : r.from) !=
					n.from &&
				(e = o);
	for (;;) {
		let n = e.enter(t, i, s);
		if (!n) return e;
		e = n;
	}
}
class kh {
	cursor(e = 0) {
		return new Ah(this, e);
	}
	getChild(e, t = null, i = null) {
		let n = $h(this, e, t, i);
		return n.length ? n[0] : null;
	}
	getChildren(e, t = null, i = null) {
		return $h(this, e, t, i);
	}
	resolve(e, t = 0) {
		return wh(this, e, t, !1);
	}
	resolveInner(e, t = 0) {
		return wh(this, e, t, !0);
	}
	matchContext(e) {
		return Ph(this.parent, e);
	}
	enterUnfinishedNodesBefore(e) {
		let t = this.childBefore(e),
			i = this;
		for (; t; ) {
			let e = t.lastChild;
			if (!e || e.to != t.to) break;
			e.type.isError && e.from == e.to
				? ((i = t), (t = e.prevSibling))
				: (t = e);
		}
		return i;
	}
	get node() {
		return this;
	}
	get next() {
		return this.parent;
	}
}
class vh extends kh {
	constructor(e, t, i, n) {
		super(),
			(this._tree = e),
			(this.from = t),
			(this.index = i),
			(this._parent = n);
	}
	get type() {
		return this._tree.type;
	}
	get name() {
		return this._tree.type.name;
	}
	get to() {
		return this.from + this._tree.length;
	}
	nextChild(e, t, i, n, r = 0) {
		for (let s = this; ; ) {
			for (
				let { children: o, positions: a } = s._tree, l = t > 0 ? o.length : -1;
				e != l;
				e += t
			) {
				let l = o[e],
					h = a[e] + s.from;
				if (Qh(n, i, h, h + l.length))
					if (l instanceof yh) {
						if (r & xh.ExcludeBuffers) continue;
						let o = l.findChild(0, l.buffer.length, t, i - h, n);
						if (o > -1) return new _h(new Zh(s, l, e, h), null, o);
					} else if (r & xh.IncludeAnonymous || !l.type.isAnonymous || Ch(l)) {
						let o;
						if (!(r & xh.IgnoreMounts) && (o = fh.get(l)) && !o.overlay)
							return new vh(o.tree, h, e, s);
						let a = new vh(l, h, e, s);
						return r & xh.IncludeAnonymous || !a.type.isAnonymous
							? a
							: a.nextChild(t < 0 ? l.children.length - 1 : 0, t, i, n);
					}
			}
			if (r & xh.IncludeAnonymous || !s.type.isAnonymous) return null;
			if (
				((e =
					s.index >= 0
						? s.index + t
						: t < 0
							? -1
							: s._parent._tree.children.length),
				(s = s._parent),
				!s)
			)
				return null;
		}
	}
	get firstChild() {
		return this.nextChild(0, 1, 0, 4);
	}
	get lastChild() {
		return this.nextChild(this._tree.children.length - 1, -1, 0, 4);
	}
	childAfter(e) {
		return this.nextChild(0, 1, e, 2);
	}
	childBefore(e) {
		return this.nextChild(this._tree.children.length - 1, -1, e, -2);
	}
	enter(e, t, i = 0) {
		let n;
		if (!(i & xh.IgnoreOverlays) && (n = fh.get(this._tree)) && n.overlay) {
			let i = e - this.from;
			for (let { from: e, to: r } of n.overlay)
				if ((t > 0 ? e <= i : e < i) && (t < 0 ? r >= i : r > i))
					return new vh(n.tree, n.overlay[0].from + this.from, -1, this);
		}
		return this.nextChild(0, 1, e, t, i);
	}
	nextSignificantParent() {
		let e = this;
		for (; e.type.isAnonymous && e._parent; ) e = e._parent;
		return e;
	}
	get parent() {
		return this._parent ? this._parent.nextSignificantParent() : null;
	}
	get nextSibling() {
		return this._parent && this.index >= 0
			? this._parent.nextChild(this.index + 1, 1, 0, 4)
			: null;
	}
	get prevSibling() {
		return this._parent && this.index >= 0
			? this._parent.nextChild(this.index - 1, -1, 0, 4)
			: null;
	}
	get tree() {
		return this._tree;
	}
	toTree() {
		return this._tree;
	}
	toString() {
		return this._tree.toString();
	}
}
function $h(e, t, i, n) {
	let r = e.cursor(),
		s = [];
	if (!r.firstChild()) return s;
	if (null != i)
		for (let e = !1; !e; ) if (((e = r.type.is(i)), !r.nextSibling())) return s;
	for (;;) {
		if (null != n && r.type.is(n)) return s;
		if ((r.type.is(t) && s.push(r.node), !r.nextSibling()))
			return null == n ? s : [];
	}
}
function Ph(e, t, i = t.length - 1) {
	for (let n = e; i >= 0; n = n.parent) {
		if (!n) return !1;
		if (!n.type.isAnonymous) {
			if (t[i] && t[i] != n.name) return !1;
			i--;
		}
	}
	return !0;
}
class Zh {
	constructor(e, t, i, n) {
		(this.parent = e), (this.buffer = t), (this.index = i), (this.start = n);
	}
}
class _h extends kh {
	get name() {
		return this.type.name;
	}
	get from() {
		return this.context.start + this.context.buffer.buffer[this.index + 1];
	}
	get to() {
		return this.context.start + this.context.buffer.buffer[this.index + 2];
	}
	constructor(e, t, i) {
		super(),
			(this.context = e),
			(this._parent = t),
			(this.index = i),
			(this.type = e.buffer.set.types[e.buffer.buffer[i]]);
	}
	child(e, t, i) {
		let { buffer: n } = this.context,
			r = n.findChild(
				this.index + 4,
				n.buffer[this.index + 3],
				e,
				t - this.context.start,
				i,
			);
		return r < 0 ? null : new _h(this.context, this, r);
	}
	get firstChild() {
		return this.child(1, 0, 4);
	}
	get lastChild() {
		return this.child(-1, 0, 4);
	}
	childAfter(e) {
		return this.child(1, e, 2);
	}
	childBefore(e) {
		return this.child(-1, e, -2);
	}
	enter(e, t, i = 0) {
		if (i & xh.ExcludeBuffers) return null;
		let { buffer: n } = this.context,
			r = n.findChild(
				this.index + 4,
				n.buffer[this.index + 3],
				t > 0 ? 1 : -1,
				e - this.context.start,
				t,
			);
		return r < 0 ? null : new _h(this.context, this, r);
	}
	get parent() {
		return this._parent || this.context.parent.nextSignificantParent();
	}
	externalSibling(e) {
		return this._parent
			? null
			: this.context.parent.nextChild(this.context.index + e, e, 0, 4);
	}
	get nextSibling() {
		let { buffer: e } = this.context,
			t = e.buffer[this.index + 3];
		return t <
			(this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length)
			? new _h(this.context, this._parent, t)
			: this.externalSibling(1);
	}
	get prevSibling() {
		let { buffer: e } = this.context,
			t = this._parent ? this._parent.index + 4 : 0;
		return this.index == t
			? this.externalSibling(-1)
			: new _h(
					this.context,
					this._parent,
					e.findChild(t, this.index, -1, 0, 4),
				);
	}
	get tree() {
		return null;
	}
	toTree() {
		let e = [],
			t = [],
			{ buffer: i } = this.context,
			n = this.index + 4,
			r = i.buffer[this.index + 3];
		if (r > n) {
			let s = i.buffer[this.index + 1];
			e.push(i.slice(n, r, s)), t.push(0);
		}
		return new bh(this.type, e, t, this.to - this.from);
	}
	toString() {
		return this.context.buffer.childString(this.index);
	}
}
function Th(e) {
	if (!e.length) return null;
	let t = 0,
		i = e[0];
	for (let n = 1; n < e.length; n++) {
		let r = e[n];
		(r.from > i.from || r.to < i.to) && ((i = r), (t = n));
	}
	let n = i instanceof vh && i.index < 0 ? null : i.parent,
		r = e.slice();
	return n ? (r[t] = n) : r.splice(t, 1), new Xh(r, i);
}
class Xh {
	constructor(e, t) {
		(this.heads = e), (this.node = t);
	}
	get next() {
		return Th(this.heads);
	}
}
class Ah {
	get name() {
		return this.type.name;
	}
	constructor(e, t = 0) {
		if (
			((this.mode = t),
			(this.buffer = null),
			(this.stack = []),
			(this.index = 0),
			(this.bufferNode = null),
			e instanceof vh)
		)
			this.yieldNode(e);
		else {
			(this._tree = e.context.parent), (this.buffer = e.context);
			for (let t = e._parent; t; t = t._parent) this.stack.unshift(t.index);
			(this.bufferNode = e), this.yieldBuf(e.index);
		}
	}
	yieldNode(e) {
		return (
			!!e &&
			((this._tree = e),
			(this.type = e.type),
			(this.from = e.from),
			(this.to = e.to),
			!0)
		);
	}
	yieldBuf(e, t) {
		this.index = e;
		let { start: i, buffer: n } = this.buffer;
		return (
			(this.type = t || n.set.types[n.buffer[e]]),
			(this.from = i + n.buffer[e + 1]),
			(this.to = i + n.buffer[e + 2]),
			!0
		);
	}
	yield(e) {
		return (
			!!e &&
			(e instanceof vh
				? ((this.buffer = null), this.yieldNode(e))
				: ((this.buffer = e.context), this.yieldBuf(e.index, e.type)))
		);
	}
	toString() {
		return this.buffer
			? this.buffer.buffer.childString(this.index)
			: this._tree.toString();
	}
	enterChild(e, t, i) {
		if (!this.buffer)
			return this.yield(
				this._tree.nextChild(
					e < 0 ? this._tree._tree.children.length - 1 : 0,
					e,
					t,
					i,
					this.mode,
				),
			);
		let { buffer: n } = this.buffer,
			r = n.findChild(
				this.index + 4,
				n.buffer[this.index + 3],
				e,
				t - this.buffer.start,
				i,
			);
		return !(r < 0) && (this.stack.push(this.index), this.yieldBuf(r));
	}
	firstChild() {
		return this.enterChild(1, 0, 4);
	}
	lastChild() {
		return this.enterChild(-1, 0, 4);
	}
	childAfter(e) {
		return this.enterChild(1, e, 2);
	}
	childBefore(e) {
		return this.enterChild(-1, e, -2);
	}
	enter(e, t, i = this.mode) {
		return this.buffer
			? !(i & xh.ExcludeBuffers) && this.enterChild(1, e, t)
			: this.yield(this._tree.enter(e, t, i));
	}
	parent() {
		if (!this.buffer)
			return this.yieldNode(
				this.mode & xh.IncludeAnonymous
					? this._tree._parent
					: this._tree.parent,
			);
		if (this.stack.length) return this.yieldBuf(this.stack.pop());
		let e =
			this.mode & xh.IncludeAnonymous
				? this.buffer.parent
				: this.buffer.parent.nextSignificantParent();
		return (this.buffer = null), this.yieldNode(e);
	}
	sibling(e) {
		if (!this.buffer)
			return (
				!!this._tree._parent &&
				this.yield(
					this._tree.index < 0
						? null
						: this._tree._parent.nextChild(
								this._tree.index + e,
								e,
								0,
								4,
								this.mode,
							),
				)
			);
		let { buffer: t } = this.buffer,
			i = this.stack.length - 1;
		if (e < 0) {
			let e = i < 0 ? 0 : this.stack[i] + 4;
			if (this.index != e)
				return this.yieldBuf(t.findChild(e, this.index, -1, 0, 4));
		} else {
			let e = t.buffer[this.index + 3];
			if (e < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
				return this.yieldBuf(e);
		}
		return (
			i < 0 &&
			this.yield(
				this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode),
			)
		);
	}
	nextSibling() {
		return this.sibling(1);
	}
	prevSibling() {
		return this.sibling(-1);
	}
	atLastNode(e) {
		let t,
			i,
			{ buffer: n } = this;
		if (n) {
			if (e > 0) {
				if (this.index < n.buffer.buffer.length) return !1;
			} else
				for (let e = 0; e < this.index; e++)
					if (n.buffer.buffer[e + 3] < this.index) return !1;
			({ index: t, parent: i } = n);
		} else ({ index: t, _parent: i } = this._tree);
		for (; i; { index: t, _parent: i } = i)
			if (t > -1)
				for (
					let n = t + e, r = e < 0 ? -1 : i._tree.children.length;
					n != r;
					n += e
				) {
					let e = i._tree.children[n];
					if (
						this.mode & xh.IncludeAnonymous ||
						e instanceof yh ||
						!e.type.isAnonymous ||
						Ch(e)
					)
						return !1;
				}
		return !0;
	}
	move(e, t) {
		if (t && this.enterChild(e, 0, 4)) return !0;
		for (;;) {
			if (this.sibling(e)) return !0;
			if (this.atLastNode(e) || !this.parent()) return !1;
		}
	}
	next(e = !0) {
		return this.move(1, e);
	}
	prev(e = !0) {
		return this.move(-1, e);
	}
	moveTo(e, t = 0) {
		for (
			;
			(this.from == this.to ||
				(t < 1 ? this.from >= e : this.from > e) ||
				(t > -1 ? this.to <= e : this.to < e)) &&
			this.parent();
		);
		for (; this.enterChild(1, e, t); );
		return this;
	}
	get node() {
		if (!this.buffer) return this._tree;
		let e = this.bufferNode,
			t = null,
			i = 0;
		if (e && e.context == this.buffer)
			e: for (let n = this.index, r = this.stack.length; r >= 0; ) {
				for (let s = e; s; s = s._parent)
					if (s.index == n) {
						if (n == this.index) return s;
						(t = s), (i = r + 1);
						break e;
					}
				n = this.stack[--r];
			}
		for (let e = i; e < this.stack.length; e++)
			t = new _h(this.buffer, t, this.stack[e]);
		return (this.bufferNode = new _h(this.buffer, t, this.index));
	}
	get tree() {
		return this.buffer ? null : this._tree._tree;
	}
	iterate(e, t) {
		for (let i = 0; ; ) {
			let n = !1;
			if (this.type.isAnonymous || !1 !== e(this)) {
				if (this.firstChild()) {
					i++;
					continue;
				}
				this.type.isAnonymous || (n = !0);
			}
			for (;;) {
				if ((n && t && t(this), (n = this.type.isAnonymous), !i)) return;
				if (this.nextSibling()) break;
				this.parent(), i--, (n = !0);
			}
		}
	}
	matchContext(e) {
		if (!this.buffer) return Ph(this.node.parent, e);
		let { buffer: t } = this.buffer,
			{ types: i } = t.set;
		for (let n = e.length - 1, r = this.stack.length - 1; n >= 0; r--) {
			if (r < 0) return Ph(this._tree, e, n);
			let s = i[t.buffer[this.stack[r]]];
			if (!s.isAnonymous) {
				if (e[n] && e[n] != s.name) return !1;
				n--;
			}
		}
		return !0;
	}
}
function Ch(e) {
	return e.children.some(
		(e) => e instanceof yh || !e.type.isAnonymous || Ch(e),
	);
}
const Rh = new WeakMap();
function Mh(e, t) {
	if (!e.isAnonymous || t instanceof yh || t.type != e) return 1;
	let i = Rh.get(t);
	if (null == i) {
		i = 1;
		for (let n of t.children) {
			if (n.type != e || !(n instanceof bh)) {
				i = 1;
				break;
			}
			i += Mh(e, n);
		}
		Rh.set(t, i);
	}
	return i;
}
function jh(e, t, i, n, r, s, o, a, l) {
	let h = 0;
	for (let i = n; i < r; i++) h += Mh(e, t[i]);
	let c = Math.ceil((1.5 * h) / 8),
		u = [],
		f = [];
	return (
		(function t(i, n, r, o, a) {
			for (let h = r; h < o; ) {
				let r = h,
					O = n[h],
					d = Mh(e, i[h]);
				for (h++; h < o; h++) {
					let t = Mh(e, i[h]);
					if (d + t >= c) break;
					d += t;
				}
				if (h == r + 1) {
					if (d > c) {
						let e = i[r];
						t(e.children, e.positions, 0, e.children.length, n[r] + a);
						continue;
					}
					u.push(i[r]);
				} else {
					let t = n[h - 1] + i[h - 1].length - O;
					u.push(jh(e, i, n, r, h, O, t, null, l));
				}
				f.push(O + a - s);
			}
		})(t, i, n, r, 0),
		(a || l)(u, f, o)
	);
}
class Eh {
	constructor() {
		this.map = new WeakMap();
	}
	setBuffer(e, t, i) {
		let n = this.map.get(e);
		n || this.map.set(e, (n = new Map())), n.set(t, i);
	}
	getBuffer(e, t) {
		let i = this.map.get(e);
		return i && i.get(t);
	}
	set(e, t) {
		e instanceof _h
			? this.setBuffer(e.context.buffer, e.index, t)
			: e instanceof vh && this.map.set(e.tree, t);
	}
	get(e) {
		return e instanceof _h
			? this.getBuffer(e.context.buffer, e.index)
			: e instanceof vh
				? this.map.get(e.tree)
				: void 0;
	}
	cursorSet(e, t) {
		e.buffer
			? this.setBuffer(e.buffer.buffer, e.index, t)
			: this.map.set(e.tree, t);
	}
	cursorGet(e) {
		return e.buffer
			? this.getBuffer(e.buffer.buffer, e.index)
			: this.map.get(e.tree);
	}
}
class qh {
	constructor(e, t, i, n, r = !1, s = !1) {
		(this.from = e),
			(this.to = t),
			(this.tree = i),
			(this.offset = n),
			(this.open = (r ? 1 : 0) | (s ? 2 : 0));
	}
	get openStart() {
		return (1 & this.open) > 0;
	}
	get openEnd() {
		return (2 & this.open) > 0;
	}
	static addTree(e, t = [], i = !1) {
		let n = [new qh(0, e.length, e, 0, !1, i)];
		for (let i of t) i.to > e.length && n.push(i);
		return n;
	}
	static applyChanges(e, t, i = 128) {
		if (!t.length) return e;
		let n = [],
			r = 1,
			s = e.length ? e[0] : null;
		for (let o = 0, a = 0, l = 0; ; o++) {
			let h = o < t.length ? t[o] : null,
				c = h ? h.fromA : 1e9;
			if (c - a >= i)
				for (; s && s.from < c; ) {
					let t = s;
					if (a >= t.from || c <= t.to || l) {
						let e = Math.max(t.from, a) - l,
							i = Math.min(t.to, c) - l;
						t = e >= i ? null : new qh(e, i, t.tree, t.offset + l, o > 0, !!h);
					}
					if ((t && n.push(t), s.to > c)) break;
					s = r < e.length ? e[r++] : null;
				}
			if (!h) break;
			(a = h.toA), (l = h.toA - h.toB);
		}
		return n;
	}
}
class Vh {
	startParse(e, t, i) {
		return (
			"string" == typeof e && (e = new Lh(e)),
			(i = i
				? i.length
					? i.map((e) => new ch(e.from, e.to))
					: [new ch(0, 0)]
				: [new ch(0, e.length)]),
			this.createParse(e, t || [], i)
		);
	}
	parse(e, t, i) {
		let n = this.startParse(e, t, i);
		for (;;) {
			let e = n.advance();
			if (e) return e;
		}
	}
}
class Lh {
	constructor(e) {
		this.string = e;
	}
	get length() {
		return this.string.length;
	}
	chunk(e) {
		return this.string.slice(e);
	}
	get lineChunks() {
		return !1;
	}
	read(e, t) {
		return this.string.slice(e, t);
	}
}
function Wh(e) {
	return (t, i, n, r) => new Ih(t, e, i, n, r);
}
class zh {
	constructor(e, t, i, n, r) {
		(this.parser = e),
			(this.parse = t),
			(this.overlay = i),
			(this.target = n),
			(this.from = r);
	}
}
function Yh(e) {
	if (!e.length || e.some((e) => e.from >= e.to))
		throw new RangeError(
			"Invalid inner parse ranges given: " + JSON.stringify(e),
		);
}
class Dh {
	constructor(e, t, i, n, r, s, o) {
		(this.parser = e),
			(this.predicate = t),
			(this.mounts = i),
			(this.index = n),
			(this.start = r),
			(this.target = s),
			(this.prev = o),
			(this.depth = 0),
			(this.ranges = []);
	}
}
const Bh = new uh({ perNode: !0 });
class Ih {
	constructor(e, t, i, n, r) {
		(this.nest = t),
			(this.input = i),
			(this.fragments = n),
			(this.ranges = r),
			(this.inner = []),
			(this.innerDone = 0),
			(this.baseTree = null),
			(this.stoppedAt = null),
			(this.baseParse = e);
	}
	advance() {
		if (this.baseParse) {
			let e = this.baseParse.advance();
			if (!e) return null;
			if (
				((this.baseParse = null),
				(this.baseTree = e),
				this.startInner(),
				null != this.stoppedAt)
			)
				for (let e of this.inner) e.parse.stopAt(this.stoppedAt);
		}
		if (this.innerDone == this.inner.length) {
			let e = this.baseTree;
			return (
				null != this.stoppedAt &&
					(e = new bh(
						e.type,
						e.children,
						e.positions,
						e.length,
						e.propValues.concat([[Bh, this.stoppedAt]]),
					)),
				e
			);
		}
		let e = this.inner[this.innerDone],
			t = e.parse.advance();
		if (t) {
			this.innerDone++;
			let i = Object.assign(Object.create(null), e.target.props);
			(i[uh.mounted.id] = new fh(t, e.overlay, e.parser)), (e.target.props = i);
		}
		return null;
	}
	get parsedPos() {
		if (this.baseParse) return 0;
		let e = this.input.length;
		for (let t = this.innerDone; t < this.inner.length; t++)
			this.inner[t].from < e &&
				(e = Math.min(e, this.inner[t].parse.parsedPos));
		return e;
	}
	stopAt(e) {
		if (((this.stoppedAt = e), this.baseParse)) this.baseParse.stopAt(e);
		else
			for (let t = this.innerDone; t < this.inner.length; t++)
				this.inner[t].parse.stopAt(e);
	}
	startInner() {
		let e = new Fh(this.fragments),
			t = null,
			i = null,
			n = new Ah(
				new vh(this.baseTree, this.ranges[0].from, 0, null),
				xh.IncludeAnonymous | xh.IgnoreMounts,
			);
		e: for (let r, s; ; ) {
			let o,
				a = !0;
			if (null != this.stoppedAt && n.from >= this.stoppedAt) a = !1;
			else if (e.hasNode(n)) {
				if (t) {
					let e = t.mounts.find(
						(e) =>
							e.frag.from <= n.from && e.frag.to >= n.to && e.mount.overlay,
					);
					if (e)
						for (let i of e.mount.overlay) {
							let r = i.from + e.pos,
								s = i.to + e.pos;
							r >= n.from &&
								s <= n.to &&
								!t.ranges.some((e) => e.from < s && e.to > r) &&
								t.ranges.push({ from: r, to: s });
						}
				}
				a = !1;
			} else if (i && (s = Uh(i.ranges, n.from, n.to))) a = 2 != s;
			else if (
				!n.type.isAnonymous &&
				(r = this.nest(n, this.input)) &&
				(n.from < n.to || !r.overlay)
			) {
				n.tree || Nh(n);
				let s = e.findMounts(n.from, r.parser);
				if ("function" == typeof r.overlay)
					t = new Dh(
						r.parser,
						r.overlay,
						s,
						this.inner.length,
						n.from,
						n.tree,
						t,
					);
				else {
					let e = Kh(
						this.ranges,
						r.overlay || (n.from < n.to ? [new ch(n.from, n.to)] : []),
					);
					e.length && Yh(e),
						(!e.length && r.overlay) ||
							this.inner.push(
								new zh(
									r.parser,
									e.length
										? r.parser.startParse(this.input, ec(s, e), e)
										: r.parser.startParse(""),
									r.overlay
										? r.overlay.map(
												(e) => new ch(e.from - n.from, e.to - n.from),
											)
										: null,
									n.tree,
									e.length ? e[0].from : n.from,
								),
							),
						r.overlay
							? e.length && (i = { ranges: e, depth: 0, prev: i })
							: (a = !1);
				}
			} else if (
				t &&
				(o = t.predicate(n)) &&
				(!0 === o && (o = new ch(n.from, n.to)), o.from < o.to)
			) {
				let e = t.ranges.length - 1;
				e >= 0 && t.ranges[e].to == o.from
					? (t.ranges[e] = { from: t.ranges[e].from, to: o.to })
					: t.ranges.push(o);
			}
			if (a && n.firstChild()) t && t.depth++, i && i.depth++;
			else
				for (; !n.nextSibling(); ) {
					if (!n.parent()) break e;
					if (t && !--t.depth) {
						let e = Kh(this.ranges, t.ranges);
						e.length &&
							(Yh(e),
							this.inner.splice(
								t.index,
								0,
								new zh(
									t.parser,
									t.parser.startParse(this.input, ec(t.mounts, e), e),
									t.ranges.map((e) => new ch(e.from - t.start, e.to - t.start)),
									t.target,
									e[0].from,
								),
							)),
							(t = t.prev);
					}
					i && !--i.depth && (i = i.prev);
				}
		}
	}
}
function Uh(e, t, i) {
	for (let n of e) {
		if (n.from >= i) break;
		if (n.to > t) return n.from <= t && n.to >= i ? 2 : 1;
	}
	return 0;
}
function Gh(e, t, i, n, r, s) {
	if (t < i) {
		let o = e.buffer[t + 1];
		n.push(e.slice(t, i, o)), r.push(o - s);
	}
}
function Nh(e) {
	let { node: t } = e,
		i = [],
		n = t.context.buffer;
	do {
		i.push(e.index), e.parent();
	} while (!e.tree);
	let r = e.tree,
		s = r.children.indexOf(n),
		o = r.children[s],
		a = o.buffer,
		l = [s];
	r.children[s] = (function e(n, r, s, h, c, u) {
		let f = i[u],
			O = [],
			d = [];
		Gh(o, n, f, O, d, h);
		let p = a[f + 1],
			m = a[f + 2];
		l.push(O.length);
		let g = u
			? e(f + 4, a[f + 3], o.set.types[a[f]], p, m - p, u - 1)
			: t.toTree();
		return (
			O.push(g), d.push(p - h), Gh(o, a[f + 3], r, O, d, h), new bh(s, O, d, c)
		);
	})(0, a.length, dh.none, 0, o.length, i.length - 1);
	for (let t of l) {
		let i = e.tree.children[t],
			n = e.tree.positions[t];
		e.yield(new vh(i, n + e.from, t, e._tree));
	}
}
class Hh {
	constructor(e, t) {
		(this.offset = t),
			(this.done = !1),
			(this.cursor = e.cursor(xh.IncludeAnonymous | xh.IgnoreMounts));
	}
	moveTo(e) {
		let { cursor: t } = this,
			i = e - this.offset;
		for (; !this.done && t.from < i; )
			(t.to >= e && t.enter(i, 1, xh.IgnoreOverlays | xh.ExcludeBuffers)) ||
				t.next(!1) ||
				(this.done = !0);
	}
	hasNode(e) {
		if (
			(this.moveTo(e.from),
			!this.done &&
				this.cursor.from + this.offset == e.from &&
				this.cursor.tree)
		)
			for (let t = this.cursor.tree; ; ) {
				if (t == e.tree) return !0;
				if (
					!(
						t.children.length &&
						0 == t.positions[0] &&
						t.children[0] instanceof bh
					)
				)
					break;
				t = t.children[0];
			}
		return !1;
	}
}
let Fh = class {
	constructor(e) {
		var t;
		if (((this.fragments = e), (this.curTo = 0), (this.fragI = 0), e.length)) {
			let i = (this.curFrag = e[0]);
			(this.curTo = null !== (t = i.tree.prop(Bh)) && void 0 !== t ? t : i.to),
				(this.inner = new Hh(i.tree, -i.offset));
		} else this.curFrag = this.inner = null;
	}
	hasNode(e) {
		for (; this.curFrag && e.from >= this.curTo; ) this.nextFrag();
		return (
			this.curFrag &&
			this.curFrag.from <= e.from &&
			this.curTo >= e.to &&
			this.inner.hasNode(e)
		);
	}
	nextFrag() {
		var e;
		if ((this.fragI++, this.fragI == this.fragments.length))
			this.curFrag = this.inner = null;
		else {
			let t = (this.curFrag = this.fragments[this.fragI]);
			(this.curTo = null !== (e = t.tree.prop(Bh)) && void 0 !== e ? e : t.to),
				(this.inner = new Hh(t.tree, -t.offset));
		}
	}
	findMounts(e, t) {
		var i;
		let n = [];
		if (this.inner) {
			this.inner.cursor.moveTo(e, 1);
			for (let e = this.inner.cursor.node; e; e = e.parent) {
				let r =
					null === (i = e.tree) || void 0 === i ? void 0 : i.prop(uh.mounted);
				if (r && r.parser == t)
					for (let t = this.fragI; t < this.fragments.length; t++) {
						let i = this.fragments[t];
						if (i.from >= e.to) break;
						i.tree == this.curFrag.tree &&
							n.push({ frag: i, pos: e.from - i.offset, mount: r });
					}
			}
		}
		return n;
	}
};
function Kh(e, t) {
	let i = null,
		n = t;
	for (let r = 1, s = 0; r < e.length; r++) {
		let o = e[r - 1].to,
			a = e[r].from;
		for (; s < n.length; s++) {
			let e = n[s];
			if (e.from >= a) break;
			e.to <= o ||
				(i || (n = i = t.slice()),
				e.from < o
					? ((i[s] = new ch(e.from, o)),
						e.to > a && i.splice(s + 1, 0, new ch(a, e.to)))
					: e.to > a
						? (i[s--] = new ch(a, e.to))
						: i.splice(s--, 1));
		}
	}
	return n;
}
function Jh(e, t, i, n) {
	let r = 0,
		s = 0,
		o = !1,
		a = !1,
		l = -1e9,
		h = [];
	for (;;) {
		let c = r == e.length ? 1e9 : o ? e[r].to : e[r].from,
			u = s == t.length ? 1e9 : a ? t[s].to : t[s].from;
		if (o != a) {
			let e = Math.max(l, i),
				t = Math.min(c, u, n);
			e < t && h.push(new ch(e, t));
		}
		if (((l = Math.min(c, u)), 1e9 == l)) break;
		c == l && (o ? ((o = !1), r++) : (o = !0)),
			u == l && (a ? ((a = !1), s++) : (a = !0));
	}
	return h;
}
function ec(e, t) {
	let i = [];
	for (let { pos: n, mount: r, frag: s } of e) {
		let e = n + (r.overlay ? r.overlay[0].from : 0),
			o = e + r.tree.length,
			a = Math.max(s.from, e),
			l = Math.min(s.to, o);
		if (r.overlay) {
			let o = Jh(
				t,
				r.overlay.map((e) => new ch(e.from + n, e.to + n)),
				a,
				l,
			);
			for (let t = 0, n = a; ; t++) {
				let a = t == o.length,
					h = a ? l : o[t].from;
				if (
					(h > n &&
						i.push(
							new qh(
								n,
								h,
								r.tree,
								-e,
								s.from >= n || s.openStart,
								s.to <= h || s.openEnd,
							),
						),
					a)
				)
					break;
				n = o[t].to;
			}
		} else
			i.push(
				new qh(
					a,
					l,
					r.tree,
					-e,
					s.from >= e || s.openStart,
					s.to <= o || s.openEnd,
				),
			);
	}
	return i;
}
let tc = 0;
class ic {
	constructor(e, t, i, n) {
		(this.name = e),
			(this.set = t),
			(this.base = i),
			(this.modified = n),
			(this.id = tc++);
	}
	toString() {
		let { name: e } = this;
		for (let t of this.modified) t.name && (e = `${t.name}(${e})`);
		return e;
	}
	static define(e, t) {
		let i = "string" == typeof e ? e : "?";
		if ((e instanceof ic && (t = e), null == t ? void 0 : t.base))
			throw new Error("Can not derive from a modified tag");
		let n = new ic(i, [], null, []);
		if ((n.set.push(n), t)) for (let e of t.set) n.set.push(e);
		return n;
	}
	static defineModifier(e) {
		let t = new rc(e);
		return (e) =>
			e.modified.indexOf(t) > -1
				? e
				: rc.get(
						e.base || e,
						e.modified.concat(t).sort((e, t) => e.id - t.id),
					);
	}
}
let nc = 0;
class rc {
	constructor(e) {
		(this.name = e), (this.instances = []), (this.id = nc++);
	}
	static get(e, t) {
		if (!t.length) return e;
		let i = t[0].instances.find((i) => {
			return (
				i.base == e &&
				((n = t),
				(r = i.modified),
				n.length == r.length && n.every((e, t) => e == r[t]))
			);
			var n, r;
		});
		if (i) return i;
		let n = [],
			r = new ic(e.name, n, e, t);
		for (let e of t) e.instances.push(r);
		let s = (function (e) {
			let t = [[]];
			for (let i = 0; i < e.length; i++)
				for (let n = 0, r = t.length; n < r; n++) t.push(t[n].concat(e[i]));
			return t.sort((e, t) => t.length - e.length);
		})(t);
		for (let t of e.set)
			if (!t.modified.length) for (let e of s) n.push(rc.get(t, e));
		return r;
	}
}
function sc(e) {
	let t = Object.create(null);
	for (let i in e) {
		let n = e[i];
		Array.isArray(n) || (n = [n]);
		for (let e of i.split(" "))
			if (e) {
				let i = [],
					r = 2,
					s = e;
				for (let t = 0; ; ) {
					if ("..." == s && t > 0 && t + 3 == e.length) {
						r = 1;
						break;
					}
					let n = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(s);
					if (!n) throw new RangeError("Invalid path: " + e);
					if (
						(i.push(
							"*" == n[0] ? "" : '"' == n[0][0] ? JSON.parse(n[0]) : n[0],
						),
						(t += n[0].length),
						t == e.length)
					)
						break;
					let o = e[t++];
					if (t == e.length && "!" == o) {
						r = 0;
						break;
					}
					if ("/" != o) throw new RangeError("Invalid path: " + e);
					s = e.slice(t);
				}
				let o = i.length - 1,
					a = i[o];
				if (!a) throw new RangeError("Invalid path: " + e);
				let l = new ac(n, r, o > 0 ? i.slice(0, o) : null);
				t[a] = l.sort(t[a]);
			}
	}
	return oc.add(t);
}
const oc = new uh();
class ac {
	constructor(e, t, i, n) {
		(this.tags = e), (this.mode = t), (this.context = i), (this.next = n);
	}
	get opaque() {
		return 0 == this.mode;
	}
	get inherit() {
		return 1 == this.mode;
	}
	sort(e) {
		return !e || e.depth < this.depth
			? ((this.next = e), this)
			: ((e.next = this.sort(e.next)), e);
	}
	get depth() {
		return this.context ? this.context.length : 0;
	}
}
ac.empty = new ac([], 2, null);
const lc = ic.define,
	hc = lc(),
	cc = lc(),
	uc = lc(cc),
	fc = lc(cc),
	Oc = lc(),
	dc = lc(Oc),
	pc = lc(Oc),
	mc = lc(),
	gc = lc(mc),
	xc = lc(),
	bc = lc(),
	Sc = lc(),
	yc = lc(Sc),
	Qc = lc(),
	wc = {
		comment: hc,
		lineComment: lc(hc),
		blockComment: lc(hc),
		docComment: lc(hc),
		name: cc,
		variableName: lc(cc),
		typeName: uc,
		tagName: lc(uc),
		propertyName: fc,
		attributeName: lc(fc),
		className: lc(cc),
		labelName: lc(cc),
		namespace: lc(cc),
		macroName: lc(cc),
		literal: Oc,
		string: dc,
		docString: lc(dc),
		character: lc(dc),
		attributeValue: lc(dc),
		number: pc,
		integer: lc(pc),
		float: lc(pc),
		bool: lc(Oc),
		regexp: lc(Oc),
		escape: lc(Oc),
		color: lc(Oc),
		url: lc(Oc),
		keyword: xc,
		self: lc(xc),
		null: lc(xc),
		atom: lc(xc),
		unit: lc(xc),
		modifier: lc(xc),
		operatorKeyword: lc(xc),
		controlKeyword: lc(xc),
		definitionKeyword: lc(xc),
		moduleKeyword: lc(xc),
		operator: bc,
		derefOperator: lc(bc),
		arithmeticOperator: lc(bc),
		logicOperator: lc(bc),
		bitwiseOperator: lc(bc),
		compareOperator: lc(bc),
		updateOperator: lc(bc),
		definitionOperator: lc(bc),
		typeOperator: lc(bc),
		controlOperator: lc(bc),
		punctuation: Sc,
		separator: lc(Sc),
		bracket: yc,
		angleBracket: lc(yc),
		squareBracket: lc(yc),
		paren: lc(yc),
		brace: lc(yc),
		content: mc,
		heading: gc,
		heading1: lc(gc),
		heading2: lc(gc),
		heading3: lc(gc),
		heading4: lc(gc),
		heading5: lc(gc),
		heading6: lc(gc),
		contentSeparator: lc(mc),
		list: lc(mc),
		quote: lc(mc),
		emphasis: lc(mc),
		strong: lc(mc),
		link: lc(mc),
		monospace: lc(mc),
		strikethrough: lc(mc),
		inserted: lc(),
		deleted: lc(),
		changed: lc(),
		invalid: lc(),
		meta: Qc,
		documentMeta: lc(Qc),
		annotation: lc(Qc),
		processingInstruction: lc(Qc),
		definition: ic.defineModifier("definition"),
		constant: ic.defineModifier("constant"),
		function: ic.defineModifier("function"),
		standard: ic.defineModifier("standard"),
		local: ic.defineModifier("local"),
		special: ic.defineModifier("special"),
	};
for (let e in wc) {
	let t = wc[e];
	t instanceof ic && (t.name = e);
}
var kc;
!(function (e) {
	let t = Object.create(null);
	for (let i of e)
		if (Array.isArray(i.tag)) for (let e of i.tag) t[e.id] = i.class;
		else t[i.tag.id] = i.class;
	let { scope: i, all: n = null } = {};
})([
	{ tag: wc.link, class: "tok-link" },
	{ tag: wc.heading, class: "tok-heading" },
	{ tag: wc.emphasis, class: "tok-emphasis" },
	{ tag: wc.strong, class: "tok-strong" },
	{ tag: wc.keyword, class: "tok-keyword" },
	{ tag: wc.atom, class: "tok-atom" },
	{ tag: wc.bool, class: "tok-bool" },
	{ tag: wc.url, class: "tok-url" },
	{ tag: wc.labelName, class: "tok-labelName" },
	{ tag: wc.inserted, class: "tok-inserted" },
	{ tag: wc.deleted, class: "tok-deleted" },
	{ tag: wc.literal, class: "tok-literal" },
	{ tag: wc.string, class: "tok-string" },
	{ tag: wc.number, class: "tok-number" },
	{ tag: [wc.regexp, wc.escape, wc.special(wc.string)], class: "tok-string2" },
	{ tag: wc.variableName, class: "tok-variableName" },
	{ tag: wc.local(wc.variableName), class: "tok-variableName tok-local" },
	{
		tag: wc.definition(wc.variableName),
		class: "tok-variableName tok-definition",
	},
	{ tag: wc.special(wc.variableName), class: "tok-variableName2" },
	{
		tag: wc.definition(wc.propertyName),
		class: "tok-propertyName tok-definition",
	},
	{ tag: wc.typeName, class: "tok-typeName" },
	{ tag: wc.namespace, class: "tok-namespace" },
	{ tag: wc.className, class: "tok-className" },
	{ tag: wc.macroName, class: "tok-macroName" },
	{ tag: wc.propertyName, class: "tok-propertyName" },
	{ tag: wc.operator, class: "tok-operator" },
	{ tag: wc.comment, class: "tok-comment" },
	{ tag: wc.meta, class: "tok-meta" },
	{ tag: wc.invalid, class: "tok-invalid" },
	{ tag: wc.punctuation, class: "tok-punctuation" },
]);
const vc = new uh();
function $c(e) {
	return An.define({ combine: e ? (t) => t.concat(e) : void 0 });
}
const Pc = new uh();
class Zc {
	constructor(e, t, i = [], n = "") {
		(this.data = e),
			(this.name = n),
			Sr.prototype.hasOwnProperty("tree") ||
				Object.defineProperty(Sr.prototype, "tree", {
					get() {
						return Xc(this);
					},
				}),
			(this.parser = t),
			(this.extension = [
				Lc.of(this),
				Sr.languageData.of((e, t, i) => {
					let n = _c(e, t, i),
						r = n.type.prop(vc);
					if (!r) return [];
					let s = e.facet(r),
						o = n.type.prop(Pc);
					if (o) {
						let r = n.resolve(t - n.from, i);
						for (let t of o)
							if (t.test(r, e)) {
								let i = e.facet(t.facet);
								return "replace" == t.type ? i : i.concat(s);
							}
					}
					return s;
				}),
			].concat(i));
	}
	isActiveAt(e, t, i = -1) {
		return _c(e, t, i).type.prop(vc) == this.data;
	}
	findRegions(e) {
		let t = e.facet(Lc);
		if ((null == t ? void 0 : t.data) == this.data)
			return [{ from: 0, to: e.doc.length }];
		if (!t || !t.allowsNesting) return [];
		let i = [],
			n = (e, t) => {
				if (e.prop(vc) == this.data)
					return void i.push({ from: t, to: t + e.length });
				let r = e.prop(uh.mounted);
				if (r) {
					if (r.tree.prop(vc) == this.data) {
						if (r.overlay)
							for (let e of r.overlay)
								i.push({ from: e.from + t, to: e.to + t });
						else i.push({ from: t, to: t + e.length });
						return;
					}
					if (r.overlay) {
						let e = i.length;
						if ((n(r.tree, r.overlay[0].from + t), i.length > e)) return;
					}
				}
				for (let i = 0; i < e.children.length; i++) {
					let r = e.children[i];
					r instanceof bh && n(r, e.positions[i] + t);
				}
			};
		return n(Xc(e), 0), i;
	}
	get allowsNesting() {
		return !0;
	}
}
function _c(e, t, i) {
	let n = e.facet(Lc),
		r = Xc(e).topNode;
	if (!n || n.allowsNesting)
		for (let e = r; e; e = e.enter(t, i, xh.ExcludeBuffers))
			e.type.isTop && (r = e);
	return r;
}
Zc.setState = lr.define();
class Tc extends Zc {
	constructor(e, t, i) {
		super(e, t, [], i), (this.parser = t);
	}
	static define(e) {
		let t = $c(e.languageData);
		return new Tc(
			t,
			e.parser.configure({ props: [vc.add((e) => (e.isTop ? t : void 0))] }),
			e.name,
		);
	}
	configure(e, t) {
		return new Tc(this.data, this.parser.configure(e), t || this.name);
	}
	get allowsNesting() {
		return this.parser.hasWrappers();
	}
}
function Xc(e) {
	let t = e.field(Zc.state, !1);
	return t ? t.tree : bh.empty;
}
class Ac {
	constructor(e) {
		(this.doc = e),
			(this.cursorPos = 0),
			(this.string = ""),
			(this.cursor = e.iter());
	}
	get length() {
		return this.doc.length;
	}
	syncTo(e) {
		return (
			(this.string = this.cursor.next(e - this.cursorPos).value),
			(this.cursorPos = e + this.string.length),
			this.cursorPos - this.string.length
		);
	}
	chunk(e) {
		return this.syncTo(e), this.string;
	}
	get lineChunks() {
		return !0;
	}
	read(e, t) {
		let i = this.cursorPos - this.string.length;
		return e < i || t >= this.cursorPos
			? this.doc.sliceString(e, t)
			: this.string.slice(e - i, t - i);
	}
}
let Cc = null;
class Rc {
	constructor(e, t, i = [], n, r, s, o, a) {
		(this.parser = e),
			(this.state = t),
			(this.fragments = i),
			(this.tree = n),
			(this.treeLen = r),
			(this.viewport = s),
			(this.skipped = o),
			(this.scheduleOn = a),
			(this.parse = null),
			(this.tempSkipped = []);
	}
	static create(e, t, i) {
		return new Rc(e, t, [], bh.empty, 0, i, [], null);
	}
	startParse() {
		return this.parser.startParse(new Ac(this.state.doc), this.fragments);
	}
	work(e, t) {
		return (
			null != t && t >= this.state.doc.length && (t = void 0),
			this.tree != bh.empty &&
			this.isDone(null != t ? t : this.state.doc.length)
				? (this.takeTree(), !0)
				: this.withContext(() => {
						var i;
						if ("number" == typeof e) {
							let t = Date.now() + e;
							e = () => Date.now() > t;
						}
						for (
							this.parse || (this.parse = this.startParse()),
								null != t &&
									(null == this.parse.stoppedAt || this.parse.stoppedAt > t) &&
									t < this.state.doc.length &&
									this.parse.stopAt(t);
							;
						) {
							let n = this.parse.advance();
							if (n) {
								if (
									((this.fragments = this.withoutTempSkipped(
										qh.addTree(n, this.fragments, null != this.parse.stoppedAt),
									)),
									(this.treeLen =
										null !== (i = this.parse.stoppedAt) && void 0 !== i
											? i
											: this.state.doc.length),
									(this.tree = n),
									(this.parse = null),
									!(this.treeLen < (null != t ? t : this.state.doc.length)))
								)
									return !0;
								this.parse = this.startParse();
							}
							if (e()) return !1;
						}
					})
		);
	}
	takeTree() {
		let e, t;
		this.parse &&
			(e = this.parse.parsedPos) >= this.treeLen &&
			((null == this.parse.stoppedAt || this.parse.stoppedAt > e) &&
				this.parse.stopAt(e),
			this.withContext(() => {
				for (; !(t = this.parse.advance()); );
			}),
			(this.treeLen = e),
			(this.tree = t),
			(this.fragments = this.withoutTempSkipped(
				qh.addTree(this.tree, this.fragments, !0),
			)),
			(this.parse = null));
	}
	withContext(e) {
		let t = Cc;
		Cc = this;
		try {
			return e();
		} finally {
			Cc = t;
		}
	}
	withoutTempSkipped(e) {
		for (let t; (t = this.tempSkipped.pop()); ) e = Mc(e, t.from, t.to);
		return e;
	}
	changes(e, t) {
		let { fragments: i, tree: n, treeLen: r, viewport: s, skipped: o } = this;
		if ((this.takeTree(), !e.empty)) {
			let t = [];
			if (
				(e.iterChangedRanges((e, i, n, r) =>
					t.push({ fromA: e, toA: i, fromB: n, toB: r }),
				),
				(i = qh.applyChanges(i, t)),
				(n = bh.empty),
				(r = 0),
				(s = { from: e.mapPos(s.from, -1), to: e.mapPos(s.to, 1) }),
				this.skipped.length)
			) {
				o = [];
				for (let t of this.skipped) {
					let i = e.mapPos(t.from, 1),
						n = e.mapPos(t.to, -1);
					i < n && o.push({ from: i, to: n });
				}
			}
		}
		return new Rc(this.parser, t, i, n, r, s, o, this.scheduleOn);
	}
	updateViewport(e) {
		if (this.viewport.from == e.from && this.viewport.to == e.to) return !1;
		this.viewport = e;
		let t = this.skipped.length;
		for (let t = 0; t < this.skipped.length; t++) {
			let { from: i, to: n } = this.skipped[t];
			i < e.to &&
				n > e.from &&
				((this.fragments = Mc(this.fragments, i, n)),
				this.skipped.splice(t--, 1));
		}
		return !(this.skipped.length >= t) && (this.reset(), !0);
	}
	reset() {
		this.parse && (this.takeTree(), (this.parse = null));
	}
	skipUntilInView(e, t) {
		this.skipped.push({ from: e, to: t });
	}
	static getSkippingParser(e) {
		return new (class extends Vh {
			createParse(t, i, n) {
				let r = n[0].from,
					s = n[n.length - 1].to;
				return {
					parsedPos: r,
					advance() {
						let t = Cc;
						if (t) {
							for (let e of n) t.tempSkipped.push(e);
							e &&
								(t.scheduleOn = t.scheduleOn
									? Promise.all([t.scheduleOn, e])
									: e);
						}
						return (this.parsedPos = s), new bh(dh.none, [], [], s - r);
					},
					stoppedAt: null,
					stopAt() {},
				};
			}
		})();
	}
	isDone(e) {
		e = Math.min(e, this.state.doc.length);
		let t = this.fragments;
		return this.treeLen >= e && t.length && 0 == t[0].from && t[0].to >= e;
	}
	static get() {
		return Cc;
	}
}
function Mc(e, t, i) {
	return qh.applyChanges(e, [{ fromA: t, toA: i, fromB: t, toB: i }]);
}
class jc {
	constructor(e) {
		(this.context = e), (this.tree = e.tree);
	}
	apply(e) {
		if (!e.docChanged && this.tree == this.context.tree) return this;
		let t = this.context.changes(e.changes, e.state),
			i =
				this.context.treeLen == e.startState.doc.length
					? void 0
					: Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
		return t.work(20, i) || t.takeTree(), new jc(t);
	}
	static init(e) {
		let t = Math.min(3e3, e.doc.length),
			i = Rc.create(e.facet(Lc).parser, e, { from: 0, to: t });
		return i.work(20, t) || i.takeTree(), new jc(i);
	}
}
Zc.state = Vn.define({
	create: jc.init,
	update(e, t) {
		for (let e of t.effects) if (e.is(Zc.setState)) return e.value;
		return t.startState.facet(Lc) != t.state.facet(Lc)
			? jc.init(t.state)
			: e.apply(t);
	},
});
let Ec = (e) => {
	let t = setTimeout(() => e(), 500);
	return () => clearTimeout(t);
};
"undefined" != typeof requestIdleCallback &&
	(Ec = (e) => {
		let t = -1,
			i = setTimeout(() => {
				t = requestIdleCallback(e, { timeout: 400 });
			}, 100);
		return () => (t < 0 ? clearTimeout(i) : cancelIdleCallback(t));
	});
const qc =
		"undefined" != typeof navigator &&
		(null === (kc = navigator.scheduling) || void 0 === kc
			? void 0
			: kc.isInputPending)
			? () => navigator.scheduling.isInputPending()
			: null,
	Vc = No.fromClass(
		class {
			constructor(e) {
				(this.view = e),
					(this.working = null),
					(this.workScheduled = 0),
					(this.chunkEnd = -1),
					(this.chunkBudget = -1),
					(this.work = this.work.bind(this)),
					this.scheduleWork();
			}
			update(e) {
				let t = this.view.state.field(Zc.state).context;
				(t.updateViewport(e.view.viewport) ||
					this.view.viewport.to > t.treeLen) &&
					this.scheduleWork(),
					(e.docChanged || e.selectionSet) &&
						(this.view.hasFocus && (this.chunkBudget += 50),
						this.scheduleWork()),
					this.checkAsyncSchedule(t);
			}
			scheduleWork() {
				if (this.working) return;
				let { state: e } = this.view,
					t = e.field(Zc.state);
				(t.tree == t.context.tree && t.context.isDone(e.doc.length)) ||
					(this.working = Ec(this.work));
			}
			work(e) {
				this.working = null;
				let t = Date.now();
				if (
					(this.chunkEnd < t &&
						(this.chunkEnd < 0 || this.view.hasFocus) &&
						((this.chunkEnd = t + 3e4), (this.chunkBudget = 3e3)),
					this.chunkBudget <= 0)
				)
					return;
				let {
						state: i,
						viewport: { to: n },
					} = this.view,
					r = i.field(Zc.state);
				if (r.tree == r.context.tree && r.context.isDone(n + 1e5)) return;
				let s =
						Date.now() +
						Math.min(
							this.chunkBudget,
							100,
							e && !qc ? Math.max(25, e.timeRemaining() - 5) : 1e9,
						),
					o = r.context.treeLen < n && i.doc.length > n + 1e3,
					a = r.context.work(
						() => (qc && qc()) || Date.now() > s,
						n + (o ? 0 : 1e5),
					);
				(this.chunkBudget -= Date.now() - t),
					(a || this.chunkBudget <= 0) &&
						(r.context.takeTree(),
						this.view.dispatch({ effects: Zc.setState.of(new jc(r.context)) })),
					this.chunkBudget > 0 && (!a || o) && this.scheduleWork(),
					this.checkAsyncSchedule(r.context);
			}
			checkAsyncSchedule(e) {
				e.scheduleOn &&
					(this.workScheduled++,
					e.scheduleOn
						.then(() => this.scheduleWork())
						.catch((e) => Bo(this.view.state, e))
						.then(() => this.workScheduled--),
					(e.scheduleOn = null));
			}
			destroy() {
				this.working && this.working();
			}
			isWorking() {
				return !!(this.working || this.workScheduled > 0);
			}
		},
		{
			eventHandlers: {
				focus() {
					this.scheduleWork();
				},
			},
		},
	),
	Lc = An.define({
		combine: (e) => (e.length ? e[0] : null),
		enables: (e) => [
			Zc.state,
			Vc,
			Gl.contentAttributes.compute([e], (t) => {
				let i = t.facet(e);
				return i && i.name ? { "data-language": i.name } : {};
			}),
		],
	});
class Wc {
	constructor(e, t = []) {
		(this.language = e), (this.support = t), (this.extension = [e, t]);
	}
}
class zc {
	constructor(e, t, i, n, r, s = void 0) {
		(this.name = e),
			(this.alias = t),
			(this.extensions = i),
			(this.filename = n),
			(this.loadFunc = r),
			(this.support = s),
			(this.loading = null);
	}
	load() {
		return (
			this.loading ||
			(this.loading = this.loadFunc().then(
				(e) => (this.support = e),
				(e) => {
					throw ((this.loading = null), e);
				},
			))
		);
	}
	static of(e) {
		let { load: t, support: i } = e;
		if (!t) {
			if (!i)
				throw new RangeError(
					"Must pass either 'load' or 'support' to LanguageDescription.of",
				);
			t = () => Promise.resolve(i);
		}
		return new zc(
			e.name,
			(e.alias || []).concat(e.name).map((e) => e.toLowerCase()),
			e.extensions || [],
			e.filename,
			t,
			i,
		);
	}
	static matchFilename(e, t) {
		for (let i of e) if (i.filename && i.filename.test(t)) return i;
		let i = /\.([^.]+)$/.exec(t);
		if (i) for (let t of e) if (t.extensions.indexOf(i[1]) > -1) return t;
		return null;
	}
	static matchLanguageName(e, t, i = !0) {
		t = t.toLowerCase();
		for (let i of e) if (i.alias.some((e) => e == t)) return i;
		if (i)
			for (let i of e)
				for (let e of i.alias) {
					let n = t.indexOf(e);
					if (
						n > -1 &&
						(e.length > 2 ||
							(!/\w/.test(t[n - 1]) && !/\w/.test(t[n + e.length])))
					)
						return i;
				}
		return null;
	}
}
const Yc = An.define(),
	Dc = An.define({
		combine: (e) => {
			if (!e.length) return "  ";
			let t = e[0];
			if (!t || /\S/.test(t) || Array.from(t).some((e) => e != t[0]))
				throw new Error("Invalid indent unit: " + JSON.stringify(e[0]));
			return t;
		},
	});
function Bc(e) {
	let t = e.facet(Dc);
	return 9 == t.charCodeAt(0) ? e.tabSize * t.length : t.length;
}
function Ic(e, t) {
	let i = "",
		n = e.tabSize,
		r = e.facet(Dc)[0];
	if ("\t" == r) {
		for (; t >= n; ) (i += "\t"), (t -= n);
		r = " ";
	}
	for (let e = 0; e < t; e++) i += r;
	return i;
}
function Uc(e, t) {
	e instanceof Sr && (e = new Gc(e));
	for (let i of e.state.facet(Yc)) {
		let n = i(e, t);
		if (void 0 !== n) return n;
	}
	let i = Xc(e.state);
	return i.length >= t
		? (function (e, t, i) {
				let n = t.resolveStack(i),
					r = t.resolveInner(i, -1).resolve(i, 0).enterUnfinishedNodesBefore(i);
				if (r != n.node) {
					let e = [];
					for (
						let t = r;
						t && (t.from != n.node.from || t.type != n.node.type);
						t = t.parent
					)
						e.push(t);
					for (let t = e.length - 1; t >= 0; t--) n = { node: e[t], next: n };
				}
				return Hc(n, e, i);
			})(e, i, t)
		: null;
}
class Gc {
	constructor(e, t = {}) {
		(this.state = e), (this.options = t), (this.unit = Bc(e));
	}
	lineAt(e, t = 1) {
		let i = this.state.doc.lineAt(e),
			{ simulateBreak: n, simulateDoubleBreak: r } = this.options;
		return null != n && n >= i.from && n <= i.to
			? r && n == e
				? { text: "", from: e }
				: (t < 0 ? n < e : n <= e)
					? { text: i.text.slice(n - i.from), from: n }
					: { text: i.text.slice(0, n - i.from), from: i.from }
			: i;
	}
	textAfterPos(e, t = 1) {
		if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
			return "";
		let { text: i, from: n } = this.lineAt(e, t);
		return i.slice(e - n, Math.min(i.length, e + 100 - n));
	}
	column(e, t = 1) {
		let { text: i, from: n } = this.lineAt(e, t),
			r = this.countColumn(i, e - n),
			s = this.options.overrideIndentation
				? this.options.overrideIndentation(n)
				: -1;
		return s > -1 && (r += s - this.countColumn(i, i.search(/\S|$/))), r;
	}
	countColumn(e, t = e.length) {
		return Er(e, this.state.tabSize, t);
	}
	lineIndent(e, t = 1) {
		let { text: i, from: n } = this.lineAt(e, t),
			r = this.options.overrideIndentation;
		if (r) {
			let e = r(n);
			if (e > -1) return e;
		}
		return this.countColumn(i, i.search(/\S|$/));
	}
	get simulatedBreak() {
		return this.options.simulateBreak || null;
	}
}
const Nc = new uh();
function Hc(e, t, i) {
	for (let n = e; n; n = n.next) {
		let e = Fc(n.node);
		if (e) return e(Jc.create(t, i, n));
	}
	return 0;
}
function Fc(e) {
	let t = e.type.prop(Nc);
	if (t) return t;
	let i,
		n = e.firstChild;
	if (n && (i = n.type.prop(uh.closedBy))) {
		let t = e.lastChild,
			n = t && i.indexOf(t.name) > -1;
		return (e) =>
			iu(
				e,
				!0,
				1,
				void 0,
				n &&
					!(function (e) {
						return (
							e.pos == e.options.simulateBreak && e.options.simulateDoubleBreak
						);
					})(e)
					? t.from
					: void 0,
			);
	}
	return null == e.parent ? Kc : null;
}
function Kc() {
	return 0;
}
class Jc extends Gc {
	constructor(e, t, i) {
		super(e.state, e.options),
			(this.base = e),
			(this.pos = t),
			(this.context = i);
	}
	get node() {
		return this.context.node;
	}
	static create(e, t, i) {
		return new Jc(e, t, i);
	}
	get textAfter() {
		return this.textAfterPos(this.pos);
	}
	get baseIndent() {
		return this.baseIndentFor(this.node);
	}
	baseIndentFor(e) {
		let t = this.state.doc.lineAt(e.from);
		for (;;) {
			let i = e.resolve(t.from);
			for (; i.parent && i.parent.from == i.from; ) i = i.parent;
			if (eu(i, e)) break;
			t = this.state.doc.lineAt(i.from);
		}
		return this.lineIndent(t.from);
	}
	continue() {
		return Hc(this.context.next, this.base, this.pos);
	}
}
function eu(e, t) {
	for (let i = t; i; i = i.parent) if (e == i) return !0;
	return !1;
}
function tu({ closing: e, align: t = !0, units: i = 1 }) {
	return (n) => iu(n, t, i, e);
}
function iu(e, t, i, n, r) {
	let s = e.textAfter,
		o = s.match(/^\s*/)[0].length,
		a = (n && s.slice(o, o + n.length) == n) || r == e.pos + o,
		l = t
			? (function (e) {
					let t = e.node,
						i = t.childAfter(t.from),
						n = t.lastChild;
					if (!i) return null;
					let r = e.options.simulateBreak,
						s = e.state.doc.lineAt(i.from),
						o = null == r || r <= s.from ? s.to : Math.min(s.to, r);
					for (let e = i.to; ; ) {
						let r = t.childAfter(e);
						if (!r || r == n) return null;
						if (!r.type.isSkipped) {
							if (r.from >= o) return null;
							let e = /^ */.exec(s.text.slice(i.to - s.from))[0].length;
							return { from: i.from, to: i.to + e };
						}
						e = r.to;
					}
				})(e)
			: null;
	return l
		? a
			? e.column(l.from)
			: e.column(l.to)
		: e.baseIndent + (a ? 0 : e.unit * i);
}
const nu = (e) => e.baseIndent;
function ru({ except: e, units: t = 1 } = {}) {
	return (i) => {
		let n = e && e.test(i.textAfter);
		return i.baseIndent + (n ? 0 : t * i.unit);
	};
}
const su = An.define(),
	ou = new uh();
function au(e) {
	let t = e.firstChild,
		i = e.lastChild;
	return t && t.to < i.from
		? { from: t.to, to: i.type.isError ? e.to : i.from }
		: null;
}
const lu = new uh();
function hu(e, t, i) {
	let n = e.prop(t < 0 ? uh.openedBy : uh.closedBy);
	if (n) return n;
	if (1 == e.name.length) {
		let n = i.indexOf(e.name);
		if (n > -1 && n % 2 == (t < 0 ? 1 : 0)) return [i[n + t]];
	}
	return null;
}
function cu(e) {
	let t = e.type.prop(lu);
	return t ? t(e.node) : e;
}
function uu(e, t, i, n = {}) {
	let r = n.maxScanDistance || 1e4,
		s = n.brackets || "()[]{}",
		o = Xc(e),
		a = o.resolveInner(t, i);
	for (let n = a; n; n = n.parent) {
		let r = hu(n.type, i, s);
		if (r && n.from < n.to) {
			let o = cu(n);
			if (o && (i > 0 ? t >= o.from && t < o.to : t > o.from && t <= o.to))
				return fu(e, t, i, n, o, r, s);
		}
	}
	return (function (e, t, i, n, r, s, o) {
		let a = i < 0 ? e.sliceDoc(t - 1, t) : e.sliceDoc(t, t + 1),
			l = o.indexOf(a);
		if (l < 0 || (l % 2 == 0) != i > 0) return null;
		let h = { from: i < 0 ? t - 1 : t, to: i > 0 ? t + 1 : t },
			c = e.doc.iterRange(t, i > 0 ? e.doc.length : 0),
			u = 0;
		for (let e = 0; !c.next().done && e <= s; ) {
			let s = c.value;
			i < 0 && (e += s.length);
			let a = t + e * i;
			for (
				let e = i > 0 ? 0 : s.length - 1, t = i > 0 ? s.length : -1;
				e != t;
				e += i
			) {
				let t = o.indexOf(s[e]);
				if (!(t < 0 || n.resolveInner(a + e, 1).type != r))
					if ((t % 2 == 0) == i > 0) u++;
					else {
						if (1 == u)
							return {
								start: h,
								end: { from: a + e, to: a + e + 1 },
								matched: t >> 1 == l >> 1,
							};
						u--;
					}
			}
			i > 0 && (e += s.length);
		}
		return c.done ? { start: h, matched: !1 } : null;
	})(e, t, i, o, a.type, r, s);
}
function fu(e, t, i, n, r, s, o) {
	let a = n.parent,
		l = { from: r.from, to: r.to },
		h = 0,
		c = null == a ? void 0 : a.cursor();
	if (c && (i < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
		do {
			if (i < 0 ? c.to <= n.from : c.from >= n.to) {
				if (0 == h && s.indexOf(c.type.name) > -1 && c.from < c.to) {
					let e = cu(c);
					return {
						start: l,
						end: e ? { from: e.from, to: e.to } : void 0,
						matched: !0,
					};
				}
				if (hu(c.type, i, o)) h++;
				else if (hu(c.type, -i, o)) {
					if (0 == h) {
						let e = cu(c);
						return {
							start: l,
							end: e && e.from < e.to ? { from: e.from, to: e.to } : void 0,
							matched: !1,
						};
					}
					h--;
				}
			}
		} while (i < 0 ? c.prevSibling() : c.nextSibling());
	return { start: l, matched: !1 };
}
function Ou(e, t, i, n = 0, r = 0) {
	null == t && -1 == (t = e.search(/[^\s\u00a0]/)) && (t = e.length);
	let s = r;
	for (let r = n; r < t; r++) 9 == e.charCodeAt(r) ? (s += i - (s % i)) : s++;
	return s;
}
class du {
	constructor(e, t, i, n) {
		(this.string = e),
			(this.tabSize = t),
			(this.indentUnit = i),
			(this.overrideIndent = n),
			(this.pos = 0),
			(this.start = 0),
			(this.lastColumnPos = 0),
			(this.lastColumnValue = 0);
	}
	eol() {
		return this.pos >= this.string.length;
	}
	sol() {
		return 0 == this.pos;
	}
	peek() {
		return this.string.charAt(this.pos) || void 0;
	}
	next() {
		if (this.pos < this.string.length) return this.string.charAt(this.pos++);
	}
	eat(e) {
		let t,
			i = this.string.charAt(this.pos);
		if (
			((t =
				"string" == typeof e
					? i == e
					: i && (e instanceof RegExp ? e.test(i) : e(i))),
			t)
		)
			return ++this.pos, i;
	}
	eatWhile(e) {
		let t = this.pos;
		for (; this.eat(e); );
		return this.pos > t;
	}
	eatSpace() {
		let e = this.pos;
		for (; /[\s\u00a0]/.test(this.string.charAt(this.pos)); ) ++this.pos;
		return this.pos > e;
	}
	skipToEnd() {
		this.pos = this.string.length;
	}
	skipTo(e) {
		let t = this.string.indexOf(e, this.pos);
		if (t > -1) return (this.pos = t), !0;
	}
	backUp(e) {
		this.pos -= e;
	}
	column() {
		return (
			this.lastColumnPos < this.start &&
				((this.lastColumnValue = Ou(
					this.string,
					this.start,
					this.tabSize,
					this.lastColumnPos,
					this.lastColumnValue,
				)),
				(this.lastColumnPos = this.start)),
			this.lastColumnValue
		);
	}
	indentation() {
		var e;
		return null !== (e = this.overrideIndent) && void 0 !== e
			? e
			: Ou(this.string, null, this.tabSize);
	}
	match(e, t, i) {
		if ("string" == typeof e) {
			let n = (e) => (i ? e.toLowerCase() : e);
			return n(this.string.substr(this.pos, e.length)) == n(e)
				? (!1 !== t && (this.pos += e.length), !0)
				: null;
		}
		{
			let i = this.string.slice(this.pos).match(e);
			return i && i.index > 0
				? null
				: (i && !1 !== t && (this.pos += i[0].length), i);
		}
	}
	current() {
		return this.string.slice(this.start, this.pos);
	}
}
function pu(e) {
	if ("object" != typeof e) return e;
	let t = {};
	for (let i in e) {
		let n = e[i];
		t[i] = n instanceof Array ? n.slice() : n;
	}
	return t;
}
const mu = new WeakMap();
class gu extends Zc {
	constructor(e) {
		let t,
			i = $c(e.languageData),
			n = {
				name: (r = e).name || "",
				token: r.token,
				blankLine: r.blankLine || (() => {}),
				startState: r.startState || (() => !0),
				copyState: r.copyState || pu,
				indent: r.indent || (() => null),
				languageData: r.languageData || {},
				tokenTable: r.tokenTable || Qu,
				mergeTokens: !1 !== r.mergeTokens,
			};
		var r;
		super(
			i,
			new (class extends Vh {
				createParse(e, i, n) {
					return new Su(t, e, i, n);
				}
			})(),
			[],
			e.name,
		),
			(this.topNode = (function (e, t) {
				let i = dh.define({
					id: wu.length,
					name: "Document",
					props: [vc.add(() => e), Nc.add(() => (e) => t.getIndent(e))],
					top: !0,
				});
				return wu.push(i), i;
			})(i, this)),
			(t = this),
			(this.streamParser = n),
			(this.stateAfter = new uh({ perNode: !0 })),
			(this.tokenTable = e.tokenTable ? new Zu(n.tokenTable) : _u);
	}
	static define(e) {
		return new gu(e);
	}
	getIndent(e) {
		let t,
			{ overrideIndentation: i } = e.options;
		i && ((t = mu.get(e.state)), null != t && t < e.pos - 1e4 && (t = void 0));
		let n,
			r,
			s = xu(
				this,
				e.node.tree,
				e.node.from,
				e.node.from,
				null != t ? t : e.pos,
			);
		if (
			(s
				? ((r = s.state), (n = s.pos + 1))
				: ((r = this.streamParser.startState(e.unit)), (n = e.node.from)),
			e.pos - n > 1e4)
		)
			return null;
		for (; n < e.pos; ) {
			let t = e.state.doc.lineAt(n),
				s = Math.min(e.pos, t.to);
			if (t.length) {
				let n = i ? i(t.from) : -1,
					o = new du(t.text, e.state.tabSize, e.unit, n < 0 ? void 0 : n);
				for (; o.pos < s - t.from; ) yu(this.streamParser.token, o, r);
			} else this.streamParser.blankLine(r, e.unit);
			if (s == e.pos) break;
			n = t.to + 1;
		}
		let o = e.lineAt(e.pos);
		return (
			i && null == t && mu.set(e.state, o.from),
			this.streamParser.indent(r, /^\s*(.*)/.exec(o.text)[1], e)
		);
	}
	get allowsNesting() {
		return !1;
	}
}
function xu(e, t, i, n, r) {
	let s = i >= n && i + t.length <= r && t.prop(e.stateAfter);
	if (s) return { state: e.streamParser.copyState(s), pos: i + t.length };
	for (let s = t.children.length - 1; s >= 0; s--) {
		let o = t.children[s],
			a = i + t.positions[s],
			l = o instanceof bh && a < r && xu(e, o, a, n, r);
		if (l) return l;
	}
	return null;
}
function bu(e, t, i, n, r) {
	if (r && i <= 0 && n >= t.length) return t;
	r || 0 != i || t.type != e.topNode || (r = !0);
	for (let s = t.children.length - 1; s >= 0; s--) {
		let o,
			a = t.positions[s],
			l = t.children[s];
		if (a < n && l instanceof bh) {
			if (!(o = bu(e, l, i - a, n - a, r))) break;
			return r
				? new bh(
						t.type,
						t.children.slice(0, s).concat(o),
						t.positions.slice(0, s + 1),
						a + o.length,
					)
				: o;
		}
	}
	return null;
}
let Su = class {
	constructor(e, t, i, n) {
		(this.lang = e),
			(this.input = t),
			(this.fragments = i),
			(this.ranges = n),
			(this.stoppedAt = null),
			(this.chunks = []),
			(this.chunkPos = []),
			(this.chunk = []),
			(this.chunkReused = void 0),
			(this.rangeIndex = 0),
			(this.to = n[n.length - 1].to);
		let r = Rc.get(),
			s = n[0].from,
			{ state: o, tree: a } = (function (e, t, i, n, r) {
				for (let r of t) {
					let t,
						s = r.from + (r.openStart ? 25 : 0),
						o = r.to - (r.openEnd ? 25 : 0),
						a = s <= i && o > i && xu(e, r.tree, 0 - r.offset, i, o);
					if (
						a &&
						a.pos <= n &&
						(t = bu(e, r.tree, i + r.offset, a.pos + r.offset, !1))
					)
						return { state: a.state, tree: t };
				}
				return {
					state: e.streamParser.startState(r ? Bc(r) : 4),
					tree: bh.empty,
				};
			})(e, i, s, this.to, null == r ? void 0 : r.state);
		(this.state = o), (this.parsedPos = this.chunkStart = s + a.length);
		for (let e = 0; e < a.children.length; e++)
			this.chunks.push(a.children[e]), this.chunkPos.push(a.positions[e]);
		r &&
			this.parsedPos < r.viewport.from - 1e5 &&
			n.some((e) => e.from <= r.viewport.from && e.to >= r.viewport.from) &&
			((this.state = this.lang.streamParser.startState(Bc(r.state))),
			r.skipUntilInView(this.parsedPos, r.viewport.from),
			(this.parsedPos = r.viewport.from)),
			this.moveRangeIndex();
	}
	advance() {
		let e = Rc.get(),
			t = null == this.stoppedAt ? this.to : Math.min(this.to, this.stoppedAt),
			i = Math.min(t, this.chunkStart + 2048);
		for (e && (i = Math.min(i, e.viewport.to)); this.parsedPos < i; )
			this.parseLine(e);
		return (
			this.chunkStart < this.parsedPos && this.finishChunk(),
			this.parsedPos >= t
				? this.finish()
				: e && this.parsedPos >= e.viewport.to
					? (e.skipUntilInView(this.parsedPos, t), this.finish())
					: null
		);
	}
	stopAt(e) {
		this.stoppedAt = e;
	}
	lineAfter(e) {
		let t = this.input.chunk(e);
		if (this.input.lineChunks) "\n" == t && (t = "");
		else {
			let e = t.indexOf("\n");
			e > -1 && (t = t.slice(0, e));
		}
		return e + t.length <= this.to ? t : t.slice(0, this.to - e);
	}
	nextLine() {
		let e = this.parsedPos,
			t = this.lineAfter(e),
			i = e + t.length;
		for (let e = this.rangeIndex; ; ) {
			let n = this.ranges[e].to;
			if (n >= i) break;
			if (((t = t.slice(0, n - (i - t.length))), e++, e == this.ranges.length))
				break;
			let r = this.ranges[e].from,
				s = this.lineAfter(r);
			(t += s), (i = r + s.length);
		}
		return { line: t, end: i };
	}
	skipGapsTo(e, t, i) {
		for (;;) {
			let n = this.ranges[this.rangeIndex].to,
				r = e + t;
			if (i > 0 ? n > r : n >= r) break;
			t += this.ranges[++this.rangeIndex].from - n;
		}
		return t;
	}
	moveRangeIndex() {
		for (; this.ranges[this.rangeIndex].to < this.parsedPos; )
			this.rangeIndex++;
	}
	emitToken(e, t, i, n) {
		let r = 4;
		if (this.ranges.length > 1) {
			t += n = this.skipGapsTo(t, n, 1);
			let e = this.chunk.length;
			(i += n = this.skipGapsTo(i, n, -1)), (r += this.chunk.length - e);
		}
		let s = this.chunk.length - 4;
		return (
			this.lang.streamParser.mergeTokens &&
			4 == r &&
			s >= 0 &&
			this.chunk[s] == e &&
			this.chunk[s + 2] == t
				? (this.chunk[s + 2] = i)
				: this.chunk.push(e, t, i, r),
			n
		);
	}
	parseLine(e) {
		let { line: t, end: i } = this.nextLine(),
			n = 0,
			{ streamParser: r } = this.lang,
			s = new du(t, e ? e.state.tabSize : 4, e ? Bc(e.state) : 2);
		if (s.eol()) r.blankLine(this.state, s.indentUnit);
		else
			for (; !s.eol(); ) {
				let e = yu(r.token, s, this.state);
				if (
					(e &&
						(n = this.emitToken(
							this.lang.tokenTable.resolve(e),
							this.parsedPos + s.start,
							this.parsedPos + s.pos,
							n,
						)),
					s.start > 1e4)
				)
					break;
			}
		(this.parsedPos = i),
			this.moveRangeIndex(),
			this.parsedPos < this.to && this.parsedPos++;
	}
	finishChunk() {
		let e = bh.build({
			buffer: this.chunk,
			start: this.chunkStart,
			length: this.parsedPos - this.chunkStart,
			nodeSet: ku,
			topID: 0,
			maxBufferLength: 2048,
			reused: this.chunkReused,
		});
		(e = new bh(e.type, e.children, e.positions, e.length, [
			[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)],
		])),
			this.chunks.push(e),
			this.chunkPos.push(this.chunkStart - this.ranges[0].from),
			(this.chunk = []),
			(this.chunkReused = void 0),
			(this.chunkStart = this.parsedPos);
	}
	finish() {
		return new bh(
			this.lang.topNode,
			this.chunks,
			this.chunkPos,
			this.parsedPos - this.ranges[0].from,
		).balance();
	}
};
function yu(e, t, i) {
	t.start = t.pos;
	for (let n = 0; n < 10; n++) {
		let n = e(t, i);
		if (t.pos > t.start) return n;
	}
	throw new Error("Stream parser failed to advance stream.");
}
const Qu = Object.create(null),
	wu = [dh.none],
	ku = new ph(wu),
	vu = [],
	$u = Object.create(null),
	Pu = Object.create(null);
for (let [e, t] of [
	["variable", "variableName"],
	["variable-2", "variableName.special"],
	["string-2", "string.special"],
	["def", "variableName.definition"],
	["tag", "tagName"],
	["attribute", "attributeName"],
	["type", "typeName"],
	["builtin", "variableName.standard"],
	["qualifier", "modifier"],
	["error", "invalid"],
	["header", "heading"],
	["property", "propertyName"],
])
	Pu[e] = Xu(Qu, t);
class Zu {
	constructor(e) {
		(this.extra = e), (this.table = Object.assign(Object.create(null), Pu));
	}
	resolve(e) {
		return e ? this.table[e] || (this.table[e] = Xu(this.extra, e)) : 0;
	}
}
const _u = new Zu(Qu);
function Tu(e, t) {
	vu.indexOf(e) > -1 || (vu.push(e), console.warn(t));
}
function Xu(e, t) {
	let i = [];
	for (let n of t.split(" ")) {
		let t = [];
		for (let i of n.split(".")) {
			let n = e[i] || wc[i];
			n
				? "function" == typeof n
					? t.length
						? (t = t.map(n))
						: Tu(i, `Modifier ${i} used at start of tag`)
					: t.length
						? Tu(i, `Tag ${i} used as modifier`)
						: (t = Array.isArray(n) ? n : [n])
				: Tu(i, `Unknown highlighting tag ${i}`);
		}
		for (let e of t) i.push(e);
	}
	if (!i.length) return 0;
	let n = t.replace(/ /g, "_"),
		r = n + " " + i.map((e) => e.id),
		s = $u[r];
	if (s) return s.id;
	let o = ($u[r] = dh.define({
		id: wu.length,
		name: n,
		props: [sc({ [n]: i })],
	}));
	return wu.push(o), o.id;
}
co.RTL, co.LTR;
function Au(e, t) {
	return ({ state: i, dispatch: n }) => {
		if (i.readOnly) return !1;
		let r = e(t, i);
		return !!r && (n(i.update(r)), !0);
	};
}
const Cu = Au(Vu, 0),
	Ru = Au(qu, 0),
	Mu = Au(
		(e, t) =>
			qu(
				e,
				t,
				(function (e) {
					let t = [];
					for (let i of e.selection.ranges) {
						let n = e.doc.lineAt(i.from),
							r = i.to <= n.to ? n : e.doc.lineAt(i.to);
						r.from > n.from &&
							r.from == i.to &&
							(r = i.to == n.to + 1 ? n : e.doc.lineAt(i.to - 1));
						let s = t.length - 1;
						s >= 0 && t[s].to > n.from
							? (t[s].to = r.to)
							: t.push({
									from: n.from + /^\s*/.exec(n.text)[0].length,
									to: r.to,
								});
					}
					return t;
				})(t),
			),
		0,
	);
function ju(e, t) {
	let i = e.languageDataAt("commentTokens", t, 1);
	return i.length ? i[0] : {};
}
const Eu = 50;
function qu(e, t, i = t.selection.ranges) {
	let n = i.map((e) => ju(t, e.from).block);
	if (!n.every((e) => e)) return null;
	let r = i.map((e, i) =>
		(function (e, { open: t, close: i }, n, r) {
			let s,
				o,
				a = e.sliceDoc(n - Eu, n),
				l = e.sliceDoc(r, r + Eu),
				h = /\s*$/.exec(a)[0].length,
				c = /^\s*/.exec(l)[0].length,
				u = a.length - h;
			if (a.slice(u - t.length, u) == t && l.slice(c, c + i.length) == i)
				return {
					open: { pos: n - h, margin: h && 1 },
					close: { pos: r + c, margin: c && 1 },
				};
			r - n <= 2 * Eu
				? (s = o = e.sliceDoc(n, r))
				: ((s = e.sliceDoc(n, n + Eu)), (o = e.sliceDoc(r - Eu, r)));
			let f = /^\s*/.exec(s)[0].length,
				O = /\s*$/.exec(o)[0].length,
				d = o.length - O - i.length;
			return s.slice(f, f + t.length) == t && o.slice(d, d + i.length) == i
				? {
						open: {
							pos: n + f + t.length,
							margin: /\s/.test(s.charAt(f + t.length)) ? 1 : 0,
						},
						close: {
							pos: r - O - i.length,
							margin: /\s/.test(o.charAt(d - 1)) ? 1 : 0,
						},
					}
				: null;
		})(t, n[i], e.from, e.to),
	);
	if (2 != e && !r.every((e) => e))
		return {
			changes: t.changes(
				i.map((e, t) =>
					r[t]
						? []
						: [
								{ from: e.from, insert: n[t].open + " " },
								{ from: e.to, insert: " " + n[t].close },
							],
				),
			),
		};
	if (1 != e && r.some((e) => e)) {
		let e = [];
		for (let t, i = 0; i < r.length; i++)
			if ((t = r[i])) {
				let r = n[i],
					{ open: s, close: o } = t;
				e.push(
					{ from: s.pos - r.open.length, to: s.pos + s.margin },
					{ from: o.pos - o.margin, to: o.pos + r.close.length },
				);
			}
		return { changes: e };
	}
	return null;
}
function Vu(e, t, i = t.selection.ranges) {
	let n = [],
		r = -1;
	for (let { from: e, to: s } of i) {
		let i = n.length,
			o = 1e9,
			a = ju(t, e).line;
		if (a) {
			for (let i = e; i <= s; ) {
				let l = t.doc.lineAt(i);
				if (l.from > r && (e == s || s > l.from)) {
					r = l.from;
					let e = /^\s*/.exec(l.text)[0].length,
						t = e == l.length,
						i = l.text.slice(e, e + a.length) == a ? e : -1;
					e < l.text.length && e < o && (o = e),
						n.push({
							line: l,
							comment: i,
							token: a,
							indent: e,
							empty: t,
							single: !1,
						});
				}
				i = l.to + 1;
			}
			if (o < 1e9)
				for (let e = i; e < n.length; e++)
					n[e].indent < n[e].line.text.length && (n[e].indent = o);
			n.length == i + 1 && (n[i].single = !0);
		}
	}
	if (2 != e && n.some((e) => e.comment < 0 && (!e.empty || e.single))) {
		let e = [];
		for (let { line: t, token: i, indent: r, empty: s, single: o } of n)
			(!o && s) || e.push({ from: t.from + r, insert: i + " " });
		let i = t.changes(e);
		return { changes: i, selection: t.selection.map(i, 1) };
	}
	if (1 != e && n.some((e) => e.comment >= 0)) {
		let e = [];
		for (let { line: t, comment: i, token: r } of n)
			if (i >= 0) {
				let n = t.from + i,
					s = n + r.length;
				" " == t.text[s - t.from] && s++, e.push({ from: n, to: s });
			}
		return { changes: e };
	}
	return null;
}
const Lu = sr.define(),
	Wu = sr.define(),
	zu = An.define(),
	Yu = An.define({
		combine: (e) =>
			(function (e, t, i = {}) {
				let n = {};
				for (let t of e)
					for (let e of Object.keys(t)) {
						let r = t[e],
							s = n[e];
						if (void 0 === s) n[e] = r;
						else if (s === r || void 0 === r);
						else {
							if (!Object.hasOwnProperty.call(i, e))
								throw new Error("Config merge conflict for field " + e);
							n[e] = i[e](s, r);
						}
					}
				for (let e in t) void 0 === n[e] && (n[e] = t[e]);
				return n;
			})(
				e,
				{ minDepth: 100, newGroupDelay: 500, joinToEvent: (e, t) => t },
				{
					minDepth: Math.max,
					newGroupDelay: Math.min,
					joinToEvent: (e, t) => (i, n) => e(i, n) || t(i, n),
				},
			),
	}),
	Du = Vn.define({
		create: () => af.empty,
		update(e, t) {
			let i = t.state.facet(Yu),
				n = t.annotation(Lu);
			if (n) {
				let r = Hu.fromTransaction(t, n.selection),
					s = n.side,
					o = 0 == s ? e.undone : e.done;
				return (
					(o = r
						? Fu(o, o.length, i.minDepth, r)
						: tf(o, t.startState.selection)),
					new af(0 == s ? n.rest : o, 0 == s ? o : n.rest)
				);
			}
			let r = t.annotation(Wu);
			if (
				(("full" != r && "before" != r) || (e = e.isolate()),
				!1 === t.annotation(hr.addToHistory))
			)
				return t.changes.empty ? e : e.addMapping(t.changes.desc);
			let s = Hu.fromTransaction(t),
				o = t.annotation(hr.time),
				a = t.annotation(hr.userEvent);
			return (
				s
					? (e = e.addChanges(s, o, a, i, t))
					: t.selection &&
						(e = e.addSelection(t.startState.selection, o, a, i.newGroupDelay)),
				("full" != r && "after" != r) || (e = e.isolate()),
				e
			);
		},
		toJSON: (e) => ({
			done: e.done.map((e) => e.toJSON()),
			undone: e.undone.map((e) => e.toJSON()),
		}),
		fromJSON: (e) => new af(e.done.map(Hu.fromJSON), e.undone.map(Hu.fromJSON)),
	});
function Bu(e, t) {
	return function ({ state: i, dispatch: n }) {
		if (!t && i.readOnly) return !1;
		let r = i.field(Du, !1);
		if (!r) return !1;
		let s = r.pop(e, i, t);
		return !!s && (n(s), !0);
	};
}
const Iu = Bu(0, !1),
	Uu = Bu(1, !1),
	Gu = Bu(0, !0),
	Nu = Bu(1, !0);
class Hu {
	constructor(e, t, i, n, r) {
		(this.changes = e),
			(this.effects = t),
			(this.mapped = i),
			(this.startSelection = n),
			(this.selectionsAfter = r);
	}
	setSelAfter(e) {
		return new Hu(
			this.changes,
			this.effects,
			this.mapped,
			this.startSelection,
			e,
		);
	}
	toJSON() {
		var e, t, i;
		return {
			changes:
				null === (e = this.changes) || void 0 === e ? void 0 : e.toJSON(),
			mapped: null === (t = this.mapped) || void 0 === t ? void 0 : t.toJSON(),
			startSelection:
				null === (i = this.startSelection) || void 0 === i
					? void 0
					: i.toJSON(),
			selectionsAfter: this.selectionsAfter.map((e) => e.toJSON()),
		};
	}
	static fromJSON(e) {
		return new Hu(
			e.changes && yn.fromJSON(e.changes),
			[],
			e.mapped && Sn.fromJSON(e.mapped),
			e.startSelection && _n.fromJSON(e.startSelection),
			e.selectionsAfter.map(_n.fromJSON),
		);
	}
	static fromTransaction(e, t) {
		let i = Ju;
		for (let t of e.startState.facet(zu)) {
			let n = t(e);
			n.length && (i = i.concat(n));
		}
		return !i.length && e.changes.empty
			? null
			: new Hu(
					e.changes.invert(e.startState.doc),
					i,
					void 0,
					t || e.startState.selection,
					Ju,
				);
	}
	static selection(e) {
		return new Hu(void 0, Ju, void 0, void 0, e);
	}
}
function Fu(e, t, i, n) {
	let r = t + 1 > i + 20 ? t - i - 1 : 0,
		s = e.slice(r, t);
	return s.push(n), s;
}
function Ku(e, t) {
	return e.length ? (t.length ? e.concat(t) : e) : t;
}
const Ju = [],
	ef = 200;
function tf(e, t) {
	if (e.length) {
		let i = e[e.length - 1],
			n = i.selectionsAfter.slice(Math.max(0, i.selectionsAfter.length - ef));
		return n.length && n[n.length - 1].eq(t)
			? e
			: (n.push(t), Fu(e, e.length - 1, 1e9, i.setSelAfter(n)));
	}
	return [Hu.selection([t])];
}
function nf(e) {
	let t = e[e.length - 1],
		i = e.slice();
	return (
		(i[e.length - 1] = t.setSelAfter(
			t.selectionsAfter.slice(0, t.selectionsAfter.length - 1),
		)),
		i
	);
}
function rf(e, t) {
	if (!e.length) return e;
	let i = e.length,
		n = Ju;
	for (; i; ) {
		let r = sf(e[i - 1], t, n);
		if ((r.changes && !r.changes.empty) || r.effects.length) {
			let t = e.slice(0, i);
			return (t[i - 1] = r), t;
		}
		(t = r.mapped), i--, (n = r.selectionsAfter);
	}
	return n.length ? [Hu.selection(n)] : Ju;
}
function sf(e, t, i) {
	let n = Ku(
		e.selectionsAfter.length ? e.selectionsAfter.map((e) => e.map(t)) : Ju,
		i,
	);
	if (!e.changes) return Hu.selection(n);
	let r = e.changes.map(t),
		s = t.mapDesc(e.changes, !0),
		o = e.mapped ? e.mapped.composeDesc(s) : s;
	return new Hu(r, lr.mapEffects(e.effects, t), o, e.startSelection.map(s), n);
}
const of = /^(input\.type|delete)($|\.)/;
class af {
	constructor(e, t, i = 0, n = void 0) {
		(this.done = e),
			(this.undone = t),
			(this.prevTime = i),
			(this.prevUserEvent = n);
	}
	isolate() {
		return this.prevTime ? new af(this.done, this.undone) : this;
	}
	addChanges(e, t, i, n, r) {
		let s = this.done,
			o = s[s.length - 1];
		return (
			(s =
				o &&
				o.changes &&
				!o.changes.empty &&
				e.changes &&
				(!i || of.test(i)) &&
				((!o.selectionsAfter.length &&
					t - this.prevTime < n.newGroupDelay &&
					n.joinToEvent(
						r,
						(function (e, t) {
							let i = [],
								n = !1;
							return (
								e.iterChangedRanges((e, t) => i.push(e, t)),
								t.iterChangedRanges((e, t, r, s) => {
									for (let e = 0; e < i.length; ) {
										let t = i[e++],
											o = i[e++];
										s >= t && r <= o && (n = !0);
									}
								}),
								n
							);
						})(o.changes, e.changes),
					)) ||
					"input.type.compose" == i)
					? Fu(
							s,
							s.length - 1,
							n.minDepth,
							new Hu(
								e.changes.compose(o.changes),
								Ku(lr.mapEffects(e.effects, o.changes), o.effects),
								o.mapped,
								o.startSelection,
								Ju,
							),
						)
					: Fu(s, s.length, n.minDepth, e)),
			new af(s, Ju, t, i)
		);
	}
	addSelection(e, t, i, n) {
		let r = this.done.length
			? this.done[this.done.length - 1].selectionsAfter
			: Ju;
		return r.length > 0 &&
			t - this.prevTime < n &&
			i == this.prevUserEvent &&
			i &&
			/^select($|\.)/.test(i) &&
			((s = r[r.length - 1]),
			(o = e),
			s.ranges.length == o.ranges.length &&
				0 === s.ranges.filter((e, t) => e.empty != o.ranges[t].empty).length)
			? this
			: new af(tf(this.done, e), this.undone, t, i);
		var s, o;
	}
	addMapping(e) {
		return new af(
			rf(this.done, e),
			rf(this.undone, e),
			this.prevTime,
			this.prevUserEvent,
		);
	}
	pop(e, t, i) {
		let n = 0 == e ? this.done : this.undone;
		if (0 == n.length) return null;
		let r = n[n.length - 1],
			s = r.selectionsAfter[0] || t.selection;
		if (i && r.selectionsAfter.length)
			return t.update({
				selection: r.selectionsAfter[r.selectionsAfter.length - 1],
				annotations: Lu.of({ side: e, rest: nf(n), selection: s }),
				userEvent: 0 == e ? "select.undo" : "select.redo",
				scrollIntoView: !0,
			});
		if (r.changes) {
			let i = 1 == n.length ? Ju : n.slice(0, n.length - 1);
			return (
				r.mapped && (i = rf(i, r.mapped)),
				t.update({
					changes: r.changes,
					selection: r.startSelection,
					effects: r.effects,
					annotations: Lu.of({ side: e, rest: i, selection: s }),
					filter: !1,
					userEvent: 0 == e ? "undo" : "redo",
					scrollIntoView: !0,
				})
			);
		}
		return null;
	}
}
af.empty = new af(Ju, Ju);
const lf = [
	{ key: "Mod-z", run: Iu, preventDefault: !0 },
	{ key: "Mod-y", mac: "Mod-Shift-z", run: Uu, preventDefault: !0 },
	{ linux: "Ctrl-Shift-z", run: Uu, preventDefault: !0 },
	{ key: "Mod-u", run: Gu, preventDefault: !0 },
	{ key: "Alt-u", mac: "Mod-Shift-u", run: Nu, preventDefault: !0 },
];
function hf(e, t) {
	return _n.create(e.ranges.map(t), e.mainIndex);
}
function cf(e, t) {
	return e.update({ selection: t, scrollIntoView: !0, userEvent: "select" });
}
function uf({ state: e, dispatch: t }, i) {
	let n = hf(e.selection, i);
	return !n.eq(e.selection, !0) && (t(cf(e, n)), !0);
}
function ff(e, t) {
	return _n.cursor(t ? e.to : e.from);
}
function Of(e, t) {
	return uf(e, (i) => (i.empty ? e.moveByChar(i, t) : ff(i, t)));
}
function df(e) {
	return e.textDirectionAt(e.state.selection.main.head) == co.LTR;
}
const pf = (e) => Of(e, !df(e)),
	mf = (e) => Of(e, df(e));
function gf(e, t) {
	return uf(e, (i) => (i.empty ? e.moveByGroup(i, t) : ff(i, t)));
}
function xf(e, t, i) {
	if (t.type.prop(i)) return !0;
	let n = t.to - t.from;
	return (
		(n && (n > 2 || /[^\s,.;:]/.test(e.sliceDoc(t.from, t.to)))) || t.firstChild
	);
}
function bf(e, t, i) {
	let n,
		r,
		s = Xc(e).resolveInner(t.head),
		o = i ? uh.closedBy : uh.openedBy;
	for (let n = t.head; ; ) {
		let t = i ? s.childAfter(n) : s.childBefore(n);
		if (!t) break;
		xf(e, t, o) ? (s = t) : (n = i ? t.to : t.from);
	}
	return (
		(r =
			s.type.prop(o) &&
			(n = i ? uu(e, s.from, 1) : uu(e, s.to, -1)) &&
			n.matched
				? i
					? n.end.to
					: n.end.from
				: i
					? s.to
					: s.from),
		_n.cursor(r, i ? -1 : 1)
	);
}
function Sf(e, t) {
	return uf(e, (i) => {
		if (!i.empty) return ff(i, t);
		let n = e.moveVertically(i, t);
		return n.head != i.head ? n : e.moveToLineBoundary(i, t);
	});
}
const yf = (e) => Sf(e, !1),
	Qf = (e) => Sf(e, !0);
function wf(e) {
	let t,
		i = e.scrollDOM.clientHeight < e.scrollDOM.scrollHeight - 2,
		n = 0,
		r = 0;
	if (i) {
		for (let t of e.state.facet(Gl.scrollMargins)) {
			let i = t(e);
			(null == i ? void 0 : i.top) &&
				(n = Math.max(null == i ? void 0 : i.top, n)),
				(null == i ? void 0 : i.bottom) &&
					(r = Math.max(null == i ? void 0 : i.bottom, r));
		}
		t = e.scrollDOM.clientHeight - n - r;
	} else t = (e.dom.ownerDocument.defaultView || window).innerHeight;
	return {
		marginTop: n,
		marginBottom: r,
		selfScroll: i,
		height: Math.max(e.defaultLineHeight, t - 5),
	};
}
function kf(e, t) {
	let i,
		n = wf(e),
		{ state: r } = e,
		s = hf(r.selection, (i) =>
			i.empty ? e.moveVertically(i, t, n.height) : ff(i, t),
		);
	if (s.eq(r.selection)) return !1;
	if (n.selfScroll) {
		let t = e.coordsAtPos(r.selection.main.head),
			o = e.scrollDOM.getBoundingClientRect(),
			a = o.top + n.marginTop,
			l = o.bottom - n.marginBottom;
		t &&
			t.top > a &&
			t.bottom < l &&
			(i = Gl.scrollIntoView(s.main.head, { y: "start", yMargin: t.top - a }));
	}
	return e.dispatch(cf(r, s), { effects: i }), !0;
}
const vf = (e) => kf(e, !1),
	$f = (e) => kf(e, !0);
function Pf(e, t, i) {
	let n = e.lineBlockAt(t.head),
		r = e.moveToLineBoundary(t, i);
	if (
		(r.head == t.head &&
			r.head != (i ? n.to : n.from) &&
			(r = e.moveToLineBoundary(t, i, !1)),
		!i && r.head == n.from && n.length)
	) {
		let i = /^\s*/.exec(
			e.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)),
		)[0].length;
		i && t.head != n.from + i && (r = _n.cursor(n.from + i));
	}
	return r;
}
function Zf(e, t) {
	let i = hf(e.state.selection, (e) => {
		let i = t(e);
		return _n.range(e.anchor, i.head, i.goalColumn, i.bidiLevel || void 0);
	});
	return !i.eq(e.state.selection) && (e.dispatch(cf(e.state, i)), !0);
}
function _f(e, t) {
	return Zf(e, (i) => e.moveByChar(i, t));
}
const Tf = (e) => _f(e, !df(e)),
	Xf = (e) => _f(e, df(e));
function Af(e, t) {
	return Zf(e, (i) => e.moveByGroup(i, t));
}
function Cf(e, t) {
	return Zf(e, (i) => e.moveVertically(i, t));
}
const Rf = (e) => Cf(e, !1),
	Mf = (e) => Cf(e, !0);
function jf(e, t) {
	return Zf(e, (i) => e.moveVertically(i, t, wf(e).height));
}
const Ef = (e) => jf(e, !1),
	qf = (e) => jf(e, !0),
	Vf = ({ state: e, dispatch: t }) => (t(cf(e, { anchor: 0 })), !0),
	Lf = ({ state: e, dispatch: t }) => (t(cf(e, { anchor: e.doc.length })), !0),
	Wf = ({ state: e, dispatch: t }) => (
		t(cf(e, { anchor: e.selection.main.anchor, head: 0 })), !0
	),
	zf = ({ state: e, dispatch: t }) => (
		t(cf(e, { anchor: e.selection.main.anchor, head: e.doc.length })), !0
	);
function Yf(e, t) {
	if (e.state.readOnly) return !1;
	let i = "delete.selection",
		{ state: n } = e,
		r = n.changeByRange((n) => {
			let { from: r, to: s } = n;
			if (r == s) {
				let o = t(n);
				o < r
					? ((i = "delete.backward"), (o = Df(e, o, !1)))
					: o > r && ((i = "delete.forward"), (o = Df(e, o, !0))),
					(r = Math.min(r, o)),
					(s = Math.max(s, o));
			} else (r = Df(e, r, !1)), (s = Df(e, s, !0));
			return r == s
				? { range: n }
				: {
						changes: { from: r, to: s },
						range: _n.cursor(r, r < n.head ? -1 : 1),
					};
		});
	return (
		!r.changes.empty &&
		(e.dispatch(
			n.update(r, {
				scrollIntoView: !0,
				userEvent: i,
				effects:
					"delete.selection" == i
						? Gl.announce.of(n.phrase("Selection deleted"))
						: void 0,
			}),
		),
		!0)
	);
}
function Df(e, t, i) {
	if (e instanceof Gl)
		for (let n of e.state.facet(Gl.atomicRanges).map((t) => t(e)))
			n.between(t, t, (e, n) => {
				e < t && n > t && (t = i ? n : e);
			});
	return t;
}
const Bf = (e, t, i) =>
		Yf(e, (n) => {
			let r,
				s,
				o = n.from,
				{ state: a } = e,
				l = a.doc.lineAt(o);
			if (
				i &&
				!t &&
				o > l.from &&
				o < l.from + 200 &&
				!/[^ \t]/.test((r = l.text.slice(0, o - l.from)))
			) {
				if ("\t" == r[r.length - 1]) return o - 1;
				let e = Er(r, a.tabSize) % Bc(a) || Bc(a);
				for (let t = 0; t < e && " " == r[r.length - 1 - t]; t++) o--;
				s = o;
			} else
				(s = gn(l.text, o - l.from, t, t) + l.from),
					s == o && l.number != (t ? a.doc.lines : 1)
						? (s += t ? 1 : -1)
						: !t &&
							/[\ufe00-\ufe0f]/.test(l.text.slice(s - l.from, o - l.from)) &&
							(s = gn(l.text, s - l.from, !1, !1) + l.from);
			return s;
		}),
	If = (e) => Bf(e, !1, !0),
	Uf = (e) => Bf(e, !0, !1),
	Gf = (e, t) =>
		Yf(e, (i) => {
			let n = i.head,
				{ state: r } = e,
				s = r.doc.lineAt(n),
				o = r.charCategorizer(n);
			for (let e = null; ; ) {
				if (n == (t ? s.to : s.from)) {
					n == i.head && s.number != (t ? r.doc.lines : 1) && (n += t ? 1 : -1);
					break;
				}
				let a = gn(s.text, n - s.from, t) + s.from,
					l = s.text.slice(Math.min(n, a) - s.from, Math.max(n, a) - s.from),
					h = o(l);
				if (null != e && h != e) break;
				(" " == l && n == i.head) || (e = h), (n = a);
			}
			return n;
		}),
	Nf = (e) => Gf(e, !1);
function Hf(e) {
	let t = [],
		i = -1;
	for (let n of e.selection.ranges) {
		let r = e.doc.lineAt(n.from),
			s = e.doc.lineAt(n.to);
		if (
			(n.empty || n.to != s.from || (s = e.doc.lineAt(n.to - 1)), i >= r.number)
		) {
			let e = t[t.length - 1];
			(e.to = s.to), e.ranges.push(n);
		} else t.push({ from: r.from, to: s.to, ranges: [n] });
		i = s.number + 1;
	}
	return t;
}
function Ff(e, t, i) {
	if (e.readOnly) return !1;
	let n = [],
		r = [];
	for (let t of Hf(e)) {
		if (i ? t.to == e.doc.length : 0 == t.from) continue;
		let s = e.doc.lineAt(i ? t.to + 1 : t.from - 1),
			o = s.length + 1;
		if (i) {
			n.push(
				{ from: t.to, to: s.to },
				{ from: t.from, insert: s.text + e.lineBreak },
			);
			for (let i of t.ranges)
				r.push(
					_n.range(
						Math.min(e.doc.length, i.anchor + o),
						Math.min(e.doc.length, i.head + o),
					),
				);
		} else {
			n.push(
				{ from: s.from, to: t.from },
				{ from: t.to, insert: e.lineBreak + s.text },
			);
			for (let e of t.ranges) r.push(_n.range(e.anchor - o, e.head - o));
		}
	}
	return (
		!!n.length &&
		(t(
			e.update({
				changes: n,
				scrollIntoView: !0,
				selection: _n.create(r, e.selection.mainIndex),
				userEvent: "move.line",
			}),
		),
		!0)
	);
}
function Kf(e, t, i) {
	if (e.readOnly) return !1;
	let n = [];
	for (let t of Hf(e))
		i
			? n.push({
					from: t.from,
					insert: e.doc.slice(t.from, t.to) + e.lineBreak,
				})
			: n.push({ from: t.to, insert: e.lineBreak + e.doc.slice(t.from, t.to) });
	return (
		t(
			e.update({ changes: n, scrollIntoView: !0, userEvent: "input.copyline" }),
		),
		!0
	);
}
const Jf = tO(!1),
	eO = tO(!0);
function tO(e) {
	return ({ state: t, dispatch: i }) => {
		if (t.readOnly) return !1;
		let n = t.changeByRange((i) => {
			let { from: n, to: r } = i,
				s = t.doc.lineAt(n),
				o =
					!e &&
					n == r &&
					(function (e, t) {
						if (/\(\)|\[\]|\{\}/.test(e.sliceDoc(t - 1, t + 1)))
							return { from: t, to: t };
						let i,
							n = Xc(e).resolveInner(t),
							r = n.childBefore(t),
							s = n.childAfter(t);
						return r &&
							s &&
							r.to <= t &&
							s.from >= t &&
							(i = r.type.prop(uh.closedBy)) &&
							i.indexOf(s.name) > -1 &&
							e.doc.lineAt(r.to).from == e.doc.lineAt(s.from).from &&
							!/\S/.test(e.sliceDoc(r.to, s.from))
							? { from: r.to, to: s.from }
							: null;
					})(t, n);
			e && (n = r = (r <= s.to ? s : t.doc.lineAt(r)).to);
			let a = new Gc(t, { simulateBreak: n, simulateDoubleBreak: !!o }),
				l = Uc(a, n);
			for (
				null == l && (l = Er(/^\s*/.exec(t.doc.lineAt(n).text)[0], t.tabSize));
				r < s.to && /\s/.test(s.text[r - s.from]);
			)
				r++;
			o
				? ({ from: n, to: r } = o)
				: n > s.from &&
					n < s.from + 100 &&
					!/\S/.test(s.text.slice(0, n)) &&
					(n = s.from);
			let h = ["", Ic(t, l)];
			return (
				o && h.push(Ic(t, a.lineIndent(s.from, -1))),
				{
					changes: { from: n, to: r, insert: an.of(h) },
					range: _n.cursor(n + 1 + h[1].length),
				}
			);
		});
		return i(t.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
	};
}
function iO(e, t) {
	let i = -1;
	return e.changeByRange((n) => {
		let r = [];
		for (let s = n.from; s <= n.to; ) {
			let o = e.doc.lineAt(s);
			o.number > i &&
				(n.empty || n.to > o.from) &&
				(t(o, r, n), (i = o.number)),
				(s = o.to + 1);
		}
		let s = e.changes(r);
		return {
			changes: r,
			range: _n.range(s.mapPos(n.anchor, 1), s.mapPos(n.head, 1)),
		};
	});
}
const nO = [
		{ key: "Ctrl-b", run: pf, shift: Tf, preventDefault: !0 },
		{ key: "Ctrl-f", run: mf, shift: Xf },
		{ key: "Ctrl-p", run: yf, shift: Rf },
		{ key: "Ctrl-n", run: Qf, shift: Mf },
		{
			key: "Ctrl-a",
			run: (e) => uf(e, (t) => _n.cursor(e.lineBlockAt(t.head).from, 1)),
			shift: (e) => Zf(e, (t) => _n.cursor(e.lineBlockAt(t.head).from)),
		},
		{
			key: "Ctrl-e",
			run: (e) => uf(e, (t) => _n.cursor(e.lineBlockAt(t.head).to, -1)),
			shift: (e) => Zf(e, (t) => _n.cursor(e.lineBlockAt(t.head).to)),
		},
		{ key: "Ctrl-d", run: Uf },
		{ key: "Ctrl-h", run: If },
		{
			key: "Ctrl-k",
			run: (e) =>
				Yf(e, (t) => {
					let i = e.lineBlockAt(t.head).to;
					return t.head < i ? i : Math.min(e.state.doc.length, t.head + 1);
				}),
		},
		{ key: "Ctrl-Alt-h", run: Nf },
		{
			key: "Ctrl-o",
			run: ({ state: e, dispatch: t }) => {
				if (e.readOnly) return !1;
				let i = e.changeByRange((e) => ({
					changes: { from: e.from, to: e.to, insert: an.of(["", ""]) },
					range: _n.cursor(e.from),
				}));
				return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
			},
		},
		{
			key: "Ctrl-t",
			run: ({ state: e, dispatch: t }) => {
				if (e.readOnly) return !1;
				let i = e.changeByRange((t) => {
					if (!t.empty || 0 == t.from || t.from == e.doc.length)
						return { range: t };
					let i = t.from,
						n = e.doc.lineAt(i),
						r = i == n.from ? i - 1 : gn(n.text, i - n.from, !1) + n.from,
						s = i == n.to ? i + 1 : gn(n.text, i - n.from, !0) + n.from;
					return {
						changes: {
							from: r,
							to: s,
							insert: e.doc.slice(i, s).append(e.doc.slice(r, i)),
						},
						range: _n.cursor(s),
					};
				});
				return (
					!i.changes.empty &&
					(t(e.update(i, { scrollIntoView: !0, userEvent: "move.character" })),
					!0)
				);
			},
		},
		{ key: "Ctrl-v", run: $f },
	],
	rO = [
		{ key: "ArrowLeft", run: pf, shift: Tf, preventDefault: !0 },
		{
			key: "Mod-ArrowLeft",
			mac: "Alt-ArrowLeft",
			run: (e) => gf(e, !df(e)),
			shift: (e) => Af(e, !df(e)),
			preventDefault: !0,
		},
		{
			mac: "Cmd-ArrowLeft",
			run: (e) => uf(e, (t) => Pf(e, t, !df(e))),
			shift: (e) => Zf(e, (t) => Pf(e, t, !df(e))),
			preventDefault: !0,
		},
		{ key: "ArrowRight", run: mf, shift: Xf, preventDefault: !0 },
		{
			key: "Mod-ArrowRight",
			mac: "Alt-ArrowRight",
			run: (e) => gf(e, df(e)),
			shift: (e) => Af(e, df(e)),
			preventDefault: !0,
		},
		{
			mac: "Cmd-ArrowRight",
			run: (e) => uf(e, (t) => Pf(e, t, df(e))),
			shift: (e) => Zf(e, (t) => Pf(e, t, df(e))),
			preventDefault: !0,
		},
		{ key: "ArrowUp", run: yf, shift: Rf, preventDefault: !0 },
		{ mac: "Cmd-ArrowUp", run: Vf, shift: Wf },
		{ mac: "Ctrl-ArrowUp", run: vf, shift: Ef },
		{ key: "ArrowDown", run: Qf, shift: Mf, preventDefault: !0 },
		{ mac: "Cmd-ArrowDown", run: Lf, shift: zf },
		{ mac: "Ctrl-ArrowDown", run: $f, shift: qf },
		{ key: "PageUp", run: vf, shift: Ef },
		{ key: "PageDown", run: $f, shift: qf },
		{
			key: "Home",
			run: (e) => uf(e, (t) => Pf(e, t, !1)),
			shift: (e) => Zf(e, (t) => Pf(e, t, !1)),
			preventDefault: !0,
		},
		{ key: "Mod-Home", run: Vf, shift: Wf },
		{
			key: "End",
			run: (e) => uf(e, (t) => Pf(e, t, !0)),
			shift: (e) => Zf(e, (t) => Pf(e, t, !0)),
			preventDefault: !0,
		},
		{ key: "Mod-End", run: Lf, shift: zf },
		{ key: "Enter", run: Jf, shift: Jf },
		{
			key: "Mod-a",
			run: ({ state: e, dispatch: t }) => (
				t(
					e.update({
						selection: { anchor: 0, head: e.doc.length },
						userEvent: "select",
					}),
				),
				!0
			),
		},
		{ key: "Backspace", run: If, shift: If },
		{ key: "Delete", run: Uf },
		{ key: "Mod-Backspace", mac: "Alt-Backspace", run: Nf },
		{ key: "Mod-Delete", mac: "Alt-Delete", run: (e) => Gf(e, !0) },
		{
			mac: "Mod-Backspace",
			run: (e) =>
				Yf(e, (t) => {
					let i = e.moveToLineBoundary(t, !1).head;
					return t.head > i ? i : Math.max(0, t.head - 1);
				}),
		},
		{
			mac: "Mod-Delete",
			run: (e) =>
				Yf(e, (t) => {
					let i = e.moveToLineBoundary(t, !0).head;
					return t.head < i ? i : Math.min(e.state.doc.length, t.head + 1);
				}),
		},
	].concat(nO.map((e) => ({ mac: e.key, run: e.run, shift: e.shift }))),
	sO = [
		{
			key: "Alt-ArrowLeft",
			mac: "Ctrl-ArrowLeft",
			run: (e) => uf(e, (t) => bf(e.state, t, !df(e))),
			shift: (e) => Zf(e, (t) => bf(e.state, t, !df(e))),
		},
		{
			key: "Alt-ArrowRight",
			mac: "Ctrl-ArrowRight",
			run: (e) => uf(e, (t) => bf(e.state, t, df(e))),
			shift: (e) => Zf(e, (t) => bf(e.state, t, df(e))),
		},
		{ key: "Alt-ArrowUp", run: ({ state: e, dispatch: t }) => Ff(e, t, !1) },
		{
			key: "Shift-Alt-ArrowUp",
			run: ({ state: e, dispatch: t }) => Kf(e, t, !1),
		},
		{ key: "Alt-ArrowDown", run: ({ state: e, dispatch: t }) => Ff(e, t, !0) },
		{
			key: "Shift-Alt-ArrowDown",
			run: ({ state: e, dispatch: t }) => Kf(e, t, !0),
		},
		{
			key: "Escape",
			run: ({ state: e, dispatch: t }) => {
				let i = e.selection,
					n = null;
				return (
					i.ranges.length > 1
						? (n = _n.create([i.main]))
						: i.main.empty || (n = _n.create([_n.cursor(i.main.head)])),
					!!n && (t(cf(e, n)), !0)
				);
			},
		},
		{ key: "Mod-Enter", run: eO },
		{
			key: "Alt-l",
			mac: "Ctrl-l",
			run: ({ state: e, dispatch: t }) => {
				let i = Hf(e).map(({ from: t, to: i }) =>
					_n.range(t, Math.min(i + 1, e.doc.length)),
				);
				return (
					t(e.update({ selection: _n.create(i), userEvent: "select" })), !0
				);
			},
		},
		{
			key: "Mod-i",
			run: ({ state: e, dispatch: t }) => {
				let i = hf(e.selection, (t) => {
					let i = Xc(e),
						n = i.resolveStack(t.from, 1);
					if (t.empty) {
						let e = i.resolveStack(t.from, -1);
						e.node.from >= n.node.from && e.node.to <= n.node.to && (n = e);
					}
					for (let e = n; e; e = e.next) {
						let { node: i } = e;
						if (
							((i.from < t.from && i.to >= t.to) ||
								(i.to > t.to && i.from <= t.from)) &&
							e.next
						)
							return _n.range(i.to, i.from);
					}
					return t;
				});
				return !i.eq(e.selection) && (t(cf(e, i)), !0);
			},
			preventDefault: !0,
		},
		{
			key: "Mod-[",
			run: ({ state: e, dispatch: t }) =>
				!e.readOnly &&
				(t(
					e.update(
						iO(e, (t, i) => {
							let n = /^\s*/.exec(t.text)[0];
							if (!n) return;
							let r = Er(n, e.tabSize),
								s = 0,
								o = Ic(e, Math.max(0, r - Bc(e)));
							for (
								;
								s < n.length &&
								s < o.length &&
								n.charCodeAt(s) == o.charCodeAt(s);
							)
								s++;
							i.push({
								from: t.from + s,
								to: t.from + n.length,
								insert: o.slice(s),
							});
						}),
						{ userEvent: "delete.dedent" },
					),
				),
				!0),
		},
		{
			key: "Mod-]",
			run: ({ state: e, dispatch: t }) =>
				!e.readOnly &&
				(t(
					e.update(
						iO(e, (t, i) => {
							i.push({ from: t.from, insert: e.facet(Dc) });
						}),
						{ userEvent: "input.indent" },
					),
				),
				!0),
		},
		{
			key: "Mod-Alt-\\",
			run: ({ state: e, dispatch: t }) => {
				if (e.readOnly) return !1;
				let i = Object.create(null),
					n = new Gc(e, {
						overrideIndentation: (e) => {
							let t = i[e];
							return null == t ? -1 : t;
						},
					}),
					r = iO(e, (t, r, s) => {
						let o = Uc(n, t.from);
						if (null == o) return;
						/\S/.test(t.text) || (o = 0);
						let a = /^\s*/.exec(t.text)[0],
							l = Ic(e, o);
						(a != l || s.from < t.from + a.length) &&
							((i[t.from] = o),
							r.push({ from: t.from, to: t.from + a.length, insert: l }));
					});
				return r.changes.empty || t(e.update(r, { userEvent: "indent" })), !0;
			},
		},
		{
			key: "Shift-Mod-k",
			run: (e) => {
				if (e.state.readOnly) return !1;
				let { state: t } = e,
					i = t.changes(
						Hf(t).map(
							({ from: e, to: i }) => (
								e > 0 ? e-- : i < t.doc.length && i++, { from: e, to: i }
							),
						),
					),
					n = hf(t.selection, (t) => {
						let i;
						if (e.lineWrapping) {
							let n = e.lineBlockAt(t.head),
								r = e.coordsAtPos(t.head, t.assoc || 1);
							r &&
								(i =
									n.bottom +
									e.documentTop -
									r.bottom +
									e.defaultLineHeight / 2);
						}
						return e.moveVertically(t, !0, i);
					}).map(i);
				return (
					e.dispatch({
						changes: i,
						selection: n,
						scrollIntoView: !0,
						userEvent: "delete.line",
					}),
					!0
				);
			},
		},
		{
			key: "Shift-Mod-\\",
			run: ({ state: e, dispatch: t }) =>
				(function (e, t) {
					let i = !1,
						n = hf(e.selection, (t) => {
							let n =
								uu(e, t.head, -1) ||
								uu(e, t.head, 1) ||
								(t.head > 0 && uu(e, t.head - 1, 1)) ||
								(t.head < e.doc.length && uu(e, t.head + 1, -1));
							if (!n || !n.end) return t;
							i = !0;
							let r = n.start.from == t.head ? n.end.to : n.end.from;
							return _n.cursor(r);
						});
					return !!i && (t(cf(e, n)), !0);
				})(e, t),
		},
		{
			key: "Mod-/",
			run: (e) => {
				let { state: t } = e,
					i = t.doc.lineAt(t.selection.main.from),
					n = ju(e.state, i.from);
				return n.line ? Cu(e) : !!n.block && Mu(e);
			},
		},
		{ key: "Alt-A", run: Ru },
		{
			key: "Ctrl-m",
			mac: "Shift-Alt-m",
			run: (e) => (e.setTabFocusMode(), !0),
		},
	].concat(rO);
class oO {
	constructor(e, t, i, n) {
		(this.state = e),
			(this.pos = t),
			(this.explicit = i),
			(this.view = n),
			(this.abortListeners = []),
			(this.abortOnDocChange = !1);
	}
	tokenBefore(e) {
		let t = Xc(this.state).resolveInner(this.pos, -1);
		for (; t && e.indexOf(t.name) < 0; ) t = t.parent;
		return t
			? {
					from: t.from,
					to: this.pos,
					text: this.state.sliceDoc(t.from, this.pos),
					type: t.type,
				}
			: null;
	}
	matchBefore(e) {
		let t = this.state.doc.lineAt(this.pos),
			i = Math.max(t.from, this.pos - 250),
			n = t.text.slice(i - t.from, this.pos - t.from),
			r = n.search(
				(function (e) {
					var t;
					let { source: i } = e,
						n = "$" != i[i.length - 1];
					return n
						? new RegExp(
								`(?:${i})${n ? "$" : ""}`,
								null !== (t = e.flags) && void 0 !== t
									? t
									: e.ignoreCase
										? "i"
										: "",
							)
						: e;
				})(e),
			);
		return r < 0 ? null : { from: i + r, to: this.pos, text: n.slice(r) };
	}
	get aborted() {
		return null == this.abortListeners;
	}
	addEventListener(e, t, i) {
		"abort" == e &&
			this.abortListeners &&
			(this.abortListeners.push(t),
			i && i.onDocChange && (this.abortOnDocChange = !0));
	}
}
function aO(e) {
	let t = Object.keys(e).join(""),
		i = /\w/.test(t);
	return (
		i && (t = t.replace(/\w/g, "")),
		`[${i ? "\\w" : ""}${t.replace(/[^\w\s]/g, "\\$&")}]`
	);
}
function lO(e) {
	let t = e.map((e) => ("string" == typeof e ? { label: e } : e)),
		[i, n] = t.every((e) => /^\w+$/.test(e.label))
			? [/\w*$/, /\w+$/]
			: (function (e) {
					let t = Object.create(null),
						i = Object.create(null);
					for (let { label: n } of e) {
						t[n[0]] = !0;
						for (let e = 1; e < n.length; e++) i[n[e]] = !0;
					}
					let n = aO(t) + aO(i) + "*$";
					return [new RegExp("^" + n), new RegExp(n)];
				})(t);
	return (e) => {
		let r = e.matchBefore(n);
		return r || e.explicit
			? { from: r ? r.from : e.pos, options: t, validFor: i }
			: null;
	};
}
function hO(e, t) {
	return (i) => {
		for (let t = Xc(i.state).resolveInner(i.pos, -1); t; t = t.parent) {
			if (e.indexOf(t.name) > -1) return null;
			if (t.type.isTop) break;
		}
		return t(i);
	};
}
const cO = sr.define(),
	uO = Gl.baseTheme({
		".cm-tooltip.cm-tooltip-autocomplete": {
			"& > ul": {
				fontFamily: "monospace",
				whiteSpace: "nowrap",
				overflow: "hidden auto",
				maxWidth_fallback: "700px",
				maxWidth: "min(700px, 95vw)",
				minWidth: "250px",
				maxHeight: "10em",
				height: "100%",
				listStyle: "none",
				margin: 0,
				padding: 0,
				"& > li, & > completion-section": {
					padding: "1px 3px",
					lineHeight: 1.2,
				},
				"& > li": {
					overflowX: "hidden",
					textOverflow: "ellipsis",
					cursor: "pointer",
				},
				"& > completion-section": {
					display: "list-item",
					borderBottom: "1px solid silver",
					paddingLeft: "0.5em",
					opacity: 0.7,
				},
			},
		},
		"&light .cm-tooltip-autocomplete ul li[aria-selected]": {
			background: "#17c",
			color: "white",
		},
		"&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
			background: "#777",
		},
		"&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
			background: "#347",
			color: "white",
		},
		"&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
			background: "#444",
		},
		".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":
			{ content: '"···"', opacity: 0.5, display: "block", textAlign: "center" },
		".cm-tooltip.cm-completionInfo": {
			position: "absolute",
			padding: "3px 9px",
			width: "max-content",
			maxWidth: "400px",
			boxSizing: "border-box",
			whiteSpace: "pre-line",
		},
		".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
		".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
		".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
		".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
		"&light .cm-snippetField": { backgroundColor: "#00000022" },
		"&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
		".cm-snippetFieldPosition": {
			verticalAlign: "text-top",
			width: 0,
			height: "1.15em",
			display: "inline-block",
			margin: "0 -0.7px -.7em",
			borderLeft: "1.4px dotted #888",
		},
		".cm-completionMatchedText": { textDecoration: "underline" },
		".cm-completionDetail": { marginLeft: "0.5em", fontStyle: "italic" },
		".cm-completionIcon": {
			fontSize: "90%",
			width: ".8em",
			display: "inline-block",
			textAlign: "center",
			paddingRight: ".6em",
			opacity: "0.6",
			boxSizing: "content-box",
		},
		".cm-completionIcon-function, .cm-completionIcon-method": {
			"&:after": { content: "'ƒ'" },
		},
		".cm-completionIcon-class": { "&:after": { content: "'○'" } },
		".cm-completionIcon-interface": { "&:after": { content: "'◌'" } },
		".cm-completionIcon-variable": { "&:after": { content: "'𝑥'" } },
		".cm-completionIcon-constant": { "&:after": { content: "'𝐶'" } },
		".cm-completionIcon-type": { "&:after": { content: "'𝑡'" } },
		".cm-completionIcon-enum": { "&:after": { content: "'∪'" } },
		".cm-completionIcon-property": { "&:after": { content: "'□'" } },
		".cm-completionIcon-keyword": { "&:after": { content: "'🔑︎'" } },
		".cm-completionIcon-namespace": { "&:after": { content: "'▢'" } },
		".cm-completionIcon-text": {
			"&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" },
		},
	});
class fO {
	constructor(e, t, i, n) {
		(this.field = e), (this.line = t), (this.from = i), (this.to = n);
	}
}
class OO {
	constructor(e, t, i) {
		(this.field = e), (this.from = t), (this.to = i);
	}
	map(e) {
		let t = e.mapPos(this.from, -1, bn.TrackDel),
			i = e.mapPos(this.to, 1, bn.TrackDel);
		return null == t || null == i ? null : new OO(this.field, t, i);
	}
}
class dO {
	constructor(e, t) {
		(this.lines = e), (this.fieldPositions = t);
	}
	instantiate(e, t) {
		let i = [],
			n = [t],
			r = e.doc.lineAt(t),
			s = /^\s*/.exec(r.text)[0];
		for (let r of this.lines) {
			if (i.length) {
				let i = s,
					o = /^\t*/.exec(r)[0].length;
				for (let t = 0; t < o; t++) i += e.facet(Dc);
				n.push(t + i.length - o), (r = i + r.slice(o));
			}
			i.push(r), (t += r.length + 1);
		}
		let o = this.fieldPositions.map(
			(e) => new OO(e.field, n[e.line] + e.from, n[e.line] + e.to),
		);
		return { text: i, ranges: o };
	}
	static parse(e) {
		let t,
			i = [],
			n = [],
			r = [];
		for (let s of e.split(/\r\n?|\n/)) {
			for (
				;
				(t = /[#$]\{(?:(\d+)(?::([^}]*))?|((?:\\[{}]|[^}])*))\}/.exec(s));
			) {
				let e = t[1] ? +t[1] : null,
					o = t[2] || t[3] || "",
					a = -1,
					l = o.replace(/\\[{}]/g, (e) => e[1]);
				for (let t = 0; t < i.length; t++)
					(null != e ? i[t].seq == e : l && i[t].name == l) && (a = t);
				if (a < 0) {
					let t = 0;
					for (
						;
						t < i.length && (null == e || (null != i[t].seq && i[t].seq < e));
					)
						t++;
					i.splice(t, 0, { seq: e, name: l }), (a = t);
					for (let e of r) e.field >= a && e.field++;
				}
				r.push(new fO(a, n.length, t.index, t.index + l.length)),
					(s = s.slice(0, t.index) + o + s.slice(t.index + t[0].length));
			}
			(s = s.replace(/\\([{}])/g, (e, t, i) => {
				for (let e of r) e.line == n.length && e.from > i && (e.from--, e.to--);
				return t;
			})),
				n.push(s);
		}
		return new dO(n, r);
	}
}
let pO = Ks.widget({
		widget: new (class extends Hs {
			toDOM() {
				let e = document.createElement("span");
				return (e.className = "cm-snippetFieldPosition"), e;
			}
			ignoreEvent() {
				return !1;
			}
		})(),
	}),
	mO = Ks.mark({ class: "cm-snippetField" });
class gO {
	constructor(e, t) {
		(this.ranges = e),
			(this.active = t),
			(this.deco = Ks.set(
				e.map((e) => (e.from == e.to ? pO : mO).range(e.from, e.to)),
			));
	}
	map(e) {
		let t = [];
		for (let i of this.ranges) {
			let n = i.map(e);
			if (!n) return null;
			t.push(n);
		}
		return new gO(t, this.active);
	}
	selectionInsideField(e) {
		return e.ranges.every((e) =>
			this.ranges.some(
				(t) => t.field == this.active && t.from <= e.from && t.to >= e.to,
			),
		);
	}
}
const xO = lr.define({ map: (e, t) => e && e.map(t) }),
	bO = lr.define(),
	SO = Vn.define({
		create: () => null,
		update(e, t) {
			for (let i of t.effects) {
				if (i.is(xO)) return i.value;
				if (i.is(bO) && e) return new gO(e.ranges, i.value);
			}
			return (
				e && t.docChanged && (e = e.map(t.changes)),
				e && t.selection && !e.selectionInsideField(t.selection) && (e = null),
				e
			);
		},
		provide: (e) => Gl.decorations.from(e, (e) => (e ? e.deco : Ks.none)),
	});
function yO(e, t) {
	return _n.create(
		e.filter((e) => e.field == t).map((e) => _n.range(e.from, e.to)),
	);
}
function QO(e) {
	let t = dO.parse(e);
	return (e, i, n, r) => {
		let { text: s, ranges: o } = t.instantiate(e.state, n),
			{ main: a } = e.state.selection,
			l = {
				changes: { from: n, to: r == a.from ? a.to : r, insert: an.of(s) },
				scrollIntoView: !0,
				annotations: i ? [cO.of(i), hr.userEvent.of("input.complete")] : void 0,
			};
		if ((o.length && (l.selection = yO(o, 0)), o.some((e) => e.field > 0))) {
			let t = new gO(o, 0),
				i = (l.effects = [xO.of(t)]);
			void 0 === e.state.field(SO, !1) &&
				i.push(lr.appendConfig.of([SO, $O, ZO, uO]));
		}
		e.dispatch(e.state.update(l));
	};
}
function wO(e) {
	return ({ state: t, dispatch: i }) => {
		let n = t.field(SO, !1);
		if (!n || (e < 0 && 0 == n.active)) return !1;
		let r = n.active + e,
			s = e > 0 && !n.ranges.some((t) => t.field == r + e);
		return (
			i(
				t.update({
					selection: yO(n.ranges, r),
					effects: xO.of(s ? null : new gO(n.ranges, r)),
					scrollIntoView: !0,
				}),
			),
			!0
		);
	};
}
const kO = [
		{ key: "Tab", run: wO(1), shift: wO(-1) },
		{
			key: "Escape",
			run: ({ state: e, dispatch: t }) =>
				!!e.field(SO, !1) && (t(e.update({ effects: xO.of(null) })), !0),
		},
	],
	vO = An.define({ combine: (e) => (e.length ? e[0] : kO) }),
	$O = Bn.highest(ih.compute([vO], (e) => e.facet(vO)));
function PO(e, t) {
	return Object.assign(Object.assign({}, t), { apply: QO(e) });
}
const ZO = Gl.domEventHandlers({
		mousedown(e, t) {
			let i,
				n = t.state.field(SO, !1);
			if (!n || null == (i = t.posAtCoords({ x: e.clientX, y: e.clientY })))
				return !1;
			let r = n.ranges.find((e) => e.from <= i && e.to >= i);
			return (
				!(!r || r.field == n.active) &&
				(t.dispatch({
					selection: yO(n.ranges, r.field),
					effects: xO.of(
						n.ranges.some((e) => e.field > r.field)
							? new gO(n.ranges, r.field)
							: null,
					),
					scrollIntoView: !0,
				}),
				!0)
			);
		},
	}),
	_O = new (class extends yr {})();
(_O.startSide = 1), (_O.endSide = -1);
class TO {
	static create(e, t, i, n, r) {
		return new TO(e, t, i, (n + (n << 8) + e + (t << 4)) | 0, r, [], []);
	}
	constructor(e, t, i, n, r, s, o) {
		(this.type = e),
			(this.value = t),
			(this.from = i),
			(this.hash = n),
			(this.end = r),
			(this.children = s),
			(this.positions = o),
			(this.hashProp = [[uh.contextHash, n]]);
	}
	addChild(e, t) {
		e.prop(uh.contextHash) != this.hash &&
			(e = new bh(e.type, e.children, e.positions, e.length, this.hashProp)),
			this.children.push(e),
			this.positions.push(t);
	}
	toTree(e, t = this.end) {
		let i = this.children.length - 1;
		return (
			i >= 0 &&
				(t = Math.max(
					t,
					this.positions[i] + this.children[i].length + this.from,
				)),
			new bh(
				e.types[this.type],
				this.children,
				this.positions,
				t - this.from,
			).balance({
				makeTree: (e, t, i) => new bh(dh.none, e, t, i, this.hashProp),
			})
		);
	}
}
var XO;
!(function (e) {
	(e[(e.Document = 1)] = "Document"),
		(e[(e.CodeBlock = 2)] = "CodeBlock"),
		(e[(e.FencedCode = 3)] = "FencedCode"),
		(e[(e.Blockquote = 4)] = "Blockquote"),
		(e[(e.HorizontalRule = 5)] = "HorizontalRule"),
		(e[(e.BulletList = 6)] = "BulletList"),
		(e[(e.OrderedList = 7)] = "OrderedList"),
		(e[(e.ListItem = 8)] = "ListItem"),
		(e[(e.ATXHeading1 = 9)] = "ATXHeading1"),
		(e[(e.ATXHeading2 = 10)] = "ATXHeading2"),
		(e[(e.ATXHeading3 = 11)] = "ATXHeading3"),
		(e[(e.ATXHeading4 = 12)] = "ATXHeading4"),
		(e[(e.ATXHeading5 = 13)] = "ATXHeading5"),
		(e[(e.ATXHeading6 = 14)] = "ATXHeading6"),
		(e[(e.SetextHeading1 = 15)] = "SetextHeading1"),
		(e[(e.SetextHeading2 = 16)] = "SetextHeading2"),
		(e[(e.HTMLBlock = 17)] = "HTMLBlock"),
		(e[(e.LinkReference = 18)] = "LinkReference"),
		(e[(e.Paragraph = 19)] = "Paragraph"),
		(e[(e.CommentBlock = 20)] = "CommentBlock"),
		(e[(e.ProcessingInstructionBlock = 21)] = "ProcessingInstructionBlock"),
		(e[(e.Escape = 22)] = "Escape"),
		(e[(e.Entity = 23)] = "Entity"),
		(e[(e.HardBreak = 24)] = "HardBreak"),
		(e[(e.Emphasis = 25)] = "Emphasis"),
		(e[(e.StrongEmphasis = 26)] = "StrongEmphasis"),
		(e[(e.Link = 27)] = "Link"),
		(e[(e.Image = 28)] = "Image"),
		(e[(e.InlineCode = 29)] = "InlineCode"),
		(e[(e.HTMLTag = 30)] = "HTMLTag"),
		(e[(e.Comment = 31)] = "Comment"),
		(e[(e.ProcessingInstruction = 32)] = "ProcessingInstruction"),
		(e[(e.Autolink = 33)] = "Autolink"),
		(e[(e.HeaderMark = 34)] = "HeaderMark"),
		(e[(e.QuoteMark = 35)] = "QuoteMark"),
		(e[(e.ListMark = 36)] = "ListMark"),
		(e[(e.LinkMark = 37)] = "LinkMark"),
		(e[(e.EmphasisMark = 38)] = "EmphasisMark"),
		(e[(e.CodeMark = 39)] = "CodeMark"),
		(e[(e.CodeText = 40)] = "CodeText"),
		(e[(e.CodeInfo = 41)] = "CodeInfo"),
		(e[(e.LinkTitle = 42)] = "LinkTitle"),
		(e[(e.LinkLabel = 43)] = "LinkLabel"),
		(e[(e.URL = 44)] = "URL");
})(XO || (XO = {}));
class AO {
	constructor(e, t) {
		(this.start = e),
			(this.content = t),
			(this.marks = []),
			(this.parsers = []);
	}
}
class CO {
	constructor() {
		(this.text = ""),
			(this.baseIndent = 0),
			(this.basePos = 0),
			(this.depth = 0),
			(this.markers = []),
			(this.pos = 0),
			(this.indent = 0),
			(this.next = -1);
	}
	forward() {
		this.basePos > this.pos && this.forwardInner();
	}
	forwardInner() {
		let e = this.skipSpace(this.basePos);
		(this.indent = this.countIndent(e, this.pos, this.indent)),
			(this.pos = e),
			(this.next = e == this.text.length ? -1 : this.text.charCodeAt(e));
	}
	skipSpace(e) {
		return EO(this.text, e);
	}
	reset(e) {
		for (
			this.text = e,
				this.baseIndent = this.basePos = this.pos = this.indent = 0,
				this.forwardInner(),
				this.depth = 1;
			this.markers.length;
		)
			this.markers.pop();
	}
	moveBase(e) {
		(this.basePos = e),
			(this.baseIndent = this.countIndent(e, this.pos, this.indent));
	}
	moveBaseColumn(e) {
		(this.baseIndent = e), (this.basePos = this.findColumn(e));
	}
	addMarker(e) {
		this.markers.push(e);
	}
	countIndent(e, t = 0, i = 0) {
		for (let n = t; n < e; n++)
			i += 9 == this.text.charCodeAt(n) ? 4 - (i % 4) : 1;
		return i;
	}
	findColumn(e) {
		let t = 0;
		for (let i = 0; t < this.text.length && i < e; t++)
			i += 9 == this.text.charCodeAt(t) ? 4 - (i % 4) : 1;
		return t;
	}
	scrub() {
		if (!this.baseIndent) return this.text;
		let e = "";
		for (let t = 0; t < this.basePos; t++) e += " ";
		return e + this.text.slice(this.basePos);
	}
}
function RO(e, t, i) {
	if (
		i.pos == i.text.length ||
		(e != t.block && i.indent >= t.stack[i.depth + 1].value + i.baseIndent)
	)
		return !0;
	if (i.indent >= i.baseIndent + 4) return !1;
	let n = (e.type == XO.OrderedList ? DO : YO)(i, t, !1);
	return (
		n > 0 &&
		(e.type != XO.BulletList || WO(i, t, !1) < 0) &&
		i.text.charCodeAt(i.pos + n - 1) == e.value
	);
}
const MO = {
	[XO.Blockquote]: (e, t, i) =>
		62 == i.next &&
		(i.markers.push(
			xd(XO.QuoteMark, t.lineStart + i.pos, t.lineStart + i.pos + 1),
		),
		i.moveBase(i.pos + (jO(i.text.charCodeAt(i.pos + 1)) ? 2 : 1)),
		(e.end = t.lineStart + i.text.length),
		!0),
	[XO.ListItem]: (e, t, i) =>
		!(i.indent < i.baseIndent + e.value && i.next > -1) &&
		(i.moveBaseColumn(i.baseIndent + e.value), !0),
	[XO.OrderedList]: RO,
	[XO.BulletList]: RO,
	[XO.Document]: () => !0,
};
function jO(e) {
	return 32 == e || 9 == e || 10 == e || 13 == e;
}
function EO(e, t = 0) {
	for (; t < e.length && jO(e.charCodeAt(t)); ) t++;
	return t;
}
function qO(e, t, i) {
	for (; t > i && jO(e.charCodeAt(t - 1)); ) t--;
	return t;
}
function VO(e) {
	if (96 != e.next && 126 != e.next) return -1;
	let t = e.pos + 1;
	for (; t < e.text.length && e.text.charCodeAt(t) == e.next; ) t++;
	if (t < e.pos + 3) return -1;
	if (96 == e.next)
		for (let i = t; i < e.text.length; i++)
			if (96 == e.text.charCodeAt(i)) return -1;
	return t;
}
function LO(e) {
	return 62 != e.next ? -1 : 32 == e.text.charCodeAt(e.pos + 1) ? 2 : 1;
}
function WO(e, t, i) {
	if (42 != e.next && 45 != e.next && 95 != e.next) return -1;
	let n = 1;
	for (let t = e.pos + 1; t < e.text.length; t++) {
		let i = e.text.charCodeAt(t);
		if (i == e.next) n++;
		else if (!jO(i)) return -1;
	}
	return (i &&
		45 == e.next &&
		IO(e) > -1 &&
		e.depth == t.stack.length &&
		t.parser.leafBlockParsers.indexOf(rd.SetextHeading) > -1) ||
		n < 3
		? -1
		: 1;
}
function zO(e, t) {
	for (let i = e.stack.length - 1; i >= 0; i--)
		if (e.stack[i].type == t) return !0;
	return !1;
}
function YO(e, t, i) {
	return (45 != e.next && 43 != e.next && 42 != e.next) ||
		(e.pos != e.text.length - 1 && !jO(e.text.charCodeAt(e.pos + 1))) ||
		!(!i || zO(t, XO.BulletList) || e.skipSpace(e.pos + 2) < e.text.length)
		? -1
		: 1;
}
function DO(e, t, i) {
	let n = e.pos,
		r = e.next;
	for (; r >= 48 && r <= 57; ) {
		if ((n++, n == e.text.length)) return -1;
		r = e.text.charCodeAt(n);
	}
	return n == e.pos ||
		n > e.pos + 9 ||
		(46 != r && 41 != r) ||
		(n < e.text.length - 1 && !jO(e.text.charCodeAt(n + 1))) ||
		(i &&
			!zO(t, XO.OrderedList) &&
			(e.skipSpace(n + 1) == e.text.length || n > e.pos + 1 || 49 != e.next))
		? -1
		: n + 1 - e.pos;
}
function BO(e) {
	if (35 != e.next) return -1;
	let t = e.pos + 1;
	for (; t < e.text.length && 35 == e.text.charCodeAt(t); ) t++;
	if (t < e.text.length && 32 != e.text.charCodeAt(t)) return -1;
	let i = t - e.pos;
	return i > 6 ? -1 : i;
}
function IO(e) {
	if ((45 != e.next && 61 != e.next) || e.indent >= e.baseIndent + 4) return -1;
	let t = e.pos + 1;
	for (; t < e.text.length && e.text.charCodeAt(t) == e.next; ) t++;
	let i = t;
	for (; t < e.text.length && jO(e.text.charCodeAt(t)); ) t++;
	return t == e.text.length ? i : -1;
}
const UO = /^[ \t]*$/,
	GO = /-->/,
	NO = /\?>/,
	HO = [
		[/^<(?:script|pre|style)(?:\s|>|$)/i, /<\/(?:script|pre|style)>/i],
		[/^\s*<!--/, GO],
		[/^\s*<\?/, NO],
		[/^\s*<![A-Z]/, />/],
		[/^\s*<!\[CDATA\[/, /\]\]>/],
		[
			/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i,
			UO,
		],
		[
			/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i,
			UO,
		],
	];
function FO(e, t, i) {
	if (60 != e.next) return -1;
	let n = e.text.slice(e.pos);
	for (let e = 0, t = HO.length - (i ? 1 : 0); e < t; e++)
		if (HO[e][0].test(n)) return e;
	return -1;
}
function KO(e, t) {
	let i = e.countIndent(t, e.pos, e.indent),
		n = e.countIndent(e.skipSpace(t), t, i);
	return n >= i + 5 ? i + 1 : n;
}
function JO(e, t, i) {
	let n = e.length - 1;
	n >= 0 && e[n].to == t && e[n].type == XO.CodeText
		? (e[n].to = i)
		: e.push(xd(XO.CodeText, t, i));
}
const ed = {
	LinkReference: void 0,
	IndentedCode(e, t) {
		let i = t.baseIndent + 4;
		if (t.indent < i) return !1;
		let n = t.findColumn(i),
			r = e.lineStart + n,
			s = e.lineStart + t.text.length,
			o = [],
			a = [];
		for (JO(o, r, s); e.nextLine() && t.depth >= e.stack.length; )
			if (t.pos == t.text.length) {
				JO(a, e.lineStart - 1, e.lineStart);
				for (let e of t.markers) a.push(e);
			} else {
				if (t.indent < i) break;
				{
					if (a.length) {
						for (let e of a)
							e.type == XO.CodeText ? JO(o, e.from, e.to) : o.push(e);
						a = [];
					}
					JO(o, e.lineStart - 1, e.lineStart);
					for (let e of t.markers) o.push(e);
					s = e.lineStart + t.text.length;
					let i = e.lineStart + t.findColumn(t.baseIndent + 4);
					i < s && JO(o, i, s);
				}
			}
		return (
			a.length &&
				((a = a.filter((e) => e.type != XO.CodeText)),
				a.length && (t.markers = a.concat(t.markers))),
			e.addNode(e.buffer.writeElements(o, -r).finish(XO.CodeBlock, s - r), r),
			!0
		);
	},
	FencedCode(e, t) {
		let i = VO(t);
		if (i < 0) return !1;
		let n = e.lineStart + t.pos,
			r = t.next,
			s = i - t.pos,
			o = t.skipSpace(i),
			a = qO(t.text, t.text.length, o),
			l = [xd(XO.CodeMark, n, n + s)];
		o < a && l.push(xd(XO.CodeInfo, e.lineStart + o, e.lineStart + a));
		for (let i = !0; e.nextLine() && t.depth >= e.stack.length; i = !1) {
			let n = t.pos;
			if (t.indent - t.baseIndent < 4)
				for (; n < t.text.length && t.text.charCodeAt(n) == r; ) n++;
			if (n - t.pos >= s && t.skipSpace(n) == t.text.length) {
				for (let e of t.markers) l.push(e);
				l.push(xd(XO.CodeMark, e.lineStart + t.pos, e.lineStart + n)),
					e.nextLine();
				break;
			}
			{
				i || JO(l, e.lineStart - 1, e.lineStart);
				for (let e of t.markers) l.push(e);
				let n = e.lineStart + t.basePos,
					r = e.lineStart + t.text.length;
				n < r && JO(l, n, r);
			}
		}
		return (
			e.addNode(
				e.buffer
					.writeElements(l, -n)
					.finish(XO.FencedCode, e.prevLineEnd() - n),
				n,
			),
			!0
		);
	},
	Blockquote(e, t) {
		let i = LO(t);
		return (
			!(i < 0) &&
			(e.startContext(XO.Blockquote, t.pos),
			e.addNode(XO.QuoteMark, e.lineStart + t.pos, e.lineStart + t.pos + 1),
			t.moveBase(t.pos + i),
			null)
		);
	},
	HorizontalRule(e, t) {
		if (WO(t, e, !1) < 0) return !1;
		let i = e.lineStart + t.pos;
		return e.nextLine(), e.addNode(XO.HorizontalRule, i), !0;
	},
	BulletList(e, t) {
		let i = YO(t, e, !1);
		if (i < 0) return !1;
		e.block.type != XO.BulletList &&
			e.startContext(XO.BulletList, t.basePos, t.next);
		let n = KO(t, t.pos + 1);
		return (
			e.startContext(XO.ListItem, t.basePos, n - t.baseIndent),
			e.addNode(XO.ListMark, e.lineStart + t.pos, e.lineStart + t.pos + i),
			t.moveBaseColumn(n),
			null
		);
	},
	OrderedList(e, t) {
		let i = DO(t, e, !1);
		if (i < 0) return !1;
		e.block.type != XO.OrderedList &&
			e.startContext(
				XO.OrderedList,
				t.basePos,
				t.text.charCodeAt(t.pos + i - 1),
			);
		let n = KO(t, t.pos + i);
		return (
			e.startContext(XO.ListItem, t.basePos, n - t.baseIndent),
			e.addNode(XO.ListMark, e.lineStart + t.pos, e.lineStart + t.pos + i),
			t.moveBaseColumn(n),
			null
		);
	},
	ATXHeading(e, t) {
		let i = BO(t);
		if (i < 0) return !1;
		let n = t.pos,
			r = e.lineStart + n,
			s = qO(t.text, t.text.length, n),
			o = s;
		for (; o > n && t.text.charCodeAt(o - 1) == t.next; ) o--;
		(o != s && o != n && jO(t.text.charCodeAt(o - 1))) || (o = t.text.length);
		let a = e.buffer
			.write(XO.HeaderMark, 0, i)
			.writeElements(
				e.parser.parseInline(t.text.slice(n + i + 1, o), r + i + 1),
				-r,
			);
		o < t.text.length && a.write(XO.HeaderMark, o - n, s - n);
		let l = a.finish(XO.ATXHeading1 - 1 + i, t.text.length - n);
		return e.nextLine(), e.addNode(l, r), !0;
	},
	HTMLBlock(e, t) {
		let i = FO(t, 0, !1);
		if (i < 0) return !1;
		let n = e.lineStart + t.pos,
			r = HO[i][1],
			s = [],
			o = r != UO;
		for (; !r.test(t.text) && e.nextLine(); ) {
			if (t.depth < e.stack.length) {
				o = !1;
				break;
			}
			for (let e of t.markers) s.push(e);
		}
		o && e.nextLine();
		let a =
				r == GO
					? XO.CommentBlock
					: r == NO
						? XO.ProcessingInstructionBlock
						: XO.HTMLBlock,
			l = e.prevLineEnd();
		return e.addNode(e.buffer.writeElements(s, -n).finish(a, l - n), n), !0;
	},
	SetextHeading: void 0,
};
class td {
	constructor(e) {
		(this.stage = 0),
			(this.elts = []),
			(this.pos = 0),
			(this.start = e.start),
			this.advance(e.content);
	}
	nextLine(e, t, i) {
		if (-1 == this.stage) return !1;
		let n = i.content + "\n" + t.scrub(),
			r = this.advance(n);
		return r > -1 && r < n.length && this.complete(e, i, r);
	}
	finish(e, t) {
		return (
			(2 == this.stage || 3 == this.stage) &&
			EO(t.content, this.pos) == t.content.length &&
			this.complete(e, t, t.content.length)
		);
	}
	complete(e, t, i) {
		return (
			e.addLeafElement(
				t,
				xd(XO.LinkReference, this.start, this.start + i, this.elts),
			),
			!0
		);
	}
	nextStage(e) {
		return e
			? ((this.pos = e.to - this.start), this.elts.push(e), this.stage++, !0)
			: (!1 === e && (this.stage = -1), !1);
	}
	advance(e) {
		for (;;) {
			if (-1 == this.stage) return -1;
			if (0 == this.stage) {
				if (!this.nextStage(Td(e, this.pos, this.start, !0))) return -1;
				if (58 != e.charCodeAt(this.pos)) return (this.stage = -1);
				this.elts.push(
					xd(XO.LinkMark, this.pos + this.start, this.pos + this.start + 1),
				),
					this.pos++;
			} else {
				if (1 != this.stage) {
					if (2 == this.stage) {
						let t = EO(e, this.pos),
							i = 0;
						if (t > this.pos) {
							let n = _d(e, t, this.start);
							if (n) {
								let t = id(e, n.to - this.start);
								t > 0 && (this.nextStage(n), (i = t));
							}
						}
						return i || (i = id(e, this.pos)), i > 0 && i < e.length ? i : -1;
					}
					return id(e, this.pos);
				}
				if (!this.nextStage(Zd(e, EO(e, this.pos), this.start))) return -1;
			}
		}
	}
}
function id(e, t) {
	for (; t < e.length; t++) {
		let i = e.charCodeAt(t);
		if (10 == i) break;
		if (!jO(i)) return -1;
	}
	return t;
}
class nd {
	nextLine(e, t, i) {
		let n = t.depth < e.stack.length ? -1 : IO(t),
			r = t.next;
		if (n < 0) return !1;
		let s = xd(XO.HeaderMark, e.lineStart + t.pos, e.lineStart + n);
		return (
			e.nextLine(),
			e.addLeafElement(
				i,
				xd(
					61 == r ? XO.SetextHeading1 : XO.SetextHeading2,
					i.start,
					e.prevLineEnd(),
					[...e.parser.parseInline(i.content, i.start), s],
				),
			),
			!0
		);
	}
	finish() {
		return !1;
	}
}
const rd = {
		LinkReference: (e, t) => (91 == t.content.charCodeAt(0) ? new td(t) : null),
		SetextHeading: () => new nd(),
	},
	sd = [
		(e, t) => BO(t) >= 0,
		(e, t) => VO(t) >= 0,
		(e, t) => LO(t) >= 0,
		(e, t) => YO(t, e, !0) >= 0,
		(e, t) => DO(t, e, !0) >= 0,
		(e, t) => WO(t, e, !0) >= 0,
		(e, t) => FO(t, 0, !0) >= 0,
	],
	od = { text: "", end: 0 };
class ad {
	constructor(e, t, i, n) {
		(this.parser = e),
			(this.input = t),
			(this.ranges = n),
			(this.line = new CO()),
			(this.atEnd = !1),
			(this.reusePlaceholders = new Map()),
			(this.stoppedAt = null),
			(this.rangeI = 0),
			(this.to = n[n.length - 1].to),
			(this.lineStart =
				this.absoluteLineStart =
				this.absoluteLineEnd =
					n[0].from),
			(this.block = TO.create(XO.Document, 0, this.lineStart, 0, 0)),
			(this.stack = [this.block]),
			(this.fragments = i.length ? new Rd(i, t) : null),
			this.readLine();
	}
	get parsedPos() {
		return this.absoluteLineStart;
	}
	advance() {
		if (null != this.stoppedAt && this.absoluteLineStart > this.stoppedAt)
			return this.finish();
		let { line: e } = this;
		for (;;) {
			for (let t = 0; ; ) {
				let i =
					e.depth < this.stack.length
						? this.stack[this.stack.length - 1]
						: null;
				for (; t < e.markers.length && (!i || e.markers[t].from < i.end); ) {
					let i = e.markers[t++];
					this.addNode(i.type, i.from, i.to);
				}
				if (!i) break;
				this.finishContext();
			}
			if (e.pos < e.text.length) break;
			if (!this.nextLine()) return this.finish();
		}
		if (this.fragments && this.reuseFragment(e.basePos)) return null;
		e: for (;;) {
			for (let t of this.parser.blockParsers)
				if (t) {
					let i = t(this, e);
					if (0 != i) {
						if (1 == i) return null;
						e.forward();
						continue e;
					}
				}
			break;
		}
		let t = new AO(this.lineStart + e.pos, e.text.slice(e.pos));
		for (let e of this.parser.leafBlockParsers)
			if (e) {
				let i = e(this, t);
				i && t.parsers.push(i);
			}
		e: for (; this.nextLine() && e.pos != e.text.length; ) {
			if (e.indent < e.baseIndent + 4)
				for (let i of this.parser.endLeafBlock) if (i(this, e, t)) break e;
			for (let i of t.parsers) if (i.nextLine(this, e, t)) return null;
			t.content += "\n" + e.scrub();
			for (let i of e.markers) t.marks.push(i);
		}
		return this.finishLeaf(t), null;
	}
	stopAt(e) {
		if (null != this.stoppedAt && this.stoppedAt < e)
			throw new RangeError("Can't move stoppedAt forward");
		this.stoppedAt = e;
	}
	reuseFragment(e) {
		if (
			!this.fragments.moveTo(
				this.absoluteLineStart + e,
				this.absoluteLineStart,
			) ||
			!this.fragments.matches(this.block.hash)
		)
			return !1;
		let t = this.fragments.takeNodes(this);
		return (
			!!t &&
			((this.absoluteLineStart += t),
			(this.lineStart = Md(this.absoluteLineStart, this.ranges)),
			this.moveRangeI(),
			this.absoluteLineStart < this.to
				? (this.lineStart++, this.absoluteLineStart++, this.readLine())
				: ((this.atEnd = !0), this.readLine()),
			!0)
		);
	}
	get depth() {
		return this.stack.length;
	}
	parentType(e = this.depth - 1) {
		return this.parser.nodeSet.types[this.stack[e].type];
	}
	nextLine() {
		return (
			(this.lineStart += this.line.text.length),
			this.absoluteLineEnd >= this.to
				? ((this.absoluteLineStart = this.absoluteLineEnd),
					(this.atEnd = !0),
					this.readLine(),
					!1)
				: (this.lineStart++,
					(this.absoluteLineStart = this.absoluteLineEnd + 1),
					this.moveRangeI(),
					this.readLine(),
					!0)
		);
	}
	peekLine() {
		return this.scanLine(this.absoluteLineEnd + 1).text;
	}
	moveRangeI() {
		for (
			;
			this.rangeI < this.ranges.length - 1 &&
			this.absoluteLineStart >= this.ranges[this.rangeI].to;
		)
			this.rangeI++,
				(this.absoluteLineStart = Math.max(
					this.absoluteLineStart,
					this.ranges[this.rangeI].from,
				));
	}
	scanLine(e) {
		let t = od;
		if (((t.end = e), e >= this.to)) t.text = "";
		else if (
			((t.text = this.lineChunkAt(e)),
			(t.end += t.text.length),
			this.ranges.length > 1)
		) {
			let e = this.absoluteLineStart,
				i = this.rangeI;
			for (; this.ranges[i].to < t.end; ) {
				i++;
				let n = this.ranges[i].from,
					r = this.lineChunkAt(n);
				(t.end = n + r.length),
					(t.text = t.text.slice(0, this.ranges[i - 1].to - e) + r),
					(e = t.end - t.text.length);
			}
		}
		return t;
	}
	readLine() {
		let { line: e } = this,
			{ text: t, end: i } = this.scanLine(this.absoluteLineStart);
		for (
			this.absoluteLineEnd = i, e.reset(t);
			e.depth < this.stack.length;
			e.depth++
		) {
			let t = this.stack[e.depth],
				i = this.parser.skipContextMarkup[t.type];
			if (!i) throw new Error("Unhandled block context " + XO[t.type]);
			if (!i(t, this, e)) break;
			e.forward();
		}
	}
	lineChunkAt(e) {
		let t,
			i = this.input.chunk(e);
		if (this.input.lineChunks) t = "\n" == i ? "" : i;
		else {
			let e = i.indexOf("\n");
			t = e < 0 ? i : i.slice(0, e);
		}
		return e + t.length > this.to ? t.slice(0, this.to - e) : t;
	}
	prevLineEnd() {
		return this.atEnd ? this.lineStart : this.lineStart - 1;
	}
	startContext(e, t, i = 0) {
		(this.block = TO.create(
			e,
			i,
			this.lineStart + t,
			this.block.hash,
			this.lineStart + this.line.text.length,
		)),
			this.stack.push(this.block);
	}
	startComposite(e, t, i = 0) {
		this.startContext(this.parser.getNodeType(e), t, i);
	}
	addNode(e, t, i) {
		"number" == typeof e &&
			(e = new bh(
				this.parser.nodeSet.types[e],
				dd,
				dd,
				(null != i ? i : this.prevLineEnd()) - t,
			)),
			this.block.addChild(e, t - this.block.from);
	}
	addElement(e) {
		this.block.addChild(
			e.toTree(this.parser.nodeSet),
			e.from - this.block.from,
		);
	}
	addLeafElement(e, t) {
		this.addNode(
			this.buffer
				.writeElements(Ad(t.children, e.marks), -t.from)
				.finish(t.type, t.to - t.from),
			t.from,
		);
	}
	finishContext() {
		let e = this.stack.pop(),
			t = this.stack[this.stack.length - 1];
		t.addChild(e.toTree(this.parser.nodeSet), e.from - t.from),
			(this.block = t);
	}
	finish() {
		for (; this.stack.length > 1; ) this.finishContext();
		return this.addGaps(this.block.toTree(this.parser.nodeSet, this.lineStart));
	}
	addGaps(e) {
		return this.ranges.length > 1
			? ld(
					this.ranges,
					0,
					e.topNode,
					this.ranges[0].from,
					this.reusePlaceholders,
				)
			: e;
	}
	finishLeaf(e) {
		for (let t of e.parsers) if (t.finish(this, e)) return;
		let t = Ad(this.parser.parseInline(e.content, e.start), e.marks);
		this.addNode(
			this.buffer
				.writeElements(t, -e.start)
				.finish(XO.Paragraph, e.content.length),
			e.start,
		);
	}
	elt(e, t, i, n) {
		return "string" == typeof e
			? xd(this.parser.getNodeType(e), t, i, n)
			: new gd(e, t);
	}
	get buffer() {
		return new pd(this.parser.nodeSet);
	}
}
function ld(e, t, i, n, r) {
	let s = e[t].to,
		o = [],
		a = [],
		l = i.from + n;
	function h(i, r) {
		for (; r ? i >= s : i > s; ) {
			let r = e[t + 1].from - s;
			(n += r), (i += r), t++, (s = e[t].to);
		}
	}
	for (let c = i.firstChild; c; c = c.nextSibling) {
		h(c.from + n, !0);
		let i,
			u = c.from + n,
			f = r.get(c.tree);
		f
			? (i = f)
			: c.to + n > s
				? ((i = ld(e, t, c, n, r)), h(c.to + n, !1))
				: (i = c.toTree()),
			o.push(i),
			a.push(u - l);
	}
	return (
		h(i.to + n, !1),
		new bh(i.type, o, a, i.to + n - l, i.tree ? i.tree.propValues : void 0)
	);
}
class hd extends Vh {
	constructor(e, t, i, n, r, s, o, a, l) {
		super(),
			(this.nodeSet = e),
			(this.blockParsers = t),
			(this.leafBlockParsers = i),
			(this.blockNames = n),
			(this.endLeafBlock = r),
			(this.skipContextMarkup = s),
			(this.inlineParsers = o),
			(this.inlineNames = a),
			(this.wrappers = l),
			(this.nodeTypes = Object.create(null));
		for (let t of e.types) this.nodeTypes[t.name] = t.id;
	}
	createParse(e, t, i) {
		let n = new ad(this, e, t, i);
		for (let r of this.wrappers) n = r(n, e, t, i);
		return n;
	}
	configure(e) {
		let t = ud(e);
		if (!t) return this;
		let { nodeSet: i, skipContextMarkup: n } = this,
			r = this.blockParsers.slice(),
			s = this.leafBlockParsers.slice(),
			o = this.blockNames.slice(),
			a = this.inlineParsers.slice(),
			l = this.inlineNames.slice(),
			h = this.endLeafBlock.slice(),
			c = this.wrappers;
		if (cd(t.defineNodes)) {
			n = Object.assign({}, n);
			let e,
				r = i.types.slice();
			for (let i of t.defineNodes) {
				let {
					name: t,
					block: s,
					composite: o,
					style: a,
				} = "string" == typeof i ? { name: i } : i;
				if (r.some((e) => e.name == t)) continue;
				o && (n[r.length] = (e, t, i) => o(t, i, e.value));
				let l = r.length,
					h = o
						? ["Block", "BlockContext"]
						: s
							? l >= XO.ATXHeading1 && l <= XO.SetextHeading2
								? ["Block", "LeafBlock", "Heading"]
								: ["Block", "LeafBlock"]
							: void 0;
				r.push(dh.define({ id: l, name: t, props: h && [[uh.group, h]] })),
					a &&
						(e || (e = {}),
						Array.isArray(a) || a instanceof ic
							? (e[t] = a)
							: Object.assign(e, a));
			}
			(i = new ph(r)), e && (i = i.extend(sc(e)));
		}
		if ((cd(t.props) && (i = i.extend(...t.props)), cd(t.remove)))
			for (let e of t.remove) {
				let t = this.blockNames.indexOf(e),
					i = this.inlineNames.indexOf(e);
				t > -1 && (r[t] = s[t] = void 0), i > -1 && (a[i] = void 0);
			}
		if (cd(t.parseBlock))
			for (let e of t.parseBlock) {
				let t = o.indexOf(e.name);
				if (t > -1) (r[t] = e.parse), (s[t] = e.leaf);
				else {
					let t = e.before
						? fd(o, e.before)
						: e.after
							? fd(o, e.after) + 1
							: o.length - 1;
					r.splice(t, 0, e.parse),
						s.splice(t, 0, e.leaf),
						o.splice(t, 0, e.name);
				}
				e.endLeaf && h.push(e.endLeaf);
			}
		if (cd(t.parseInline))
			for (let e of t.parseInline) {
				let t = l.indexOf(e.name);
				if (t > -1) a[t] = e.parse;
				else {
					let t = e.before
						? fd(l, e.before)
						: e.after
							? fd(l, e.after) + 1
							: l.length - 1;
					a.splice(t, 0, e.parse), l.splice(t, 0, e.name);
				}
			}
		return t.wrap && (c = c.concat(t.wrap)), new hd(i, r, s, o, h, n, a, l, c);
	}
	getNodeType(e) {
		let t = this.nodeTypes[e];
		if (null == t) throw new RangeError(`Unknown node type '${e}'`);
		return t;
	}
	parseInline(e, t) {
		let i = new Xd(this, e, t);
		e: for (let e = t; e < i.end; ) {
			let t = i.char(e);
			for (let n of this.inlineParsers)
				if (n) {
					let r = n(i, t, e);
					if (r >= 0) {
						e = r;
						continue e;
					}
				}
			e++;
		}
		return i.resolveMarkers(0);
	}
}
function cd(e) {
	return null != e && e.length > 0;
}
function ud(e) {
	if (!Array.isArray(e)) return e;
	if (0 == e.length) return null;
	let t = ud(e[0]);
	if (1 == e.length) return t;
	let i = ud(e.slice(1));
	if (!i || !t) return t || i;
	let n = (e, t) => (e || dd).concat(t || dd),
		r = t.wrap,
		s = i.wrap;
	return {
		props: n(t.props, i.props),
		defineNodes: n(t.defineNodes, i.defineNodes),
		parseBlock: n(t.parseBlock, i.parseBlock),
		parseInline: n(t.parseInline, i.parseInline),
		remove: n(t.remove, i.remove),
		wrap: r ? (s ? (e, t, i, n) => r(s(e, t, i, n), t, i, n) : r) : s,
	};
}
function fd(e, t) {
	let i = e.indexOf(t);
	if (i < 0)
		throw new RangeError(`Position specified relative to unknown parser ${t}`);
	return i;
}
let Od = [dh.none];
for (let e, t = 1; (e = XO[t]); t++)
	Od[t] = dh.define({
		id: t,
		name: e,
		props:
			t >= XO.Escape
				? []
				: [
						[
							uh.group,
							t in MO ? ["Block", "BlockContext"] : ["Block", "LeafBlock"],
						],
					],
		top: "Document" == e,
	});
const dd = [];
class pd {
	constructor(e) {
		(this.nodeSet = e), (this.content = []), (this.nodes = []);
	}
	write(e, t, i, n = 0) {
		return this.content.push(e, t, i, 4 + 4 * n), this;
	}
	writeElements(e, t = 0) {
		for (let i of e) i.writeTo(this, t);
		return this;
	}
	finish(e, t) {
		return bh.build({
			buffer: this.content,
			nodeSet: this.nodeSet,
			reused: this.nodes,
			topID: e,
			length: t,
		});
	}
}
let md = class {
	constructor(e, t, i, n = dd) {
		(this.type = e), (this.from = t), (this.to = i), (this.children = n);
	}
	writeTo(e, t) {
		let i = e.content.length;
		e.writeElements(this.children, t),
			e.content.push(
				this.type,
				this.from + t,
				this.to + t,
				e.content.length + 4 - i,
			);
	}
	toTree(e) {
		return new pd(e)
			.writeElements(this.children, -this.from)
			.finish(this.type, this.to - this.from);
	}
};
class gd {
	constructor(e, t) {
		(this.tree = e), (this.from = t);
	}
	get to() {
		return this.from + this.tree.length;
	}
	get type() {
		return this.tree.type.id;
	}
	get children() {
		return dd;
	}
	writeTo(e, t) {
		e.nodes.push(this.tree),
			e.content.push(e.nodes.length - 1, this.from + t, this.to + t, -1);
	}
	toTree() {
		return this.tree;
	}
}
function xd(e, t, i, n) {
	return new md(e, t, i, n);
}
const bd = { resolve: "Emphasis", mark: "EmphasisMark" },
	Sd = { resolve: "Emphasis", mark: "EmphasisMark" },
	yd = {},
	Qd = {};
class wd {
	constructor(e, t, i, n) {
		(this.type = e), (this.from = t), (this.to = i), (this.side = n);
	}
}
const kd = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
let vd = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
	vd = new RegExp("[\\p{S}|\\p{P}]", "u");
} catch (e) {}
const $d = {
	Escape(e, t, i) {
		if (92 != t || i == e.end - 1) return -1;
		let n = e.char(i + 1);
		for (let t = 0; t < 32; t++)
			if (kd.charCodeAt(t) == n) return e.append(xd(XO.Escape, i, i + 2));
		return -1;
	},
	Entity(e, t, i) {
		if (38 != t) return -1;
		let n = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(e.slice(i + 1, i + 31));
		return n ? e.append(xd(XO.Entity, i, i + 1 + n[0].length)) : -1;
	},
	InlineCode(e, t, i) {
		if (96 != t || (i && 96 == e.char(i - 1))) return -1;
		let n = i + 1;
		for (; n < e.end && 96 == e.char(n); ) n++;
		let r = n - i,
			s = 0;
		for (; n < e.end; n++)
			if (96 == e.char(n)) {
				if ((s++, s == r && 96 != e.char(n + 1)))
					return e.append(
						xd(XO.InlineCode, i, n + 1, [
							xd(XO.CodeMark, i, i + r),
							xd(XO.CodeMark, n + 1 - r, n + 1),
						]),
					);
			} else s = 0;
		return -1;
	},
	HTMLTag(e, t, i) {
		if (60 != t || i == e.end - 1) return -1;
		let n = e.slice(i + 1, e.end),
			r =
				/^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(
					n,
				);
		if (r)
			return e.append(
				xd(XO.Autolink, i, i + 1 + r[0].length, [
					xd(XO.LinkMark, i, i + 1),
					xd(XO.URL, i + 1, i + r[0].length),
					xd(XO.LinkMark, i + r[0].length, i + 1 + r[0].length),
				]),
			);
		let s = /^!--[^>](?:-[^-]|[^-])*?-->/i.exec(n);
		if (s) return e.append(xd(XO.Comment, i, i + 1 + s[0].length));
		let o = /^\?[^]*?\?>/.exec(n);
		if (o)
			return e.append(xd(XO.ProcessingInstruction, i, i + 1 + o[0].length));
		let a =
			/^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(
				n,
			);
		return a ? e.append(xd(XO.HTMLTag, i, i + 1 + a[0].length)) : -1;
	},
	Emphasis(e, t, i) {
		if (95 != t && 42 != t) return -1;
		let n = i + 1;
		for (; e.char(n) == t; ) n++;
		let r = e.slice(i - 1, i),
			s = e.slice(n, n + 1),
			o = vd.test(r),
			a = vd.test(s),
			l = /\s|^$/.test(r),
			h = /\s|^$/.test(s),
			c = !h && (!a || l || o),
			u = !l && (!o || h || a),
			f = c && (42 == t || !u || o),
			O = u && (42 == t || !c || a);
		return e.append(new wd(95 == t ? bd : Sd, i, n, (f ? 1 : 0) | (O ? 2 : 0)));
	},
	HardBreak(e, t, i) {
		if (92 == t && 10 == e.char(i + 1))
			return e.append(xd(XO.HardBreak, i, i + 2));
		if (32 == t) {
			let t = i + 1;
			for (; 32 == e.char(t); ) t++;
			if (10 == e.char(t) && t >= i + 2)
				return e.append(xd(XO.HardBreak, i, t + 1));
		}
		return -1;
	},
	Link: (e, t, i) => (91 == t ? e.append(new wd(yd, i, i + 1, 1)) : -1),
	Image: (e, t, i) =>
		33 == t && 91 == e.char(i + 1) ? e.append(new wd(Qd, i, i + 2, 1)) : -1,
	LinkEnd(e, t, i) {
		if (93 != t) return -1;
		for (let t = e.parts.length - 1; t >= 0; t--) {
			let n = e.parts[t];
			if (n instanceof wd && (n.type == yd || n.type == Qd)) {
				if (
					!n.side ||
					(e.skipSpace(n.to) == i && !/[(\[]/.test(e.slice(i + 1, i + 2)))
				)
					return (e.parts[t] = null), -1;
				let r = e.takeContent(t),
					s = (e.parts[t] = Pd(
						e,
						r,
						n.type == yd ? XO.Link : XO.Image,
						n.from,
						i + 1,
					));
				if (n.type == yd)
					for (let i = 0; i < t; i++) {
						let t = e.parts[i];
						t instanceof wd && t.type == yd && (t.side = 0);
					}
				return s.to;
			}
		}
		return -1;
	},
};
function Pd(e, t, i, n, r) {
	let { text: s } = e,
		o = e.char(r),
		a = r;
	if (
		(t.unshift(xd(XO.LinkMark, n, n + (i == XO.Image ? 2 : 1))),
		t.push(xd(XO.LinkMark, r - 1, r)),
		40 == o)
	) {
		let i,
			n = e.skipSpace(r + 1),
			o = Zd(s, n - e.offset, e.offset);
		o &&
			((n = e.skipSpace(o.to)),
			n != o.to &&
				((i = _d(s, n - e.offset, e.offset)), i && (n = e.skipSpace(i.to)))),
			41 == e.char(n) &&
				(t.push(xd(XO.LinkMark, r, r + 1)),
				(a = n + 1),
				o && t.push(o),
				i && t.push(i),
				t.push(xd(XO.LinkMark, n, a)));
	} else if (91 == o) {
		let i = Td(s, r - e.offset, e.offset, !1);
		i && (t.push(i), (a = i.to));
	}
	return xd(i, n, a, t);
}
function Zd(e, t, i) {
	if (60 == e.charCodeAt(t)) {
		for (let n = t + 1; n < e.length; n++) {
			let r = e.charCodeAt(n);
			if (62 == r) return xd(XO.URL, t + i, n + 1 + i);
			if (60 == r || 10 == r) return !1;
		}
		return null;
	}
	{
		let n = 0,
			r = t;
		for (let t = !1; r < e.length; r++) {
			let i = e.charCodeAt(r);
			if (jO(i)) break;
			if (t) t = !1;
			else if (40 == i) n++;
			else if (41 == i) {
				if (!n) break;
				n--;
			} else 92 == i && (t = !0);
		}
		return r > t ? xd(XO.URL, t + i, r + i) : r == e.length && null;
	}
}
function _d(e, t, i) {
	let n = e.charCodeAt(t);
	if (39 != n && 34 != n && 40 != n) return !1;
	let r = 40 == n ? 41 : n;
	for (let n = t + 1, s = !1; n < e.length; n++) {
		let o = e.charCodeAt(n);
		if (s) s = !1;
		else {
			if (o == r) return xd(XO.LinkTitle, t + i, n + 1 + i);
			92 == o && (s = !0);
		}
	}
	return null;
}
function Td(e, t, i, n) {
	for (let r = !1, s = t + 1, o = Math.min(e.length, s + 999); s < o; s++) {
		let o = e.charCodeAt(s);
		if (r) r = !1;
		else {
			if (93 == o) return !n && xd(XO.LinkLabel, t + i, s + 1 + i);
			if ((n && !jO(o) && (n = !1), 91 == o)) return !1;
			92 == o && (r = !0);
		}
	}
	return null;
}
class Xd {
	constructor(e, t, i) {
		(this.parser = e), (this.text = t), (this.offset = i), (this.parts = []);
	}
	char(e) {
		return e >= this.end ? -1 : this.text.charCodeAt(e - this.offset);
	}
	get end() {
		return this.offset + this.text.length;
	}
	slice(e, t) {
		return this.text.slice(e - this.offset, t - this.offset);
	}
	append(e) {
		return this.parts.push(e), e.to;
	}
	addDelimiter(e, t, i, n, r) {
		return this.append(new wd(e, t, i, (n ? 1 : 0) | (r ? 2 : 0)));
	}
	get hasOpenLink() {
		for (let e = this.parts.length - 1; e >= 0; e--) {
			let t = this.parts[e];
			if (t instanceof wd && (t.type == yd || t.type == Qd)) return !0;
		}
		return !1;
	}
	addElement(e) {
		return this.append(e);
	}
	resolveMarkers(e) {
		for (let t = e; t < this.parts.length; t++) {
			let i = this.parts[t];
			if (!(i instanceof wd && i.type.resolve && 2 & i.side)) continue;
			let n,
				r = i.type == bd || i.type == Sd,
				s = i.to - i.from,
				o = t - 1;
			for (; o >= e; o--) {
				let e = this.parts[o];
				if (
					e instanceof wd &&
					1 & e.side &&
					e.type == i.type &&
					!(
						r &&
						(1 & i.side || 2 & e.side) &&
						(e.to - e.from + s) % 3 == 0 &&
						((e.to - e.from) % 3 || s % 3)
					)
				) {
					n = e;
					break;
				}
			}
			if (!n) continue;
			let a = i.type.resolve,
				l = [],
				h = n.from,
				c = i.to;
			if (r) {
				let e = Math.min(2, n.to - n.from, s);
				(h = n.to - e),
					(c = i.from + e),
					(a = 1 == e ? "Emphasis" : "StrongEmphasis");
			}
			n.type.mark && l.push(this.elt(n.type.mark, h, n.to));
			for (let e = o + 1; e < t; e++)
				this.parts[e] instanceof md && l.push(this.parts[e]),
					(this.parts[e] = null);
			i.type.mark && l.push(this.elt(i.type.mark, i.from, c));
			let u = this.elt(a, h, c, l);
			(this.parts[o] =
				r && n.from != h ? new wd(n.type, n.from, h, n.side) : null),
				(this.parts[t] =
					r && i.to != c ? new wd(i.type, c, i.to, i.side) : null)
					? this.parts.splice(t, 0, u)
					: (this.parts[t] = u);
		}
		let t = [];
		for (let i = e; i < this.parts.length; i++) {
			let e = this.parts[i];
			e instanceof md && t.push(e);
		}
		return t;
	}
	findOpeningDelimiter(e) {
		for (let t = this.parts.length - 1; t >= 0; t--) {
			let i = this.parts[t];
			if (i instanceof wd && i.type == e) return t;
		}
		return null;
	}
	takeContent(e) {
		let t = this.resolveMarkers(e);
		return (this.parts.length = e), t;
	}
	skipSpace(e) {
		return EO(this.text, e - this.offset) + this.offset;
	}
	elt(e, t, i, n) {
		return "string" == typeof e
			? xd(this.parser.getNodeType(e), t, i, n)
			: new gd(e, t);
	}
}
function Ad(e, t) {
	if (!t.length) return e;
	if (!e.length) return t;
	let i = e.slice(),
		n = 0;
	for (let e of t) {
		for (; n < i.length && i[n].to < e.to; ) n++;
		if (n < i.length && i[n].from < e.from) {
			let t = i[n];
			t instanceof md &&
				(i[n] = new md(t.type, t.from, t.to, Ad(t.children, [e])));
		} else i.splice(n++, 0, e);
	}
	return i;
}
const Cd = [XO.CodeBlock, XO.ListItem, XO.OrderedList, XO.BulletList];
let Rd = class {
	constructor(e, t) {
		(this.fragments = e),
			(this.input = t),
			(this.i = 0),
			(this.fragment = null),
			(this.fragmentEnd = -1),
			(this.cursor = null),
			e.length && (this.fragment = e[this.i++]);
	}
	nextFragment() {
		(this.fragment =
			this.i < this.fragments.length ? this.fragments[this.i++] : null),
			(this.cursor = null),
			(this.fragmentEnd = -1);
	}
	moveTo(e, t) {
		for (; this.fragment && this.fragment.to <= e; ) this.nextFragment();
		if (!this.fragment || this.fragment.from > (e ? e - 1 : 0)) return !1;
		if (this.fragmentEnd < 0) {
			let e = this.fragment.to;
			for (; e > 0 && "\n" != this.input.read(e - 1, e); ) e--;
			this.fragmentEnd = e ? e - 1 : 0;
		}
		let i = this.cursor;
		i || ((i = this.cursor = this.fragment.tree.cursor()), i.firstChild());
		let n = e + this.fragment.offset;
		for (; i.to <= n; ) if (!i.parent()) return !1;
		for (;;) {
			if (i.from >= n) return this.fragment.from <= t;
			if (!i.childAfter(n)) return !1;
		}
	}
	matches(e) {
		let t = this.cursor.tree;
		return t && t.prop(uh.contextHash) == e;
	}
	takeNodes(e) {
		let t = this.cursor,
			i = this.fragment.offset,
			n = this.fragmentEnd - (this.fragment.openEnd ? 1 : 0),
			r = e.absoluteLineStart,
			s = r,
			o = e.block.children.length,
			a = s,
			l = o;
		for (;;) {
			if (t.to - i > n) {
				if (t.type.isAnonymous && t.firstChild()) continue;
				break;
			}
			let r = Md(t.from - i, e.ranges);
			if (t.to - i <= e.ranges[e.rangeI].to) e.addNode(t.tree, r);
			else {
				let i = new bh(
					e.parser.nodeSet.types[XO.Paragraph],
					[],
					[],
					0,
					e.block.hashProp,
				);
				e.reusePlaceholders.set(i, t.tree), e.addNode(i, r);
			}
			if (
				(t.type.is("Block") &&
					(Cd.indexOf(t.type.id) < 0
						? ((s = t.to - i), (o = e.block.children.length))
						: ((s = a),
							(o = l),
							(a = t.to - i),
							(l = e.block.children.length))),
				!t.nextSibling())
			)
				break;
		}
		for (; e.block.children.length > o; )
			e.block.children.pop(), e.block.positions.pop();
		return s - r;
	}
};
function Md(e, t) {
	let i = e;
	for (let n = 1; n < t.length; n++) {
		let r = t[n - 1].to,
			s = t[n].from;
		r < e && (i -= s - r);
	}
	return i;
}
const jd = sc({
		"Blockquote/...": wc.quote,
		HorizontalRule: wc.contentSeparator,
		"ATXHeading1/... SetextHeading1/...": wc.heading1,
		"ATXHeading2/... SetextHeading2/...": wc.heading2,
		"ATXHeading3/...": wc.heading3,
		"ATXHeading4/...": wc.heading4,
		"ATXHeading5/...": wc.heading5,
		"ATXHeading6/...": wc.heading6,
		"Comment CommentBlock": wc.comment,
		Escape: wc.escape,
		Entity: wc.character,
		"Emphasis/...": wc.emphasis,
		"StrongEmphasis/...": wc.strong,
		"Link/... Image/...": wc.link,
		"OrderedList/... BulletList/...": wc.list,
		"BlockQuote/...": wc.quote,
		"InlineCode CodeText": wc.monospace,
		"URL Autolink": wc.url,
		"HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark":
			wc.processingInstruction,
		"CodeInfo LinkLabel": wc.labelName,
		LinkTitle: wc.string,
		Paragraph: wc.content,
	}),
	Ed = new hd(
		new ph(Od).extend(jd),
		Object.keys(ed).map((e) => ed[e]),
		Object.keys(ed).map((e) => rd[e]),
		Object.keys(ed),
		sd,
		MO,
		Object.keys($d).map((e) => $d[e]),
		Object.keys($d),
		[],
	);
function qd(e, t, i) {
	let n = [];
	for (let r = e.firstChild, s = t; ; r = r.nextSibling) {
		let e = r ? r.from : i;
		if ((e > s && n.push({ from: s, to: e }), !r)) break;
		s = r.to;
	}
	return n;
}
const Vd = { resolve: "Strikethrough", mark: "StrikethroughMark" },
	Ld = {
		defineNodes: [
			{
				name: "Strikethrough",
				style: { "Strikethrough/...": wc.strikethrough },
			},
			{ name: "StrikethroughMark", style: wc.processingInstruction },
		],
		parseInline: [
			{
				name: "Strikethrough",
				parse(e, t, i) {
					if (126 != t || 126 != e.char(i + 1) || 126 == e.char(i + 2))
						return -1;
					let n = e.slice(i - 1, i),
						r = e.slice(i + 2, i + 3),
						s = /\s|^$/.test(n),
						o = /\s|^$/.test(r),
						a = vd.test(n),
						l = vd.test(r);
					return e.addDelimiter(
						Vd,
						i,
						i + 2,
						!o && (!l || s || a),
						!s && (!a || o || l),
					);
				},
				after: "Emphasis",
			},
		],
	};
function Wd(e, t, i = 0, n, r = 0) {
	let s = 0,
		o = !0,
		a = -1,
		l = -1,
		h = !1,
		c = () => {
			n.push(
				e.elt(
					"TableCell",
					r + a,
					r + l,
					e.parser.parseInline(t.slice(a, l), r + a),
				),
			);
		};
	for (let u = i; u < t.length; u++) {
		let i = t.charCodeAt(u);
		124 != i || h
			? (h || (32 != i && 9 != i)) && (a < 0 && (a = u), (l = u + 1))
			: ((!o || a > -1) && s++,
				(o = !1),
				n && (a > -1 && c(), n.push(e.elt("TableDelimiter", u + r, u + r + 1))),
				(a = l = -1)),
			(h = !h && 92 == i);
	}
	return a > -1 && (s++, n && c()), s;
}
function zd(e, t) {
	for (let i = t; i < e.length; i++) {
		let t = e.charCodeAt(i);
		if (124 == t) return !0;
		92 == t && i++;
	}
	return !1;
}
const Yd = /^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;
class Dd {
	constructor() {
		this.rows = null;
	}
	nextLine(e, t, i) {
		if (null == this.rows) {
			let n;
			if (
				((this.rows = !1),
				(45 == t.next || 58 == t.next || 124 == t.next) &&
					Yd.test((n = t.text.slice(t.pos))))
			) {
				let r = [];
				Wd(e, i.content, 0, r, i.start) == Wd(e, n, t.pos) &&
					(this.rows = [
						e.elt("TableHeader", i.start, i.start + i.content.length, r),
						e.elt(
							"TableDelimiter",
							e.lineStart + t.pos,
							e.lineStart + t.text.length,
						),
					]);
			}
		} else if (this.rows) {
			let i = [];
			Wd(e, t.text, t.pos, i, e.lineStart),
				this.rows.push(
					e.elt(
						"TableRow",
						e.lineStart + t.pos,
						e.lineStart + t.text.length,
						i,
					),
				);
		}
		return !1;
	}
	finish(e, t) {
		return (
			!!this.rows &&
			(e.addLeafElement(
				t,
				e.elt("Table", t.start, t.start + t.content.length, this.rows),
			),
			!0)
		);
	}
}
const Bd = {
	defineNodes: [
		{ name: "Table", block: !0 },
		{ name: "TableHeader", style: { "TableHeader/...": wc.heading } },
		"TableRow",
		{ name: "TableCell", style: wc.content },
		{ name: "TableDelimiter", style: wc.processingInstruction },
	],
	parseBlock: [
		{
			name: "Table",
			leaf: (e, t) => (zd(t.content, 0) ? new Dd() : null),
			endLeaf(e, t, i) {
				if (i.parsers.some((e) => e instanceof Dd) || !zd(t.text, t.basePos))
					return !1;
				let n = e.peekLine();
				return Yd.test(n) && Wd(e, t.text, t.basePos) == Wd(e, n, t.basePos);
			},
			before: "SetextHeading",
		},
	],
};
class Id {
	nextLine() {
		return !1;
	}
	finish(e, t) {
		return (
			e.addLeafElement(
				t,
				e.elt("Task", t.start, t.start + t.content.length, [
					e.elt("TaskMarker", t.start, t.start + 3),
					...e.parser.parseInline(t.content.slice(3), t.start + 3),
				]),
			),
			!0
		);
	}
}
const Ud = {
		defineNodes: [
			{ name: "Task", block: !0, style: wc.list },
			{ name: "TaskMarker", style: wc.atom },
		],
		parseBlock: [
			{
				name: "TaskList",
				leaf: (e, t) =>
					/^\[[ xX]\][ \t]/.test(t.content) && "ListItem" == e.parentType().name
						? new Id()
						: null,
				after: "SetextHeading",
			},
		],
	},
	Gd = /(www\.)|(https?:\/\/)|([\w.+-]{1,100}@)|(mailto:|xmpp:)/gy,
	Nd = /[\w-]+(\.[\w-]+)+(\/[^\s<]*)?/gy,
	Hd = /[\w-]+\.[\w-]+($|\/)/,
	Fd = /[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy,
	Kd = /\/[a-zA-Z\d@.]+/gy;
function Jd(e, t, i, n) {
	let r = 0;
	for (let s = t; s < i; s++) e[s] == n && r++;
	return r;
}
function ep(e, t) {
	Fd.lastIndex = t;
	let i = Fd.exec(e);
	if (!i) return -1;
	let n = i[0][i[0].length - 1];
	return "_" == n || "-" == n ? -1 : t + i[0].length - ("." == n ? 1 : 0);
}
const tp = [
	Bd,
	Ud,
	Ld,
	{
		parseInline: [
			{
				name: "Autolink",
				parse(e, t, i) {
					let n = i - e.offset;
					if (n && /\w/.test(e.text[n - 1])) return -1;
					Gd.lastIndex = n;
					let r = Gd.exec(e.text),
						s = -1;
					if (!r) return -1;
					if (r[1] || r[2]) {
						if (
							((s = (function (e, t) {
								Nd.lastIndex = t;
								let i = Nd.exec(e);
								if (!i || Hd.exec(i[0])[0].indexOf("_") > -1) return -1;
								let n = t + i[0].length;
								for (;;) {
									let i,
										r = e[n - 1];
									if (
										/[?!.,:*_~]/.test(r) ||
										(")" == r && Jd(e, t, n, ")") > Jd(e, t, n, "("))
									)
										n--;
									else {
										if (
											";" != r ||
											!(i = /&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(e.slice(t, n)))
										)
											break;
										n = t + i.index;
									}
								}
								return n;
							})(e.text, n + r[0].length)),
							s > -1 && e.hasOpenLink)
						) {
							s =
								n + /([^\[\]]|\[[^\]]*\])*/.exec(e.text.slice(n, s))[0].length;
						}
					} else
						r[3]
							? (s = ep(e.text, n))
							: ((s = ep(e.text, n + r[0].length)),
								s > -1 &&
									"xmpp:" == r[0] &&
									((Kd.lastIndex = s),
									(r = Kd.exec(e.text)),
									r && (s = r.index + r[0].length)));
					return s < 0
						? -1
						: (e.addElement(e.elt("URL", i, s + e.offset)), s + e.offset);
				},
			},
		],
	},
];
function ip(e, t, i) {
	return (n, r, s) => {
		if (r != e || n.char(s + 1) == e) return -1;
		let o = [n.elt(i, s, s + 1)];
		for (let r = s + 1; r < n.end; r++) {
			let a = n.char(r);
			if (a == e)
				return n.addElement(n.elt(t, s, r + 1, o.concat(n.elt(i, r, r + 1))));
			if ((92 == a && o.push(n.elt("Escape", r, 2 + r++)), jO(a))) break;
		}
		return -1;
	};
}
const np = {
		defineNodes: [
			{ name: "Superscript", style: wc.special(wc.content) },
			{ name: "SuperscriptMark", style: wc.processingInstruction },
		],
		parseInline: [
			{ name: "Superscript", parse: ip(94, "Superscript", "SuperscriptMark") },
		],
	},
	rp = {
		defineNodes: [
			{ name: "Subscript", style: wc.special(wc.content) },
			{ name: "SubscriptMark", style: wc.processingInstruction },
		],
		parseInline: [
			{ name: "Subscript", parse: ip(126, "Subscript", "SubscriptMark") },
		],
	},
	sp = {
		defineNodes: [{ name: "Emoji", style: wc.character }],
		parseInline: [
			{
				name: "Emoji",
				parse(e, t, i) {
					let n;
					return 58 == t && (n = /^[a-zA-Z_0-9]+:/.exec(e.slice(i + 1, e.end)))
						? e.addElement(e.elt("Emoji", i, i + 1 + n[0].length))
						: -1;
				},
			},
		],
	};
class op {
	constructor(e, t, i, n, r, s, o, a, l, h = 0, c) {
		(this.p = e),
			(this.stack = t),
			(this.state = i),
			(this.reducePos = n),
			(this.pos = r),
			(this.score = s),
			(this.buffer = o),
			(this.bufferBase = a),
			(this.curContext = l),
			(this.lookAhead = h),
			(this.parent = c);
	}
	toString() {
		return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
	}
	static start(e, t, i = 0) {
		let n = e.parser.context;
		return new op(
			e,
			[],
			t,
			i,
			i,
			0,
			[],
			0,
			n ? new ap(n, n.start) : null,
			0,
			null,
		);
	}
	get context() {
		return this.curContext ? this.curContext.context : null;
	}
	pushState(e, t) {
		this.stack.push(this.state, t, this.bufferBase + this.buffer.length),
			(this.state = e);
	}
	reduce(e) {
		var t;
		let i = e >> 19,
			n = 65535 & e,
			{ parser: r } = this.p,
			s = this.reducePos < this.pos - 25;
		s && this.setLookAhead(this.pos);
		let o = r.dynamicPrecedence(n);
		if ((o && (this.score += o), 0 == i))
			return (
				this.pushState(r.getGoto(this.state, n, !0), this.reducePos),
				n < r.minRepeatTerm &&
					this.storeNode(n, this.reducePos, this.reducePos, s ? 8 : 4, !0),
				void this.reduceContext(n, this.reducePos)
			);
		let a = this.stack.length - 3 * (i - 1) - (262144 & e ? 6 : 0),
			l = a ? this.stack[a - 2] : this.p.ranges[0].from,
			h = this.reducePos - l;
		h >= 2e3 &&
			!(null === (t = this.p.parser.nodeSet.types[n]) || void 0 === t
				? void 0
				: t.isAnonymous) &&
			(l == this.p.lastBigReductionStart
				? (this.p.bigReductionCount++, (this.p.lastBigReductionSize = h))
				: this.p.lastBigReductionSize < h &&
					((this.p.bigReductionCount = 1),
					(this.p.lastBigReductionStart = l),
					(this.p.lastBigReductionSize = h)));
		let c = a ? this.stack[a - 1] : 0,
			u = this.bufferBase + this.buffer.length - c;
		if (n < r.minRepeatTerm || 131072 & e) {
			let e = r.stateFlag(this.state, 1) ? this.pos : this.reducePos;
			this.storeNode(n, l, e, u + 4, !0);
		}
		if (262144 & e) this.state = this.stack[a];
		else {
			let e = this.stack[a - 3];
			this.state = r.getGoto(e, n, !0);
		}
		for (; this.stack.length > a; ) this.stack.pop();
		this.reduceContext(n, l);
	}
	storeNode(e, t, i, n = 4, r = !1) {
		if (
			0 == e &&
			(!this.stack.length ||
				this.stack[this.stack.length - 1] <
					this.buffer.length + this.bufferBase)
		) {
			let e = this,
				n = this.buffer.length;
			if (
				(0 == n &&
					e.parent &&
					((n = e.bufferBase - e.parent.bufferBase), (e = e.parent)),
				n > 0 && 0 == e.buffer[n - 4] && e.buffer[n - 1] > -1)
			) {
				if (t == i) return;
				if (e.buffer[n - 2] >= t) return void (e.buffer[n - 2] = i);
			}
		}
		if (r && this.pos != i) {
			let r = this.buffer.length;
			if (r > 0 && 0 != this.buffer[r - 4]) {
				let e = !1;
				for (let t = r; t > 0 && this.buffer[t - 2] > i; t -= 4)
					if (this.buffer[t - 1] >= 0) {
						e = !0;
						break;
					}
				if (e)
					for (; r > 0 && this.buffer[r - 2] > i; )
						(this.buffer[r] = this.buffer[r - 4]),
							(this.buffer[r + 1] = this.buffer[r - 3]),
							(this.buffer[r + 2] = this.buffer[r - 2]),
							(this.buffer[r + 3] = this.buffer[r - 1]),
							(r -= 4),
							n > 4 && (n -= 4);
			}
			(this.buffer[r] = e),
				(this.buffer[r + 1] = t),
				(this.buffer[r + 2] = i),
				(this.buffer[r + 3] = n);
		} else this.buffer.push(e, t, i, n);
	}
	shift(e, t, i, n) {
		if (131072 & e) this.pushState(65535 & e, this.pos);
		else if (262144 & e)
			(this.pos = n),
				this.shiftContext(t, i),
				t <= this.p.parser.maxNode && this.buffer.push(t, i, n, 4);
		else {
			let r = e,
				{ parser: s } = this.p;
			(n > this.pos || t <= s.maxNode) &&
				((this.pos = n), s.stateFlag(r, 1) || (this.reducePos = n)),
				this.pushState(r, i),
				this.shiftContext(t, i),
				t <= s.maxNode && this.buffer.push(t, i, n, 4);
		}
	}
	apply(e, t, i, n) {
		65536 & e ? this.reduce(e) : this.shift(e, t, i, n);
	}
	useNode(e, t) {
		let i = this.p.reused.length - 1;
		(i < 0 || this.p.reused[i] != e) && (this.p.reused.push(e), i++);
		let n = this.pos;
		(this.reducePos = this.pos = n + e.length),
			this.pushState(t, n),
			this.buffer.push(i, n, this.reducePos, -1),
			this.curContext &&
				this.updateContext(
					this.curContext.tracker.reuse(
						this.curContext.context,
						e,
						this,
						this.p.stream.reset(this.pos - e.length),
					),
				);
	}
	split() {
		let e = this,
			t = e.buffer.length;
		for (; t > 0 && e.buffer[t - 2] > e.reducePos; ) t -= 4;
		let i = e.buffer.slice(t),
			n = e.bufferBase + t;
		for (; e && n == e.bufferBase; ) e = e.parent;
		return new op(
			this.p,
			this.stack.slice(),
			this.state,
			this.reducePos,
			this.pos,
			this.score,
			i,
			n,
			this.curContext,
			this.lookAhead,
			e,
		);
	}
	recoverByDelete(e, t) {
		let i = e <= this.p.parser.maxNode;
		i && this.storeNode(e, this.pos, t, 4),
			this.storeNode(0, this.pos, t, i ? 8 : 4),
			(this.pos = this.reducePos = t),
			(this.score -= 190);
	}
	canShift(e) {
		for (let t = new lp(this); ; ) {
			let i =
				this.p.parser.stateSlot(t.state, 4) ||
				this.p.parser.hasAction(t.state, e);
			if (0 == i) return !1;
			if (!(65536 & i)) return !0;
			t.reduce(i);
		}
	}
	recoverByInsert(e) {
		if (this.stack.length >= 300) return [];
		let t = this.p.parser.nextStates(this.state);
		if (t.length > 8 || this.stack.length >= 120) {
			let i = [];
			for (let n, r = 0; r < t.length; r += 2)
				(n = t[r + 1]) != this.state &&
					this.p.parser.hasAction(n, e) &&
					i.push(t[r], n);
			if (this.stack.length < 120)
				for (let e = 0; i.length < 8 && e < t.length; e += 2) {
					let n = t[e + 1];
					i.some((e, t) => 1 & t && e == n) || i.push(t[e], n);
				}
			t = i;
		}
		let i = [];
		for (let e = 0; e < t.length && i.length < 4; e += 2) {
			let n = t[e + 1];
			if (n == this.state) continue;
			let r = this.split();
			r.pushState(n, this.pos),
				r.storeNode(0, r.pos, r.pos, 4, !0),
				r.shiftContext(t[e], this.pos),
				(r.reducePos = this.pos),
				(r.score -= 200),
				i.push(r);
		}
		return i;
	}
	forceReduce() {
		let { parser: e } = this.p,
			t = e.stateSlot(this.state, 5);
		if (!(65536 & t)) return !1;
		if (!e.validAction(this.state, t)) {
			let i = t >> 19,
				n = 65535 & t,
				r = this.stack.length - 3 * i;
			if (r < 0 || e.getGoto(this.stack[r], n, !1) < 0) {
				let e = this.findForcedReduction();
				if (null == e) return !1;
				t = e;
			}
			this.storeNode(0, this.pos, this.pos, 4, !0), (this.score -= 100);
		}
		return (this.reducePos = this.pos), this.reduce(t), !0;
	}
	findForcedReduction() {
		let { parser: e } = this.p,
			t = [],
			i = (n, r) => {
				if (!t.includes(n))
					return (
						t.push(n),
						e.allActions(n, (t) => {
							if (393216 & t);
							else if (65536 & t) {
								let i = (t >> 19) - r;
								if (i > 1) {
									let n = 65535 & t,
										r = this.stack.length - 3 * i;
									if (r >= 0 && e.getGoto(this.stack[r], n, !1) >= 0)
										return (i << 19) | 65536 | n;
								}
							} else {
								let e = i(t, r + 1);
								if (null != e) return e;
							}
						})
					);
			};
		return i(this.state, 0);
	}
	forceAll() {
		for (; !this.p.parser.stateFlag(this.state, 2); )
			if (!this.forceReduce()) {
				this.storeNode(0, this.pos, this.pos, 4, !0);
				break;
			}
		return this;
	}
	get deadEnd() {
		if (3 != this.stack.length) return !1;
		let { parser: e } = this.p;
		return (
			65535 == e.data[e.stateSlot(this.state, 1)] && !e.stateSlot(this.state, 4)
		);
	}
	restart() {
		this.storeNode(0, this.pos, this.pos, 4, !0),
			(this.state = this.stack[0]),
			(this.stack.length = 0);
	}
	sameState(e) {
		if (this.state != e.state || this.stack.length != e.stack.length) return !1;
		for (let t = 0; t < this.stack.length; t += 3)
			if (this.stack[t] != e.stack[t]) return !1;
		return !0;
	}
	get parser() {
		return this.p.parser;
	}
	dialectEnabled(e) {
		return this.p.parser.dialect.flags[e];
	}
	shiftContext(e, t) {
		this.curContext &&
			this.updateContext(
				this.curContext.tracker.shift(
					this.curContext.context,
					e,
					this,
					this.p.stream.reset(t),
				),
			);
	}
	reduceContext(e, t) {
		this.curContext &&
			this.updateContext(
				this.curContext.tracker.reduce(
					this.curContext.context,
					e,
					this,
					this.p.stream.reset(t),
				),
			);
	}
	emitContext() {
		let e = this.buffer.length - 1;
		(e < 0 || -3 != this.buffer[e]) &&
			this.buffer.push(this.curContext.hash, this.pos, this.pos, -3);
	}
	emitLookAhead() {
		let e = this.buffer.length - 1;
		(e < 0 || -4 != this.buffer[e]) &&
			this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
	}
	updateContext(e) {
		if (e != this.curContext.context) {
			let t = new ap(this.curContext.tracker, e);
			t.hash != this.curContext.hash && this.emitContext(),
				(this.curContext = t);
		}
	}
	setLookAhead(e) {
		e > this.lookAhead && (this.emitLookAhead(), (this.lookAhead = e));
	}
	close() {
		this.curContext && this.curContext.tracker.strict && this.emitContext(),
			this.lookAhead > 0 && this.emitLookAhead();
	}
}
class ap {
	constructor(e, t) {
		(this.tracker = e),
			(this.context = t),
			(this.hash = e.strict ? e.hash(t) : 0);
	}
}
class lp {
	constructor(e) {
		(this.start = e),
			(this.state = e.state),
			(this.stack = e.stack),
			(this.base = this.stack.length);
	}
	reduce(e) {
		let t = 65535 & e,
			i = e >> 19;
		0 == i
			? (this.stack == this.start.stack && (this.stack = this.stack.slice()),
				this.stack.push(this.state, 0, 0),
				(this.base += 3))
			: (this.base -= 3 * (i - 1));
		let n = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
		this.state = n;
	}
}
class hp {
	constructor(e, t, i) {
		(this.stack = e),
			(this.pos = t),
			(this.index = i),
			(this.buffer = e.buffer),
			0 == this.index && this.maybeNext();
	}
	static create(e, t = e.bufferBase + e.buffer.length) {
		return new hp(e, t, t - e.bufferBase);
	}
	maybeNext() {
		let e = this.stack.parent;
		null != e &&
			((this.index = this.stack.bufferBase - e.bufferBase),
			(this.stack = e),
			(this.buffer = e.buffer));
	}
	get id() {
		return this.buffer[this.index - 4];
	}
	get start() {
		return this.buffer[this.index - 3];
	}
	get end() {
		return this.buffer[this.index - 2];
	}
	get size() {
		return this.buffer[this.index - 1];
	}
	next() {
		(this.index -= 4), (this.pos -= 4), 0 == this.index && this.maybeNext();
	}
	fork() {
		return new hp(this.stack, this.pos, this.index);
	}
}
function cp(e, t = Uint16Array) {
	if ("string" != typeof e) return e;
	let i = null;
	for (let n = 0, r = 0; n < e.length; ) {
		let s = 0;
		for (;;) {
			let t = e.charCodeAt(n++),
				i = !1;
			if (126 == t) {
				s = 65535;
				break;
			}
			t >= 92 && t--, t >= 34 && t--;
			let r = t - 32;
			if ((r >= 46 && ((r -= 46), (i = !0)), (s += r), i)) break;
			s *= 46;
		}
		i ? (i[r++] = s) : (i = new t(s));
	}
	return i;
}
class up {
	constructor() {
		(this.start = -1),
			(this.value = -1),
			(this.end = -1),
			(this.extended = -1),
			(this.lookAhead = 0),
			(this.mask = 0),
			(this.context = 0);
	}
}
const fp = new up();
class Op {
	constructor(e, t) {
		(this.input = e),
			(this.ranges = t),
			(this.chunk = ""),
			(this.chunkOff = 0),
			(this.chunk2 = ""),
			(this.chunk2Pos = 0),
			(this.next = -1),
			(this.token = fp),
			(this.rangeIndex = 0),
			(this.pos = this.chunkPos = t[0].from),
			(this.range = t[0]),
			(this.end = t[t.length - 1].to),
			this.readNext();
	}
	resolveOffset(e, t) {
		let i = this.range,
			n = this.rangeIndex,
			r = this.pos + e;
		for (; r < i.from; ) {
			if (!n) return null;
			let e = this.ranges[--n];
			(r -= i.from - e.to), (i = e);
		}
		for (; t < 0 ? r > i.to : r >= i.to; ) {
			if (n == this.ranges.length - 1) return null;
			let e = this.ranges[++n];
			(r += e.from - i.to), (i = e);
		}
		return r;
	}
	clipPos(e) {
		if (e >= this.range.from && e < this.range.to) return e;
		for (let t of this.ranges) if (t.to > e) return Math.max(e, t.from);
		return this.end;
	}
	peek(e) {
		let t,
			i,
			n = this.chunkOff + e;
		if (n >= 0 && n < this.chunk.length)
			(t = this.pos + e), (i = this.chunk.charCodeAt(n));
		else {
			let n = this.resolveOffset(e, 1);
			if (null == n) return -1;
			if (
				((t = n),
				t >= this.chunk2Pos && t < this.chunk2Pos + this.chunk2.length)
			)
				i = this.chunk2.charCodeAt(t - this.chunk2Pos);
			else {
				let e = this.rangeIndex,
					n = this.range;
				for (; n.to <= t; ) n = this.ranges[++e];
				(this.chunk2 = this.input.chunk((this.chunk2Pos = t))),
					t + this.chunk2.length > n.to &&
						(this.chunk2 = this.chunk2.slice(0, n.to - t)),
					(i = this.chunk2.charCodeAt(0));
			}
		}
		return t >= this.token.lookAhead && (this.token.lookAhead = t + 1), i;
	}
	acceptToken(e, t = 0) {
		let i = t ? this.resolveOffset(t, -1) : this.pos;
		if (null == i || i < this.token.start)
			throw new RangeError("Token end out of bounds");
		(this.token.value = e), (this.token.end = i);
	}
	acceptTokenTo(e, t) {
		(this.token.value = e), (this.token.end = t);
	}
	getChunk() {
		if (
			this.pos >= this.chunk2Pos &&
			this.pos < this.chunk2Pos + this.chunk2.length
		) {
			let { chunk: e, chunkPos: t } = this;
			(this.chunk = this.chunk2),
				(this.chunkPos = this.chunk2Pos),
				(this.chunk2 = e),
				(this.chunk2Pos = t),
				(this.chunkOff = this.pos - this.chunkPos);
		} else {
			(this.chunk2 = this.chunk), (this.chunk2Pos = this.chunkPos);
			let e = this.input.chunk(this.pos),
				t = this.pos + e.length;
			(this.chunk =
				t > this.range.to ? e.slice(0, this.range.to - this.pos) : e),
				(this.chunkPos = this.pos),
				(this.chunkOff = 0);
		}
	}
	readNext() {
		return this.chunkOff >= this.chunk.length &&
			(this.getChunk(), this.chunkOff == this.chunk.length)
			? (this.next = -1)
			: (this.next = this.chunk.charCodeAt(this.chunkOff));
	}
	advance(e = 1) {
		for (this.chunkOff += e; this.pos + e >= this.range.to; ) {
			if (this.rangeIndex == this.ranges.length - 1) return this.setDone();
			(e -= this.range.to - this.pos),
				(this.range = this.ranges[++this.rangeIndex]),
				(this.pos = this.range.from);
		}
		return (
			(this.pos += e),
			this.pos >= this.token.lookAhead && (this.token.lookAhead = this.pos + 1),
			this.readNext()
		);
	}
	setDone() {
		return (
			(this.pos = this.chunkPos = this.end),
			(this.range = this.ranges[(this.rangeIndex = this.ranges.length - 1)]),
			(this.chunk = ""),
			(this.next = -1)
		);
	}
	reset(e, t) {
		if (
			(t
				? ((this.token = t),
					(t.start = e),
					(t.lookAhead = e + 1),
					(t.value = t.extended = -1))
				: (this.token = fp),
			this.pos != e)
		) {
			if (((this.pos = e), e == this.end)) return this.setDone(), this;
			for (; e < this.range.from; ) this.range = this.ranges[--this.rangeIndex];
			for (; e >= this.range.to; ) this.range = this.ranges[++this.rangeIndex];
			e >= this.chunkPos && e < this.chunkPos + this.chunk.length
				? (this.chunkOff = e - this.chunkPos)
				: ((this.chunk = ""), (this.chunkOff = 0)),
				this.readNext();
		}
		return this;
	}
	read(e, t) {
		if (e >= this.chunkPos && t <= this.chunkPos + this.chunk.length)
			return this.chunk.slice(e - this.chunkPos, t - this.chunkPos);
		if (e >= this.chunk2Pos && t <= this.chunk2Pos + this.chunk2.length)
			return this.chunk2.slice(e - this.chunk2Pos, t - this.chunk2Pos);
		if (e >= this.range.from && t <= this.range.to)
			return this.input.read(e, t);
		let i = "";
		for (let n of this.ranges) {
			if (n.from >= t) break;
			n.to > e &&
				(i += this.input.read(Math.max(n.from, e), Math.min(n.to, t)));
		}
		return i;
	}
}
class dp {
	constructor(e, t) {
		(this.data = e), (this.id = t);
	}
	token(e, t) {
		let { parser: i } = t.p;
		gp(this.data, e, t, this.id, i.data, i.tokenPrecTable);
	}
}
dp.prototype.contextual = dp.prototype.fallback = dp.prototype.extend = !1;
class pp {
	constructor(e, t, i) {
		(this.precTable = t),
			(this.elseToken = i),
			(this.data = "string" == typeof e ? cp(e) : e);
	}
	token(e, t) {
		let i = e.pos,
			n = 0;
		for (;;) {
			let i = e.next < 0,
				r = e.resolveOffset(1, 1);
			if (
				(gp(this.data, e, t, 0, this.data, this.precTable), e.token.value > -1)
			)
				break;
			if (null == this.elseToken) return;
			if ((i || n++, null == r)) break;
			e.reset(r, e.token);
		}
		n && (e.reset(i, e.token), e.acceptToken(this.elseToken, n));
	}
}
pp.prototype.contextual = dp.prototype.fallback = dp.prototype.extend = !1;
class mp {
	constructor(e, t = {}) {
		(this.token = e),
			(this.contextual = !!t.contextual),
			(this.fallback = !!t.fallback),
			(this.extend = !!t.extend);
	}
}
function gp(e, t, i, n, r, s) {
	let o = 0,
		a = 1 << n,
		{ dialect: l } = i.p.parser;
	e: for (; a & e[o]; ) {
		let i = e[o + 1];
		for (let n = o + 3; n < i; n += 2)
			if ((e[n + 1] & a) > 0) {
				let i = e[n];
				if (
					l.allows(i) &&
					(-1 == t.token.value ||
						t.token.value == i ||
						bp(i, t.token.value, r, s))
				) {
					t.acceptToken(i);
					break;
				}
			}
		let n = t.next,
			h = 0,
			c = e[o + 2];
		if (!(t.next < 0 && c > h && 65535 == e[i + 3 * c - 3])) {
			for (; h < c; ) {
				let r = (h + c) >> 1,
					s = i + r + (r << 1),
					a = e[s],
					l = e[s + 1] || 65536;
				if (n < a) c = r;
				else {
					if (!(n >= l)) {
						(o = e[s + 2]), t.advance();
						continue e;
					}
					h = r + 1;
				}
			}
			break;
		}
		o = e[i + 3 * c - 1];
	}
}
function xp(e, t, i) {
	for (let n, r = t; 65535 != (n = e[r]); r++) if (n == i) return r - t;
	return -1;
}
function bp(e, t, i, n) {
	let r = xp(i, n, t);
	return r < 0 || xp(i, n, e) < r;
}
const Sp =
	"undefined" != typeof process &&
	process.env &&
	/\bparse\b/.test(process.env.LOG);
let yp = null;
function Qp(e, t, i) {
	let n = e.cursor(xh.IncludeAnonymous);
	for (n.moveTo(t); ; )
		if (!(i < 0 ? n.childBefore(t) : n.childAfter(t)))
			for (;;) {
				if ((i < 0 ? n.to < t : n.from > t) && !n.type.isError)
					return i < 0
						? Math.max(0, Math.min(n.to - 1, t - 25))
						: Math.min(e.length, Math.max(n.from + 1, t + 25));
				if (i < 0 ? n.prevSibling() : n.nextSibling()) break;
				if (!n.parent()) return i < 0 ? 0 : e.length;
			}
}
class wp {
	constructor(e, t) {
		(this.fragments = e),
			(this.nodeSet = t),
			(this.i = 0),
			(this.fragment = null),
			(this.safeFrom = -1),
			(this.safeTo = -1),
			(this.trees = []),
			(this.start = []),
			(this.index = []),
			this.nextFragment();
	}
	nextFragment() {
		let e = (this.fragment =
			this.i == this.fragments.length ? null : this.fragments[this.i++]);
		if (e) {
			for (
				this.safeFrom = e.openStart
					? Qp(e.tree, e.from + e.offset, 1) - e.offset
					: e.from,
					this.safeTo = e.openEnd
						? Qp(e.tree, e.to + e.offset, -1) - e.offset
						: e.to;
				this.trees.length;
			)
				this.trees.pop(), this.start.pop(), this.index.pop();
			this.trees.push(e.tree),
				this.start.push(-e.offset),
				this.index.push(0),
				(this.nextStart = this.safeFrom);
		} else this.nextStart = 1e9;
	}
	nodeAt(e) {
		if (e < this.nextStart) return null;
		for (; this.fragment && this.safeTo <= e; ) this.nextFragment();
		if (!this.fragment) return null;
		for (;;) {
			let t = this.trees.length - 1;
			if (t < 0) return this.nextFragment(), null;
			let i = this.trees[t],
				n = this.index[t];
			if (n == i.children.length) {
				this.trees.pop(), this.start.pop(), this.index.pop();
				continue;
			}
			let r = i.children[n],
				s = this.start[t] + i.positions[n];
			if (s > e) return (this.nextStart = s), null;
			if (r instanceof bh) {
				if (s == e) {
					if (s < this.safeFrom) return null;
					let e = s + r.length;
					if (e <= this.safeTo) {
						let t = r.prop(uh.lookAhead);
						if (!t || e + t < this.fragment.to) return r;
					}
				}
				this.index[t]++,
					s + r.length >= Math.max(this.safeFrom, e) &&
						(this.trees.push(r), this.start.push(s), this.index.push(0));
			} else this.index[t]++, (this.nextStart = s + r.length);
		}
	}
}
class kp {
	constructor(e, t) {
		(this.stream = t),
			(this.tokens = []),
			(this.mainToken = null),
			(this.actions = []),
			(this.tokens = e.tokenizers.map((e) => new up()));
	}
	getActions(e) {
		let t = 0,
			i = null,
			{ parser: n } = e.p,
			{ tokenizers: r } = n,
			s = n.stateSlot(e.state, 3),
			o = e.curContext ? e.curContext.hash : 0,
			a = 0;
		for (let n = 0; n < r.length; n++) {
			if (!((1 << n) & s)) continue;
			let l = r[n],
				h = this.tokens[n];
			if (
				(!i || l.fallback) &&
				((l.contextual || h.start != e.pos || h.mask != s || h.context != o) &&
					(this.updateCachedToken(h, l, e), (h.mask = s), (h.context = o)),
				h.lookAhead > h.end + 25 && (a = Math.max(h.lookAhead, a)),
				0 != h.value)
			) {
				let n = t;
				if (
					(h.extended > -1 && (t = this.addActions(e, h.extended, h.end, t)),
					(t = this.addActions(e, h.value, h.end, t)),
					!l.extend && ((i = h), t > n))
				)
					break;
			}
		}
		for (; this.actions.length > t; ) this.actions.pop();
		return (
			a && e.setLookAhead(a),
			i ||
				e.pos != this.stream.end ||
				((i = new up()),
				(i.value = e.p.parser.eofTerm),
				(i.start = i.end = e.pos),
				(t = this.addActions(e, i.value, i.end, t))),
			(this.mainToken = i),
			this.actions
		);
	}
	getMainToken(e) {
		if (this.mainToken) return this.mainToken;
		let t = new up(),
			{ pos: i, p: n } = e;
		return (
			(t.start = i),
			(t.end = Math.min(i + 1, n.stream.end)),
			(t.value = i == n.stream.end ? n.parser.eofTerm : 0),
			t
		);
	}
	updateCachedToken(e, t, i) {
		let n = this.stream.clipPos(i.pos);
		if ((t.token(this.stream.reset(n, e), i), e.value > -1)) {
			let { parser: t } = i.p;
			for (let n = 0; n < t.specialized.length; n++)
				if (t.specialized[n] == e.value) {
					let r = t.specializers[n](this.stream.read(e.start, e.end), i);
					if (r >= 0 && i.p.parser.dialect.allows(r >> 1)) {
						1 & r ? (e.extended = r >> 1) : (e.value = r >> 1);
						break;
					}
				}
		} else (e.value = 0), (e.end = this.stream.clipPos(n + 1));
	}
	putAction(e, t, i, n) {
		for (let t = 0; t < n; t += 3) if (this.actions[t] == e) return n;
		return (
			(this.actions[n++] = e),
			(this.actions[n++] = t),
			(this.actions[n++] = i),
			n
		);
	}
	addActions(e, t, i, n) {
		let { state: r } = e,
			{ parser: s } = e.p,
			{ data: o } = s;
		for (let e = 0; e < 2; e++)
			for (let a = s.stateSlot(r, e ? 2 : 1); ; a += 3) {
				if (65535 == o[a]) {
					if (1 != o[a + 1]) {
						0 == n &&
							2 == o[a + 1] &&
							(n = this.putAction(Xp(o, a + 2), t, i, n));
						break;
					}
					a = Xp(o, a + 2);
				}
				o[a] == t && (n = this.putAction(Xp(o, a + 1), t, i, n));
			}
		return n;
	}
}
class vp {
	constructor(e, t, i, n) {
		(this.parser = e),
			(this.input = t),
			(this.ranges = n),
			(this.recovering = 0),
			(this.nextStackID = 9812),
			(this.minStackPos = 0),
			(this.reused = []),
			(this.stoppedAt = null),
			(this.lastBigReductionStart = -1),
			(this.lastBigReductionSize = 0),
			(this.bigReductionCount = 0),
			(this.stream = new Op(t, n)),
			(this.tokens = new kp(e, this.stream)),
			(this.topTerm = e.top[1]);
		let { from: r } = n[0];
		(this.stacks = [op.start(this, e.top[0], r)]),
			(this.fragments =
				i.length && this.stream.end - r > 4 * e.bufferLength
					? new wp(i, e.nodeSet)
					: null);
	}
	get parsedPos() {
		return this.minStackPos;
	}
	advance() {
		let e,
			t,
			i = this.stacks,
			n = this.minStackPos,
			r = (this.stacks = []);
		if (this.bigReductionCount > 300 && 1 == i.length) {
			let [e] = i;
			for (
				;
				e.forceReduce() &&
				e.stack.length &&
				e.stack[e.stack.length - 2] >= this.lastBigReductionStart;
			);
			this.bigReductionCount = this.lastBigReductionSize = 0;
		}
		for (let s = 0; s < i.length; s++) {
			let o = i[s];
			for (;;) {
				if (((this.tokens.mainToken = null), o.pos > n)) r.push(o);
				else {
					if (this.advanceStack(o, r, i)) continue;
					{
						e || ((e = []), (t = [])), e.push(o);
						let i = this.tokens.getMainToken(o);
						t.push(i.value, i.end);
					}
				}
				break;
			}
		}
		if (!r.length) {
			let t =
				e &&
				(function (e) {
					let t = null;
					for (let i of e) {
						let e = i.p.stoppedAt;
						(i.pos == i.p.stream.end || (null != e && i.pos > e)) &&
							i.p.parser.stateFlag(i.state, 2) &&
							(!t || t.score < i.score) &&
							(t = i);
					}
					return t;
				})(e);
			if (t)
				return (
					Sp && console.log("Finish with " + this.stackID(t)),
					this.stackToTree(t)
				);
			if (this.parser.strict)
				throw (
					(Sp &&
						e &&
						console.log(
							"Stuck with token " +
								(this.tokens.mainToken
									? this.parser.getName(this.tokens.mainToken.value)
									: "none"),
						),
					new SyntaxError("No parse at " + n))
				);
			this.recovering || (this.recovering = 5);
		}
		if (this.recovering && e) {
			let i =
				null != this.stoppedAt && e[0].pos > this.stoppedAt
					? e[0]
					: this.runRecovery(e, t, r);
			if (i)
				return (
					Sp && console.log("Force-finish " + this.stackID(i)),
					this.stackToTree(i.forceAll())
				);
		}
		if (this.recovering) {
			let e = 1 == this.recovering ? 1 : 3 * this.recovering;
			if (r.length > e)
				for (r.sort((e, t) => t.score - e.score); r.length > e; ) r.pop();
			r.some((e) => e.reducePos > n) && this.recovering--;
		} else if (r.length > 1) {
			e: for (let e = 0; e < r.length - 1; e++) {
				let t = r[e];
				for (let i = e + 1; i < r.length; i++) {
					let n = r[i];
					if (
						t.sameState(n) ||
						(t.buffer.length > 500 && n.buffer.length > 500)
					) {
						if (
							!((t.score - n.score || t.buffer.length - n.buffer.length) > 0)
						) {
							r.splice(e--, 1);
							continue e;
						}
						r.splice(i--, 1);
					}
				}
			}
			r.length > 12 && r.splice(12, r.length - 12);
		}
		this.minStackPos = r[0].pos;
		for (let e = 1; e < r.length; e++)
			r[e].pos < this.minStackPos && (this.minStackPos = r[e].pos);
		return null;
	}
	stopAt(e) {
		if (null != this.stoppedAt && this.stoppedAt < e)
			throw new RangeError("Can't move stoppedAt forward");
		this.stoppedAt = e;
	}
	advanceStack(e, t, i) {
		let n = e.pos,
			{ parser: r } = this,
			s = Sp ? this.stackID(e) + " -> " : "";
		if (null != this.stoppedAt && n > this.stoppedAt)
			return e.forceReduce() ? e : null;
		if (this.fragments) {
			let t = e.curContext && e.curContext.tracker.strict,
				i = t ? e.curContext.hash : 0;
			for (let o = this.fragments.nodeAt(n); o; ) {
				let n =
					this.parser.nodeSet.types[o.type.id] == o.type
						? r.getGoto(e.state, o.type.id)
						: -1;
				if (n > -1 && o.length && (!t || (o.prop(uh.contextHash) || 0) == i))
					return (
						e.useNode(o, n),
						Sp &&
							console.log(
								s + this.stackID(e) + ` (via reuse of ${r.getName(o.type.id)})`,
							),
						!0
					);
				if (!(o instanceof bh) || 0 == o.children.length || o.positions[0] > 0)
					break;
				let a = o.children[0];
				if (!(a instanceof bh && 0 == o.positions[0])) break;
				o = a;
			}
		}
		let o = r.stateSlot(e.state, 4);
		if (o > 0)
			return (
				e.reduce(o),
				Sp &&
					console.log(
						s +
							this.stackID(e) +
							` (via always-reduce ${r.getName(65535 & o)})`,
					),
				!0
			);
		if (e.stack.length >= 8400)
			for (; e.stack.length > 6e3 && e.forceReduce(); );
		let a = this.tokens.getActions(e);
		for (let o = 0; o < a.length; ) {
			let l = a[o++],
				h = a[o++],
				c = a[o++],
				u = o == a.length || !i,
				f = u ? e : e.split(),
				O = this.tokens.mainToken;
			if (
				(f.apply(l, h, O ? O.start : f.pos, c),
				Sp &&
					console.log(
						s +
							this.stackID(f) +
							` (via ${65536 & l ? `reduce of ${r.getName(65535 & l)}` : "shift"} for ${r.getName(h)} @ ${n}${f == e ? "" : ", split"})`,
					),
				u)
			)
				return !0;
			f.pos > n ? t.push(f) : i.push(f);
		}
		return !1;
	}
	advanceFully(e, t) {
		let i = e.pos;
		for (;;) {
			if (!this.advanceStack(e, null, null)) return !1;
			if (e.pos > i) return $p(e, t), !0;
		}
	}
	runRecovery(e, t, i) {
		let n = null,
			r = !1;
		for (let s = 0; s < e.length; s++) {
			let o = e[s],
				a = t[s << 1],
				l = t[1 + (s << 1)],
				h = Sp ? this.stackID(o) + " -> " : "";
			if (o.deadEnd) {
				if (r) continue;
				if (
					((r = !0),
					o.restart(),
					Sp && console.log(h + this.stackID(o) + " (restarted)"),
					this.advanceFully(o, i))
				)
					continue;
			}
			let c = o.split(),
				u = h;
			for (let e = 0; c.forceReduce() && e < 10; e++) {
				if (
					(Sp && console.log(u + this.stackID(c) + " (via force-reduce)"),
					this.advanceFully(c, i))
				)
					break;
				Sp && (u = this.stackID(c) + " -> ");
			}
			for (let e of o.recoverByInsert(a))
				Sp && console.log(h + this.stackID(e) + " (via recover-insert)"),
					this.advanceFully(e, i);
			this.stream.end > o.pos
				? (l == o.pos && (l++, (a = 0)),
					o.recoverByDelete(a, l),
					Sp &&
						console.log(
							h +
								this.stackID(o) +
								` (via recover-delete ${this.parser.getName(a)})`,
						),
					$p(o, i))
				: (!n || n.score < o.score) && (n = o);
		}
		return n;
	}
	stackToTree(e) {
		return (
			e.close(),
			bh.build({
				buffer: hp.create(e),
				nodeSet: this.parser.nodeSet,
				topID: this.topTerm,
				maxBufferLength: this.parser.bufferLength,
				reused: this.reused,
				start: this.ranges[0].from,
				length: e.pos - this.ranges[0].from,
				minRepeatType: this.parser.minRepeatTerm,
			})
		);
	}
	stackID(e) {
		let t = (yp || (yp = new WeakMap())).get(e);
		return (
			t || yp.set(e, (t = String.fromCodePoint(this.nextStackID++))), t + e
		);
	}
}
function $p(e, t) {
	for (let i = 0; i < t.length; i++) {
		let n = t[i];
		if (n.pos == e.pos && n.sameState(e))
			return void (t[i].score < e.score && (t[i] = e));
	}
	t.push(e);
}
class Pp {
	constructor(e, t, i) {
		(this.source = e), (this.flags = t), (this.disabled = i);
	}
	allows(e) {
		return !this.disabled || 0 == this.disabled[e];
	}
}
const Zp = (e) => e;
class _p {
	constructor(e) {
		(this.start = e.start),
			(this.shift = e.shift || Zp),
			(this.reduce = e.reduce || Zp),
			(this.reuse = e.reuse || Zp),
			(this.hash = e.hash || (() => 0)),
			(this.strict = !1 !== e.strict);
	}
}
class Tp extends Vh {
	constructor(e) {
		if ((super(), (this.wrappers = []), 14 != e.version))
			throw new RangeError(
				`Parser version (${e.version}) doesn't match runtime version (14)`,
			);
		let t = e.nodeNames.split(" ");
		this.minRepeatTerm = t.length;
		for (let i = 0; i < e.repeatNodeCount; i++) t.push("");
		let i = Object.keys(e.topRules).map((t) => e.topRules[t][1]),
			n = [];
		for (let e = 0; e < t.length; e++) n.push([]);
		function r(e, t, i) {
			n[e].push([t, t.deserialize(String(i))]);
		}
		if (e.nodeProps)
			for (let t of e.nodeProps) {
				let e = t[0];
				"string" == typeof e && (e = uh[e]);
				for (let i = 1; i < t.length; ) {
					let n = t[i++];
					if (n >= 0) r(n, e, t[i++]);
					else {
						let s = t[i + -n];
						for (let o = -n; o > 0; o--) r(t[i++], e, s);
						i++;
					}
				}
			}
		(this.nodeSet = new ph(
			t.map((t, r) =>
				dh.define({
					name: r >= this.minRepeatTerm ? void 0 : t,
					id: r,
					props: n[r],
					top: i.indexOf(r) > -1,
					error: 0 == r,
					skipped: e.skippedNodes && e.skippedNodes.indexOf(r) > -1,
				}),
			),
		)),
			e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)),
			(this.strict = !1),
			(this.bufferLength = lh);
		let s = cp(e.tokenData);
		(this.context = e.context),
			(this.specializerSpecs = e.specialized || []),
			(this.specialized = new Uint16Array(this.specializerSpecs.length));
		for (let e = 0; e < this.specializerSpecs.length; e++)
			this.specialized[e] = this.specializerSpecs[e].term;
		(this.specializers = this.specializerSpecs.map(Ap)),
			(this.states = cp(e.states, Uint32Array)),
			(this.data = cp(e.stateData)),
			(this.goto = cp(e.goto)),
			(this.maxTerm = e.maxTerm),
			(this.tokenizers = e.tokenizers.map((e) =>
				"number" == typeof e ? new dp(s, e) : e,
			)),
			(this.topRules = e.topRules),
			(this.dialects = e.dialects || {}),
			(this.dynamicPrecedences = e.dynamicPrecedences || null),
			(this.tokenPrecTable = e.tokenPrec),
			(this.termNames = e.termNames || null),
			(this.maxNode = this.nodeSet.types.length - 1),
			(this.dialect = this.parseDialect()),
			(this.top = this.topRules[Object.keys(this.topRules)[0]]);
	}
	createParse(e, t, i) {
		let n = new vp(this, e, t, i);
		for (let r of this.wrappers) n = r(n, e, t, i);
		return n;
	}
	getGoto(e, t, i = !1) {
		let n = this.goto;
		if (t >= n[0]) return -1;
		for (let r = n[t + 1]; ; ) {
			let t = n[r++],
				s = 1 & t,
				o = n[r++];
			if (s && i) return o;
			for (let i = r + (t >> 1); r < i; r++) if (n[r] == e) return o;
			if (s) return -1;
		}
	}
	hasAction(e, t) {
		let i = this.data;
		for (let n = 0; n < 2; n++)
			for (let r, s = this.stateSlot(e, n ? 2 : 1); ; s += 3) {
				if (65535 == (r = i[s])) {
					if (1 != i[s + 1]) {
						if (2 == i[s + 1]) return Xp(i, s + 2);
						break;
					}
					r = i[(s = Xp(i, s + 2))];
				}
				if (r == t || 0 == r) return Xp(i, s + 1);
			}
		return 0;
	}
	stateSlot(e, t) {
		return this.states[6 * e + t];
	}
	stateFlag(e, t) {
		return (this.stateSlot(e, 0) & t) > 0;
	}
	validAction(e, t) {
		return !!this.allActions(e, (e) => e == t || null);
	}
	allActions(e, t) {
		let i = this.stateSlot(e, 4),
			n = i ? t(i) : void 0;
		for (let i = this.stateSlot(e, 1); null == n; i += 3) {
			if (65535 == this.data[i]) {
				if (1 != this.data[i + 1]) break;
				i = Xp(this.data, i + 2);
			}
			n = t(Xp(this.data, i + 1));
		}
		return n;
	}
	nextStates(e) {
		let t = [];
		for (let i = this.stateSlot(e, 1); ; i += 3) {
			if (65535 == this.data[i]) {
				if (1 != this.data[i + 1]) break;
				i = Xp(this.data, i + 2);
			}
			if (!(1 & this.data[i + 2])) {
				let e = this.data[i + 1];
				t.some((t, i) => 1 & i && t == e) || t.push(this.data[i], e);
			}
		}
		return t;
	}
	configure(e) {
		let t = Object.assign(Object.create(Tp.prototype), this);
		if ((e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top)) {
			let i = this.topRules[e.top];
			if (!i) throw new RangeError(`Invalid top rule name ${e.top}`);
			t.top = i;
		}
		return (
			e.tokenizers &&
				(t.tokenizers = this.tokenizers.map((t) => {
					let i = e.tokenizers.find((e) => e.from == t);
					return i ? i.to : t;
				})),
			e.specializers &&
				((t.specializers = this.specializers.slice()),
				(t.specializerSpecs = this.specializerSpecs.map((i, n) => {
					let r = e.specializers.find((e) => e.from == i.external);
					if (!r) return i;
					let s = Object.assign(Object.assign({}, i), { external: r.to });
					return (t.specializers[n] = Ap(s)), s;
				}))),
			e.contextTracker && (t.context = e.contextTracker),
			e.dialect && (t.dialect = this.parseDialect(e.dialect)),
			null != e.strict && (t.strict = e.strict),
			e.wrap && (t.wrappers = t.wrappers.concat(e.wrap)),
			null != e.bufferLength && (t.bufferLength = e.bufferLength),
			t
		);
	}
	hasWrappers() {
		return this.wrappers.length > 0;
	}
	getName(e) {
		return this.termNames
			? this.termNames[e]
			: String((e <= this.maxNode && this.nodeSet.types[e].name) || e);
	}
	get eofTerm() {
		return this.maxNode + 1;
	}
	get topNode() {
		return this.nodeSet.types[this.top[1]];
	}
	dynamicPrecedence(e) {
		let t = this.dynamicPrecedences;
		return null == t ? 0 : t[e] || 0;
	}
	parseDialect(e) {
		let t = Object.keys(this.dialects),
			i = t.map(() => !1);
		if (e)
			for (let n of e.split(" ")) {
				let e = t.indexOf(n);
				e >= 0 && (i[e] = !0);
			}
		let n = null;
		for (let e = 0; e < t.length; e++)
			if (!i[e])
				for (let i, r = this.dialects[t[e]]; 65535 != (i = this.data[r++]); )
					(n || (n = new Uint8Array(this.maxTerm + 1)))[i] = 1;
		return new Pp(e, i, n);
	}
	static deserialize(e) {
		return new Tp(e);
	}
}
function Xp(e, t) {
	return e[t] | (e[t + 1] << 16);
}
function Ap(e) {
	if (e.external) {
		let t = e.extend ? 1 : 0;
		return (i, n) => (e.external(i, n) << 1) | t;
	}
	return e.get;
}
const Cp = {
		area: !0,
		base: !0,
		br: !0,
		col: !0,
		command: !0,
		embed: !0,
		frame: !0,
		hr: !0,
		img: !0,
		input: !0,
		keygen: !0,
		link: !0,
		meta: !0,
		param: !0,
		source: !0,
		track: !0,
		wbr: !0,
		menuitem: !0,
	},
	Rp = {
		dd: !0,
		li: !0,
		optgroup: !0,
		option: !0,
		p: !0,
		rp: !0,
		rt: !0,
		tbody: !0,
		td: !0,
		tfoot: !0,
		th: !0,
		tr: !0,
	},
	Mp = {
		dd: { dd: !0, dt: !0 },
		dt: { dd: !0, dt: !0 },
		li: { li: !0 },
		option: { option: !0, optgroup: !0 },
		optgroup: { optgroup: !0 },
		p: {
			address: !0,
			article: !0,
			aside: !0,
			blockquote: !0,
			dir: !0,
			div: !0,
			dl: !0,
			fieldset: !0,
			footer: !0,
			form: !0,
			h1: !0,
			h2: !0,
			h3: !0,
			h4: !0,
			h5: !0,
			h6: !0,
			header: !0,
			hgroup: !0,
			hr: !0,
			menu: !0,
			nav: !0,
			ol: !0,
			p: !0,
			pre: !0,
			section: !0,
			table: !0,
			ul: !0,
		},
		rp: { rp: !0, rt: !0 },
		rt: { rp: !0, rt: !0 },
		tbody: { tbody: !0, tfoot: !0 },
		td: { td: !0, th: !0 },
		tfoot: { tbody: !0 },
		th: { td: !0, th: !0 },
		thead: { tbody: !0, tfoot: !0 },
		tr: { tr: !0 },
	};
function jp(e) {
	return 9 == e || 10 == e || 13 == e || 32 == e;
}
let Ep = null,
	qp = null,
	Vp = 0;
function Lp(e, t) {
	let i = e.pos + t;
	if (Vp == i && qp == e) return Ep;
	let n = e.peek(t);
	for (; jp(n); ) n = e.peek(++t);
	let r = "";
	for (
		;
		45 == (s = n) ||
		46 == s ||
		58 == s ||
		(s >= 65 && s <= 90) ||
		95 == s ||
		(s >= 97 && s <= 122) ||
		s >= 161;
	)
		(r += String.fromCharCode(n)), (n = e.peek(++t));
	var s;
	return (
		(qp = e),
		(Vp = i),
		(Ep = r ? r.toLowerCase() : n == Wp || n == zp ? void 0 : null)
	);
}
const Wp = 63,
	zp = 33;
function Yp(e, t) {
	(this.name = e), (this.parent = t);
}
const Dp = [6, 10, 7, 8, 9],
	Bp = new _p({
		start: null,
		shift: (e, t, i, n) => (Dp.indexOf(t) > -1 ? new Yp(Lp(n, 1) || "", e) : e),
		reduce: (e, t) => (20 == t && e ? e.parent : e),
		reuse(e, t, i, n) {
			let r = t.type.id;
			return 6 == r || 36 == r ? new Yp(Lp(n, 1) || "", e) : e;
		},
		strict: !1,
	}),
	Ip = new mp(
		(e, t) => {
			if (60 != e.next)
				return void (e.next < 0 && t.context && e.acceptToken(57));
			e.advance();
			let i = 47 == e.next;
			i && e.advance();
			let n = Lp(e, 0);
			if (void 0 === n) return;
			if (!n) return e.acceptToken(i ? 14 : 6);
			let r = t.context ? t.context.name : null;
			if (i) {
				if (n == r) return e.acceptToken(11);
				if (r && Rp[r]) return e.acceptToken(57, -2);
				if (t.dialectEnabled(0)) return e.acceptToken(12);
				for (let e = t.context; e; e = e.parent) if (e.name == n) return;
				e.acceptToken(13);
			} else {
				if ("script" == n) return e.acceptToken(7);
				if ("style" == n) return e.acceptToken(8);
				if ("textarea" == n) return e.acceptToken(9);
				if (Cp.hasOwnProperty(n)) return e.acceptToken(10);
				r && Mp[r] && Mp[r][n] ? e.acceptToken(57, -1) : e.acceptToken(6);
			}
		},
		{ contextual: !0 },
	),
	Up = new mp((e) => {
		for (let t = 0, i = 0; ; i++) {
			if (e.next < 0) {
				i && e.acceptToken(58);
				break;
			}
			if (45 == e.next) t++;
			else {
				if (62 == e.next && t >= 2) {
					i >= 3 && e.acceptToken(58, -2);
					break;
				}
				t = 0;
			}
			e.advance();
		}
	});
const Gp = new mp((e, t) => {
	if (47 == e.next && 62 == e.peek(1)) {
		let i =
			t.dialectEnabled(1) ||
			(function (e) {
				for (; e; e = e.parent)
					if ("svg" == e.name || "math" == e.name) return !0;
				return !1;
			})(t.context);
		e.acceptToken(i ? 5 : 4, 2);
	} else 62 == e.next && e.acceptToken(4, 1);
});
function Np(e, t, i) {
	let n = 2 + e.length;
	return new mp((r) => {
		for (let s = 0, o = 0, a = 0; ; a++) {
			if (r.next < 0) {
				a && r.acceptToken(t);
				break;
			}
			if (
				(0 == s && 60 == r.next) ||
				(1 == s && 47 == r.next) ||
				(s >= 2 && s < n && r.next == e.charCodeAt(s - 2))
			)
				s++, o++;
			else if ((2 != s && s != n) || !jp(r.next)) {
				if (s == n && 62 == r.next) {
					a > o ? r.acceptToken(t, -o) : r.acceptToken(i, -(o - 2));
					break;
				}
				if ((10 == r.next || 13 == r.next) && a) {
					r.acceptToken(t, 1);
					break;
				}
				s = o = 0;
			} else o++;
			r.advance();
		}
	});
}
const Hp = Np("script", 54, 1),
	Fp = Np("style", 55, 2),
	Kp = Np("textarea", 56, 3),
	Jp = sc({
		"Text RawText": wc.content,
		"StartTag StartCloseTag SelfClosingEndTag EndTag": wc.angleBracket,
		TagName: wc.tagName,
		"MismatchedCloseTag/TagName": [wc.tagName, wc.invalid],
		AttributeName: wc.attributeName,
		"AttributeValue UnquotedAttributeValue": wc.attributeValue,
		Is: wc.definitionOperator,
		"EntityReference CharacterReference": wc.character,
		Comment: wc.blockComment,
		ProcessingInst: wc.processingInstruction,
		DoctypeDecl: wc.documentMeta,
	}),
	em = Tp.deserialize({
		version: 14,
		states:
			",xOVO!rOOO!WQ#tO'#CqO!]Q#tO'#CzO!bQ#tO'#C}O!gQ#tO'#DQO!lQ#tO'#DSO!qOaO'#CpO!|ObO'#CpO#XOdO'#CpO$eO!rO'#CpOOO`'#Cp'#CpO$lO$fO'#DTO$tQ#tO'#DVO$yQ#tO'#DWOOO`'#Dk'#DkOOO`'#DY'#DYQVO!rOOO%OQ&rO,59]O%ZQ&rO,59fO%fQ&rO,59iO%qQ&rO,59lO%|Q&rO,59nOOOa'#D^'#D^O&XOaO'#CxO&dOaO,59[OOOb'#D_'#D_O&lObO'#C{O&wObO,59[OOOd'#D`'#D`O'POdO'#DOO'[OdO,59[OOO`'#Da'#DaO'dO!rO,59[O'kQ#tO'#DROOO`,59[,59[OOOp'#Db'#DbO'pO$fO,59oOOO`,59o,59oO'xQ#|O,59qO'}Q#|O,59rOOO`-E7W-E7WO(SQ&rO'#CsOOQW'#DZ'#DZO(bQ&rO1G.wOOOa1G.w1G.wOOO`1G/Y1G/YO(mQ&rO1G/QOOOb1G/Q1G/QO(xQ&rO1G/TOOOd1G/T1G/TO)TQ&rO1G/WOOO`1G/W1G/WO)`Q&rO1G/YOOOa-E7[-E7[O)kQ#tO'#CyOOO`1G.v1G.vOOOb-E7]-E7]O)pQ#tO'#C|OOOd-E7^-E7^O)uQ#tO'#DPOOO`-E7_-E7_O)zQ#|O,59mOOOp-E7`-E7`OOO`1G/Z1G/ZOOO`1G/]1G/]OOO`1G/^1G/^O*PQ,UO,59_OOQW-E7X-E7XOOOa7+$c7+$cOOO`7+$t7+$tOOOb7+$l7+$lOOOd7+$o7+$oOOO`7+$r7+$rO*[Q#|O,59eO*aQ#|O,59hO*fQ#|O,59kOOO`1G/X1G/XO*kO7[O'#CvO*|OMhO'#CvOOQW1G.y1G.yOOO`1G/P1G/POOO`1G/S1G/SOOO`1G/V1G/VOOOO'#D['#D[O+_O7[O,59bOOQW,59b,59bOOOO'#D]'#D]O+pOMhO,59bOOOO-E7Y-E7YOOQW1G.|1G.|OOOO-E7Z-E7Z",
		stateData:
			",]~O!^OS~OUSOVPOWQOXROYTO[]O][O^^O`^Oa^Ob^Oc^Ox^O{_O!dZO~OfaO~OfbO~OfcO~OfdO~OfeO~O!WfOPlP!ZlP~O!XiOQoP!ZoP~O!YlORrP!ZrP~OUSOVPOWQOXROYTOZqO[]O][O^^O`^Oa^Ob^Oc^Ox^O!dZO~O!ZrO~P#dO![sO!euO~OfvO~OfwO~OS|OT}OhyO~OS!POT}OhyO~OS!ROT}OhyO~OS!TOT}OhyO~OS}OT}OhyO~O!WfOPlX!ZlX~OP!WO!Z!XO~O!XiOQoX!ZoX~OQ!ZO!Z!XO~O!YlORrX!ZrX~OR!]O!Z!XO~O!Z!XO~P#dOf!_O~O![sO!e!aO~OS!bO~OS!cO~Oi!dOSgXTgXhgX~OS!fOT!gOhyO~OS!hOT!gOhyO~OS!iOT!gOhyO~OS!jOT!gOhyO~OS!gOT!gOhyO~Of!kO~Of!lO~Of!mO~OS!nO~Ok!qO!`!oO!b!pO~OS!rO~OS!sO~OS!tO~Oa!uOb!uOc!uO!`!wO!a!uO~Oa!xOb!xOc!xO!b!wO!c!xO~Oa!uOb!uOc!uO!`!{O!a!uO~Oa!xOb!xOc!xO!b!{O!c!xO~OT~bac!dx{!d~",
		goto: "%p!`PPPPPPPPPPPPPPPPPPPP!a!gP!mPP!yP!|#P#S#Y#]#`#f#i#l#r#x!aP!a!aP$O$U$l$r$x%O%U%[%bPPPPPPPP%hX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
		nodeNames:
			"⚠ StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
		maxTerm: 67,
		context: Bp,
		nodeProps: [
			[
				"closedBy",
				-10,
				1,
				2,
				3,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				"EndTag",
				6,
				"EndTag SelfClosingEndTag",
				-4,
				21,
				30,
				33,
				36,
				"CloseTag",
			],
			[
				"openedBy",
				4,
				"StartTag StartCloseTag",
				5,
				"StartTag",
				-4,
				29,
				32,
				35,
				37,
				"OpenTag",
			],
			[
				"group",
				-9,
				14,
				17,
				18,
				19,
				20,
				39,
				40,
				41,
				42,
				"Entity",
				16,
				"Entity TextContent",
				-3,
				28,
				31,
				34,
				"TextContent Entity",
			],
			[
				"isolate",
				-11,
				21,
				29,
				30,
				32,
				33,
				35,
				36,
				37,
				38,
				41,
				42,
				"ltr",
				-3,
				26,
				27,
				39,
				"",
			],
		],
		propSources: [Jp],
		skippedNodes: [0],
		repeatNodeCount: 9,
		tokenData:
			"!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|c`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bX`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UV`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pT`POv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!cpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({W`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!a`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!a`!cpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYkWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]``P!a`!cp!^^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebhSkWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXhSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vchS`P!a`!cpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!`h`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WihSkWc!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zbkWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOa!R!R7tP;=`<%l7S!Z8OYkWa!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{ihSkWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbhSkWa!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QchSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXhSa!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TakWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOb!R!RAwP;=`<%lAY!ZBRYkWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbhSkWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbhSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXhSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!bx`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYlhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_khS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_X`P!a`!cp!eQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZhSfQ`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!a`!cpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!a`!cp!dPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!a`!cpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!a`!cpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!a`!cpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!a`!cpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!a`!cpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!a`!cpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!a`!cpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!cpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO{PP!-nP;=`<%l!-Sq!-xS!cp{POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!a`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!a`{POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!a`!cp{POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!a`!cpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!a`!cpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!a`!cpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!a`!cpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!a`!cpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!a`!cpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!cpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOxPP!7TP;=`<%l!6Vq!7]V!cpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!cpxPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!a`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!a`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!a`xPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!a`!cpxPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXiS`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",
		tokenizers: [Hp, Fp, Kp, Gp, Ip, Up, 0, 1, 2, 3, 4, 5],
		topRules: { Document: [0, 15] },
		dialects: { noMatch: 0, selfClosing: 509 },
		tokenPrec: 511,
	});
function tm(e, t) {
	let i = Object.create(null);
	for (let n of e.getChildren(23)) {
		let e = n.getChild(24),
			r = n.getChild(26) || n.getChild(27);
		e &&
			(i[t.read(e.from, e.to)] = r
				? 26 == r.type.id
					? t.read(r.from + 1, r.to - 1)
					: t.read(r.from, r.to)
				: "");
	}
	return i;
}
function im(e, t) {
	let i = e.getChild(22);
	return i ? t.read(i.from, i.to) : " ";
}
function nm(e, t, i) {
	let n;
	for (let r of i)
		if (!r.attrs || r.attrs(n || (n = tm(e.node.parent.firstChild, t))))
			return { parser: r.parser };
	return null;
}
function rm(e = [], t = []) {
	let i = [],
		n = [],
		r = [],
		s = [];
	for (let t of e) {
		("script" == t.tag
			? i
			: "style" == t.tag
				? n
				: "textarea" == t.tag
					? r
					: s
		).push(t);
	}
	let o = t.length ? Object.create(null) : null;
	for (let e of t) (o[e.name] || (o[e.name] = [])).push(e);
	return Wh((e, t) => {
		let a = e.type.id;
		if (28 == a) return nm(e, t, i);
		if (31 == a) return nm(e, t, n);
		if (34 == a) return nm(e, t, r);
		if (20 == a && s.length) {
			let i,
				n = e.node,
				r = n.firstChild,
				o = r && im(r, t);
			if (o)
				for (let e of s)
					if (e.tag == o && (!e.attrs || e.attrs(i || (i = tm(r, t))))) {
						let t = n.lastChild,
							i = 37 == t.type.id ? t.from : n.to;
						if (i > r.to)
							return { parser: e.parser, overlay: [{ from: r.to, to: i }] };
					}
		}
		if (o && 23 == a) {
			let i,
				n = e.node;
			if ((i = n.firstChild)) {
				let e = o[t.read(i.from, i.to)];
				if (e)
					for (let i of e) {
						if (i.tagName && i.tagName != im(n.parent, t)) continue;
						let e = n.lastChild;
						if (26 == e.type.id) {
							let t = e.from + 1,
								n = e.lastChild,
								r = e.to - (n && n.isError ? 0 : 1);
							if (r > t)
								return { parser: i.parser, overlay: [{ from: t, to: r }] };
						} else if (27 == e.type.id)
							return {
								parser: i.parser,
								overlay: [{ from: e.from, to: e.to }],
							};
					}
			}
		}
		return null;
	});
}
const sm = [
	9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197,
	8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288,
];
function om(e) {
	return (e >= 65 && e <= 90) || (e >= 97 && e <= 122) || e >= 161;
}
function am(e) {
	return e >= 48 && e <= 57;
}
const lm = new mp((e, t) => {
		for (let i = !1, n = 0, r = 0; ; r++) {
			let { next: s } = e;
			if (om(s) || 45 == s || 95 == s || (i && am(s)))
				!i && (45 != s || r > 0) && (i = !0),
					n === r && 45 == s && n++,
					e.advance();
			else {
				if (92 != s || 10 == e.peek(1)) {
					i && e.acceptToken(40 == s ? 102 : 2 == n && t.canShift(2) ? 2 : 103);
					break;
				}
				e.advance(), e.next > -1 && e.advance(), (i = !0);
			}
		}
	}),
	hm = new mp((e) => {
		if (sm.includes(e.peek(-1))) {
			let { next: t } = e;
			(om(t) ||
				95 == t ||
				35 == t ||
				46 == t ||
				91 == t ||
				(58 == t && om(e.peek(1))) ||
				45 == t ||
				38 == t) &&
				e.acceptToken(101);
		}
	}),
	cm = new mp((e) => {
		if (!sm.includes(e.peek(-1))) {
			let { next: t } = e;
			if ((37 == t && (e.advance(), e.acceptToken(1)), om(t))) {
				do {
					e.advance();
				} while (om(e.next) || am(e.next));
				e.acceptToken(1);
			}
		}
	}),
	um = sc({
		"AtKeyword import charset namespace keyframes media supports":
			wc.definitionKeyword,
		"from to selector": wc.keyword,
		NamespaceName: wc.namespace,
		KeyframeName: wc.labelName,
		KeyframeRangeName: wc.operatorKeyword,
		TagName: wc.tagName,
		ClassName: wc.className,
		PseudoClassName: wc.constant(wc.className),
		IdName: wc.labelName,
		"FeatureName PropertyName": wc.propertyName,
		AttributeName: wc.attributeName,
		NumberLiteral: wc.number,
		KeywordQuery: wc.keyword,
		UnaryQueryOp: wc.operatorKeyword,
		"CallTag ValueName": wc.atom,
		VariableName: wc.variableName,
		Callee: wc.operatorKeyword,
		Unit: wc.unit,
		"UniversalSelector NestingSelector": wc.definitionOperator,
		MatchOp: wc.compareOperator,
		"ChildOp SiblingOp, LogicOp": wc.logicOperator,
		BinOp: wc.arithmeticOperator,
		Important: wc.modifier,
		Comment: wc.blockComment,
		ColorLiteral: wc.color,
		"ParenthesizedContent StringLiteral": wc.string,
		":": wc.punctuation,
		"PseudoOp #": wc.derefOperator,
		"; ,": wc.separator,
		"( )": wc.paren,
		"[ ]": wc.squareBracket,
		"{ }": wc.brace,
	}),
	fm = {
		__proto__: null,
		lang: 34,
		"nth-child": 34,
		"nth-last-child": 34,
		"nth-of-type": 34,
		"nth-last-of-type": 34,
		dir: 34,
		"host-context": 34,
		url: 62,
		"url-prefix": 62,
		domain: 62,
		regexp: 62,
		selector: 140,
	},
	Om = {
		__proto__: null,
		"@import": 120,
		"@media": 144,
		"@charset": 148,
		"@namespace": 152,
		"@keyframes": 158,
		"@supports": 170,
	},
	dm = { __proto__: null, not: 134, only: 134 },
	pm = Tp.deserialize({
		version: 14,
		states:
			":|QYQ[OOO#_Q[OOP#fOWOOOOQP'#Cd'#CdOOQP'#Cc'#CcO#kQ[O'#CfO$[QXO'#CaO$fQ[O'#CiO$qQ[O'#DUO$vQ[O'#DXOOQP'#Eo'#EoO${QdO'#DhO%jQ[O'#DuO${QdO'#DwO%{Q[O'#DyO&WQ[O'#D|O&`Q[O'#ESO&nQ[O'#EUOOQS'#En'#EnOOQS'#EX'#EXQYQ[OOO&uQXO'#CdO'jQWO'#DdO'oQWO'#EtO'zQ[O'#EtQOQWOOP(UO#tO'#C_POOO)C@^)C@^OOQP'#Ch'#ChOOQP,59Q,59QO#kQ[O,59QO(aQ[O,59TO$qQ[O,59pO$vQ[O,59sO(lQ[O,59vO(lQ[O,59xO(lQ[O,59yO(lQ[O'#E^O)WQWO,58{O)`Q[O'#DcOOQS,58{,58{OOQP'#Cl'#ClOOQO'#DS'#DSOOQP,59T,59TO)gQWO,59TO)lQWO,59TOOQP'#DW'#DWOOQP,59p,59pOOQO'#DY'#DYO)qQ`O,59sOOQS'#Cq'#CqO${QdO'#CrO)yQvO'#CtO+ZQtO,5:SOOQO'#Cy'#CyO)lQWO'#CxO+oQWO'#CzO+tQ[O'#DPOOQS'#Eq'#EqOOQO'#Dk'#DkO+|Q[O'#DrO,[QWO'#EuO&`Q[O'#DpO,jQWO'#DsOOQO'#Ev'#EvO)ZQWO,5:aO,oQpO,5:cOOQS'#D{'#D{O,wQWO,5:eO,|Q[O,5:eOOQO'#EO'#EOO-UQWO,5:hO-ZQWO,5:nO-cQWO,5:pOOQS-E8V-E8VO-kQdO,5:OO-{Q[O'#E`O.YQWO,5;`O.YQWO,5;`POOO'#EW'#EWP.eO#tO,58yPOOO,58y,58yOOQP1G.l1G.lOOQP1G.o1G.oO)gQWO1G.oO)lQWO1G.oOOQP1G/[1G/[O.pQ`O1G/_O/ZQXO1G/bO/qQXO1G/dO0XQXO1G/eO0oQXO,5:xOOQO-E8[-E8[OOQS1G.g1G.gO0yQWO,59}O1OQ[O'#DTO1VQdO'#CpOOQP1G/_1G/_O${QdO1G/_O1^QpO,59^OOQS,59`,59`O${QdO,59bO1fQWO1G/nOOQS,59d,59dO1kQ!bO,59fOOQS'#DQ'#DQOOQS'#EZ'#EZO1vQ[O,59kOOQS,59k,59kO2OQWO'#DkO2ZQWO,5:WO2`QWO,5:^O&`Q[O,5:YO2hQ[O'#EaO3PQWO,5;aO3[QWO,5:[O(lQ[O,5:_OOQS1G/{1G/{OOQS1G/}1G/}OOQS1G0P1G0PO3mQWO1G0PO3rQdO'#EPOOQS1G0S1G0SOOQS1G0Y1G0YOOQS1G0[1G0[O3}QtO1G/jOOQO1G/j1G/jOOQO,5:z,5:zO4eQ[O,5:zOOQO-E8^-E8^O4rQWO1G0zPOOO-E8U-E8UPOOO1G.e1G.eOOQP7+$Z7+$ZOOQP7+$y7+$yO${QdO7+$yOOQS1G/i1G/iO4}QXO'#EsO5XQWO,59oO5^QtO'#EYO6UQdO'#EpO6`QWO,59[O6eQpO7+$yOOQS1G.x1G.xOOQS1G.|1G.|OOQS7+%Y7+%YOOQS1G/Q1G/QO6mQWO1G/QOOQS-E8X-E8XOOQS1G/V1G/VO${QdO1G/rOOQO1G/x1G/xOOQO1G/t1G/tO6rQWO,5:{OOQO-E8_-E8_O7QQXO1G/yOOQS7+%k7+%kO7XQYO'#CtOOQO'#ER'#ERO7dQ`O'#EQOOQO'#EQ'#EQO7oQWO'#EbO7wQdO,5:kOOQS,5:k,5:kO8SQtO'#E_O${QdO'#E_O9TQdO7+%UOOQO7+%U7+%UOOQO1G0f1G0fO9hQpO<<HeO9pQ[O'#E]O9zQWO,5;_OOQP1G/Z1G/ZOOQS-E8W-E8WO:SQdO'#E[O:^QWO,5;[OOQT1G.v1G.vOOQP<<He<<HeOOQS7+$l7+$lO:fQdO7+%^OOQO7+%e7+%eOOQO,5:l,5:lO3uQdO'#EcO7oQWO,5:|OOQS,5:|,5:|OOQS-E8`-E8`OOQS1G0V1G0VO:mQtO,5:yOOQS-E8]-E8]OOQO<<Hp<<HpOOQPAN>PAN>PO;nQXO,5:wOOQO-E8Z-E8ZO;xQdO,5:vOOQO-E8Y-E8YOOQO<<Hx<<HxOOQO,5:},5:}OOQO-E8a-E8aOOQS1G0h1G0h",
		stateData:
			"<[~O#]OS#^QQ~OUYOXYOZTO^VO_VOrXOyWO!]aO!^ZO!j[O!l]O!n^O!q_O!w`O#ZRO~OQfOUYOXYOZTO^VO_VOrXOyWO!]aO!^ZO!j[O!l]O!n^O!q_O!w`O#ZeO~O#W#hP~P!ZO#^jO~O#ZlO~OZnO^oO_oOrqOypO!PrO!StO#XsO~OuuO!UwO~P#pOa}O#YzO#ZyO~O#Z!OO~O#Z!QO~OQ![Oc!TOg![Oi![Oo!YOr!ZO#Y!WO#Z!SO#f!UO~Oc!^O!e!`O!h!aO#Z!]O!U#iP~Oi!fOo!YO#Z!eO~Oi!hO#Z!hO~Oc!^O!e!`O!h!aO#Z!]O~O!Z#iP~P%jOZWX^WX^!XX_WXrWXuWXyWX!PWX!SWX!UWX#XWX~O^!mO~O!Z!nO#W#hX!T#hX~O#W#hX!T#hX~P!ZO#_!qO#`!qO#a!sO~Oa!wO#YzO#ZyO~OUYOXYOZTO^VO_VOrXOyWO#ZRO~OuuO!UwO~O!T#hP~P!ZOc#RO~Oc#SO~Oq#TO}#UO~OP#WOchXkhX!ZhX!ehX!hhX#ZhXbhXQhXghXihXohXrhXuhX!YhX#WhX#YhX#fhXqhX!ThX~Oc!^Ok#XO!e!`O!h!aO#Z!]O!Z#iP~Oc#[O~Oq#`O#Z#]O~Oc!^O!e!`O!h!aO#Z#aO~Ou#eO!c#dO!U#iX!Z#iX~Oc#hO~Ok#XO!Z#jO~O!Z#kO~Oi#lOo!YO~O!U#mO~O!UwO!c#dO~O!UwO!Z#pO~O!Y#rO!Z!Wa#W!Wa!T!Wa~P${O!Z#SX#W#SX!T#SX~P!ZO!Z!nO#W#ha!T#ha~O#_!qO#`!qO#a#xO~Oq#zO}#{O~OZnO^oO_oOrqOypO~Ou!Oi!P!Oi!S!Oi!U!Oi#X!Oib!Oi~P.xOu!Qi!P!Qi!S!Qi!U!Qi#X!Qib!Qi~P.xOu!Ri!P!Ri!S!Ri!U!Ri#X!Rib!Ri~P.xOu#Qa!U#Qa~P#pO!T#|O~Ob#gP~P(lOb#dP~P${Ob$TOk#XO~O!Z$VO~Ob$WOi$XOp$XO~Oq$ZO#Z#]O~O^!aXb!_X!c!_X~O^$[O~Ob$]O!c#dO~Oc!^O!e!`O!h!aO#Z!]Ou#TX!U#TX!Z#TX~Ou#eO!U#ia!Z#ia~O!c#dOu!da!U!da!Z!dab!da~O!Z$bO~O!T$iO#Z$dO#f$cO~Ok#XOu$kO!Y$mO!Z!Wi#W!Wi!T!Wi~P${O!Z#Sa#W#Sa!T#Sa~P!ZO!Z!nO#W#hi!T#hi~Ou$pOb#gX~P#pOb$rO~Ok#XOQ!|Xb!|Xc!|Xg!|Xi!|Xo!|Xr!|Xu!|X#Y!|X#Z!|X#f!|X~Ou$tOb#dX~P${Ob$vO~Ok#XOq$wO~Ob$xO~O!c#dOu#Ta!U#Ta!Z#Ta~Ob$zO~P#pOP#WOuhX!UhX~O#f$cOu!tX!U!tX~Ou$|O!UwO~O!T%QO#Z$dO#f$cO~Ok#XOQ#RXc#RXg#RXi#RXo#RXr#RXu#RX!Y#RX!Z#RX#W#RX#Y#RX#Z#RX#f#RX!T#RX~Ou$kO!Y%TO!Z!Wq#W!Wq!T!Wq~P${Ok#XOq%UO~Ob#PXu#PX~P(lOu$pOb#ga~Ob#OXu#OX~P${Ou$tOb#da~Ob%ZO~P${Ok#XOQ#Rac#Rag#Rai#Rao#Rar#Rau#Ra!Y#Ra!Z#Ra#W#Ra#Y#Ra#Z#Ra#f#Ra!T#Ra~Ob#Pau#Pa~P#pOb#Oau#Oa~P${O#]p#^#fk!S#f~",
		goto: "-o#kPPP#lP#oP#x$YP#xP$j#xPP$pPPP$v%P%PP%cP%PP%P%}&aPPPP%P&yP&}'T#xP'Z#x'aP#xP#x#xPPP'g'|(ZPP#oPP(b(b(l(bP(bP(b(bP#oP#oP#oP(o#oP(r(u(x)P#oP#oP)U)[)k)y*P*V*]*c*i*s*y+PPPPPPPPPPP+V+`,O,RP,w,z-Q-ZRkQ_bOPdhw!n#tmYOPdhrstuw!n#R#h#t$pmSOPdhrstuw!n#R#h#t$pQmTR!tnQ{VR!uoQ!u}Q#Z!XR#y!wq![Z]!T!m#S#U#X#q#{$Q$[$k$l$t$y%Xp![Z]!T!m#S#U#X#q#{$Q$[$k$l$t$y%XU$f#m$h$|R${$eq!XZ]!T!m#S#U#X#q#{$Q$[$k$l$t$y%Xp![Z]!T!m#S#U#X#q#{$Q$[$k$l$t$y%XQ!f^R#l!gT#^!Z#_Q|VR!voQ!u|R#y!vQ!PWR!xpQ!RXR!yqQxUQ#PvQ#i!cQ#o!jQ#p!kQ%O$gR%^$}SgPwQ!phQ#s!nR$n#tZfPhw!n#ta!b[`a!V!^!`#d#eR#b!^R!g^R!i_R#n!iS$g#m$hR%[$|V$e#m$h$|Q!rjR#w!rQdOShPwU!ldh#tR#t!nQ$Q#SU$s$Q$y%XQ$y$[R%X$tQ#_!ZR$Y#_Q$u$QR%Y$uQ$q#}R%W$qQvUR#OvQ$l#qR%S$lQ!ogS#u!o#vR#v!pQ#f!_R$`#fQ$h#mR%P$hQ$}$gR%]$}_cOPdhw!n#t^UOPdhw!n#tQ!zrQ!{sQ!|tQ!}uQ#}#RQ$a#hR%V$pR$R#SQ!VZQ!d]Q#V!TQ#q!m[$P#S$Q$[$t$y%XQ$S#UQ$U#XS$j#q$lQ$o#{R%R$kR$O#RQiPR#QwQ!c[Q!kaR#Y!VU!_[a!VQ!j`Q#c!^Q#g!`Q$^#dR$_#e",
		nodeNames:
			"⚠ Unit VariableName Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector . ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee CallLiteral CallTag ParenthesizedContent ] [ LineNames LineName , PseudoClassName ArgList IdSelector # IdName AttributeSelector AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp } { Block Declaration PropertyName Important ; ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports AtRule Styles",
		maxTerm: 118,
		nodeProps: [
			["isolate", -2, 3, 25, ""],
			["openedBy", 18, "(", 33, "[", 51, "{"],
			["closedBy", 19, ")", 34, "]", 52, "}"],
		],
		propSources: [um],
		skippedNodes: [0, 3, 88],
		repeatNodeCount: 12,
		tokenData:
			"J^~R!^OX$}X^%u^p$}pq%uqr)Xrs.Rst/utu6duv$}vw7^wx7oxy9^yz9oz{9t{|:_|}?Q}!O?c!O!P@Q!P!Q@i!Q![Ab![!]B]!]!^CX!^!_$}!_!`Cj!`!aC{!a!b$}!b!cDw!c!}$}!}#OFa#O#P$}#P#QFr#Q#R6d#R#T$}#T#UGT#U#c$}#c#dHf#d#o$}#o#pH{#p#q6d#q#rI^#r#sIo#s#y$}#y#z%u#z$f$}$f$g%u$g#BY$}#BY#BZ%u#BZ$IS$}$IS$I_%u$I_$I|$}$I|$JO%u$JO$JT$}$JT$JU%u$JU$KV$}$KV$KW%u$KW&FU$}&FU&FV%u&FV;'S$};'S;=`JW<%lO$}`%QSOy%^z;'S%^;'S;=`%o<%lO%^`%cSp`Oy%^z;'S%^;'S;=`%o<%lO%^`%rP;=`<%l%^~%zh#]~OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^~'mh#]~p`OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^l)[UOy%^z#]%^#]#^)n#^;'S%^;'S;=`%o<%lO%^l)sUp`Oy%^z#a%^#a#b*V#b;'S%^;'S;=`%o<%lO%^l*[Up`Oy%^z#d%^#d#e*n#e;'S%^;'S;=`%o<%lO%^l*sUp`Oy%^z#c%^#c#d+V#d;'S%^;'S;=`%o<%lO%^l+[Up`Oy%^z#f%^#f#g+n#g;'S%^;'S;=`%o<%lO%^l+sUp`Oy%^z#h%^#h#i,V#i;'S%^;'S;=`%o<%lO%^l,[Up`Oy%^z#T%^#T#U,n#U;'S%^;'S;=`%o<%lO%^l,sUp`Oy%^z#b%^#b#c-V#c;'S%^;'S;=`%o<%lO%^l-[Up`Oy%^z#h%^#h#i-n#i;'S%^;'S;=`%o<%lO%^l-uS!Y[p`Oy%^z;'S%^;'S;=`%o<%lO%^~.UWOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o<%lO.R~.sOi~~.vRO;'S.R;'S;=`/P;=`O.R~/SXOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o;=`<%l.R<%lO.R~/rP;=`<%l.Rn/zYyQOy%^z!Q%^!Q![0j![!c%^!c!i0j!i#T%^#T#Z0j#Z;'S%^;'S;=`%o<%lO%^l0oYp`Oy%^z!Q%^!Q![1_![!c%^!c!i1_!i#T%^#T#Z1_#Z;'S%^;'S;=`%o<%lO%^l1dYp`Oy%^z!Q%^!Q![2S![!c%^!c!i2S!i#T%^#T#Z2S#Z;'S%^;'S;=`%o<%lO%^l2ZYg[p`Oy%^z!Q%^!Q![2y![!c%^!c!i2y!i#T%^#T#Z2y#Z;'S%^;'S;=`%o<%lO%^l3QYg[p`Oy%^z!Q%^!Q![3p![!c%^!c!i3p!i#T%^#T#Z3p#Z;'S%^;'S;=`%o<%lO%^l3uYp`Oy%^z!Q%^!Q![4e![!c%^!c!i4e!i#T%^#T#Z4e#Z;'S%^;'S;=`%o<%lO%^l4lYg[p`Oy%^z!Q%^!Q![5[![!c%^!c!i5[!i#T%^#T#Z5[#Z;'S%^;'S;=`%o<%lO%^l5aYp`Oy%^z!Q%^!Q![6P![!c%^!c!i6P!i#T%^#T#Z6P#Z;'S%^;'S;=`%o<%lO%^l6WSg[p`Oy%^z;'S%^;'S;=`%o<%lO%^d6gUOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^d7QS}Sp`Oy%^z;'S%^;'S;=`%o<%lO%^b7cSXQOy%^z;'S%^;'S;=`%o<%lO%^~7rWOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W<%lO7o~8_RO;'S7o;'S;=`8h;=`O7o~8kXOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W;=`<%l7o<%lO7o~9ZP;=`<%l7on9cSc^Oy%^z;'S%^;'S;=`%o<%lO%^~9tOb~n9{UUQkWOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^n:fWkW!SQOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^l;TUp`Oy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^l;nYp`#f[Oy%^z!Q%^!Q![;g![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^l<cYp`Oy%^z{%^{|=R|}%^}!O=R!O!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=WUp`Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=qUp`#f[Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l>[[p`#f[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^n?VSu^Oy%^z;'S%^;'S;=`%o<%lO%^l?hWkWOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^n@VUZQOy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^~@nTkWOy%^z{@}{;'S%^;'S;=`%o<%lO%^~AUSp`#^~Oy%^z;'S%^;'S;=`%o<%lO%^lAg[#f[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^bBbU^QOy%^z![%^![!]Bt!];'S%^;'S;=`%o<%lO%^bB{S_Qp`Oy%^z;'S%^;'S;=`%o<%lO%^nC^S!Z^Oy%^z;'S%^;'S;=`%o<%lO%^dCoS}SOy%^z;'S%^;'S;=`%o<%lO%^bDQU!PQOy%^z!`%^!`!aDd!a;'S%^;'S;=`%o<%lO%^bDkS!PQp`Oy%^z;'S%^;'S;=`%o<%lO%^bDzWOy%^z!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^bEk[!]Qp`Oy%^z}%^}!OEd!O!Q%^!Q![Ed![!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^nFfSr^Oy%^z;'S%^;'S;=`%o<%lO%^nFwSq^Oy%^z;'S%^;'S;=`%o<%lO%^bGWUOy%^z#b%^#b#cGj#c;'S%^;'S;=`%o<%lO%^bGoUp`Oy%^z#W%^#W#XHR#X;'S%^;'S;=`%o<%lO%^bHYS!cQp`Oy%^z;'S%^;'S;=`%o<%lO%^bHiUOy%^z#f%^#f#gHR#g;'S%^;'S;=`%o<%lO%^fIQS!UUOy%^z;'S%^;'S;=`%o<%lO%^nIcS!T^Oy%^z;'S%^;'S;=`%o<%lO%^fItU!SQOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^`JZP;=`<%l$}",
		tokenizers: [
			hm,
			cm,
			lm,
			1,
			2,
			3,
			4,
			new pp("m~RRYZ[z{a~~g~aO#`~~dP!P!Qg~lO#a~~", 28, 107),
		],
		topRules: { StyleSheet: [0, 4], Styles: [1, 87] },
		specialized: [
			{ term: 102, get: (e) => fm[e] || -1 },
			{ term: 59, get: (e) => Om[e] || -1 },
			{ term: 103, get: (e) => dm[e] || -1 },
		],
		tokenPrec: 1246,
	});
let mm = null;
function gm() {
	if (!mm && "object" == typeof document && document.body) {
		let { style: e } = document.body,
			t = [],
			i = new Set();
		for (let n in e)
			"cssText" != n &&
				"cssFloat" != n &&
				"string" == typeof e[n] &&
				(/[A-Z]/.test(n) &&
					(n = n.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase())),
				i.has(n) || (t.push(n), i.add(n)));
		mm = t.sort().map((e) => ({ type: "property", label: e, apply: e + ": " }));
	}
	return mm || [];
}
const xm = [
		"active",
		"after",
		"any-link",
		"autofill",
		"backdrop",
		"before",
		"checked",
		"cue",
		"default",
		"defined",
		"disabled",
		"empty",
		"enabled",
		"file-selector-button",
		"first",
		"first-child",
		"first-letter",
		"first-line",
		"first-of-type",
		"focus",
		"focus-visible",
		"focus-within",
		"fullscreen",
		"has",
		"host",
		"host-context",
		"hover",
		"in-range",
		"indeterminate",
		"invalid",
		"is",
		"lang",
		"last-child",
		"last-of-type",
		"left",
		"link",
		"marker",
		"modal",
		"not",
		"nth-child",
		"nth-last-child",
		"nth-last-of-type",
		"nth-of-type",
		"only-child",
		"only-of-type",
		"optional",
		"out-of-range",
		"part",
		"placeholder",
		"placeholder-shown",
		"read-only",
		"read-write",
		"required",
		"right",
		"root",
		"scope",
		"selection",
		"slotted",
		"target",
		"target-text",
		"valid",
		"visited",
		"where",
	].map((e) => ({ type: "class", label: e })),
	bm = [
		"above",
		"absolute",
		"activeborder",
		"additive",
		"activecaption",
		"after-white-space",
		"ahead",
		"alias",
		"all",
		"all-scroll",
		"alphabetic",
		"alternate",
		"always",
		"antialiased",
		"appworkspace",
		"asterisks",
		"attr",
		"auto",
		"auto-flow",
		"avoid",
		"avoid-column",
		"avoid-page",
		"avoid-region",
		"axis-pan",
		"background",
		"backwards",
		"baseline",
		"below",
		"bidi-override",
		"blink",
		"block",
		"block-axis",
		"bold",
		"bolder",
		"border",
		"border-box",
		"both",
		"bottom",
		"break",
		"break-all",
		"break-word",
		"bullets",
		"button",
		"button-bevel",
		"buttonface",
		"buttonhighlight",
		"buttonshadow",
		"buttontext",
		"calc",
		"capitalize",
		"caps-lock-indicator",
		"caption",
		"captiontext",
		"caret",
		"cell",
		"center",
		"checkbox",
		"circle",
		"cjk-decimal",
		"clear",
		"clip",
		"close-quote",
		"col-resize",
		"collapse",
		"color",
		"color-burn",
		"color-dodge",
		"column",
		"column-reverse",
		"compact",
		"condensed",
		"contain",
		"content",
		"contents",
		"content-box",
		"context-menu",
		"continuous",
		"copy",
		"counter",
		"counters",
		"cover",
		"crop",
		"cross",
		"crosshair",
		"currentcolor",
		"cursive",
		"cyclic",
		"darken",
		"dashed",
		"decimal",
		"decimal-leading-zero",
		"default",
		"default-button",
		"dense",
		"destination-atop",
		"destination-in",
		"destination-out",
		"destination-over",
		"difference",
		"disc",
		"discard",
		"disclosure-closed",
		"disclosure-open",
		"document",
		"dot-dash",
		"dot-dot-dash",
		"dotted",
		"double",
		"down",
		"e-resize",
		"ease",
		"ease-in",
		"ease-in-out",
		"ease-out",
		"element",
		"ellipse",
		"ellipsis",
		"embed",
		"end",
		"ethiopic-abegede-gez",
		"ethiopic-halehame-aa-er",
		"ethiopic-halehame-gez",
		"ew-resize",
		"exclusion",
		"expanded",
		"extends",
		"extra-condensed",
		"extra-expanded",
		"fantasy",
		"fast",
		"fill",
		"fill-box",
		"fixed",
		"flat",
		"flex",
		"flex-end",
		"flex-start",
		"footnotes",
		"forwards",
		"from",
		"geometricPrecision",
		"graytext",
		"grid",
		"groove",
		"hand",
		"hard-light",
		"help",
		"hidden",
		"hide",
		"higher",
		"highlight",
		"highlighttext",
		"horizontal",
		"hsl",
		"hsla",
		"hue",
		"icon",
		"ignore",
		"inactiveborder",
		"inactivecaption",
		"inactivecaptiontext",
		"infinite",
		"infobackground",
		"infotext",
		"inherit",
		"initial",
		"inline",
		"inline-axis",
		"inline-block",
		"inline-flex",
		"inline-grid",
		"inline-table",
		"inset",
		"inside",
		"intrinsic",
		"invert",
		"italic",
		"justify",
		"keep-all",
		"landscape",
		"large",
		"larger",
		"left",
		"level",
		"lighter",
		"lighten",
		"line-through",
		"linear",
		"linear-gradient",
		"lines",
		"list-item",
		"listbox",
		"listitem",
		"local",
		"logical",
		"loud",
		"lower",
		"lower-hexadecimal",
		"lower-latin",
		"lower-norwegian",
		"lowercase",
		"ltr",
		"luminosity",
		"manipulation",
		"match",
		"matrix",
		"matrix3d",
		"medium",
		"menu",
		"menutext",
		"message-box",
		"middle",
		"min-intrinsic",
		"mix",
		"monospace",
		"move",
		"multiple",
		"multiple_mask_images",
		"multiply",
		"n-resize",
		"narrower",
		"ne-resize",
		"nesw-resize",
		"no-close-quote",
		"no-drop",
		"no-open-quote",
		"no-repeat",
		"none",
		"normal",
		"not-allowed",
		"nowrap",
		"ns-resize",
		"numbers",
		"numeric",
		"nw-resize",
		"nwse-resize",
		"oblique",
		"opacity",
		"open-quote",
		"optimizeLegibility",
		"optimizeSpeed",
		"outset",
		"outside",
		"outside-shape",
		"overlay",
		"overline",
		"padding",
		"padding-box",
		"painted",
		"page",
		"paused",
		"perspective",
		"pinch-zoom",
		"plus-darker",
		"plus-lighter",
		"pointer",
		"polygon",
		"portrait",
		"pre",
		"pre-line",
		"pre-wrap",
		"preserve-3d",
		"progress",
		"push-button",
		"radial-gradient",
		"radio",
		"read-only",
		"read-write",
		"read-write-plaintext-only",
		"rectangle",
		"region",
		"relative",
		"repeat",
		"repeating-linear-gradient",
		"repeating-radial-gradient",
		"repeat-x",
		"repeat-y",
		"reset",
		"reverse",
		"rgb",
		"rgba",
		"ridge",
		"right",
		"rotate",
		"rotate3d",
		"rotateX",
		"rotateY",
		"rotateZ",
		"round",
		"row",
		"row-resize",
		"row-reverse",
		"rtl",
		"run-in",
		"running",
		"s-resize",
		"sans-serif",
		"saturation",
		"scale",
		"scale3d",
		"scaleX",
		"scaleY",
		"scaleZ",
		"screen",
		"scroll",
		"scrollbar",
		"scroll-position",
		"se-resize",
		"self-start",
		"self-end",
		"semi-condensed",
		"semi-expanded",
		"separate",
		"serif",
		"show",
		"single",
		"skew",
		"skewX",
		"skewY",
		"skip-white-space",
		"slide",
		"slider-horizontal",
		"slider-vertical",
		"sliderthumb-horizontal",
		"sliderthumb-vertical",
		"slow",
		"small",
		"small-caps",
		"small-caption",
		"smaller",
		"soft-light",
		"solid",
		"source-atop",
		"source-in",
		"source-out",
		"source-over",
		"space",
		"space-around",
		"space-between",
		"space-evenly",
		"spell-out",
		"square",
		"start",
		"static",
		"status-bar",
		"stretch",
		"stroke",
		"stroke-box",
		"sub",
		"subpixel-antialiased",
		"svg_masks",
		"super",
		"sw-resize",
		"symbolic",
		"symbols",
		"system-ui",
		"table",
		"table-caption",
		"table-cell",
		"table-column",
		"table-column-group",
		"table-footer-group",
		"table-header-group",
		"table-row",
		"table-row-group",
		"text",
		"text-bottom",
		"text-top",
		"textarea",
		"textfield",
		"thick",
		"thin",
		"threeddarkshadow",
		"threedface",
		"threedhighlight",
		"threedlightshadow",
		"threedshadow",
		"to",
		"top",
		"transform",
		"translate",
		"translate3d",
		"translateX",
		"translateY",
		"translateZ",
		"transparent",
		"ultra-condensed",
		"ultra-expanded",
		"underline",
		"unidirectional-pan",
		"unset",
		"up",
		"upper-latin",
		"uppercase",
		"url",
		"var",
		"vertical",
		"vertical-text",
		"view-box",
		"visible",
		"visibleFill",
		"visiblePainted",
		"visibleStroke",
		"visual",
		"w-resize",
		"wait",
		"wave",
		"wider",
		"window",
		"windowframe",
		"windowtext",
		"words",
		"wrap",
		"wrap-reverse",
		"x-large",
		"x-small",
		"xor",
		"xx-large",
		"xx-small",
	]
		.map((e) => ({ type: "keyword", label: e }))
		.concat(
			[
				"aliceblue",
				"antiquewhite",
				"aqua",
				"aquamarine",
				"azure",
				"beige",
				"bisque",
				"black",
				"blanchedalmond",
				"blue",
				"blueviolet",
				"brown",
				"burlywood",
				"cadetblue",
				"chartreuse",
				"chocolate",
				"coral",
				"cornflowerblue",
				"cornsilk",
				"crimson",
				"cyan",
				"darkblue",
				"darkcyan",
				"darkgoldenrod",
				"darkgray",
				"darkgreen",
				"darkkhaki",
				"darkmagenta",
				"darkolivegreen",
				"darkorange",
				"darkorchid",
				"darkred",
				"darksalmon",
				"darkseagreen",
				"darkslateblue",
				"darkslategray",
				"darkturquoise",
				"darkviolet",
				"deeppink",
				"deepskyblue",
				"dimgray",
				"dodgerblue",
				"firebrick",
				"floralwhite",
				"forestgreen",
				"fuchsia",
				"gainsboro",
				"ghostwhite",
				"gold",
				"goldenrod",
				"gray",
				"grey",
				"green",
				"greenyellow",
				"honeydew",
				"hotpink",
				"indianred",
				"indigo",
				"ivory",
				"khaki",
				"lavender",
				"lavenderblush",
				"lawngreen",
				"lemonchiffon",
				"lightblue",
				"lightcoral",
				"lightcyan",
				"lightgoldenrodyellow",
				"lightgray",
				"lightgreen",
				"lightpink",
				"lightsalmon",
				"lightseagreen",
				"lightskyblue",
				"lightslategray",
				"lightsteelblue",
				"lightyellow",
				"lime",
				"limegreen",
				"linen",
				"magenta",
				"maroon",
				"mediumaquamarine",
				"mediumblue",
				"mediumorchid",
				"mediumpurple",
				"mediumseagreen",
				"mediumslateblue",
				"mediumspringgreen",
				"mediumturquoise",
				"mediumvioletred",
				"midnightblue",
				"mintcream",
				"mistyrose",
				"moccasin",
				"navajowhite",
				"navy",
				"oldlace",
				"olive",
				"olivedrab",
				"orange",
				"orangered",
				"orchid",
				"palegoldenrod",
				"palegreen",
				"paleturquoise",
				"palevioletred",
				"papayawhip",
				"peachpuff",
				"peru",
				"pink",
				"plum",
				"powderblue",
				"purple",
				"rebeccapurple",
				"red",
				"rosybrown",
				"royalblue",
				"saddlebrown",
				"salmon",
				"sandybrown",
				"seagreen",
				"seashell",
				"sienna",
				"silver",
				"skyblue",
				"slateblue",
				"slategray",
				"snow",
				"springgreen",
				"steelblue",
				"tan",
				"teal",
				"thistle",
				"tomato",
				"turquoise",
				"violet",
				"wheat",
				"white",
				"whitesmoke",
				"yellow",
				"yellowgreen",
			].map((e) => ({ type: "constant", label: e })),
		),
	Sm = [
		"a",
		"abbr",
		"address",
		"article",
		"aside",
		"b",
		"bdi",
		"bdo",
		"blockquote",
		"body",
		"br",
		"button",
		"canvas",
		"caption",
		"cite",
		"code",
		"col",
		"colgroup",
		"dd",
		"del",
		"details",
		"dfn",
		"dialog",
		"div",
		"dl",
		"dt",
		"em",
		"figcaption",
		"figure",
		"footer",
		"form",
		"header",
		"hgroup",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"hr",
		"html",
		"i",
		"iframe",
		"img",
		"input",
		"ins",
		"kbd",
		"label",
		"legend",
		"li",
		"main",
		"meter",
		"nav",
		"ol",
		"output",
		"p",
		"pre",
		"ruby",
		"section",
		"select",
		"small",
		"source",
		"span",
		"strong",
		"sub",
		"summary",
		"sup",
		"table",
		"tbody",
		"td",
		"template",
		"textarea",
		"tfoot",
		"th",
		"thead",
		"tr",
		"u",
		"ul",
	].map((e) => ({ type: "type", label: e })),
	ym = [
		"@charset",
		"@color-profile",
		"@container",
		"@counter-style",
		"@font-face",
		"@font-feature-values",
		"@font-palette-values",
		"@import",
		"@keyframes",
		"@layer",
		"@media",
		"@namespace",
		"@page",
		"@position-try",
		"@property",
		"@scope",
		"@starting-style",
		"@supports",
		"@view-transition",
	].map((e) => ({ type: "keyword", label: e })),
	Qm = /^(\w[\w-]*|-\w[\w-]*|)$/,
	wm = /^-(-[\w-]*)?$/;
const km = new Eh(),
	vm = ["Declaration"];
function $m(e) {
	for (let t = e; ; ) {
		if (t.type.isTop) return t;
		if (!(t = t.parent)) return e;
	}
}
function Pm(e, t, i) {
	if (t.to - t.from > 4096) {
		let n = km.get(t);
		if (n) return n;
		let r = [],
			s = new Set(),
			o = t.cursor(xh.IncludeAnonymous);
		if (o.firstChild())
			do {
				for (let t of Pm(e, o.node, i))
					s.has(t.label) || (s.add(t.label), r.push(t));
			} while (o.nextSibling());
		return km.set(t, r), r;
	}
	{
		let n = [],
			r = new Set();
		return (
			t.cursor().iterate((t) => {
				var s;
				if (
					i(t) &&
					t.matchContext(vm) &&
					":" ==
						(null === (s = t.node.nextSibling) || void 0 === s
							? void 0
							: s.name)
				) {
					let i = e.sliceString(t.from, t.to);
					r.has(i) || (r.add(i), n.push({ label: i, type: "variable" }));
				}
			}),
			n
		);
	}
}
const Zm = (e) => (t) => {
		let { state: i, pos: n } = t,
			r = Xc(i).resolveInner(n, -1),
			s =
				r.type.isError &&
				r.from == r.to - 1 &&
				"-" == i.doc.sliceString(r.from, r.to);
		if (
			"PropertyName" == r.name ||
			((s || "TagName" == r.name) &&
				/^(Block|Styles)$/.test(r.resolve(r.to).name))
		)
			return { from: r.from, options: gm(), validFor: Qm };
		if ("ValueName" == r.name)
			return { from: r.from, options: bm, validFor: Qm };
		if ("PseudoClassName" == r.name)
			return { from: r.from, options: xm, validFor: Qm };
		if (
			e(r) ||
			((t.explicit || s) &&
				(function (e, t) {
					var i;
					if (
						(("(" == e.name || e.type.isError) && (e = e.parent || e),
						"ArgList" != e.name)
					)
						return !1;
					let n =
						null === (i = e.parent) || void 0 === i ? void 0 : i.firstChild;
					return (
						"Callee" == (null == n ? void 0 : n.name) &&
						"var" == t.sliceString(n.from, n.to)
					);
				})(r, i.doc))
		)
			return {
				from: e(r) || s ? r.from : n,
				options: Pm(i.doc, $m(r), e),
				validFor: wm,
			};
		if ("TagName" == r.name) {
			for (let { parent: e } = r; e; e = e.parent)
				if ("Block" == e.name)
					return { from: r.from, options: gm(), validFor: Qm };
			return { from: r.from, options: Sm, validFor: Qm };
		}
		if ("AtKeyword" == r.name)
			return { from: r.from, options: ym, validFor: Qm };
		if (!t.explicit) return null;
		let o = r.resolve(n),
			a = o.childBefore(n);
		return a && ":" == a.name && "PseudoClassSelector" == o.name
			? { from: n, options: xm, validFor: Qm }
			: (a && ":" == a.name && "Declaration" == o.name) || "ArgList" == o.name
				? { from: n, options: bm, validFor: Qm }
				: "Block" == o.name || "Styles" == o.name
					? { from: n, options: gm(), validFor: Qm }
					: null;
	},
	_m = Zm((e) => "VariableName" == e.name),
	Tm = Tc.define({
		name: "css",
		parser: pm.configure({
			props: [
				Nc.add({ Declaration: ru() }),
				ou.add({ "Block KeyframeList": au }),
			],
		}),
		languageData: {
			commentTokens: { block: { open: "/*", close: "*/" } },
			indentOnInput: /^\s*\}$/,
			wordChars: "-",
		},
	});
function Xm() {
	return new Wc(Tm, Tm.data.of({ autocomplete: _m }));
}
var Am = Object.freeze({
	__proto__: null,
	css: Xm,
	cssCompletionSource: _m,
	cssLanguage: Tm,
	defineCSSCompletionSource: Zm,
});
const Cm = [
		9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197,
		8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288,
	],
	Rm = new _p({
		start: !1,
		shift: (e, t) => (5 == t || 6 == t || 318 == t ? e : 319 == t),
		strict: !1,
	}),
	Mm = new mp(
		(e, t) => {
			let { next: i } = e;
			(125 == i || -1 == i || t.context) && e.acceptToken(316);
		},
		{ contextual: !0, fallback: !0 },
	),
	jm = new mp(
		(e, t) => {
			let i,
				{ next: n } = e;
			Cm.indexOf(n) > -1 ||
				((47 != n || (47 != (i = e.peek(1)) && 42 != i)) &&
					(125 == n || 59 == n || -1 == n || t.context || e.acceptToken(314)));
		},
		{ contextual: !0 },
	),
	Em = new mp(
		(e, t) => {
			91 != e.next || t.context || e.acceptToken(315);
		},
		{ contextual: !0 },
	),
	qm = new mp(
		(e, t) => {
			let { next: i } = e;
			if (43 == i || 45 == i) {
				if ((e.advance(), i == e.next)) {
					e.advance();
					let i = !t.context && t.canShift(1);
					e.acceptToken(i ? 1 : 2);
				}
			} else
				63 == i &&
					46 == e.peek(1) &&
					(e.advance(),
					e.advance(),
					(e.next < 48 || e.next > 57) && e.acceptToken(3));
		},
		{ contextual: !0 },
	);
function Vm(e, t) {
	return (
		(e >= 65 && e <= 90) ||
		(e >= 97 && e <= 122) ||
		95 == e ||
		e >= 192 ||
		(!t && e >= 48 && e <= 57)
	);
}
const Lm = new mp((e, t) => {
		if (60 != e.next || !t.dialectEnabled(0)) return;
		if ((e.advance(), 47 == e.next)) return;
		let i = 0;
		for (; Cm.indexOf(e.next) > -1; ) e.advance(), i++;
		if (Vm(e.next, !0)) {
			for (e.advance(), i++; Vm(e.next, !1); ) e.advance(), i++;
			for (; Cm.indexOf(e.next) > -1; ) e.advance(), i++;
			if (44 == e.next) return;
			for (let t = 0; ; t++) {
				if (7 == t) {
					if (!Vm(e.next, !0)) return;
					break;
				}
				if (e.next != "extends".charCodeAt(t)) break;
				e.advance(), i++;
			}
		}
		e.acceptToken(4, -i);
	}),
	Wm = sc({
		"get set async static": wc.modifier,
		"for while do if else switch try catch finally return throw break continue default case":
			wc.controlKeyword,
		"in of await yield void typeof delete instanceof": wc.operatorKeyword,
		"let var const using function class extends": wc.definitionKeyword,
		"import export from": wc.moduleKeyword,
		"with debugger as new": wc.keyword,
		TemplateString: wc.special(wc.string),
		super: wc.atom,
		BooleanLiteral: wc.bool,
		this: wc.self,
		null: wc.null,
		Star: wc.modifier,
		VariableName: wc.variableName,
		"CallExpression/VariableName TaggedTemplateExpression/VariableName":
			wc.function(wc.variableName),
		VariableDefinition: wc.definition(wc.variableName),
		Label: wc.labelName,
		PropertyName: wc.propertyName,
		PrivatePropertyName: wc.special(wc.propertyName),
		"CallExpression/MemberExpression/PropertyName": wc.function(
			wc.propertyName,
		),
		"FunctionDeclaration/VariableDefinition": wc.function(
			wc.definition(wc.variableName),
		),
		"ClassDeclaration/VariableDefinition": wc.definition(wc.className),
		"NewExpression/VariableName": wc.className,
		PropertyDefinition: wc.definition(wc.propertyName),
		PrivatePropertyDefinition: wc.definition(wc.special(wc.propertyName)),
		UpdateOp: wc.updateOperator,
		"LineComment Hashbang": wc.lineComment,
		BlockComment: wc.blockComment,
		Number: wc.number,
		String: wc.string,
		Escape: wc.escape,
		ArithOp: wc.arithmeticOperator,
		LogicOp: wc.logicOperator,
		BitOp: wc.bitwiseOperator,
		CompareOp: wc.compareOperator,
		RegExp: wc.regexp,
		Equals: wc.definitionOperator,
		Arrow: wc.function(wc.punctuation),
		": Spread": wc.punctuation,
		"( )": wc.paren,
		"[ ]": wc.squareBracket,
		"{ }": wc.brace,
		"InterpolationStart InterpolationEnd": wc.special(wc.brace),
		".": wc.derefOperator,
		", ;": wc.separator,
		"@": wc.meta,
		TypeName: wc.typeName,
		TypeDefinition: wc.definition(wc.typeName),
		"type enum interface implements namespace module declare":
			wc.definitionKeyword,
		"abstract global Privacy readonly override": wc.modifier,
		"is keyof unique infer asserts": wc.operatorKeyword,
		JSXAttributeValue: wc.attributeValue,
		JSXText: wc.content,
		"JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag":
			wc.angleBracket,
		"JSXIdentifier JSXNameSpacedName": wc.tagName,
		"JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName":
			wc.attributeName,
		"JSXBuiltin/JSXIdentifier": wc.standard(wc.tagName),
	}),
	zm = {
		__proto__: null,
		export: 20,
		as: 25,
		from: 33,
		default: 36,
		async: 41,
		function: 42,
		const: 52,
		extends: 56,
		this: 60,
		true: 68,
		false: 68,
		null: 80,
		void: 84,
		typeof: 88,
		super: 104,
		new: 138,
		delete: 150,
		yield: 159,
		await: 163,
		class: 168,
		public: 231,
		private: 231,
		protected: 231,
		readonly: 233,
		instanceof: 252,
		satisfies: 255,
		in: 256,
		import: 290,
		keyof: 347,
		unique: 351,
		infer: 357,
		asserts: 393,
		is: 395,
		abstract: 415,
		implements: 417,
		type: 419,
		let: 422,
		var: 424,
		using: 427,
		interface: 433,
		enum: 437,
		namespace: 443,
		module: 445,
		declare: 449,
		global: 453,
		for: 472,
		of: 481,
		while: 484,
		with: 488,
		do: 492,
		if: 496,
		else: 498,
		switch: 502,
		case: 508,
		try: 514,
		catch: 518,
		finally: 522,
		return: 526,
		throw: 530,
		break: 534,
		continue: 538,
		debugger: 542,
	},
	Ym = {
		__proto__: null,
		async: 125,
		get: 127,
		set: 129,
		declare: 191,
		public: 193,
		private: 193,
		protected: 193,
		static: 195,
		abstract: 197,
		override: 199,
		readonly: 205,
		accessor: 207,
		new: 399,
	},
	Dm = { __proto__: null, "<": 189 },
	Bm = Tp.deserialize({
		version: 14,
		states:
			"$EOQ%TQlOOO%[QlOOO'_QpOOP(lO`OOO*zQ!0MxO'#CiO+RO#tO'#CjO+aO&jO'#CjO+oO#@ItO'#D_O.QQlO'#DeO.bQlO'#DpO%[QlO'#DxO0fQlO'#EQOOQ!0Lf'#EY'#EYO1PQ`O'#EVOOQO'#En'#EnOOQO'#Ij'#IjO1XQ`O'#GrO1dQ`O'#EmO1iQ`O'#EmO3hQ!0MxO'#JpO6[Q!0MxO'#JqO6uQ`O'#F[O6zQ,UO'#FsOOQ!0Lf'#Fe'#FeO7VO7dO'#FeO7eQMhO'#F{O9UQ`O'#FzOOQ!0Lf'#Jq'#JqOOQ!0Lb'#Jp'#JpO9ZQ`O'#GvOOQ['#K]'#K]O9fQ`O'#IWO9kQ!0LrO'#IXOOQ['#J^'#J^OOQ['#I]'#I]Q`QlOOQ`QlOOO9sQ!L^O'#DtO9zQlO'#D|O:RQlO'#EOO9aQ`O'#GrO:YQMhO'#CoO:hQ`O'#ElO:sQ`O'#EwO:xQMhO'#FdO;gQ`O'#GrOOQO'#K^'#K^O;lQ`O'#K^O;zQ`O'#GzO;zQ`O'#G{O;zQ`O'#G}O9aQ`O'#HQO<qQ`O'#HTO>YQ`O'#CeO>jQ`O'#HaO>rQ`O'#HgO>rQ`O'#HiO`QlO'#HkO>rQ`O'#HmO>rQ`O'#HpO>wQ`O'#HvO>|Q!0LsO'#H|O%[QlO'#IOO?XQ!0LsO'#IQO?dQ!0LsO'#ISO9kQ!0LrO'#IUO?oQ!0MxO'#CiO@qQpO'#DjQOQ`OOO%[QlO'#EOOAXQ`O'#ERO:YQMhO'#ElOAdQ`O'#ElOAoQ!bO'#FdOOQ['#Cg'#CgOOQ!0Lb'#Do'#DoOOQ!0Lb'#Jt'#JtO%[QlO'#JtOOQO'#Jw'#JwOOQO'#If'#IfOBoQpO'#EeOOQ!0Lb'#Ed'#EdOOQ!0Lb'#J{'#J{OCkQ!0MSO'#EeOCuQpO'#EUOOQO'#Jv'#JvODZQpO'#JwOEhQpO'#EUOCuQpO'#EePEuO&2DjO'#CbPOOO)CD{)CD{OOOO'#I^'#I^OFQO#tO,59UOOQ!0Lh,59U,59UOOOO'#I_'#I_OF`O&jO,59UOFnQ!L^O'#DaOOOO'#Ia'#IaOFuO#@ItO,59yOOQ!0Lf,59y,59yOGTQlO'#IbOGhQ`O'#JrOIgQ!fO'#JrO+}QlO'#JrOInQ`O,5:POJUQ`O'#EnOJcQ`O'#KROJnQ`O'#KQOJnQ`O'#KQOJvQ`O,5;[OJ{Q`O'#KPOOQ!0Ln,5:[,5:[OKSQlO,5:[OMQQ!0MxO,5:dOMqQ`O,5:lON[Q!0LrO'#KOONcQ`O'#J}O9ZQ`O'#J}ONwQ`O'#J}O! PQ`O,5;ZO! UQ`O'#J}O!#ZQ!fO'#JqOOQ!0Lh'#Ci'#CiO%[QlO'#EQO!#yQ!fO,5:qOOQS'#Jx'#JxOOQO-E<h-E<hO9aQ`O,5=^O!$aQ`O,5=^O!$fQlO,5;XO!&iQMhO'#EiO!(SQ`O,5;XO!(XQlO'#DwO!(cQpO,5;bO!(kQpO,5;bO%[QlO,5;bOOQ['#FS'#FSOOQ['#FU'#FUO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cO%[QlO,5;cOOQ['#FY'#FYO!(yQlO,5;sOOQ!0Lf,5;x,5;xOOQ!0Lf,5;y,5;yOOQ!0Lf,5;{,5;{O%[QlO'#InO!*|Q!0LrO,5<hO%[QlO,5;cO!&iQMhO,5;cO!+kQMhO,5;cO!-]QMhO'#E[O%[QlO,5;vOOQ!0Lf,5;z,5;zO!-dQ,UO'#FiO!.aQ,UO'#KVO!-{Q,UO'#KVO!.hQ,UO'#KVOOQO'#KV'#KVO!.|Q,UO,5<ROOOW,5<_,5<_O!/_QlO'#FuOOOW'#Im'#ImO7VO7dO,5<PO!/fQ,UO'#FwOOQ!0Lf,5<P,5<PO!0VQ$IUO'#CwOOQ!0Lh'#C{'#C{O!0jO#@ItO'#DPO!1WQMjO,5<dO!1_Q`O,5<gO!2zQ(CWO'#GWO!3XQ`O'#GXO!3^Q`O'#GXO!4|Q(CWO'#G]O!6RQpO'#GaOOQO'#Gm'#GmO!+rQMhO'#GlOOQO'#Go'#GoO!+rQMhO'#GnO!6tQ$IUO'#JjOOQ!0Lh'#Jj'#JjO!7OQ`O'#JiO!7^Q`O'#JhO!7fQ`O'#CuOOQ!0Lh'#Cy'#CyO!7qQ`O'#C{OOQ!0Lh'#DT'#DTOOQ!0Lh'#DV'#DVO1SQ`O'#DXO!+rQMhO'#GOO!+rQMhO'#GQO!7vQ`O'#GSO!7{Q`O'#GTO!3^Q`O'#GZO!+rQMhO'#G`O;zQ`O'#JiO!8QQ`O'#EoO!8oQ`O,5<fOOQ!0Lb'#Cr'#CrO!8wQ`O'#EpO!9qQpO'#EqOOQ!0Lb'#KP'#KPO!9xQ!0LrO'#K_O9kQ!0LrO,5=bO`QlO,5>rOOQ['#Jf'#JfOOQ[,5>s,5>sOOQ[-E<Z-E<ZO!;wQ!0MxO,5:`O!9lQpO,5:^O!>bQ!0MxO,5:hO%[QlO,5:hO!@xQ!0MxO,5:jOOQO,5@x,5@xO!AiQMhO,5=^O!AwQ!0LrO'#JgO9UQ`O'#JgO!BYQ!0LrO,59ZO!BeQpO,59ZO!BmQMhO,59ZO:YQMhO,59ZO!BxQ`O,5;XO!CQQ`O'#H`O!CfQ`O'#KbO%[QlO,5;|O!9lQpO,5<OO!CnQ`O,5=yO!CsQ`O,5=yO!CxQ`O,5=yO9kQ!0LrO,5=yO;zQ`O,5=iOOQO'#Cw'#CwO!DWQpO,5=fO!D`QMhO,5=gO!DkQ`O,5=iO!DpQ!bO,5=lO!DxQ`O'#K^O>wQ`O'#HVO9aQ`O'#HXO!D}Q`O'#HXO:YQMhO'#HZO!ESQ`O'#HZOOQ[,5=o,5=oO!EXQ`O'#H[O!EjQ`O'#CoO!EoQ`O,59PO!EyQ`O,59PO!HOQlO,59POOQ[,59P,59PO!H`Q!0LrO,59PO%[QlO,59PO!JkQlO'#HcOOQ['#Hd'#HdOOQ['#He'#HeO`QlO,5={O!KRQ`O,5={O`QlO,5>RO`QlO,5>TO!KWQ`O,5>VO`QlO,5>XO!K]Q`O,5>[O!KbQlO,5>bOOQ[,5>h,5>hO%[QlO,5>hO9kQ!0LrO,5>jOOQ[,5>l,5>lO# lQ`O,5>lOOQ[,5>n,5>nO# lQ`O,5>nOOQ[,5>p,5>pO#!YQpO'#D]O%[QlO'#JtO#!{QpO'#JtO##VQpO'#DkO##hQpO'#DkO#%yQlO'#DkO#&QQ`O'#JsO#&YQ`O,5:UO#&_Q`O'#ErO#&mQ`O'#KSO#&uQ`O,5;]O#&zQpO'#DkO#'XQpO'#ETOOQ!0Lf,5:m,5:mO%[QlO,5:mO#'`Q`O,5:mO>wQ`O,5;WO!BeQpO,5;WO!BmQMhO,5;WO:YQMhO,5;WO#'hQ`O,5@`O#'mQ07dO,5:qOOQO-E<d-E<dO#(sQ!0MSO,5;POCuQpO,5:pO#(}QpO,5:pOCuQpO,5;PO!BYQ!0LrO,5:pOOQ!0Lb'#Eh'#EhOOQO,5;P,5;PO%[QlO,5;PO#)[Q!0LrO,5;PO#)gQ!0LrO,5;PO!BeQpO,5:pOOQO,5;V,5;VO#)uQ!0LrO,5;PPOOO'#I['#I[P#*ZO&2DjO,58|POOO,58|,58|OOOO-E<[-E<[OOQ!0Lh1G.p1G.pOOOO-E<]-E<]OOOO,59{,59{O#*fQ!bO,59{OOOO-E<_-E<_OOQ!0Lf1G/e1G/eO#*kQ!fO,5>|O+}QlO,5>|OOQO,5?S,5?SO#*uQlO'#IbOOQO-E<`-E<`O#+SQ`O,5@^O#+[Q!fO,5@^O#+cQ`O,5@lOOQ!0Lf1G/k1G/kO%[QlO,5@mO#+kQ`O'#IhOOQO-E<f-E<fO#+cQ`O,5@lOOQ!0Lb1G0v1G0vOOQ!0Ln1G/v1G/vOOQ!0Ln1G0W1G0WO%[QlO,5@jO#,PQ!0LrO,5@jO#,bQ!0LrO,5@jO#,iQ`O,5@iO9ZQ`O,5@iO#,qQ`O,5@iO#-PQ`O'#IkO#,iQ`O,5@iOOQ!0Lb1G0u1G0uO!(cQpO,5:sO!(nQpO,5:sOOQS,5:u,5:uO#-qQdO,5:uO#-yQMhO1G2xO9aQ`O1G2xOOQ!0Lf1G0s1G0sO#.XQ!0MxO1G0sO#/^Q!0MvO,5;TOOQ!0Lh'#GV'#GVO#/zQ!0MzO'#JjO!$fQlO1G0sO#2VQ!fO'#JuO%[QlO'#JuO#2aQ`O,5:cOOQ!0Lh'#D]'#D]OOQ!0Lf1G0|1G0|O%[QlO1G0|OOQ!0Lf1G1e1G1eO#2fQ`O1G0|O#4zQ!0MxO1G0}O#5RQ!0MxO1G0}O#7iQ!0MxO1G0}O#7pQ!0MxO1G0}O#:WQ!0MxO1G0}O#<nQ!0MxO1G0}O#<uQ!0MxO1G0}O#<|Q!0MxO1G0}O#?dQ!0MxO1G0}O#?kQ!0MxO1G0}O#AxQ?MtO'#CiO#CsQ?MtO1G1_O#CzQ?MtO'#JqO#D_Q!0MxO,5?YOOQ!0Lb-E<l-E<lO#FlQ!0MxO1G0}O#GiQ!0MzO1G0}OOQ!0Lf1G0}1G0}O#HlQMjO'#JzO#HvQ`O,5:vO#H{Q!0MxO1G1bO#IoQ,UO,5<VO#IwQ,UO,5<WO#JPQ,UO'#FnO#JhQ`O'#FmOOQO'#KW'#KWOOQO'#Il'#IlO#JmQ,UO1G1mOOQ!0Lf1G1m1G1mOOOW1G1x1G1xO#KOQ?MtO'#JpO#KYQ`O,5<aO!(yQlO,5<aOOOW-E<k-E<kOOQ!0Lf1G1k1G1kO#K_QpO'#KVOOQ!0Lf,5<c,5<cO#KgQpO,5<cO#KlQMhO'#DROOOO'#I`'#I`O#KsO#@ItO,59kOOQ!0Lh,59k,59kO%[QlO1G2OO!7{Q`O'#IpO#LOQ`O,5<yOOQ!0Lh,5<v,5<vO!+rQMhO'#IsO#LlQMjO,5=WO!+rQMhO'#IuO#M_QMjO,5=YO!&iQMhO,5=[OOQO1G2R1G2RO#MiQ!dO'#CrO#M|Q(CWO'#EpO$ RQpO'#GaO$ iQ!dO,5<rO$ pQ`O'#KYO9ZQ`O'#KYO$!OQ`O,5<tO!+rQMhO,5<sO$!TQ`O'#GYO$!fQ`O,5<sO$!kQ!dO'#GVO$!xQ!dO'#KZO$#SQ`O'#KZO!&iQMhO'#KZO$#XQ`O,5<wO$#^QlO'#JtO$#hQpO'#GbO##hQpO'#GbO$#yQ`O'#GfO!3^Q`O'#GjO$$OQ!0LrO'#IrO$$ZQpO,5<{OOQ!0Lp,5<{,5<{O$$bQpO'#GbO$$oQpO'#GcO$%QQpO'#GcO$%VQMjO,5=WO$%gQMjO,5=YOOQ!0Lh,5=],5=]O!+rQMhO,5@TO!+rQMhO,5@TO$%wQ`O'#IwO$&VQ`O,5@SO$&_Q`O,59aOOQ!0Lh,59g,59gO$'UQ$IYO,59sOOQ!0Lh'#Jn'#JnO$'wQMjO,5<jO$(jQMjO,5<lO@iQ`O,5<nOOQ!0Lh,5<o,5<oO$(tQ`O,5<uO$(yQMjO,5<zO$)ZQ`O,5@TO$)iQ`O'#J}O!$fQlO1G2QO$)nQ`O1G2QO9ZQ`O'#KQO9ZQ`O'#ErO%[QlO'#ErO9ZQ`O'#IyO$)sQ!0LrO,5@yOOQ[1G2|1G2|OOQ[1G4^1G4^OOQ!0Lf1G/z1G/zOOQ!0Lf1G/x1G/xO$+uQ!0MxO1G0SOOQ[1G2x1G2xO!&iQMhO1G2xO%[QlO1G2xO#-|Q`O1G2xO$-yQMhO'#EiOOQ!0Lb,5@R,5@RO$.WQ!0LrO,5@ROOQ[1G.u1G.uO!BYQ!0LrO1G.uO!BeQpO1G.uO!BmQMhO1G.uO$.iQ`O1G0sO$.nQ`O'#CiO$.yQ`O'#KcO$/RQ`O,5=zO$/WQ`O'#KcO$/]Q`O'#KcO$/kQ`O'#JPO$/yQ`O,5@|O$0RQ!fO1G1hOOQ!0Lf1G1j1G1jO9aQ`O1G3eO@iQ`O1G3eO$0YQ`O1G3eO$0_Q`O1G3eOOQ[1G3e1G3eO!DkQ`O1G3TO!&iQMhO1G3QO$0dQ`O1G3QOOQ[1G3R1G3RO!&iQMhO1G3RO$0iQ`O1G3RO$0qQpO'#HPOOQ[1G3T1G3TO!5|QpO'#I{O!DpQ!bO1G3WOOQ[1G3W1G3WOOQ[,5=q,5=qO$0yQMhO,5=sO9aQ`O,5=sO$#yQ`O,5=uO9UQ`O,5=uO!BeQpO,5=uO!BmQMhO,5=uO:YQMhO,5=uO$1XQ`O'#KaO$1dQ`O,5=vOOQ[1G.k1G.kO$1iQ!0LrO1G.kO@iQ`O1G.kO$1tQ`O1G.kO9kQ!0LrO1G.kO$3|Q!fO,5AOO$4ZQ`O,5AOO9ZQ`O,5AOO$4fQlO,5=}O$4mQ`O,5=}OOQ[1G3g1G3gO`QlO1G3gOOQ[1G3m1G3mOOQ[1G3o1G3oO>rQ`O1G3qO$4rQlO1G3sO$8vQlO'#HrOOQ[1G3v1G3vO$9TQ`O'#HxO>wQ`O'#HzOOQ[1G3|1G3|O$9]QlO1G3|O9kQ!0LrO1G4SOOQ[1G4U1G4UOOQ!0Lb'#G^'#G^O9kQ!0LrO1G4WO9kQ!0LrO1G4YO$=dQ`O,5@`O!(yQlO,5;^O9ZQ`O,5;^O>wQ`O,5:VO!(yQlO,5:VO!BeQpO,5:VO$=iQ?MtO,5:VOOQO,5;^,5;^O$=sQpO'#IcO$>ZQ`O,5@_OOQ!0Lf1G/p1G/pO$>cQpO'#IiO$>mQ`O,5@nOOQ!0Lb1G0w1G0wO##hQpO,5:VOOQO'#Ie'#IeO$>uQpO,5:oOOQ!0Ln,5:o,5:oO#'cQ`O1G0XOOQ!0Lf1G0X1G0XO%[QlO1G0XOOQ!0Lf1G0r1G0rO>wQ`O1G0rO!BeQpO1G0rO!BmQMhO1G0rOOQ!0Lb1G5z1G5zO!BYQ!0LrO1G0[OOQO1G0k1G0kO%[QlO1G0kO$>|Q!0LrO1G0kO$?XQ!0LrO1G0kO!BeQpO1G0[OCuQpO1G0[O$?gQ!0LrO1G0kOOQO1G0[1G0[O$?{Q!0MxO1G0kPOOO-E<Y-E<YPOOO1G.h1G.hOOOO1G/g1G/gO$@VQ!bO,5<hO$@_Q!fO1G4hOOQO1G4n1G4nO%[QlO,5>|O$@iQ`O1G5xO$@qQ`O1G6WO$@yQ!fO1G6XO9ZQ`O,5?SO$ATQ!0MxO1G6UO%[QlO1G6UO$AeQ!0LrO1G6UO$AvQ`O1G6TO$AvQ`O1G6TO9ZQ`O1G6TO$BOQ`O,5?VO9ZQ`O,5?VOOQO,5?V,5?VO$BdQ`O,5?VO$)iQ`O,5?VOOQO-E<i-E<iOOQS1G0_1G0_OOQS1G0a1G0aO#-tQ`O1G0aOOQ[7+(d7+(dO!&iQMhO7+(dO%[QlO7+(dO$BrQ`O7+(dO$B}QMhO7+(dO$C]Q!0MzO,5=WO$EhQ!0MzO,5=YO$GsQ!0MzO,5=WO$JUQ!0MzO,5=YO$LgQ!0MzO,59sO$NlQ!0MzO,5<jO%!wQ!0MzO,5<lO%%SQ!0MzO,5<zOOQ!0Lf7+&_7+&_O%'eQ!0MxO7+&_O%(XQlO'#IdO%(fQ`O,5@aO%(nQ!fO,5@aOOQ!0Lf1G/}1G/}O%(xQ`O7+&hOOQ!0Lf7+&h7+&hO%(}Q?MtO,5:dO%[QlO7+&yO%)XQ?MtO,5:`O%)fQ?MtO,5:hO%)pQ?MtO,5:jO%)zQMhO'#IgO%*UQ`O,5@fOOQ!0Lh1G0b1G0bOOQO1G1q1G1qOOQO1G1r1G1rO%*^Q!jO,5<YO!(yQlO,5<XOOQO-E<j-E<jOOQ!0Lf7+'X7+'XOOOW7+'d7+'dOOOW1G1{1G1{O%*iQ`O1G1{OOQ!0Lf1G1}1G1}OOOO,59m,59mO%*nQ!dO,59mOOOO-E<^-E<^OOQ!0Lh1G/V1G/VO%*uQ!0MxO7+'jOOQ!0Lh,5?[,5?[O%+iQMhO1G2eP%+pQ`O'#IpPOQ!0Lh-E<n-E<nO%,^QMjO,5?_OOQ!0Lh-E<q-E<qO%-PQMjO,5?aOOQ!0Lh-E<s-E<sO%-ZQ!dO1G2vO%-bQ!dO'#CrO%-xQMhO'#KQO$#^QlO'#JtOOQ!0Lh1G2^1G2^O%.PQ`O'#IoO%.eQ`O,5@tO%.eQ`O,5@tO%.mQ`O,5@tO%.xQ`O,5@tOOQO1G2`1G2`O%/WQMjO1G2_O!+rQMhO1G2_O%/hQ(CWO'#IqO%/uQ`O,5@uO!&iQMhO,5@uO%/}Q!dO,5@uOOQ!0Lh1G2c1G2cO%2_Q!fO'#CiO%2iQ`O,5=OOOQ!0Lb,5<|,5<|O%2qQpO,5<|OOQ!0Lb,5<},5<}OCfQ`O,5<|O%2|QpO,5<|OOQ!0Lb,5=Q,5=QO$)iQ`O,5=UOOQO,5?^,5?^OOQO-E<p-E<pOOQ!0Lp1G2g1G2gO##hQpO,5<|O$#^QlO,5=OO%3[Q`O,5<}O%3gQpO,5<}O!+rQMhO'#IsO%4aQMjO1G2rO!+rQMhO'#IuO%5SQMjO1G2tO%5^QMjO1G5oO%5hQMjO1G5oOOQO,5?c,5?cOOQO-E<u-E<uOOQO1G.{1G.{O!9lQpO,59uO%[QlO,59uOOQ!0Lh,5<i,5<iO%5uQ`O1G2YO!+rQMhO1G2aO!+rQMhO1G5oO!+rQMhO1G5oO%5zQ!0MxO7+'lOOQ!0Lf7+'l7+'lO!$fQlO7+'lO%6nQ`O,5;^OOQ!0Lb,5?e,5?eOOQ!0Lb-E<w-E<wO%6sQ!dO'#K[O#'cQ`O7+(dO4UQ!fO7+(dO$BuQ`O7+(dO%6}Q!0MvO'#CiO%7nQ!0LrO,5=RO%8PQ!0MvO,5=RO%8dQ`O,5=ROOQ!0Lb1G5m1G5mOOQ[7+$a7+$aO!BYQ!0LrO7+$aO!BeQpO7+$aO!$fQlO7+&_O%8lQ`O'#JOO%9TQ`O,5@}OOQO1G3f1G3fO9aQ`O,5@}O%9TQ`O,5@}O%9]Q`O,5@}OOQO,5?k,5?kOOQO-E<}-E<}OOQ!0Lf7+'S7+'SO%9bQ`O7+)PO9kQ!0LrO7+)PO9aQ`O7+)PO@iQ`O7+)POOQ[7+(o7+(oO%9gQ!0MvO7+(lO!&iQMhO7+(lO!DfQ`O7+(mOOQ[7+(m7+(mO!&iQMhO7+(mO%9qQ`O'#K`O%9|Q`O,5=kOOQO,5?g,5?gOOQO-E<y-E<yOOQ[7+(r7+(rO%;`QpO'#HYOOQ[1G3_1G3_O!&iQMhO1G3_O%[QlO1G3_O%;gQ`O1G3_O%;rQMhO1G3_O9kQ!0LrO1G3aO$#yQ`O1G3aO9UQ`O1G3aO!BeQpO1G3aO!BmQMhO1G3aO%<QQ`O'#I}O%<fQ`O,5@{O%<nQpO,5@{OOQ!0Lb1G3b1G3bOOQ[7+$V7+$VO@iQ`O7+$VO9kQ!0LrO7+$VO%<yQ`O7+$VO%[QlO1G6jO%[QlO1G6kO%=OQ!0LrO1G6jO%=YQlO1G3iO%=aQ`O1G3iO%=fQlO1G3iOOQ[7+)R7+)RO9kQ!0LrO7+)]O`QlO7+)_OOQ['#Kf'#KfOOQ['#JQ'#JQO%=mQlO,5>^OOQ[,5>^,5>^O%[QlO'#HsO%=zQ`O'#HuOOQ[,5>d,5>dO9ZQ`O,5>dOOQ[,5>f,5>fOOQ[7+)h7+)hOOQ[7+)n7+)nOOQ[7+)r7+)rOOQ[7+)t7+)tO%>PQpO1G5zO%>kQ?MtO1G0xO%>uQ`O1G0xOOQO1G/q1G/qO%?QQ?MtO1G/qO>wQ`O1G/qO!(yQlO'#DkOOQO,5>},5>}OOQO-E<a-E<aOOQO,5?T,5?TOOQO-E<g-E<gO!BeQpO1G/qOOQO-E<c-E<cOOQ!0Ln1G0Z1G0ZOOQ!0Lf7+%s7+%sO#'cQ`O7+%sOOQ!0Lf7+&^7+&^O>wQ`O7+&^O!BeQpO7+&^OOQO7+%v7+%vO$?{Q!0MxO7+&VOOQO7+&V7+&VO%[QlO7+&VO%?[Q!0LrO7+&VO!BYQ!0LrO7+%vO!BeQpO7+%vO%?gQ!0LrO7+&VO%?uQ!0MxO7++pO%[QlO7++pO%@VQ`O7++oO%@VQ`O7++oOOQO1G4q1G4qO9ZQ`O1G4qO%@_Q`O1G4qOOQS7+%{7+%{O#'cQ`O<<LOO4UQ!fO<<LOO%@mQ`O<<LOOOQ[<<LO<<LOO!&iQMhO<<LOO%[QlO<<LOO%@uQ`O<<LOO%AQQ!0MzO,5?_O%C]Q!0MzO,5?aO%EhQ!0MzO1G2_O%GyQ!0MzO1G2rO%JUQ!0MzO1G2tO%LaQ!fO,5?OO%[QlO,5?OOOQO-E<b-E<bO%LkQ`O1G5{OOQ!0Lf<<JS<<JSO%LsQ?MtO1G0sO%NzQ?MtO1G0}O& RQ?MtO1G0}O&#SQ?MtO1G0}O&#ZQ?MtO1G0}O&%[Q?MtO1G0}O&']Q?MtO1G0}O&'dQ?MtO1G0}O&'kQ?MtO1G0}O&)lQ?MtO1G0}O&)sQ?MtO1G0}O&)zQ!0MxO<<JeO&+rQ?MtO1G0}O&,oQ?MvO1G0}O&-rQ?MvO'#JjO&/xQ?MtO1G1bO&0VQ?MtO1G0SO&0aQMjO,5?ROOQO-E<e-E<eO!(yQlO'#FpOOQO'#KX'#KXOOQO1G1t1G1tO&0kQ`O1G1sO&0pQ?MtO,5?YOOOW7+'g7+'gOOOO1G/X1G/XO&0zQ!dO1G4vOOQ!0Lh7+(P7+(PP!&iQMhO,5?[O!+rQMhO7+(bO&1RQ`O,5?ZO9ZQ`O,5?ZOOQO-E<m-E<mO&1aQ`O1G6`O&1aQ`O1G6`O&1iQ`O1G6`O&1tQMjO7+'yO&2UQ!dO,5?]O&2`Q`O,5?]O!&iQMhO,5?]OOQO-E<o-E<oO&2eQ!dO1G6aO&2oQ`O1G6aO&2wQ`O1G2jO!&iQMhO1G2jOOQ!0Lb1G2h1G2hOOQ!0Lb1G2i1G2iO%2qQpO1G2hO!BeQpO1G2hOCfQ`O1G2hOOQ!0Lb1G2p1G2pO&2|QpO1G2hO&3[Q`O1G2jO$)iQ`O1G2iOCfQ`O1G2iO$#^QlO1G2jO&3dQ`O1G2iO&4WQMjO,5?_OOQ!0Lh-E<r-E<rO&4yQMjO,5?aOOQ!0Lh-E<t-E<tO!+rQMhO7++ZOOQ!0Lh1G/a1G/aO&5TQ`O1G/aOOQ!0Lh7+'t7+'tO&5YQMjO7+'{O&5jQMjO7++ZO&5tQMjO7++ZO&6RQ!0MxO<<KWOOQ!0Lf<<KW<<KWO&6uQ`O1G0xO!&iQMhO'#IxO&6zQ`O,5@vO&8|Q!fO<<LOO!&iQMhO1G2mO&9TQ!0LrO1G2mOOQ[<<G{<<G{O!BYQ!0LrO<<G{O&9fQ!0MxO<<IyOOQ!0Lf<<Iy<<IyOOQO,5?j,5?jO&:YQ`O,5?jO&:_Q`O,5?jOOQO-E<|-E<|O&:mQ`O1G6iO&:mQ`O1G6iO9aQ`O1G6iO@iQ`O<<LkOOQ[<<Lk<<LkO&:uQ`O<<LkO9kQ!0LrO<<LkOOQ[<<LW<<LWO%9gQ!0MvO<<LWOOQ[<<LX<<LXO!DfQ`O<<LXO&:zQpO'#IzO&;VQ`O,5@zO!(yQlO,5@zOOQ[1G3V1G3VOOQO'#I|'#I|O9kQ!0LrO'#I|O&;_QpO,5=tOOQ[,5=t,5=tO&;fQpO'#EeO&;mQpO'#GdO&;rQ`O7+(yO&;wQ`O7+(yOOQ[7+(y7+(yO!&iQMhO7+(yO%[QlO7+(yO&<PQ`O7+(yOOQ[7+({7+({O9kQ!0LrO7+({O$#yQ`O7+({O9UQ`O7+({O!BeQpO7+({O&<[Q`O,5?iOOQO-E<{-E<{OOQO'#H]'#H]O&<gQ`O1G6gO9kQ!0LrO<<GqOOQ[<<Gq<<GqO@iQ`O<<GqO&<oQ`O7+,UO&<tQ`O7+,VO%[QlO7+,UO%[QlO7+,VOOQ[7+)T7+)TO&<yQ`O7+)TO&=OQlO7+)TO&=VQ`O7+)TOOQ[<<Lw<<LwOOQ[<<Ly<<LyOOQ[-E=O-E=OOOQ[1G3x1G3xO&=[Q`O,5>_OOQ[,5>a,5>aO&=aQ`O1G4OO9ZQ`O7+&dO!(yQlO7+&dOOQO7+%]7+%]O&=fQ?MtO1G6XO>wQ`O7+%]OOQ!0Lf<<I_<<I_OOQ!0Lf<<Ix<<IxO>wQ`O<<IxOOQO<<Iq<<IqO$?{Q!0MxO<<IqO%[QlO<<IqOOQO<<Ib<<IbO!BYQ!0LrO<<IbO&=pQ!0LrO<<IqO&={Q!0MxO<= [O&>]Q`O<= ZOOQO7+*]7+*]O9ZQ`O7+*]OOQ[ANAjANAjO&>eQ!fOANAjO!&iQMhOANAjO#'cQ`OANAjO4UQ!fOANAjO&>lQ`OANAjO%[QlOANAjO&>tQ!0MzO7+'yO&AVQ!0MzO,5?_O&CbQ!0MzO,5?aO&EmQ!0MzO7+'{O&HOQ!fO1G4jO&HYQ?MtO7+&_O&J^Q?MvO,5=WO&LeQ?MvO,5=YO&LuQ?MvO,5=WO&MVQ?MvO,5=YO&MgQ?MvO,59sO' mQ?MvO,5<jO'#pQ?MvO,5<lO'&UQ?MvO,5<zO''zQ?MtO7+'jO'(XQ?MtO7+'lO'(fQ`O,5<[OOQO7+'_7+'_OOQ!0Lh7+*b7+*bO'(kQMjO<<K|OOQO1G4u1G4uO'(rQ`O1G4uO'(}Q`O1G4uO')]Q`O7++zO')]Q`O7++zO!&iQMhO1G4wO')eQ!dO1G4wO')oQ`O7++{O')wQ`O7+(UO'*SQ!dO7+(UOOQ!0Lb7+(S7+(SOOQ!0Lb7+(T7+(TO!BeQpO7+(SOCfQ`O7+(SO'*^Q`O7+(UO!&iQMhO7+(UO$)iQ`O7+(TO'*cQ`O7+(UOCfQ`O7+(TO'*kQMjO<<NuOOQ!0Lh7+${7+${O!+rQMhO<<NuO'*uQ!dO,5?dOOQO-E<v-E<vO'+PQ!0MvO7+(XO!&iQMhO7+(XOOQ[AN=gAN=gO9aQ`O1G5UOOQO1G5U1G5UO'+aQ`O1G5UO'+fQ`O7+,TO'+fQ`O7+,TO9kQ!0LrOANBVO@iQ`OANBVOOQ[ANBVANBVOOQ[ANArANArOOQ[ANAsANAsO'+nQ`O,5?fOOQO-E<x-E<xO'+yQ?MtO1G6fOOQO,5?h,5?hOOQO-E<z-E<zOOQ[1G3`1G3`O',TQ`O,5=OOOQ[<<Le<<LeO!&iQMhO<<LeO&;rQ`O<<LeO',YQ`O<<LeO%[QlO<<LeOOQ[<<Lg<<LgO9kQ!0LrO<<LgO$#yQ`O<<LgO9UQ`O<<LgO',bQpO1G5TO',mQ`O7+,ROOQ[AN=]AN=]O9kQ!0LrOAN=]OOQ[<= p<= pOOQ[<= q<= qO',uQ`O<= pO',zQ`O<= qOOQ[<<Lo<<LoO'-PQ`O<<LoO'-UQlO<<LoOOQ[1G3y1G3yO>wQ`O7+)jO'-]Q`O<<JOO'-hQ?MtO<<JOOOQO<<Hw<<HwOOQ!0LfAN?dAN?dOOQOAN?]AN?]O$?{Q!0MxOAN?]OOQOAN>|AN>|O%[QlOAN?]OOQO<<Mw<<MwOOQ[G27UG27UO!&iQMhOG27UO#'cQ`OG27UO'-rQ!fOG27UO4UQ!fOG27UO'-yQ`OG27UO'.RQ?MtO<<JeO'.`Q?MvO1G2_O'0UQ?MvO,5?_O'2XQ?MvO,5?aO'4[Q?MvO1G2rO'6_Q?MvO1G2tO'8bQ?MtO<<KWO'8oQ?MtO<<IyOOQO1G1v1G1vO!+rQMhOANAhOOQO7+*a7+*aO'8|Q`O7+*aO'9XQ`O<= fO'9aQ!dO7+*cOOQ!0Lb<<Kp<<KpO$)iQ`O<<KpOCfQ`O<<KpO'9kQ`O<<KpO!&iQMhO<<KpOOQ!0Lb<<Kn<<KnO!BeQpO<<KnO'9vQ!dO<<KpOOQ!0Lb<<Ko<<KoO':QQ`O<<KpO!&iQMhO<<KpO$)iQ`O<<KoO':VQMjOANDaO':aQ!0MvO<<KsOOQO7+*p7+*pO9aQ`O7+*pO':qQ`O<= oOOQ[G27qG27qO9kQ!0LrOG27qO!(yQlO1G5QO':yQ`O7+,QO';RQ`O1G2jO&;rQ`OANBPOOQ[ANBPANBPO!&iQMhOANBPO';WQ`OANBPOOQ[ANBRANBRO9kQ!0LrOANBRO$#yQ`OANBROOQO'#H^'#H^OOQO7+*o7+*oOOQ[G22wG22wOOQ[ANE[ANE[OOQ[ANE]ANE]OOQ[ANBZANBZO';`Q`OANBZOOQ[<<MU<<MUO!(yQlOAN?jOOQOG24wG24wO$?{Q!0MxOG24wO#'cQ`OLD,pOOQ[LD,pLD,pO!&iQMhOLD,pO';eQ!fOLD,pO';lQ?MvO7+'yO'=bQ?MvO,5?_O'?eQ?MvO,5?aO'AhQ?MvO7+'{O'C^QMjOG27SOOQO<<M{<<M{OOQ!0LbANA[ANA[O$)iQ`OANA[OCfQ`OANA[O'CnQ!dOANA[OOQ!0LbANAYANAYO'CuQ`OANA[O!&iQMhOANA[O'DQQ!dOANA[OOQ!0LbANAZANAZOOQO<<N[<<N[OOQ[LD-]LD-]O'D[Q?MtO7+*lOOQO'#Ge'#GeOOQ[G27kG27kO&;rQ`OG27kO!&iQMhOG27kOOQ[G27mG27mO9kQ!0LrOG27mOOQ[G27uG27uO'DfQ?MtOG25UOOQOLD*cLD*cOOQ[!$(![!$(![O#'cQ`O!$(![O!&iQMhO!$(![O'DpQ!0MzOG27SOOQ!0LbG26vG26vO$)iQ`OG26vO'GRQ`OG26vOCfQ`OG26vO'G^Q!dOG26vO!&iQMhOG26vOOQ[LD-VLD-VO&;rQ`OLD-VOOQ[LD-XLD-XOOQ[!)9Ev!)9EvO#'cQ`O!)9EvOOQ!0LbLD,bLD,bO$)iQ`OLD,bOCfQ`OLD,bO'GeQ`OLD,bO'GpQ!dOLD,bOOQ[!$(!q!$(!qOOQ[!.K;b!.K;bO'GwQ?MvOG27SOOQ!0Lb!$( |!$( |O$)iQ`O!$( |OCfQ`O!$( |O'ImQ`O!$( |OOQ!0Lb!)9Eh!)9EhO$)iQ`O!)9EhOCfQ`O!)9EhOOQ!0Lb!.K;S!.K;SO$)iQ`O!.K;SOOQ!0Lb!4/0n!4/0nO!(yQlO'#DxO1PQ`O'#EVO'IxQ!fO'#JpO'JPQ!L^O'#DtO'JWQlO'#D|O'J_Q!fO'#CiO'LuQ!fO'#CiO!(yQlO'#EOO'MVQlO,5;XO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO,5;cO!(yQlO'#InO( YQ`O,5<hO!(yQlO,5;cO( bQMhO,5;cO(!{QMhO,5;cO!(yQlO,5;vO!&iQMhO'#GlO( bQMhO'#GlO!&iQMhO'#GnO( bQMhO'#GnO1SQ`O'#DXO1SQ`O'#DXO!&iQMhO'#GOO( bQMhO'#GOO!&iQMhO'#GQO( bQMhO'#GQO!&iQMhO'#G`O( bQMhO'#G`O!(yQlO,5:hO(#SQpO'#D]O(#^QpO'#JtO!(yQlO,5@mO'MVQlO1G0sO(#hQ?MtO'#CiO!(yQlO1G2OO!&iQMhO'#IsO( bQMhO'#IsO!&iQMhO'#IuO( bQMhO'#IuO(#rQ!dO'#CrO!&iQMhO,5<sO( bQMhO,5<sO'MVQlO1G2QO!(yQlO7+&yO!&iQMhO1G2_O( bQMhO1G2_O!&iQMhO'#IsO( bQMhO'#IsO!&iQMhO'#IuO( bQMhO'#IuO!&iQMhO1G2aO( bQMhO1G2aO'MVQlO7+'lO'MVQlO7+&_O!&iQMhOANAhO( bQMhOANAhO($VQ`O'#EmO($[Q`O'#EmO($dQ`O'#F[O($iQ`O'#EwO($nQ`O'#KRO($yQ`O'#KPO(%UQ`O,5;XO(%ZQMjO,5<dO(%bQ`O'#GXO(%gQ`O'#GXO(%lQ`O,5<fO(%tQ`O,5;XO(%|Q?MtO1G1_O(&TQ`O,5<sO(&YQ`O,5<sO(&_Q`O,5<uO(&dQ`O,5<uO(&iQ`O1G2QO(&nQ`O1G0sO(&sQMjO<<K|O(&zQMjO<<K|O7eQMhO'#F{O9UQ`O'#FzOAdQ`O'#ElO!(yQlO,5;sO!3^Q`O'#GXO!3^Q`O'#GXO!3^Q`O'#GZO!3^Q`O'#GZO!+rQMhO7+(bO!+rQMhO7+(bO%-ZQ!dO1G2vO%-ZQ!dO1G2vO!&iQMhO,5=[O!&iQMhO,5=[",
		stateData:
			"((P~O'zOS'{OSTOS'|RQ~OPYOQYOSfOY!VOaqOdzOeyOj!POnkOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!]XO!guO!jZO!mYO!nYO!oYO!qvO!swO!vxO!z]O$V|O$miO%g}O%i!QO%k!OO%l!OO%m!OO%p!RO%r!SO%u!TO%v!TO%x!UO&U!WO&[!XO&^!YO&`!ZO&b![O&e!]O&k!^O&q!_O&s!`O&u!aO&w!bO&y!cO(RSO(TTO(WUO(_VO(m[O~OWtO~P`OPYOQYOSfOd!jOe!iOnkOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!]!eO!guO!jZO!mYO!nYO!oYO!qvO!s!gO!v!hO$V!kO$miO(R!dO(TTO(WUO(_VO(m[O~Oa!wOq!nO!Q!oO!`!yO!a!vO!b!vO!z;wO#R!pO#S!pO#T!xO#U!pO#V!pO#Y!zO#Z!zO(S!lO(TTO(WUO(c!mO(m!sO~O'|!{O~OP]XR]X[]Xa]Xp]X!O]X!Q]X!Z]X!j]X!n]X#P]X#Q]X#^]X#ifX#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#w]X#y]X#z]X$P]X'x]X(_]X(p]X(w]X(x]X~O!e%QX~P(qO_!}O(T#PO(U!}O(V#PO~O_#QO(V#PO(W#PO(X#QO~Ov#SO!S#TO(`#TO(a#VO~OPYOQYOSfOd!jOe!iOnkOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!]!eO!guO!jZO!mYO!nYO!oYO!qvO!s!gO!v!hO$V!kO$miO(R;{O(TTO(WUO(_VO(m[O~O!Y#ZO!Z#WO!W(fP!W(tP~P+}O![#cO~P`OPYOQYOSfOd!jOe!iOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!]!eO!guO!jZO!mYO!nYO!oYO!qvO!s!gO!v!hO$V!kO$miO(TTO(WUO(_VO(m[O~On#mO!Y#iO!z]O#g#lO#h#iO(R;|O!i(qP~P.iO!j#oO(R#nO~O!v#sO!z]O%g#tO~O#i#uO~O!e#vO#i#uO~OP$[OR#zO[$cOp$aO!O#yO!Q#{O!Z$_O!j#xO!n$[O#P$RO#l$OO#m$PO#n$PO#o$PO#p$QO#q$RO#r$RO#s$bO#t$RO#u$SO#w$UO#y$WO#z$XO(_VO(p$YO(w#|O(x#}O~Oa(dX'x(dX'u(dX!i(dX!W(dX!](dX%h(dX!e(dX~P1qO#Q$dO#^$eO$P$eOP(eXR(eX[(eXp(eX!O(eX!Q(eX!Z(eX!j(eX!n(eX#P(eX#l(eX#m(eX#n(eX#o(eX#p(eX#q(eX#r(eX#s(eX#t(eX#u(eX#w(eX#y(eX#z(eX(_(eX(p(eX(w(eX(x(eX!](eX%h(eX~Oa(eX'x(eX'u(eX!W(eX!i(eXt(eX!e(eX~P4UO#^$eO~O$[$hO$^$gO$e$mO~OSfO!]$nO$h$oO$j$qO~Oh%VOj%cOn%WOp%XOq$tOr$tOx%YOz%ZO|%[O!Q${O!]$|O!g%aO!j$xO#h%bO$V%_O$s%]O$u%^O$x%`O(R$sO(TTO(WUO(_$uO(w$}O(x%POg([P~O!j%dO~O!Q%gO!]%hO(R%fO~O!e%lO~Oa%mO'x%mO~O!O%qO~P%[O(S!lO~P%[O%m%uO~P%[Oh%VO!j%dO(R%fO(S!lO~Oe%|O!j%dO(R%fO~O#t$RO~O!O&RO!]&OO!j&QO%i&UO(R%fO(S!lO(TTO(WUO`)UP~O!v#sO~O%r&WO!Q)QX!])QX(R)QX~O(R&XO~Oj!PO!s&^O%i!QO%k!OO%l!OO%m!OO%p!RO%r!SO%u!TO%v!TO~Od&cOe&bO!v&`O%g&aO%z&_O~P<POd&fOeyOj!PO!]&eO!s&^O!vxO!z]O%g}O%k!OO%l!OO%m!OO%p!RO%r!SO%u!TO%v!TO%x!UO~Ob&iO#^&lO%i&gO(S!lO~P=UO!j&mO!s&qO~O!j#oO~O!]XO~Oa%mO'v&yO'x%mO~Oa%mO'v&|O'x%mO~Oa%mO'v'OO'x%mO~O'u]X!W]Xt]X!i]X&Y]X!]]X%h]X!e]X~P(qO!`']O!a'UO!b'UO(S!lO(TTO(WUO~Oq'SO!Q'RO!Y'VO(c'QO![(gP![(vP~P@]Ol'`O!]'^O(R%fO~Oe'eO!j%dO(R%fO~O!O&RO!j&QO~Oq!nO!Q!oO!z;wO#R!pO#S!pO#U!pO#V!pO(S!lO(TTO(WUO(c!mO(m!sO~O!`'kO!a'jO!b'jO#T!pO#Y'lO#Z'lO~PAwOa%mOh%VO!e#vO!j%dO'x%mO(p'nO~O!n'rO#^'pO~PCVOq!nO!Q!oO(TTO(WUO(c!mO(m!sO~O!]XOq(kX!Q(kX!`(kX!a(kX!b(kX!z(kX#R(kX#S(kX#T(kX#U(kX#V(kX#Y(kX#Z(kX(S(kX(T(kX(W(kX(c(kX(m(kX~O!a'jO!b'jO(S!lO~PCuO'}'vO(O'vO(P'xO~O_!}O(T'zO(U!}O(V'zO~O_#QO(V'zO(W'zO(X#QO~Ot'|O~P%[Ov#SO!S#TO(`#TO(a(PO~O!Y(RO!W'UX!W'[X!Z'UX!Z'[X~P+}O!Z(TO!W(fX~OP$[OR#zO[$cOp$aO!O#yO!Q#{O!Z(TO!j#xO!n$[O#P$RO#l$OO#m$PO#n$PO#o$PO#p$QO#q$RO#r$RO#s$bO#t$RO#u$SO#w$UO#y$WO#z$XO(_VO(p$YO(w#|O(x#}O~O!W(fX~PGpO!W(YO~O!W(sX!Z(sX!e(sX!i(sX(p(sX~O#^(sX#i#bX![(sX~PIsO#^(ZO!W(uX!Z(uX~O!Z([O!W(tX~O!W(_O~O#^$eO~PIsO![(`O~P`OR#zO!O#yO!Q#{O!j#xO(_VOP!la[!lap!la!Z!la!n!la#P!la#l!la#m!la#n!la#o!la#p!la#q!la#r!la#s!la#t!la#u!la#w!la#y!la#z!la(p!la(w!la(x!la~Oa!la'x!la'u!la!W!la!i!lat!la!]!la%h!la!e!la~PKZO!i(aO~O!e#vO#^(bO(p'nO!Z(rXa(rX'x(rX~O!i(rX~PMvO!Q%gO!]%hO!z]O#g(gO#h(fO(R%fO~O!Z(hO!i(qX~O!i(jO~O!Q%gO!]%hO#h(fO(R%fO~OP(eXR(eX[(eXp(eX!O(eX!Q(eX!Z(eX!j(eX!n(eX#P(eX#l(eX#m(eX#n(eX#o(eX#p(eX#q(eX#r(eX#s(eX#t(eX#u(eX#w(eX#y(eX#z(eX(_(eX(p(eX(w(eX(x(eX~O!e#vO!i(eX~P! dOR(lO!O(kO!j#xO#Q$dO!z!ya!Q!ya~O!v!ya%g!ya!]!ya#g!ya#h!ya(R!ya~P!#eO!v(pO~OPYOQYOSfOd!jOe!iOnkOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!]XO!guO!jZO!mYO!nYO!oYO!qvO!s!gO!v!hO$V!kO$miO(R!dO(TTO(WUO(_VO(m[O~Oh%VOn%WOp%XOq$tOr$tOx%YOz%ZO|<eO!Q${O!]$|O!g=vO!j$xO#h<kO$V%_O$s<gO$u<iO$x%`O(R(tO(TTO(WUO(_$uO(w$}O(x%PO~O#i(vO~O!Y(xO!i(iP~P%[O(c(zO(m[O~O!Q(|O!j#xO(c(zO(m[O~OP;vOQ;vOSfOd=rOe!iOnkOp;vOqkOrkOxkOz;vO|;vO!QWO!UkO!VkO!]!eO!g;yO!jZO!m;vO!n;vO!o;vO!q;zO!s;}O!v!hO$V!kO$m=pO(R)ZO(TTO(WUO(_VO(m[O~O!Z$_Oa$pa'x$pa'u$pa!i$pa!W$pa!]$pa%h$pa!e$pa~Oj)bO~P!&iOh%VOn%WOp%XOq$tOr$tOx%YOz%ZO|%[O!Q${O!]$|O!g%aO!j$xO#h%bO$V%_O$s%]O$u%^O$x%`O(R(tO(TTO(WUO(_$uO(w$}O(x%PO~Og(nP~P!+rO!O)gO!e)fO!]$]X$Y$]X$[$]X$^$]X$e$]X~O!e)fO!](yX$Y(yX$[(yX$^(yX$e(yX~O!O)gO~P!-{O!O)gO!](yX$Y(yX$[(yX$^(yX$e(yX~O!])iO$Y)mO$[)hO$^)hO$e)nO~O!Y)qO~P!(yO$[$hO$^$gO$e)uO~Ol$yX!O$yX#Q$yX'w$yX(w$yX(x$yX~OgkXg$yXlkX!ZkX#^kX~P!/qOv)wO(`)xO(a)zO~Ol*TO!O)|O'w)}O(w$}O(x%PO~Og){O~P!0uOg*UO~Oh%VOn%WOp%XOq$tOr$tOx%YOz%ZO|<eO!Q*WO!]*XO!g=vO!j$xO#h<kO$V%_O$s<gO$u<iO$x%`O(TTO(WUO(_$uO(w$}O(x%PO~O!Y*[O(R*VO!i(|P~P!1dO#i*^O~O!j*_O~Oh%VOn%WOp%XOq$tOr$tOx%YOz%ZO|<eO!Q${O!]$|O!g=vO!j$xO#h<kO$V%_O$s<gO$u<iO$x%`O(R*aO(TTO(WUO(_$uO(w$}O(x%PO~O!Y*dO!W(}P~P!3cOp*pOq!nO!Q*fO!`*nO!a*hO!b*hO!j*_O#Y*oO%_*jO(S!lO(TTO(WUO(c!mO~O![*mO~P!5WO#Q$dOl(^X!O(^X'w(^X(w(^X(x(^X!Z(^X#^(^X~Og(^X#}(^X~P!6YOl*uO#^*tOg(]X!Z(]X~O!Z*vOg([X~Oj%cO(R&XOg([P~Oq*yO~O!j+OO~O(R(tO~On+TO!Q%gO!Y#iO!]%hO!z]O#g#lO#h#iO(R%fO!i(qP~O!e#vO#i+UO~O!Q%gO!Y+WO!Z([O!]%hO(R%fO!W(tP~Oq'YO!Q+YO!Y+XO(TTO(WUO(c(zO~O![(vP~P!9]O!Z+ZOa)RX'x)RX~OP$[OR#zO[$cOp$aO!O#yO!Q#{O!j#xO!n$[O#P$RO#l$OO#m$PO#n$PO#o$PO#p$QO#q$RO#r$RO#s$bO#t$RO#u$SO#w$UO#y$WO#z$XO(_VO(p$YO(w#|O(x#}O~Oa!ha!Z!ha'x!ha'u!ha!W!ha!i!hat!ha!]!ha%h!ha!e!ha~P!:TOR#zO!O#yO!Q#{O!j#xO(_VOP!pa[!pap!pa!Z!pa!n!pa#P!pa#l!pa#m!pa#n!pa#o!pa#p!pa#q!pa#r!pa#s!pa#t!pa#u!pa#w!pa#y!pa#z!pa(p!pa(w!pa(x!pa~Oa!pa'x!pa'u!pa!W!pa!i!pat!pa!]!pa%h!pa!e!pa~P!<kOR#zO!O#yO!Q#{O!j#xO(_VOP!ra[!rap!ra!Z!ra!n!ra#P!ra#l!ra#m!ra#n!ra#o!ra#p!ra#q!ra#r!ra#s!ra#t!ra#u!ra#w!ra#y!ra#z!ra(p!ra(w!ra(x!ra~Oa!ra'x!ra'u!ra!W!ra!i!rat!ra!]!ra%h!ra!e!ra~P!?ROh%VOl+dO!]'^O%h+cO~O!e+fOa(ZX!](ZX'x(ZX!Z(ZX~Oa%mO!]XO'x%mO~Oh%VO!j%dO~Oh%VO!j%dO(R%fO~O!e#vO#i(vO~Ob+qO%i+rO(R+nO(TTO(WUO![)VP~O!Z+sO`)UX~O[+wO~O`+xO~O!]&OO(R%fO(S!lO`)UP~Oh%VO#^+}O~Oh%VOl,QO!]$|O~O!],SO~O!O,UO!]XO~O%m%uO~O!v,ZO~Oe,`O~Ob,aO(R#nO(TTO(WUO![)TP~Oe%|O~O%i!QO(R&XO~P=UO[,fO`,eO~OPYOQYOSfOdzOeyOnkOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!guO!jZO!mYO!nYO!oYO!qvO!vxO!z]O$miO%g}O(TTO(WUO(_VO(m[O~O!]!eO!s!gO$V!kO(R!dO~P!FRO`,eOa%mO'x%mO~OPYOQYOSfOd!jOe!iOnkOpYOqkOrkOxkOzYO|YO!QWO!UkO!VkO!]!eO!guO!jZO!mYO!nYO!oYO!qvO!v!hO$V!kO$miO(R!dO(TTO(WUO(_VO(m[O~Oa,kOj!OO!swO%k!OO%l!OO%m!OO~P!HkO!j&mO~O&[,qO~O!],sO~O&m,uO&o,vOP&jaQ&jaS&jaY&jaa&jad&jae&jaj&jan&jap&jaq&jar&jax&jaz&ja|&ja!Q&ja!U&ja!V&ja!]&ja!g&ja!j&ja!m&ja!n&ja!o&ja!q&ja!s&ja!v&ja!z&ja$V&ja$m&ja%g&ja%i&ja%k&ja%l&ja%m&ja%p&ja%r&ja%u&ja%v&ja%x&ja&U&ja&[&ja&^&ja&`&ja&b&ja&e&ja&k&ja&q&ja&s&ja&u&ja&w&ja&y&ja'u&ja(R&ja(T&ja(W&ja(_&ja(m&ja![&ja&c&jab&ja&h&ja~O(R,{O~Oh!cX!Z!PX![!PX!e!PX!e!cX!j!cX#^!PX~O!Z!cX![!cX~P# qO!e-QO#^-POh(hX!Z#fX![#fX!e(hX!j(hX~O!Z(hX![(hX~P#!dOh%VO!e-SO!j%dO!Z!_X![!_X~Oq!nO!Q!oO(TTO(WUO(c!mO~OP;vOQ;vOSfOd=rOe!iOnkOp;vOqkOrkOxkOz;vO|;vO!QWO!UkO!VkO!]!eO!g;yO!jZO!m;vO!n;vO!o;vO!q;zO!s;}O!v!hO$V!kO$m=pO(TTO(WUO(_VO(m[O~O(R<rO~P##yO!Z-WO![(gX~O![-YO~O!e-QO#^-PO!Z#fX![#fX~O!Z-ZO![(vX~O![-]O~O!a-^O!b-^O(S!lO~P##hO![-aO~P'_Ol-dO!]'^O~O!W-iO~Oq!ya!`!ya!a!ya!b!ya#R!ya#S!ya#T!ya#U!ya#V!ya#Y!ya#Z!ya(S!ya(T!ya(W!ya(c!ya(m!ya~P!#eO!n-nO#^-lO~PCVO!a-pO!b-pO(S!lO~PCuOa%mO#^-lO'x%mO~Oa%mO!e#vO#^-lO'x%mO~Oa%mO!e#vO!n-nO#^-lO'x%mO(p'nO~O'}'vO(O'vO(P-uO~Ot-vO~O!W'Ua!Z'Ua~P!:TO!Y-zO!W'UX!Z'UX~P%[O!Z(TO!W(fa~O!W(fa~PGpO!Z([O!W(ta~O!Q%gO!Y.OO!]%hO(R%fO!W'[X!Z'[X~O#^.QO!Z(ra!i(raa(ra'x(ra~O!e#vO~P#,PO!Z(hO!i(qa~O!Q%gO!]%hO#h.UO(R%fO~On.ZO!Q%gO!Y.WO!]%hO!z]O#g.YO#h.WO(R%fO!Z'_X!i'_X~OR._O!j#xO~Oh%VOl.bO!]'^O%h.aO~Oa#ai!Z#ai'x#ai'u#ai!W#ai!i#ait#ai!]#ai%h#ai!e#ai~P!:TOl=|O!O)|O'w)}O(w$}O(x%PO~O#i#]aa#]a#^#]a'x#]a!Z#]a!i#]a!]#]a!W#]a~P#.{O#i(^XP(^XR(^X[(^Xa(^Xp(^X!Q(^X!j(^X!n(^X#P(^X#l(^X#m(^X#n(^X#o(^X#p(^X#q(^X#r(^X#s(^X#t(^X#u(^X#w(^X#y(^X#z(^X'x(^X(_(^X(p(^X!i(^X!W(^X'u(^Xt(^X!](^X%h(^X!e(^X~P!6YO!Z.oO!i(iX~P!:TO!i.rO~O!W.tO~OP$[OR#zO!O#yO!Q#{O!j#xO!n$[O(_VO[#kia#kip#ki!Z#ki#P#ki#m#ki#n#ki#o#ki#p#ki#q#ki#r#ki#s#ki#t#ki#u#ki#w#ki#y#ki#z#ki'x#ki(p#ki(w#ki(x#ki'u#ki!W#ki!i#kit#ki!]#ki%h#ki!e#ki~O#l#ki~P#2kO#l$OO~P#2kOP$[OR#zOp$aO!O#yO!Q#{O!j#xO!n$[O#l$OO#m$PO#n$PO#o$PO(_VO[#kia#ki!Z#ki#P#ki#q#ki#r#ki#s#ki#t#ki#u#ki#w#ki#y#ki#z#ki'x#ki(p#ki(w#ki(x#ki'u#ki!W#ki!i#kit#ki!]#ki%h#ki!e#ki~O#p#ki~P#5YO#p$QO~P#5YOP$[OR#zO[$cOp$aO!O#yO!Q#{O!j#xO!n$[O#P$RO#l$OO#m$PO#n$PO#o$PO#p$QO#q$RO#r$RO#s$bO#t$RO(_VOa#ki!Z#ki#w#ki#y#ki#z#ki'x#ki(p#ki(w#ki(x#ki'u#ki!W#ki!i#kit#ki!]#ki%h#ki!e#ki~O#u#ki~P#7wOP$[OR#zO[$cOp$aO!O#yO!Q#{O!j#xO!n$[O#P$RO#l$OO#m$PO#n$PO#o$PO#p$QO#q$RO#r$RO#s$bO#t$RO#u$SO(_VO(x#}Oa#ki!Z#ki#y#ki#z#ki'x#ki(p#ki(w#ki'u#ki!W#ki!i#kit#ki!]#ki%h#ki!e#ki~O#w$UO~P#:_O#w#ki~P#:_O#u$SO~P#7wOP$[OR#zO[$cOp$aO!O#yO!Q#{O!j#xO!n$[O#P$RO#l$OO#m$PO#n$PO#o$PO#p$QO#q$RO#r$RO#s$bO#t$RO#u$SO#w$UO(_VO(w#|O(x#}Oa#ki!Z#ki#z#ki'x#ki(p#ki'u#ki!W#ki!i#kit#ki!]#ki%h#ki!e#ki~O#y#ki~P#=TO#y$WO~P#=TOP]XR]X[]Xp]X!O]X!Q]X!j]X!n]X#P]X#Q]X#^]X#ifX#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#w]X#y]X#z]X$P]X(_]X(p]X(w]X(x]X!Z]X![]X~O#}]X~P#?rOP$[OR#zO[<_Op<]O!O#yO!Q#{O!j#xO!n$[O#P<SO#l<PO#m<QO#n<QO#o<QO#p<RO#q<SO#r<SO#s<^O#t<SO#u<TO#w<VO#y<XO#z<YO(_VO(p$YO(w#|O(x#}O~O#}.vO~P#BPO#Q$dO#^<`O$P<`O#}(eX![(eX~P! dOa'ba!Z'ba'x'ba'u'ba!i'ba!W'bat'ba!]'ba%h'ba!e'ba~P!:TO[#kia#kip#ki!Z#ki#P#ki#p#ki#q#ki#r#ki#s#ki#t#ki#u#ki#w#ki#y#ki#z#ki'x#ki(p#ki'u#ki!W#ki!i#kit#ki!]#ki%h#ki!e#ki~OP$[OR#zO!O#yO!Q#{O!j#xO!n$[O#l$OO#m$PO#n$PO#o$PO(_VO(w#ki(x#ki~P#EROl=|O!O)|O'w)}O(w$}O(x%POP#kiR#ki!Q#ki!j#ki!n#ki#l#ki#m#ki#n#ki#o#ki(_#ki~P#ERO!Z.zOg(nX~P!0uOg.|O~Oa$Oi!Z$Oi'x$Oi'u$Oi!W$Oi!i$Oit$Oi!]$Oi%h$Oi!e$Oi~P!:TO$[.}O$^.}O~O$[/OO$^/OO~O!e)fO#^/PO!]$bX$Y$bX$[$bX$^$bX$e$bX~O!Y/QO~O!])iO$Y/SO$[)hO$^)hO$e/TO~O!Z<ZO![(dX~P#BPO![/UO~O!e)fO$e(yX~O$e/WO~Ot/XO~P!&iOv)wO(`)xO(a/[O~O!Q/_O~O(w$}Ol%`a!O%`a'w%`a(x%`a!Z%`a#^%`a~Og%`a#}%`a~P#LTO(x%POl%ba!O%ba'w%ba(w%ba!Z%ba#^%ba~Og%ba#}%ba~P#LvO!ZfX!efX!ifX!i$yX(pfX~P!/qO!Y/hO!Z([O(R/gO!W(tP!W(}P~P!1dOp*pO!`*nO!a*hO!b*hO!j*_O#Y*oO%_*jO(S!lO(TTO(WUO~Oq<oO!Q/iO!Y+XO![*mO(c<nO![(vP~P#NaO!i/jO~P#.{O!Z/kO!e#vO(p'nO!i(|X~O!i/pO~O!Q%gO!Y*[O!]%hO(R%fO!i(|P~O#i/rO~O!W$yX!Z$yX!e%QX~P!/qO!Z/sO!W(}X~P#.{O!e/uO~O!W/wO~OnkO(R/xO~P.iOh%VOp/}O!e#vO!j%dO(p'nO~O!e+fO~Oa%mO!Z0RO'x%mO~O![0TO~P!5WO!a0UO!b0UO(S!lO~P##hOq!nO!Q0VO(TTO(WUO(c!mO~O#Y0XO~Og%`a!Z%`a#^%`a#}%`a~P!0uOg%ba!Z%ba#^%ba#}%ba~P!0uOj%cO(R&XOg'kX!Z'kX~O!Z*vOg([a~Og0bO~OR0cO!O0cO!Q0dO#Q$dOl{a'w{a(w{a(x{a!Z{a#^{a~Og{a#}{a~P$&dO!O)|O'w)}Ol$ra(w$ra(x$ra!Z$ra#^$ra~Og$ra#}$ra~P$'`O!O)|O'w)}Ol$ta(w$ta(x$ta!Z$ta#^$ta~Og$ta#}$ta~P$(RO#i0gO~Og%Sa!Z%Sa#^%Sa#}%Sa~P!0uOl0iO#^0hOg(]a!Z(]a~O!e#vO~O#i0lO~O!Z+ZOa)Ra'x)Ra~OR#zO!O#yO!Q#{O!j#xO(_VOP!pi[!pip!pi!Z!pi!n!pi#P!pi#l!pi#m!pi#n!pi#o!pi#p!pi#q!pi#r!pi#s!pi#t!pi#u!pi#w!pi#y!pi#z!pi(p!pi(w!pi(x!pi~Oa!pi'x!pi'u!pi!W!pi!i!pit!pi!]!pi%h!pi!e!pi~P$*OOh%VOp%XOq$tOr$tOx%YOz%ZO|<eO!Q${O!]$|O!g=vO!j$xO#h<kO$V%_O$s<gO$u<iO$x%`O(TTO(WUO(_$uO(w$}O(x%PO~On0vO%[0wO(R0tO~P$,fO!e+fOa(Za!](Za'x(Za!Z(Za~O#i0|O~O[]X!ZfX![fX~O!Z0}O![)VX~O![1PO~O[1QO~Ob1SO(R+nO(TTO(WUO~O!]&OO(R%fO`'sX!Z'sX~O!Z+sO`)Ua~O!i1VO~P!:TO[1YO~O`1ZO~O#^1^O~Ol1aO!]$|O~O(c(zO![)SP~Oh%VOl1jO!]1gO%h1iO~O[1tO!Z1rO![)TX~O![1uO~O`1wOa%mO'x%mO~O(R#nO(TTO(WUO~O#Q$dO#^$eO$P$eOP(eXR(eX[(eXp(eX!O(eX!Q(eX!Z(eX!j(eX!n(eX#P(eX#l(eX#m(eX#n(eX#o(eX#p(eX#q(eX#r(eX#s(eX#u(eX#w(eX#y(eX#z(eX(_(eX(p(eX(w(eX(x(eX~O#t1zO&Y1{Oa(eX~P$2PO#^$eO#t1zO&Y1{O~Oa1}O~P%[Oa2PO~O&c2SOP&aiQ&aiS&aiY&aia&aid&aie&aij&ain&aip&aiq&air&aix&aiz&ai|&ai!Q&ai!U&ai!V&ai!]&ai!g&ai!j&ai!m&ai!n&ai!o&ai!q&ai!s&ai!v&ai!z&ai$V&ai$m&ai%g&ai%i&ai%k&ai%l&ai%m&ai%p&ai%r&ai%u&ai%v&ai%x&ai&U&ai&[&ai&^&ai&`&ai&b&ai&e&ai&k&ai&q&ai&s&ai&u&ai&w&ai&y&ai'u&ai(R&ai(T&ai(W&ai(_&ai(m&ai![&aib&ai&h&ai~Ob2YO![2WO&h2XO~P`O!]XO!j2[O~O&o,vOP&jiQ&jiS&jiY&jia&jid&jie&jij&jin&jip&jiq&jir&jix&jiz&ji|&ji!Q&ji!U&ji!V&ji!]&ji!g&ji!j&ji!m&ji!n&ji!o&ji!q&ji!s&ji!v&ji!z&ji$V&ji$m&ji%g&ji%i&ji%k&ji%l&ji%m&ji%p&ji%r&ji%u&ji%v&ji%x&ji&U&ji&[&ji&^&ji&`&ji&b&ji&e&ji&k&ji&q&ji&s&ji&u&ji&w&ji&y&ji'u&ji(R&ji(T&ji(W&ji(_&ji(m&ji![&ji&c&jib&ji&h&ji~O!W2bO~O!Z!_a![!_a~P#BPOq!nO!Q!oO!Y2hO(c!mO!Z'VX!['VX~P@]O!Z-WO![(ga~O!Z']X![']X~P!9]O!Z-ZO![(va~O![2oO~P'_Oa%mO#^2xO'x%mO~Oa%mO!e#vO#^2xO'x%mO~Oa%mO!e#vO!n2|O#^2xO'x%mO(p'nO~Oa%mO'x%mO~P!:TO!Z$_Ot$pa~O!W'Ui!Z'Ui~P!:TO!Z(TO!W(fi~O!Z([O!W(ti~O!W(ui!Z(ui~P!:TO!Z(ri!i(ria(ri'x(ri~P!:TO#^3OO!Z(ri!i(ria(ri'x(ri~O!Z(hO!i(qi~O!Q%gO!]%hO!z]O#g3TO#h3SO(R%fO~O!Q%gO!]%hO#h3SO(R%fO~Ol3[O!]'^O%h3ZO~Oh%VOl3[O!]'^O%h3ZO~O#i%`aP%`aR%`a[%`aa%`ap%`a!Q%`a!j%`a!n%`a#P%`a#l%`a#m%`a#n%`a#o%`a#p%`a#q%`a#r%`a#s%`a#t%`a#u%`a#w%`a#y%`a#z%`a'x%`a(_%`a(p%`a!i%`a!W%`a'u%`at%`a!]%`a%h%`a!e%`a~P#LTO#i%baP%baR%ba[%baa%bap%ba!Q%ba!j%ba!n%ba#P%ba#l%ba#m%ba#n%ba#o%ba#p%ba#q%ba#r%ba#s%ba#t%ba#u%ba#w%ba#y%ba#z%ba'x%ba(_%ba(p%ba!i%ba!W%ba'u%bat%ba!]%ba%h%ba!e%ba~P#LvO#i%`aP%`aR%`a[%`aa%`ap%`a!Q%`a!Z%`a!j%`a!n%`a#P%`a#l%`a#m%`a#n%`a#o%`a#p%`a#q%`a#r%`a#s%`a#t%`a#u%`a#w%`a#y%`a#z%`a'x%`a(_%`a(p%`a!i%`a!W%`a'u%`a#^%`at%`a!]%`a%h%`a!e%`a~P#.{O#i%baP%baR%ba[%baa%bap%ba!Q%ba!Z%ba!j%ba!n%ba#P%ba#l%ba#m%ba#n%ba#o%ba#p%ba#q%ba#r%ba#s%ba#t%ba#u%ba#w%ba#y%ba#z%ba'x%ba(_%ba(p%ba!i%ba!W%ba'u%ba#^%bat%ba!]%ba%h%ba!e%ba~P#.{O#i{aP{a[{aa{ap{a!j{a!n{a#P{a#l{a#m{a#n{a#o{a#p{a#q{a#r{a#s{a#t{a#u{a#w{a#y{a#z{a'x{a(_{a(p{a!i{a!W{a'u{at{a!]{a%h{a!e{a~P$&dO#i$raP$raR$ra[$raa$rap$ra!Q$ra!j$ra!n$ra#P$ra#l$ra#m$ra#n$ra#o$ra#p$ra#q$ra#r$ra#s$ra#t$ra#u$ra#w$ra#y$ra#z$ra'x$ra(_$ra(p$ra!i$ra!W$ra'u$rat$ra!]$ra%h$ra!e$ra~P$'`O#i$taP$taR$ta[$taa$tap$ta!Q$ta!j$ta!n$ta#P$ta#l$ta#m$ta#n$ta#o$ta#p$ta#q$ta#r$ta#s$ta#t$ta#u$ta#w$ta#y$ta#z$ta'x$ta(_$ta(p$ta!i$ta!W$ta'u$tat$ta!]$ta%h$ta!e$ta~P$(RO#i%SaP%SaR%Sa[%Saa%Sap%Sa!Q%Sa!Z%Sa!j%Sa!n%Sa#P%Sa#l%Sa#m%Sa#n%Sa#o%Sa#p%Sa#q%Sa#r%Sa#s%Sa#t%Sa#u%Sa#w%Sa#y%Sa#z%Sa'x%Sa(_%Sa(p%Sa!i%Sa!W%Sa'u%Sa#^%Sat%Sa!]%Sa%h%Sa!e%Sa~P#.{Oa#aq!Z#aq'x#aq'u#aq!W#aq!i#aqt#aq!]#aq%h#aq!e#aq~P!:TO!Y3dO!Z'WX!i'WX~P%[O!Z.oO!i(ia~O!Z.oO!i(ia~P!:TO!W3gO~O#}!la![!la~PKZO#}!ha!Z!ha![!ha~P#BPO#}!pa![!pa~P!<kO#}!ra![!ra~P!?ROg'ZX!Z'ZX~P!+rO!Z.zOg(na~OSfO!]3{O$c3|O~O![4QO~Ot4RO~P#.{Oa$lq!Z$lq'x$lq'u$lq!W$lq!i$lqt$lq!]$lq%h$lq!e$lq~P!:TO!W4TO~P!&iO!Q4UO~O!O)|O'w)}O(x%POl'ga(w'ga!Z'ga#^'ga~Og'ga#}'ga~P%+uO!O)|O'w)}Ol'ia(w'ia(x'ia!Z'ia#^'ia~Og'ia#}'ia~P%,hO(p$YO~P#.{O!WfX!W$yX!ZfX!Z$yX!e%QX#^fX~P!/qO(R<xO~P!1dO!Q%gO!Y4XO!]%hO(R%fO!Z'cX!i'cX~O!Z/kO!i(|a~O!Z/kO!e#vO!i(|a~O!Z/kO!e#vO(p'nO!i(|a~Og${i!Z${i#^${i#}${i~P!0uO!Y4aO!W'eX!Z'eX~P!3cO!Z/sO!W(}a~O!Z/sO!W(}a~P#.{OP]XR]X[]Xp]X!O]X!Q]X!W]X!Z]X!j]X!n]X#P]X#Q]X#^]X#ifX#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#w]X#y]X#z]X$P]X(_]X(p]X(w]X(x]X~O!e%XX#t%XX~P%0XO!e#vO#t4fO~Oh%VO!e#vO!j%dO~Oh%VOp4kO!j%dO(p'nO~Op4pO!e#vO(p'nO~Oq!nO!Q4qO(TTO(WUO(c!mO~O(w$}Ol%`i!O%`i'w%`i(x%`i!Z%`i#^%`i~Og%`i#}%`i~P%3xO(x%POl%bi!O%bi'w%bi(w%bi!Z%bi#^%bi~Og%bi#}%bi~P%4kOg(]i!Z(]i~P!0uO#^4wOg(]i!Z(]i~P!0uO!i4zO~Oa$nq!Z$nq'x$nq'u$nq!W$nq!i$nqt$nq!]$nq%h$nq!e$nq~P!:TO!W5QO~O!Z5RO!])OX~P#.{Oa]Xa$yX!]]X!]$yX%]]X'x]X'x$yX!Z]X!Z$yX~P!/qO%]5UOa%Za!]%Za'x%Za!Z%Za~OlmX!OmX'wmX(wmX(xmX~P%7nOn5VO(R#nO~Ob5]O%i5^O(R+nO(TTO(WUO!Z'rX!['rX~O!Z0}O![)Va~O[5bO~O`5cO~Oa%mO'x%mO~P#.{O!Z5kO#^5mO![)SX~O![5nO~Op5tOq!nO!Q*fO!`!yO!a!vO!b!vO!z;wO#R!pO#S!pO#T!pO#U!pO#V!pO#Y5sO#Z!zO(S!lO(TTO(WUO(c!mO(m!sO~O![5rO~P%:ROl5yO!]1gO%h5xO~Oh%VOl5yO!]1gO%h5xO~Ob6QO(R#nO(TTO(WUO!Z'qX!['qX~O!Z1rO![)Ta~O(TTO(WUO(c6SO~O`6WO~O#t6ZO&Y6[O~PMvO!i6]O~P%[Oa6_O~Oa6_O~P%[Ob2YO![6dO&h2XO~P`O!e6fO~O!e6hOh(hi!Z(hi![(hi!e(hi!j(hip(hi(p(hi~O!Z#fi![#fi~P#BPO#^6iO!Z#fi![#fi~O!Z!_i![!_i~P#BPOa%mO#^6rO'x%mO~Oa%mO!e#vO#^6rO'x%mO~O!Z(rq!i(rqa(rq'x(rq~P!:TO!Z(hO!i(qq~O!Q%gO!]%hO#h6yO(R%fO~O!]'^O%h6|O~Ol7QO!]'^O%h6|O~O#i'gaP'gaR'ga['gaa'gap'ga!Q'ga!j'ga!n'ga#P'ga#l'ga#m'ga#n'ga#o'ga#p'ga#q'ga#r'ga#s'ga#t'ga#u'ga#w'ga#y'ga#z'ga'x'ga(_'ga(p'ga!i'ga!W'ga'u'gat'ga!]'ga%h'ga!e'ga~P%+uO#i'iaP'iaR'ia['iaa'iap'ia!Q'ia!j'ia!n'ia#P'ia#l'ia#m'ia#n'ia#o'ia#p'ia#q'ia#r'ia#s'ia#t'ia#u'ia#w'ia#y'ia#z'ia'x'ia(_'ia(p'ia!i'ia!W'ia'u'iat'ia!]'ia%h'ia!e'ia~P%,hO#i${iP${iR${i[${ia${ip${i!Q${i!Z${i!j${i!n${i#P${i#l${i#m${i#n${i#o${i#p${i#q${i#r${i#s${i#t${i#u${i#w${i#y${i#z${i'x${i(_${i(p${i!i${i!W${i'u${i#^${it${i!]${i%h${i!e${i~P#.{O#i%`iP%`iR%`i[%`ia%`ip%`i!Q%`i!j%`i!n%`i#P%`i#l%`i#m%`i#n%`i#o%`i#p%`i#q%`i#r%`i#s%`i#t%`i#u%`i#w%`i#y%`i#z%`i'x%`i(_%`i(p%`i!i%`i!W%`i'u%`it%`i!]%`i%h%`i!e%`i~P%3xO#i%biP%biR%bi[%bia%bip%bi!Q%bi!j%bi!n%bi#P%bi#l%bi#m%bi#n%bi#o%bi#p%bi#q%bi#r%bi#s%bi#t%bi#u%bi#w%bi#y%bi#z%bi'x%bi(_%bi(p%bi!i%bi!W%bi'u%bit%bi!]%bi%h%bi!e%bi~P%4kO!Z'Wa!i'Wa~P!:TO!Z.oO!i(ii~O#}#ai!Z#ai![#ai~P#BPOP$[OR#zO!O#yO!Q#{O!j#xO!n$[O(_VO[#kip#ki#P#ki#m#ki#n#ki#o#ki#p#ki#q#ki#r#ki#s#ki#t#ki#u#ki#w#ki#y#ki#z#ki#}#ki(p#ki(w#ki(x#ki!Z#ki![#ki~O#l#ki~P%MQO#l<PO~P%MQOP$[OR#zOp<]O!O#yO!Q#{O!j#xO!n$[O#l<PO#m<QO#n<QO#o<QO(_VO[#ki#P#ki#q#ki#r#ki#s#ki#t#ki#u#ki#w#ki#y#ki#z#ki#}#ki(p#ki(w#ki(x#ki!Z#ki![#ki~O#p#ki~P& YO#p<RO~P& YOP$[OR#zO[<_Op<]O!O#yO!Q#{O!j#xO!n$[O#P<SO#l<PO#m<QO#n<QO#o<QO#p<RO#q<SO#r<SO#s<^O#t<SO(_VO#w#ki#y#ki#z#ki#}#ki(p#ki(w#ki(x#ki!Z#ki![#ki~O#u#ki~P&#bOP$[OR#zO[<_Op<]O!O#yO!Q#{O!j#xO!n$[O#P<SO#l<PO#m<QO#n<QO#o<QO#p<RO#q<SO#r<SO#s<^O#t<SO#u<TO(_VO(x#}O#y#ki#z#ki#}#ki(p#ki(w#ki!Z#ki![#ki~O#w<VO~P&%cO#w#ki~P&%cO#u<TO~P&#bOP$[OR#zO[<_Op<]O!O#yO!Q#{O!j#xO!n$[O#P<SO#l<PO#m<QO#n<QO#o<QO#p<RO#q<SO#r<SO#s<^O#t<SO#u<TO#w<VO(_VO(w#|O(x#}O#z#ki#}#ki(p#ki!Z#ki![#ki~O#y#ki~P&'rO#y<XO~P&'rOa#{y!Z#{y'x#{y'u#{y!W#{y!i#{yt#{y!]#{y%h#{y!e#{y~P!:TO[#kip#ki#P#ki#p#ki#q#ki#r#ki#s#ki#t#ki#u#ki#w#ki#y#ki#z#ki#}#ki(p#ki!Z#ki![#ki~OP$[OR#zO!O#yO!Q#{O!j#xO!n$[O#l<PO#m<QO#n<QO#o<QO(_VO(w#ki(x#ki~P&*nOl=}O!O)|O'w)}O(w$}O(x%POP#kiR#ki!Q#ki!j#ki!n#ki#l#ki#m#ki#n#ki#o#ki(_#ki~P&*nO#Q$dOP(^XR(^X[(^Xl(^Xp(^X!O(^X!Q(^X!j(^X!n(^X#P(^X#l(^X#m(^X#n(^X#o(^X#p(^X#q(^X#r(^X#s(^X#t(^X#u(^X#w(^X#y(^X#z(^X#}(^X'w(^X(_(^X(p(^X(w(^X(x(^X!Z(^X![(^X~O#}$Oi!Z$Oi![$Oi~P#BPO#}!pi![!pi~P$*OOg'Za!Z'Za~P!0uO![7dO~O!Z'ba!['ba~P#BPO!W7eO~P#.{O!e#vO(p'nO!Z'ca!i'ca~O!Z/kO!i(|i~O!Z/kO!e#vO!i(|i~Og${q!Z${q#^${q#}${q~P!0uO!W'ea!Z'ea~P#.{O!e7lO~O!Z/sO!W(}i~P#.{O!Z/sO!W(}i~O!W7oO~Oh%VOp7tO!j%dO(p'nO~O!e#vO#t7vO~Op7yO!e#vO(p'nO~O!O)|O'w)}O(x%POl'ha(w'ha!Z'ha#^'ha~Og'ha#}'ha~P&3oO!O)|O'w)}Ol'ja(w'ja(x'ja!Z'ja#^'ja~Og'ja#}'ja~P&4bO!W7{O~Og$}q!Z$}q#^$}q#}$}q~P!0uOg(]q!Z(]q~P!0uO#^7|Og(]q!Z(]q~P!0uOa$ny!Z$ny'x$ny'u$ny!W$ny!i$nyt$ny!]$ny%h$ny!e$ny~P!:TO!e6hO~O!Z5RO!])Oa~O!]'^OP$SaR$Sa[$Sap$Sa!O$Sa!Q$Sa!Z$Sa!j$Sa!n$Sa#P$Sa#l$Sa#m$Sa#n$Sa#o$Sa#p$Sa#q$Sa#r$Sa#s$Sa#t$Sa#u$Sa#w$Sa#y$Sa#z$Sa(_$Sa(p$Sa(w$Sa(x$Sa~O%h6|O~P&7SO%]8QOa%Zi!]%Zi'x%Zi!Z%Zi~Oa#ay!Z#ay'x#ay'u#ay!W#ay!i#ayt#ay!]#ay%h#ay!e#ay~P!:TO[8SO~Ob8UO(R+nO(TTO(WUO~O!Z0}O![)Vi~O`8YO~O(c(zO!Z'nX!['nX~O!Z5kO![)Sa~O![8cO~P%:RO(m!sO~P$$oO#Y8dO~O!]1gO~O!]1gO%h8fO~Ol8iO!]1gO%h8fO~O[8nO!Z'qa!['qa~O!Z1rO![)Ti~O!i8rO~O!i8sO~O!i8vO~O!i8vO~P%[Oa8xO~O!e8yO~O!i8zO~O!Z(ui![(ui~P#BPOa%mO#^9SO'x%mO~O!Z(ry!i(rya(ry'x(ry~P!:TO!Z(hO!i(qy~O%h9VO~P&7SO!]'^O%h9VO~O#i${qP${qR${q[${qa${qp${q!Q${q!Z${q!j${q!n${q#P${q#l${q#m${q#n${q#o${q#p${q#q${q#r${q#s${q#t${q#u${q#w${q#y${q#z${q'x${q(_${q(p${q!i${q!W${q'u${q#^${qt${q!]${q%h${q!e${q~P#.{O#i'haP'haR'ha['haa'hap'ha!Q'ha!j'ha!n'ha#P'ha#l'ha#m'ha#n'ha#o'ha#p'ha#q'ha#r'ha#s'ha#t'ha#u'ha#w'ha#y'ha#z'ha'x'ha(_'ha(p'ha!i'ha!W'ha'u'hat'ha!]'ha%h'ha!e'ha~P&3oO#i'jaP'jaR'ja['jaa'jap'ja!Q'ja!j'ja!n'ja#P'ja#l'ja#m'ja#n'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#w'ja#y'ja#z'ja'x'ja(_'ja(p'ja!i'ja!W'ja'u'jat'ja!]'ja%h'ja!e'ja~P&4bO#i$}qP$}qR$}q[$}qa$}qp$}q!Q$}q!Z$}q!j$}q!n$}q#P$}q#l$}q#m$}q#n$}q#o$}q#p$}q#q$}q#r$}q#s$}q#t$}q#u$}q#w$}q#y$}q#z$}q'x$}q(_$}q(p$}q!i$}q!W$}q'u$}q#^$}qt$}q!]$}q%h$}q!e$}q~P#.{O!Z'Wi!i'Wi~P!:TO#}#aq!Z#aq![#aq~P#BPO(w$}OP%`aR%`a[%`ap%`a!Q%`a!j%`a!n%`a#P%`a#l%`a#m%`a#n%`a#o%`a#p%`a#q%`a#r%`a#s%`a#t%`a#u%`a#w%`a#y%`a#z%`a#}%`a(_%`a(p%`a!Z%`a![%`a~Ol%`a!O%`a'w%`a(x%`a~P&HgO(x%POP%baR%ba[%bap%ba!Q%ba!j%ba!n%ba#P%ba#l%ba#m%ba#n%ba#o%ba#p%ba#q%ba#r%ba#s%ba#t%ba#u%ba#w%ba#y%ba#z%ba#}%ba(_%ba(p%ba!Z%ba![%ba~Ol%ba!O%ba'w%ba(w%ba~P&JnOl=}O!O)|O'w)}O(x%PO~P&HgOl=}O!O)|O'w)}O(w$}O~P&JnOR0cO!O0cO!Q0dO#Q$dOP{a[{al{ap{a!j{a!n{a#P{a#l{a#m{a#n{a#o{a#p{a#q{a#r{a#s{a#t{a#u{a#w{a#y{a#z{a#}{a'w{a(_{a(p{a(w{a(x{a!Z{a![{a~O!O)|O'w)}OP$raR$ra[$ral$rap$ra!Q$ra!j$ra!n$ra#P$ra#l$ra#m$ra#n$ra#o$ra#p$ra#q$ra#r$ra#s$ra#t$ra#u$ra#w$ra#y$ra#z$ra#}$ra(_$ra(p$ra(w$ra(x$ra!Z$ra![$ra~O!O)|O'w)}OP$taR$ta[$tal$tap$ta!Q$ta!j$ta!n$ta#P$ta#l$ta#m$ta#n$ta#o$ta#p$ta#q$ta#r$ta#s$ta#t$ta#u$ta#w$ta#y$ta#z$ta#}$ta(_$ta(p$ta(w$ta(x$ta!Z$ta![$ta~Ol=}O!O)|O'w)}O(w$}O(x%PO~OP%SaR%Sa[%Sap%Sa!Q%Sa!j%Sa!n%Sa#P%Sa#l%Sa#m%Sa#n%Sa#o%Sa#p%Sa#q%Sa#r%Sa#s%Sa#t%Sa#u%Sa#w%Sa#y%Sa#z%Sa#}%Sa(_%Sa(p%Sa!Z%Sa![%Sa~P'%sO#}$lq!Z$lq![$lq~P#BPO#}$nq!Z$nq![$nq~P#BPO![9dO~O#}9eO~P!0uO!e#vO!Z'ci!i'ci~O!e#vO(p'nO!Z'ci!i'ci~O!Z/kO!i(|q~O!W'ei!Z'ei~P#.{O!Z/sO!W(}q~Op9lO!e#vO(p'nO~O[9nO!W9mO~P#.{O!W9mO~O!e#vO#t9tO~Og(]y!Z(]y~P!0uO!Z'la!]'la~P#.{Oa%Zq!]%Zq'x%Zq!Z%Zq~P#.{O[9yO~O!Z0}O![)Vq~O#^9}O!Z'na!['na~O!Z5kO![)Si~P#BPO!Q:PO~O!]1gO%h:SO~O(TTO(WUO(c:XO~O!Z1rO![)Tq~O!i:[O~O!i:]O~O!i:^O~O!i:^O~P%[O#^:aO!Z#fy![#fy~O!Z#fy![#fy~P#BPO%h:fO~P&7SO!]'^O%h:fO~O#}#{y!Z#{y![#{y~P#BPOP${iR${i[${ip${i!Q${i!j${i!n${i#P${i#l${i#m${i#n${i#o${i#p${i#q${i#r${i#s${i#t${i#u${i#w${i#y${i#z${i#}${i(_${i(p${i!Z${i![${i~P'%sO!O)|O'w)}O(x%POP'gaR'ga['gal'gap'ga!Q'ga!j'ga!n'ga#P'ga#l'ga#m'ga#n'ga#o'ga#p'ga#q'ga#r'ga#s'ga#t'ga#u'ga#w'ga#y'ga#z'ga#}'ga(_'ga(p'ga(w'ga!Z'ga!['ga~O!O)|O'w)}OP'iaR'ia['ial'iap'ia!Q'ia!j'ia!n'ia#P'ia#l'ia#m'ia#n'ia#o'ia#p'ia#q'ia#r'ia#s'ia#t'ia#u'ia#w'ia#y'ia#z'ia#}'ia(_'ia(p'ia(w'ia(x'ia!Z'ia!['ia~O(w$}OP%`iR%`i[%`il%`ip%`i!O%`i!Q%`i!j%`i!n%`i#P%`i#l%`i#m%`i#n%`i#o%`i#p%`i#q%`i#r%`i#s%`i#t%`i#u%`i#w%`i#y%`i#z%`i#}%`i'w%`i(_%`i(p%`i(x%`i!Z%`i![%`i~O(x%POP%biR%bi[%bil%bip%bi!O%bi!Q%bi!j%bi!n%bi#P%bi#l%bi#m%bi#n%bi#o%bi#p%bi#q%bi#r%bi#s%bi#t%bi#u%bi#w%bi#y%bi#z%bi#}%bi'w%bi(_%bi(p%bi(w%bi!Z%bi![%bi~O#}$ny!Z$ny![$ny~P#BPO#}#ay!Z#ay![#ay~P#BPO!e#vO!Z'cq!i'cq~O!Z/kO!i(|y~O!W'eq!Z'eq~P#.{Op:pO!e#vO(p'nO~O[:tO!W:sO~P#.{O!W:sO~Og(]!R!Z(]!R~P!0uOa%Zy!]%Zy'x%Zy!Z%Zy~P#.{O!Z0}O![)Vy~O!Z5kO![)Sq~O(R:zO~O!]1gO%h:}O~O!i;QO~O%h;VO~P&7SOP${qR${q[${qp${q!Q${q!j${q!n${q#P${q#l${q#m${q#n${q#o${q#p${q#q${q#r${q#s${q#t${q#u${q#w${q#y${q#z${q#}${q(_${q(p${q!Z${q![${q~P'%sO!O)|O'w)}O(x%POP'haR'ha['hal'hap'ha!Q'ha!j'ha!n'ha#P'ha#l'ha#m'ha#n'ha#o'ha#p'ha#q'ha#r'ha#s'ha#t'ha#u'ha#w'ha#y'ha#z'ha#}'ha(_'ha(p'ha(w'ha!Z'ha!['ha~O!O)|O'w)}OP'jaR'ja['jal'jap'ja!Q'ja!j'ja!n'ja#P'ja#l'ja#m'ja#n'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#w'ja#y'ja#z'ja#}'ja(_'ja(p'ja(w'ja(x'ja!Z'ja!['ja~OP$}qR$}q[$}qp$}q!Q$}q!j$}q!n$}q#P$}q#l$}q#m$}q#n$}q#o$}q#p$}q#q$}q#r$}q#s$}q#t$}q#u$}q#w$}q#y$}q#z$}q#}$}q(_$}q(p$}q!Z$}q![$}q~P'%sOg%d!Z!Z%d!Z#^%d!Z#}%d!Z~P!0uO!W;ZO~P#.{Op;[O!e#vO(p'nO~O[;^O!W;ZO~P#.{O!Z'nq!['nq~P#BPO!Z#f!Z![#f!Z~P#BPO#i%d!ZP%d!ZR%d!Z[%d!Za%d!Zp%d!Z!Q%d!Z!Z%d!Z!j%d!Z!n%d!Z#P%d!Z#l%d!Z#m%d!Z#n%d!Z#o%d!Z#p%d!Z#q%d!Z#r%d!Z#s%d!Z#t%d!Z#u%d!Z#w%d!Z#y%d!Z#z%d!Z'x%d!Z(_%d!Z(p%d!Z!i%d!Z!W%d!Z'u%d!Z#^%d!Zt%d!Z!]%d!Z%h%d!Z!e%d!Z~P#.{Op;fO!e#vO(p'nO~O!W;gO~P#.{Op;nO!e#vO(p'nO~O!W;oO~P#.{OP%d!ZR%d!Z[%d!Zp%d!Z!Q%d!Z!j%d!Z!n%d!Z#P%d!Z#l%d!Z#m%d!Z#n%d!Z#o%d!Z#p%d!Z#q%d!Z#r%d!Z#s%d!Z#t%d!Z#u%d!Z#w%d!Z#y%d!Z#z%d!Z#}%d!Z(_%d!Z(p%d!Z!Z%d!Z![%d!Z~P'%sOp;rO!e#vO(p'nO~Ot(dX~P1qO!O%qO~P!(yO(S!lO~P!(yO!WfX!ZfX#^fX~P%0XOP]XR]X[]Xp]X!O]X!Q]X!Z]X!ZfX!j]X!n]X#P]X#Q]X#^]X#^fX#ifX#l]X#m]X#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#w]X#y]X#z]X$P]X(_]X(p]X(w]X(x]X~O!efX!i]X!ifX(pfX~P'JlOP;vOQ;vOSfOd=rOe!iOnkOp;vOqkOrkOxkOz;vO|;vO!QWO!UkO!VkO!]XO!g;yO!jZO!m;vO!n;vO!o;vO!q;zO!s;}O!v!hO$V!kO$m=pO(R)ZO(TTO(WUO(_VO(m[O~O!Z<ZO![$pa~Oh%VOn%WOp%XOq$tOr$tOx%YOz%ZO|<fO!Q${O!]$|O!g=wO!j$xO#h<lO$V%_O$s<hO$u<jO$x%`O(R(tO(TTO(WUO(_$uO(w$}O(x%PO~Oj)bO~P( bOp!cX(p!cX~P# qOp(hX(p(hX~P#!dO![]X![fX~P'JlO!WfX!W$yX!ZfX!Z$yX#^fX~P!/qO#i<OO~O!e#vO#i<OO~O#^<`O~O#t<SO~O#^<pO!Z(uX![(uX~O#^<`O!Z(sX![(sX~O#i<qO~Og<sO~P!0uO#i<yO~O#i<zO~O!e#vO#i<{O~O!e#vO#i<qO~O#}<|O~P#BPO#i<}O~O#i=OO~O#i=TO~O#i=UO~O#i=VO~O#i=WO~O#}=XO~P!0uO#}=YO~P!0uO#Q#R#S#U#V#Y#g#h#s$m$s$u$x%[%]%g%h%i%p%r%u%v%x%z~'|T#m!V'z(S#nq#l#op!O'{$['{(R$^(c~",
		goto: "$8f)ZPPPPPP)[PP)_P)pP+Q/VPPPP6aPP6wPP<oP@cP@yP@yPPP@yPCRP@yP@yP@yPCVPC[PCyPHsPPPHwPPPPHwKzPPPLQLrPHwPHwPP! QHwPPPHwPHwP!#XHwP!&o!'t!'}P!(q!(u!(q!,SPPPPPPP!,s!'tPP!-T!.uP!2RHwHw!2W!5d!:Q!:Q!>PPPP!>XHwPPPPPPPPPP!AhP!BuPPHw!DWPHwPHwHwHwHwHwPHw!EjP!HtP!KzP!LO!LY!L^!L^P!HqP!Lb!LbP# hP# lHwPHw# r#$wCV@yP@yP@y@yP#&U@y@y#(h@y#+`@y#-l@y@y#.[#0p#0p#0u#1O#0p#1ZPP#0pP@y#1s@y#5r@y@y6aPPP#9wPPP#:b#:bP#:bP#:x#:bPP#;OP#:uP#:u#;c#:u#;}#<T#<W)_#<Z)_P#<b#<b#<bP)_P)_P)_P)_PP)_P#<h#<kP#<k)_P#<oP#<rP)_P)_P)_P)_P)_P)_)_PP#<x#=O#=Z#=a#=g#=m#=s#>R#>X#>c#>i#>s#>y#?Z#?a#@R#@e#@k#@q#AP#Af#CZ#Ci#Cp#E[#Ej#G[#Gj#Gp#Gv#G|#HW#H^#Hd#Hn#IQ#IWPPPPPPPPPPP#I^PPPPPPP#JR#MY#Nr#Ny$ RPPP$&mP$&v$)o$0Y$0]$0`$1_$1b$1i$1qP$1w$1zP$2h$2l$3d$4r$4w$5_PP$5d$5j$5n$5q$5u$5y$6u$7^$7u$7y$7|$8P$8V$8Y$8^$8bR!|RoqOXst!Z#d%l&p&r&s&u,n,s2S2VY!vQ'^-`1g5qQ%svQ%{yQ&S|Q&h!VS'U!e-WQ'd!iS'j!r!yU*h$|*X*lQ+l%|Q+y&UQ,_&bQ-^']Q-h'eQ-p'kQ0U*nQ1q,`R<m;z%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&p&r&s&u&y'R'`'p(R(T(Z(b(v(x(|){*f+U+Y,k,n,s-d-l-z.Q.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3d4q5y6Z6[6_6r8i8x9SS#q];w!r)]$Z$n'V)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sU*{%[<e<fQ+q&OQ,a&eQ,h&mQ0r+dQ0u+fQ1S+rQ1y,fQ3W.bQ5V0wQ5]0}Q6Q1rQ7O3[Q8U5^R9Y7Q'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=s!S!nQ!r!v!y!z$|'U']'^'j'k'l*h*l*n*o-W-^-`-p0U0X1g5q5s%[$ti#v$b$c$d$x${%O%Q%]%^%b)w*P*R*T*W*^*d*t*u+c+f+},Q.a.z/_/h/r/s/u0Y0[0g0h0i1^1a1i3Z4U4V4a4f4w5R5U5x6|7l7v7|8Q8f9V9e9n9t:S:f:t:};V;^<^<_<a<b<c<d<g<h<i<j<k<l<t<u<v<w<y<z<}=O=P=Q=R=S=T=U=X=Y=p=x=y=|=}Q&V|Q'S!eS'Y%h-ZQ+q&OQ,a&eQ0f+OQ1S+rQ1X+xQ1x,eQ1y,fQ5]0}Q5f1ZQ6Q1rQ6T1tQ6U1wQ8U5^Q8X5cQ8q6WQ9|8YQ:Y8nR<o*XrnOXst!V!Z#d%l&g&p&r&s&u,n,s2S2VR,c&i&z^OPXYstuvwz!Z!`!g!j!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%l%s&Q&i&l&m&p&r&s&u&y'R'`'p(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=r=s[#]WZ#W#Z'V(R!b%im#h#i#l$x%d%g([(f(g(h*W*[*_+W+X+Z,j-Q.O.U.V.W.Y/h/k2[3S3T4X6h6yQ%vxQ%zyS&P|&UQ&]!TQ'a!hQ'c!iQ(o#sS+k%{%|Q+o&OQ,Y&`Q,^&bS-g'd'eQ.d(pQ0{+lQ1R+rQ1T+sQ1W+wQ1l,ZS1p,_,`Q2t-hQ5[0}Q5`1QQ5e1YQ6P1qQ8T5^Q8W5bQ9x8SR:w9y!U$zi$d%O%Q%]%^%b*P*R*^*t*u.z/r0Y0[0g0h0i4V4w7|9e=p=x=y!^%xy!i!u%z%{%|'T'c'd'e'i's*g+k+l-T-g-h-o/{0O0{2m2t2{4i4j4m7s9pQ+e%vQ,O&YQ,R&ZQ,]&bQ.c(oQ1k,YU1o,^,_,`Q3].dQ5z1lS6O1p1qQ8m6P#f=t#v$b$c$x${)w*T*W*d+c+f+},Q.a/_/h/s/u1^1a1i3Z4U4a4f5R5U5x6|7l7v8Q8f9V9n9t:S:f:t:};V;^<a<c<g<i<k<t<v<y<}=P=R=T=X=|=}o=u<^<_<b<d<h<j<l<u<w<z=O=Q=S=U=YW%Ti%V*v=pS&Y!Q&gQ&Z!RQ&[!SQ+S%cR+|&W%]%Si#v$b$c$d$x${%O%Q%]%^%b)w*P*R*T*W*^*d*t*u+c+f+},Q.a.z/_/h/r/s/u0Y0[0g0h0i1^1a1i3Z4U4V4a4f4w5R5U5x6|7l7v7|8Q8f9V9e9n9t:S:f:t:};V;^<^<_<a<b<c<d<g<h<i<j<k<l<t<u<v<w<y<z<}=O=P=Q=R=S=T=U=X=Y=p=x=y=|=}T)x$u)yV*{%[<e<fW'Y!e%h*X-ZS({#y#zQ+`%qQ+v&RS.](k(lQ1b,SQ4x0cR8^5k'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=s$i$^c#Y#e%p%r%t(Q(W(r(w)P)Q)R)S)T)U)V)W)X)Y)[)^)`)e)o+a+u-U-s-x-}.P.n.q.u.w.x.y/]0j2c2f2v2}3c3h3i3j3k3l3m3n3o3p3q3r3s3t3w3x4P5O5Y6k6q6v7V7W7a7b8`8|9Q9[9b9c:c:y;R;x=gT#TV#U'RkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sQ'W!eR2i-W!W!nQ!e!r!v!y!z$|'U']'^'j'k'l*X*h*l*n*o-W-^-`-p0U0X1g5q5sR1d,UnqOXst!Z#d%l&p&r&s&u,n,s2S2VQ&w!^Q't!xS(q#u<OQ+i%yQ,W&]Q,X&_Q-e'bQ-r'mS.m(v<qS0k+U<{Q0y+jQ1f,VQ2Z,uQ2],vQ2e-RQ2r-fQ2u-jS5P0l=VQ5W0zS5Z0|=WQ6j2gQ6n2sQ6s2zQ8R5XQ8}6lQ9O6oQ9R6tR:`8z$d$]c#Y#e%r%t(Q(W(r(w)P)Q)R)S)T)U)V)W)X)Y)[)^)`)e)o+a+u-U-s-x-}.P.n.q.u.x.y/]0j2c2f2v2}3c3h3i3j3k3l3m3n3o3p3q3r3s3t3w3x4P5O5Y6k6q6v7V7W7a7b8`8|9Q9[9b9c:c:y;R;x=gS(m#p'gQ(}#zS+_%p.wS.^(l(nR3U._'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sS#q];wQ&r!XQ&s!YQ&u![Q&v!]R2R,qQ'_!hQ+b%vQ-c'aS.`(o+eQ2p-bW3Y.c.d0q0sQ6m2qW6z3V3X3]5TU9U6{6}7PU:e9W9X9ZS;T:d:gQ;b;UR;j;cU!wQ'^-`T5o1g5q!Q_OXZ`st!V!Z#d#h%d%l&g&i&p&r&s&u(h,n,s.V2S2V]!pQ!r'^-`1g5qT#q];w%^{OPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&m&p&r&s&u&y'R'`'p(R(T(Z(b(v(x(|){*f+U+Y+d,k,n,s-d-l-z.Q.b.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3[3d4q5y6Z6[6_6r7Q8i8x9SS({#y#zS.](k(l!s=^$Z$n'V)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sU$fd)],hS(n#p'gU*s%R(u3vU0e*z.i7]Q5T0rQ6{3WQ9X7OR:g9Ym!tQ!r!v!y!z'^'j'k'l-`-p1g5q5sQ'r!uS(d#g1|S-n'i'uQ/n*ZQ/{*gQ2|-qQ4]/oQ4i/}Q4j0OQ4o0WQ7h4WS7s4k4mS7w4p4rQ9g7iQ9k7oQ9p7tQ9u7yS:o9l9mS;Y:p:sS;e;Z;[S;m;f;gS;q;n;oR;t;rQ#wbQ'q!uS(c#g1|S(e#m+TQ+V%eQ+g%wQ+m%}U-m'i'r'uQ.R(dQ/m*ZQ/|*gQ0P*iQ0x+hQ1m,[S2y-n-qQ3R.ZS4[/n/oQ4e/yS4h/{0WQ4l0QQ5|1nQ6u2|Q7g4WQ7k4]U7r4i4o4rQ7u4nQ8k5}S9f7h7iQ9j7oQ9r7wQ9s7xQ:V8lQ:m9gS:n9k9mQ:v9uQ;P:WS;X:o:sS;d;Y;ZS;l;e;gS;p;m;oQ;s;qQ;u;tQ=a=[Q=l=eR=m=fV!wQ'^-`%^aOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&m&p&r&s&u&y'R'`'p(R(T(Z(b(v(x(|){*f+U+Y+d,k,n,s-d-l-z.Q.b.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3[3d4q5y6Z6[6_6r7Q8i8x9SS#wz!j!r=Z$Z$n'V)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sR=a=r%^bOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&m&p&r&s&u&y'R'`'p(R(T(Z(b(v(x(|){*f+U+Y+d,k,n,s-d-l-z.Q.b.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3[3d4q5y6Z6[6_6r7Q8i8x9SQ%ej!^%wy!i!u%z%{%|'T'c'd'e'i's*g+k+l-T-g-h-o/{0O0{2m2t2{4i4j4m7s9pS%}z!jQ+h%xQ,[&bW1n,],^,_,`U5}1o1p1qS8l6O6PQ:W8m!r=[$Z$n'V)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sQ=e=qR=f=r%QeOPXYstuvw!Z!`!g!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&p&r&s&u&y'R'`'p(T(Z(b(v(x(|){*f+U+Y+d,k,n,s-d-l-z.Q.b.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3[3d4q5y6Z6[6_6r7Q8i8x9SY#bWZ#W#Z(R!b%im#h#i#l$x%d%g([(f(g(h*W*[*_+W+X+Z,j-Q.O.U.V.W.Y/h/k2[3S3T4X6h6yQ,i&m!p=]$Z$n)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sR=`'VU'Z!e%h*XR2k-Z%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&p&r&s&u&y'R'`'p(R(T(Z(b(v(x(|){*f+U+Y,k,n,s-d-l-z.Q.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3d4q5y6Z6[6_6r8i8x9S!r)]$Z$n'V)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sQ,h&mQ0r+dQ3W.bQ7O3[R9Y7Q!b$Tc#Y%p(Q(W(r(w)X)Y)^)e+u-s-x-}.P.n.q/]0j2v2}3c3s5O5Y6q6v7V9Q:c;x!P<U)[)o-U.w2c2f3h3q3r3w4P6k7W7a7b8`8|9[9b9c:y;R=g!f$Vc#Y%p(Q(W(r(w)U)V)X)Y)^)e+u-s-x-}.P.n.q/]0j2v2}3c3s5O5Y6q6v7V9Q:c;x!T<W)[)o-U.w2c2f3h3n3o3q3r3w4P6k7W7a7b8`8|9[9b9c:y;R=g!^$Zc#Y%p(Q(W(r(w)^)e+u-s-x-}.P.n.q/]0j2v2}3c3s5O5Y6q6v7V9Q:c;xQ4V/fz=s)[)o-U.w2c2f3h3w4P6k7W7a7b8`8|9[9b9c:y;R=gQ=x=zR=y={'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sS$oh$pR3|/P'XgOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/P/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sT$kf$qQ$ifS)h$l)lR)t$qT$jf$qT)j$l)l'XhOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%l%s&Q&i&l&m&p&r&s&u&y'R'V'`'p(R(T(Z(b(v(x(|)q){*f+U+Y+d,k,n,s-P-S-d-l-z.Q.b.o.v/P/Q/i0V0d0l0|1j1z1{1}2P2S2V2X2h2x3O3[3d3{4q5m5y6Z6[6_6i6r7Q8i8x9S9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=sT$oh$pQ$rhR)s$p%^jOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%l%s&Q&i&l&m&p&r&s&u&y'R'`'p(R(T(Z(b(v(x(|){*f+U+Y+d,k,n,s-d-l-z.Q.b.o.v/i0V0d0l0|1j1z1{1}2P2S2V2X2x3O3[3d4q5y6Z6[6_6r7Q8i8x9S!s=q$Z$n'V)q-P-S/Q2h3{5m6i9}:a;v;y;z;}<O<P<Q<R<S<T<U<V<W<X<Y<Z<]<`<m<p<q<s<{<|=V=W=s#glOPXZst!Z!`!o#S#d#o#{$n%l&i&l&m&p&r&s&u&y'R'`(|)q*f+Y+d,k,n,s-d.b/Q/i0V0d1j1z1{1}2P2S2V2X3[3{4q5y6Z6[6_7Q8i8x!U%Ri$d%O%Q%]%^%b*P*R*^*t*u.z/r0Y0[0g0h0i4V4w7|9e=p=x=y#f(u#v$b$c$x${)w*T*W*d+c+f+},Q.a/_/h/s/u1^1a1i3Z4U4a4f5R5U5x6|7l7v8Q8f9V9n9t:S:f:t:};V;^<a<c<g<i<k<t<v<y<}=P=R=T=X=|=}Q+P%`Q/^)|o3v<^<_<b<d<h<j<l<u<w<z=O=Q=S=U=Y!U$yi$d%O%Q%]%^%b*P*R*^*t*u.z/r0Y0[0g0h0i4V4w7|9e=p=x=yQ*`$zU*i$|*X*lQ+Q%aQ0Q*j#f=c#v$b$c$x${)w*T*W*d+c+f+},Q.a/_/h/s/u1^1a1i3Z4U4a4f5R5U5x6|7l7v8Q8f9V9n9t:S:f:t:};V;^<a<c<g<i<k<t<v<y<}=P=R=T=X=|=}n=d<^<_<b<d<h<j<l<u<w<z=O=Q=S=U=YQ=h=tQ=i=uQ=j=vR=k=w!U%Ri$d%O%Q%]%^%b*P*R*^*t*u.z/r0Y0[0g0h0i4V4w7|9e=p=x=y#f(u#v$b$c$x${)w*T*W*d+c+f+},Q.a/_/h/s/u1^1a1i3Z4U4a4f5R5U5x6|7l7v8Q8f9V9n9t:S:f:t:};V;^<a<c<g<i<k<t<v<y<}=P=R=T=X=|=}o3v<^<_<b<d<h<j<l<u<w<z=O=Q=S=U=YnoOXst!Z#d%l&p&r&s&u,n,s2S2VS*c${*WQ,|&|Q,}'OR4`/s%[%Si#v$b$c$d$x${%O%Q%]%^%b)w*P*R*T*W*^*d*t*u+c+f+},Q.a.z/_/h/r/s/u0Y0[0g0h0i1^1a1i3Z4U4V4a4f4w5R5U5x6|7l7v7|8Q8f9V9e9n9t:S:f:t:};V;^<^<_<a<b<c<d<g<h<i<j<k<l<t<u<v<w<y<z<}=O=P=Q=R=S=T=U=X=Y=p=x=y=|=}Q,P&ZQ1`,RQ5i1_R8]5jV*k$|*X*lU*k$|*X*lT5p1g5qS/y*f/iQ4n0VT7x4q:PQ+g%wQ0P*iQ0x+hQ1m,[Q5|1nQ8k5}Q:V8lR;P:W!U%Oi$d%O%Q%]%^%b*P*R*^*t*u.z/r0Y0[0g0h0i4V4w7|9e=p=x=yx*P$v)c*Q*r+R/q0^0_3y4^4{4|4}7f7z9v:l=b=n=oS0Y*q0Z#f<a#v$b$c$x${)w*T*W*d+c+f+},Q.a/_/h/s/u1^1a1i3Z4U4a4f5R5U5x6|7l7v8Q8f9V9n9t:S:f:t:};V;^<a<c<g<i<k<t<v<y<}=P=R=T=X=|=}n<b<^<_<b<d<h<j<l<u<w<z=O=Q=S=U=Y!d<t(s)a*Y*b.e.h.l/Y/f/v0p1]3`4S4_4c5h7R7U7m7p7}8P9i9q9w:q:u;W;];h=z={`<u3u7X7[7`9]:h:k;kS=P.g3aT=Q7Z9`!U%Qi$d%O%Q%]%^%b*P*R*^*t*u.z/r0Y0[0g0h0i4V4w7|9e=p=x=y|*R$v)c*S*q+R/b/q0^0_3y4^4s4{4|4}7f7z9v:l=b=n=oS0[*r0]#f<c#v$b$c$x${)w*T*W*d+c+f+},Q.a/_/h/s/u1^1a1i3Z4U4a4f5R5U5x6|7l7v8Q8f9V9n9t:S:f:t:};V;^<a<c<g<i<k<t<v<y<}=P=R=T=X=|=}n<d<^<_<b<d<h<j<l<u<w<z=O=Q=S=U=Y!h<v(s)a*Y*b.f.g.l/Y/f/v0p1]3^3`4S4_4c5h7R7S7U7m7p7}8P9i9q9w:q:u;W;];h=z={d<w3u7Y7Z7`9]9^:h:i:k;kS=R.h3bT=S7[9arnOXst!V!Z#d%l&g&p&r&s&u,n,s2S2VQ&d!UR,k&mrnOXst!V!Z#d%l&g&p&r&s&u,n,s2S2VR&d!UQ,T&[R1[+|snOXst!V!Z#d%l&g&p&r&s&u,n,s2S2VQ1h,YS5w1k1lU8e5u5v5zS:R8g8hS:{:Q:TQ;_:|R;i;`Q&k!VR,d&gR6T1tR:Y8nS&P|&UR1T+sQ&p!WR,n&qR,t&vT2T,s2VR,x&wQ,w&wR2^,xQ'w!{R-t'wSsOtQ#dXT%os#dQ#OTR'y#OQ#RUR'{#RQ)y$uR/Z)yQ#UVR(O#UQ#XWU(U#X(V-{Q(V#YR-{(WQ-X'WR2j-XQ.p(wS3e.p3fR3f.qQ-`'^R2n-`Y!rQ'^-`1g5qR'h!rQ.{)cR3z.{U#_W%g*WU(]#_(^-|Q(^#`R-|(XQ-['ZR2l-[t`OXst!V!Z#d%l&g&i&p&r&s&u,n,s2S2VS#hZ%dU#r`#h.VR.V(hQ(i#jQ.S(eW.[(i.S3P6wQ3P.TR6w3QQ)l$lR/R)lQ$phR)r$pQ$`cU)_$`-w<[Q-w;xR<[)oQ/l*ZW4Y/l4Z7j9hU4Z/m/n/oS7j4[4]R9h7k$e*O$v(s)a)c*Y*b*q*r*|*}+R.g.h.j.k.l/Y/b/d/f/q/v0^0_0p1]3^3_3`3u3y4S4^4_4c4s4u4{4|4}5h7R7S7T7U7Z7[7^7_7`7f7m7p7z7}8P9]9^9_9i9q9v9w:h:i:j:k:l:q:u;W;];h;k=b=n=o=z={Q/t*bU4b/t4d7nQ4d/vR7n4cS*l$|*XR0S*lx*Q$v)c*q*r+R/q0^0_3y4^4{4|4}7f7z9v:l=b=n=o!d.e(s)a*Y*b.g.h.l/Y/f/v0p1]3`4S4_4c5h7R7U7m7p7}8P9i9q9w:q:u;W;];h=z={U/c*Q.e7Xa7X3u7Z7[7`9]:h:k;kQ0Z*qQ3a.gU4t0Z3a9`R9`7Z|*S$v)c*q*r+R/b/q0^0_3y4^4s4{4|4}7f7z9v:l=b=n=o!h.f(s)a*Y*b.g.h.l/Y/f/v0p1]3^3`4S4_4c5h7R7S7U7m7p7}8P9i9q9w:q:u;W;];h=z={U/e*S.f7Ye7Y3u7Z7[7`9]9^:h:i:k;kQ0]*rQ3b.hU4v0]3b9aR9a7[Q*w%UR0a*wQ5S0pR8O5SQ+[%jR0o+[Q5l1bS8_5l:OR:O8`Q,V&]R1e,VQ5q1gR8b5qQ1s,aS6R1s8oR8o6TQ1O+oW5_1O5a8V9zQ5a1RQ8V5`R9z8WQ+t&PR1U+tQ2V,sR6c2VYrOXst#dQ&t!ZQ+^%lQ,m&pQ,o&rQ,p&sQ,r&uQ2Q,nS2T,s2VR6b2SQ%npQ&x!_Q&{!aQ&}!bQ'P!cQ'o!uQ+]%kQ+i%yQ+{&VQ,c&kQ,z&zW-k'i'q'r'uQ-r'mQ0R*kQ0y+jS1v,d,gQ2_,yQ2`,|Q2a,}Q2u-jW2w-m-n-q-sQ5W0zQ5d1XQ5g1]Q5{1mQ6V1xQ6a2RU6p2v2y2|Q6s2zQ8R5XQ8Z5fQ8[5hQ8a5pQ8j5|Q8p6US9P6q6uQ9R6tQ9{8XQ:U8kQ:Z8qQ:b9QQ:x9|Q;O:VQ;S:cR;a;PQ%yyQ'b!iQ'm!uU+j%z%{%|Q-R'TU-f'c'd'eS-j'i'sQ/z*gS0z+k+lQ2g-TS2s-g-hQ2z-oS4g/{0OQ5X0{Q6l2mQ6o2tQ6t2{U7q4i4j4mQ9o7sR:r9pS$wi=pR*x%VU%Ui%V=pR0`*vQ$viS(s#v+fS)a$b$cQ)c$dQ*Y$xS*b${*WQ*q%OQ*r%QQ*|%]Q*}%^Q+R%bQ.g<aQ.h<cQ.j<gQ.k<iQ.l<kQ/Y)wQ/b*PQ/d*RQ/f*TQ/q*^S/v*d/hQ0^*tQ0_*ul0p+c,Q.a1a1i3Z5x6|8f9V:S:f:};VQ1]+}Q3^<tQ3_<vQ3`<yS3u<^<_Q3y.zS4S/_4UQ4^/rQ4_/sQ4c/uQ4s0YQ4u0[Q4{0gQ4|0hQ4}0iQ5h1^Q7R<}Q7S=PQ7T=RQ7U=TQ7Z<bQ7[<dQ7^<hQ7_<jQ7`<lQ7f4VQ7m4aQ7p4fQ7z4wQ7}5RQ8P5UQ9]<zQ9^<uQ9_<wQ9i7lQ9q7vQ9v7|Q9w8QQ:h=OQ:i=QQ:j=SQ:k=UQ:l9eQ:q9nQ:u9tQ;W=XQ;]:tQ;h;^Q;k=YQ=b=pQ=n=xQ=o=yQ=z=|R={=}Q*z%[Q.i<eR7]<fnpOXst!Z#d%l&p&r&s&u,n,s2S2VQ!fPS#fZ#oQ&z!`W'f!o*f0V4qQ'}#SQ)O#{Q)p$nS,g&i&lQ,l&mQ,y&yS-O'R/iQ-b'`Q.s(|Q/V)qQ0m+YQ0s+dQ2O,kQ2q-dQ3X.bQ4O/QQ4y0dQ5v1jQ6X1zQ6Y1{Q6^1}Q6`2PQ6e2XQ7P3[Q7c3{Q8h5yQ8t6ZQ8u6[Q8w6_Q9Z7QQ:T8iR:_8x#[cOPXZst!Z!`!o#d#o#{%l&i&l&m&p&r&s&u&y'R'`(|*f+Y+d,k,n,s-d.b/i0V0d1j1z1{1}2P2S2V2X3[4q5y6Z6[6_7Q8i8xQ#YWQ#eYQ%puQ%rvS%tw!gS(Q#W(TQ(W#ZQ(r#uQ(w#xQ)P$OQ)Q$PQ)R$QQ)S$RQ)T$SQ)U$TQ)V$UQ)W$VQ)X$WQ)Y$XQ)[$ZQ)^$_Q)`$aQ)e$eW)o$n)q/Q3{Q+a%sQ+u&QS-U'V2hQ-s'pS-x(R-zQ-}(ZQ.P(bQ.n(vQ.q(xQ.u;vQ.w;yQ.x;zQ.y;}Q/]){Q0j+UQ2c-PQ2f-SQ2v-lQ2}.QQ3c.oQ3h<OQ3i<PQ3j<QQ3k<RQ3l<SQ3m<TQ3n<UQ3o<VQ3p<WQ3q<XQ3r<YQ3s.vQ3t<]Q3w<`Q3x<mQ4P<ZQ5O0lQ5Y0|Q6k<pQ6q2xQ6v3OQ7V3dQ7W<qQ7a<sQ7b<{Q8`5mQ8|6iQ9Q6rQ9[<|Q9b=VQ9c=WQ:c9SQ:y9}Q;R:aQ;x#SR=g=sR#[WR'X!el!tQ!r!v!y!z'^'j'k'l-`-p1g5q5sS'T!e-WU*g$|*X*lS-T'U']S0O*h*nQ0W*oQ2m-^Q4m0UR4r0XR(y#xQ!fQT-_'^-`]!qQ!r'^-`1g5qQ#p]R'g;wR)d$dY!uQ'^-`1g5qQ'i!rS's!v!yS'u!z5sS-o'j'kQ-q'lR2{-pT#kZ%dS#jZ%dS%jm,jU(e#h#i#lS.T(f(gQ.X(hQ0n+ZQ3Q.UU3R.V.W.YS6x3S3TR9T6yd#^W#W#Z%g(R([*W+W.O/hr#gZm#h#i#l%d(f(g(h+Z.U.V.W.Y3S3T6yS*Z$x*_Q/o*[Q1|,jQ2d-QQ4W/kQ6g2[Q7i4XQ8{6hT=_'V+XV#aW%g*WU#`W%g*WS(S#W([U(X#Z+W/hS-V'V+XT-y(R.OV'[!e%h*XQ$lfR)v$qT)k$l)lR3}/PT*]$x*_T*e${*WQ0q+cQ1_,QQ3V.aQ5j1aQ5u1iQ6}3ZQ8g5xQ9W6|Q:Q8fQ:d9VQ:|:SQ;U:fQ;`:}R;c;VnqOXst!Z#d%l&p&r&s&u,n,s2S2VQ&j!VR,c&gtmOXst!U!V!Z#d%l&g&p&r&s&u,n,s2S2VR,j&mT%km,jR1c,SR,b&eQ&T|R+z&UR+p&OT&n!W&qT&o!W&qT2U,s2V",
		nodeNames:
			"⚠ ArithOp ArithOp ?. JSXStartTag LineComment BlockComment Script Hashbang ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > < TypeParamList const TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewTarget new NewExpression ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression TypeArgList CompareOp < declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies in CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression InstantiationExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast < ArrowFunction TypeParamList SequenceExpression InstantiationExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate asserts is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var using TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
		maxTerm: 378,
		context: Rm,
		nodeProps: [
			["isolate", -8, 5, 6, 14, 35, 37, 49, 51, 53, ""],
			[
				"group",
				-26,
				9,
				17,
				19,
				66,
				206,
				210,
				214,
				215,
				217,
				220,
				223,
				233,
				235,
				241,
				243,
				245,
				247,
				250,
				256,
				262,
				264,
				266,
				268,
				270,
				272,
				273,
				"Statement",
				-34,
				13,
				14,
				30,
				33,
				34,
				40,
				49,
				52,
				53,
				55,
				60,
				68,
				70,
				74,
				78,
				80,
				82,
				83,
				108,
				109,
				118,
				119,
				135,
				138,
				140,
				141,
				142,
				143,
				144,
				146,
				147,
				166,
				168,
				170,
				"Expression",
				-23,
				29,
				31,
				35,
				39,
				41,
				43,
				172,
				174,
				176,
				177,
				179,
				180,
				181,
				183,
				184,
				185,
				187,
				188,
				189,
				200,
				202,
				204,
				205,
				"Type",
				-3,
				86,
				101,
				107,
				"ClassItem",
			],
			[
				"openedBy",
				23,
				"<",
				36,
				"InterpolationStart",
				54,
				"[",
				58,
				"{",
				71,
				"(",
				159,
				"JSXStartCloseTag",
			],
			[
				"closedBy",
				-2,
				24,
				167,
				">",
				38,
				"InterpolationEnd",
				48,
				"]",
				59,
				"}",
				72,
				")",
				164,
				"JSXEndTag",
			],
		],
		propSources: [Wm],
		skippedNodes: [0, 5, 6, 276],
		repeatNodeCount: 37,
		tokenData:
			"$Fq07[R!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tuEruvJSvwLkwx! Yxy!'iyz!(sz{!)}{|!,q|}!.O}!O!,q!O!P!/Y!P!Q!9j!Q!R#:O!R![#<_![!]#I_!]!^#Jk!^!_#Ku!_!`$![!`!a$$v!a!b$*T!b!c$,r!c!}Er!}#O$-|#O#P$/W#P#Q$4o#Q#R$5y#R#SEr#S#T$7W#T#o$8b#o#p$<r#p#q$=h#q#r$>x#r#s$@U#s$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$I|Er$I|$I}$Dk$I}$JO$Dk$JO$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr(n%d_$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$h&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$h&j(X!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU(X!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$h&j(UpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU(UpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX(Up(X!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z07[+rq$h&j(Up(X!b'z0/lOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z07[.ST(V#S$h&j'{0/lO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c07[.n_$h&j(Up(X!b'{0/lOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)3p/x`$h&j!n),Q(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW1V`#u(Ch$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW2d_#u(Ch$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At3l_(T':f$h&j(X!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k(^4r_$h&j(X!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k&z5vX$h&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q&z6jT$c`$h&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c`6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y`7bO$c``7eP;=`<%l6y&z7kP;=`<%l5q(^7w]$c`$h&j(X!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!r8uZ(X!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p!r9oU$c`(X!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!r:UP;=`<%l8p(^:[P;=`<%l4k%9[:hh$h&j(Up(X!bOY%ZYZ&cZq%Zqr<Srs&}st%ZtuCruw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr(r<__WS$h&j(Up(X!bOY<SYZ&cZr<Srs=^sw<Swx@nx!^<S!^!_Bm!_#O<S#O#P>`#P#o<S#o#pBm#p;'S<S;'S;=`Cl<%lO<S(Q=g]WS$h&j(X!bOY=^YZ&cZw=^wx>`x!^=^!^!_?q!_#O=^#O#P>`#P#o=^#o#p?q#p;'S=^;'S;=`@h<%lO=^&n>gXWS$h&jOY>`YZ&cZ!^>`!^!_?S!_#o>`#o#p?S#p;'S>`;'S;=`?k<%lO>`S?XSWSOY?SZ;'S?S;'S;=`?e<%lO?SS?hP;=`<%l?S&n?nP;=`<%l>`!f?xWWS(X!bOY?qZw?qwx?Sx#O?q#O#P?S#P;'S?q;'S;=`@b<%lO?q!f@eP;=`<%l?q(Q@kP;=`<%l=^'`@w]WS$h&j(UpOY@nYZ&cZr@nrs>`s!^@n!^!_Ap!_#O@n#O#P>`#P#o@n#o#pAp#p;'S@n;'S;=`Bg<%lO@ntAwWWS(UpOYApZrAprs?Ss#OAp#O#P?S#P;'SAp;'S;=`Ba<%lOAptBdP;=`<%lAp'`BjP;=`<%l@n#WBvYWS(Up(X!bOYBmZrBmrs?qswBmwxApx#OBm#O#P?S#P;'SBm;'S;=`Cf<%lOBm#WCiP;=`<%lBm(rCoP;=`<%l<S%9[C}i$h&j(m%1l(Up(X!bOY%ZYZ&cZr%Zrs&}st%ZtuCruw%Zwx(rx!Q%Z!Q![Cr![!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr%9[EoP;=`<%lCr07[FRk$h&j(Up(X!b$[#t(R,2j(c$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr+dHRk$h&j(Up(X!b$[#tOY%ZYZ&cZr%Zrs&}st%ZtuGvuw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Gv![!^%Z!^!_*g!_!c%Z!c!}Gv!}#O%Z#O#P&c#P#R%Z#R#SGv#S#T%Z#T#oGv#o#p*g#p$g%Z$g;'SGv;'S;=`Iv<%lOGv+dIyP;=`<%lGv07[JPP;=`<%lEr(KWJ_`$h&j(Up(X!b#n(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWKl_$h&j$P(Ch(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,#xLva(x+JY$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sv%ZvwM{wx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWNW`$h&j#y(Ch(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At! c_(W';W$h&j(UpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b'l!!i_$h&j(UpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b&z!#mX$h&jOw!#hwx6cx!^!#h!^!_!$Y!_#o!#h#o#p!$Y#p;'S!#h;'S;=`!$r<%lO!#h`!$]TOw!$Ywx7]x;'S!$Y;'S;=`!$l<%lO!$Y`!$oP;=`<%l!$Y&z!$uP;=`<%l!#h'l!%R]$c`$h&j(UpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r!Q!&PZ(UpOY!%zYZ!$YZr!%zrs!$Ysw!%zwx!&rx#O!%z#O#P!$Y#P;'S!%z;'S;=`!']<%lO!%z!Q!&yU$c`(UpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r!Q!'`P;=`<%l!%z'l!'fP;=`<%l!!b/5|!'t_!j/.^$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&U!)O_!i!Lf$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z-!n!*[b$h&j(Up(X!b(S%&f#o(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!+d{!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW!+o`$h&j(Up(X!b#l(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;x!,|`$h&j(Up(X!bp+4YOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,$U!.Z_!Z+Jf$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!/ec$h&j(Up(X!b!O.2^OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!0p!P!Q%Z!Q![!3Y![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!0ya$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!2O!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!2Z_!Y!L^$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!3eg$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!3Y![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S!3Y#S#X%Z#X#Y!4|#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!5Vg$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!6n|}%Z}!O!6n!O!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!6wc$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!8_c$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!9uf$h&j(Up(X!b#m(ChOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcxz!;Zz{#-}{!P!;Z!P!Q#/d!Q!^!;Z!^!_#(i!_!`#7S!`!a#8i!a!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z?O!;fb$h&j(Up(X!b!V7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z>^!<w`$h&j(X!b!V7`OY!<nYZ&cZw!<nwx!=yx!P!<n!P!Q!Eq!Q!^!<n!^!_!Gr!_!}!<n!}#O!KS#O#P!Dy#P#o!<n#o#p!Gr#p;'S!<n;'S;=`!L]<%lO!<n<z!>Q^$h&j!V7`OY!=yYZ&cZ!P!=y!P!Q!>|!Q!^!=y!^!_!@c!_!}!=y!}#O!CW#O#P!Dy#P#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!?Td$h&j!V7`O!^&c!_#W&c#W#X!>|#X#Z&c#Z#[!>|#[#]&c#]#^!>|#^#a&c#a#b!>|#b#g&c#g#h!>|#h#i&c#i#j!>|#j#k!>|#k#m&c#m#n!>|#n#o&c#p;'S&c;'S;=`&w<%lO&c7`!@hX!V7`OY!@cZ!P!@c!P!Q!AT!Q!}!@c!}#O!Ar#O#P!Bq#P;'S!@c;'S;=`!CQ<%lO!@c7`!AYW!V7`#W#X!AT#Z#[!AT#]#^!AT#a#b!AT#g#h!AT#i#j!AT#j#k!AT#m#n!AT7`!AuVOY!ArZ#O!Ar#O#P!B[#P#Q!@c#Q;'S!Ar;'S;=`!Bk<%lO!Ar7`!B_SOY!ArZ;'S!Ar;'S;=`!Bk<%lO!Ar7`!BnP;=`<%l!Ar7`!BtSOY!@cZ;'S!@c;'S;=`!CQ<%lO!@c7`!CTP;=`<%l!@c<z!C][$h&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#O!CW#O#P!DR#P#Q!=y#Q#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DWX$h&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DvP;=`<%l!CW<z!EOX$h&jOY!=yYZ&cZ!^!=y!^!_!@c!_#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!EnP;=`<%l!=y>^!Ezl$h&j(X!b!V7`OY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#W&}#W#X!Eq#X#Z&}#Z#[!Eq#[#]&}#]#^!Eq#^#a&}#a#b!Eq#b#g&}#g#h!Eq#h#i&}#i#j!Eq#j#k!Eq#k#m&}#m#n!Eq#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}8r!GyZ(X!b!V7`OY!GrZw!Grwx!@cx!P!Gr!P!Q!Hl!Q!}!Gr!}#O!JU#O#P!Bq#P;'S!Gr;'S;=`!J|<%lO!Gr8r!Hse(X!b!V7`OY'}Zw'}x#O'}#P#W'}#W#X!Hl#X#Z'}#Z#[!Hl#[#]'}#]#^!Hl#^#a'}#a#b!Hl#b#g'}#g#h!Hl#h#i'}#i#j!Hl#j#k!Hl#k#m'}#m#n!Hl#n;'S'};'S;=`(f<%lO'}8r!JZX(X!bOY!JUZw!JUwx!Arx#O!JU#O#P!B[#P#Q!Gr#Q;'S!JU;'S;=`!Jv<%lO!JU8r!JyP;=`<%l!JU8r!KPP;=`<%l!Gr>^!KZ^$h&j(X!bOY!KSYZ&cZw!KSwx!CWx!^!KS!^!_!JU!_#O!KS#O#P!DR#P#Q!<n#Q#o!KS#o#p!JU#p;'S!KS;'S;=`!LV<%lO!KS>^!LYP;=`<%l!KS>^!L`P;=`<%l!<n=l!Ll`$h&j(Up!V7`OY!LcYZ&cZr!Lcrs!=ys!P!Lc!P!Q!Mn!Q!^!Lc!^!_# o!_!}!Lc!}#O#%P#O#P!Dy#P#o!Lc#o#p# o#p;'S!Lc;'S;=`#&Y<%lO!Lc=l!Mwl$h&j(Up!V7`OY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#W(r#W#X!Mn#X#Z(r#Z#[!Mn#[#](r#]#^!Mn#^#a(r#a#b!Mn#b#g(r#g#h!Mn#h#i(r#i#j!Mn#j#k!Mn#k#m(r#m#n!Mn#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r8Q# vZ(Up!V7`OY# oZr# ors!@cs!P# o!P!Q#!i!Q!}# o!}#O#$R#O#P!Bq#P;'S# o;'S;=`#$y<%lO# o8Q#!pe(Up!V7`OY)rZr)rs#O)r#P#W)r#W#X#!i#X#Z)r#Z#[#!i#[#])r#]#^#!i#^#a)r#a#b#!i#b#g)r#g#h#!i#h#i)r#i#j#!i#j#k#!i#k#m)r#m#n#!i#n;'S)r;'S;=`*Z<%lO)r8Q#$WX(UpOY#$RZr#$Rrs!Ars#O#$R#O#P!B[#P#Q# o#Q;'S#$R;'S;=`#$s<%lO#$R8Q#$vP;=`<%l#$R8Q#$|P;=`<%l# o=l#%W^$h&j(UpOY#%PYZ&cZr#%Prs!CWs!^#%P!^!_#$R!_#O#%P#O#P!DR#P#Q!Lc#Q#o#%P#o#p#$R#p;'S#%P;'S;=`#&S<%lO#%P=l#&VP;=`<%l#%P=l#&]P;=`<%l!Lc?O#&kn$h&j(Up(X!b!V7`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#W%Z#W#X#&`#X#Z%Z#Z#[#&`#[#]%Z#]#^#&`#^#a%Z#a#b#&`#b#g%Z#g#h#&`#h#i%Z#i#j#&`#j#k#&`#k#m%Z#m#n#&`#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z9d#(r](Up(X!b!V7`OY#(iZr#(irs!Grsw#(iwx# ox!P#(i!P!Q#)k!Q!}#(i!}#O#+`#O#P!Bq#P;'S#(i;'S;=`#,`<%lO#(i9d#)th(Up(X!b!V7`OY*gZr*grs'}sw*gwx)rx#O*g#P#W*g#W#X#)k#X#Z*g#Z#[#)k#[#]*g#]#^#)k#^#a*g#a#b#)k#b#g*g#g#h#)k#h#i*g#i#j#)k#j#k#)k#k#m*g#m#n#)k#n;'S*g;'S;=`+Z<%lO*g9d#+gZ(Up(X!bOY#+`Zr#+`rs!JUsw#+`wx#$Rx#O#+`#O#P!B[#P#Q#(i#Q;'S#+`;'S;=`#,Y<%lO#+`9d#,]P;=`<%l#+`9d#,cP;=`<%l#(i?O#,o`$h&j(Up(X!bOY#,fYZ&cZr#,frs!KSsw#,fwx#%Px!^#,f!^!_#+`!_#O#,f#O#P!DR#P#Q!;Z#Q#o#,f#o#p#+`#p;'S#,f;'S;=`#-q<%lO#,f?O#-tP;=`<%l#,f?O#-zP;=`<%l!;Z07[#.[b$h&j(Up(X!b'|0/l!V7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z07[#/o_$h&j(Up(X!bT0/lOY#/dYZ&cZr#/drs#0nsw#/dwx#4Ox!^#/d!^!_#5}!_#O#/d#O#P#1p#P#o#/d#o#p#5}#p;'S#/d;'S;=`#6|<%lO#/d06j#0w]$h&j(X!bT0/lOY#0nYZ&cZw#0nwx#1px!^#0n!^!_#3R!_#O#0n#O#P#1p#P#o#0n#o#p#3R#p;'S#0n;'S;=`#3x<%lO#0n05W#1wX$h&jT0/lOY#1pYZ&cZ!^#1p!^!_#2d!_#o#1p#o#p#2d#p;'S#1p;'S;=`#2{<%lO#1p0/l#2iST0/lOY#2dZ;'S#2d;'S;=`#2u<%lO#2d0/l#2xP;=`<%l#2d05W#3OP;=`<%l#1p01O#3YW(X!bT0/lOY#3RZw#3Rwx#2dx#O#3R#O#P#2d#P;'S#3R;'S;=`#3r<%lO#3R01O#3uP;=`<%l#3R06j#3{P;=`<%l#0n05x#4X]$h&j(UpT0/lOY#4OYZ&cZr#4Ors#1ps!^#4O!^!_#5Q!_#O#4O#O#P#1p#P#o#4O#o#p#5Q#p;'S#4O;'S;=`#5w<%lO#4O00^#5XW(UpT0/lOY#5QZr#5Qrs#2ds#O#5Q#O#P#2d#P;'S#5Q;'S;=`#5q<%lO#5Q00^#5tP;=`<%l#5Q05x#5zP;=`<%l#4O01p#6WY(Up(X!bT0/lOY#5}Zr#5}rs#3Rsw#5}wx#5Qx#O#5}#O#P#2d#P;'S#5};'S;=`#6v<%lO#5}01p#6yP;=`<%l#5}07[#7PP;=`<%l#/d)3h#7ab$h&j$P(Ch(Up(X!b!V7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;ZAt#8vb$Y#t$h&j(Up(X!b!V7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z'Ad#:Zp$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#U%Z#U#V#?i#V#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#d#Bq#d#l%Z#l#m#Es#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#<jk$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#>j_$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#?rd$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#A]f$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Bzc$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Dbe$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#E|g$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Gpi$h&j(Up(X!bq'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x#Il_!e$b$h&j#})Lv(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Jv_al$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f#LS^h#)`#P-<U(Up(X!b$m7`OY*gZr*grs'}sw*gwx)rx!P*g!P!Q#MO!Q!^*g!^!_#Mt!_!`$ f!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#MXX$j&j(Up(X!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El#M}Z#p(Ch(Up(X!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Np!`#O*g#P;'S*g;'S;=`+Z<%lO*g(El#NyX$P(Ch(Up(X!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El$ oX#q(Ch(Up(X!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g*)x$!ga#^*!Y$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a$#l!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(K[$#w_#i(Cl$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x$%Vag!*r#q(Ch$e#|$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`$&[!`!a$'f!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$&g_#q(Ch$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$'qa#p(Ch$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`!a$(v!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$)R`#p(Ch$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(Kd$*`a(p(Ct$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!a%Z!a!b$+e!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$+p`$h&j#z(Ch(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`$,}_!z$Ip$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f$.X_!Q0,v$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$/]Z$h&jO!^$0O!^!_$0f!_#i$0O#i#j$0k#j#l$0O#l#m$2^#m#o$0O#o#p$0f#p;'S$0O;'S;=`$4i<%lO$0O(n$0VT_#S$h&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$0kO_#S(n$0p[$h&jO!Q&c!Q![$1f![!^&c!_!c&c!c!i$1f!i#T&c#T#Z$1f#Z#o&c#o#p$3|#p;'S&c;'S;=`&w<%lO&c(n$1kZ$h&jO!Q&c!Q![$2^![!^&c!_!c&c!c!i$2^!i#T&c#T#Z$2^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$2cZ$h&jO!Q&c!Q![$3U![!^&c!_!c&c!c!i$3U!i#T&c#T#Z$3U#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$3ZZ$h&jO!Q&c!Q![$0O![!^&c!_!c&c!c!i$0O!i#T&c#T#Z$0O#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$4PR!Q![$4Y!c!i$4Y#T#Z$4Y#S$4]S!Q![$4Y!c!i$4Y#T#Z$4Y#q#r$0f(n$4lP;=`<%l$0O#1[$4z_!W#)l$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$6U`#w(Ch$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;p$7c_$h&j(Up(X!b(_+4QOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$8qk$h&j(Up(X!b(R,2j$^#t(c$I[OY%ZYZ&cZr%Zrs&}st%Ztu$8buw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$8b![!^%Z!^!_*g!_!c%Z!c!}$8b!}#O%Z#O#P&c#P#R%Z#R#S$8b#S#T%Z#T#o$8b#o#p*g#p$g%Z$g;'S$8b;'S;=`$<l<%lO$8b+d$:qk$h&j(Up(X!b$^#tOY%ZYZ&cZr%Zrs&}st%Ztu$:fuw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$:f![!^%Z!^!_*g!_!c%Z!c!}$:f!}#O%Z#O#P&c#P#R%Z#R#S$:f#S#T%Z#T#o$:f#o#p*g#p$g%Z$g;'S$:f;'S;=`$<f<%lO$:f+d$<iP;=`<%l$:f07[$<oP;=`<%l$8b#Jf$<{X!]#Hb(Up(X!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g,#x$=sa(w+JY$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$+e#q;'S%Z;'S;=`+a<%lO%Z)>v$?V_![(CdtBr$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z?O$@a_!o7`$h&j(Up(X!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$Aq|$h&j(Up(X!b'z0/l$[#t(R,2j(c$I[OX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr07[$D|k$h&j(Up(X!b'{0/l$[#t(R,2j(c$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr",
		tokenizers: [
			jm,
			Em,
			qm,
			Lm,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			Mm,
			new pp(
				"$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOv~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!S~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(a~~",
				141,
				338,
			),
			new pp("j~RQYZXz{^~^O(O~~aP!P!Qd~iO(P~~", 25, 321),
		],
		topRules: {
			Script: [0, 7],
			SingleExpression: [1, 274],
			SingleClassItem: [2, 275],
		},
		dialects: { jsx: 0, ts: 15091 },
		dynamicPrecedences: { 78: 1, 80: 1, 92: 1, 168: 1, 198: 1 },
		specialized: [
			{ term: 325, get: (e) => zm[e] || -1 },
			{ term: 341, get: (e) => Ym[e] || -1 },
			{ term: 93, get: (e) => Dm[e] || -1 },
		],
		tokenPrec: 15116,
	}),
	Im = [
		PO("function ${name}(${params}) {\n\t${}\n}", {
			label: "function",
			detail: "definition",
			type: "keyword",
		}),
		PO("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
			label: "for",
			detail: "loop",
			type: "keyword",
		}),
		PO("for (let ${name} of ${collection}) {\n\t${}\n}", {
			label: "for",
			detail: "of loop",
			type: "keyword",
		}),
		PO("do {\n\t${}\n} while (${})", {
			label: "do",
			detail: "loop",
			type: "keyword",
		}),
		PO("while (${}) {\n\t${}\n}", {
			label: "while",
			detail: "loop",
			type: "keyword",
		}),
		PO("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
			label: "try",
			detail: "/ catch block",
			type: "keyword",
		}),
		PO("if (${}) {\n\t${}\n}", {
			label: "if",
			detail: "block",
			type: "keyword",
		}),
		PO("if (${}) {\n\t${}\n} else {\n\t${}\n}", {
			label: "if",
			detail: "/ else block",
			type: "keyword",
		}),
		PO("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", {
			label: "class",
			detail: "definition",
			type: "keyword",
		}),
		PO('import {${names}} from "${module}"\n${}', {
			label: "import",
			detail: "named",
			type: "keyword",
		}),
		PO('import ${name} from "${module}"\n${}', {
			label: "import",
			detail: "default",
			type: "keyword",
		}),
	],
	Um = Im.concat([
		PO("interface ${name} {\n\t${}\n}", {
			label: "interface",
			detail: "definition",
			type: "keyword",
		}),
		PO("type ${name} = ${type}", {
			label: "type",
			detail: "definition",
			type: "keyword",
		}),
		PO("enum ${name} {\n\t${}\n}", {
			label: "enum",
			detail: "definition",
			type: "keyword",
		}),
	]),
	Gm = new Eh(),
	Nm = new Set([
		"Script",
		"Block",
		"FunctionExpression",
		"FunctionDeclaration",
		"ArrowFunction",
		"MethodDeclaration",
		"ForStatement",
	]);
function Hm(e) {
	return (t, i) => {
		let n = t.node.getChild("VariableDefinition");
		return n && i(n, e), !0;
	};
}
const Fm = ["FunctionDeclaration"],
	Km = {
		FunctionDeclaration: Hm("function"),
		ClassDeclaration: Hm("class"),
		ClassExpression: () => !0,
		EnumDeclaration: Hm("constant"),
		TypeAliasDeclaration: Hm("type"),
		NamespaceDeclaration: Hm("namespace"),
		VariableDefinition(e, t) {
			e.matchContext(Fm) || t(e, "variable");
		},
		TypeDefinition(e, t) {
			t(e, "type");
		},
		__proto__: null,
	};
function Jm(e, t) {
	let i = Gm.get(t);
	if (i) return i;
	let n = [],
		r = !0;
	function s(t, i) {
		let r = e.sliceString(t.from, t.to);
		n.push({ label: r, type: i });
	}
	return (
		t.cursor(xh.IncludeAnonymous).iterate((t) => {
			if (r) r = !1;
			else if (t.name) {
				let e = Km[t.name];
				if ((e && e(t, s)) || Nm.has(t.name)) return !1;
			} else if (t.to - t.from > 8192) {
				for (let i of Jm(e, t.node)) n.push(i);
				return !1;
			}
		}),
		Gm.set(t, n),
		n
	);
}
const eg = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/,
	tg = [
		"TemplateString",
		"String",
		"RegExp",
		"LineComment",
		"BlockComment",
		"VariableDefinition",
		"TypeDefinition",
		"Label",
		"PropertyDefinition",
		"PropertyName",
		"PrivatePropertyDefinition",
		"PrivatePropertyName",
		"JSXText",
		"JSXAttributeValue",
		"JSXOpenTag",
		"JSXCloseTag",
		"JSXSelfClosingTag",
		".",
		"?.",
	];
function ig(e) {
	let t = Xc(e.state).resolveInner(e.pos, -1);
	if (tg.indexOf(t.name) > -1) return null;
	let i =
		"VariableName" == t.name ||
		(t.to - t.from < 20 && eg.test(e.state.sliceDoc(t.from, t.to)));
	if (!i && !e.explicit) return null;
	let n = [];
	for (let i = t; i; i = i.parent)
		Nm.has(i.name) && (n = n.concat(Jm(e.state.doc, i)));
	return { options: n, from: i ? t.from : e.pos, validFor: eg };
}
function ng(e, t, i) {
	var n;
	let r = [];
	for (;;) {
		let s,
			o = t.firstChild;
		if ("VariableName" == (null == o ? void 0 : o.name))
			return r.push(e(o)), { path: r.reverse(), name: i };
		if (
			"MemberExpression" != (null == o ? void 0 : o.name) ||
			"PropertyName" !=
				(null === (n = s = o.lastChild) || void 0 === n ? void 0 : n.name)
		)
			return null;
		r.push(e(s)), (t = o);
	}
}
function rg(e) {
	let t = (t) => e.state.doc.sliceString(t.from, t.to),
		i = Xc(e.state).resolveInner(e.pos, -1);
	return "PropertyName" == i.name
		? ng(t, i.parent, t(i))
		: ("." != i.name && "?." != i.name) || "MemberExpression" != i.parent.name
			? tg.indexOf(i.name) > -1
				? null
				: "VariableName" == i.name || (i.to - i.from < 20 && eg.test(t(i)))
					? { path: [], name: t(i) }
					: "MemberExpression" == i.name
						? ng(t, i, "")
						: e.explicit
							? { path: [], name: "" }
							: null
			: ng(t, i.parent, "");
}
const sg = Tc.define({
		name: "javascript",
		parser: Bm.configure({
			props: [
				Nc.add({
					IfStatement: ru({ except: /^\s*({|else\b)/ }),
					TryStatement: ru({ except: /^\s*({|catch\b|finally\b)/ }),
					LabeledStatement: nu,
					SwitchBody: (e) => {
						let t = e.textAfter,
							i = /^\s*\}/.test(t),
							n = /^\s*(case|default)\b/.test(t);
						return e.baseIndent + (i ? 0 : n ? 1 : 2) * e.unit;
					},
					Block: tu({ closing: "}" }),
					ArrowFunction: (e) => e.baseIndent + e.unit,
					"TemplateString BlockComment": () => null,
					"Statement Property": ru({ except: /^{/ }),
					JSXElement(e) {
						let t = /^\s*<\//.test(e.textAfter);
						return e.lineIndent(e.node.from) + (t ? 0 : e.unit);
					},
					JSXEscape(e) {
						let t = /\s*\}/.test(e.textAfter);
						return e.lineIndent(e.node.from) + (t ? 0 : e.unit);
					},
					"JSXOpenTag JSXSelfClosingTag": (e) => e.column(e.node.from) + e.unit,
				}),
				ou.add({
					"Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType":
						au,
					BlockComment: (e) => ({ from: e.from + 2, to: e.to - 2 }),
				}),
			],
		}),
		languageData: {
			closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
			commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
			indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
			wordChars: "$",
		},
	}),
	og = {
		test: (e) => /^JSX/.test(e.name),
		facet: $c({ commentTokens: { block: { open: "{/*", close: "*/}" } } }),
	},
	ag = sg.configure({ dialect: "ts" }, "typescript"),
	lg = sg.configure({
		dialect: "jsx",
		props: [Pc.add((e) => (e.isTop ? [og] : void 0))],
	}),
	hg = sg.configure(
		{ dialect: "jsx ts", props: [Pc.add((e) => (e.isTop ? [og] : void 0))] },
		"typescript",
	);
let cg = (e) => ({ label: e, type: "keyword" });
const ug =
		"break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield"
			.split(" ")
			.map(cg),
	fg = ug.concat(
		["declare", "implements", "private", "protected", "public"].map(cg),
	);
function Og(e = {}) {
	let t = e.jsx ? (e.typescript ? hg : lg) : e.typescript ? ag : sg,
		i = e.typescript ? Um.concat(fg) : Im.concat(ug);
	return new Wc(t, [
		sg.data.of({ autocomplete: hO(tg, lO(i)) }),
		sg.data.of({ autocomplete: ig }),
		e.jsx ? mg : [],
	]);
}
function dg(e, t, i = e.length) {
	for (let n = null == t ? void 0 : t.firstChild; n; n = n.nextSibling)
		if (
			"JSXIdentifier" == n.name ||
			"JSXBuiltin" == n.name ||
			"JSXNamespacedName" == n.name ||
			"JSXMemberExpression" == n.name
		)
			return e.sliceString(n.from, Math.min(n.to, i));
	return "";
}
const pg =
		"object" == typeof navigator && /Android\b/.test(navigator.userAgent),
	mg = Gl.inputHandler.of((e, t, i, n, r) => {
		if (
			(pg ? e.composing : e.compositionStarted) ||
			e.state.readOnly ||
			t != i ||
			(">" != n && "/" != n) ||
			!sg.isActiveAt(e.state, t, -1)
		)
			return !1;
		let s = r(),
			{ state: o } = s,
			a = o.changeByRange((e) => {
				var t;
				let i,
					{ head: r } = e,
					s = Xc(o).resolveInner(r - 1, -1);
				if (
					("JSXStartTag" == s.name && (s = s.parent),
					o.doc.sliceString(r - 1, r) != n ||
						("JSXAttributeValue" == s.name && s.to > r))
				);
				else {
					if (">" == n && "JSXFragmentTag" == s.name)
						return { range: e, changes: { from: r, insert: "</>" } };
					if ("/" == n && "JSXStartCloseTag" == s.name) {
						let e = s.parent,
							n = e.parent;
						if (
							n &&
							e.from == r - 2 &&
							((i = dg(o.doc, n.firstChild, r)) ||
								"JSXFragmentTag" ==
									(null === (t = n.firstChild) || void 0 === t
										? void 0
										: t.name))
						) {
							let e = `${i}>`;
							return {
								range: _n.cursor(r + e.length, -1),
								changes: { from: r, insert: e },
							};
						}
					} else if (">" == n) {
						let t = (function (e) {
							for (;;) {
								if (
									"JSXOpenTag" == e.name ||
									"JSXSelfClosingTag" == e.name ||
									"JSXFragmentTag" == e.name
								)
									return e;
								if ("JSXEscape" == e.name || !e.parent) return null;
								e = e.parent;
							}
						})(s);
						if (
							t &&
							"JSXOpenTag" == t.name &&
							!/^\/?>|^<\//.test(o.doc.sliceString(r, r + 2)) &&
							(i = dg(o.doc, t, r))
						)
							return { range: e, changes: { from: r, insert: `</${i}>` } };
					}
				}
				return { range: e };
			});
		return (
			!a.changes.empty &&
			(e.dispatch([
				s,
				o.update(a, { userEvent: "input.complete", scrollIntoView: !0 }),
			]),
			!0)
		);
	});
function gg(e, t, i, n) {
	return i.line(e + n.line).from + t + (1 == e ? n.col - 1 : -1);
}
function xg(e, t, i) {
	let n = gg(e.line, e.column, t, i),
		r = {
			from: n,
			to:
				null != e.endLine && 1 != e.endColumn
					? gg(e.endLine, e.endColumn, t, i)
					: n,
			message: e.message,
			source: e.ruleId ? "eslint:" + e.ruleId : "eslint",
			severity: 1 == e.severity ? "warning" : "error",
		};
	if (e.fix) {
		let { range: t, text: s } = e.fix,
			o = t[0] + i.pos - n,
			a = t[1] + i.pos - n;
		r.actions = [
			{
				name: "fix",
				apply(e, t) {
					e.dispatch({
						changes: { from: t + o, to: t + a, insert: s },
						scrollIntoView: !0,
					});
				},
			},
		];
	}
	return r;
}
var bg = Object.freeze({
	__proto__: null,
	autoCloseTags: mg,
	completionPath: rg,
	esLint: function (e, t) {
		return (
			t ||
				((t = {
					parserOptions: { ecmaVersion: 2019, sourceType: "module" },
					env: {
						browser: !0,
						node: !0,
						es6: !0,
						es2015: !0,
						es2017: !0,
						es2020: !0,
					},
					rules: {},
				}),
				e.getRules().forEach((e, i) => {
					e.meta.docs.recommended && (t.rules[i] = 2);
				})),
			(i) => {
				let { state: n } = i,
					r = [];
				for (let { from: i, to: s } of sg.findRegions(n)) {
					let o = n.doc.lineAt(i),
						a = { line: o.number - 1, col: i - o.from, pos: i };
					for (let o of e.verify(n.sliceDoc(i, s), t)) r.push(xg(o, n.doc, a));
				}
				return r;
			}
		);
	},
	javascript: Og,
	javascriptLanguage: sg,
	jsxLanguage: lg,
	localCompletionSource: ig,
	scopeCompletionSource: function (e) {
		let t = new Map();
		return (i) => {
			let n = rg(i);
			if (!n) return null;
			let r = e;
			for (let e of n.path) if (((r = r[e]), !r)) return null;
			let s = t.get(r);
			return (
				s ||
					t.set(
						r,
						(s = (function (e, t) {
							let i = [],
								n = new Set();
							for (let r = 0; ; r++) {
								for (let s of (Object.getOwnPropertyNames || Object.keys)(e)) {
									if (
										!/^[a-zA-Z_$\xaa-\uffdc][\w$\xaa-\uffdc]*$/.test(s) ||
										n.has(s)
									)
										continue;
									let o;
									n.add(s);
									try {
										o = e[s];
									} catch (e) {
										continue;
									}
									i.push({
										label: s,
										type:
											"function" == typeof o
												? /^[A-Z]/.test(s)
													? "class"
													: t
														? "function"
														: "method"
												: t
													? "variable"
													: "property",
										boost: -r,
									});
								}
								let s = Object.getPrototypeOf(e);
								if (!s) return i;
								e = s;
							}
						})(r, !n.path.length)),
					),
				{ from: i.pos - n.name.length, options: s, validFor: eg }
			);
		};
	},
	snippets: Im,
	tsxLanguage: hg,
	typescriptLanguage: ag,
	typescriptSnippets: Um,
});
const Sg = ["_blank", "_self", "_top", "_parent"],
	yg = ["ascii", "utf-8", "utf-16", "latin1", "latin1"],
	Qg = ["get", "post", "put", "delete"],
	wg = [
		"application/x-www-form-urlencoded",
		"multipart/form-data",
		"text/plain",
	],
	kg = ["true", "false"],
	vg = {},
	$g = {
		a: {
			attrs: {
				href: null,
				ping: null,
				type: null,
				media: null,
				target: Sg,
				hreflang: null,
			},
		},
		abbr: vg,
		address: vg,
		area: {
			attrs: {
				alt: null,
				coords: null,
				href: null,
				target: null,
				ping: null,
				media: null,
				hreflang: null,
				type: null,
				shape: ["default", "rect", "circle", "poly"],
			},
		},
		article: vg,
		aside: vg,
		audio: {
			attrs: {
				src: null,
				mediagroup: null,
				crossorigin: ["anonymous", "use-credentials"],
				preload: ["none", "metadata", "auto"],
				autoplay: ["autoplay"],
				loop: ["loop"],
				controls: ["controls"],
			},
		},
		b: vg,
		base: { attrs: { href: null, target: Sg } },
		bdi: vg,
		bdo: vg,
		blockquote: { attrs: { cite: null } },
		body: vg,
		br: vg,
		button: {
			attrs: {
				form: null,
				formaction: null,
				name: null,
				value: null,
				autofocus: ["autofocus"],
				disabled: ["autofocus"],
				formenctype: wg,
				formmethod: Qg,
				formnovalidate: ["novalidate"],
				formtarget: Sg,
				type: ["submit", "reset", "button"],
			},
		},
		canvas: { attrs: { width: null, height: null } },
		caption: vg,
		center: vg,
		cite: vg,
		code: vg,
		col: { attrs: { span: null } },
		colgroup: { attrs: { span: null } },
		command: {
			attrs: {
				type: ["command", "checkbox", "radio"],
				label: null,
				icon: null,
				radiogroup: null,
				command: null,
				title: null,
				disabled: ["disabled"],
				checked: ["checked"],
			},
		},
		data: { attrs: { value: null } },
		datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
		datalist: { attrs: { data: null } },
		dd: vg,
		del: { attrs: { cite: null, datetime: null } },
		details: { attrs: { open: ["open"] } },
		dfn: vg,
		div: vg,
		dl: vg,
		dt: vg,
		em: vg,
		embed: { attrs: { src: null, type: null, width: null, height: null } },
		eventsource: { attrs: { src: null } },
		fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
		figcaption: vg,
		figure: vg,
		footer: vg,
		form: {
			attrs: {
				action: null,
				name: null,
				"accept-charset": yg,
				autocomplete: ["on", "off"],
				enctype: wg,
				method: Qg,
				novalidate: ["novalidate"],
				target: Sg,
			},
		},
		h1: vg,
		h2: vg,
		h3: vg,
		h4: vg,
		h5: vg,
		h6: vg,
		head: {
			children: [
				"title",
				"base",
				"link",
				"style",
				"meta",
				"script",
				"noscript",
				"command",
			],
		},
		header: vg,
		hgroup: vg,
		hr: vg,
		html: { attrs: { manifest: null } },
		i: vg,
		iframe: {
			attrs: {
				src: null,
				srcdoc: null,
				name: null,
				width: null,
				height: null,
				sandbox: [
					"allow-top-navigation",
					"allow-same-origin",
					"allow-forms",
					"allow-scripts",
				],
				seamless: ["seamless"],
			},
		},
		img: {
			attrs: {
				alt: null,
				src: null,
				ismap: null,
				usemap: null,
				width: null,
				height: null,
				crossorigin: ["anonymous", "use-credentials"],
			},
		},
		input: {
			attrs: {
				alt: null,
				dirname: null,
				form: null,
				formaction: null,
				height: null,
				list: null,
				max: null,
				maxlength: null,
				min: null,
				name: null,
				pattern: null,
				placeholder: null,
				size: null,
				src: null,
				step: null,
				value: null,
				width: null,
				accept: ["audio/*", "video/*", "image/*"],
				autocomplete: ["on", "off"],
				autofocus: ["autofocus"],
				checked: ["checked"],
				disabled: ["disabled"],
				formenctype: wg,
				formmethod: Qg,
				formnovalidate: ["novalidate"],
				formtarget: Sg,
				multiple: ["multiple"],
				readonly: ["readonly"],
				required: ["required"],
				type: [
					"hidden",
					"text",
					"search",
					"tel",
					"url",
					"email",
					"password",
					"datetime",
					"date",
					"month",
					"week",
					"time",
					"datetime-local",
					"number",
					"range",
					"color",
					"checkbox",
					"radio",
					"file",
					"submit",
					"image",
					"reset",
					"button",
				],
			},
		},
		ins: { attrs: { cite: null, datetime: null } },
		kbd: vg,
		keygen: {
			attrs: {
				challenge: null,
				form: null,
				name: null,
				autofocus: ["autofocus"],
				disabled: ["disabled"],
				keytype: ["RSA"],
			},
		},
		label: { attrs: { for: null, form: null } },
		legend: vg,
		li: { attrs: { value: null } },
		link: {
			attrs: {
				href: null,
				type: null,
				hreflang: null,
				media: null,
				sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"],
			},
		},
		map: { attrs: { name: null } },
		mark: vg,
		menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
		meta: {
			attrs: {
				content: null,
				charset: yg,
				name: [
					"viewport",
					"application-name",
					"author",
					"description",
					"generator",
					"keywords",
				],
				"http-equiv": [
					"content-language",
					"content-type",
					"default-style",
					"refresh",
				],
			},
		},
		meter: {
			attrs: {
				value: null,
				min: null,
				low: null,
				high: null,
				max: null,
				optimum: null,
			},
		},
		nav: vg,
		noscript: vg,
		object: {
			attrs: {
				data: null,
				type: null,
				name: null,
				usemap: null,
				form: null,
				width: null,
				height: null,
				typemustmatch: ["typemustmatch"],
			},
		},
		ol: {
			attrs: {
				reversed: ["reversed"],
				start: null,
				type: ["1", "a", "A", "i", "I"],
			},
			children: ["li", "script", "template", "ul", "ol"],
		},
		optgroup: { attrs: { disabled: ["disabled"], label: null } },
		option: {
			attrs: {
				disabled: ["disabled"],
				label: null,
				selected: ["selected"],
				value: null,
			},
		},
		output: { attrs: { for: null, form: null, name: null } },
		p: vg,
		param: { attrs: { name: null, value: null } },
		pre: vg,
		progress: { attrs: { value: null, max: null } },
		q: { attrs: { cite: null } },
		rp: vg,
		rt: vg,
		ruby: vg,
		samp: vg,
		script: {
			attrs: {
				type: ["text/javascript"],
				src: null,
				async: ["async"],
				defer: ["defer"],
				charset: yg,
			},
		},
		section: vg,
		select: {
			attrs: {
				form: null,
				name: null,
				size: null,
				autofocus: ["autofocus"],
				disabled: ["disabled"],
				multiple: ["multiple"],
			},
		},
		slot: { attrs: { name: null } },
		small: vg,
		source: { attrs: { src: null, type: null, media: null } },
		span: vg,
		strong: vg,
		style: { attrs: { type: ["text/css"], media: null, scoped: null } },
		sub: vg,
		summary: vg,
		sup: vg,
		table: vg,
		tbody: vg,
		td: { attrs: { colspan: null, rowspan: null, headers: null } },
		template: vg,
		textarea: {
			attrs: {
				dirname: null,
				form: null,
				maxlength: null,
				name: null,
				placeholder: null,
				rows: null,
				cols: null,
				autofocus: ["autofocus"],
				disabled: ["disabled"],
				readonly: ["readonly"],
				required: ["required"],
				wrap: ["soft", "hard"],
			},
		},
		tfoot: vg,
		th: {
			attrs: {
				colspan: null,
				rowspan: null,
				headers: null,
				scope: ["row", "col", "rowgroup", "colgroup"],
			},
		},
		thead: vg,
		time: { attrs: { datetime: null } },
		title: vg,
		tr: vg,
		track: {
			attrs: {
				src: null,
				label: null,
				default: null,
				kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
				srclang: null,
			},
		},
		ul: { children: ["li", "script", "template", "ul", "ol"] },
		var: vg,
		video: {
			attrs: {
				src: null,
				poster: null,
				width: null,
				height: null,
				crossorigin: ["anonymous", "use-credentials"],
				preload: ["auto", "metadata", "none"],
				autoplay: ["autoplay"],
				mediagroup: ["movie"],
				muted: ["muted"],
				controls: ["controls"],
			},
		},
		wbr: vg,
	},
	Pg = {
		accesskey: null,
		class: null,
		contenteditable: kg,
		contextmenu: null,
		dir: ["ltr", "rtl", "auto"],
		draggable: ["true", "false", "auto"],
		dropzone: ["copy", "move", "link", "string:", "file:"],
		hidden: ["hidden"],
		id: null,
		inert: ["inert"],
		itemid: null,
		itemprop: null,
		itemref: null,
		itemscope: ["itemscope"],
		itemtype: null,
		lang: [
			"ar",
			"bn",
			"de",
			"en-GB",
			"en-US",
			"es",
			"fr",
			"hi",
			"id",
			"ja",
			"pa",
			"pt",
			"ru",
			"tr",
			"zh",
		],
		spellcheck: kg,
		autocorrect: kg,
		autocapitalize: kg,
		style: null,
		tabindex: null,
		title: null,
		translate: ["yes", "no"],
		rel: [
			"stylesheet",
			"alternate",
			"author",
			"bookmark",
			"help",
			"license",
			"next",
			"nofollow",
			"noreferrer",
			"prefetch",
			"prev",
			"search",
			"tag",
		],
		role: "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(
			" ",
		),
		"aria-activedescendant": null,
		"aria-atomic": kg,
		"aria-autocomplete": ["inline", "list", "both", "none"],
		"aria-busy": kg,
		"aria-checked": ["true", "false", "mixed", "undefined"],
		"aria-controls": null,
		"aria-describedby": null,
		"aria-disabled": kg,
		"aria-dropeffect": null,
		"aria-expanded": ["true", "false", "undefined"],
		"aria-flowto": null,
		"aria-grabbed": ["true", "false", "undefined"],
		"aria-haspopup": kg,
		"aria-hidden": kg,
		"aria-invalid": ["true", "false", "grammar", "spelling"],
		"aria-label": null,
		"aria-labelledby": null,
		"aria-level": null,
		"aria-live": ["off", "polite", "assertive"],
		"aria-multiline": kg,
		"aria-multiselectable": kg,
		"aria-owns": null,
		"aria-posinset": null,
		"aria-pressed": ["true", "false", "mixed", "undefined"],
		"aria-readonly": kg,
		"aria-relevant": null,
		"aria-required": kg,
		"aria-selected": ["true", "false", "undefined"],
		"aria-setsize": null,
		"aria-sort": ["ascending", "descending", "none", "other"],
		"aria-valuemax": null,
		"aria-valuemin": null,
		"aria-valuenow": null,
		"aria-valuetext": null,
	},
	Zg =
		"beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload"
			.split(" ")
			.map((e) => "on" + e);
for (let e of Zg) Pg[e] = null;
class _g {
	constructor(e, t) {
		(this.tags = Object.assign(Object.assign({}, $g), e)),
			(this.globalAttrs = Object.assign(Object.assign({}, Pg), t)),
			(this.allTags = Object.keys(this.tags)),
			(this.globalAttrNames = Object.keys(this.globalAttrs));
	}
}
function Tg(e, t, i = e.length) {
	if (!t) return "";
	let n = t.firstChild,
		r = n && n.getChild("TagName");
	return r ? e.sliceString(r.from, Math.min(r.to, i)) : "";
}
function Xg(e, t = !1) {
	for (; e; e = e.parent)
		if ("Element" == e.name) {
			if (!t) return e;
			t = !1;
		}
	return null;
}
function Ag(e, t, i) {
	let n = i.tags[Tg(e, Xg(t))];
	return (null == n ? void 0 : n.children) || i.allTags;
}
function Cg(e, t) {
	let i = [];
	for (let n = Xg(t); n && !n.type.isTop; n = Xg(n.parent)) {
		let r = Tg(e, n);
		if (r && "CloseTag" == n.lastChild.name) break;
		r &&
			i.indexOf(r) < 0 &&
			("EndTag" == t.name || t.from >= n.firstChild.to) &&
			i.push(r);
	}
	return i;
}
_g.default = new _g();
const Rg = /^[:\-\.\w\u00b7-\uffff]*$/;
function Mg(e, t, i, n, r) {
	let s = /\s*>/.test(e.sliceDoc(r, r + 5)) ? "" : ">",
		o = Xg(i, !0);
	return {
		from: n,
		to: r,
		options: Ag(e.doc, o, t)
			.map((e) => ({ label: e, type: "type" }))
			.concat(
				Cg(e.doc, i).map((e, t) => ({
					label: "/" + e,
					apply: "/" + e + s,
					type: "type",
					boost: 99 - t,
				})),
			),
		validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/,
	};
}
function jg(e, t, i, n) {
	let r = /\s*>/.test(e.sliceDoc(n, n + 5)) ? "" : ">";
	return {
		from: i,
		to: n,
		options: Cg(e.doc, t).map((e, t) => ({
			label: e,
			apply: e + r,
			type: "type",
			boost: 99 - t,
		})),
		validFor: Rg,
	};
}
function Eg(e, t) {
	let { state: i, pos: n } = t,
		r = Xc(i).resolveInner(n, -1),
		s = r.resolve(n);
	for (let e, t = n; s == r && (e = r.childBefore(t)); ) {
		let i = e.lastChild;
		if (!i || !i.type.isError || i.from < i.to) break;
		(s = r = e), (t = i.from);
	}
	return "TagName" == r.name
		? r.parent && /CloseTag$/.test(r.parent.name)
			? jg(i, r, r.from, n)
			: Mg(i, e, r, r.from, n)
		: "StartTag" == r.name
			? Mg(i, e, r, n, n)
			: "StartCloseTag" == r.name || "IncompleteCloseTag" == r.name
				? jg(i, r, n, n)
				: "OpenTag" == r.name ||
						"SelfClosingTag" == r.name ||
						"AttributeName" == r.name
					? (function (e, t, i, n, r) {
							let s = Xg(i),
								o = s ? t.tags[Tg(e.doc, s)] : null,
								a = o && o.attrs ? Object.keys(o.attrs) : [];
							return {
								from: n,
								to: r,
								options: (o && !1 === o.globalAttrs
									? a
									: a.length
										? a.concat(t.globalAttrNames)
										: t.globalAttrNames
								).map((e) => ({ label: e, type: "property" })),
								validFor: Rg,
							};
						})(i, e, r, "AttributeName" == r.name ? r.from : n, n)
					: "Is" == r.name ||
							"AttributeValue" == r.name ||
							"UnquotedAttributeValue" == r.name
						? (function (e, t, i, n, r) {
								var s;
								let o,
									a =
										null === (s = i.parent) || void 0 === s
											? void 0
											: s.getChild("AttributeName"),
									l = [];
								if (a) {
									let s = e.sliceDoc(a.from, a.to),
										h = t.globalAttrs[s];
									if (!h) {
										let n = Xg(i),
											r = n ? t.tags[Tg(e.doc, n)] : null;
										h = (null == r ? void 0 : r.attrs) && r.attrs[s];
									}
									if (h) {
										let t = e.sliceDoc(n, r).toLowerCase(),
											i = '"',
											s = '"';
										/^['"]/.test(t)
											? ((o = '"' == t[0] ? /^[^"]*$/ : /^[^']*$/),
												(i = ""),
												(s = e.sliceDoc(r, r + 1) == t[0] ? "" : t[0]),
												(t = t.slice(1)),
												n++)
											: (o = /^[^\s<>='"]*$/);
										for (let e of h)
											l.push({ label: e, apply: i + e + s, type: "constant" });
									}
								}
								return { from: n, to: r, options: l, validFor: o };
							})(i, e, r, "Is" == r.name ? n : r.from, n)
						: !t.explicit ||
								("Element" != s.name &&
									"Text" != s.name &&
									"Document" != s.name)
							? null
							: (function (e, t, i, n) {
									let r = [],
										s = 0;
									for (let n of Ag(e.doc, i, t))
										r.push({ label: "<" + n, type: "type" });
									for (let t of Cg(e.doc, i))
										r.push({
											label: "</" + t + ">",
											type: "type",
											boost: 99 - s++,
										});
									return {
										from: n,
										to: n,
										options: r,
										validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/,
									};
								})(i, e, r, n);
}
function qg(e) {
	return Eg(_g.default, e);
}
function Vg(e) {
	let { extraTags: t, extraGlobalAttributes: i } = e,
		n = i || t ? new _g(t, i) : _g.default;
	return (e) => Eg(n, e);
}
const Lg = sg.parser.configure({ top: "SingleExpression" }),
	Wg = [
		{
			tag: "script",
			attrs: (e) => "text/typescript" == e.type || "ts" == e.lang,
			parser: ag.parser,
		},
		{
			tag: "script",
			attrs: (e) => "text/babel" == e.type || "text/jsx" == e.type,
			parser: lg.parser,
		},
		{
			tag: "script",
			attrs: (e) => "text/typescript-jsx" == e.type,
			parser: hg.parser,
		},
		{
			tag: "script",
			attrs: (e) =>
				/^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(e.type),
			parser: Lg,
		},
		{
			tag: "script",
			attrs: (e) =>
				!e.type ||
				/^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(
					e.type,
				),
			parser: sg.parser,
		},
		{
			tag: "style",
			attrs: (e) =>
				(!e.lang || "css" == e.lang) &&
				(!e.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(e.type)),
			parser: Tm.parser,
		},
	],
	zg = [
		{ name: "style", parser: Tm.parser.configure({ top: "Styles" }) },
	].concat(Zg.map((e) => ({ name: e, parser: sg.parser }))),
	Yg = Tc.define({
		name: "html",
		parser: em.configure({
			props: [
				Nc.add({
					Element(e) {
						let t = /^(\s*)(<\/)?/.exec(e.textAfter);
						return e.node.to <= e.pos + t[0].length
							? e.continue()
							: e.lineIndent(e.node.from) + (t[2] ? 0 : e.unit);
					},
					"OpenTag CloseTag SelfClosingTag": (e) =>
						e.column(e.node.from) + e.unit,
					Document(e) {
						if (e.pos + /\s*/.exec(e.textAfter)[0].length < e.node.to)
							return e.continue();
						let t,
							i = null;
						for (let t = e.node; ; ) {
							let e = t.lastChild;
							if (!e || "Element" != e.name || e.to != t.to) break;
							i = t = e;
						}
						return i &&
							(!(t = i.lastChild) ||
								("CloseTag" != t.name && "SelfClosingTag" != t.name))
							? e.lineIndent(i.from) + e.unit
							: null;
					},
				}),
				ou.add({
					Element(e) {
						let t = e.firstChild,
							i = e.lastChild;
						return t && "OpenTag" == t.name
							? { from: t.to, to: "CloseTag" == i.name ? i.from : e.to }
							: null;
					},
				}),
				lu.add({ "OpenTag CloseTag": (e) => e.getChild("TagName") }),
			],
		}),
		languageData: {
			commentTokens: { block: { open: "\x3c!--", close: "--\x3e" } },
			indentOnInput: /^\s*<\/\w+\W$/,
			wordChars: "-._",
		},
	}),
	Dg = Yg.configure({ wrap: rm(Wg, zg) });
function Bg(e = {}) {
	let t,
		i = "";
	!1 === e.matchClosingTags && (i = "noMatch"),
		!0 === e.selfClosingTags && (i = (i ? i + " " : "") + "selfClosing"),
		((e.nestedLanguages && e.nestedLanguages.length) ||
			(e.nestedAttributes && e.nestedAttributes.length)) &&
			(t = rm(
				(e.nestedLanguages || []).concat(Wg),
				(e.nestedAttributes || []).concat(zg),
			));
	let n = t
		? Yg.configure({ wrap: t, dialect: i })
		: i
			? Dg.configure({ dialect: i })
			: Dg;
	return new Wc(n, [
		Dg.data.of({ autocomplete: Vg(e) }),
		!1 !== e.autoCloseTags ? Ug : [],
		Og().support,
		Xm().support,
	]);
}
const Ig = new Set(
		"area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(
			" ",
		),
	),
	Ug = Gl.inputHandler.of((e, t, i, n, r) => {
		if (
			e.composing ||
			e.state.readOnly ||
			t != i ||
			(">" != n && "/" != n) ||
			!Dg.isActiveAt(e.state, t, -1)
		)
			return !1;
		let s = r(),
			{ state: o } = s,
			a = o.changeByRange((e) => {
				var t, i, r;
				let s,
					a = o.doc.sliceString(e.from - 1, e.to) == n,
					{ head: l } = e,
					h = Xc(o).resolveInner(l, -1);
				if (a && ">" == n && "EndTag" == h.name) {
					let n = h.parent;
					if (
						"CloseTag" !=
							(null ===
								(i =
									null === (t = n.parent) || void 0 === t
										? void 0
										: t.lastChild) || void 0 === i
								? void 0
								: i.name) &&
						(s = Tg(o.doc, n.parent, l)) &&
						!Ig.has(s)
					) {
						return {
							range: e,
							changes: {
								from: l,
								to: l + (">" === o.doc.sliceString(l, l + 1) ? 1 : 0),
								insert: `</${s}>`,
							},
						};
					}
				} else if (a && "/" == n && "IncompleteCloseTag" == h.name) {
					let e = h.parent;
					if (
						h.from == l - 2 &&
						"CloseTag" !=
							(null === (r = e.lastChild) || void 0 === r ? void 0 : r.name) &&
						(s = Tg(o.doc, e, l)) &&
						!Ig.has(s)
					) {
						let e = l + (">" === o.doc.sliceString(l, l + 1) ? 1 : 0),
							t = `${s}>`;
						return {
							range: _n.cursor(l + t.length, -1),
							changes: { from: l, to: e, insert: t },
						};
					}
				}
				return { range: e };
			});
		return (
			!a.changes.empty &&
			(e.dispatch([
				s,
				o.update(a, { userEvent: "input.complete", scrollIntoView: !0 }),
			]),
			!0)
		);
	});
var Gg = Object.freeze({
	__proto__: null,
	autoCloseTags: Ug,
	html: Bg,
	htmlCompletionSource: qg,
	htmlCompletionSourceWith: Vg,
	htmlLanguage: Dg,
	htmlPlain: Yg,
});
const Ng = $c({
		commentTokens: { block: { open: "\x3c!--", close: "--\x3e" } },
	}),
	Hg = new uh(),
	Fg = Ed.configure({
		props: [
			ou.add((e) =>
				!e.is("Block") ||
				e.is("Document") ||
				null != Kg(e) ||
				(function (e) {
					return "OrderedList" == e.name || "BulletList" == e.name;
				})(e)
					? void 0
					: (e, t) => ({ from: t.doc.lineAt(e.from).to, to: e.to }),
			),
			Hg.add(Kg),
			Nc.add({ Document: () => null }),
			vc.add({ Document: Ng }),
		],
	});
function Kg(e) {
	let t = /^(?:ATX|Setext)Heading(\d)$/.exec(e.name);
	return t ? +t[1] : void 0;
}
function Jg(e, t) {
	let i = e;
	for (;;) {
		let e,
			n = i.nextSibling;
		if (!n || (null != (e = Kg(n.type)) && e <= t)) break;
		i = n;
	}
	return i.to;
}
const ex = su.of((e, t, i) => {
	for (let n = Xc(e).resolveInner(i, -1); n && !(n.from < t); n = n.parent) {
		let e = n.type.prop(Hg);
		if (null == e) continue;
		let t = Jg(n, e);
		if (t > i) return { from: i, to: t };
	}
	return null;
});
function tx(e) {
	return new Zc(Ng, e, [ex], "markdown");
}
const ix = tx(Fg),
	nx = tx(
		Fg.configure([
			tp,
			rp,
			np,
			sp,
			{
				props: [
					ou.add({
						Table: (e, t) => ({ from: t.doc.lineAt(e.from).to, to: e.to }),
					}),
				],
			},
		]),
	);
class rx {
	constructor(e, t, i, n, r, s, o) {
		(this.node = e),
			(this.from = t),
			(this.to = i),
			(this.spaceBefore = n),
			(this.spaceAfter = r),
			(this.type = s),
			(this.item = o);
	}
	blank(e, t = !0) {
		let i = this.spaceBefore + ("Blockquote" == this.node.name ? ">" : "");
		if (null != e) {
			for (; i.length < e; ) i += " ";
			return i;
		}
		for (
			let e = this.to - this.from - i.length - this.spaceAfter.length;
			e > 0;
			e--
		)
			i += " ";
		return i + (t ? this.spaceAfter : "");
	}
	marker(e, t) {
		let i =
			"OrderedList" == this.node.name ? String(+ox(this.item, e)[2] + t) : "";
		return this.spaceBefore + i + this.type + this.spaceAfter;
	}
}
function sx(e, t) {
	let i = [],
		n = [];
	for (let t = e; t; t = t.parent) {
		if ("FencedCode" == t.name) return n;
		("ListItem" != t.name && "Blockquote" != t.name) || i.push(t);
	}
	for (let e = i.length - 1; e >= 0; e--) {
		let r,
			s = i[e],
			o = t.lineAt(s.from),
			a = s.from - o.from;
		if ("Blockquote" == s.name && (r = /^ *>( ?)/.exec(o.text.slice(a))))
			n.push(new rx(s, a, a + r[0].length, "", r[1], ">", null));
		else if (
			"ListItem" == s.name &&
			"OrderedList" == s.parent.name &&
			(r = /^( *)\d+([.)])( *)/.exec(o.text.slice(a)))
		) {
			let e = r[3],
				t = r[0].length;
			e.length >= 4 && ((e = e.slice(0, e.length - 4)), (t -= 4)),
				n.push(new rx(s.parent, a, a + t, r[1], e, r[2], s));
		} else if (
			"ListItem" == s.name &&
			"BulletList" == s.parent.name &&
			(r = /^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(o.text.slice(a)))
		) {
			let e = r[4],
				t = r[0].length;
			e.length > 4 && ((e = e.slice(0, e.length - 4)), (t -= 4));
			let i = r[2];
			r[3] && (i += r[3].replace(/[xX]/, " ")),
				n.push(new rx(s.parent, a, a + t, r[1], e, i, s));
		}
	}
	return n;
}
function ox(e, t) {
	return /^(\s*)(\d+)(?=[.)])/.exec(t.sliceString(e.from, e.from + 10));
}
function ax(e, t, i, n = 0) {
	for (let r = -1, s = e; ; ) {
		if ("ListItem" == s.name) {
			let e = ox(s, t),
				o = +e[2];
			if (r >= 0) {
				if (o != r + 1) return;
				i.push({
					from: s.from + e[1].length,
					to: s.from + e[0].length,
					insert: String(r + 2 + n),
				});
			}
			r = o;
		}
		let e = s.nextSibling;
		if (!e) break;
		s = e;
	}
}
function lx(e, t) {
	let i = /^[ \t]*/.exec(e)[0].length;
	if (!i || "\t" != t.facet(Dc)) return e;
	let n = "";
	for (let t = Er(e, 4, i); t > 0; )
		t >= 4 ? ((n += "\t"), (t -= 4)) : ((n += " "), t--);
	return n + e.slice(i);
}
const hx = ({ state: e, dispatch: t }) => {
	let i = Xc(e),
		{ doc: n } = e,
		r = null,
		s = e.changeByRange((t) => {
			if (!t.empty || !nx.isActiveAt(e, t.from, 0)) return (r = { range: t });
			let s = t.from,
				o = n.lineAt(s),
				a = sx(i.resolveInner(s, -1), n);
			for (; a.length && a[a.length - 1].from > s - o.from; ) a.pop();
			if (!a.length) return (r = { range: t });
			let l = a[a.length - 1];
			if (l.to - l.spaceAfter.length > s - o.from) return (r = { range: t });
			let h = s >= l.to - l.spaceAfter.length && !/\S/.test(o.text.slice(l.to));
			if (l.item && h) {
				let t = l.node.firstChild,
					i = l.node.getChild("ListItem", "ListItem");
				if (
					t.to >= s ||
					(i && i.to < s) ||
					(o.from > 0 && !/[^\s>]/.test(n.lineAt(o.from - 1).text))
				) {
					let e,
						t = a.length > 1 ? a[a.length - 2] : null,
						i = "";
					t && t.item
						? ((e = o.from + t.from), (i = t.marker(n, 1)))
						: (e = o.from + (t ? t.to : 0));
					let r = [{ from: e, to: s, insert: i }];
					return (
						"OrderedList" == l.node.name && ax(l.item, n, r, -2),
						t && "OrderedList" == t.node.name && ax(t.item, n, r),
						{ range: _n.cursor(e + i.length), changes: r }
					);
				}
				{
					let t = ux(a, e, o);
					return {
						range: _n.cursor(s + t.length + 1),
						changes: { from: o.from, insert: t + e.lineBreak },
					};
				}
			}
			if ("Blockquote" == l.node.name && h && o.from) {
				let i = n.lineAt(o.from - 1),
					r = />\s*$/.exec(i.text);
				if (r && r.index == l.from) {
					let n = e.changes([
						{ from: i.from + r.index, to: i.to },
						{ from: o.from + l.from, to: o.to },
					]);
					return { range: t.map(n), changes: n };
				}
			}
			let c = [];
			"OrderedList" == l.node.name && ax(l.item, n, c);
			let u = l.item && l.item.from < o.from,
				f = "";
			if (!u || /^[\s\d.)\-+*>]*/.exec(o.text)[0].length >= l.to)
				for (let e = 0, t = a.length - 1; e <= t; e++)
					f +=
						e != t || u
							? a[e].blank(
									e < t ? Er(o.text, 4, a[e + 1].from) - f.length : null,
								)
							: a[e].marker(n, 1);
			let O = s;
			for (; O > o.from && /\s/.test(o.text.charAt(O - o.from - 1)); ) O--;
			return (
				(f = lx(f, e)),
				(function (e, t) {
					if ("OrderedList" != e.name && "BulletList" != e.name) return !1;
					let i = e.firstChild,
						n = e.getChild("ListItem", "ListItem");
					if (!n) return !1;
					let r = t.lineAt(i.to),
						s = t.lineAt(n.from),
						o = /^[\s>]*$/.test(r.text);
					return r.number + (o ? 0 : 1) < s.number;
				})(l.node, e.doc) && (f = ux(a, e, o) + e.lineBreak + f),
				c.push({ from: O, to: s, insert: e.lineBreak + f }),
				{ range: _n.cursor(O + f.length + 1), changes: c }
			);
		});
	return !r && (t(e.update(s, { scrollIntoView: !0, userEvent: "input" })), !0);
};
function cx(e) {
	return "QuoteMark" == e.name || "ListMark" == e.name;
}
function ux(e, t, i) {
	let n = "";
	for (let t = 0, r = e.length - 2; t <= r; t++)
		n += e[t].blank(
			t < r
				? Er(i.text, 4, Math.min(i.text.length, e[t + 1].from)) - n.length
				: null,
			t < r,
		);
	return lx(n, t);
}
const fx = ({ state: e, dispatch: t }) => {
		let i = Xc(e),
			n = null,
			r = e.changeByRange((t) => {
				let r = t.from,
					{ doc: s } = e;
				if (t.empty && nx.isActiveAt(e, t.from)) {
					let t = s.lineAt(r),
						n = sx(
							(function (e, t) {
								let i = e.resolveInner(t, -1),
									n = t;
								cx(i) && ((n = i.from), (i = i.parent));
								for (let e; (e = i.childBefore(n)); )
									if (cx(e)) n = e.from;
									else {
										if ("OrderedList" != e.name && "BulletList" != e.name)
											break;
										(i = e.lastChild), (n = i.to);
									}
								return i;
							})(i, r),
							s,
						);
					if (n.length) {
						let i = n[n.length - 1],
							s = i.to - i.spaceAfter.length + (i.spaceAfter ? 1 : 0);
						if (r - t.from > s && !/\S/.test(t.text.slice(s, r - t.from)))
							return {
								range: _n.cursor(t.from + s),
								changes: { from: t.from + s, to: r },
							};
						if (
							r - t.from == s &&
							(!i.item ||
								t.from <= i.item.from ||
								!/\S/.test(t.text.slice(0, i.to)))
						) {
							let n = t.from + i.from;
							if (
								i.item &&
								i.node.from < i.item.from &&
								/\S/.test(t.text.slice(i.from, i.to))
							) {
								let r = i.blank(Er(t.text, 4, i.to) - Er(t.text, 4, i.from));
								return (
									n == t.from && (r = lx(r, e)),
									{
										range: _n.cursor(n + r.length),
										changes: { from: n, to: t.from + i.to, insert: r },
									}
								);
							}
							if (n < r)
								return { range: _n.cursor(n), changes: { from: n, to: r } };
						}
					}
				}
				return (n = { range: t });
			});
		return (
			!n && (t(e.update(r, { scrollIntoView: !0, userEvent: "delete" })), !0)
		);
	},
	Ox = [
		{ key: "Enter", run: hx },
		{ key: "Backspace", run: fx },
	],
	dx = Bg({ matchClosingTags: !1 });
function px(e = {}) {
	let {
		codeLanguages: t,
		defaultCodeLanguage: i,
		addKeymap: n = !0,
		base: { parser: r } = ix,
		completeHTMLTags: s = !0,
		htmlTagLanguage: o = dx,
	} = e;
	if (!(r instanceof hd))
		throw new RangeError(
			"Base parser provided to `markdown` should be a Markdown parser",
		);
	let a,
		l = e.extensions ? [e.extensions] : [],
		h = [o.support];
	i instanceof Wc ? (h.push(i.support), (a = i.language)) : i && (a = i);
	let c =
		t || a
			? (function (e, t) {
					return (i) => {
						if (i && e) {
							let t = null;
							if (
								((i = /\S*/.exec(i)[0]),
								(t =
									"function" == typeof e
										? e(i)
										: zc.matchLanguageName(e, i, !0)),
								t instanceof zc)
							)
								return t.support
									? t.support.language.parser
									: Rc.getSkippingParser(t.load());
							if (t) return t.parser;
						}
						return t ? t.parser : null;
					};
				})(t, a)
			: void 0;
	l.push(
		(function (e) {
			let { codeParser: t, htmlParser: i } = e,
				n = Wh((e, n) => {
					let r = e.type.id;
					if (!t || (r != XO.CodeBlock && r != XO.FencedCode)) {
						if (i && (r == XO.HTMLBlock || r == XO.HTMLTag))
							return { parser: i, overlay: qd(e.node, e.from, e.to) };
					} else {
						let i = "";
						if (r == XO.FencedCode) {
							let t = e.node.getChild(XO.CodeInfo);
							t && (i = n.read(t.from, t.to));
						}
						let s = t(i);
						if (s)
							return { parser: s, overlay: (e) => e.type.id == XO.CodeText };
					}
					return null;
				});
			return { wrap: n };
		})({ codeParser: c, htmlParser: o.language.parser }),
	),
		n && h.push(Bn.high(ih.of(Ox)));
	let u = tx(r.configure(l));
	return s && h.push(u.data.of({ autocomplete: mx })), new Wc(u, h);
}
function mx(e) {
	let { state: t, pos: i } = e,
		n = /<[:\-\.\w\u00b7-\uffff]*$/.exec(t.sliceDoc(i - 25, i));
	if (!n) return null;
	let r = Xc(t).resolveInner(i, -1);
	for (; r && !r.type.isTop; ) {
		if (
			"CodeBlock" == r.name ||
			"FencedCode" == r.name ||
			"ProcessingInstructionBlock" == r.name ||
			"CommentBlock" == r.name ||
			"Link" == r.name ||
			"Image" == r.name
		)
			return null;
		r = r.parent;
	}
	return {
		from: i - n[0].length,
		to: i,
		options: xx(),
		validFor: /^<[:\-\.\w\u00b7-\uffff]*$/,
	};
}
let gx = null;
function xx() {
	if (gx) return gx;
	let e = qg(new oO(Sr.create({ extensions: dx }), 0, !0));
	return (gx = e ? e.options : []);
}
var bx = Object.freeze({
	__proto__: null,
	commonmarkLanguage: ix,
	deleteMarkupBackward: fx,
	insertNewlineContinueMarkup: hx,
	markdown: px,
	markdownKeymap: Ox,
	markdownLanguage: nx,
});
function Sx(e) {
	return new Wc(gu.define(e));
}
function yx(e) {
	return import("./index-B19sumLU.js").then((t) => t.sql({ dialect: t[e] }));
}
const Qx = [
		zc.of({
			name: "C",
			extensions: ["c", "h", "ino"],
			load: () => import("./index-Bt7bS9W8.js").then((e) => e.cpp()),
		}),
		zc.of({
			name: "C++",
			alias: ["cpp"],
			extensions: ["cpp", "c++", "cc", "cxx", "hpp", "h++", "hh", "hxx"],
			load: () => import("./index-Bt7bS9W8.js").then((e) => e.cpp()),
		}),
		zc.of({
			name: "CQL",
			alias: ["cassandra"],
			extensions: ["cql"],
			load: () => yx("Cassandra"),
		}),
		zc.of({
			name: "CSS",
			extensions: ["css"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return Am;
					})
					.then((e) => e.css()),
		}),
		zc.of({
			name: "Go",
			extensions: ["go"],
			load: () => import("./index-BLdv8lfJ.js").then((e) => e.go()),
		}),
		zc.of({
			name: "HTML",
			alias: ["xhtml"],
			extensions: ["html", "htm", "handlebars", "hbs"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return Gg;
					})
					.then((e) => e.html()),
		}),
		zc.of({
			name: "Java",
			extensions: ["java"],
			load: () => import("./index-DhKuS5vL.js").then((e) => e.java()),
		}),
		zc.of({
			name: "JavaScript",
			alias: ["ecmascript", "js", "node"],
			extensions: ["js", "mjs", "cjs"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return bg;
					})
					.then((e) => e.javascript()),
		}),
		zc.of({
			name: "JSON",
			alias: ["json5"],
			extensions: ["json", "map"],
			load: () => import("./index-DwsV61hG.js").then((e) => e.json()),
		}),
		zc.of({
			name: "JSX",
			extensions: ["jsx"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return bg;
					})
					.then((e) => e.javascript({ jsx: !0 })),
		}),
		zc.of({
			name: "LESS",
			extensions: ["less"],
			load: () => import("./index-B6TLJmDl.js").then((e) => e.less()),
		}),
		zc.of({
			name: "Liquid",
			extensions: ["liquid"],
			load: () => import("./index-m-Rnv8zM.js").then((e) => e.liquid()),
		}),
		zc.of({ name: "MariaDB SQL", load: () => yx("MariaSQL") }),
		zc.of({
			name: "Markdown",
			extensions: ["md", "markdown", "mkd"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return bx;
					})
					.then((e) => e.markdown()),
		}),
		zc.of({ name: "MS SQL", load: () => yx("MSSQL") }),
		zc.of({ name: "MySQL", load: () => yx("MySQL") }),
		zc.of({
			name: "PHP",
			extensions: ["php", "php3", "php4", "php5", "php7", "phtml"],
			load: () => import("./index-D3wmIe5a.js").then((e) => e.php()),
		}),
		zc.of({ name: "PLSQL", extensions: ["pls"], load: () => yx("PLSQL") }),
		zc.of({ name: "PostgreSQL", load: () => yx("PostgreSQL") }),
		zc.of({
			name: "Python",
			extensions: ["BUILD", "bzl", "py", "pyw"],
			filename: /^(BUCK|BUILD)$/,
			load: () => import("./index-CD42zNkN.js").then((e) => e.python()),
		}),
		zc.of({
			name: "Rust",
			extensions: ["rs"],
			load: () => import("./index-CJr6KJQn.js").then((e) => e.rust()),
		}),
		zc.of({
			name: "Sass",
			extensions: ["sass"],
			load: () =>
				import("./index-BjRIpReO.js").then((e) => e.sass({ indented: !0 })),
		}),
		zc.of({
			name: "SCSS",
			extensions: ["scss"],
			load: () => import("./index-BjRIpReO.js").then((e) => e.sass()),
		}),
		zc.of({ name: "SQL", extensions: ["sql"], load: () => yx("StandardSQL") }),
		zc.of({ name: "SQLite", load: () => yx("SQLite") }),
		zc.of({
			name: "TSX",
			extensions: ["tsx"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return bg;
					})
					.then((e) => e.javascript({ jsx: !0, typescript: !0 })),
		}),
		zc.of({
			name: "TypeScript",
			alias: ["ts"],
			extensions: ["ts", "mts", "cts"],
			load: () =>
				Promise.resolve()
					.then(function () {
						return bg;
					})
					.then((e) => e.javascript({ typescript: !0 })),
		}),
		zc.of({
			name: "WebAssembly",
			extensions: ["wat", "wast"],
			load: () => import("./index-ChkGGMAK.js").then((e) => e.wast()),
		}),
		zc.of({
			name: "XML",
			alias: ["rss", "wsdl", "xsd"],
			extensions: ["xml", "xsl", "xsd", "svg"],
			load: () => import("./index-qPg-TU1M.js").then((e) => e.xml()),
		}),
		zc.of({
			name: "YAML",
			alias: ["yml"],
			extensions: ["yaml", "yml"],
			load: () => import("./index-D1fculzo.js").then((e) => e.yaml()),
		}),
		zc.of({
			name: "APL",
			extensions: ["dyalog", "apl"],
			load: () => import("./apl-CXdQSnD-.js").then((e) => Sx(e.apl)),
		}),
		zc.of({
			name: "PGP",
			alias: ["asciiarmor"],
			extensions: ["asc", "pgp", "sig"],
			load: () =>
				import("./asciiarmor-D5V0T9Cu.js").then((e) => Sx(e.asciiArmor)),
		}),
		zc.of({
			name: "ASN.1",
			extensions: ["asn", "asn1"],
			load: () => import("./asn1-DWPaVWf6.js").then((e) => Sx(e.asn1({}))),
		}),
		zc.of({
			name: "Asterisk",
			filename: /^extensions\.conf$/i,
			load: () => import("./asterisk-B46aRdXb.js").then((e) => Sx(e.asterisk)),
		}),
		zc.of({
			name: "Brainfuck",
			extensions: ["b", "bf"],
			load: () =>
				import("./brainfuck-CtZaYBKt.js").then((e) => Sx(e.brainfuck)),
		}),
		zc.of({
			name: "Cobol",
			extensions: ["cob", "cpy"],
			load: () => import("./cobol-stawOqaz.js").then((e) => Sx(e.cobol)),
		}),
		zc.of({
			name: "C#",
			alias: ["csharp", "cs"],
			extensions: ["cs"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.csharp)),
		}),
		zc.of({
			name: "Clojure",
			extensions: ["clj", "cljc", "cljx"],
			load: () => import("./clojure-DR_hEDJv.js").then((e) => Sx(e.clojure)),
		}),
		zc.of({
			name: "ClojureScript",
			extensions: ["cljs"],
			load: () => import("./clojure-DR_hEDJv.js").then((e) => Sx(e.clojure)),
		}),
		zc.of({
			name: "Closure Stylesheets (GSS)",
			extensions: ["gss"],
			load: () => import("./css-ZjFoif2m.js").then((e) => Sx(e.gss)),
		}),
		zc.of({
			name: "CMake",
			extensions: ["cmake", "cmake.in"],
			filename: /^CMakeLists\.txt$/,
			load: () => import("./cmake-DXn5xaP-.js").then((e) => Sx(e.cmake)),
		}),
		zc.of({
			name: "CoffeeScript",
			alias: ["coffee", "coffee-script"],
			extensions: ["coffee"],
			load: () =>
				import("./coffeescript-BTDxI-eT.js").then((e) => Sx(e.coffeeScript)),
		}),
		zc.of({
			name: "Common Lisp",
			alias: ["lisp"],
			extensions: ["cl", "lisp", "el"],
			load: () =>
				import("./commonlisp-vq6DHwts.js").then((e) => Sx(e.commonLisp)),
		}),
		zc.of({
			name: "Cypher",
			extensions: ["cyp", "cypher"],
			load: () => import("./cypher-gJDei3ni.js").then((e) => Sx(e.cypher)),
		}),
		zc.of({
			name: "Cython",
			extensions: ["pyx", "pxd", "pxi"],
			load: () => import("./python-DD-Q2bae.js").then((e) => Sx(e.cython)),
		}),
		zc.of({
			name: "Crystal",
			extensions: ["cr"],
			load: () => import("./crystal-CRzZ78HM.js").then((e) => Sx(e.crystal)),
		}),
		zc.of({
			name: "D",
			extensions: ["d"],
			load: () => import("./d-BShv7fp-.js").then((e) => Sx(e.d)),
		}),
		zc.of({
			name: "Dart",
			extensions: ["dart"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.dart)),
		}),
		zc.of({
			name: "diff",
			extensions: ["diff", "patch"],
			load: () => import("./diff-UJJ5BM9S.js").then((e) => Sx(e.diff)),
		}),
		zc.of({
			name: "Dockerfile",
			filename: /^Dockerfile$/,
			load: () =>
				import("./dockerfile-knGOOxt4.js").then((e) => Sx(e.dockerFile)),
		}),
		zc.of({
			name: "DTD",
			extensions: ["dtd"],
			load: () => import("./dtd-DI9Herc-.js").then((e) => Sx(e.dtd)),
		}),
		zc.of({
			name: "Dylan",
			extensions: ["dylan", "dyl", "intr"],
			load: () => import("./dylan-CHJ5qNM_.js").then((e) => Sx(e.dylan)),
		}),
		zc.of({
			name: "EBNF",
			load: () => import("./ebnf-B-Df8AvO.js").then((e) => Sx(e.ebnf)),
		}),
		zc.of({
			name: "ECL",
			extensions: ["ecl"],
			load: () => import("./ecl-DPFc0Uaf.js").then((e) => Sx(e.ecl)),
		}),
		zc.of({
			name: "edn",
			extensions: ["edn"],
			load: () => import("./clojure-DR_hEDJv.js").then((e) => Sx(e.clojure)),
		}),
		zc.of({
			name: "Eiffel",
			extensions: ["e"],
			load: () => import("./eiffel-DR5c0IrL.js").then((e) => Sx(e.eiffel)),
		}),
		zc.of({
			name: "Elm",
			extensions: ["elm"],
			load: () => import("./elm-D7xaZ7Da.js").then((e) => Sx(e.elm)),
		}),
		zc.of({
			name: "Erlang",
			extensions: ["erl"],
			load: () => import("./erlang-BuqgqA5h.js").then((e) => Sx(e.erlang)),
		}),
		zc.of({
			name: "Esper",
			load: () => import("./sql-B3SPsWL6.js").then((e) => Sx(e.esper)),
		}),
		zc.of({
			name: "Factor",
			extensions: ["factor"],
			load: () => import("./factor-CFXhaUWb.js").then((e) => Sx(e.factor)),
		}),
		zc.of({
			name: "FCL",
			load: () => import("./fcl-CVaBTCzQ.js").then((e) => Sx(e.fcl)),
		}),
		zc.of({
			name: "Forth",
			extensions: ["forth", "fth", "4th"],
			load: () => import("./forth-Dri_5nFc.js").then((e) => Sx(e.forth)),
		}),
		zc.of({
			name: "Fortran",
			extensions: ["f", "for", "f77", "f90", "f95"],
			load: () => import("./fortran-DL7KluxX.js").then((e) => Sx(e.fortran)),
		}),
		zc.of({
			name: "F#",
			alias: ["fsharp"],
			extensions: ["fs"],
			load: () => import("./mllike-3c2dg9RT.js").then((e) => Sx(e.fSharp)),
		}),
		zc.of({
			name: "Gas",
			extensions: ["s"],
			load: () => import("./gas-5kEe4nk0.js").then((e) => Sx(e.gas)),
		}),
		zc.of({
			name: "Gherkin",
			extensions: ["feature"],
			load: () => import("./gherkin-B6X1vGSW.js").then((e) => Sx(e.gherkin)),
		}),
		zc.of({
			name: "Groovy",
			extensions: ["groovy", "gradle"],
			filename: /^Jenkinsfile$/,
			load: () => import("./groovy-DnIzCrpZ.js").then((e) => Sx(e.groovy)),
		}),
		zc.of({
			name: "Haskell",
			extensions: ["hs"],
			load: () => import("./haskell-CmdsSjFB.js").then((e) => Sx(e.haskell)),
		}),
		zc.of({
			name: "Haxe",
			extensions: ["hx"],
			load: () => import("./haxe-D25e-2l-.js").then((e) => Sx(e.haxe)),
		}),
		zc.of({
			name: "HXML",
			extensions: ["hxml"],
			load: () => import("./haxe-D25e-2l-.js").then((e) => Sx(e.hxml)),
		}),
		zc.of({
			name: "HTTP",
			load: () => import("./http-BKJkqRj4.js").then((e) => Sx(e.http)),
		}),
		zc.of({
			name: "IDL",
			extensions: ["pro"],
			load: () => import("./idl-pcmmZuaN.js").then((e) => Sx(e.idl)),
		}),
		zc.of({
			name: "JSON-LD",
			alias: ["jsonld"],
			extensions: ["jsonld"],
			load: () => import("./javascript-D48wDJXV.js").then((e) => Sx(e.jsonld)),
		}),
		zc.of({
			name: "Jinja2",
			extensions: ["j2", "jinja", "jinja2"],
			load: () => import("./jinja2-DhgKlfW7.js").then((e) => Sx(e.jinja2)),
		}),
		zc.of({
			name: "Julia",
			extensions: ["jl"],
			load: () => import("./julia-DjdwvFuI.js").then((e) => Sx(e.julia)),
		}),
		zc.of({
			name: "Kotlin",
			extensions: ["kt", "kts"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.kotlin)),
		}),
		zc.of({
			name: "LiveScript",
			alias: ["ls"],
			extensions: ["ls"],
			load: () =>
				import("./livescript-HO6ttBFx.js").then((e) => Sx(e.liveScript)),
		}),
		zc.of({
			name: "Lua",
			extensions: ["lua"],
			load: () => import("./lua-8DXOpKDz.js").then((e) => Sx(e.lua)),
		}),
		zc.of({
			name: "mIRC",
			extensions: ["mrc"],
			load: () => import("./mirc-DkvFAiy5.js").then((e) => Sx(e.mirc)),
		}),
		zc.of({
			name: "Mathematica",
			extensions: ["m", "nb", "wl", "wls"],
			load: () =>
				import("./mathematica-IIbmv7SK.js").then((e) => Sx(e.mathematica)),
		}),
		zc.of({
			name: "Modelica",
			extensions: ["mo"],
			load: () => import("./modelica-DSrSSXCg.js").then((e) => Sx(e.modelica)),
		}),
		zc.of({
			name: "MUMPS",
			extensions: ["mps"],
			load: () => import("./mumps-zvxmGV4l.js").then((e) => Sx(e.mumps)),
		}),
		zc.of({
			name: "Mbox",
			extensions: ["mbox"],
			load: () => import("./mbox-z_N2Mo3d.js").then((e) => Sx(e.mbox)),
		}),
		zc.of({
			name: "Nginx",
			filename: /nginx.*\.conf$/i,
			load: () => import("./nginx-B4hAVlXN.js").then((e) => Sx(e.nginx)),
		}),
		zc.of({
			name: "NSIS",
			extensions: ["nsh", "nsi"],
			load: () => import("./nsis-BvKfQ9lQ.js").then((e) => Sx(e.nsis)),
		}),
		zc.of({
			name: "NTriples",
			extensions: ["nt", "nq"],
			load: () => import("./ntriples-FFvkTduk.js").then((e) => Sx(e.ntriples)),
		}),
		zc.of({
			name: "Objective-C",
			alias: ["objective-c", "objc"],
			extensions: ["m"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.objectiveC)),
		}),
		zc.of({
			name: "Objective-C++",
			alias: ["objective-c++", "objc++"],
			extensions: ["mm"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.objectiveCpp)),
		}),
		zc.of({
			name: "OCaml",
			extensions: ["ml", "mli", "mll", "mly"],
			load: () => import("./mllike-3c2dg9RT.js").then((e) => Sx(e.oCaml)),
		}),
		zc.of({
			name: "Octave",
			extensions: ["m"],
			load: () => import("./octave-C4hdQ5Hf.js").then((e) => Sx(e.octave)),
		}),
		zc.of({
			name: "Oz",
			extensions: ["oz"],
			load: () => import("./oz-qQq7irPq.js").then((e) => Sx(e.oz)),
		}),
		zc.of({
			name: "Pascal",
			extensions: ["p", "pas"],
			load: () => import("./pascal-CafrKXZF.js").then((e) => Sx(e.pascal)),
		}),
		zc.of({
			name: "Perl",
			extensions: ["pl", "pm"],
			load: () => import("./perl-tdMlh9QA.js").then((e) => Sx(e.perl)),
		}),
		zc.of({
			name: "Pig",
			extensions: ["pig"],
			load: () => import("./pig-CwGJVRC4.js").then((e) => Sx(e.pig)),
		}),
		zc.of({
			name: "PowerShell",
			extensions: ["ps1", "psd1", "psm1"],
			load: () =>
				import("./powershell-D1ly3AHC.js").then((e) => Sx(e.powerShell)),
		}),
		zc.of({
			name: "Properties files",
			alias: ["ini", "properties"],
			extensions: ["properties", "ini", "in"],
			load: () =>
				import("./properties-_nPj978X.js").then((e) => Sx(e.properties)),
		}),
		zc.of({
			name: "ProtoBuf",
			extensions: ["proto"],
			load: () => import("./protobuf-B4y9do6W.js").then((e) => Sx(e.protobuf)),
		}),
		zc.of({
			name: "Pug",
			alias: ["jade"],
			extensions: ["pug", "jade"],
			load: () => import("./pug-CMX2P1Iw.js").then((e) => Sx(e.pug)),
		}),
		zc.of({
			name: "Puppet",
			extensions: ["pp"],
			load: () => import("./puppet-Bc-yJKzi.js").then((e) => Sx(e.puppet)),
		}),
		zc.of({
			name: "Q",
			extensions: ["q"],
			load: () => import("./q-B0kTJ4cI.js").then((e) => Sx(e.q)),
		}),
		zc.of({
			name: "R",
			alias: ["rscript"],
			extensions: ["r", "R"],
			load: () => import("./r-BA4EbLKE.js").then((e) => Sx(e.r)),
		}),
		zc.of({
			name: "RPM Changes",
			load: () => import("./rpm-DI_rRufH.js").then((e) => Sx(e.rpmChanges)),
		}),
		zc.of({
			name: "RPM Spec",
			extensions: ["spec"],
			load: () => import("./rpm-DI_rRufH.js").then((e) => Sx(e.rpmSpec)),
		}),
		zc.of({
			name: "Ruby",
			alias: ["jruby", "macruby", "rake", "rb", "rbx"],
			extensions: ["rb"],
			filename: /^(Gemfile|Rakefile)$/,
			load: () => import("./ruby-CR-u2WLS.js").then((e) => Sx(e.ruby)),
		}),
		zc.of({
			name: "SAS",
			extensions: ["sas"],
			load: () => import("./sas-Bqaci40L.js").then((e) => Sx(e.sas)),
		}),
		zc.of({
			name: "Scala",
			extensions: ["scala"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.scala)),
		}),
		zc.of({
			name: "Scheme",
			extensions: ["scm", "ss"],
			load: () => import("./scheme-qjP0V5Ag.js").then((e) => Sx(e.scheme)),
		}),
		zc.of({
			name: "Shell",
			alias: ["bash", "sh", "zsh"],
			extensions: ["sh", "ksh", "bash"],
			filename: /^PKGBUILD$/,
			load: () => import("./shell-BLav31RL.js").then((e) => Sx(e.shell)),
		}),
		zc.of({
			name: "Sieve",
			extensions: ["siv", "sieve"],
			load: () => import("./sieve-r025o_jW.js").then((e) => Sx(e.sieve)),
		}),
		zc.of({
			name: "Smalltalk",
			extensions: ["st"],
			load: () =>
				import("./smalltalk-C7J3IyEP.js").then((e) => Sx(e.smalltalk)),
		}),
		zc.of({
			name: "Solr",
			load: () => import("./solr-78MBEUkU.js").then((e) => Sx(e.solr)),
		}),
		zc.of({
			name: "SML",
			extensions: ["sml", "sig", "fun", "smackspec"],
			load: () => import("./mllike-3c2dg9RT.js").then((e) => Sx(e.sml)),
		}),
		zc.of({
			name: "SPARQL",
			alias: ["sparul"],
			extensions: ["rq", "sparql"],
			load: () => import("./sparql-BRLJFz69.js").then((e) => Sx(e.sparql)),
		}),
		zc.of({
			name: "Spreadsheet",
			alias: ["excel", "formula"],
			load: () =>
				import("./spreadsheet-CGlWr0eM.js").then((e) => Sx(e.spreadsheet)),
		}),
		zc.of({
			name: "Squirrel",
			extensions: ["nut"],
			load: () => import("./clike-BgBwzOhw.js").then((e) => Sx(e.squirrel)),
		}),
		zc.of({
			name: "Stylus",
			extensions: ["styl"],
			load: () => import("./stylus-3mOX9C7I.js").then((e) => Sx(e.stylus)),
		}),
		zc.of({
			name: "Swift",
			extensions: ["swift"],
			load: () => import("./swift-B_XXVlXX.js").then((e) => Sx(e.swift)),
		}),
		zc.of({
			name: "sTeX",
			load: () => import("./stex-Ba7Sj9VR.js").then((e) => Sx(e.stex)),
		}),
		zc.of({
			name: "LaTeX",
			alias: ["tex"],
			extensions: ["text", "ltx", "tex"],
			load: () => import("./stex-Ba7Sj9VR.js").then((e) => Sx(e.stex)),
		}),
		zc.of({
			name: "SystemVerilog",
			extensions: ["v", "sv", "svh"],
			load: () => import("./verilog-B4LBqg_1.js").then((e) => Sx(e.verilog)),
		}),
		zc.of({
			name: "Tcl",
			extensions: ["tcl"],
			load: () => import("./tcl-B2fODqDH.js").then((e) => Sx(e.tcl)),
		}),
		zc.of({
			name: "Textile",
			extensions: ["textile"],
			load: () => import("./textile-BuVhTOzU.js").then((e) => Sx(e.textile)),
		}),
		zc.of({
			name: "TiddlyWiki",
			load: () =>
				import("./tiddlywiki-BgR6AEZu.js").then((e) => Sx(e.tiddlyWiki)),
		}),
		zc.of({
			name: "Tiki wiki",
			load: () => import("./tiki-CI-ztowC.js").then((e) => Sx(e.tiki)),
		}),
		zc.of({
			name: "TOML",
			extensions: ["toml"],
			load: () => import("./toml-BQXy8elZ.js").then((e) => Sx(e.toml)),
		}),
		zc.of({
			name: "Troff",
			extensions: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
			load: () => import("./troff-Ce85hlLp.js").then((e) => Sx(e.troff)),
		}),
		zc.of({
			name: "TTCN",
			extensions: ["ttcn", "ttcn3", "ttcnpp"],
			load: () => import("./ttcn-BxnYHtq8.js").then((e) => Sx(e.ttcn)),
		}),
		zc.of({
			name: "TTCN_CFG",
			extensions: ["cfg"],
			load: () => import("./ttcn-cfg-CKJxb-l2.js").then((e) => Sx(e.ttcnCfg)),
		}),
		zc.of({
			name: "Turtle",
			extensions: ["ttl"],
			load: () => import("./turtle-BkSuIpt-.js").then((e) => Sx(e.turtle)),
		}),
		zc.of({
			name: "Web IDL",
			extensions: ["webidl"],
			load: () => import("./webidl-CGwyPRYs.js").then((e) => Sx(e.webIDL)),
		}),
		zc.of({
			name: "VB.NET",
			extensions: ["vb"],
			load: () => import("./vb-BHgjm0DN.js").then((e) => Sx(e.vb)),
		}),
		zc.of({
			name: "VBScript",
			extensions: ["vbs"],
			load: () => import("./vbscript-Dawdd5GZ.js").then((e) => Sx(e.vbScript)),
		}),
		zc.of({
			name: "Velocity",
			extensions: ["vtl"],
			load: () => import("./velocity-BdD_26Jv.js").then((e) => Sx(e.velocity)),
		}),
		zc.of({
			name: "Verilog",
			extensions: ["v"],
			load: () => import("./verilog-B4LBqg_1.js").then((e) => Sx(e.verilog)),
		}),
		zc.of({
			name: "VHDL",
			extensions: ["vhd", "vhdl"],
			load: () => import("./vhdl-CWWH2SUo.js").then((e) => Sx(e.vhdl)),
		}),
		zc.of({
			name: "XQuery",
			extensions: ["xy", "xquery"],
			load: () => import("./xquery-CVDBqZPY.js").then((e) => Sx(e.xQuery)),
		}),
		zc.of({
			name: "Yacas",
			extensions: ["ys"],
			load: () => import("./yacas-I8QjZlxf.js").then((e) => Sx(e.yacas)),
		}),
		zc.of({
			name: "Z80",
			extensions: ["z80"],
			load: () => import("./z80-D8p3gKXp.js").then((e) => Sx(e.z80)),
		}),
		zc.of({
			name: "MscGen",
			extensions: ["mscgen", "mscin", "msc"],
			load: () => import("./mscgen-B2igx18G.js").then((e) => Sx(e.mscgen)),
		}),
		zc.of({
			name: "Xù",
			extensions: ["xu"],
			load: () => import("./mscgen-B2igx18G.js").then((e) => Sx(e.xu)),
		}),
		zc.of({
			name: "MsGenny",
			extensions: ["msgenny"],
			load: () => import("./mscgen-B2igx18G.js").then((e) => Sx(e.msgenny)),
		}),
		zc.of({
			name: "Vue",
			extensions: ["vue"],
			load: () => import("./index-CKMuERHe.js").then((e) => e.vue()),
		}),
		zc.of({
			name: "Angular Template",
			load: () => import("./index-D99IHKi4.js").then((e) => e.angular()),
		}),
	],
	wx = "var(--editor-bg, #1e1e1e)",
	kx = "var(--editor-text, #d4d4d4)",
	vx = "var(--editor-selection-bg, #3a3d41)",
	$x = "var(--editor-cursor, #aeafad)",
	Px = "var(--editor-line-highlight-bg, #2a2a2a)",
	Zx = "var(--editor-comment, #6a9955)",
	_x = "var(--editor-keyword, #569cd6)",
	Tx = "var(--editor-string, #ce9178)",
	Xx = "var(--editor-number, #b5cea8)",
	Ax = "var(--editor-heading, #4ec9b0)",
	Cx = "var(--editor-link, #9cdcfe)",
	Rx = "var(--editor-operator, #d4d4d4)",
	Mx = "var(--editor-punctuation, #808080)",
	jx = Gl.theme(
		{
			"&": {
				color: kx,
				backgroundColor: wx,
				height: "400px",
				border: "1px solid var(--editor-border-color, #333)",
				borderRadius: "var(--editor-border-radius, 4px)",
			},
			".cm-content": {
				caretColor: $x,
				fontFamily: "var(--editor-font-family, monospace)",
				fontSize: "var(--editor-font-size, 14px)",
				lineHeight: "var(--editor-line-height, 1.5)",
			},
			"&.cm-focused .cm-cursor": { borderLeftColor: $x },
			"&.cm-focused .cm-selectionBackground, ::selection": {
				backgroundColor: vx + " !important",
			},
			".cm-gutters": { backgroundColor: wx, color: Mx, border: "none" },
			".cm-activeLineGutter": { backgroundColor: Px },
			".cm-activeLine": { backgroundColor: Px },
			[wc.heading]: { color: Ax, fontWeight: "bold" },
			[wc.strong]: { fontWeight: "bold" },
			[wc.emphasis]: { fontStyle: "italic" },
			[wc.link]: { color: Cx, textDecoration: "underline" },
			[wc.url]: { color: Cx },
			[wc.quote]: { color: Zx, fontStyle: "italic" },
			[wc.keyword]: { color: _x },
			[wc.comment]: { color: Zx, fontStyle: "italic" },
			[wc.string]: { color: Tx },
			[wc.number]: { color: Xx },
			[wc.operator]: { color: Rx },
			[wc.punctuation]: { color: Mx },
			[wc.monospace]: {
				fontFamily: "var(--editor-mono-font-family, monospace)",
			},
			[wc.contentSeparator]: { color: Ax, fontWeight: "bold" },
			[wc.list]: { color: kx },
			[wc.meta]: { color: Zx },
		},
		{ dark: !0 },
	),
	Ex = [
		(function (e = {}) {
			return [
				Du,
				Yu.of(e),
				Gl.domEventHandlers({
					beforeinput(e, t) {
						let i =
							"historyUndo" == e.inputType
								? Iu
								: "historyRedo" == e.inputType
									? Uu
									: null;
						return !!i && (e.preventDefault(), i(t));
					},
				}),
			];
		})(),
		ih.of([...sO, ...lf]),
		px({ base: nx, codeLanguages: Qx }),
		jx,
		Gl.lineWrapping,
	];
class qx {
	constructor(e) {
		(this.storageKey = e ? `journal_draft_${e}` : "journal_draft_new"),
			console.log(`Persistence initialized for key: ${this.storageKey}`);
	}
	saveDraft(e) {
		try {
			localStorage.setItem(this.storageKey, e),
				console.log(`Draft saved for ${this.storageKey}`);
		} catch (e) {
			console.error("Error saving draft to localStorage:", e);
		}
	}
	loadDraft() {
		try {
			const e = localStorage.getItem(this.storageKey);
			return (
				e
					? console.log(`Draft loaded for ${this.storageKey}`)
					: console.log(`No draft found for ${this.storageKey}`),
				e
			);
		} catch (e) {
			return console.error("Error loading draft from localStorage:", e), null;
		}
	}
	clearDraft() {
		try {
			localStorage.removeItem(this.storageKey),
				console.log(`Draft cleared for ${this.storageKey}`);
		} catch (e) {
			console.error("Error clearing draft from localStorage:", e);
		}
	}
}
function Vx(e, t, i, n, r = t.length) {
	const s = e.selection.main;
	if (s.empty) {
		const e = t + n + i;
		return {
			changes: { from: s.from, insert: e },
			selection: _n.cursor(s.from + r),
		};
	}
	return {
		changes: [
			{ from: s.from, insert: t },
			{ from: s.to, insert: i },
		],
		selection: _n.range(s.from + t.length, s.to + t.length),
	};
}
function Lx(e, t, i = !1) {
	const n = [];
	let r = 1;
	const s = e.selection.main,
		o = e.doc.lineAt(s.from),
		a = e.doc.lineAt(s.to);
	for (let s = o.number; s <= a.number; s++) {
		const l = e.doc.line(s);
		if (0 === l.length && o.number !== a.number) continue;
		let h = t;
		i && ((h = `${r}. `), r++), n.push({ from: l.from, insert: h });
	}
	return { changes: n };
}
function Wx(e, t, i = "", n = "", r = !1) {
	const { state: s } = e,
		o = [],
		a = s.selection.main;
	let l = t,
		h = i,
		c = n || t + (i || "");
	if (r) {
		const e = s.doc.lineAt(a.from),
			t = s.doc.lineAt(a.to);
		e.from > 0 &&
			"\n" !== s.doc.sliceString(e.from - 1, e.from) &&
			(l = "\n" + l),
			e.number === t.number && 0 === e.length
				? ((c = l + "\n" + n + "\n" + h),
					o.push({ from: a.from, to: a.to, insert: c }))
				: (o.push({ from: e.from, insert: l + "\n" }),
					t.to,
					((t.to < s.doc.length &&
						"\n" !== s.doc.sliceString(t.to, t.to + 1)) ||
						(t.to === s.doc.length &&
							"\n" !== s.doc.sliceString(t.to - 1, t.to))) &&
						(h = "\n" + h),
					o.push({ from: t.to, insert: "\n" + h }));
	} else
		a.empty
			? o.push({ from: a.from, insert: l + n + h })
			: (o.push({ from: a.from, insert: l }),
				o.push({ from: a.to, insert: h }));
	e.dispatch({
		changes: o,
		selection:
			a.empty && !r
				? _n.cursor(a.from + l.length)
				: a.empty && r
					? _n.cursor(startLine.from + l.length + 1 + n.length + 1)
					: void 0,
		userEvent: "input.format",
	}),
		e.focus();
}
function zx(e, t, i = !1) {
	let n;
	return function (...r) {
		const s = this,
			o = i && !n;
		clearTimeout(n),
			(n = setTimeout(function () {
				(n = null), i || e.apply(s, r);
			}, t)),
			o && e.apply(s, r);
	};
}
function Yx(e = null, t = "") {
	return {
		editorView: null,
		content: t,
		previewHtml: "",
		mode: "edit",
		isLoadingPreview: !1,
		persistence: null,
		entryId: e,
		lastSavedContent: t,
		init() {
			console.log("Initializing Alpine editor component..."),
				(this.persistence = new qx(this.entryId));
			document.querySelector(".flash-success") &&
				(console.log("Success flash message detected, clearing draft."),
				this.persistence.clearDraft());
			const e = this.persistence.loadDraft();
			null !== e && e !== t
				? (console.log("Applying saved draft."), (this.content = e))
				: (this.content = t),
				(this.lastSavedContent = this.content),
				("split" !== this.mode && "preview" !== this.mode) ||
					this.updatePreview(),
				setInterval(() => {
					this.saveDraftIfNeeded();
				}, 1e4),
				window.addEventListener("beforeunload", () => {
					this.saveDraftIfNeeded();
				}),
				console.log(
					"Alpine editor component initialized (CodeMirror setup deferred).",
				);
		},
		initializeCodeMirror(e) {
			if ((console.log("initializeCodeMirror called with element:", e), e))
				if (this.editorView)
					console.warn("CodeMirror view already initialized. Skipping.");
				else {
					console.log("Creating CodeMirror editor instance...");
					try {
						(this.editorView = (function (e, t = "", i = () => {}) {
							const n = Sr.create({
								doc: t,
								extensions: [
									Ex,
									Gl.updateListener.of((e) => {
										e.docChanged && i(e.state.doc.toString());
									}),
								],
							});
							return new Gl({ state: n, parent: e });
						})(e, this.content, (e) => {
							(this.content = e), this.handleContentChange();
						})),
							console.log("CodeMirror editor instance created successfully."),
							("split" !== this.mode && "preview" !== this.mode) ||
								this.updatePreview();
					} catch (e) {
						console.error("Error creating CodeMirror editor:", e);
					}
				}
			else
				console.error("initializeCodeMirror called without a valid element.");
		},
		handleContentChange: zx(function () {
			console.log("Content changed (debounced)"),
				this.saveDraftIfNeeded(),
				("split" !== this.mode && "preview" !== this.mode) ||
					this.updatePreview();
		}, 500),
		setMode(e) {
			["edit", "split", "preview"].includes(e) &&
				((this.mode = e),
				console.log(`Mode set to: ${this.mode}`),
				("split" !== e && "preview" !== e) ||
					this.previewHtml ||
					this.updatePreview());
		},
		async updatePreview() {
			if (this.isLoadingPreview) return;
			(this.isLoadingPreview = !0), console.log("Updating preview...");
			const e = document
				.querySelector('meta[name="csrf-token"]')
				?.getAttribute("content");
			if (!e)
				return (
					console.error("CSRF token meta tag not found!"),
					(this.previewHtml =
						'<p class="error">Configuration error: CSRF token missing.</p>'),
					void (this.isLoadingPreview = !1)
				);
			try {
				const t = await fetch("/api/v1/markdown", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"X-CSRFToken": e,
					},
					body: JSON.stringify({ text: this.content }),
				});
				if (!t.ok) throw new Error(`HTTP error! status: ${t.status}`);
				const i = await t.json();
				(this.previewHtml = i.html),
					console.log("Preview updated, triggering MathJax."),
					this.$nextTick(() => {
						const e = this.$refs.previewContent;
						e && window.MathJax && window.MathJax.typesetPromise
							? (console.log("Triggering MathJax typesetting..."),
								window.MathJax.typesetPromise([e]).catch((e) =>
									console.error("MathJax typesetting failed:", e),
								))
							: e
								? console.warn(
										"MathJax not available or not configured for typesetting.",
									)
								: console.warn(
										"Preview element (x-ref='previewContent') not found for MathJax.",
									);
					});
			} catch (e) {
				console.error("Error fetching Markdown preview:", e),
					(this.previewHtml = `<p class="error">Error loading preview: ${e.message}</p>`);
			} finally {
				this.isLoadingPreview = !1;
			}
		},
		saveDraftIfNeeded() {
			this.content !== this.lastSavedContent &&
				(this.persistence.saveDraft(this.content),
				(this.lastSavedContent = this.content));
		},
		insertMarkdown(e) {
			if (this.editorView)
				switch (e) {
					case "bold":
						!(function (e) {
							const t = Vx(e.state, "**", "**", "bold text");
							e.dispatch(e.state.update(t, { userEvent: "input.format.bold" })),
								e.focus();
						})(this.editorView);
						break;
					case "italic":
						!(function (e) {
							const t = Vx(e.state, "*", "*", "italic text");
							e.dispatch(
								e.state.update(t, { userEvent: "input.format.italic" }),
							),
								e.focus();
						})(this.editorView);
						break;
					case "link":
						!(function (e) {
							const { state: t } = e,
								i = t.selection.main;
							let n;
							if (i.empty) {
								const e = "[link text](url)";
								n = {
									changes: { from: i.from, insert: e },
									selection: _n.cursor(i.from + 11),
								};
							} else {
								const e = t.sliceDoc(i.from, i.to),
									r = `[${e}](url)`;
								n = {
									changes: { from: i.from, to: i.to, insert: r },
									selection: _n.cursor(i.from + e.length + 3),
								};
							}
							e.dispatch(e.state.update(n, { userEvent: "input.format.link" })),
								e.focus();
						})(this.editorView);
						break;
					case "ul":
					case "ol":
						!(function (e, t) {
							const i = "ol" === t ? "1. " : "- ",
								n = "ol" === t,
								r = Lx(e.state, i, n);
							r.changes.length > 0 &&
								e.dispatch(
									e.state.update(r, { userEvent: `input.format.${t}` }),
								),
								e.focus();
						})(this.editorView, e);
						break;
					case "blockquote":
						!(function (e) {
							const t = Lx(e.state, "> ");
							t.changes.length > 0 &&
								e.dispatch(
									e.state.update(t, { userEvent: "input.format.blockquote" }),
								),
								e.focus();
						})(this.editorView);
						break;
					case "image":
						Wx(this.editorView, "![", "](url)", "alt text");
						break;
					case "table":
						const t =
							"| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |";
						Wx(this.editorView, "", "", t, !0);
						break;
					case "codeblock":
						Wx(this.editorView, "```\n", "\n```", "code here", !0);
						break;
					default:
						console.warn(`Unknown markdown type: ${e}`);
				}
		},
		insertImage() {
			this.insertMarkdown("image");
		},
		insertTable() {
			this.insertMarkdown("table");
		},
		insertCodeBlock() {
			this.insertMarkdown("codeblock");
		},
		exportPDF() {
			alert("PDF Export functionality not yet implemented.");
		},
	};
}
(window.Alpine = Gi),
	document.addEventListener("alpine:init", () => {
		console.log("Alpine initialized, registering components..."),
			Gi.data("editor", Yx),
			console.log("Editor component registered.");
	}),
	Gi.start(),
	console.log("Alpine.js initialized and editor component registered.");
export {
	_p as C,
	mp as E,
	xh as I,
	Tc as L,
	Eh as N,
	Tp as a,
	Wc as b,
	ru as c,
	hO as d,
	lO as e,
	ou as f,
	Xc as g,
	tu as h,
	Nc as i,
	nu as j,
	au as k,
	pp as l,
	PO as m,
	Zm as n,
	Gl as o,
	_n as p,
	Bg as q,
	Wh as r,
	sc as s,
	wc as t,
	lu as u,
	sg as v,
};
