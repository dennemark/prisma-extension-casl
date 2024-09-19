// src/index.ts
import { Prisma as Prisma2 } from "@prisma/client";

// node_modules/.pnpm/@ucast+core@1.10.2/node_modules/@ucast/core/dist/es6m/index.mjs
var t = class {
  constructor(t3, e4) {
    this.operator = t3, this.value = e4, Object.defineProperty(this, "t", { writable: true });
  }
  get notes() {
    return this.t;
  }
  addNote(t3) {
    this.t = this.t || [], this.t.push(t3);
  }
};
var e = class extends t {
};
var r = class extends e {
  constructor(t3, e4) {
    if (!Array.isArray(e4)) throw new Error(`"${t3}" operator expects to receive an array of conditions`);
    super(t3, e4);
  }
};
var n = "__itself__";
var o = class extends t {
  constructor(t3, e4, r2) {
    super(t3, r2), this.field = e4;
  }
};
var s = new e("__null__", null);
var i = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
function c(t3, e4) {
  return e4 instanceof r && e4.operator === t3;
}
function u(t3, e4) {
  return 1 === e4.length ? e4[0] : new r(t3, function t4(e5, r2, n3) {
    const o3 = n3 || [];
    for (let n4 = 0, s3 = r2.length; n4 < s3; n4++) {
      const s4 = r2[n4];
      c(e5, s4) ? t4(e5, s4.value, o3) : o3.push(s4);
    }
    return o3;
  }(t3, e4));
}
var a = (t3) => t3;
var h = () => /* @__PURE__ */ Object.create(null);
var f = Object.defineProperty(h(), "__@type@__", { value: "ignore value" });
function l(t3, e4, r2 = false) {
  if (!t3 || t3 && t3.constructor !== Object) return false;
  for (const n3 in t3) {
    if (i(t3, n3) && i(e4, n3) && (!r2 || t3[n3] !== f)) return true;
  }
  return false;
}
function d(t3) {
  const e4 = [];
  for (const r2 in t3) i(t3, r2) && t3[r2] !== f && e4.push(r2);
  return e4;
}
function p(t3, e4) {
  e4 !== s && t3.push(e4);
}
var w = (t3) => u("and", t3);
var b = (t3) => u("or", t3);
var O = { compound(t3, e4, n3) {
  const o3 = (Array.isArray(e4) ? e4 : [e4]).map((t4) => n3.parse(t4));
  return new r(t3.name, o3);
}, field: (t3, e4, r2) => new o(t3.name, r2.field, e4), document: (t3, r2) => new e(t3.name, r2) };
var j = class {
  constructor(t3, e4 = h()) {
    this.o = void 0, this.s = void 0, this.i = void 0, this.u = void 0, this.h = void 0, this.parse = this.parse.bind(this), this.u = { operatorToConditionName: e4.operatorToConditionName || a, defaultOperatorName: e4.defaultOperatorName || "eq", mergeFinalConditions: e4.mergeFinalConditions || w }, this.o = Object.keys(t3).reduce((e5, r2) => (e5[r2] = Object.assign({ name: this.u.operatorToConditionName(r2) }, t3[r2]), e5), {}), this.s = Object.assign({}, e4.fieldContext, { field: "", query: {}, parse: this.parse, hasOperators: (t4) => l(t4, this.o, e4.useIgnoreValue) }), this.i = Object.assign({}, e4.documentContext, { parse: this.parse, query: {} }), this.h = e4.useIgnoreValue ? d : Object.keys;
  }
  setParse(t3) {
    this.parse = t3, this.s.parse = t3, this.i.parse = t3;
  }
  parseField(t3, e4, r2, n3) {
    const o3 = this.o[e4];
    if (!o3) throw new Error(`Unsupported operator "${e4}"`);
    if ("field" !== o3.type) throw new Error(`Unexpected ${o3.type} operator "${e4}" at field level`);
    return this.s.field = t3, this.s.query = n3, this.parseInstruction(o3, r2, this.s);
  }
  parseInstruction(t3, e4, r2) {
    "function" == typeof t3.validate && t3.validate(t3, e4);
    return (t3.parse || O[t3.type])(t3, e4, r2);
  }
  parseFieldOperators(t3, e4) {
    const r2 = [], n3 = this.h(e4);
    for (let o3 = 0, s3 = n3.length; o3 < s3; o3++) {
      const s4 = n3[o3];
      if (!this.o[s4]) throw new Error(`Field query for "${t3}" may contain only operators or a plain object as a value`);
      p(r2, this.parseField(t3, s4, e4[s4], e4));
    }
    return r2;
  }
  parse(t3) {
    const e4 = [], r2 = this.h(t3);
    this.i.query = t3;
    for (let n3 = 0, o3 = r2.length; n3 < o3; n3++) {
      const o4 = r2[n3], s3 = t3[o4], i4 = this.o[o4];
      if (i4) {
        if ("document" !== i4.type && "compound" !== i4.type) throw new Error(`Cannot use parsing instruction for operator "${o4}" in "document" context as it is supposed to be used in  "${i4.type}" context`);
        p(e4, this.parseInstruction(i4, s3, this.i));
      } else this.s.hasOperators(s3) ? e4.push(...this.parseFieldOperators(o4, s3)) : p(e4, this.parseField(o4, this.u.defaultOperatorName, s3, t3));
    }
    return this.u.mergeFinalConditions(e4);
  }
};
function _(t3, e4) {
  const r2 = t3[e4];
  if ("function" != typeof r2) throw new Error(`Unable to interpret "${e4}" condition. Did you forget to register interpreter for it?`);
  return r2;
}
function y(t3) {
  return t3.operator;
}
function m(t3, e4) {
  const r2 = e4, n3 = r2 && r2.getInterpreterName || y;
  let o3;
  switch (r2 ? r2.numberOfArguments : 0) {
    case 1:
      o3 = (e5) => {
        const o4 = n3(e5, r2);
        return _(t3, o4)(e5, s3);
      };
      break;
    case 3:
      o3 = (e5, o4, i4) => {
        const c5 = n3(e5, r2);
        return _(t3, c5)(e5, o4, i4, s3);
      };
      break;
    default:
      o3 = (e5, o4) => {
        const i4 = n3(e5, r2);
        return _(t3, i4)(e5, o4, s3);
      };
  }
  const s3 = Object.assign({}, r2, { interpret: o3 });
  return s3.interpret;
}
function v(t3, e4) {
  return (r2, ...n3) => {
    const o3 = t3(r2, ...n3), s3 = e4.bind(null, o3);
    return s3.ast = o3, s3;
  };
}
var x = j.prototype.parseInstruction;

