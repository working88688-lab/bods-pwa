!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
      ? define(["exports"], t)
      : t(
          ((e =
            "undefined" != typeof globalThis ? globalThis : e || self).WebSDK =
            {}),
        );
})(this, function (e) {
  "use strict";
  const t = "/api/eventTracking/batchReport.json",
    i = "__web_sdk_remote_config_cache__",
    r = "1.0.0",
    n = [
      "navigation",
      "app_page_view",
      "page_click",
      "recommend_list_view",
      "recommend_list_click",
      "advertising",
      "video_event",
      "video_like",
      "video_comment",
      "video_collect",
      "video_purchase",
      "video_status_change",
      "novel_event",
      "novel_like",
      "novel_comment",
      "novel_collect",
      "novel_purchase",
      "comic_event",
      "comic_like",
      "comic_comment",
      "comic_collect",
      "comic_purchase",
      "keyword_search",
      "keyword_click",
      "ad_impression",
      "ad_click",
      "page_lifecycle",
    ],
    o = [
      "event",
      "event_id",
      "payload",
      "app_id",
      "channel",
      "client_ts",
      "device",
      "device_brand",
      "device_model",
      "device_id",
      "device_fingerprint",
      "fp_version",
      "sid",
      "uid",
      "user_agent",
    ];
  class s {
    constructor(e = {}) {
      ((this.selectedBatchEndpoint = ""),
        (this.remoteEndpoints = []),
        (this.remoteProbePromise = null),
        (this.remoteProbeKey = ""),
        (this.shouldPersistQueueOnProbeFailure = !1),
        (this.hasBatchProbeStarted = !1),
        (this.initialized = !1),
        (this.initPromise = null),
        (this.endpointReadyListeners = []),
        (this.timeoutMs = Number(e.pingTimeoutMs) || 1500));
    }
    endpointToProbeUrl(e) {
      try {
        return `${new URL(e).origin}/favicon.ico`;
      } catch (t) {
        return e;
      }
    }
    normalizeBatchEndpoints(e = []) {
      return (Array.isArray(e) ? e : [])
        .map((e) => String(e || "").trim())
        .filter(Boolean)
        .map((e) => {
          try {
            return `${new URL(e).origin}${t}`;
          } catch (i) {
            return `${e.replace(/\/+$/, "")}${t}`;
          }
        });
    }
    async withTimeout(e, t) {
      return new Promise((i, r) => {
        const n = setTimeout(() => r(new Error("timeout")), t);
        e.then((e) => {
          (clearTimeout(n), i(e));
        }).catch((e) => {
          (clearTimeout(n), r(e));
        });
      });
    }
    async pickFastestEndpoint(e, t) {
      if ("undefined" == typeof fetch) {
        const t = e[0] || "";
        return (
          t &&
            "undefined" != typeof console &&
            console.warn &&
            console.warn(
              "[sdk][probe] fetch unavailable, fallback to first endpoint:",
              t,
            ),
          t
        );
      }
      const i = e.map(async (e) => {
          const i = this.endpointToProbeUrl(e),
            r = Date.now();
          try {
            return (
              await this.withTimeout(
                fetch(i, { method: "GET", mode: "no-cors", cache: "no-store" }),
                t,
              ),
              { endpoint: e, cost: Date.now() - r, ok: !0 }
            );
          } catch (t) {
            return { endpoint: e, cost: Number.MAX_SAFE_INTEGER, ok: !1 };
          }
        }),
        r = await Promise.all(i);
      "undefined" != typeof console &&
        console.log &&
        console.log(
          "[sdk][probe] endpoint speed:",
          r.map((e) => ({
            endpoint: e.endpoint,
            ok: e.ok,
            costMs: e.ok ? e.cost : -1,
          })),
        );
      const n = r.filter((e) => e.ok);
      return n.length
        ? (n.sort((e, t) => e.cost - t.cost),
          "undefined" != typeof console &&
            console.log &&
            console.log(
              "[sdk][probe] selected fastest endpoint:",
              n[0].endpoint,
              `${n[0].cost}ms`,
            ),
          n[0].endpoint)
        : "";
    }
    notifyEndpointReady() {
      this.endpointReadyListeners.forEach((e) => {
        try {
          e(this.selectedBatchEndpoint);
        } catch (e) {}
      });
    }
    setSelectedBatchEndpoint(e) {
      const t = String(e || "");
      t &&
        t !== this.selectedBatchEndpoint &&
        ((this.selectedBatchEndpoint = t), this.notifyEndpointReady());
    }
    startRemoteProbe(e) {
      const t = e.join("|");
      return e.length
        ? ((this.remoteProbePromise && this.remoteProbeKey === t) ||
            ((this.remoteProbeKey = t),
            (this.shouldPersistQueueOnProbeFailure = !1),
            (this.remoteProbePromise = this.pickFastestEndpoint(
              e,
              this.timeoutMs,
            )
              .then((t) => {
                if (t) this.setSelectedBatchEndpoint(t);
                else if (!this.selectedBatchEndpoint && e.length) {
                  this.shouldPersistQueueOnProbeFailure = !0;
                  const t = Math.floor(Math.random() * e.length),
                    i = e[t];
                  (this.setSelectedBatchEndpoint(i),
                    "undefined" != typeof console &&
                      console.log &&
                      console.log(
                        "[sdk][probe] all failed, random endpoint selected:",
                        i,
                      ));
                }
                return this.selectedBatchEndpoint;
              })
              .catch(() => this.selectedBatchEndpoint))),
          this.remoteProbePromise)
        : Promise.resolve("");
    }
    async refreshDomainConfig(e) {
      const t = await e(),
        i = this.normalizeBatchEndpoints(t);
      return (
        (this.remoteEndpoints = i),
        "undefined" != typeof console &&
          console.log &&
          console.log("[sdk][config] resolved batch endpoint list:", i),
        i.length
          ? ((this.hasBatchProbeStarted = !0),
            this.startRemoteProbe(i),
            this.selectedBatchEndpoint)
          : this.selectedBatchEndpoint
      );
    }
    async init(e) {
      if (!this.initialized)
        return (
          this.initPromise ||
            (this.initPromise = (async () => {
              ((this.initialized = !0),
                this.refreshDomainConfig(e).catch(() => {}));
            })()),
          this.initPromise
        );
    }
    async resolveEndpoint(e, t) {
      return (
        t ||
        (await this.init(e),
        this.selectedBatchEndpoint ? this.selectedBatchEndpoint : "")
      );
    }
    onEndpointReady(e) {
      return "function" != typeof e
        ? () => {}
        : (this.endpointReadyListeners.push(e),
          () => {
            const t = this.endpointReadyListeners.indexOf(e);
            0 > t || this.endpointReadyListeners.splice(t, 1);
          });
    }
    consumeProbeFailurePersistSignal() {
      return (
        !!this.shouldPersistQueueOnProbeFailure &&
        ((this.shouldPersistQueueOnProbeFailure = !1), !0)
      );
    }
    getEndpointState() {
      return this.selectedBatchEndpoint
        ? "ready"
        : this.remoteEndpoints.length > 0
          ? "probing"
          : "unavailable";
    }
    getSelectedBatchEndpoint() {
      return this.selectedBatchEndpoint;
    }
  }
  var a =
    "undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
          ? global
          : "undefined" != typeof self
            ? self
            : {};
  function c(e) {
    return e &&
      e.__esModule &&
      Object.prototype.hasOwnProperty.call(e, "default")
      ? e.default
      : e;
  }
  var d,
    l = { exports: {} },
    u = { exports: {} };
  function h() {
    return (
      d ||
        ((d = 1),
        (function (e) {
          var t;
          e.exports =
            ((t =
              t ||
              (function (e) {
                var t;
                if (
                  ("undefined" != typeof window &&
                    window.crypto &&
                    (t = window.crypto),
                  "undefined" != typeof self &&
                    self.crypto &&
                    (t = self.crypto),
                  "undefined" != typeof globalThis &&
                    globalThis.crypto &&
                    (t = globalThis.crypto),
                  !t &&
                    "undefined" != typeof window &&
                    window.msCrypto &&
                    (t = window.msCrypto),
                  !t && void 0 !== a && a.crypto && (t = a.crypto),
                  !t)
                )
                  try {
                    t = require("crypto");
                  } catch (e) {}
                var i = function () {
                    if (t) {
                      if ("function" == typeof t.getRandomValues)
                        try {
                          return t.getRandomValues(new Uint32Array(1))[0];
                        } catch (e) {}
                      if ("function" == typeof t.randomBytes)
                        try {
                          return t.randomBytes(4).readInt32LE();
                        } catch (e) {}
                    }
                    throw new Error(
                      "Native crypto module could not be used to get secure random number.",
                    );
                  },
                  r =
                    Object.create ||
                    (function () {
                      function e() {}
                      return function (t) {
                        var i;
                        return (
                          (e.prototype = t),
                          (i = new e()),
                          (e.prototype = null),
                          i
                        );
                      };
                    })(),
                  n = {},
                  o = (n.lib = {}),
                  s = (o.Base = {
                    extend: function (e) {
                      var t = r(this);
                      return (
                        e && t.mixIn(e),
                        (t.hasOwnProperty("init") && this.init !== t.init) ||
                          (t.init = function () {
                            t.$super.init.apply(this, arguments);
                          }),
                        (t.init.prototype = t),
                        (t.$super = this),
                        t
                      );
                    },
                    create: function () {
                      var e = this.extend();
                      return (e.init.apply(e, arguments), e);
                    },
                    init: function () {},
                    mixIn: function (e) {
                      for (var t in e) e.hasOwnProperty(t) && (this[t] = e[t]);
                      e.hasOwnProperty("toString") &&
                        (this.toString = e.toString);
                    },
                    clone: function () {
                      return this.init.prototype.extend(this);
                    },
                  }),
                  c = (o.WordArray = s.extend({
                    init: function (e, t) {
                      ((e = this.words = e || []),
                        (this.sigBytes = null != t ? t : 4 * e.length));
                    },
                    toString: function (e) {
                      return (e || l).stringify(this);
                    },
                    concat: function (e) {
                      var t = this.words,
                        i = e.words,
                        r = this.sigBytes,
                        n = e.sigBytes;
                      if ((this.clamp(), r % 4))
                        for (var o = 0; n > o; o++)
                          t[(r + o) >>> 2] |=
                            ((i[o >>> 2] >>> (24 - (o % 4) * 8)) & 255) <<
                            (24 - ((r + o) % 4) * 8);
                      else
                        for (var s = 0; n > s; s += 4)
                          t[(r + s) >>> 2] = i[s >>> 2];
                      return ((this.sigBytes += n), this);
                    },
                    clamp: function () {
                      var t = this.words,
                        i = this.sigBytes;
                      ((t[i >>> 2] &= 4294967295 << (32 - (i % 4) * 8)),
                        (t.length = e.ceil(i / 4)));
                    },
                    clone: function () {
                      var e = s.clone.call(this);
                      return ((e.words = this.words.slice(0)), e);
                    },
                    random: function (e) {
                      for (var t = [], r = 0; e > r; r += 4) t.push(i());
                      return new c.init(t, e);
                    },
                  })),
                  d = (n.enc = {}),
                  l = (d.Hex = {
                    stringify: function (e) {
                      for (
                        var t = e.words, i = e.sigBytes, r = [], n = 0;
                        i > n;
                        n++
                      ) {
                        var o = (t[n >>> 2] >>> (24 - (n % 4) * 8)) & 255;
                        (r.push((o >>> 4).toString(16)),
                          r.push((15 & o).toString(16)));
                      }
                      return r.join("");
                    },
                    parse: function (e) {
                      for (var t = e.length, i = [], r = 0; t > r; r += 2)
                        i[r >>> 3] |=
                          parseInt(e.substr(r, 2), 16) << (24 - (r % 8) * 4);
                      return new c.init(i, t / 2);
                    },
                  }),
                  u = (d.Latin1 = {
                    stringify: function (e) {
                      for (
                        var t = e.words, i = e.sigBytes, r = [], n = 0;
                        i > n;
                        n++
                      )
                        r.push(
                          String.fromCharCode(
                            (t[n >>> 2] >>> (24 - (n % 4) * 8)) & 255,
                          ),
                        );
                      return r.join("");
                    },
                    parse: function (e) {
                      for (var t = e.length, i = [], r = 0; t > r; r++)
                        i[r >>> 2] |=
                          (255 & e.charCodeAt(r)) << (24 - (r % 4) * 8);
                      return new c.init(i, t);
                    },
                  }),
                  h = (d.Utf8 = {
                    stringify: function (e) {
                      try {
                        return decodeURIComponent(escape(u.stringify(e)));
                      } catch (e) {
                        throw new Error("Malformed UTF-8 data");
                      }
                    },
                    parse: function (e) {
                      return u.parse(unescape(encodeURIComponent(e)));
                    },
                  }),
                  p = (o.BufferedBlockAlgorithm = s.extend({
                    reset: function () {
                      ((this._data = new c.init()), (this._nDataBytes = 0));
                    },
                    _append: function (e) {
                      ("string" == typeof e && (e = h.parse(e)),
                        this._data.concat(e),
                        (this._nDataBytes += e.sigBytes));
                    },
                    _process: function (t) {
                      var i,
                        r = this._data,
                        n = r.words,
                        o = r.sigBytes,
                        s = this.blockSize,
                        a = o / (4 * s),
                        d =
                          (a = t
                            ? e.ceil(a)
                            : e.max((0 | a) - this._minBufferSize, 0)) * s,
                        l = e.min(4 * d, o);
                      if (d) {
                        for (var u = 0; d > u; u += s)
                          this._doProcessBlock(n, u);
                        ((i = n.splice(0, d)), (r.sigBytes -= l));
                      }
                      return new c.init(i, l);
                    },
                    clone: function () {
                      var e = s.clone.call(this);
                      return ((e._data = this._data.clone()), e);
                    },
                    _minBufferSize: 0,
                  }));
                o.Hasher = p.extend({
                  cfg: s.extend(),
                  init: function (e) {
                    ((this.cfg = this.cfg.extend(e)), this.reset());
                  },
                  reset: function () {
                    (p.reset.call(this), this._doReset());
                  },
                  update: function (e) {
                    return (this._append(e), this._process(), this);
                  },
                  finalize: function (e) {
                    return (e && this._append(e), this._doFinalize());
                  },
                  blockSize: 16,
                  _createHelper: function (e) {
                    return function (t, i) {
                      return new e.init(i).finalize(t);
                    };
                  },
                  _createHmacHelper: function (e) {
                    return function (t, i) {
                      return new y.HMAC.init(e, i).finalize(t);
                    };
                  },
                });
                var y = (n.algo = {});
                return n;
              })(Math)),
            t);
        })(u)),
      u.exports
    );
  }
  var p,
    y = { exports: {} };
  function f() {
    return (
      p ||
        ((p = 1),
        (function (e) {
          var t, i;
          e.exports =
            ((t = h()),
            (i = t.lib.WordArray),
            (t.enc.Base64 = {
              stringify: function (e) {
                var t = e.words,
                  i = e.sigBytes,
                  r = this._map;
                e.clamp();
                for (var n = [], o = 0; i > o; o += 3)
                  for (
                    var s =
                        (((t[o >>> 2] >>> (24 - (o % 4) * 8)) & 255) << 16) |
                        (((t[(o + 1) >>> 2] >>> (24 - ((o + 1) % 4) * 8)) &
                          255) <<
                          8) |
                        ((t[(o + 2) >>> 2] >>> (24 - ((o + 2) % 4) * 8)) & 255),
                      a = 0;
                    4 > a && i > o + 0.75 * a;
                    a++
                  )
                    n.push(r.charAt((s >>> (6 * (3 - a))) & 63));
                var c = r.charAt(64);
                if (c) for (; n.length % 4; ) n.push(c);
                return n.join("");
              },
              parse: function (e) {
                var t = e.length,
                  r = this._map,
                  n = this._reverseMap;
                if (!n) {
                  n = this._reverseMap = [];
                  for (var o = 0; r.length > o; o++) n[r.charCodeAt(o)] = o;
                }
                var s = r.charAt(64);
                if (s) {
                  var a = e.indexOf(s);
                  -1 !== a && (t = a);
                }
                return (function (e, t, r) {
                  for (var n = [], o = 0, s = 0; t > s; s++)
                    if (s % 4) {
                      var a = r[e.charCodeAt(s - 1)] << ((s % 4) * 2),
                        c = r[e.charCodeAt(s)] >>> (6 - (s % 4) * 2);
                      ((n[o >>> 2] |= (a | c) << (24 - (o % 4) * 8)), o++);
                    }
                  return i.create(n, o);
                })(e, t, n);
              },
              _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            }),
            t.enc.Base64);
        })(y)),
      y.exports
    );
  }
  var g,
    m = { exports: {} };
  var _,
    v = { exports: {} },
    b = { exports: {} };
  var w,
    S,
    k = { exports: {} };
  function E() {
    return (
      S ||
        ((S = 1),
        (function (e) {
          var t, i, r, n, o, s, a;
          e.exports =
            ((a = h()),
            _ ||
              ((_ = 1),
              (function (e) {
                var t, i, r, n, o, s, a;
                e.exports =
                  ((a = h()),
                  (r = (i = (t = a).lib).WordArray),
                  (o = []),
                  (s = t.algo.SHA1 =
                    (n = i.Hasher).extend({
                      _doReset: function () {
                        this._hash = new r.init([
                          1732584193, 4023233417, 2562383102, 271733878,
                          3285377520,
                        ]);
                      },
                      _doProcessBlock: function (e, t) {
                        for (
                          var i = this._hash.words,
                            r = i[0],
                            n = i[1],
                            s = i[2],
                            a = i[3],
                            c = i[4],
                            d = 0;
                          80 > d;
                          d++
                        ) {
                          if (16 > d) o[d] = 0 | e[t + d];
                          else {
                            var l = o[d - 3] ^ o[d - 8] ^ o[d - 14] ^ o[d - 16];
                            o[d] = (l << 1) | (l >>> 31);
                          }
                          var u = ((r << 5) | (r >>> 27)) + c + o[d];
                          ((u +=
                            20 > d
                              ? 1518500249 + ((n & s) | (~n & a))
                              : 40 > d
                                ? 1859775393 + (n ^ s ^ a)
                                : 60 > d
                                  ? ((n & s) | (n & a) | (s & a)) - 1894007588
                                  : (n ^ s ^ a) - 899497514),
                            (c = a),
                            (a = s),
                            (s = (n << 30) | (n >>> 2)),
                            (n = r),
                            (r = u));
                        }
                        ((i[0] = (i[0] + r) | 0),
                          (i[1] = (i[1] + n) | 0),
                          (i[2] = (i[2] + s) | 0),
                          (i[3] = (i[3] + a) | 0),
                          (i[4] = (i[4] + c) | 0));
                      },
                      _doFinalize: function () {
                        var e = this._data,
                          t = e.words,
                          i = 8 * this._nDataBytes,
                          r = 8 * e.sigBytes;
                        return (
                          (t[r >>> 5] |= 128 << (24 - (r % 32))),
                          (t[14 + (((r + 64) >>> 9) << 4)] = Math.floor(
                            i / 4294967296,
                          )),
                          (t[15 + (((r + 64) >>> 9) << 4)] = i),
                          (e.sigBytes = 4 * t.length),
                          this._process(),
                          this._hash
                        );
                      },
                      clone: function () {
                        var e = n.clone.call(this);
                        return ((e._hash = this._hash.clone()), e);
                      },
                    })),
                  (t.SHA1 = n._createHelper(s)),
                  (t.HmacSHA1 = n._createHmacHelper(s)),
                  a.SHA1);
              })(b)),
            w ||
              ((w = 1),
              (function (e) {
                var t;
                e.exports =
                  ((t = h()),
                  void (function () {
                    var e = t.enc.Utf8;
                    t.algo.HMAC = t.lib.Base.extend({
                      init: function (t, i) {
                        ((t = this._hasher = new t.init()),
                          "string" == typeof i && (i = e.parse(i)));
                        var r = t.blockSize,
                          n = 4 * r;
                        (i.sigBytes > n && (i = t.finalize(i)), i.clamp());
                        for (
                          var o = (this._oKey = i.clone()),
                            s = (this._iKey = i.clone()),
                            a = o.words,
                            c = s.words,
                            d = 0;
                          r > d;
                          d++
                        )
                          ((a[d] ^= 1549556828), (c[d] ^= 909522486));
                        ((o.sigBytes = s.sigBytes = n), this.reset());
                      },
                      reset: function () {
                        var e = this._hasher;
                        (e.reset(), e.update(this._iKey));
                      },
                      update: function (e) {
                        return (this._hasher.update(e), this);
                      },
                      finalize: function (e) {
                        var t = this._hasher,
                          i = t.finalize(e);
                        return (
                          t.reset(),
                          t.finalize(this._oKey.clone().concat(i))
                        );
                      },
                    });
                  })());
              })(k)),
            (n = (i = (t = a).lib).WordArray),
            (s = (o = t.algo).EvpKDF =
              (r = i.Base).extend({
                cfg: r.extend({ keySize: 4, hasher: o.MD5, iterations: 1 }),
                init: function (e) {
                  this.cfg = this.cfg.extend(e);
                },
                compute: function (e, t) {
                  for (
                    var i,
                      r = this.cfg,
                      o = r.hasher.create(),
                      s = n.create(),
                      a = s.words,
                      c = r.keySize,
                      d = r.iterations;
                    c > a.length;
                  ) {
                    (i && o.update(i),
                      (i = o.update(e).finalize(t)),
                      o.reset());
                    for (var l = 1; d > l; l++)
                      ((i = o.finalize(i)), o.reset());
                    s.concat(i);
                  }
                  return ((s.sigBytes = 4 * c), s);
                },
              })),
            (t.EvpKDF = function (e, t, i) {
              return s.create(i).compute(e, t);
            }),
            a.EvpKDF);
        })(v)),
      v.exports
    );
  }
  var M,
    C,
    x = { exports: {} };
  function B() {
    return (
      M ||
        ((M = 1),
        (function (e) {
          var t;
          e.exports =
            ((t = h()),
            E(),
            void (
              t.lib.Cipher ||
              (function () {
                var e = t,
                  i = e.lib,
                  r = i.Base,
                  n = i.WordArray,
                  o = i.BufferedBlockAlgorithm,
                  s = e.enc.Base64,
                  a = e.algo.EvpKDF,
                  c = (i.Cipher = o.extend({
                    cfg: r.extend(),
                    createEncryptor: function (e, t) {
                      return this.create(this._ENC_XFORM_MODE, e, t);
                    },
                    createDecryptor: function (e, t) {
                      return this.create(this._DEC_XFORM_MODE, e, t);
                    },
                    init: function (e, t, i) {
                      ((this.cfg = this.cfg.extend(i)),
                        (this._xformMode = e),
                        (this._key = t),
                        this.reset());
                    },
                    reset: function () {
                      (o.reset.call(this), this._doReset());
                    },
                    process: function (e) {
                      return (this._append(e), this._process());
                    },
                    finalize: function (e) {
                      return (e && this._append(e), this._doFinalize());
                    },
                    keySize: 4,
                    ivSize: 4,
                    _ENC_XFORM_MODE: 1,
                    _DEC_XFORM_MODE: 2,
                    _createHelper: (function () {
                      function e(e) {
                        return "string" == typeof e ? m : f;
                      }
                      return function (t) {
                        return {
                          encrypt: function (i, r, n) {
                            return e(r).encrypt(t, i, r, n);
                          },
                          decrypt: function (i, r, n) {
                            return e(r).decrypt(t, i, r, n);
                          },
                        };
                      };
                    })(),
                  }));
                i.StreamCipher = c.extend({
                  _doFinalize: function () {
                    return this._process(!0);
                  },
                  blockSize: 1,
                });
                var d = (e.mode = {}),
                  l = (i.BlockCipherMode = r.extend({
                    createEncryptor: function (e, t) {
                      return this.Encryptor.create(e, t);
                    },
                    createDecryptor: function (e, t) {
                      return this.Decryptor.create(e, t);
                    },
                    init: function (e, t) {
                      ((this._cipher = e), (this._iv = t));
                    },
                  })),
                  u = (d.CBC = (function () {
                    var e = l.extend();
                    function t(e, t, i) {
                      var r,
                        n = this._iv;
                      n
                        ? ((r = n), (this._iv = void 0))
                        : (r = this._prevBlock);
                      for (var o = 0; i > o; o++) e[t + o] ^= r[o];
                    }
                    return (
                      (e.Encryptor = e.extend({
                        processBlock: function (e, i) {
                          var r = this._cipher,
                            n = r.blockSize;
                          (t.call(this, e, i, n),
                            r.encryptBlock(e, i),
                            (this._prevBlock = e.slice(i, i + n)));
                        },
                      })),
                      (e.Decryptor = e.extend({
                        processBlock: function (e, i) {
                          var r = this._cipher,
                            n = r.blockSize,
                            o = e.slice(i, i + n);
                          (r.decryptBlock(e, i),
                            t.call(this, e, i, n),
                            (this._prevBlock = o));
                        },
                      })),
                      e
                    );
                  })()),
                  h = ((e.pad = {}).Pkcs7 = {
                    pad: function (e, t) {
                      for (
                        var i = 4 * t,
                          r = i - (e.sigBytes % i),
                          o = (r << 24) | (r << 16) | (r << 8) | r,
                          s = [],
                          a = 0;
                        r > a;
                        a += 4
                      )
                        s.push(o);
                      var c = n.create(s, r);
                      e.concat(c);
                    },
                    unpad: function (e) {
                      e.sigBytes -= 255 & e.words[(e.sigBytes - 1) >>> 2];
                    },
                  });
                i.BlockCipher = c.extend({
                  cfg: c.cfg.extend({ mode: u, padding: h }),
                  reset: function () {
                    var e;
                    c.reset.call(this);
                    var t = this.cfg,
                      i = t.iv,
                      r = t.mode;
                    (this._xformMode == this._ENC_XFORM_MODE
                      ? (e = r.createEncryptor)
                      : ((e = r.createDecryptor), (this._minBufferSize = 1)),
                      this._mode && this._mode.__creator == e
                        ? this._mode.init(this, i && i.words)
                        : ((this._mode = e.call(r, this, i && i.words)),
                          (this._mode.__creator = e)));
                  },
                  _doProcessBlock: function (e, t) {
                    this._mode.processBlock(e, t);
                  },
                  _doFinalize: function () {
                    var e,
                      t = this.cfg.padding;
                    return (
                      this._xformMode == this._ENC_XFORM_MODE
                        ? (t.pad(this._data, this.blockSize),
                          (e = this._process(!0)))
                        : ((e = this._process(!0)), t.unpad(e)),
                      e
                    );
                  },
                  blockSize: 4,
                });
                var p = (i.CipherParams = r.extend({
                    init: function (e) {
                      this.mixIn(e);
                    },
                    toString: function (e) {
                      return (e || this.formatter).stringify(this);
                    },
                  })),
                  y = ((e.format = {}).OpenSSL = {
                    stringify: function (e) {
                      var t = e.ciphertext,
                        i = e.salt;
                      return (
                        i
                          ? n
                              .create([1398893684, 1701076831])
                              .concat(i)
                              .concat(t)
                          : t
                      ).toString(s);
                    },
                    parse: function (e) {
                      var t,
                        i = s.parse(e),
                        r = i.words;
                      return (
                        1398893684 == r[0] &&
                          1701076831 == r[1] &&
                          ((t = n.create(r.slice(2, 4))),
                          r.splice(0, 4),
                          (i.sigBytes -= 16)),
                        p.create({ ciphertext: i, salt: t })
                      );
                    },
                  }),
                  f = (i.SerializableCipher = r.extend({
                    cfg: r.extend({ format: y }),
                    encrypt: function (e, t, i, r) {
                      r = this.cfg.extend(r);
                      var n = e.createEncryptor(i, r),
                        o = n.finalize(t),
                        s = n.cfg;
                      return p.create({
                        ciphertext: o,
                        key: i,
                        iv: s.iv,
                        algorithm: e,
                        mode: s.mode,
                        padding: s.padding,
                        blockSize: e.blockSize,
                        formatter: r.format,
                      });
                    },
                    decrypt: function (e, t, i, r) {
                      return (
                        (r = this.cfg.extend(r)),
                        (t = this._parse(t, r.format)),
                        e.createDecryptor(i, r).finalize(t.ciphertext)
                      );
                    },
                    _parse: function (e, t) {
                      return "string" == typeof e ? t.parse(e, this) : e;
                    },
                  })),
                  g = ((e.kdf = {}).OpenSSL = {
                    execute: function (e, t, i, r, o) {
                      if ((r || (r = n.random(8)), o))
                        s = a
                          .create({ keySize: t + i, hasher: o })
                          .compute(e, r);
                      else var s = a.create({ keySize: t + i }).compute(e, r);
                      var c = n.create(s.words.slice(t), 4 * i);
                      return (
                        (s.sigBytes = 4 * t),
                        p.create({ key: s, iv: c, salt: r })
                      );
                    },
                  }),
                  m = (i.PasswordBasedCipher = f.extend({
                    cfg: f.cfg.extend({ kdf: g }),
                    encrypt: function (e, t, i, r) {
                      var n = (r = this.cfg.extend(r)).kdf.execute(
                        i,
                        e.keySize,
                        e.ivSize,
                        r.salt,
                        r.hasher,
                      );
                      r.iv = n.iv;
                      var o = f.encrypt.call(this, e, t, n.key, r);
                      return (o.mixIn(n), o);
                    },
                    decrypt: function (e, t, i, r) {
                      ((r = this.cfg.extend(r)),
                        (t = this._parse(t, r.format)));
                      var n = r.kdf.execute(
                        i,
                        e.keySize,
                        e.ivSize,
                        t.salt,
                        r.hasher,
                      );
                      return (
                        (r.iv = n.iv),
                        f.decrypt.call(this, e, t, n.key, r)
                      );
                    },
                  }));
              })()
            ));
        })(x)),
      x.exports
    );
  }
  var P,
    A,
    I,
    T,
    D =
      (C ||
        ((C = 1),
        (function (e) {
          var t;
          e.exports =
            ((t = h()),
            f(),
            g ||
              ((g = 1),
              (function (e) {
                var t;
                e.exports =
                  ((t = h()),
                  (function (e) {
                    var i = t,
                      r = i.lib,
                      n = r.WordArray,
                      o = r.Hasher,
                      s = i.algo,
                      a = [];
                    !(function () {
                      for (var t = 0; 64 > t; t++)
                        a[t] = (4294967296 * e.abs(e.sin(t + 1))) | 0;
                    })();
                    var c = (s.MD5 = o.extend({
                      _doReset: function () {
                        this._hash = new n.init([
                          1732584193, 4023233417, 2562383102, 271733878,
                        ]);
                      },
                      _doProcessBlock: function (e, t) {
                        for (var i = 0; 16 > i; i++) {
                          var r = t + i,
                            n = e[r];
                          e[r] =
                            (16711935 & ((n << 8) | (n >>> 24))) |
                            (4278255360 & ((n << 24) | (n >>> 8)));
                        }
                        var o = this._hash.words,
                          s = e[t + 0],
                          c = e[t + 1],
                          p = e[t + 2],
                          y = e[t + 3],
                          f = e[t + 4],
                          g = e[t + 5],
                          m = e[t + 6],
                          _ = e[t + 7],
                          v = e[t + 8],
                          b = e[t + 9],
                          w = e[t + 10],
                          S = e[t + 11],
                          k = e[t + 12],
                          E = e[t + 13],
                          M = e[t + 14],
                          C = e[t + 15],
                          x = o[0],
                          B = o[1],
                          P = o[2],
                          A = o[3];
                        ((x = d(x, B, P, A, s, 7, a[0])),
                          (A = d(A, x, B, P, c, 12, a[1])),
                          (P = d(P, A, x, B, p, 17, a[2])),
                          (B = d(B, P, A, x, y, 22, a[3])),
                          (x = d(x, B, P, A, f, 7, a[4])),
                          (A = d(A, x, B, P, g, 12, a[5])),
                          (P = d(P, A, x, B, m, 17, a[6])),
                          (B = d(B, P, A, x, _, 22, a[7])),
                          (x = d(x, B, P, A, v, 7, a[8])),
                          (A = d(A, x, B, P, b, 12, a[9])),
                          (P = d(P, A, x, B, w, 17, a[10])),
                          (B = d(B, P, A, x, S, 22, a[11])),
                          (x = d(x, B, P, A, k, 7, a[12])),
                          (A = d(A, x, B, P, E, 12, a[13])),
                          (P = d(P, A, x, B, M, 17, a[14])),
                          (x = l(
                            x,
                            (B = d(B, P, A, x, C, 22, a[15])),
                            P,
                            A,
                            c,
                            5,
                            a[16],
                          )),
                          (A = l(A, x, B, P, m, 9, a[17])),
                          (P = l(P, A, x, B, S, 14, a[18])),
                          (B = l(B, P, A, x, s, 20, a[19])),
                          (x = l(x, B, P, A, g, 5, a[20])),
                          (A = l(A, x, B, P, w, 9, a[21])),
                          (P = l(P, A, x, B, C, 14, a[22])),
                          (B = l(B, P, A, x, f, 20, a[23])),
                          (x = l(x, B, P, A, b, 5, a[24])),
                          (A = l(A, x, B, P, M, 9, a[25])),
                          (P = l(P, A, x, B, y, 14, a[26])),
                          (B = l(B, P, A, x, v, 20, a[27])),
                          (x = l(x, B, P, A, E, 5, a[28])),
                          (A = l(A, x, B, P, p, 9, a[29])),
                          (P = l(P, A, x, B, _, 14, a[30])),
                          (x = u(
                            x,
                            (B = l(B, P, A, x, k, 20, a[31])),
                            P,
                            A,
                            g,
                            4,
                            a[32],
                          )),
                          (A = u(A, x, B, P, v, 11, a[33])),
                          (P = u(P, A, x, B, S, 16, a[34])),
                          (B = u(B, P, A, x, M, 23, a[35])),
                          (x = u(x, B, P, A, c, 4, a[36])),
                          (A = u(A, x, B, P, f, 11, a[37])),
                          (P = u(P, A, x, B, _, 16, a[38])),
                          (B = u(B, P, A, x, w, 23, a[39])),
                          (x = u(x, B, P, A, E, 4, a[40])),
                          (A = u(A, x, B, P, s, 11, a[41])),
                          (P = u(P, A, x, B, y, 16, a[42])),
                          (B = u(B, P, A, x, m, 23, a[43])),
                          (x = u(x, B, P, A, b, 4, a[44])),
                          (A = u(A, x, B, P, k, 11, a[45])),
                          (P = u(P, A, x, B, C, 16, a[46])),
                          (x = h(
                            x,
                            (B = u(B, P, A, x, p, 23, a[47])),
                            P,
                            A,
                            s,
                            6,
                            a[48],
                          )),
                          (A = h(A, x, B, P, _, 10, a[49])),
                          (P = h(P, A, x, B, M, 15, a[50])),
                          (B = h(B, P, A, x, g, 21, a[51])),
                          (x = h(x, B, P, A, k, 6, a[52])),
                          (A = h(A, x, B, P, y, 10, a[53])),
                          (P = h(P, A, x, B, w, 15, a[54])),
                          (B = h(B, P, A, x, c, 21, a[55])),
                          (x = h(x, B, P, A, v, 6, a[56])),
                          (A = h(A, x, B, P, C, 10, a[57])),
                          (P = h(P, A, x, B, m, 15, a[58])),
                          (B = h(B, P, A, x, E, 21, a[59])),
                          (x = h(x, B, P, A, f, 6, a[60])),
                          (A = h(A, x, B, P, S, 10, a[61])),
                          (P = h(P, A, x, B, p, 15, a[62])),
                          (B = h(B, P, A, x, b, 21, a[63])),
                          (o[0] = (o[0] + x) | 0),
                          (o[1] = (o[1] + B) | 0),
                          (o[2] = (o[2] + P) | 0),
                          (o[3] = (o[3] + A) | 0));
                      },
                      _doFinalize: function () {
                        var t = this._data,
                          i = t.words,
                          r = 8 * this._nDataBytes,
                          n = 8 * t.sigBytes;
                        i[n >>> 5] |= 128 << (24 - (n % 32));
                        var o = e.floor(r / 4294967296),
                          s = r;
                        ((i[15 + (((n + 64) >>> 9) << 4)] =
                          (16711935 & ((o << 8) | (o >>> 24))) |
                          (4278255360 & ((o << 24) | (o >>> 8)))),
                          (i[14 + (((n + 64) >>> 9) << 4)] =
                            (16711935 & ((s << 8) | (s >>> 24))) |
                            (4278255360 & ((s << 24) | (s >>> 8)))),
                          (t.sigBytes = 4 * (i.length + 1)),
                          this._process());
                        for (
                          var a = this._hash, c = a.words, d = 0;
                          4 > d;
                          d++
                        ) {
                          var l = c[d];
                          c[d] =
                            (16711935 & ((l << 8) | (l >>> 24))) |
                            (4278255360 & ((l << 24) | (l >>> 8)));
                        }
                        return a;
                      },
                      clone: function () {
                        var e = o.clone.call(this);
                        return ((e._hash = this._hash.clone()), e);
                      },
                    }));
                    function d(e, t, i, r, n, o, s) {
                      var a = e + ((t & i) | (~t & r)) + n + s;
                      return ((a << o) | (a >>> (32 - o))) + t;
                    }
                    function l(e, t, i, r, n, o, s) {
                      var a = e + ((t & r) | (i & ~r)) + n + s;
                      return ((a << o) | (a >>> (32 - o))) + t;
                    }
                    function u(e, t, i, r, n, o, s) {
                      var a = e + (t ^ i ^ r) + n + s;
                      return ((a << o) | (a >>> (32 - o))) + t;
                    }
                    function h(e, t, i, r, n, o, s) {
                      var a = e + (i ^ (t | ~r)) + n + s;
                      return ((a << o) | (a >>> (32 - o))) + t;
                    }
                    ((i.MD5 = o._createHelper(c)),
                      (i.HmacMD5 = o._createHmacHelper(c)));
                  })(Math),
                  t.MD5);
              })(m)),
            E(),
            B(),
            (function () {
              var e = t,
                i = e.lib.BlockCipher,
                r = e.algo,
                n = [],
                o = [],
                s = [],
                a = [],
                c = [],
                d = [],
                l = [],
                u = [],
                h = [],
                p = [];
              !(function () {
                for (var e = [], t = 0; 256 > t; t++)
                  e[t] = 128 > t ? t << 1 : (t << 1) ^ 283;
                var i = 0,
                  r = 0;
                for (t = 0; 256 > t; t++) {
                  var y = r ^ (r << 1) ^ (r << 2) ^ (r << 3) ^ (r << 4);
                  ((n[i] = y = (y >>> 8) ^ (255 & y) ^ 99), (o[y] = i));
                  var f,
                    g = e[i],
                    m = e[g],
                    _ = e[m];
                  ((s[i] =
                    ((f = (257 * e[y]) ^ (16843008 * y)) << 24) | (f >>> 8)),
                    (a[i] = (f << 16) | (f >>> 16)),
                    (c[i] = (f << 8) | (f >>> 24)),
                    (d[i] = f),
                    (l[y] =
                      ((f =
                        (16843009 * _) ^
                        (65537 * m) ^
                        (257 * g) ^
                        (16843008 * i)) <<
                        24) |
                      (f >>> 8)),
                    (u[y] = (f << 16) | (f >>> 16)),
                    (h[y] = (f << 8) | (f >>> 24)),
                    (p[y] = f),
                    i
                      ? ((i = g ^ e[e[e[_ ^ g]]]), (r ^= e[e[r]]))
                      : (i = r = 1));
                }
              })();
              var y = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
                f = (r.AES = i.extend({
                  _doReset: function () {
                    if (!this._nRounds || this._keyPriorReset !== this._key) {
                      for (
                        var e = (this._keyPriorReset = this._key),
                          t = e.words,
                          i = e.sigBytes / 4,
                          r = 4 * ((this._nRounds = i + 6) + 1),
                          o = (this._keySchedule = []),
                          s = 0;
                        r > s;
                        s++
                      )
                        i > s
                          ? (o[s] = t[s])
                          : ((d = o[s - 1]),
                            s % i
                              ? i > 6 &&
                                s % i == 4 &&
                                (d =
                                  (n[d >>> 24] << 24) |
                                  (n[(d >>> 16) & 255] << 16) |
                                  (n[(d >>> 8) & 255] << 8) |
                                  n[255 & d])
                              : ((d =
                                  (n[(d = (d << 8) | (d >>> 24)) >>> 24] <<
                                    24) |
                                  (n[(d >>> 16) & 255] << 16) |
                                  (n[(d >>> 8) & 255] << 8) |
                                  n[255 & d]),
                                (d ^= y[(s / i) | 0] << 24)),
                            (o[s] = o[s - i] ^ d));
                      for (
                        var a = (this._invKeySchedule = []), c = 0;
                        r > c;
                        c++
                      ) {
                        if (((s = r - c), c % 4)) var d = o[s];
                        else d = o[s - 4];
                        a[c] =
                          4 > c || 4 >= s
                            ? d
                            : l[n[d >>> 24]] ^
                              u[n[(d >>> 16) & 255]] ^
                              h[n[(d >>> 8) & 255]] ^
                              p[n[255 & d]];
                      }
                    }
                  },
                  encryptBlock: function (e, t) {
                    this._doCryptBlock(e, t, this._keySchedule, s, a, c, d, n);
                  },
                  decryptBlock: function (e, t) {
                    var i = e[t + 1];
                    ((e[t + 1] = e[t + 3]),
                      (e[t + 3] = i),
                      this._doCryptBlock(
                        e,
                        t,
                        this._invKeySchedule,
                        l,
                        u,
                        h,
                        p,
                        o,
                      ),
                      (i = e[t + 1]),
                      (e[t + 1] = e[t + 3]),
                      (e[t + 3] = i));
                  },
                  _doCryptBlock: function (e, t, i, r, n, o, s, a) {
                    for (
                      var c = this._nRounds,
                        d = e[t] ^ i[0],
                        l = e[t + 1] ^ i[1],
                        u = e[t + 2] ^ i[2],
                        h = e[t + 3] ^ i[3],
                        p = 4,
                        y = 1;
                      c > y;
                      y++
                    ) {
                      var f =
                          r[d >>> 24] ^
                          n[(l >>> 16) & 255] ^
                          o[(u >>> 8) & 255] ^
                          s[255 & h] ^
                          i[p++],
                        g =
                          r[l >>> 24] ^
                          n[(u >>> 16) & 255] ^
                          o[(h >>> 8) & 255] ^
                          s[255 & d] ^
                          i[p++],
                        m =
                          r[u >>> 24] ^
                          n[(h >>> 16) & 255] ^
                          o[(d >>> 8) & 255] ^
                          s[255 & l] ^
                          i[p++],
                        _ =
                          r[h >>> 24] ^
                          n[(d >>> 16) & 255] ^
                          o[(l >>> 8) & 255] ^
                          s[255 & u] ^
                          i[p++];
                      ((d = f), (l = g), (u = m), (h = _));
                    }
                    ((f =
                      ((a[d >>> 24] << 24) |
                        (a[(l >>> 16) & 255] << 16) |
                        (a[(u >>> 8) & 255] << 8) |
                        a[255 & h]) ^
                      i[p++]),
                      (g =
                        ((a[l >>> 24] << 24) |
                          (a[(u >>> 16) & 255] << 16) |
                          (a[(h >>> 8) & 255] << 8) |
                          a[255 & d]) ^
                        i[p++]),
                      (m =
                        ((a[u >>> 24] << 24) |
                          (a[(h >>> 16) & 255] << 16) |
                          (a[(d >>> 8) & 255] << 8) |
                          a[255 & l]) ^
                        i[p++]),
                      (_ =
                        ((a[h >>> 24] << 24) |
                          (a[(d >>> 16) & 255] << 16) |
                          (a[(l >>> 8) & 255] << 8) |
                          a[255 & u]) ^
                        i[p++]),
                      (e[t] = f),
                      (e[t + 1] = g),
                      (e[t + 2] = m),
                      (e[t + 3] = _));
                  },
                  keySize: 8,
                }));
              e.AES = i._createHelper(f);
            })(),
            t.AES);
        })(l)),
      l.exports),
    N = c(D),
    O = { exports: {} },
    q = c(
      (P ||
        ((P = 1),
        (function (e) {
          e.exports = h().enc.Hex;
        })(O)),
      O.exports),
    ),
    R = { exports: {} },
    z = c(
      (A ||
        ((A = 1),
        (function (e) {
          e.exports = h().enc.Utf8;
        })(R)),
      R.exports),
    ),
    F = { exports: {} },
    H =
      (I ||
        ((I = 1),
        (function (e) {
          var t;
          e.exports =
            ((t = h()),
            B(),
            (t.mode.ECB = (function () {
              var e = t.lib.BlockCipherMode.extend();
              return (
                (e.Encryptor = e.extend({
                  processBlock: function (e, t) {
                    this._cipher.encryptBlock(e, t);
                  },
                })),
                (e.Decryptor = e.extend({
                  processBlock: function (e, t) {
                    this._cipher.decryptBlock(e, t);
                  },
                })),
                e
              );
            })()),
            t.mode.ECB);
        })(F)),
      F.exports),
    L = c(H),
    U = { exports: {} },
    j = c(
      (T ||
        ((T = 1),
        (function (e) {
          var t;
          e.exports = ((t = h()), B(), t.pad.Pkcs7);
        })(U)),
      U.exports),
    );
  class $ {
    constructor(e = {}) {
      ((this.encryptedConfigText = ""),
        (this.cachedConfigPromise = null),
        (this.encryptedConfigText = e.encryptedConfig || e.configCipher || ""),
        (this.firstEcbKey = "525202f9149e061d"),
        (this.secondGcmKeyBase64 =
          "en1BNo0VBrN/zi+mI2LO7E9W40ehCBYwC+frBn8s3rQ"));
    }
    setEncryptedConfig(e) {
      this.encryptedConfigText !== e &&
        ((this.encryptedConfigText = e), (this.cachedConfigPromise = null));
    }
    normalizeBase64(e) {
      let t = String(e || "")
        .trim()
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const i = t.length % 4 ? 4 - (t.length % 4) : 0;
      return (i && (t += "=".repeat(i)), t);
    }
    parseJsonFlexible(e) {
      try {
        return JSON.parse(e);
      } catch (t) {
        return e;
      }
    }
    unwrapJsonString(e, t = 3) {
      let i = e;
      for (let e = 0; t > e && "string" == typeof i; e += 1) {
        const e = this.parseJsonFlexible(i);
        if (e === i) break;
        i = e;
      }
      return i;
    }
    ensureStringArray(e) {
      const t = this.unwrapJsonString(e);
      if (Array.isArray(t))
        return t.map((e) => String(e || "").trim()).filter(Boolean);
      if ("string" == typeof t) {
        const e = this.parseJsonFlexible(t);
        if (Array.isArray(e))
          return e.map((e) => String(e || "").trim()).filter(Boolean);
        if (t.trim()) return [t.trim()];
      }
      return [];
    }
    getStorage() {
      try {
        return "undefined" != typeof window && window.localStorage
          ? window.localStorage
          : null;
      } catch (e) {
        return null;
      }
    }
    readPersistedConfig() {
      try {
        const e = this.getStorage();
        if (!e) return {};
        const t = e.getItem(i);
        if (!t) return {};
        const r = JSON.parse(t);
        return this.mapDecryptedPayload(r);
      } catch (e) {
        return {};
      }
    }
    persistConfig(e) {
      try {
        const t = this.getStorage();
        if (!t) return;
        const r = {
          batchUrls: this.ensureStringArray(e.batchUrls),
          eventCodes: this.ensureStringArray(e.eventCodes),
          updatedAt: Date.now(),
        };
        t.setItem(i, JSON.stringify(r));
      } catch (e) {}
    }
    mapDecryptedPayload(e) {
      var t, i;
      if (!e || "object" != typeof e) return {};
      const r = e.data && "object" == typeof e.data ? e.data : e;
      return {
        batchUrls: this.ensureStringArray(
          null !== (t = r.batchUrls) && void 0 !== t ? t : r.domainList,
        ),
        eventCodes: this.ensureStringArray(
          null !== (i = r.eventCodes) && void 0 !== i ? i : r.eventList,
        ),
      };
    }
    prewarm() {
      this.fetchAndDecryptConfig().catch(() => {});
    }
    decryptAes128Ecb(e, t) {
      const i = q.parse(t);
      return N.decrypt(e, i, { mode: L, padding: j }).toString(z);
    }
    async decryptAes256Gcm(e, t) {
      const i = (e) => {
        const t = ((e) => {
          let t = String(e || "")
            .trim()
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          const i = t.length % 4 ? 4 - (t.length % 4) : 0;
          return (i && (t += "=".repeat(i)), t);
        })(e);
        if ("undefined" != typeof atob) {
          const e = atob(t),
            i = new Uint8Array(e.length);
          for (let t = 0; e.length > t; t += 1) i[t] = e.charCodeAt(t);
          return i;
        }
        return new Uint8Array();
      };
      if ("undefined" != typeof crypto && crypto.subtle) {
        const r = i(e);
        if (28 > r.length) throw new Error("gcm ciphertext too short");
        const n = i(t),
          o = r.slice(0, 12),
          s = r.slice(12),
          a = await crypto.subtle.importKey("raw", n, { name: "AES-GCM" }, !1, [
            "decrypt",
          ]),
          c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: o }, a, s);
        return new Uint8Array(c);
      }
      throw (
        "undefined" != typeof console &&
          console.warn &&
          console.warn(
            "[sdk][config] crypto.subtle unavailable, AES-GCM decrypt skipped. Use HTTPS (or localhost) to enable WebCrypto.",
          ),
        new Error("GCM decryption requires WebCrypto")
      );
    }
    async fetchAndDecryptConfig() {
      return (
        this.cachedConfigPromise ||
          (this.cachedConfigPromise = (async () => {
            var e, t;
            const i = this.readPersistedConfig();
            if (!this.encryptedConfigText) return i;
            try {
              try {
                const i = await this.decryptAes256Gcm(
                    this.encryptedConfigText,
                    this.secondGcmKeyBase64,
                  ),
                  r = new TextDecoder().decode(i),
                  n = JSON.parse(r),
                  o = this.mapDecryptedPayload(n),
                  s = null !== (e = o.batchUrls) && void 0 !== e ? e : [],
                  a = null !== (t = o.eventCodes) && void 0 !== t ? t : [];
                if (s.length > 0 || a.length > 0) {
                  const e = { batchUrls: s, eventCodes: a };
                  return (this.persistConfig(e), e);
                }
              } catch (e) {}
              const i = this.decryptAes128Ecb(
                  this.encryptedConfigText,
                  this.firstEcbKey,
                ),
                r = JSON.parse(i).config || "";
              if (!r) return {};
              const n = await this.decryptAes256Gcm(r, this.secondGcmKeyBase64),
                o = new TextDecoder().decode(n),
                s = JSON.parse(o),
                a = this.mapDecryptedPayload(s);
              return (this.persistConfig(a), a);
            } catch (e) {
              return (
                "undefined" != typeof console &&
                  console.warn &&
                  console.warn("[sdk][config] decrypt failed:", e),
                i
              );
            }
          })()),
        this.cachedConfigPromise
      );
    }
    async getBatchEndpoints() {
      return (await this.fetchAndDecryptConfig()).batchUrls || [];
    }
    async getEventCodes() {
      const e = (await this.fetchAndDecryptConfig()).eventCodes;
      return Array.isArray(e) && e.length > 0 ? e : n;
    }
    forceRefresh() {
      this.cachedConfigPromise = null;
    }
  }
  function K(e) {
    return null == e
      ? "null"
      : "string" == typeof e
        ? e
        : "number" == typeof e || "boolean" == typeof e
          ? String(e)
          : Array.isArray(e)
            ? `[${e.map((e) => K(e)).join(",")}]`
            : "object" == typeof e
              ? `{${Object.keys(e)
                  .sort()
                  .map((t) => `${t}:${K(e[t])}`)
                  .join(",")}}`
              : String(e);
  }
  class W {
    static canUseDocumentCookie() {
      return (
        "undefined" != typeof document && "string" == typeof document.cookie
      );
    }
    static getSidCookie() {
      if (!this.canUseDocumentCookie()) return null;
      const e = `${encodeURIComponent(this.SID_COOKIE_NAME)}=`,
        t = document.cookie.split("; ");
      for (let i = 0; t.length > i; i += 1)
        if (0 === t[i].indexOf(e)) {
          const r = t[i].slice(e.length);
          try {
            return decodeURIComponent(r);
          } catch (e) {
            return null;
          }
        }
      return null;
    }
    static setSidCookie(e) {
      if (this.canUseDocumentCookie())
        try {
          const t = encodeURIComponent(e);
          let i = `path=/;max-age=${this.SID_COOKIE_MAX_AGE_SEC};SameSite=Lax`;
          ("undefined" != typeof location &&
            "https:" === location.protocol &&
            (i += ";Secure"),
            (document.cookie = `${encodeURIComponent(this.SID_COOKIE_NAME)}=${t};${i}`));
        } catch (e) {}
    }
    static readRawSidPayload() {
      if ("undefined" == typeof window) return null;
      if (this.isStorageAvailable())
        try {
          const e = window.localStorage.getItem(this.SID_STORAGE_KEY);
          if (e) return e;
        } catch (e) {}
      return this.getSidCookie();
    }
    static parseSidStatePayload(e) {
      try {
        const t = JSON.parse(e);
        if (!t || !t.sid) return null;
        const i = String(t.sid).trim();
        return i
          ? "number" == typeof t.lastBehaviorAt &&
            Number.isFinite(t.lastBehaviorAt)
            ? { sid: i, lastBehaviorAt: t.lastBehaviorAt }
            : "number" == typeof t.ts && Number.isFinite(t.ts)
              ? { sid: i, lastBehaviorAt: t.ts }
              : null
          : null;
      } catch (e) {
        return null;
      }
    }
    static persistSidState(e) {
      const t = JSON.stringify(e);
      if (this.isStorageAvailable())
        try {
          window.localStorage.setItem(this.SID_STORAGE_KEY, t);
        } catch (e) {}
      this.setSidCookie(t);
    }
    static issueNewSid(e) {
      const t = this.createId32(),
        i = { sid: t, lastBehaviorAt: e };
      return ((this.sidMemoryCache = i), this.persistSidState(i), t);
    }
    static isStorageAvailable() {
      try {
        if ("undefined" == typeof window || !window.localStorage) return !1;
        const e = "__web_sdk_ping__";
        return (
          window.localStorage.setItem(e, "1"),
          window.localStorage.removeItem(e),
          !0
        );
      } catch (e) {
        return !1;
      }
    }
    static randomBytes(e) {
      const t = new Uint8Array(e);
      if ("undefined" != typeof crypto && crypto.getRandomValues)
        return (crypto.getRandomValues(t), t);
      for (let i = 0; e > i; i += 1) t[i] = Math.floor(256 * Math.random());
      return t;
    }
    static md5Hex(e = "") {
      const t = String(null == e ? "" : e),
        i = [];
      for (let e = 0; t.length > e; e += 1) {
        let r = t.charCodeAt(e);
        if (128 > r) i.push(r);
        else if (2048 > r) i.push(192 | (r >> 6), 128 | (63 & r));
        else if (55296 > r || r > 56319 || e + 1 >= t.length)
          i.push(224 | (r >> 12), 128 | ((r >> 6) & 63), 128 | (63 & r));
        else {
          const n = t.charCodeAt(e + 1);
          if (56320 > n || n > 57343)
            i.push(224 | (r >> 12), 128 | ((r >> 6) & 63), 128 | (63 & r));
          else {
            const t = n - 56320 + ((r - 55296) << 10) + 65536;
            (i.push(
              240 | (t >> 18),
              128 | ((t >> 12) & 63),
              128 | ((t >> 6) & 63),
              128 | (63 & t),
            ),
              (e += 1));
          }
        }
      }
      const r = 8 * i.length;
      for (i.push(128); i.length % 64 != 56; ) i.push(0);
      for (let e = 0; 8 > e; e += 1) i.push((r >>> (8 * e)) & 255);
      const n = (e, t) => (e << t) | (e >>> (32 - t)),
        o = (e, t) => (((e >>> 0) + (t >>> 0)) & 4294967295) >>> 0,
        s = (e, t, i, r) => o(o(e, t), o(i, r)),
        a = [
          7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14,
          20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11,
          16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6,
          10, 15, 21, 6, 10, 15, 21,
        ],
        c = new Array(64);
      for (let e = 0; 64 > e; e += 1)
        c[e] = Math.floor(4294967296 * Math.abs(Math.sin(e + 1))) >>> 0;
      let d = 1732584193,
        l = 4023233417,
        u = 2562383102,
        h = 271733878;
      for (let e = 0; i.length > e; e += 64) {
        const t = new Array(16);
        for (let r = 0; 16 > r; r += 1) {
          const n = e + 4 * r;
          t[r] =
            (i[n] | (i[n + 1] << 8) | (i[n + 2] << 16) | (i[n + 3] << 24)) >>>
            0;
        }
        let r = d,
          p = l,
          y = u,
          f = h;
        for (let e = 0; 64 > e; e += 1) {
          let i, d;
          16 > e
            ? ((i = (p & y) | (~p & f)), (d = e))
            : 32 > e
              ? ((i = (f & p) | (~f & y)), (d = (5 * e + 1) % 16))
              : 48 > e
                ? ((i = p ^ y ^ f), (d = (3 * e + 5) % 16))
                : ((i = y ^ (p | ~f)), (d = (7 * e) % 16));
          const l = f;
          ((f = y), (y = p), (p = o(p, n(s(r, i, c[e], t[d]), a[e]))), (r = l));
        }
        ((d = o(d, r)), (l = o(l, p)), (u = o(u, y)), (h = o(h, f)));
      }
      const p = (e) => {
        let t = "";
        for (let i = 0; 4 > i; i += 1)
          t += (256 + ((e >>> (8 * i)) & 255)).toString(16).slice(1);
        return t;
      };
      return `${p(d)}${p(l)}${p(u)}${p(h)}`;
    }
    static createId32() {
      const e = this.randomBytes(16),
        t = [];
      for (let e = 0; 256 > e; e += 1) t[e] = (e + 256).toString(16).slice(1);
      let i = "";
      for (let r = 0; e.length > r; r += 1) i += t[e[r]];
      return i.slice(0, 32);
    }
    static hashString32(e = "") {
      let t = 2166136261;
      const i = String(e || "");
      for (let e = 0; i.length > e; e += 1)
        ((t ^= i.charCodeAt(e)), (t = Math.imul(t, 16777619)));
      return (t >>> 0).toString(16).padStart(8, "0");
    }
    static notifyPageLoad() {
      const e = Date.now();
      this.issueNewSid(e);
    }
    static getSid() {
      const e = Date.now();
      if (!this.isStorageAvailable()) {
        const t = this.getSidCookie(),
          i = t ? this.parseSidStatePayload(t) : null;
        let r = this.sidMemoryCache || i;
        return r
          ? e - r.lastBehaviorAt > this.SID_TTL_MS
            ? this.issueNewSid(e)
            : ((r = { sid: r.sid, lastBehaviorAt: e }),
              (this.sidMemoryCache = r),
              this.persistSidState(r),
              r.sid)
          : this.issueNewSid(e);
      }
      const t = this.readRawSidPayload();
      let i = t ? this.parseSidStatePayload(t) : null;
      return (
        !i && this.sidMemoryCache && (i = this.sidMemoryCache),
        i
          ? e - i.lastBehaviorAt > this.SID_TTL_MS
            ? this.issueNewSid(e)
            : ((i = { sid: i.sid, lastBehaviorAt: e }),
              (this.sidMemoryCache = i),
              this.persistSidState(i),
              i.sid)
          : this.issueNewSid(e)
      );
    }
    static async getDeviceId() {
      if (!this.isStorageAvailable()) return this.createId32();
      const e = window.localStorage.getItem(this.DEVICE_ID_STORAGE_KEY);
      if (e) return e;
      const t = this.createId32();
      return (window.localStorage.setItem(this.DEVICE_ID_STORAGE_KEY, t), t);
    }
    static getDeviceFingerprint() {
      try {
        const e = (e) => {
            if (e && this.isStorageAvailable())
              try {
                window.localStorage.setItem(
                  this.DEVICE_FINGERPRINT_STORAGE_KEY,
                  e,
                );
              } catch (e) {}
          },
          t = (() =>
            (this.isStorageAvailable() &&
              window.localStorage.getItem(
                this.DEVICE_FINGERPRINT_STORAGE_KEY,
              )) ||
            "")();
        if (t) return t;
        const i = "undefined" != typeof navigator ? navigator : {},
          r = "undefined" != typeof screen ? screen : {},
          n =
            ("undefined" != typeof Intl &&
              Intl.DateTimeFormat &&
              Intl.DateTimeFormat().resolvedOptions().timeZone) ||
            "",
          o = i.language || "",
          s = Array.isArray(i.languages) ? i.languages.join(",") : "",
          a = r.colorDepth || "",
          c = r.pixelDepth || "",
          d =
            void 0 !== r.width && void 0 !== r.height
              ? `${r.width}x${r.height}`
              : "",
          l =
            void 0 !== r.availWidth && void 0 !== r.availHeight
              ? `${r.availWidth}x${r.availHeight}`
              : "",
          u =
            "undefined" != typeof window && window.devicePixelRatio
              ? window.devicePixelRatio
              : "",
          h = i.maxTouchPoints || 0,
          p = i.hardwareConcurrency || "",
          y = i.deviceMemory || "",
          f = [
            i.userAgent || "",
            i.platform || "",
            i.vendor || "",
            o,
            s,
            n,
            new Date().getTimezoneOffset(),
            d,
            l,
            a,
            c,
            u,
            h,
            p,
            y,
          ].join("||"),
          g = `fp_${this.hashString32(f)}`;
        return (e(g), g);
      } catch (e) {
        return "";
      }
    }
    static getClientTs() {
      return Math.floor(Date.now() / 1e3);
    }
    static getDeviceType() {
      if ("undefined" == typeof navigator) return "PC";
      const e = navigator.userAgent || "";
      return /Android/i.test(e)
        ? "Android"
        : /iPhone|iPad|iPod/i.test(e)
          ? "iOS"
          : "PC";
    }
    static getUserAgent() {
      return "undefined" == typeof navigator ? "" : navigator.userAgent || "";
    }
    static getDeviceBrandModel() {
      if (this.cachedDeviceBrandModel) return this.cachedDeviceBrandModel;
      if ("undefined" == typeof navigator)
        return (
          (this.cachedDeviceBrandModel = {
            device_brand: "",
            device_model: "",
          }),
          this.cachedDeviceBrandModel
        );
      const e = navigator.userAgent || "",
        t = navigator.platform || "";
      let i = "",
        r = "";
      return (
        /iPhone/i.test(e)
          ? ((i = "Apple"), (r = "iPhone"))
          : /iPad/i.test(e)
            ? ((i = "Apple"), (r = "iPad"))
            : /iPod/i.test(e)
              ? ((i = "Apple"), (r = "iPod"))
              : /Android/i.test(e)
                ? ((r = this.getAndroidModel(e)),
                  (i =
                    this.normalizeBrandByModel(r) || this.detectBrandFromUa(e)))
                : /Macintosh|Mac OS X/i.test(e) || /Mac/i.test(t)
                  ? ((i = "Apple"), (r = "Mac"))
                  : /Windows/i.test(e) || /Win/i.test(t)
                    ? ((i = "Microsoft"), (r = "Windows PC"))
                    : (/Linux/i.test(e) || /Linux/i.test(t)) &&
                      ((i = "Linux"), (r = "Linux PC")),
        (this.cachedDeviceBrandModel = {
          device_brand: String(i || ""),
          device_model: String(r || ""),
        }),
        this.cachedDeviceBrandModel
      );
    }
    static getAndroidModel(e = "") {
      const t = String(e || "").match(/Android[^;)]*;\s*([^;)]*?)\s+Build\//i);
      return t && t[1] ? String(t[1]).trim() : "";
    }
    static normalizeBrandByModel(e = "") {
      const t = String(e || "").toUpperCase();
      return t
        ? t.startsWith("SM-")
          ? "Samsung"
          : t.startsWith("MIX") || t.startsWith("MI ") || t.startsWith("REDMI")
            ? "Xiaomi"
            : t.startsWith("VOG-") ||
                t.startsWith("ANA-") ||
                t.startsWith("ELS-")
              ? "Huawei"
              : t.startsWith("CPH")
                ? "OPPO"
                : t.startsWith("V20") ||
                    t.startsWith("V21") ||
                    t.startsWith("V22")
                  ? "vivo"
                  : t.startsWith("LE2") ||
                      t.startsWith("NE2") ||
                      t.startsWith("KB2")
                    ? "OnePlus"
                    : t.startsWith("RMX")
                      ? "realme"
                      : t.startsWith("M2") || t.startsWith("M5")
                        ? "Meizu"
                        : t.startsWith("PIXEL")
                          ? "Google"
                          : ""
        : "";
    }
    static detectBrandFromUa(e = "") {
      const t = String(e || "").toUpperCase();
      return t
        ? t.includes("HUAWEI")
          ? "Huawei"
          : t.includes("HONOR")
            ? "HONOR"
            : t.includes("XIAOMI") || t.includes("REDMI") || t.includes(" MI ")
              ? "Xiaomi"
              : t.includes("OPPO")
                ? "OPPO"
                : t.includes("VIVO")
                  ? "vivo"
                  : t.includes("SAMSUNG") || t.includes("SM-")
                    ? "Samsung"
                    : t.includes("ONEPLUS")
                      ? "OnePlus"
                      : t.includes("REALME")
                        ? "realme"
                        : t.includes("MEIZU")
                          ? "Meizu"
                          : t.includes("NOKIA")
                            ? "Nokia"
                            : t.includes("MOTOROLA") || t.includes("MOTO")
                              ? "Motorola"
                              : t.includes("SONY")
                                ? "Sony"
                                : t.includes("LENOVO")
                                  ? "Lenovo"
                                  : t.includes("PIXEL") || t.includes("GOOGLE")
                                    ? "Google"
                                    : ""
        : "";
    }
  }
  function G(e) {
    return String(null == e ? "" : e).trim();
  }
  ((W.SID_STORAGE_KEY = "__web_sdk_sid__"),
    (W.SID_TTL_MS = 18e5),
    (W.SID_COOKIE_NAME = "__web_sdk_sid_v1"),
    (W.SID_COOKIE_MAX_AGE_SEC = 31536e3),
    (W.DEVICE_ID_STORAGE_KEY = "__web_sdk_device_id__"),
    (W.DEVICE_FINGERPRINT_STORAGE_KEY = "__web_sdk_device_fp__"),
    (W.sidMemoryCache = null),
    (W.cachedDeviceBrandModel = null));
  class V {
    static trimToString(e) {
      return String(null == e ? "" : e).trim();
    }
    static truncate(e, t) {
      return e.length > t ? e.slice(0, t) : e;
    }
    static async buildCommonFields(e = {}) {
      const { device_brand: t, device_model: i } = W.getDeviceBrandModel(),
        n = this.trimToString(e.appId);
      if (!n || n.length > 64) throw new Error("app_id 非法");
      const o = this.truncate(this.trimToString(e.channel), 128),
        s = this.truncate(this.trimToString(e.uid), 128),
        a = this.trimToString(W.getSid()) || W.createId32();
      if (!a || a.length > 64) throw new Error("sid 非法");
      const c = this.normalizeDevice(W.getDeviceType());
      if (!["Android", "iOS", "PC"].includes(c))
        throw new Error(`device 非法: ${c}`);
      const d = this.trimToString(await W.getDeviceId());
      if (!d || d.length > 128) throw new Error("device_id 非法");
      const l = this.truncate(this.trimToString(W.getUserAgent()), 512),
        u = this.truncate(this.trimToString(t), 128),
        h = this.truncate(this.trimToString(i), 128),
        p = this.truncate(this.trimToString(W.getDeviceFingerprint()), 128),
        y = p ? this.truncate(this.trimToString(r), 16) : "";
      if (p && !y) throw new Error("fp_version 非法");
      return {
        app_id: n,
        channel: o,
        client_ts: this.normalizeClientTs(W.getClientTs()),
        device: c,
        device_brand: u,
        device_model: h,
        device_id: d,
        device_fingerprint: p,
        fp_version: y,
        sid: a,
        uid: s,
        user_agent: l,
      };
    }
    static normalizeDevice(e) {
      const t = this.trimToString(e);
      if (!t) return "";
      const i = t.toLowerCase();
      return "android" === i
        ? "Android"
        : "ios" === i
          ? "iOS"
          : "pc" === i
            ? "PC"
            : t;
    }
    static normalizeEventName(e) {
      const t = this.trimToString(e);
      if (!t || t.length > 64 || !/^[a-z0-9_]+$/.test(t))
        throw new Error(`event 非法: ${t}`);
      return t;
    }
    static normalizeEventId(e) {
      const t = this.trimToString(e);
      if (!t) return "";
      if (!/^[A-Za-z0-9]{1,32}$/.test(t))
        throw new Error(`event_id 非法: ${t}`);
      return t;
    }
    static normalizeClientTs(e) {
      const t = Number(e),
        i = Number.isFinite(t) ? Math.floor(t) : Number.NaN;
      if (!Number.isFinite(i) || 946684800 > i || i > 4124444800)
        throw new Error(`client_ts 非法: ${e}`);
      return i;
    }
    static buildDerivedEventId(e = {}) {
      const t = Object.keys(e)
        .filter((e) => "event_id" !== e && "client_ts" !== e)
        .sort();
      if (!t.length) return W.createId32();
      const i = t.map((t) => W.md5Hex(K(e[t]))).join("");
      return W.md5Hex(i);
    }
    static normalizePayload(e = {}) {
      if (Object.prototype.hasOwnProperty.call(e, "payload")) {
        const t = e.payload;
        if (!t || "object" != typeof t || Array.isArray(t))
          throw new Error("payload 必须是 JSON object");
      }
      const t = {
        ...(e.payload && "object" == typeof e.payload ? e.payload : {}),
      };
      return (
        Object.keys(e || {}).forEach((i) => {
          0 > o.indexOf(i) && (t[i] = e[i]);
        }),
        t
      );
    }
    static async buildEventRecord(e, t = {}) {
      var i;
      const { device_brand: n, device_model: o } = W.getDeviceBrandModel(),
        s = this.trimToString(e.app_id || t.appId);
      if (!s || s.length > 64) throw new Error("app_id 非法");
      const a = {
        event: this.normalizeEventName(e.event),
        app_id: s,
        channel: this.truncate(this.trimToString(e.channel || t.channel), 128),
        client_ts: e.client_ts
          ? this.normalizeClientTs(e.client_ts)
          : W.getClientTs(),
        device: this.normalizeDevice(e.device || W.getDeviceType()),
        device_brand: this.trimToString(e.device_brand || n),
        device_model: this.trimToString(e.device_model || o),
        device_id: this.trimToString(e.device_id || (await W.getDeviceId())),
        device_fingerprint: this.trimToString(
          e.device_fingerprint || W.getDeviceFingerprint(),
        ),
        fp_version: this.trimToString(e.fp_version || r),
        sid: this.trimToString(e.sid || W.getSid()),
        uid: this.truncate(this.trimToString(e.uid || t.uid), 128),
        user_agent: this.trimToString(e.user_agent || W.getUserAgent()),
        payload: this.normalizePayload(e),
      };
      return (
        (a.event_id = e.event_id
          ? this.normalizeEventId(e.event_id)
          : null !==
                (i = (function (e) {
                  var t, i, r, n, o, s, a;
                  switch (e.event) {
                    case "navigation":
                      return W.md5Hex(
                        K({
                          event: "navigation",
                          navigation_key: G(
                            null === (t = e.payload) || void 0 === t
                              ? void 0
                              : t.navigation_key,
                          ),
                        }),
                      );
                    case "app_page_view":
                      return W.md5Hex(
                        K({
                          event: "app_page_view",
                          current_page_key: G(
                            null === (i = e.payload) || void 0 === i
                              ? void 0
                              : i.current_page_key,
                          ),
                        }),
                      );
                    case "page_click": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "page_click",
                          page_key: G(null == t ? void 0 : t.page_key),
                          click_page_x: null == t ? void 0 : t.click_page_x,
                          click_page_y: null == t ? void 0 : t.click_page_y,
                        }),
                      );
                    }
                    case "recommend_list_view":
                      return W.md5Hex(
                        K({
                          event: "recommend_list_view",
                          page_key: G(
                            null === (r = e.payload) || void 0 === r
                              ? void 0
                              : r.page_key,
                          ),
                          recommend_content_type: G(
                            null === (n = e.payload) || void 0 === n
                              ? void 0
                              : n.recommend_content_type,
                          ),
                        }),
                      );
                    case "recommend_list_click":
                      return W.md5Hex(
                        K({
                          event: "recommend_list_click",
                          page_key: G(
                            null === (o = e.payload) || void 0 === o
                              ? void 0
                              : o.page_key,
                          ),
                          recommend_content_type: G(
                            null === (s = e.payload) || void 0 === s
                              ? void 0
                              : s.recommend_content_type,
                          ),
                        }),
                      );
                    case "advertising": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "advertising",
                          event_type: G(null == t ? void 0 : t.event_type),
                          advertising_key: G(
                            null == t ? void 0 : t.advertising_key,
                          ),
                          advertising_name: G(
                            null == t ? void 0 : t.advertising_name,
                          ),
                          advertising_id: G(
                            null == t ? void 0 : t.advertising_id,
                          ),
                        }),
                      );
                    }
                    case "video_event": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "video_event",
                          video_id: G(null == t ? void 0 : t.video_id),
                          video_type_id: G(
                            null == t ? void 0 : t.video_type_id,
                          ),
                          video_behavior_key: G(
                            null == t ? void 0 : t.video_behavior_key,
                          ),
                          video_behavior_name: G(
                            null == t ? void 0 : t.video_behavior_name,
                          ),
                        }),
                      );
                    }
                    case "novel_event": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "novel_event",
                          novel_id: G(null == t ? void 0 : t.novel_id),
                          novel_type_id: G(
                            null == t ? void 0 : t.novel_type_id,
                          ),
                        }),
                      );
                    }
                    case "comic_event": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "comic_event",
                          comic_id: G(null == t ? void 0 : t.comic_id),
                          comic_type_id: G(
                            null == t ? void 0 : t.comic_type_id,
                          ),
                        }),
                      );
                    }
                    case "ad_impression": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "ad_impression",
                          page_key: G(null == t ? void 0 : t.page_key),
                          ad_slot_key: G(null == t ? void 0 : t.ad_slot_key),
                          ad_id: G(null == t ? void 0 : t.ad_id),
                          ad_type: G(null == t ? void 0 : t.ad_type),
                        }),
                      );
                    }
                    case "ad_click": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "ad_click",
                          page_key: G(null == t ? void 0 : t.page_key),
                          ad_slot_key: G(null == t ? void 0 : t.ad_slot_key),
                          ad_id: G(null == t ? void 0 : t.ad_id),
                          ad_type: G(null == t ? void 0 : t.ad_type),
                        }),
                      );
                    }
                    case "keyword_click": {
                      const t = e.payload;
                      return W.md5Hex(
                        K({
                          event: "keyword_click",
                          click_item_id: G(
                            null == t ? void 0 : t.click_item_id,
                          ),
                          click_item_type_key: G(
                            null == t ? void 0 : t.click_item_type_key,
                          ),
                          click_position: null == t ? void 0 : t.click_position,
                        }),
                      );
                    }
                    case "keyword_search":
                      return W.md5Hex(
                        K({
                          event: "keyword_search",
                          keyword: G(
                            null === (a = e.payload) || void 0 === a
                              ? void 0
                              : a.keyword,
                          ),
                        }),
                      );
                    default:
                      return;
                  }
                })(a)) && void 0 !== i
            ? i
            : this.buildDerivedEventId(a)),
        a
      );
    }
  }
  const Q = "events";
  class X {
    constructor(e = {}) {
      this.maxSize =
        Number.isFinite(Number(e.maxPersistentQueueSize)) &&
        Number(e.maxPersistentQueueSize) > 0
          ? Math.floor(Number(e.maxPersistentQueueSize))
          : 2e3;
    }
    isAvailable() {
      return (
        "undefined" != typeof indexedDB &&
        "undefined" != typeof window &&
        void 0 !== window.indexedDB
      );
    }
    openDb() {
      return new Promise((e, t) => {
        if (!this.isAvailable()) return void e(null);
        const i = indexedDB.open("web_sdk_event_queue", 1);
        ((i.onerror = () => t(i.error || new Error("open indexedDB failed"))),
          (i.onupgradeneeded = () => {
            const e = i.result;
            e.objectStoreNames.contains(Q) ||
              e
                .createObjectStore(Q, { keyPath: "id", autoIncrement: !0 })
                .createIndex("createdAt", "createdAt", { unique: !1 });
          }),
          (i.onsuccess = () => e(i.result)));
      });
    }
    txDone(e) {
      return new Promise((t, i) => {
        ((e.oncomplete = () => t()),
          (e.onerror = () =>
            i(e.error || new Error("indexedDB transaction failed"))),
          (e.onabort = () =>
            i(e.error || new Error("indexedDB transaction aborted"))));
      });
    }
    async trimOverflow(e) {
      const t = e.transaction(Q, "readonly"),
        i = t.objectStore(Q).count(),
        r = await new Promise((e, t) => {
          ((i.onsuccess = () => e(Number(i.result || 0))),
            (i.onerror = () => t(i.error || new Error("count failed"))));
        });
      if ((await this.txDone(t), this.maxSize >= r)) return;
      const n = r - this.maxSize,
        o = e.transaction(Q, "readwrite"),
        s = o.objectStore(Q),
        a = s.index("createdAt");
      let c = 0;
      (await new Promise((e, t) => {
        const i = a.openCursor();
        ((i.onerror = () => t(i.error || new Error("open cursor failed"))),
          (i.onsuccess = () => {
            const t = i.result;
            t && n > c ? (s.delete(t.primaryKey), (c += 1), t.continue()) : e();
          }));
      }),
        await this.txDone(o));
    }
    async enqueueMany(e = []) {
      if (!e.length) return;
      const t = await this.openDb();
      if (t)
        try {
          const i = t.transaction(Q, "readwrite"),
            r = i.objectStore(Q),
            n = Date.now();
          (e.forEach((e, t) => {
            const i =
              e &&
              "object" == typeof e &&
              Object.prototype.hasOwnProperty.call(e, "record")
                ? e
                : { record: e };
            r.add({
              createdAt: n + t,
              record: i.record,
              endpointOverride: i.endpointOverride || "",
              retryCount: Number.isFinite(Number(i.retryCount))
                ? Math.max(0, Math.floor(Number(i.retryCount)))
                : 0,
              nextRetryAt: Number.isFinite(Number(i.nextRetryAt))
                ? Math.max(0, Math.floor(Number(i.nextRetryAt)))
                : 0,
            });
          }),
            await this.txDone(i),
            await this.trimOverflow(t));
        } finally {
          t.close();
        }
    }
    async readOldest(e = 20) {
      const t = await this.openDb();
      if (!t) return [];
      try {
        const i = t
            .transaction(Q, "readonly")
            .objectStore(Q)
            .index("createdAt"),
          r = [],
          n = Date.now();
        return (
          await new Promise((t, o) => {
            const s = i.openCursor();
            ((s.onerror = () => o(s.error || new Error("read cursor failed"))),
              (s.onsuccess = () => {
                const i = s.result;
                if (!i || r.length >= e) return void t();
                const o = i.value,
                  a = Number.isFinite(Number(o.nextRetryAt))
                    ? Math.floor(Number(o.nextRetryAt))
                    : 0;
                (a > n ||
                  r.push({
                    ...o,
                    endpointOverride: o.endpointOverride || "",
                    retryCount: Number.isFinite(Number(o.retryCount))
                      ? Math.floor(Number(o.retryCount))
                      : 0,
                    nextRetryAt: a,
                  }),
                  i.continue());
              }));
          }),
          r
        );
      } finally {
        t.close();
      }
    }
    async removeByIds(e = []) {
      if (!e.length) return;
      const t = await this.openDb();
      if (t)
        try {
          const i = t.transaction(Q, "readwrite"),
            r = i.objectStore(Q);
          (e.forEach((e) => {
            r.delete(e);
          }),
            await this.txDone(i));
        } finally {
          t.close();
        }
    }
    async updateRetryMeta(e = [], t, i) {
      if (!e.length) return { dropped: 0, kept: 0 };
      const r = await this.openDb();
      if (!r) return { dropped: 0, kept: 0 };
      try {
        const n = r.transaction(Q, "readwrite"),
          o = n.objectStore(Q),
          s = Date.now(),
          a = Number.isFinite(Number(i))
            ? Math.max(0, Math.floor(Number(i)))
            : 0,
          c = Number.isFinite(Number(t))
            ? Math.max(0, Math.floor(Number(t)))
            : 0;
        let d = 0,
          l = 0;
        return (
          e.forEach((e) => {
            const t =
              (Number.isFinite(Number(e.retryCount))
                ? Math.max(0, Math.floor(Number(e.retryCount)))
                : 0) + 1;
            if (t > a) return ((d += 1), void o.delete(e.id));
            ((l += 1), o.put({ ...e, retryCount: t, nextRetryAt: s + c }));
          }),
          await this.txDone(n),
          { dropped: d, kept: l }
        );
      } finally {
        r.close();
      }
    }
    async count() {
      const e = await this.openDb();
      if (!e) return 0;
      try {
        const t = e.transaction(Q, "readonly"),
          i = t.objectStore(Q),
          r = await new Promise((e, t) => {
            const r = i.count();
            ((r.onsuccess = () => e(Number(r.result || 0))),
              (r.onerror = () => t(r.error || new Error("count failed"))));
          });
        return (await this.txDone(t), r);
      } finally {
        e.close();
      }
    }
  }
  class J {
    isLocalhost(e) {
      const t = String(e || "").toLowerCase();
      return "localhost" === t || "127.0.0.1" === t || "::1" === t;
    }
    isEndpointAllowed(e, t) {
      if (!t) return !0;
      try {
        const t = new URL(e);
        return (
          "https:" === t.protocol ||
          !("http:" !== t.protocol || !this.isLocalhost(t.hostname))
        );
      } catch (e) {
        return !1;
      }
    }
    async sendBatch(e, t = [], i = {}) {
      if (!e) return { sent: !1, ok: !1, status: 0, reason: "no_endpoint" };
      if (!Array.isArray(t) || 0 === t.length)
        return { sent: !0, ok: !0, status: 200, reason: "empty_batch" };
      const r = JSON.stringify(t),
        n = !0 === i.useBeacon,
        o = !1 !== i.requireHttps,
        s =
          Number.isFinite(Number(i.timeoutMs)) && Number(i.timeoutMs) > 0
            ? Math.floor(Number(i.timeoutMs))
            : J.DEFAULT_TIMEOUT_MS;
      if (!this.isEndpointAllowed(e, o))
        return { sent: !1, ok: !1, status: 0, reason: "insecure_endpoint" };
      if (
        n &&
        "undefined" != typeof navigator &&
        "function" == typeof navigator.sendBeacon &&
        "undefined" != typeof Blob
      )
        try {
          const t = new Blob([r], { type: "application/json" });
          if (navigator.sendBeacon(e, t))
            return { sent: !0, ok: !0, status: 200, transport: "beacon" };
        } catch (e) {}
      if ("function" == typeof fetch)
        try {
          const t =
              "undefined" != typeof AbortController
                ? new AbortController()
                : null,
            i =
              t && s > 0
                ? setTimeout(() => {
                    t.abort();
                  }, s)
                : null,
            n = await fetch(e, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: r,
              keepalive: !0,
              ...(t ? { signal: t.signal } : {}),
            });
          return (
            i && clearTimeout(i),
            {
              sent: !0,
              ok: n.ok,
              status: Number(n.status || 0),
              transport: "fetch",
            }
          );
        } catch (e) {
          if (e && "object" == typeof e && "AbortError" === e.name)
            return {
              sent: !1,
              ok: !1,
              status: 0,
              reason: "timeout",
              transport: "fetch",
            };
        }
      return new Promise((t) => {
        try {
          if ("undefined" == typeof XMLHttpRequest)
            return t({ sent: !1, ok: !1, status: 0, reason: "no_xhr" });
          const i = new XMLHttpRequest();
          (i.open("POST", e, !0),
            (i.timeout = s),
            i.setRequestHeader("Content-Type", "application/json"),
            (i.onreadystatechange = () => {
              4 === i.readyState &&
                t({
                  sent: !0,
                  ok: i.status >= 200 && 300 > i.status,
                  status: i.status,
                  transport: "xhr",
                });
            }),
            (i.onerror = () =>
              t({ sent: !1, ok: !1, status: 0, reason: "xhr_error" })),
            (i.ontimeout = () =>
              t({
                sent: !1,
                ok: !1,
                status: 0,
                reason: "timeout",
                transport: "xhr",
              })),
            i.send(r));
        } catch (e) {
          t({ sent: !1, ok: !1, status: 0, reason: "xhr_exception" });
        }
      });
    }
  }
  J.DEFAULT_TIMEOUT_MS = 1e4;
  class Y {
    constructor(e, t) {
      ((this.endpointResolver = t),
        (this.queue = []),
        (this.timer = null),
        (this.flushing = !1),
        (this.replaying = !1),
        (this.replayTimer = null),
        (this.hasPersistentItems = !0),
        (this.options = e),
        (this.persistentQueue = new X(e)),
        (this.transport = new J()),
        (this.batchMaxSize =
          Number.isFinite(Number(e.batchMaxSize)) && Number(e.batchMaxSize) > 0
            ? Math.floor(Number(e.batchMaxSize))
            : 10),
        (this.batchIntervalMs =
          Number.isFinite(Number(e.batchIntervalMs)) &&
          Number(e.batchIntervalMs) > 0
            ? Math.floor(Number(e.batchIntervalMs))
            : 5e3),
        (this.replayBatchSize =
          Number.isFinite(Number(e.replayBatchSize)) &&
          Number(e.replayBatchSize) > 0
            ? Math.floor(Number(e.replayBatchSize))
            : 20),
        (this.replayIntervalMs =
          Number.isFinite(Number(e.replayIntervalMs)) &&
          Number(e.replayIntervalMs) > 0
            ? Math.floor(Number(e.replayIntervalMs))
            : 5e3),
        (this.useBeacon = !0 === e.useBeacon),
        (this.trackTimeoutMs =
          Number.isFinite(Number(e.trackTimeoutMs)) &&
          Number(e.trackTimeoutMs) > 0
            ? Math.floor(Number(e.trackTimeoutMs))
            : 3e4),
        (this.replayMaxRetries =
          Number.isFinite(Number(e.replayMaxRetries)) &&
          Number(e.replayMaxRetries) >= 0
            ? Math.floor(Number(e.replayMaxRetries))
            : 5),
        (this.replayBackoffMaxMs =
          Number.isFinite(Number(e.replayBackoffMaxMs)) &&
          Number(e.replayBackoffMaxMs) > 0
            ? Math.floor(Number(e.replayBackoffMaxMs))
            : 6e4),
        this.startReplayTimer());
    }
    startReplayTimer() {
      this.replayTimer = setInterval(() => {
        this.replayPersistent();
      }, this.replayIntervalMs);
    }
    stopTimer() {
      this.timer && (clearTimeout(this.timer), (this.timer = null));
    }
    settleItem(e, t) {
      e.settled ||
        ((e.settled = !0),
        e.timeoutTimer &&
          (clearTimeout(e.timeoutTimer), (e.timeoutTimer = null)),
        e.resolve(t));
    }
    purgeSettledFromQueue() {
      this.queue.length && (this.queue = this.queue.filter((e) => !e.settled));
    }
    toPersistentEntries(e) {
      return e.map((e) => ({
        record: e.record,
        endpointOverride: e.endpointOverride || "",
        retryCount: 0,
        nextRetryAt: 0,
      }));
    }
    getRetryDelayMs(e) {
      const t = Number.isFinite(Number(e))
          ? Math.max(0, Math.floor(Number(e)))
          : 0,
        i = Math.min(10, t),
        r = this.replayIntervalMs * Math.pow(2, i);
      return Math.min(
        this.replayBackoffMaxMs,
        Math.max(this.replayIntervalMs, Math.floor(r)),
      );
    }
    dedupeRecordsForBatchSend(e) {
      var t;
      const i = new Set(),
        r = [];
      for (let n = 0; e.length > n; n += 1) {
        const o = e[n],
          s =
            String(
              null !== (t = null == o ? void 0 : o.event_id) && void 0 !== t
                ? t
                : "",
            ).trim() || `__empty_event_id__:${n}`;
        i.has(s) || (i.add(s), r.push(o));
      }
      return r;
    }
    schedule() {
      (this.purgeSettledFromQueue(),
        this.timer ||
          0 === this.queue.length ||
          (this.timer = setTimeout(() => {
            ((this.timer = null), this.flush());
          }, this.batchIntervalMs)));
    }
    async flush() {
      if (
        (this.purgeSettledFromQueue(),
        !this.flushing && 0 !== this.queue.length)
      ) {
        ((this.flushing = !0), this.stopTimer());
        try {
          const e = this.queue.splice(0, this.queue.length);
          if (
            e.length &&
            this.endpointResolver.consumeProbeFailurePersistSignal()
          )
            return (
              await this.persistentQueue.enqueueMany(
                this.toPersistentEntries(e),
              ),
              (this.hasPersistentItems = !0),
              void e.forEach((e) =>
                this.settleItem(e, {
                  sent: !1,
                  ok: !1,
                  status: 0,
                  reason: "probe_all_failed",
                }),
              )
            );
          const t = {},
            i = [];
          for (let i = 0; e.length > i; i += 1) {
            const r = e[i];
            if (r.settled) continue;
            const n = r.endpointOverride || "__default__";
            (t[n] || (t[n] = []), t[n].push(r));
          }
          const r = Object.keys(t);
          for (let e = 0; r.length > e; e += 1) {
            const n = r[e],
              o = t[n],
              s = "__default__" === n ? "" : n,
              a = await this.resolveEndpointInternal(s);
            if (!a) {
              "unavailable" === this.endpointResolver.getEndpointState()
                ? (await this.persistentQueue.enqueueMany(
                    this.toPersistentEntries(o),
                  ),
                  (this.hasPersistentItems = !0),
                  o.forEach((e) =>
                    this.settleItem(e, {
                      sent: !1,
                      ok: !1,
                      status: 0,
                      reason: "endpoint_unavailable",
                    }),
                  ))
                : i.push(...o);
              continue;
            }
            const c = this.dedupeRecordsForBatchSend(o.map((e) => e.record)),
              d = await this.transport.sendBatch(a, c, {
                useBeacon: this.useBeacon,
              });
            ((d && d.ok) ||
              (await this.persistentQueue.enqueueMany(
                this.toPersistentEntries(o),
              ),
              (this.hasPersistentItems = !0)),
              o.forEach((e) => this.settleItem(e, d)));
          }
          if (i.length) {
            const e = Date.now(),
              t = [],
              r = [];
            for (let n = 0; i.length > n; n += 1) {
              const o = i[n];
              o.settled || (o.timeoutAt > e ? r.push(o) : t.push(o));
            }
            (t.length &&
              (await this.persistentQueue.enqueueMany(
                this.toPersistentEntries(t),
              ),
              (this.hasPersistentItems = !0),
              t.forEach((e) =>
                this.settleItem(e, {
                  sent: !1,
                  ok: !1,
                  status: 0,
                  reason: "track_timeout",
                  transport: "queue",
                }),
              )),
              r.forEach((e) => this.queue.push(e)));
          }
        } finally {
          ((this.flushing = !1), this.queue.length > 0 && this.schedule());
        }
      }
    }
    async resolveEndpointInternal(e) {
      return this._resolveEndpoint(e);
    }
    async replayPersistent() {
      if (this.hasPersistentItems && !this.replaying) {
        this.replaying = !0;
        try {
          if (!(await this.resolveEndpointInternal(""))) return;
          const e = await this.persistentQueue.readOldest(this.replayBatchSize);
          if (!e.length)
            return void (
              0 === (await this.persistentQueue.count()) &&
              (this.hasPersistentItems = !1)
            );
          const t = {};
          e.forEach((e) => {
            const i = e.endpointOverride || "__default__";
            (t[i] || (t[i] = []), t[i].push(e));
          });
          const i = Object.keys(t);
          for (let e = 0; i.length > e; e += 1) {
            const r = i[e],
              n = t[r],
              o = "__default__" === r ? "" : r,
              s = await this.resolveEndpointInternal(o);
            if (!s) continue;
            const a = this.dedupeRecordsForBatchSend(n.map((e) => e.record)),
              c = n.map((e) => e.id),
              d = await this.transport.sendBatch(s, a, {
                useBeacon: this.useBeacon,
              });
            if (d && d.ok) {
              await this.persistentQueue.removeByIds(c);
              continue;
            }
            const l = n.reduce((e, t) => {
                const i = Number.isFinite(Number(t.retryCount))
                  ? Math.floor(Number(t.retryCount))
                  : 0;
                return Math.max(e, i);
              }, 0),
              u = this.getRetryDelayMs(l),
              h = await this.persistentQueue.updateRetryMeta(
                n,
                u,
                this.replayMaxRetries,
              );
            h.dropped > 0 &&
              "undefined" != typeof console &&
              console.warn &&
              console.warn(
                `[sdk][replay] dropped ${h.dropped} events after max retries (${this.replayMaxRetries}).`,
              );
          }
        } catch (e) {
        } finally {
          this.replaying = !1;
        }
      }
    }
    async track(e, t) {
      const i = await V.buildEventRecord(e, this.options);
      return new Promise((e, r) => {
        const n = Date.now(),
          o = {
            record: i,
            endpointOverride: t,
            resolve: e,
            reject: r,
            settled: !1,
            timeoutAt: n + this.trackTimeoutMs,
            timeoutTimer: null,
          };
        ((o.timeoutTimer = setTimeout(() => {
          o.settled ||
            this.persistentQueue
              .enqueueMany(this.toPersistentEntries([o]))
              .then(() => {
                ((this.hasPersistentItems = !0),
                  o.settled ||
                    this.settleItem(o, {
                      sent: !1,
                      ok: !1,
                      status: 0,
                      reason: "track_timeout",
                      transport: "queue",
                    }));
              })
              .catch(() => {
                this.settleItem(o, {
                  sent: !1,
                  ok: !1,
                  status: 0,
                  reason: "track_timeout",
                  transport: "queue",
                });
              });
        }, this.trackTimeoutMs)),
          this.queue.push(o),
          this.batchMaxSize > this.queue.length
            ? this.schedule()
            : this.flush().catch(r));
      });
    }
    stop() {
      (this.stopTimer(),
        this.replayTimer &&
          (clearInterval(this.replayTimer), (this.replayTimer = null)));
    }
    getConfig() {
      return {
        batchMaxSize: this.batchMaxSize,
        batchIntervalMs: this.batchIntervalMs,
        replayBatchSize: this.replayBatchSize,
        replayIntervalMs: this.replayIntervalMs,
      };
    }
  }
  const Z = "1.0.9";
  class ee {
    constructor(e) {
      if (
        ((this.refreshTimer = null),
        (this.unsubEndpointReady = null),
        (this._onPageHide = null),
        (this._onVisibilityChange = null),
        !Object.prototype.hasOwnProperty.call(e, "channel"))
      )
        throw new Error('channel 为必传字段（可传空字符串 ""）');
      const t = null == e.channel ? "" : String(e.channel);
      ((this.options = { ...e, channel: t }),
        (this.configManager = new $(e)),
        (this.domainResolver = new s({ pingTimeoutMs: e.pingTimeoutMs })),
        (this.batcher = new Y(this.options, this.domainResolver)),
        (this.batcher._resolveEndpoint = (e) =>
          this.domainResolver.resolveEndpoint(
            () => this.configManager.getBatchEndpoints(),
            e,
          )),
        (this.unsubEndpointReady = this.domainResolver.onEndpointReady(() => {
          this.batcher.flush().catch(() => {});
        })),
        this.init({}),
        this._registerPageLifecycleListeners());
    }
    _registerPageLifecycleListeners() {
      "undefined" != typeof window &&
        ((this._onPageHide = () => {
          this.batcher.flush().catch(() => {});
        }),
        (this._onVisibilityChange = () => {
          "undefined" != typeof document &&
            "hidden" === document.visibilityState &&
            this.batcher.flush().catch(() => {});
        }),
        window.addEventListener("pagehide", this._onPageHide),
        window.addEventListener("visibilitychange", this._onVisibilityChange));
    }
    init(e = {}) {
      ((this.options = { ...this.options, ...e }),
        null == this.options.channel && (this.options.channel = ""),
        this.configManager.setEncryptedConfig(
          this.options.encryptedConfig || this.options.configCipher || "",
        ),
        this.configManager.prewarm(),
        this.domainResolver.init(() => this.configManager.getBatchEndpoints()),
        this.refreshTimer && clearInterval(this.refreshTimer));
      const t =
        Number.isFinite(Number(this.options.remoteConfigRefreshMs)) &&
        Number(this.options.remoteConfigRefreshMs) > 0
          ? Math.floor(Number(this.options.remoteConfigRefreshMs))
          : 12e5;
      return (
        (this.refreshTimer = setInterval(() => {
          this.refreshConfig();
        }, t)),
        this.buildInitReturn()
      );
    }
    async refreshConfig() {
      try {
        (this.configManager.forceRefresh(),
          await this.domainResolver.refreshDomainConfig(() =>
            this.configManager.getBatchEndpoints(),
          ));
      } catch (e) {}
    }
    async track(e, t) {
      return this.batcher.track(e, t);
    }
    setContext(e = {}) {
      const t = e && "object" == typeof e ? e : {};
      return (
        Object.prototype.hasOwnProperty.call(t, "uid") &&
          (this.options.uid = null == t.uid ? "" : String(t.uid)),
        Object.prototype.hasOwnProperty.call(t, "channel") &&
          (this.options.channel = null == t.channel ? "" : String(t.channel)),
        (this.batcher.options = { ...this.options }),
        this.getConfig()
      );
    }
    setUid(e) {
      return this.setContext({ uid: e });
    }
    getSelectedHost() {
      const e = this.domainResolver.getSelectedBatchEndpoint();
      if (!e) return "";
      try {
        return new URL(e).origin;
      } catch (e) {
        return "";
      }
    }
    buildInitReturn() {
      return {
        ...this.batcher.getConfig(),
        selectedHost: this.getSelectedHost(),
        version: Z,
      };
    }
    getConfig() {
      return {
        ...this.options,
        ...this.batcher.getConfig(),
        selectedHost: this.getSelectedHost(),
        selectedBatchEndpoint: this.domainResolver.getSelectedBatchEndpoint(),
        version: Z,
      };
    }
    flush() {
      return this.batcher.flush();
    }
    async refreshDomainConfig() {
      return {
        selectedBatchEndpoint: await this.domainResolver.refreshDomainConfig(
          () => this.configManager.getBatchEndpoints(),
        ),
        selectedHost: this.getSelectedHost(),
        version: Z,
      };
    }
    stop() {
      (this.unsubEndpointReady &&
        (this.unsubEndpointReady(), (this.unsubEndpointReady = null)),
        "undefined" != typeof window &&
          (this._onPageHide &&
            (window.removeEventListener("pagehide", this._onPageHide),
            (this._onPageHide = null)),
          this._onVisibilityChange &&
            (window.removeEventListener(
              "visibilitychange",
              this._onVisibilityChange,
            ),
            (this._onVisibilityChange = null))),
        this.refreshTimer &&
          (clearInterval(this.refreshTimer), (this.refreshTimer = null)),
        this.batcher.stop());
    }
  }
  const te = {
    navigation: {
      navigation_key: { type: "string", required: !0 },
      navigation_name: { type: "string", required: !0 },
    },
    appPageView: {
      user_type: { type: "string", required: !1 },
      page_key: { type: "string", required: !1 },
      page_name: { type: "string", required: !1 },
      referrer_page_key: { type: "string", required: !1 },
      referrer_page_name: { type: "string", required: !1 },
      current_page_key: { type: "string", required: !1 },
      current_page_name: { type: "string", required: !1 },
      page_load_time: { type: "int", required: !1 },
      recommend_trace_id: { type: "string", required: !1 },
    },
    comicEvent: {
      media_id: { type: "string", required: !1 },
      comic_id: { type: "string", required: !0 },
      comic_title: { type: "string", required: !0 },
      comic_type_id: { type: "string", required: !0 },
      comic_type_name: { type: "string", required: !0 },
      recommend_trace_id: { type: "string", required: !1 },
      comic_tag_key: { type: "string", required: !0 },
      comic_tag_name: { type: "string", required: !0 },
      read_progress: { type: "number", required: !0 },
      page_no: { type: "number", required: !0 },
      comic_behavior_key: { type: "string", required: !0 },
      comic_behavior_name: { type: "string", required: !0 },
    },
    novelEvent: {
      media_id: { type: "string", required: !1 },
      novel_id: { type: "string", required: !0 },
      novel_title: { type: "string", required: !0 },
      novel_type_id: { type: "string", required: !0 },
      novel_type_name: { type: "string", required: !0 },
      recommend_trace_id: { type: "string", required: !1 },
      novel_tag_key: { type: "string", required: !0 },
      novel_tag_name: { type: "string", required: !0 },
      read_progress: { type: "number", required: !0 },
      page_no: { type: "number", required: !0 },
      novel_behavior_key: { type: "string", required: !0 },
      novel_behavior_name: { type: "string", required: !0 },
    },
    keywordSearch: {
      keyword: { type: "string", required: !0 },
      search_result_count: { type: "number", required: !1 },
      search_trace_id: { type: "string", required: !1 },
      search_id: { type: "string", required: !1 },
    },
    keywordClick: {
      keyword: { type: "string", required: !0 },
      click_item_id: { type: "string", required: !0 },
      click_item_type_key: { type: "string", required: !0 },
      click_item_type_name: { type: "string", required: !0 },
      click_position: { type: "number", required: !0 },
      search_trace_id: { type: "string", required: !1 },
    },
    adImpression: {
      page_key: { type: "string", required: !0 },
      page_name: { type: "string", required: !0 },
      ad_slot_key: { type: "string", required: !0 },
      ad_slot_name: { type: "string", required: !0 },
      ad_id: { type: "string", required: !0 },
      creative_id: { type: "string", required: !1 },
      ad_type: { type: "string", required: !0 },
    },
    adClick: {
      page_key: { type: "string", required: !0 },
      page_name: { type: "string", required: !0 },
      ad_slot_key: { type: "string", required: !0 },
      ad_slot_name: { type: "string", required: !0 },
      ad_id: { type: "string", required: !0 },
      creative_id: { type: "string", required: !1 },
      ad_type: { type: "string", required: !0 },
    },
    pageClick: {
      page_key: { type: "string", required: !0 },
      page_name: { type: "string", required: !0 },
      click_page_x: { type: "int", required: !0 },
      click_page_y: { type: "int", required: !0 },
      click_x_percent: { type: "int", required: !0 },
      click_y_percent: { type: "int", required: !0 },
      screen_width: { type: "int", required: !0 },
      screen_height: { type: "int", required: !0 },
      recommend_trace_id: { type: "string", required: !1 },
    },
    recommendListView: {
      page_key: { type: "string", required: !0 },
      page_name: { type: "string", required: !0 },
      recommend_content_type: { type: "string", required: !0 },
      recommend_trace_id: { type: "string", required: !0 },
      recommend_id: { type: "string", required: !0 },
      recommend_trace_info: { type: "string", required: !0 },
      client_version: { type: "string", required: !0 },
    },
    recommendListClick: {
      page_key: { type: "string", required: !0 },
      page_name: { type: "string", required: !0 },
      recommend_content_type: { type: "string", required: !0 },
      recommend_trace_id: { type: "string", required: !0 },
      recommend_id: { type: "string", required: !0 },
      recommend_trace_info: { type: "string", required: !0 },
      client_version: { type: "string", required: !0 },
    },
    advertising: {
      event_type: { type: "string", required: !0 },
      advertising_key: { type: "string", required: !0 },
      advertising_name: { type: "string", required: !0 },
      advertising_id: { type: "string", required: !0 },
    },
    videoEvent: {
      media_id: { type: "string", required: !1 },
      video_id: { type: "string", required: !0 },
      video_title: { type: "string", required: !0 },
      video_type_id: { type: "string", required: !0 },
      video_type_name: { type: "string", required: !0 },
      video_content_type: { type: "string", required: !0 },
      recommend_trace_id: { type: "string", required: !1 },
      video_tag_key: { type: "string", required: !1 },
      video_tag_name: { type: "string", required: !1 },
      video_duration: { type: "int", required: !1 },
      play_duration: { type: "int", required: !1 },
      play_progress: { type: "int", required: !0 },
      video_behavior_key: { type: "string", required: !0 },
      video_behavior_name: { type: "string", required: !0 },
    },
  };
  class ie {
    static trimToString(e) {
      return String(null == e ? "" : e).trim();
    }
    static toInt(e) {
      return "number" == typeof e && Number.isInteger(e)
        ? e
        : "string" == typeof e && /^[+-]?\d+$/.test(e.trim())
          ? Number.parseInt(e.trim(), 10)
          : Number.NaN;
    }
    static isTimeField(e) {
      return /(^|_)(time|ts|timestamp)$/.test(e);
    }
    static isPercentField(e) {
      return /(^|_)(progress|percent)$/.test(e);
    }
    static isPositionOrPageField(e) {
      return "page_no" === e || "click_position" === e || /_position$/.test(e);
    }
    static isValidByType(e, t) {
      switch (String(t || "").toLowerCase()) {
        case "string":
          return "string" == typeof e;
        case "int":
          return "number" == typeof e && Number.isInteger(e);
        case "number":
          return "number" == typeof e && Number.isFinite(e);
        default:
          return !0;
      }
    }
    static validateMethodPayload(e, t) {
      const i = te[e];
      if (!i) return t;
      const r = {},
        n = [],
        o = [];
      return (
        Object.keys(i).forEach((e) => {
          const s = i[e],
            a = t[e];
          if (!s.required || (null != a && "" !== a)) {
            if (null != a) {
              if (!this.isValidByType(a, s.type))
                return void o.push(`${e}(expected ${s.type})`);
              r[e] = a;
            }
          } else n.push(e);
        }),
        n.length > 0 &&
          "undefined" != typeof console &&
          "function" == typeof console.error &&
          console.error(
            `[sdk][event] ${e} 参数缺失：${n.join(", ")} 为必传字段。`,
          ),
        o.length > 0 &&
          "undefined" != typeof console &&
          "function" == typeof console.error &&
          console.error(`[sdk][event] ${e} 参数类型错误：${o.join(", ")}。`),
        r
      );
    }
  }
  var re = Object.freeze({
    __proto__: null,
    adClick: (e = {}) => ({
      event: "ad_click",
      payload: ie.validateMethodPayload("adClick", e),
    }),
    adImpression: (e = {}) => ({
      event: "ad_impression",
      payload: ie.validateMethodPayload("adImpression", e),
    }),
    advertising: (e = {}) => ({
      event: "advertising",
      payload: ie.validateMethodPayload("advertising", e),
    }),
    appPageView: (e = {}) => ({
      event: "app_page_view",
      payload: ie.validateMethodPayload("appPageView", e),
    }),
    comicEvent: (e = {}) => ({
      event: "comic_event",
      payload: ie.validateMethodPayload("comicEvent", e),
    }),
    keywordClick: (e = {}) => ({
      event: "keyword_click",
      payload: ie.validateMethodPayload("keywordClick", e),
    }),
    keywordSearch: (e = {}) => ({
      event: "keyword_search",
      payload: ie.validateMethodPayload("keywordSearch", e),
    }),
    navigation: (e = {}) => ({
      event: "navigation",
      payload: ie.validateMethodPayload("navigation", e),
    }),
    novelEvent: (e = {}) => ({
      event: "novel_event",
      payload: ie.validateMethodPayload("novelEvent", e),
    }),
    pageClick: (e = {}) => ({
      event: "page_click",
      payload: ie.validateMethodPayload("pageClick", e),
    }),
    recommendListClick: (e = {}) => ({
      event: "recommend_list_click",
      payload: ie.validateMethodPayload("recommendListClick", e),
    }),
    recommendListView: (e = {}) => ({
      event: "recommend_list_view",
      payload: ie.validateMethodPayload("recommendListView", e),
    }),
    videoEvent: (e = {}) => ({
      event: "video_event",
      payload: ie.validateMethodPayload("videoEvent", e),
    }),
  });
  let ne = null;
  const oe = (e) => {
      if (!ne) {
        if (void 0 === e)
          throw new Error(
            '请先调用 init() 初始化（参数须包含 channel，可为空字符串 ""）',
          );
        ne = new ee(e);
      }
      return ne;
    },
    se = (e, t) => oe().track(e, t),
    ae = (e, t) => se(e, t);
  ((se.track =
    "undefined" != typeof Proxy
      ? new Proxy(ae, {
          get(e, t, i) {
            const r = Reflect.get(e, t, i);
            return void 0 !== r
              ? r
              : "string" == typeof t
                ? ((n = t),
                  (e = {}, t) => (
                    "undefined" != typeof console &&
                      "function" == typeof console.error &&
                      console.error(
                        `[sdk][event] 调用失败：WebSDK.track.${n} 不存在。`,
                      ),
                    Promise.resolve({
                      sent: !1,
                      ok: !1,
                      status: 0,
                      reason: `event_method_not_found:${n}`,
                    })
                  ))
                : r;
            var n;
          },
        })
      : ae),
    (se.setContext = (e) => oe().setContext(e)),
    (se.setUid = (e) => oe().setUid(e)),
    (se.setChannel = (e) => se.setContext({ channel: e })),
    (se.notifyPageLoad = () => W.notifyPageLoad()),
    (se.getConfig = () => oe().getConfig()),
    (se.flush = () => oe().flush()),
    (se.refreshDomainConfig = () => oe().refreshDomainConfig()),
    (se.stop = () => oe().stop()),
    (se.version = Z),
    (se.getCommonFields = async (e = []) => {
      const t = oe().getConfig(),
        i = await V.buildCommonFields({
          appId: t.appId,
          channel: t.channel,
          uid: t.uid,
        });
      if (!Array.isArray(e) || 0 === e.length) return i;
      const r = {};
      return (
        e.forEach((e) => {
          const t = String(e || "").trim();
          t && (r[t] = Object.prototype.hasOwnProperty.call(i, t) ? i[t] : "");
        }),
        r
      );
    }),
    (se.getCommonField = async (e) => {
      const t = String(e || "").trim();
      return t ? (await se.getCommonFields([t]))[t] : "";
    }),
    (se.init = (e) => (
      ne && (ne.stop(), (ne = null)),
      (ne = new ee(e)),
      {
        ...ne.buildInitReturn(),
        setContext: se.setContext,
        setUid: se.setUid,
        setChannel: se.setChannel,
        notifyPageLoad: se.notifyPageLoad,
        getCommonFields: se.getCommonFields,
        getCommonField: se.getCommonField,
      }
    )),
    class {
      static registerEventMethods(e) {
        const t = re;
        Object.keys(t).forEach((i) => {
          const r = t[i];
          "function" == typeof r &&
            (e.track || (e.track = () => {}),
            (e.track[i] = (t = {}, i) => e.track(r(t), i)),
            (e[i] = r));
        });
      }
    }.registerEventMethods(se));
  const ce = se.track,
    de = se.notifyPageLoad;
  ("undefined" != typeof globalThis && (globalThis.WebSDK = se),
    (e.WebSDK = ee),
    (e.default = se),
    (e.flush = () => se.flush()),
    (e.getCommonField = (e) => se.getCommonField(e)),
    (e.getCommonFields = (e) => se.getCommonFields(e)),
    (e.getConfig = () => se.getConfig()),
    (e.getTracker = oe),
    (e.init = (e) => se.init(e)),
    (e.notifyPageLoad = de),
    (e.refreshDomainConfig = () => se.refreshDomainConfig()),
    (e.setChannel = (e) => se.setChannel(e)),
    (e.setContext = (e) => se.setContext(e)),
    (e.setUid = (e) => se.setUid(e)),
    (e.stop = () => se.stop()),
    (e.track = ce),
    Object.defineProperty(e, "__esModule", { value: !0 }));
});