// node_modules/.pnpm/@ucast+mongo@2.4.3/node_modules/@ucast/mongo/dist/es6m/index.mjs
function s2(e4, t3) {
  if (!Array.isArray(t3)) throw new Error(`"${e4.name}" expects value to be an array`);
}
function p2(e4, t3) {
  if (s2(e4, t3), !t3.length) throw new Error(`"${e4.name}" expects to have at least one element in array`);
}
var l2 = (e4) => (t3, r2) => {
  if (typeof r2 !== e4) throw new Error(`"${t3.name}" expects value to be a "${e4}"`);
};
var c2 = { type: "compound", validate: p2, parse(t3, r2, { parse: o3 }) {
  const a5 = r2.map((e4) => o3(e4));
  return u(t3.name, a5);
} };
var f2 = c2;
var d2 = { type: "compound", validate: p2 };
var u2 = { type: "field", validate(e4, t3) {
  if (!(t3 && (t3 instanceof RegExp || t3.constructor === Object))) throw new Error(`"${e4.name}" expects to receive either regular expression or object of field operators`);
}, parse(e4, o3, a5) {
  const n3 = o3 instanceof RegExp ? new o("regex", a5.field, o3) : a5.parse(o3, a5);
  return new r(e4.name, [n3]);
} };
var $ = { type: "field", validate(e4, t3) {
  if (!t3 || t3.constructor !== Object) throw new Error(`"${e4.name}" expects to receive an object with nested query or field level operators`);
}, parse(e4, r2, { parse: a5, field: n3, hasOperators: i4 }) {
  const s3 = i4(r2) ? a5(r2, { field: n }) : a5(r2);
  return new o(e4.name, n3, s3);
} };
var w2 = { type: "field", validate: l2("number") };
var y2 = { type: "field", validate: s2 };
var x2 = y2;
var v2 = y2;
var h2 = { type: "field", validate(e4, t3) {
  if (!Array.isArray(t3) || 2 !== t3.length) throw new Error(`"${e4.name}" expects an array with 2 numeric elements`);
} };
var m2 = { type: "field", validate: l2("boolean") };
var g = { type: "field", validate: function(e4, t3) {
  if (!("string" == typeof t3 || "number" == typeof t3 || t3 instanceof Date)) throw new Error(`"${e4.name}" expects value to be comparable (i.e., string, number or date)`);
} };
var b2 = g;
var E = b2;
var j2 = b2;
var O2 = { type: "field" };
var R = O2;
var _2 = { type: "field", validate(e4, t3) {
  if (!(t3 instanceof RegExp) && "string" != typeof t3) throw new Error(`"${e4.name}" expects value to be a regular expression or a string that represents regular expression`);
}, parse(e4, r2, o3) {
  const a5 = "string" == typeof r2 ? new RegExp(r2, o3.query.$options || "") : r2;
  return new o(e4.name, o3.field, a5);
} };
var q = { type: "field", parse: () => s };
var A = { type: "document", validate: l2("function") };
var N = Object.freeze({ __proto__: null, $and: c2, $or: f2, $nor: d2, $not: u2, $elemMatch: $, $size: w2, $in: y2, $nin: x2, $all: v2, $mod: h2, $exists: m2, $gte: g, $gt: b2, $lt: E, $lte: j2, $eq: O2, $ne: R, $regex: _2, $options: q, $where: A });
var P = class extends j {
  constructor(e4) {
    super(e4, { defaultOperatorName: "$eq", operatorToConditionName: (e5) => e5.slice(1) });
  }
  parse(e4, t3) {
    return t3 && t3.field ? w(this.parseFieldOperators(t3.field, e4)) : super.parse(e4);
  }
};
var z = N;

// node_modules/.pnpm/@ucast+js@3.0.4/node_modules/@ucast/js/dist/es6m/index.mjs
function n2(r2, t3, n3) {
  for (let e4 = 0, o3 = r2.length; e4 < o3; e4++) if (0 === n3(r2[e4], t3)) return true;
  return false;
}
function e2(r2, t3) {
  return Array.isArray(r2) && Number.isNaN(Number(t3));
}
function o2(r2, t3, n3) {
  if (!e2(r2, t3)) return n3(r2, t3);
  let o3 = [];
  for (let e4 = 0; e4 < r2.length; e4++) {
    const u5 = n3(r2[e4], t3);
    void 0 !== u5 && (o3 = o3.concat(u5));
  }
  return o3;
}
function u3(r2) {
  return (t3, n3, e4) => {
    const o3 = e4.get(n3, t3.field);
    return Array.isArray(o3) ? o3.some((n4) => r2(t3, n4, e4)) : r2(t3, o3, e4);
  };
}
var c3 = (r2, t3) => r2[t3];
function i2(r2, t3, n3) {
  const e4 = t3.lastIndexOf(".");
  return -1 === e4 ? [r2, t3] : [n3(r2, t3.slice(0, e4)), t3.slice(e4 + 1)];
}
function f3(t3, n3, e4 = c3) {
  if (n3 === n) return t3;
  if (!t3) throw new Error(`Unable to get field "${n3}" out of ${String(t3)}.`);
  return function(r2, t4, n4) {
    if (-1 === t4.indexOf(".")) return o2(r2, t4, n4);
    const e5 = t4.split(".");
    let u5 = r2;
    for (let r3 = 0, t5 = e5.length; r3 < t5; r3++) if (u5 = o2(u5, e5[r3], n4), !u5 || "object" != typeof u5) return u5;
    return u5;
  }(t3, n3, e4);
}
function a2(r2, t3) {
  return r2 === t3 ? 0 : r2 > t3 ? 1 : -1;
}
function l3(r2, n3 = {}) {
  return m(r2, Object.assign({ get: f3, compare: a2 }, n3));
}
var p3 = (r2, t3, { interpret: n3 }) => r2.value.some((r3) => n3(r3, t3));
var g2 = (r2, t3, n3) => !p3(r2, t3, n3);
var m3 = (r2, t3, { interpret: n3 }) => r2.value.every((r3) => n3(r3, t3));
var y3 = (r2, t3, { interpret: n3 }) => !n3(r2.value[0], t3);
var b3 = (r2, t3, { compare: e4, get: o3 }) => {
  const u5 = o3(t3, r2.field);
  return Array.isArray(u5) && !Array.isArray(r2.value) ? n2(u5, r2.value, e4) : 0 === e4(u5, r2.value);
};
var A2 = (r2, t3, n3) => !b3(r2, t3, n3);
var d3 = u3((r2, t3, n3) => {
  const e4 = n3.compare(t3, r2.value);
  return 0 === e4 || -1 === e4;
});
var h3 = u3((r2, t3, n3) => -1 === n3.compare(t3, r2.value));
var j3 = u3((r2, t3, n3) => 1 === n3.compare(t3, r2.value));
var w3 = u3((r2, t3, n3) => {
  const e4 = n3.compare(t3, r2.value);
  return 0 === e4 || 1 === e4;
});
var _3 = (t3, n3, { get: o3 }) => {
  if (t3.field === n) return void 0 !== n3;
  const [u5, c5] = i2(n3, t3.field, o3), f4 = (r2) => null == r2 ? Boolean(r2) === t3.value : r2.hasOwnProperty(c5) === t3.value;
  return e2(u5, c5) ? u5.some(f4) : f4(u5);
};
var v3 = u3((r2, t3) => "number" == typeof t3 && t3 % r2.value[0] === r2.value[1]);
var x3 = (t3, n3, { get: o3 }) => {
  const [u5, c5] = i2(n3, t3.field, o3), f4 = (r2) => {
    const n4 = o3(r2, c5);
    return Array.isArray(n4) && n4.length === t3.value;
  };
  return t3.field !== n && e2(u5, c5) ? u5.some(f4) : f4(u5);
};
var O3 = u3((r2, t3) => "string" == typeof t3 && r2.value.test(t3));
var N2 = u3((r2, t3, { compare: e4 }) => n2(r2.value, t3, e4));
var $2 = (r2, t3, n3) => !N2(r2, t3, n3);
var q2 = (r2, t3, { compare: e4, get: o3 }) => {
  const u5 = o3(t3, r2.field);
  return Array.isArray(u5) && r2.value.every((r3) => n2(u5, r3, e4));
};
var z2 = (r2, t3, { interpret: n3, get: e4 }) => {
  const o3 = e4(t3, r2.field);
  return Array.isArray(o3) && o3.some((t4) => n3(r2.value, t4));
};
var B = (r2, t3) => r2.value.call(t3);
var E2 = Object.freeze({ __proto__: null, or: p3, nor: g2, and: m3, not: y3, eq: b3, ne: A2, lte: d3, lt: h3, gt: j3, gte: w3, exists: _3, mod: v3, size: x3, regex: O3, within: N2, nin: $2, all: q2, elemMatch: z2, where: B });
var M = Object.assign({}, E2, { in: N2 });
var S = l3(M);

// node_modules/.pnpm/@ucast+mongo2js@1.3.4/node_modules/@ucast/mongo2js/dist/es6m/index.mjs
function i3(o3) {
  return o3 instanceof Date ? o3.getTime() : o3 && "function" == typeof o3.toJSON ? o3.toJSON() : o3;
}
var m4 = (o3, t3) => a2(i3(o3), i3(t3));
function p4(e4, c5, f4) {
  const s3 = new P(e4), i4 = l3(c5, Object.assign({ compare: m4 }, f4));
  if (f4 && f4.forPrimitives) {
    const o3 = { field: n }, r2 = s3.parse;
    s3.setParse((t3) => r2(t3, o3));
  }
  return v(s3.parse, i4);
}
var a3 = p4(z, M);
var u4 = p4(["$and", "$or"].reduce((o3, t3) => (o3[t3] = Object.assign({}, o3[t3], { type: "field" }), o3), Object.assign({}, z, { $nor: Object.assign({}, z.$nor, { type: "field", parse: O.compound }) })), M, { forPrimitives: true });

// node_modules/.pnpm/@casl+ability@6.7.1/node_modules/@casl/ability/dist/es6m/index.mjs
function O4(t3) {
  return Array.isArray(t3) ? t3 : [t3];
}
var C = "__caslSubjectType__";
function R2(t3, i4) {
  if (i4) {
    if (!Object.hasOwn(i4, C)) Object.defineProperty(i4, C, { value: t3 });
    else if (t3 !== i4[C]) throw new Error(`Trying to cast object to subject type ${t3} but previously it was casted to ${i4[C]}`);
  }
  return i4;
}
var P2 = (t3) => {
  const i4 = typeof t3;
  return i4 === "string" || i4 === "function";
};
var S2 = (t3) => t3.modelName || t3.name;
function T(t3) {
  return typeof t3 === "string" ? t3 : S2(t3);
}
function z3(t3) {
  if (Object.hasOwn(t3, C)) return t3[C];
  return S2(t3.constructor);
}
var B2 = { function: (t3) => t3.constructor, string: z3 };
function U(t3, i4, e4) {
  for (let s3 = e4; s3 < i4.length; s3++) t3.push(i4[s3]);
}
function G(t3, i4) {
  if (!t3 || !t3.length) return i4 || [];
  if (!i4 || !i4.length) return t3 || [];
  let e4 = 0;
  let s3 = 0;
  const n3 = [];
  while (e4 < t3.length && s3 < i4.length) if (t3[e4].priority < i4[s3].priority) {
    n3.push(t3[e4]);
    e4++;
  } else {
    n3.push(i4[s3]);
    s3++;
  }
  U(n3, t3, e4);
  U(n3, i4, s3);
  return n3;
}
function H(t3, i4, e4) {
  let s3 = t3.get(i4);
  if (!s3) {
    s3 = e4();
    t3.set(i4, s3);
  }
  return s3;
}
var I = (t3) => t3;
function J(t3, i4) {
  if (Array.isArray(t3.fields) && !t3.fields.length) throw new Error("`rawRule.fields` cannot be an empty array. https://bit.ly/390miLa");
  if (t3.fields && !i4.fieldMatcher) throw new Error('You need to pass "fieldMatcher" option in order to restrict access by fields');
  if (t3.conditions && !i4.conditionsMatcher) throw new Error('You need to pass "conditionsMatcher" option in order to restrict access by conditions');
}
var K = class {
  constructor(t3, i4, e4 = 0) {
    J(t3, i4);
    this.action = i4.resolveAction(t3.action);
    this.subject = t3.subject;
    this.inverted = !!t3.inverted;
    this.conditions = t3.conditions;
    this.reason = t3.reason;
    this.origin = t3;
    this.fields = t3.fields ? O4(t3.fields) : void 0;
    this.priority = e4;
    this.t = i4;
  }
  i() {
    if (this.conditions && !this.o) this.o = this.t.conditionsMatcher(this.conditions);
    return this.o;
  }
  get ast() {
    const t3 = this.i();
    return t3 ? t3.ast : void 0;
  }
  matchesConditions(t3) {
    if (!this.conditions) return true;
    if (!t3 || P2(t3)) return !this.inverted;
    const i4 = this.i();
    return i4(t3);
  }
  matchesField(t3) {
    if (!this.fields) return true;
    if (!t3) return !this.inverted;
    if (this.fields && !this.u) this.u = this.t.fieldMatcher(this.fields);
    return this.u(t3);
  }
};
function N3(t3, i4) {
  const e4 = { value: t3, prev: i4, next: null };
  if (i4) i4.next = e4;
  return e4;
}
function Q(t3) {
  if (t3.next) t3.next.prev = t3.prev;
  if (t3.prev) t3.prev.next = t3.next;
  t3.next = t3.prev = null;
}
var V = (t3) => ({ value: t3.value, prev: t3.prev, next: t3.next });
var W = () => ({ rules: [], merged: false });
var X = () => /* @__PURE__ */ new Map();
var Z = class {
  constructor(t3 = [], i4 = {}) {
    this.h = false;
    this.l = /* @__PURE__ */ new Map();
    this.p = { conditionsMatcher: i4.conditionsMatcher, fieldMatcher: i4.fieldMatcher, resolveAction: i4.resolveAction || I };
    this.$ = i4.anyAction || "manage";
    this.A = i4.anySubjectType || "all";
    this.m = t3;
    this.M = !!i4.detectSubjectType;
    this.j = i4.detectSubjectType || z3;
    this.v(t3);
  }
  get rules() {
    return this.m;
  }
  detectSubjectType(t3) {
    if (P2(t3)) return t3;
    if (!t3) return this.A;
    return this.j(t3);
  }
  update(t3) {
    const i4 = { rules: t3, ability: this, target: this };
    this._("update", i4);
    this.m = t3;
    this.v(t3);
    this._("updated", i4);
    return this;
  }
  v(t3) {
    const i4 = /* @__PURE__ */ new Map();
    let e4;
    for (let s3 = t3.length - 1; s3 >= 0; s3--) {
      const n3 = t3.length - s3 - 1;
      const r2 = new K(t3[s3], this.p, n3);
      const o3 = O4(r2.action);
      const c5 = O4(r2.subject || this.A);
      if (!this.h && r2.fields) this.h = true;
      for (let t4 = 0; t4 < c5.length; t4++) {
        const s4 = H(i4, c5[t4], X);
        if (e4 === void 0) e4 = typeof c5[t4];
        if (typeof c5[t4] !== e4 && e4 !== "mixed") e4 = "mixed";
        for (let t5 = 0; t5 < o3.length; t5++) H(s4, o3[t5], W).rules.push(r2);
      }
    }
    this.l = i4;
    if (e4 !== "mixed" && !this.M) {
      const t4 = B2[e4] || B2.string;
      this.j = t4;
    }
  }
  possibleRulesFor(t3, i4 = this.A) {
    if (!P2(i4)) throw new Error('"possibleRulesFor" accepts only subject types (i.e., string or class) as the 2nd parameter');
    const e4 = H(this.l, i4, X);
    const s3 = H(e4, t3, W);
    if (s3.merged) return s3.rules;
    const n3 = t3 !== this.$ && e4.has(this.$) ? e4.get(this.$).rules : void 0;
    let r2 = G(s3.rules, n3);
    if (i4 !== this.A) r2 = G(r2, this.possibleRulesFor(t3, this.A));
    s3.rules = r2;
    s3.merged = true;
    return r2;
  }
  rulesFor(t3, i4, e4) {
    const s3 = this.possibleRulesFor(t3, i4);
    if (e4 && typeof e4 !== "string") throw new Error("The 3rd, `field` parameter is expected to be a string. See https://stalniy.github.io/casl/en/api/casl-ability#can-of-pure-ability for details");
    if (!this.h) return s3;
    return s3.filter((t4) => t4.matchesField(e4));
  }
  actionsFor(t3) {
    if (!P2(t3)) throw new Error('"actionsFor" accepts only subject types (i.e., string or class) as a parameter');
    const i4 = /* @__PURE__ */ new Set();
    const e4 = this.l.get(t3);
    if (e4) Array.from(e4.keys()).forEach((t4) => i4.add(t4));
    const s3 = t3 !== this.A ? this.l.get(this.A) : void 0;
    if (s3) Array.from(s3.keys()).forEach((t4) => i4.add(t4));
    return Array.from(i4);
  }
  on(t3, i4) {
    this.F = this.F || /* @__PURE__ */ new Map();
    const e4 = this.F;
    const s3 = e4.get(t3) || null;
    const n3 = N3(i4, s3);
    e4.set(t3, n3);
    return () => {
      const i5 = e4.get(t3);
      if (!n3.next && !n3.prev && i5 === n3) e4.delete(t3);
      else if (n3 === i5) e4.set(t3, n3.prev);
      Q(n3);
    };
  }
  _(t3, i4) {
    if (!this.F) return;
    let e4 = this.F.get(t3) || null;
    while (e4 !== null) {
      const t4 = e4.prev ? V(e4.prev) : null;
      e4.value(i4);
      e4 = t4;
    }
  }
};
var PureAbility = class extends Z {
  can(t3, i4, e4) {
    const s3 = this.relevantRuleFor(t3, i4, e4);
    return !!s3 && !s3.inverted;
  }
  relevantRuleFor(t3, i4, e4) {
    const s3 = this.detectSubjectType(i4);
    const n3 = this.rulesFor(t3, s3, e4);
    for (let t4 = 0, e5 = n3.length; t4 < e5; t4++) if (n3[t4].matchesConditions(i4)) return n3[t4];
    return null;
  }
  cannot(t3, i4, e4) {
    return !this.can(t3, i4, e4);
  }
};
var tt = { $eq: O2, $ne: R, $lt: E, $lte: j2, $gt: b2, $gte: g, $in: y2, $nin: x2, $all: v2, $size: w2, $regex: _2, $options: q, $elemMatch: $, $exists: m2 };
var it = { eq: b3, ne: A2, lt: h3, lte: d3, gt: j3, gte: w3, in: N2, nin: $2, all: q2, size: x3, regex: O3, elemMatch: z2, exists: _3, and: m3 };
var st = p4(tt, it);
var nt = /[-/\\^$+?.()|[\]{}]/g;
var rt = /\.?\*+\.?/g;
var ot = /\*+/;
var ct = /\./g;
function ut(t3, i4, e4) {
  const s3 = e4[0] === "*" || t3[0] === "." && t3[t3.length - 1] === "." ? "+" : "*";
  const n3 = t3.indexOf("**") === -1 ? "[^.]" : ".";
  const r2 = t3.replace(ct, "\\$&").replace(ot, n3 + s3);
  return i4 + t3.length === e4.length ? `(?:${r2})?` : r2;
}
function ht(t3, i4, e4) {
  if (t3 === "." && (e4[i4 - 1] === "*" || e4[i4 + 1] === "*")) return t3;
  return `\\${t3}`;
}
function lt(t3) {
  const i4 = t3.map((t4) => t4.replace(nt, ht).replace(rt, ut));
  const e4 = i4.length > 1 ? `(?:${i4.join("|")})` : i4[0];
  return new RegExp(`^${e4}$`);
}
var at = (t3) => {
  let i4;
  return (e4) => {
    if (typeof i4 === "undefined") i4 = t3.every((t4) => t4.indexOf("*") === -1) ? null : lt(t3);
    return i4 === null ? t3.indexOf(e4) !== -1 : i4.test(e4);
  };
};
var dt = (t3) => `Cannot execute "${t3.action}" on "${t3.subjectType}"`;
var yt = function t2(i4) {
  this.message = i4;
};
yt.prototype = Object.create(Error.prototype);
var ForbiddenError = class extends yt {
  static setDefaultMessage(t3) {
    this.P = typeof t3 === "string" ? () => t3 : t3;
  }
  static from(t3) {
    return new this(t3);
  }
  constructor(t3) {
    super("");
    this.ability = t3;
    if (typeof Error.captureStackTrace === "function") {
      this.name = "ForbiddenError";
      Error.captureStackTrace(this, this.constructor);
    }
  }
  setMessage(t3) {
    this.message = t3;
    return this;
  }
  throwUnlessCan(t3, i4, e4) {
    const s3 = this.unlessCan(t3, i4, e4);
    if (s3) throw s3;
  }
  unlessCan(t3, i4, e4) {
    const s3 = this.ability.relevantRuleFor(t3, i4, e4);
    if (s3 && !s3.inverted) return;
    this.action = t3;
    this.subject = i4;
    this.subjectType = T(this.ability.detectSubjectType(i4));
    this.field = e4;
    const n3 = s3 ? s3.reason : "";
    this.message = this.message || n3 || this.constructor.P(this);
    return this;
  }
};
ForbiddenError.P = dt;
var pt = Object.freeze({ __proto__: null });

// node_modules/.pnpm/@casl+ability@6.7.1/node_modules/@casl/ability/dist/es6m/extra/index.mjs
function c4(t3, n3, r2, e4) {
  const o3 = t3.detectSubjectType(r2);
  const i4 = t3.possibleRulesFor(n3, o3);
  const s3 = /* @__PURE__ */ new Set();
  const u5 = s3.delete.bind(s3);
  const c5 = s3.add.bind(s3);
  let f4 = i4.length;
  while (f4--) {
    const t4 = i4[f4];
    if (t4.matchesConditions(r2)) {
      const n4 = t4.inverted ? u5 : c5;
      e4.fieldsFrom(t4).forEach(n4);
    }
  }
  return Array.from(s3);
}
function h4(t3, n3, r2, e4) {
  const o3 = {};
  const i4 = t3.rulesFor(n3, r2);
  for (let t4 = 0; t4 < i4.length; t4++) {
    const n4 = i4[t4];
    const r3 = n4.inverted ? "$and" : "$or";
    if (!n4.conditions) if (n4.inverted) break;
    else {
      delete o3[r3];
      return o3;
    }
    else {
      o3[r3] = o3[r3] || [];
      o3[r3].push(e4(n4));
    }
  }
  return o3.$or ? o3 : null;
}
function a4(t3) {
  if (!t3.ast) throw new Error(`Ability rule "${JSON.stringify(t3)}" does not have "ast" property. So, cannot be used to generate AST`);
  return t3.inverted ? new r("not", [t3.ast]) : t3.ast;
}
function d4(r2, e4, o3) {
  const i4 = h4(r2, e4, o3, a4);
  if (i4 === null) return null;
  if (!i4.$and) return i4.$or ? b(i4.$or) : w([]);
  if (i4.$or) i4.$and.push(b(i4.$or));
  return w(i4.$and);
}

// node_modules/.pnpm/@casl+prisma@1.4.1_@casl+ability@6.7.1_@prisma+client@5.14.0_prisma@5.14.0_/node_modules/@casl/prisma/dist/es6m/runtime.mjs
var v4 = class extends Error {
  static invalidArgument(t3, e4, r2) {
    const n3 = `${typeof e4}(${JSON.stringify(e4, null, 2)})`;
    return new this(`"${t3}" expects to receive ${r2} but instead got "${n3}"`);
  }
};
var O5 = (t3) => t3 && (t3.constructor === Object || !t3.constructor);
var j4 = { type: "field", validate(t3, e4) {
  if (Array.isArray(e4) || O5(e4)) throw new v4(`"${t3.name}" does not supports comparison of arrays and objects`);
} };
var N4 = { type: "field", parse(r2, n3, { hasOperators: o3, field: s3, parse: a5 }) {
  if (O5(n3) && !o3(n3) || Array.isArray(n3)) throw new v4(`"${r2.name}" does not supports comparison of arrays and objects`);
  if (!O5(n3)) return new o("notEquals", s3, n3);
  return new r("NOT", [a5(n3, { field: s3 })]);
} };
var $3 = { type: "field", validate(t3, e4) {
  if (!Array.isArray(e4)) throw v4.invalidArgument(t3.name, e4, "an array");
} };
var E3 = { type: "field", validate(t3, e4) {
  const r2 = typeof e4;
  const n3 = r2 === "string" || r2 === "number" && Number.isFinite(e4) || e4 instanceof Date;
  if (!n3) throw v4.invalidArgument(t3.name, e4, "comparable value");
} };
var q3 = /* @__PURE__ */ new Set(["insensitive", "default"]);
var x4 = { type: "field", validate(t3, e4) {
  if (!q3.has(e4)) throw v4.invalidArgument(t3.name, e4, `one of ${Array.from(q3).join(", ")}`);
}, parse: () => s };
var T2 = { type: "field", validate(t3, e4) {
  if (typeof e4 !== "string") throw v4.invalidArgument(t3.name, e4, "string");
}, parse(e4, r2, { query: n3, field: o3 }) {
  const s3 = n3.mode === "insensitive" ? `i${e4.name}` : e4.name;
  return new o(s3, o3, r2);
} };
var W2 = { type: "compound", validate(t3, e4) {
  if (!e4 || typeof e4 !== "object") throw v4.invalidArgument(t3.name, e4, "an array or object");
}, parse(t3, r2, { parse: n3 }) {
  const o3 = Array.isArray(r2) ? r2 : [r2];
  const s3 = o3.map((t4) => n3(t4));
  return new r(t3.name, s3);
} };
var S3 = { type: "field", validate(t3, e4) {
  if (typeof e4 !== "boolean") throw v4.invalidArgument(t3.name, e4, "a boolean");
} };
var D = { type: "field" };
var C2 = { type: "field", validate(t3, e4) {
  if (!Array.isArray(e4)) throw v4.invalidArgument(t3.name, e4, "an array");
} };
var F = { type: "field", parse(e4, r2, { field: n3, parse: o3 }) {
  if (!O5(r2)) throw v4.invalidArgument(e4.name, r2, "a query for nested relation");
  return new o(e4.name, n3, o3(r2));
} };
var I2 = (r2, n3) => {
  const o3 = n3.parse;
  if (!o3) return Object.assign({}, n3, { parse(n4, o4, s3) {
    return new r("NOT", [new o(r2, s3.field, o4)]);
  } });
  return Object.assign({}, n3, { parse(t3, n4, s3) {
    const a5 = o3(t3, n4, s3);
    if (a5.operator !== t3.name) throw new Error(`Cannot invert "${r2}" operator parser because it returns a complex Condition`);
    a5.operator = r2;
    return new r("NOT", [a5]);
  } });
};
var M2 = { equals: j4, not: N4, in: $3, notIn: I2("in", $3), lt: E3, lte: E3, gt: E3, gte: E3, mode: x4, startsWith: T2, endsWith: T2, contains: T2, isEmpty: S3, has: D, hasSome: C2, hasEvery: C2, NOT: W2, AND: W2, OR: W2, every: F, some: F, none: I2("some", F), is: F, isNot: I2("is", F) };
var R3 = class extends j {
  constructor() {
    super(M2, { defaultOperatorName: "equals" });
  }
  parse(t3, e4) {
    if (e4 && e4.field) return w(this.parseFieldOperators(e4.field, t3));
    return super.parse(t3);
  }
};
var _4 = (t3, e4, { get: r2 }) => r2(e4, t3.field).startsWith(t3.value);
var J2 = (t3, e4, { get: r2 }) => r2(e4, t3.field).toLowerCase().startsWith(t3.value.toLowerCase());
var P3 = (t3, e4, { get: r2 }) => r2(e4, t3.field).endsWith(t3.value);
var k = (t3, e4, { get: r2 }) => r2(e4, t3.field).toLowerCase().endsWith(t3.value.toLowerCase());
var z4 = (t3, e4, { get: r2 }) => r2(e4, t3.field).includes(t3.value);
var B3 = (t3, e4, { get: r2 }) => r2(e4, t3.field).toLowerCase().includes(t3.value.toLowerCase());
var G2 = (t3, e4, { get: r2 }) => {
  const n3 = r2(e4, t3.field);
  const o3 = Array.isArray(n3) && n3.length === 0;
  return o3 === t3.value;
};
var H2 = (t3, e4, { get: r2 }) => {
  const n3 = r2(e4, t3.field);
  return Array.isArray(n3) && n3.includes(t3.value);
};
var K2 = (t3, e4, { get: r2 }) => {
  const n3 = r2(e4, t3.field);
  return Array.isArray(n3) && t3.value.some((t4) => n3.includes(t4));
};
var L = (t3, e4, { get: r2 }) => {
  const n3 = r2(e4, t3.field);
  return Array.isArray(n3) && t3.value.every((t4) => n3.includes(t4));
};
var Q2 = (t3, e4, { get: r2, interpret: n3 }) => {
  const o3 = r2(e4, t3.field);
  return Array.isArray(o3) && o3.length > 0 && o3.every((e5) => n3(t3.value, e5));
};
var U2 = (t3, e4, { get: r2, interpret: n3 }) => {
  const o3 = r2(e4, t3.field);
  return Array.isArray(o3) && o3.some((e5) => n3(t3.value, e5));
};
var V2 = (t3, e4, { get: r2, interpret: n3 }) => {
  const o3 = r2(e4, t3.field);
  return o3 && typeof o3 === "object" && n3(t3.value, o3);
};
var X2 = (t3, e4, { interpret: r2 }) => t3.value.every((t4) => !r2(t4, e4));
function Y(t3) {
  return t3 && typeof t3 === "object" ? t3.valueOf() : t3;
}
var Z2 = (t3, e4) => a2(Y(t3), Y(e4));
var tt2 = l3({ equals: b3, notEquals: A2, in: N2, lt: h3, lte: d3, gt: j3, gte: w3, startsWith: _4, istartsWith: J2, endsWith: P3, iendsWith: k, contains: z4, icontains: B3, isEmpty: G2, has: H2, hasSome: K2, hasEvery: L, and: m3, or: p3, AND: m3, OR: p3, NOT: X2, every: Q2, some: U2, is: V2 }, { get: (t3, e4) => t3[e4], compare: Z2 });
var et = new R3();
var rt2 = v(et.parse, tt2);
function nt2(t3) {
  return t3.inverted ? { NOT: t3.conditions } : t3.conditions;
}
var ot2 = { get(t3, e4) {
  const r2 = h4(t3.t, t3.o, e4, nt2);
  if (r2 === null) {
    const r3 = ForbiddenError.from(t3.t).setMessage(`It's not allowed to run "${t3.o}" on "${e4}"`);
    r3.action = t3.o;
    r3.subjectType = r3.subject = e4;
    throw r3;
  }
  const n3 = /* @__PURE__ */ Object.create(null);
  if (r2.$or) n3.OR = r2.$or;
  if (r2.$and) n3.AND = r2.$and;
  return n3;
} };
var st2 = () => function t3(e4, r2 = "read") {
  return new Proxy({ t: e4, o: r2 }, ot2);
};
function createAbilityFactory() {
  function createAbility(t3 = [], e4 = {}) {
    return new PureAbility(t3, Object.assign({}, e4, { conditionsMatcher: rt2, fieldMatcher: at }));
  }
  return createAbility;
}

// node_modules/.pnpm/@casl+prisma@1.4.1_@casl+ability@6.7.1_@prisma+client@5.14.0_prisma@5.14.0_/node_modules/@casl/prisma/dist/es6m/index.mjs
var e3 = createAbilityFactory();
var m5 = st2();

// src/applyAccessibleQuery.ts
function applyAccessibleQuery(query, accessibleQuery) {
  return {
    ...query,
    AND: [
      ...query.AND ?? [],
      accessibleQuery
    ]
  };
}

// src/helpers.ts
import { Prisma } from "@prisma/client";
var caslOperationDict = {
  create: { action: "create", dataQuery: true, whereQuery: false, includeSelectQuery: true },
  createMany: { action: "create", dataQuery: true, whereQuery: false, includeSelectQuery: true },
  createManyAndReturn: { action: "create", dataQuery: true, whereQuery: false, includeSelectQuery: true },
  upsert: { action: "create", dataQuery: true, whereQuery: true, includeSelectQuery: true },
  findFirst: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findFirstOrThrow: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findMany: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findUnique: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findUniqueOrThrow: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  aggregate: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: false },
  count: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: false },
  groupBy: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: false },
  update: { action: "update", dataQuery: true, whereQuery: true, includeSelectQuery: true },
  updateMany: { action: "update", dataQuery: true, whereQuery: true, includeSelectQuery: false },
  delete: { action: "delete", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  deleteMany: { action: "delete", dataQuery: false, whereQuery: true, includeSelectQuery: false }
};
var caslNestedOperationDict = {
  upsert: "create",
  connect: "update",
  connectOrCreate: "create",
  create: "create",
  createMany: "create",
  update: "update",
  updateMany: "update",
  delete: "delete",
  deleteMany: "delete",
  disconnect: "update",
  set: "update"
};
var relationFieldsByModel = Object.fromEntries(Prisma.dmmf.datamodel.models.map((model) => {
  const relationFields = Object.fromEntries(model.fields.filter((field) => field && field.kind === "object" && field.relationName).map((field) => [field.name, field]));
  return [model.name, relationFields];
}));
var propertyFieldsByModel = Object.fromEntries(Prisma.dmmf.datamodel.models.map((model) => {
  const propertyFields = Object.fromEntries(model.fields.filter((field) => !(field && field.kind === "object" && field.relationName)).map((field) => {
    const relation = Object.values(relationFieldsByModel[model.name]).find((value) => value.relationFromFields.includes(field.name));
    return [field.name, relation?.name];
  }));
  return [model.name, propertyFields];
}));
function pick(obj, keys) {
  return keys.reduce((acc, val) => {
    if (obj && val in obj) {
      acc[val] = obj[val];
    }
    return acc;
  }, {});
}
function getPermittedFields(abilities, action, model, obj) {
  const modelFields = Object.keys(propertyFieldsByModel[model]);
  const permittedFields = c4(abilities, action, obj ? getSubject(model, obj) : model, {
    fieldsFrom: (rule) => {
      return rule.fields || modelFields;
    }
  });
  return permittedFields;
}
function getSubject(model, obj) {
  const modelFields = Object.keys(propertyFieldsByModel[model]);
  const subjectFields = [...modelFields, ...Object.keys(relationFieldsByModel[model])];
  return R2(model, pick(obj, subjectFields));
}
function getFluentModel(startModel, data) {
  const dataPath = data?.__internalParams?.dataPath;
  if (dataPath?.length > 0) {
    return dataPath.filter((x5) => x5 !== "select").reduce((acc, x5) => {
      acc = relationFieldsByModel[acc][x5].type;
      return acc;
    }, startModel);
  } else {
    return startModel;
  }
}

// src/applyDataQuery.ts
function applyDataQuery(abilities, args, action, model, creationTree) {
  const tree = creationTree ? creationTree : { action, model, children: {} };
  const permittedFields = getPermittedFields(abilities, action, model);
  const accessibleQuery = m5(abilities, action)[model];
  const mutationArgs = [];
  (Array.isArray(args) ? args : [args]).map((argsEntry) => {
    let hasWhereQuery = false;
    ["update", "create", "data"].forEach((nestedAction) => {
      if (nestedAction in argsEntry) {
        const nestedArgs = argsEntry[nestedAction];
        Array.isArray(nestedArgs) ? mutationArgs.push(...nestedArgs) : mutationArgs.push(nestedArgs);
        if (!hasWhereQuery && "where" in argsEntry) {
          hasWhereQuery = true;
          argsEntry.where = applyAccessibleQuery(
            argsEntry.where,
            nestedAction !== "update" && nestedAction !== "create" ? accessibleQuery : m5(abilities, "update")[model]
          );
        }
      }
    });
    if (mutationArgs.length === 0) {
      mutationArgs.push(argsEntry);
    }
  });
  mutationArgs.map((mutation) => {
    const queriedFields = (mutation ? Object.keys(mutation) : []).map((field) => {
      const relationModelId = propertyFieldsByModel[model][field];
      if (relationModelId) {
        mutation[relationModelId] = { connect: { id: mutation[field] } };
        delete mutation[field];
        return relationModelId;
      } else {
        return field;
      }
    });
    queriedFields.forEach((field) => {
      const relationModel = relationFieldsByModel[model][field];
      if (permittedFields?.includes(field) === false && !relationModel) {
        throw new Error(`It's not allowed to "${action}" "${field}" on "${model}"`);
      } else if (relationModel) {
        Object.entries(mutation[field]).forEach(([nestedAction, nestedArgs]) => {
          if (nestedAction in caslNestedOperationDict) {
            const mutationAction = caslNestedOperationDict[nestedAction];
            const isConnection = nestedAction === "connect" || nestedAction === "disconnect";
            tree.children[field] = { action: mutationAction, model: relationModel.type, children: {} };
            const dataQuery = applyDataQuery(abilities, nestedArgs, mutationAction, relationModel.type, tree.children[field]);
            mutation[field][nestedAction] = dataQuery.args;
            if (isConnection) {
              const accessibleQuery2 = m5(abilities, mutationAction)[relationModel.type];
              if (Array.isArray(mutation[field][nestedAction])) {
                mutation[field][nestedAction] = mutation[field][nestedAction].map((q4) => applyAccessibleQuery(q4, accessibleQuery2));
              } else {
                mutation[field][nestedAction] = applyAccessibleQuery(mutation[field][nestedAction], accessibleQuery2);
              }
            }
          } else {
            throw new Error(`Unknown nested action ${nestedAction} on ${model}`);
          }
        });
      }
    });
  });
  return { args, creationTree: tree };
}

// src/applyWhereQuery.ts
function applyWhereQuery(abilities, args, action, model, relation) {
  const prismaModel = model in relationFieldsByModel ? model : void 0;
  if (!prismaModel) {
    throw new Error(`Model ${model} does not exist on Prisma Client`);
  }
  const accessibleQuery = m5(abilities, action)[prismaModel];
  if (Object.keys(accessibleQuery).length > 0) {
    if (args === true) {
      args = {};
    }
    if (!args.where) {
      args.where = {};
    }
    args.where = applyAccessibleQuery(args.where, relation && accessibleQuery ? { [relation]: accessibleQuery } : accessibleQuery);
  }
  return args;
}

// src/applyIncludeSelectQuery.ts
function applyIncludeSelectQuery(abilities, args, model) {
  ;
  ["include", "select"].forEach((method) => {
    if (args && args[method]) {
      for (const relation in args[method]) {
        if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
          const relationField = relationFieldsByModel[model][relation];
          if (relationField) {
            if (relationField.isList) {
              const methodQuery = applyWhereQuery(abilities, args[method][relation], "read", relationField.type);
              args[method][relation] = methodQuery.select && Object.keys(methodQuery.select).length === 0 ? false : methodQuery;
            } else {
              args = applyWhereQuery(abilities, args, "read", relationField.type, relation);
            }
            args[method][relation] = applyIncludeSelectQuery(abilities, args[method][relation], relationField.type);
          }
        }
      }
    }
  });
  return args;
}

// src/getRuleRelationsQuery.ts
function flattenAst(ast) {
  if (["and", "or"].includes(ast.operator.toLowerCase())) {
    return ast.value.flatMap((childAst) => flattenAst(childAst));
  } else {
    return [ast];
  }
}
function getRuleRelationsQuery(model, ast, dataRelationQuery = {}) {
  const obj = dataRelationQuery;
  if (ast) {
    if (typeof ast.value === "object") {
      flattenAst(ast).map((childAst) => {
        const relation = relationFieldsByModel[model];
        if (childAst.field) {
          if (childAst.field in relation) {
            const dataInclude = obj[childAst.field] !== void 0 ? obj[childAst.field] : {};
            obj[childAst.field] = {
              select: getRuleRelationsQuery(relation[childAst.field].type, childAst.value, dataInclude === true ? {} : dataInclude.select)
            };
          } else {
            obj[childAst.field] = true;
          }
        }
      });
    } else {
      obj[ast.field] = true;
    }
  }
  return obj;
}

// src/convertCreationTreeToSelect.ts
function convertCreationTreeToSelect(abilities, relationQuery) {
  let relationResult = {};
  if (relationQuery.action === "create") {
    const ast = d4(abilities, relationQuery.action, relationQuery.model);
    relationResult = getRuleRelationsQuery(relationQuery.model, ast, {});
  }
  if (Object.keys(relationQuery.children).length === 0) {
    return relationQuery.action === "create" ? relationResult : null;
  }
  for (const key in relationQuery.children) {
    const childRelation = convertCreationTreeToSelect(abilities, relationQuery.children[key]);
    if (childRelation !== null) {
      relationResult[key] = { select: childRelation };
    }
  }
  return Object.keys(relationResult).length > 0 ? relationResult : relationQuery.action === "create" ? {} : null;
}

// src/applyRuleRelationsQuery.ts
function mergeArgsAndRelationQuery(args, relationQuery) {
  const mask = {};
  let found = false;
  ["include", "select"].map((method) => {
    if (args[method]) {
      found = true;
      for (const key in relationQuery) {
        if (!(key in args[method])) {
          if (relationQuery[key].select) {
            args[method][key] = Object.keys(relationQuery[key].select).length === 0 ? true : relationQuery[key];
            mask[key] = true;
          } else if (method === "select") {
            args[method][key] = relationQuery[key];
            mask[key] = true;
          }
        } else if (args[method][key] && typeof args[method][key] === "object") {
          const child = relationQuery[key].select ? mergeArgsAndRelationQuery(args[method][key], relationQuery[key].select) : { args: args[method][key], mask: true };
          args[method][key] = child.args;
          mask[key] = child.mask;
        } else if (args[method][key] === true) {
          if (relationQuery[key].select) {
            for (const field in relationQuery[key].select) {
              if (relationQuery[key].select[field]?.select) {
                args[method][key] = {
                  include: {
                    ...args[method][key]?.include ?? {},
                    [field]: relationQuery[key].select[field]
                  }
                };
                mask[key] = {
                  ...mask?.[key] ?? {},
                  [field]: true
                };
              }
            }
          }
        }
      }
    }
  });
  if (found === false) {
    Object.entries(relationQuery).forEach(([k2, v5]) => {
      if (v5?.select) {
        args.include = {
          ...args.include ?? {},
          [k2]: v5
        };
        mask[k2] = removeNestedIncludeSelect(v5.select);
      }
    });
  }
  return {
    args,
    mask
  };
}
function removeNestedIncludeSelect(args) {
  return typeof args === "object" ? Object.fromEntries(Object.entries(args).map(([k2, v5]) => {
    if (v5?.select) {
      return [k2, removeNestedIncludeSelect(v5.select)];
    } else if (v5?.include) {
      return [k2, removeNestedIncludeSelect(v5.include)];
    } else {
      return [k2, v5];
    }
  })) : args;
}
function applyRuleRelationsQuery(args, abilities, action, model, creationTree) {
  const creationSelectQuery = creationTree ? convertCreationTreeToSelect(abilities, creationTree) ?? {} : {};
  const queryRelations = getNestedQueryRelations(args, abilities, action, model, creationSelectQuery === true ? {} : creationSelectQuery);
  if (!args.select && !args.include) {
    args.include = {};
  }
  const result = mergeArgsAndRelationQuery(args, queryRelations);
  if ("include" in result.args && Object.keys(result.args.include).length === 0) {
    delete result.args.include;
  }
  return { ...result, creationTree };
}
function getNestedQueryRelations(args, abilities, action, model, creationSelectQuery = {}) {
  const ability = e3(abilities.rules.filter((rule) => rule.conditions).map((rule) => {
    return {
      ...rule,
      inverted: false
    };
  }));
  const ast = d4(ability, action, model);
  const queryRelations = getRuleRelationsQuery(model, ast, creationSelectQuery === true ? {} : creationSelectQuery);
  ["include", "select"].map((method) => {
    if (args && args[method]) {
      for (const relation in args[method]) {
        if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
          const relationField = relationFieldsByModel[model][relation];
          if (relationField) {
            const nestedQueryRelations = {
              ...getNestedQueryRelations(args[method][relation], abilities, "read", relationField.type),
              ...queryRelations[relation]?.select ?? {}
            };
            if (nestedQueryRelations && Object.keys(nestedQueryRelations).length > 0) {
              queryRelations[relation] = {
                ...queryRelations[relation] ?? {},
                select: nestedQueryRelations
              };
            }
          }
        }
      }
    }
  });
  return queryRelations;
}

// src/applyCaslToQuery.ts
function applyCaslToQuery(operation, args, abilities, model) {
  const operationAbility = caslOperationDict[operation];
  m5(abilities, operationAbility.action)[model];
  let creationTree = void 0;
  if (operationAbility.dataQuery && args.data) {
    const { args: dataArgs, creationTree: dataCreationTree } = applyDataQuery(abilities, args.data, operationAbility.action, model);
    creationTree = dataCreationTree;
    args.data = dataArgs;
  }
  if (operationAbility.whereQuery) {
    args = applyWhereQuery(abilities, args, operationAbility.action, model);
  }
  if (operationAbility.includeSelectQuery) {
    args = applyIncludeSelectQuery(abilities, args, model);
    if (!operationAbility.whereQuery && args.where) {
      delete args.where;
    }
  } else {
    delete args.include;
    delete args.select;
  }
  const result = operationAbility.includeSelectQuery ? applyRuleRelationsQuery(args, abilities, operationAbility.action, model, creationTree) : { args, mask: void 0, creationTree };
  return result;
}

// src/filterQueryResults.ts
function filterQueryResults(result, mask, creationTree, abilities, model) {
  if (typeof result === "number") {
    return result;
  }
  const prismaModel = model in relationFieldsByModel ? model : void 0;
  if (!prismaModel) {
    throw new Error(`Model ${model} does not exist on Prisma Client`);
  }
  const filterPermittedFields = (entry) => {
    if (!entry) {
      return null;
    }
    if (creationTree?.action === "create") {
      try {
        if (!abilities.can("create", getSubject(model, entry))) {
          throw new Error("");
        }
      } catch (e4) {
        throw new Error(`It's not allowed to create on ${model} ` + e4);
      }
    }
    const permittedFields = getPermittedFields(abilities, "read", model, entry);
    let hasKeys = false;
    Object.keys(entry).forEach((field) => {
      const relationField = relationFieldsByModel[model][field];
      if (relationField) {
        const nestedCreationTree = creationTree && field in creationTree.children ? creationTree.children[field] : void 0;
        const res = filterQueryResults(entry[field], mask?.[field], nestedCreationTree, abilities, relationField.type);
        entry[field] = Array.isArray(res) ? res.length > 0 ? res : null : res;
      }
      if (!permittedFields.includes(field) && !relationField || mask?.[field] === true) {
        delete entry[field];
      } else if (relationField) {
        hasKeys = true;
        if (entry[field] === null) {
          delete entry[field];
        }
      } else {
        hasKeys = true;
      }
    });
    return hasKeys && Object.keys(entry).length > 0 ? entry : null;
  };
  if (Array.isArray(result)) {
    return result.map((entry) => filterPermittedFields(entry)).filter((x5) => x5);
  } else {
    return filterPermittedFields(result);
  }
}

// src/index.ts
function useCaslAbilities(getAbilityFactory) {
  return Prisma2.defineExtension((client) => {
    let getAbilities = () => getAbilityFactory();
    return client.$extends({
      name: "prisma-extension-casl",
      client: {
        // https://github.com/prisma/prisma/issues/20678
        // $transaction(...props: Parameters<(typeof client)['$transaction']>): ReturnType<(typeof client)['$transaction']> {
        //     return transactionStore.run({ alreadyInTransaction: true }, () => {
        //         return client.$transaction(...props);
        //     });
        // },
        $casl(extendFactory) {
          const ctx = Prisma2.getExtensionContext(this);
          getAbilities = () => extendFactory(getAbilityFactory());
          return ctx;
        }
      },
      query: {
        $allModels: {
          async $allOperations({ args, query, model, operation, ...rest }) {
            const op = operation === "createMany" ? "createManyAndReturn" : operation;
            const transaction = rest.__internalParams.transaction;
            const debug = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" && args.debugCasl;
            delete args.debugCasl;
            const perf = debug ? performance : void 0;
            const logger = debug ? console : void 0;
            perf?.clearMeasures("prisma-casl-extension-Overall");
            perf?.clearMeasures("prisma-casl-extension-Create Abilities");
            perf?.clearMeasures("prisma-casl-extension-Create Casl Query");
            perf?.clearMeasures("prisma-casl-extension-Finish Query");
            perf?.clearMeasures("prisma-casl-extension-Filtering Results");
            perf?.clearMarks("prisma-casl-extension-0");
            perf?.clearMarks("prisma-casl-extension-1");
            perf?.clearMarks("prisma-casl-extension-2");
            perf?.clearMarks("prisma-casl-extension-3");
            perf?.clearMarks("prisma-casl-extension-4");
            if (!(op in caslOperationDict)) {
              return query(args);
            }
            perf?.mark("prisma-casl-extension-0");
            const abilities = transaction?.abilities ?? getAbilities().build();
            if (transaction) {
              transaction.abilities = abilities;
            }
            getAbilities = () => getAbilityFactory();
            perf?.mark("prisma-casl-extension-1");
            const caslQuery = applyCaslToQuery(operation, args, abilities, model);
            perf?.mark("prisma-casl-extension-2");
            logger?.log("Query Args", JSON.stringify(caslQuery.args));
            logger?.log("Query Mask", JSON.stringify(caslQuery.mask));
            const cleanupResults = (result) => {
              perf?.mark("prisma-casl-extension-3");
              const res = filterQueryResults(result, caslQuery.mask, caslQuery.creationTree, abilities, getFluentModel(model, rest));
              if (perf) {
                perf.mark("prisma-casl-extension-4");
                logger?.log(
                  [
                    perf.measure("prisma-casl-extension-Overall", "prisma-casl-extension-0", "prisma-casl-extension-4"),
                    perf.measure("prisma-casl-extension-Create Abilities", "prisma-casl-extension-0", "prisma-casl-extension-1"),
                    perf.measure("prisma-casl-extension-Create Casl Query", "prisma-casl-extension-1", "prisma-casl-extension-2"),
                    perf.measure("prisma-casl-extension-Finish Query", "prisma-casl-extension-2", "prisma-casl-extension-3"),
                    perf.measure("prisma-casl-extension-Filtering Results", "prisma-casl-extension-3", "prisma-casl-extension-4")
                  ].map((measure) => {
                    return `${measure.name.replace("prisma-casl-extension-", "")}: ${measure.duration}`;
                  })
                );
              }
              return operation === "createMany" ? { count: res.length } : res;
            };
            const operationAbility = caslOperationDict[operation];
            if (operationAbility.action === "update" || operationAbility.action === "create") {
              if (transaction) {
                if (transaction.kind === "itx") {
                  const transactionClient = client._createItxClient(transaction);
                  return transactionClient[model][op](caslQuery.args).then(cleanupResults);
                } else if (transaction.kind === "batch") {
                  throw new Error("Sequential transactions are not supported in prisma-extension-casl.");
                }
              } else {
                return client.$transaction(async (tx) => {
                  return tx[model][op](caslQuery.args).then(cleanupResults);
                });
              }
            } else {
              return query(caslQuery.args).then(cleanupResults);
            }
          }
        }
      }
    });
  });
}
export {
  applyCaslToQuery,
  useCaslAbilities
};
