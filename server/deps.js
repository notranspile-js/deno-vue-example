const SECONDS_A_HOUR = 60 * 60;
const SECONDS_A_DAY = SECONDS_A_HOUR * 24;
const SECONDS_A_WEEK = SECONDS_A_DAY * 7;
const MILLISECONDS_A_SECOND = 1000;
const MILLISECONDS_A_MINUTE = 60 * 1000;
const MILLISECONDS_A_HOUR = SECONDS_A_HOUR * 1000;
const MILLISECONDS_A_DAY = SECONDS_A_DAY * 1000;
const MILLISECONDS_A_WEEK = SECONDS_A_WEEK * 1000;
const MS = 'millisecond';
const S = 'second';
const MIN = 'minute';
const H = 'hour';
const D = 'day';
const W = 'week';
const M = 'month';
const Q = 'quarter';
const Y = 'year';
const DATE = 'date';
const FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ssZ';
const INVALID_DATE_STRING = 'Invalid Date';
const REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
const __default = {
    name: 'en',
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_')
};
const padStart = (string, length, pad)=>{
    const s = String(string);
    if (!s || s.length >= length) return string;
    return `${Array(length + 1 - s.length).join(pad)}${string}`;
};
const padZoneStr = (instance)=>{
    const negMinutes = -instance.utcOffset();
    const minutes = Math.abs(negMinutes);
    const hourOffset = Math.floor(minutes / 60);
    const minuteOffset = minutes % 60;
    return `${negMinutes <= 0 ? '+' : '-'}${padStart(hourOffset, 2, '0')}:${padStart(minuteOffset, 2, '0')}`;
};
const monthDiff = (a, b)=>{
    if (a.date() < b.date()) return -monthDiff(b, a);
    const wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
    const anchor = a.clone().add(wholeMonthDiff, M);
    const c = b - anchor < 0;
    const anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), M);
    return +(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)) || 0);
};
const absFloor = (n)=>n < 0 ? Math.ceil(n) || 0 : Math.floor(n)
;
const prettyUnit = (u)=>{
    const special = {
        M: M,
        y: Y,
        w: W,
        d: D,
        D: DATE,
        h: H,
        m: MIN,
        s: S,
        ms: MS,
        Q: Q
    };
    return special[u] || String(u || '').toLowerCase().replace(/s$/, '');
};
const isUndefined = (s)=>s === undefined
;
const __default1 = {
    s: padStart,
    z: padZoneStr,
    m: monthDiff,
    a: absFloor,
    p: prettyUnit,
    u: isUndefined
};
let L = 'en';
const Ls = {
};
Ls[L] = __default;
const isDayjs = (d)=>d instanceof Dayjs
;
const parseLocale = (preset, object, isLocal)=>{
    let l;
    if (!preset) return L;
    if (typeof preset === 'string') {
        if (Ls[preset]) {
            l = preset;
        }
        if (object) {
            Ls[preset] = object;
            l = preset;
        }
    } else {
        const { name  } = preset;
        Ls[name] = preset;
        l = name;
    }
    if (!isLocal && l) L = l;
    return l || !isLocal && L;
};
const dayjs1 = function(date, c) {
    if (isDayjs(date)) {
        return date.clone();
    }
    const cfg = typeof c === 'object' ? c : {
    };
    cfg.date = date;
    cfg.args = arguments;
    return new Dayjs(cfg);
};
const wrapper = (date, instance)=>dayjs1(date, {
        locale: instance.$L,
        utc: instance.$u,
        x: instance.$x,
        $offset: instance.$offset
    })
;
const Utils = __default1;
Utils.l = parseLocale;
Utils.i = isDayjs;
Utils.w = wrapper;
const parseDate = (cfg)=>{
    const { date , utc  } = cfg;
    if (date === null) return new Date(NaN);
    if (__default1.u(date)) return new Date();
    if (date instanceof Date) return new Date(date);
    if (typeof date === 'string' && !/Z$/i.test(date)) {
        const d = date.match(REGEX_PARSE);
        if (d) {
            const m = d[2] - 1 || 0;
            const ms = (d[7] || '0').substring(0, 3);
            if (utc) {
                return new Date(Date.UTC(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms));
            }
            return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms);
        }
    }
    return new Date(date);
};
class Dayjs {
    constructor(cfg){
        this.$L = parseLocale(cfg.locale, null, true);
        this.parse(cfg);
    }
    parse(cfg) {
        this.$d = parseDate(cfg);
        this.$x = cfg.x || {
        };
        this.init();
    }
    init() {
        const { $d  } = this;
        this.$y = $d.getFullYear();
        this.$M = $d.getMonth();
        this.$D = $d.getDate();
        this.$W = $d.getDay();
        this.$H = $d.getHours();
        this.$m = $d.getMinutes();
        this.$s = $d.getSeconds();
        this.$ms = $d.getMilliseconds();
    }
    $utils() {
        return __default1;
    }
    isValid() {
        return !(this.$d.toString() === INVALID_DATE_STRING);
    }
    isSame(that, units) {
        const other = dayjs1(that);
        return this.startOf(units) <= other && other <= this.endOf(units);
    }
    isAfter(that, units) {
        return dayjs1(that) < this.startOf(units);
    }
    isBefore(that, units) {
        return this.endOf(units) < dayjs1(that);
    }
    $g(input, get, set) {
        if (__default1.u(input)) return this[get];
        return this.set(set, input);
    }
    unix() {
        return Math.floor(this.valueOf() / 1000);
    }
    valueOf() {
        return this.$d.getTime();
    }
    startOf(units, startOf) {
        const isStartOf = !__default1.u(startOf) ? startOf : true;
        const unit = __default1.p(units);
        const instanceFactory = (d, m)=>{
            const ins = __default1.w(this.$u ? Date.UTC(this.$y, m, d) : new Date(this.$y, m, d), this);
            return isStartOf ? ins : ins.endOf(D);
        };
        const instanceFactorySet = (method, slice)=>{
            const argumentStart = [
                0,
                0,
                0,
                0
            ];
            const argumentEnd = [
                23,
                59,
                59,
                999
            ];
            return __default1.w(this.toDate()[method].apply(this.toDate('s'), (isStartOf ? argumentStart : argumentEnd).slice(slice)), this);
        };
        const { $W , $M , $D  } = this;
        const utcPad = `set${this.$u ? 'UTC' : ''}`;
        switch(unit){
            case Y:
                return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);
            case M:
                return isStartOf ? instanceFactory(1, $M) : instanceFactory(0, $M + 1);
            case W:
                {
                    const weekStart = this.$locale().weekStart || 0;
                    const gap = ($W < weekStart ? $W + 7 : $W) - weekStart;
                    return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M);
                }
            case D:
            case DATE:
                return instanceFactorySet(`${utcPad}Hours`, 0);
            case H:
                return instanceFactorySet(`${utcPad}Minutes`, 1);
            case MIN:
                return instanceFactorySet(`${utcPad}Seconds`, 2);
            case S:
                return instanceFactorySet(`${utcPad}Milliseconds`, 3);
            default:
                return this.clone();
        }
    }
    endOf(arg) {
        return this.startOf(arg, false);
    }
    $set(units, __int) {
        const unit = __default1.p(units);
        const utcPad = `set${this.$u ? 'UTC' : ''}`;
        const name = {
            [D]: `${utcPad}Date`,
            [DATE]: `${utcPad}Date`,
            [M]: `${utcPad}Month`,
            [Y]: `${utcPad}FullYear`,
            [H]: `${utcPad}Hours`,
            [MIN]: `${utcPad}Minutes`,
            [S]: `${utcPad}Seconds`,
            [MS]: `${utcPad}Milliseconds`
        }[unit];
        const arg = unit === D ? this.$D + (__int - this.$W) : __int;
        if (unit === M || unit === Y) {
            const date = this.clone().set(DATE, 1);
            date.$d[name](arg);
            date.init();
            this.$d = date.set(DATE, Math.min(this.$D, date.daysInMonth())).$d;
        } else if (name) this.$d[name](arg);
        this.init();
        return this;
    }
    set(string, __int) {
        return this.clone().$set(string, __int);
    }
    get(unit) {
        return this[__default1.p(unit)]();
    }
    add(number, units) {
        number = Number(number);
        const unit = __default1.p(units);
        const instanceFactorySet = (n)=>{
            const d = dayjs1(this);
            return __default1.w(d.date(d.date() + Math.round(n * number)), this);
        };
        if (unit === M) {
            return this.set(M, this.$M + number);
        }
        if (unit === Y) {
            return this.set(Y, this.$y + number);
        }
        if (unit === D) {
            return instanceFactorySet(1);
        }
        if (unit === W) {
            return instanceFactorySet(7);
        }
        const step = {
            [MIN]: MILLISECONDS_A_MINUTE,
            [H]: MILLISECONDS_A_HOUR,
            [S]: 1000
        }[unit] || 1;
        const nextTimeStamp = this.$d.getTime() + number * step;
        return __default1.w(nextTimeStamp, this);
    }
    subtract(number, string) {
        return this.add(number * -1, string);
    }
    format(formatStr) {
        const locale = this.$locale();
        if (!this.isValid()) return locale.invalidDate || INVALID_DATE_STRING;
        const str = formatStr || FORMAT_DEFAULT;
        const zoneStr = __default1.z(this);
        const { $H , $m , $M  } = this;
        const { weekdays , months , meridiem  } = locale;
        const getShort = (arr, index, full, length)=>arr && (arr[index] || arr(this, str)) || full[index].substr(0, length)
        ;
        const get$H = (num)=>__default1.s($H % 12 || 12, num, '0')
        ;
        const meridiemFunc = meridiem || ((hour, minute, isLowercase)=>{
            const m = hour < 12 ? 'AM' : 'PM';
            return isLowercase ? m.toLowerCase() : m;
        });
        const matches = {
            YY: String(this.$y).slice(-2),
            YYYY: this.$y,
            M: $M + 1,
            MM: __default1.s($M + 1, 2, '0'),
            MMM: getShort(locale.monthsShort, $M, months, 3),
            MMMM: getShort(months, $M),
            D: this.$D,
            DD: __default1.s(this.$D, 2, '0'),
            d: String(this.$W),
            dd: getShort(locale.weekdaysMin, this.$W, weekdays, 2),
            ddd: getShort(locale.weekdaysShort, this.$W, weekdays, 3),
            dddd: weekdays[this.$W],
            H: String($H),
            HH: __default1.s($H, 2, '0'),
            h: get$H(1),
            hh: get$H(2),
            a: meridiemFunc($H, $m, true),
            A: meridiemFunc($H, $m, false),
            m: String($m),
            mm: __default1.s($m, 2, '0'),
            s: String(this.$s),
            ss: __default1.s(this.$s, 2, '0'),
            SSS: __default1.s(this.$ms, 3, '0'),
            Z: zoneStr
        };
        return str.replace(REGEX_FORMAT, (match, $1)=>$1 || matches[match] || zoneStr.replace(':', '')
        );
    }
    utcOffset() {
        return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
    }
    diff(input, units, __float) {
        const unit = __default1.p(units);
        const that = dayjs1(input);
        const zoneDelta = (that.utcOffset() - this.utcOffset()) * MILLISECONDS_A_MINUTE;
        const diff = this - that;
        let result = __default1.m(this, that);
        result = ({
            [Y]: result / 12,
            [M]: result,
            [Q]: result / 3,
            [W]: (diff - zoneDelta) / MILLISECONDS_A_WEEK,
            [D]: (diff - zoneDelta) / MILLISECONDS_A_DAY,
            [H]: diff / MILLISECONDS_A_HOUR,
            [MIN]: diff / MILLISECONDS_A_MINUTE,
            [S]: diff / MILLISECONDS_A_SECOND
        })[unit] || diff;
        return __float ? result : __default1.a(result);
    }
    daysInMonth() {
        return this.endOf(M).$D;
    }
    $locale() {
        return Ls[this.$L];
    }
    locale(preset, object) {
        if (!preset) return this.$L;
        const that = this.clone();
        const nextLocaleName = parseLocale(preset, object, true);
        if (nextLocaleName) that.$L = nextLocaleName;
        return that;
    }
    clone() {
        return __default1.w(this.$d, this);
    }
    toDate() {
        return new Date(this.valueOf());
    }
    toJSON() {
        return this.isValid() ? this.toISOString() : null;
    }
    toISOString() {
        return this.$d.toISOString();
    }
    toString() {
        return this.$d.toUTCString();
    }
}
const proto = Dayjs.prototype;
dayjs1.prototype = proto;
[
    [
        '$ms',
        MS
    ],
    [
        '$s',
        S
    ],
    [
        '$m',
        MIN
    ],
    [
        '$H',
        H
    ],
    [
        '$W',
        D
    ],
    [
        '$M',
        M
    ],
    [
        '$y',
        Y
    ],
    [
        '$D',
        DATE
    ]
].forEach((g)=>{
    proto[g[1]] = function(input) {
        return this.$g(input, g[0], g[1]);
    };
});
dayjs1.extend = (plugin, option)=>{
    if (!plugin.$i) {
        plugin(option, Dayjs, dayjs1);
        plugin.$i = true;
    }
    return dayjs1;
};
dayjs1.locale = parseLocale;
dayjs1.isDayjs = isDayjs;
dayjs1.unix = (timestamp)=>dayjs1(timestamp * 1000)
;
dayjs1.en = Ls[L];
dayjs1.Ls = Ls;
dayjs1.p = {
};
const noColor = globalThis.Deno?.noColor ?? true;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function red(str) {
    return run(str, code([
        31
    ], 39));
}
function green(str) {
    return run(str, code([
        32
    ], 39));
}
function white(str) {
    return run(str, code([
        37
    ], 39));
}
function gray(str) {
    return brightBlack(str);
}
function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType;
(function(DiffType) {
    DiffType["removed"] = "removed";
    DiffType["common"] = "common";
    DiffType["added"] = "added";
})(DiffType || (DiffType = {
}));
const REMOVED = 1;
const COMMON = 2;
const ADDED = 3;
function createCommon(A, B, reverse) {
    const common = [];
    if (A.length === 0 || B.length === 0) return [];
    for(let i = 0; i < Math.min(A.length, B.length); i += 1){
        if (A[reverse ? A.length - i - 1 : i] === B[reverse ? B.length - i - 1 : i]) {
            common.push(A[reverse ? A.length - i - 1 : i]);
        } else {
            return common;
        }
    }
    return common;
}
function diff(A, B) {
    const prefixCommon = createCommon(A, B);
    const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
    A = suffixCommon.length ? A.slice(prefixCommon.length, -suffixCommon.length) : A.slice(prefixCommon.length);
    B = suffixCommon.length ? B.slice(prefixCommon.length, -suffixCommon.length) : B.slice(prefixCommon.length);
    const swapped = B.length > A.length;
    [A, B] = swapped ? [
        B,
        A
    ] : [
        A,
        B
    ];
    const M = A.length;
    const N = B.length;
    if (!M && !N && !suffixCommon.length && !prefixCommon.length) return [];
    if (!N) {
        return [
            ...prefixCommon.map((c)=>({
                    type: DiffType.common,
                    value: c
                })
            ),
            ...A.map((a)=>({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a
                })
            ),
            ...suffixCommon.map((c)=>({
                    type: DiffType.common,
                    value: c
                })
            ), 
        ];
    }
    const offset = N;
    const delta = M - N;
    const size = M + N + 1;
    const fp = new Array(size).fill({
        y: -1
    });
    const routes = new Uint32Array((M * N + size + 1) * 2);
    const diffTypesPtrOffset = routes.length / 2;
    let ptr = 0;
    let p = -1;
    function backTrace(A, B, current, swapped) {
        const M = A.length;
        const N = B.length;
        const result = [];
        let a = M - 1;
        let b = N - 1;
        let j = routes[current.id];
        let type = routes[current.id + diffTypesPtrOffset];
        while(true){
            if (!j && !type) break;
            const prev = j;
            if (type === 1) {
                result.unshift({
                    type: swapped ? DiffType.removed : DiffType.added,
                    value: B[b]
                });
                b -= 1;
            } else if (type === 3) {
                result.unshift({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: A[a]
                });
                a -= 1;
            } else {
                result.unshift({
                    type: DiffType.common,
                    value: A[a]
                });
                a -= 1;
                b -= 1;
            }
            j = routes[prev];
            type = routes[prev + diffTypesPtrOffset];
        }
        return result;
    }
    function createFP(slide, down, k, M) {
        if (slide && slide.y === -1 && down && down.y === -1) {
            return {
                y: 0,
                id: 0
            };
        }
        if (down && down.y === -1 || k === M || (slide && slide.y) > (down && down.y) + 1) {
            const prev = slide.id;
            ptr++;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = ADDED;
            return {
                y: slide.y,
                id: ptr
            };
        } else {
            const prev = down.id;
            ptr++;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = REMOVED;
            return {
                y: down.y + 1,
                id: ptr
            };
        }
    }
    function snake(k, slide, down, _offset, A, B) {
        const M = A.length;
        const N = B.length;
        if (k < -N || M < k) return {
            y: -1,
            id: -1
        };
        const fp = createFP(slide, down, k, M);
        while(fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]){
            const prev = fp.id;
            ptr++;
            fp.id = ptr;
            fp.y += 1;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = COMMON;
        }
        return fp;
    }
    while(fp[delta + offset].y < N){
        p = p + 1;
        for(let k = -p; k < delta; ++k){
            fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
        }
        for(let k1 = delta + p; k1 > delta; --k1){
            fp[k1 + offset] = snake(k1, fp[k1 - 1 + offset], fp[k1 + 1 + offset], offset, A, B);
        }
        fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
    }
    return [
        ...prefixCommon.map((c)=>({
                type: DiffType.common,
                value: c
            })
        ),
        ...backTrace(A, B, fp[delta + offset], swapped),
        ...suffixCommon.map((c)=>({
                type: DiffType.common,
                value: c
            })
        ), 
    ];
}
const CAN_NOT_DISPLAY = "[Cannot display]";
class AssertionError extends Error {
    constructor(message){
        super(message);
        this.name = "AssertionError";
    }
}
function _format(v) {
    return globalThis.Deno ? Deno.inspect(v, {
        depth: Infinity,
        sorted: true,
        trailingComma: true,
        compact: false,
        iterableLimit: Infinity
    }) : `"${String(v).replace(/(?=["\\])/g, "\\")}"`;
}
function createColor(diffType) {
    switch(diffType){
        case DiffType.added:
            return (s)=>green(bold(s))
            ;
        case DiffType.removed:
            return (s)=>red(bold(s))
            ;
        default:
            return white;
    }
}
function createSign(diffType) {
    switch(diffType){
        case DiffType.added:
            return "+   ";
        case DiffType.removed:
            return "-   ";
        default:
            return "    ";
    }
}
function buildMessage(diffResult) {
    const messages = [];
    messages.push("");
    messages.push("");
    messages.push(`    ${gray(bold("[Diff]"))} ${red(bold("Actual"))} / ${green(bold("Expected"))}`);
    messages.push("");
    messages.push("");
    diffResult.forEach((result)=>{
        const c = createColor(result.type);
        messages.push(c(`${createSign(result.type)}${result.value}`));
    });
    messages.push("");
    return messages;
}
function isKeyedCollection(x) {
    return [
        Symbol.iterator,
        "size"
    ].every((k)=>k in x
    );
}
function equal(c, d) {
    const seen = new Map();
    return (function compare(a, b) {
        if (a && b && (a instanceof RegExp && b instanceof RegExp || a instanceof URL && b instanceof URL)) {
            return String(a) === String(b);
        }
        if (a instanceof Date && b instanceof Date) {
            const aTime = a.getTime();
            const bTime = b.getTime();
            if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
                return true;
            }
            return a.getTime() === b.getTime();
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (a instanceof WeakMap || b instanceof WeakMap) {
                if (!(a instanceof WeakMap && b instanceof WeakMap)) return false;
                throw new TypeError("cannot compare WeakMap instances");
            }
            if (a instanceof WeakSet || b instanceof WeakSet) {
                if (!(a instanceof WeakSet && b instanceof WeakSet)) return false;
                throw new TypeError("cannot compare WeakSet instances");
            }
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {
            }).length !== Object.keys(b || {
            }).length) {
                return false;
            }
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()){
                    for (const [bKey, bValue] of b.entries()){
                        if (aKey === aValue && bKey === bValue && compare(aKey, bKey) || compare(aKey, bKey) && compare(aValue, bValue)) {
                            unmatchedEntries--;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = {
                ...a,
                ...b
            };
            for (const key of [
                ...Object.getOwnPropertyNames(merged),
                ...Object.getOwnPropertySymbols(merged), 
            ]){
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
                if (key in a && !(key in b) || key in b && !(key in a)) {
                    return false;
                }
            }
            seen.set(a, b);
            if (a instanceof WeakRef || b instanceof WeakRef) {
                if (!(a instanceof WeakRef && b instanceof WeakRef)) return false;
                return compare(a.deref(), b.deref());
            }
            return true;
        }
        return false;
    })(c, d);
}
function assertNotEquals(actual, expected, msg) {
    if (!equal(actual, expected)) {
        return;
    }
    let actualString;
    let expectedString;
    try {
        actualString = String(actual);
    } catch  {
        actualString = "[Cannot display]";
    }
    try {
        expectedString = String(expected);
    } catch  {
        expectedString = "[Cannot display]";
    }
    if (!msg) {
        msg = `actual: ${actualString} expected: ${expectedString}`;
    }
    throw new AssertionError(msg);
}
function assertStrictEquals(actual, expected, msg) {
    if (actual === expected) {
        return;
    }
    let message;
    if (msg) {
        message = msg;
    } else {
        const actualString = _format(actual);
        const expectedString = _format(expected);
        if (actualString === expectedString) {
            const withOffset = actualString.split("\n").map((l)=>`    ${l}`
            ).join("\n");
            message = `Values have the same structure but are not reference-equal:\n\n${red(withOffset)}\n`;
        } else {
            try {
                const diffResult = diff(actualString.split("\n"), expectedString.split("\n"));
                const diffMsg = buildMessage(diffResult).join("\n");
                message = `Values are not strictly equal:\n${diffMsg}`;
            } catch  {
                message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
            }
        }
    }
    throw new AssertionError(message);
}
const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format1(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
class DenoStdInternalError extends Error {
    constructor(message1){
        super(message1);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const sep6 = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        if (i >= 0) {
            path = pathSegments[i];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code = path.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path) {
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = resolve(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
function dirname(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path.slice(0, end);
}
function basename(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= start; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname(path) {
    assertPath(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path.length - 1; i >= start; --i){
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format3(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("\\", pathObject);
}
function parse(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
function toFileUrl(path) {
    if (!isAbsolute(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = function() {
    return {
        sep: sep6,
        delimiter: delimiter,
        resolve: resolve,
        normalize: normalize,
        isAbsolute: isAbsolute,
        join: join,
        relative: relative,
        toNamespacedPath: toNamespacedPath,
        dirname: dirname,
        basename: basename,
        extname: extname,
        format: format3,
        parse: parse,
        fromFileUrl: fromFileUrl,
        toFileUrl: toFileUrl
    };
}();
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path) {
    return path;
}
function dirname1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path.length - 1; i >= 1; --i){
        if (path.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path.slice(0, end);
}
function basename1(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= 0; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname1(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("/", pathObject);
}
function parse1(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path.length === 0) return ret;
    const isAbsolute = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path) {
    if (!isAbsolute1(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod1 = function() {
    return {
        sep: sep1,
        delimiter: delimiter1,
        resolve: resolve1,
        normalize: normalize1,
        isAbsolute: isAbsolute1,
        join: join1,
        relative: relative1,
        toNamespacedPath: toNamespacedPath1,
        dirname: dirname1,
        basename: basename1,
        extname: extname1,
        format: format1,
        parse: parse1,
        fromFileUrl: fromFileUrl1,
        toFileUrl: toFileUrl1
    };
}();
const path4 = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join2 , normalize: normalize2 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path4;
const align = {
    right: alignRight,
    center: alignCenter
};
const right = 1;
const left = 3;
class UI {
    constructor(opts){
        var _a;
        this.width = opts.width;
        this.wrap = (_a = opts.wrap) !== null && _a !== void 0 ? _a : true;
        this.rows = [];
    }
    span(...args) {
        const cols = this.div(...args);
        cols.span = true;
    }
    resetOutput() {
        this.rows = [];
    }
    div(...args) {
        if (args.length === 0) {
            this.div('');
        }
        if (this.wrap && this.shouldApplyLayoutDSL(...args) && typeof args[0] === 'string') {
            return this.applyLayoutDSL(args[0]);
        }
        const cols = args.map((arg)=>{
            if (typeof arg === 'string') {
                return this.colFromString(arg);
            }
            return arg;
        });
        this.rows.push(cols);
        return cols;
    }
    shouldApplyLayoutDSL(...args) {
        return args.length === 1 && typeof args[0] === 'string' && /[\t\n]/.test(args[0]);
    }
    applyLayoutDSL(str) {
        const rows = str.split('\n').map((row)=>row.split('\t')
        );
        let leftColumnWidth = 0;
        rows.forEach((columns)=>{
            if (columns.length > 1 && mixin.stringWidth(columns[0]) > leftColumnWidth) {
                leftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
            }
        });
        rows.forEach((columns)=>{
            this.div(...columns.map((r, i)=>{
                return {
                    text: r.trim(),
                    padding: this.measurePadding(r),
                    width: i === 0 && columns.length > 1 ? leftColumnWidth : undefined
                };
            }));
        });
        return this.rows[this.rows.length - 1];
    }
    colFromString(text) {
        return {
            text,
            padding: this.measurePadding(text)
        };
    }
    measurePadding(str) {
        const noAnsi = mixin.stripAnsi(str);
        return [
            0,
            noAnsi.match(/\s*$/)[0].length,
            0,
            noAnsi.match(/^\s*/)[0].length
        ];
    }
    toString() {
        const lines = [];
        this.rows.forEach((row)=>{
            this.rowToString(row, lines);
        });
        return lines.filter((line)=>!line.hidden
        ).map((line)=>line.text
        ).join('\n');
    }
    rowToString(row, lines) {
        this.rasterize(row).forEach((rrow, r)=>{
            let str = '';
            rrow.forEach((col, c)=>{
                const { width  } = row[c];
                const wrapWidth = this.negatePadding(row[c]);
                let ts = col;
                if (wrapWidth > mixin.stringWidth(col)) {
                    ts += ' '.repeat(wrapWidth - mixin.stringWidth(col));
                }
                if (row[c].align && row[c].align !== 'left' && this.wrap) {
                    const fn = align[row[c].align];
                    ts = fn(ts, wrapWidth);
                    if (mixin.stringWidth(ts) < wrapWidth) {
                        ts += ' '.repeat((width || 0) - mixin.stringWidth(ts) - 1);
                    }
                }
                const padding = row[c].padding || [
                    0,
                    0,
                    0,
                    0
                ];
                if (padding[3]) {
                    str += ' '.repeat(padding[left]);
                }
                str += addBorder(row[c], ts, '| ');
                str += ts;
                str += addBorder(row[c], ts, ' |');
                if (padding[1]) {
                    str += ' '.repeat(padding[right]);
                }
                if (r === 0 && lines.length > 0) {
                    str = this.renderInline(str, lines[lines.length - 1]);
                }
            });
            lines.push({
                text: str.replace(/ +$/, ''),
                span: row.span
            });
        });
        return lines;
    }
    renderInline(source, previousLine) {
        const match = source.match(/^ */);
        const leadingWhitespace = match ? match[0].length : 0;
        const target = previousLine.text;
        const targetTextWidth = mixin.stringWidth(target.trimRight());
        if (!previousLine.span) {
            return source;
        }
        if (!this.wrap) {
            previousLine.hidden = true;
            return target + source;
        }
        if (leadingWhitespace < targetTextWidth) {
            return source;
        }
        previousLine.hidden = true;
        return target.trimRight() + ' '.repeat(leadingWhitespace - targetTextWidth) + source.trimLeft();
    }
    rasterize(row) {
        const rrows = [];
        const widths = this.columnWidths(row);
        let wrapped;
        row.forEach((col, c)=>{
            col.width = widths[c];
            if (this.wrap) {
                wrapped = mixin.wrap(col.text, this.negatePadding(col), {
                    hard: true
                }).split('\n');
            } else {
                wrapped = col.text.split('\n');
            }
            if (col.border) {
                wrapped.unshift('.' + '-'.repeat(this.negatePadding(col) + 2) + '.');
                wrapped.push("'" + '-'.repeat(this.negatePadding(col) + 2) + "'");
            }
            if (col.padding) {
                wrapped.unshift(...new Array(col.padding[0] || 0).fill(''));
                wrapped.push(...new Array(col.padding[2] || 0).fill(''));
            }
            wrapped.forEach((str, r)=>{
                if (!rrows[r]) {
                    rrows.push([]);
                }
                const rrow = rrows[r];
                for(let i = 0; i < c; i++){
                    if (rrow[i] === undefined) {
                        rrow.push('');
                    }
                }
                rrow.push(str);
            });
        });
        return rrows;
    }
    negatePadding(col) {
        let wrapWidth = col.width || 0;
        if (col.padding) {
            wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0);
        }
        if (col.border) {
            wrapWidth -= 4;
        }
        return wrapWidth;
    }
    columnWidths(row) {
        if (!this.wrap) {
            return row.map((col)=>{
                return col.width || mixin.stringWidth(col.text);
            });
        }
        let unset = row.length;
        let remainingWidth = this.width;
        const widths = row.map((col)=>{
            if (col.width) {
                unset--;
                remainingWidth -= col.width;
                return col.width;
            }
            return undefined;
        });
        const unsetWidth = unset ? Math.floor(remainingWidth / unset) : 0;
        return widths.map((w, i)=>{
            if (w === undefined) {
                return Math.max(unsetWidth, _minWidth(row[i]));
            }
            return w;
        });
    }
}
function addBorder(col, ts, style) {
    if (col.border) {
        if (/[.']-+[.']/.test(ts)) {
            return '';
        }
        if (ts.trim().length !== 0) {
            return style;
        }
        return '  ';
    }
    return '';
}
function _minWidth(col) {
    const padding = col.padding || [];
    const minWidth = 1 + (padding[3] || 0) + (padding[1] || 0);
    if (col.border) {
        return minWidth + 4;
    }
    return minWidth;
}
function getWindowWidth() {
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
        return process.stdout.columns;
    }
    return 80;
}
function alignRight(str, width) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    if (strWidth < width) {
        return ' '.repeat(width - strWidth) + str;
    }
    return str;
}
function alignCenter(str, width) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    if (strWidth >= width) {
        return str;
    }
    return ' '.repeat(width - strWidth >> 1) + str;
}
let mixin;
function cliui(opts, _mixin) {
    mixin = _mixin;
    return new UI({
        width: (opts === null || opts === void 0 ? void 0 : opts.width) || getWindowWidth(),
        wrap: opts === null || opts === void 0 ? void 0 : opts.wrap
    });
}
const ansi = new RegExp('\x1b(?:\\[(?:\\d+[ABCDEFGJKSTm]|\\d+;\\d+[Hfm]|' + '\\d+;\\d+;\\d+m|6n|s|u|\\?25[lh])|\\w)', 'g');
function stripAnsi(str) {
    return str.replace(ansi, '');
}
function wrap(str, width) {
    const [start, end] = str.match(ansi) || [
        '',
        ''
    ];
    str = stripAnsi(str);
    let wrapped = '';
    for(let i = 0; i < str.length; i++){
        if (i !== 0 && i % width === 0) {
            wrapped += '\n';
        }
        wrapped += str.charAt(i);
    }
    if (start && end) {
        wrapped = `${start}${wrapped}${end}`;
    }
    return wrapped;
}
function ui(opts) {
    return cliui(opts, {
        stringWidth: (str)=>{
            return [
                ...str
            ].length;
        },
        stripAnsi,
        wrap
    });
}
function toItems(dir) {
    let list = [];
    for (let tmp of Deno.readDirSync(dir)){
        list.push(tmp.name);
    }
    return list;
}
function __default2(start, callback) {
    let dir = resolve2('.', start);
    let stats = Deno.statSync(dir);
    if (!stats.isDirectory) {
        dir = dirname2(dir);
    }
    while(true){
        let tmp = callback(dir, toItems(dir));
        if (tmp) return resolve2(dir, tmp);
        dir = dirname2(tmp = dir);
        if (tmp === dir) break;
    }
}
function camelCase(str) {
    str = str.toLocaleLowerCase();
    if (str.indexOf('-') === -1 && str.indexOf('_') === -1) {
        return str;
    } else {
        let camelcase = '';
        let nextChrUpper = false;
        const leadingHyphens = str.match(/^-+/);
        for(let i = leadingHyphens ? leadingHyphens[0].length : 0; i < str.length; i++){
            let chr = str.charAt(i);
            if (nextChrUpper) {
                nextChrUpper = false;
                chr = chr.toLocaleUpperCase();
            }
            if (i !== 0 && (chr === '-' || chr === '_')) {
                nextChrUpper = true;
                continue;
            } else if (chr !== '-' && chr !== '_') {
                camelcase += chr;
            }
        }
        return camelcase;
    }
}
function decamelize(str, joinString) {
    const lowercase = str.toLocaleLowerCase();
    joinString = joinString || '-';
    let notCamelcase = '';
    for(let i = 0; i < str.length; i++){
        const chrLower = lowercase.charAt(i);
        const chrString = str.charAt(i);
        if (chrLower !== chrString && i > 0) {
            notCamelcase += `${joinString}${lowercase.charAt(i)}`;
        } else {
            notCamelcase += chrString;
        }
    }
    return notCamelcase;
}
function looksLikeNumber(x) {
    if (x === null || x === undefined) return false;
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    if (x.length > 1 && x[0] === '0') return false;
    return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}
function tokenizeArgString(argString) {
    if (Array.isArray(argString)) {
        return argString.map((e)=>typeof e !== 'string' ? e + '' : e
        );
    }
    argString = argString.trim();
    let i = 0;
    let prevC = null;
    let c = null;
    let opening = null;
    const args = [];
    for(let ii = 0; ii < argString.length; ii++){
        prevC = c;
        c = argString.charAt(ii);
        if (c === ' ' && !opening) {
            if (!(prevC === ' ')) {
                i++;
            }
            continue;
        }
        if (c === opening) {
            opening = null;
        } else if ((c === "'" || c === '"') && !opening) {
            opening = c;
        }
        if (!args[i]) args[i] = '';
        args[i] += c;
    }
    return args;
}
let mixin1;
class YargsParser {
    constructor(_mixin){
        mixin1 = _mixin;
    }
    parse(argsInput, options) {
        const opts = Object.assign({
            alias: undefined,
            array: undefined,
            boolean: undefined,
            config: undefined,
            configObjects: undefined,
            configuration: undefined,
            coerce: undefined,
            count: undefined,
            default: undefined,
            envPrefix: undefined,
            narg: undefined,
            normalize: undefined,
            string: undefined,
            number: undefined,
            __: undefined,
            key: undefined
        }, options);
        const args = tokenizeArgString(argsInput);
        const aliases = combineAliases(Object.assign(Object.create(null), opts.alias));
        const configuration = Object.assign({
            'boolean-negation': true,
            'camel-case-expansion': true,
            'combine-arrays': false,
            'dot-notation': true,
            'duplicate-arguments-array': true,
            'flatten-duplicate-arrays': true,
            'greedy-arrays': true,
            'halt-at-non-option': false,
            'nargs-eats-options': false,
            'negation-prefix': 'no-',
            'parse-numbers': true,
            'parse-positional-numbers': true,
            'populate--': false,
            'set-placeholder-key': false,
            'short-option-groups': true,
            'strip-aliased': false,
            'strip-dashed': false,
            'unknown-options-as-args': false
        }, opts.configuration);
        const defaults = Object.assign(Object.create(null), opts.default);
        const configObjects = opts.configObjects || [];
        const envPrefix = opts.envPrefix;
        const notFlagsOption = configuration['populate--'];
        const notFlagsArgv = notFlagsOption ? '--' : '_';
        const newAliases = Object.create(null);
        const defaulted = Object.create(null);
        const __ = opts.__ || mixin1.format;
        const flags = {
            aliases: Object.create(null),
            arrays: Object.create(null),
            bools: Object.create(null),
            strings: Object.create(null),
            numbers: Object.create(null),
            counts: Object.create(null),
            normalize: Object.create(null),
            configs: Object.create(null),
            nargs: Object.create(null),
            coercions: Object.create(null),
            keys: []
        };
        const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
        const negatedBoolean = new RegExp('^--' + configuration['negation-prefix'] + '(.+)');
        [].concat(opts.array || []).filter(Boolean).forEach(function(opt) {
            const key = typeof opt === 'object' ? opt.key : opt;
            const assignment = Object.keys(opt).map(function(key) {
                const arrayFlagKeys = {
                    boolean: 'bools',
                    string: 'strings',
                    number: 'numbers'
                };
                return arrayFlagKeys[key];
            }).filter(Boolean).pop();
            if (assignment) {
                flags[assignment][key] = true;
            }
            flags.arrays[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts.boolean || []).filter(Boolean).forEach(function(key) {
            flags.bools[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts.string || []).filter(Boolean).forEach(function(key) {
            flags.strings[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts.number || []).filter(Boolean).forEach(function(key) {
            flags.numbers[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts.count || []).filter(Boolean).forEach(function(key) {
            flags.counts[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts.normalize || []).filter(Boolean).forEach(function(key) {
            flags.normalize[key] = true;
            flags.keys.push(key);
        });
        if (typeof opts.narg === 'object') {
            Object.entries(opts.narg).forEach(([key, value])=>{
                if (typeof value === 'number') {
                    flags.nargs[key] = value;
                    flags.keys.push(key);
                }
            });
        }
        if (typeof opts.coerce === 'object') {
            Object.entries(opts.coerce).forEach(([key, value])=>{
                if (typeof value === 'function') {
                    flags.coercions[key] = value;
                    flags.keys.push(key);
                }
            });
        }
        if (typeof opts.config !== 'undefined') {
            if (Array.isArray(opts.config) || typeof opts.config === 'string') {
                [].concat(opts.config).filter(Boolean).forEach(function(key) {
                    flags.configs[key] = true;
                });
            } else if (typeof opts.config === 'object') {
                Object.entries(opts.config).forEach(([key, value])=>{
                    if (typeof value === 'boolean' || typeof value === 'function') {
                        flags.configs[key] = value;
                    }
                });
            }
        }
        extendAliases(opts.key, aliases, opts.default, flags.arrays);
        Object.keys(defaults).forEach(function(key) {
            (flags.aliases[key] || []).forEach(function(alias) {
                defaults[alias] = defaults[key];
            });
        });
        let error = null;
        checkConfiguration();
        let notFlags = [];
        const argv = Object.assign(Object.create(null), {
            _: []
        });
        const argvReturn = {
        };
        for(let i = 0; i < args.length; i++){
            const arg = args[i];
            let broken;
            let key;
            let letters;
            let m;
            let next;
            let value;
            if (arg !== '--' && isUnknownOptionAsArg(arg)) {
                pushPositional(arg);
            } else if (arg.match(/^--.+=/) || !configuration['short-option-groups'] && arg.match(/^-.+=/)) {
                m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
                if (m !== null && Array.isArray(m) && m.length >= 3) {
                    if (checkAllAliases(m[1], flags.arrays)) {
                        i = eatArray(i, m[1], args, m[2]);
                    } else if (checkAllAliases(m[1], flags.nargs) !== false) {
                        i = eatNargs(i, m[1], args, m[2]);
                    } else {
                        setArg(m[1], m[2]);
                    }
                }
            } else if (arg.match(negatedBoolean) && configuration['boolean-negation']) {
                m = arg.match(negatedBoolean);
                if (m !== null && Array.isArray(m) && m.length >= 2) {
                    key = m[1];
                    setArg(key, checkAllAliases(key, flags.arrays) ? [
                        false
                    ] : false);
                }
            } else if (arg.match(/^--.+/) || !configuration['short-option-groups'] && arg.match(/^-[^-]+/)) {
                m = arg.match(/^--?(.+)/);
                if (m !== null && Array.isArray(m) && m.length >= 2) {
                    key = m[1];
                    if (checkAllAliases(key, flags.arrays)) {
                        i = eatArray(i, key, args);
                    } else if (checkAllAliases(key, flags.nargs) !== false) {
                        i = eatNargs(i, key, args);
                    } else {
                        next = args[i + 1];
                        if (next !== undefined && (!next.match(/^-/) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                            setArg(key, next);
                            i++;
                        } else if (/^(true|false)$/.test(next)) {
                            setArg(key, next);
                            i++;
                        } else {
                            setArg(key, defaultValue(key));
                        }
                    }
                }
            } else if (arg.match(/^-.\..+=/)) {
                m = arg.match(/^-([^=]+)=([\s\S]*)$/);
                if (m !== null && Array.isArray(m) && m.length >= 3) {
                    setArg(m[1], m[2]);
                }
            } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
                next = args[i + 1];
                m = arg.match(/^-(.\..+)/);
                if (m !== null && Array.isArray(m) && m.length >= 2) {
                    key = m[1];
                    if (next !== undefined && !next.match(/^-/) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                        setArg(key, next);
                        i++;
                    } else {
                        setArg(key, defaultValue(key));
                    }
                }
            } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
                letters = arg.slice(1, -1).split('');
                broken = false;
                for(let j = 0; j < letters.length; j++){
                    next = arg.slice(j + 2);
                    if (letters[j + 1] && letters[j + 1] === '=') {
                        value = arg.slice(j + 3);
                        key = letters[j];
                        if (checkAllAliases(key, flags.arrays)) {
                            i = eatArray(i, key, args, value);
                        } else if (checkAllAliases(key, flags.nargs) !== false) {
                            i = eatNargs(i, key, args, value);
                        } else {
                            setArg(key, value);
                        }
                        broken = true;
                        break;
                    }
                    if (next === '-') {
                        setArg(letters[j], next);
                        continue;
                    }
                    if (/[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) && checkAllAliases(next, flags.bools) === false) {
                        setArg(letters[j], next);
                        broken = true;
                        break;
                    }
                    if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                        setArg(letters[j], next);
                        broken = true;
                        break;
                    } else {
                        setArg(letters[j], defaultValue(letters[j]));
                    }
                }
                key = arg.slice(-1)[0];
                if (!broken && key !== '-') {
                    if (checkAllAliases(key, flags.arrays)) {
                        i = eatArray(i, key, args);
                    } else if (checkAllAliases(key, flags.nargs) !== false) {
                        i = eatNargs(i, key, args);
                    } else {
                        next = args[i + 1];
                        if (next !== undefined && (!/^(-|--)[^-]/.test(next) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                            setArg(key, next);
                            i++;
                        } else if (/^(true|false)$/.test(next)) {
                            setArg(key, next);
                            i++;
                        } else {
                            setArg(key, defaultValue(key));
                        }
                    }
                }
            } else if (arg.match(/^-[0-9]$/) && arg.match(negative) && checkAllAliases(arg.slice(1), flags.bools)) {
                key = arg.slice(1);
                setArg(key, defaultValue(key));
            } else if (arg === '--') {
                notFlags = args.slice(i + 1);
                break;
            } else if (configuration['halt-at-non-option']) {
                notFlags = args.slice(i);
                break;
            } else {
                pushPositional(arg);
            }
        }
        applyEnvVars(argv, true);
        applyEnvVars(argv, false);
        setConfig(argv);
        setConfigObjects();
        applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
        applyCoercions(argv);
        if (configuration['set-placeholder-key']) setPlaceholderKeys(argv);
        Object.keys(flags.counts).forEach(function(key) {
            if (!hasKey(argv, key.split('.'))) setArg(key, 0);
        });
        if (notFlagsOption && notFlags.length) argv[notFlagsArgv] = [];
        notFlags.forEach(function(key) {
            argv[notFlagsArgv].push(key);
        });
        if (configuration['camel-case-expansion'] && configuration['strip-dashed']) {
            Object.keys(argv).filter((key)=>key !== '--' && key.includes('-')
            ).forEach((key)=>{
                delete argv[key];
            });
        }
        if (configuration['strip-aliased']) {
            [].concat(...Object.keys(aliases).map((k)=>aliases[k]
            )).forEach((alias)=>{
                if (configuration['camel-case-expansion'] && alias.includes('-')) {
                    delete argv[alias.split('.').map((prop)=>camelCase(prop)
                    ).join('.')];
                }
                delete argv[alias];
            });
        }
        function pushPositional(arg) {
            const maybeCoercedNumber = maybeCoerceNumber('_', arg);
            if (typeof maybeCoercedNumber === 'string' || typeof maybeCoercedNumber === 'number') {
                argv._.push(maybeCoercedNumber);
            }
        }
        function eatNargs(i, key, args, argAfterEqualSign) {
            let ii;
            let toEat = checkAllAliases(key, flags.nargs);
            toEat = typeof toEat !== 'number' || isNaN(toEat) ? 1 : toEat;
            if (toEat === 0) {
                if (!isUndefined(argAfterEqualSign)) {
                    error = Error(__('Argument unexpected for: %s', key));
                }
                setArg(key, defaultValue(key));
                return i;
            }
            let available = isUndefined(argAfterEqualSign) ? 0 : 1;
            if (configuration['nargs-eats-options']) {
                if (args.length - (i + 1) + available < toEat) {
                    error = Error(__('Not enough arguments following: %s', key));
                }
                available = toEat;
            } else {
                for(ii = i + 1; ii < args.length; ii++){
                    if (!args[ii].match(/^-[^0-9]/) || args[ii].match(negative) || isUnknownOptionAsArg(args[ii])) available++;
                    else break;
                }
                if (available < toEat) error = Error(__('Not enough arguments following: %s', key));
            }
            let consumed = Math.min(available, toEat);
            if (!isUndefined(argAfterEqualSign) && consumed > 0) {
                setArg(key, argAfterEqualSign);
                consumed--;
            }
            for(ii = i + 1; ii < consumed + i + 1; ii++){
                setArg(key, args[ii]);
            }
            return i + consumed;
        }
        function eatArray(i, key, args, argAfterEqualSign) {
            let argsToSet = [];
            let next = argAfterEqualSign || args[i + 1];
            const nargsCount = checkAllAliases(key, flags.nargs);
            if (checkAllAliases(key, flags.bools) && !/^(true|false)$/.test(next)) {
                argsToSet.push(true);
            } else if (isUndefined(next) || isUndefined(argAfterEqualSign) && /^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) {
                if (defaults[key] !== undefined) {
                    const defVal = defaults[key];
                    argsToSet = Array.isArray(defVal) ? defVal : [
                        defVal
                    ];
                }
            } else {
                if (!isUndefined(argAfterEqualSign)) {
                    argsToSet.push(processValue(key, argAfterEqualSign));
                }
                for(let ii = i + 1; ii < args.length; ii++){
                    if (!configuration['greedy-arrays'] && argsToSet.length > 0 || nargsCount && typeof nargsCount === 'number' && argsToSet.length >= nargsCount) break;
                    next = args[ii];
                    if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) break;
                    i = ii;
                    argsToSet.push(processValue(key, next));
                }
            }
            if (typeof nargsCount === 'number' && (nargsCount && argsToSet.length < nargsCount || isNaN(nargsCount) && argsToSet.length === 0)) {
                error = Error(__('Not enough arguments following: %s', key));
            }
            setArg(key, argsToSet);
            return i;
        }
        function setArg(key, val) {
            if (/-/.test(key) && configuration['camel-case-expansion']) {
                const alias = key.split('.').map(function(prop) {
                    return camelCase(prop);
                }).join('.');
                addNewAlias(key, alias);
            }
            const value = processValue(key, val);
            const splitKey = key.split('.');
            setKey(argv, splitKey, value);
            if (flags.aliases[key]) {
                flags.aliases[key].forEach(function(x) {
                    const keyProperties = x.split('.');
                    setKey(argv, keyProperties, value);
                });
            }
            if (splitKey.length > 1 && configuration['dot-notation']) {
                (flags.aliases[splitKey[0]] || []).forEach(function(x) {
                    let keyProperties = x.split('.');
                    const a = [].concat(splitKey);
                    a.shift();
                    keyProperties = keyProperties.concat(a);
                    if (!(flags.aliases[key] || []).includes(keyProperties.join('.'))) {
                        setKey(argv, keyProperties, value);
                    }
                });
            }
            if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
                const keys = [
                    key
                ].concat(flags.aliases[key] || []);
                keys.forEach(function(key) {
                    Object.defineProperty(argvReturn, key, {
                        enumerable: true,
                        get () {
                            return val;
                        },
                        set (value) {
                            val = typeof value === 'string' ? mixin1.normalize(value) : value;
                        }
                    });
                });
            }
        }
        function addNewAlias(key, alias) {
            if (!(flags.aliases[key] && flags.aliases[key].length)) {
                flags.aliases[key] = [
                    alias
                ];
                newAliases[alias] = true;
            }
            if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
                addNewAlias(alias, key);
            }
        }
        function processValue(key, val) {
            if (typeof val === 'string' && (val[0] === "'" || val[0] === '"') && val[val.length - 1] === val[0]) {
                val = val.substring(1, val.length - 1);
            }
            if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
                if (typeof val === 'string') val = val === 'true';
            }
            let value = Array.isArray(val) ? val.map(function(v) {
                return maybeCoerceNumber(key, v);
            }) : maybeCoerceNumber(key, val);
            if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === 'boolean')) {
                value = increment();
            }
            if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
                if (Array.isArray(val)) value = val.map((val)=>{
                    return mixin1.normalize(val);
                });
                else value = mixin1.normalize(val);
            }
            return value;
        }
        function maybeCoerceNumber(key, value) {
            if (!configuration['parse-positional-numbers'] && key === '_') return value;
            if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.bools) && !Array.isArray(value)) {
                const shouldCoerceNumber = looksLikeNumber(value) && configuration['parse-numbers'] && Number.isSafeInteger(Math.floor(parseFloat(`${value}`)));
                if (shouldCoerceNumber || !isUndefined(value) && checkAllAliases(key, flags.numbers)) {
                    value = Number(value);
                }
            }
            return value;
        }
        function setConfig(argv) {
            const configLookup = Object.create(null);
            applyDefaultsAndAliases(configLookup, flags.aliases, defaults);
            Object.keys(flags.configs).forEach(function(configKey) {
                const configPath = argv[configKey] || configLookup[configKey];
                if (configPath) {
                    try {
                        let config = null;
                        const resolvedConfigPath = mixin1.resolve(mixin1.cwd(), configPath);
                        const resolveConfig = flags.configs[configKey];
                        if (typeof resolveConfig === 'function') {
                            try {
                                config = resolveConfig(resolvedConfigPath);
                            } catch (e) {
                                config = e;
                            }
                            if (config instanceof Error) {
                                error = config;
                                return;
                            }
                        } else {
                            config = mixin1.require(resolvedConfigPath);
                        }
                        setConfigObject(config);
                    } catch (ex) {
                        if (ex.name === 'PermissionDenied') error = ex;
                        else if (argv[configKey]) error = Error(__('Invalid JSON config file: %s', configPath));
                    }
                }
            });
        }
        function setConfigObject(config, prev) {
            Object.keys(config).forEach(function(key) {
                const value = config[key];
                const fullKey = prev ? prev + '.' + key : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value) && configuration['dot-notation']) {
                    setConfigObject(value, fullKey);
                } else {
                    if (!hasKey(argv, fullKey.split('.')) || checkAllAliases(fullKey, flags.arrays) && configuration['combine-arrays']) {
                        setArg(fullKey, value);
                    }
                }
            });
        }
        function setConfigObjects() {
            if (typeof configObjects !== 'undefined') {
                configObjects.forEach(function(configObject) {
                    setConfigObject(configObject);
                });
            }
        }
        function applyEnvVars(argv, configOnly) {
            if (typeof envPrefix === 'undefined') return;
            const prefix = typeof envPrefix === 'string' ? envPrefix : '';
            const env = mixin1.env();
            Object.keys(env).forEach(function(envVar) {
                if (prefix === '' || envVar.lastIndexOf(prefix, 0) === 0) {
                    const keys = envVar.split('__').map(function(key, i) {
                        if (i === 0) {
                            key = key.substring(prefix.length);
                        }
                        return camelCase(key);
                    });
                    if ((configOnly && flags.configs[keys.join('.')] || !configOnly) && !hasKey(argv, keys)) {
                        setArg(keys.join('.'), env[envVar]);
                    }
                }
            });
        }
        function applyCoercions(argv) {
            let coerce;
            const applied = new Set();
            Object.keys(argv).forEach(function(key) {
                if (!applied.has(key)) {
                    coerce = checkAllAliases(key, flags.coercions);
                    if (typeof coerce === 'function') {
                        try {
                            const value = maybeCoerceNumber(key, coerce(argv[key]));
                            [].concat(flags.aliases[key] || [], key).forEach((ali)=>{
                                applied.add(ali);
                                argv[ali] = value;
                            });
                        } catch (err) {
                            error = err;
                        }
                    }
                }
            });
        }
        function setPlaceholderKeys(argv) {
            flags.keys.forEach((key)=>{
                if (~key.indexOf('.')) return;
                if (typeof argv[key] === 'undefined') argv[key] = undefined;
            });
            return argv;
        }
        function applyDefaultsAndAliases(obj, aliases, defaults, canLog = false) {
            Object.keys(defaults).forEach(function(key) {
                if (!hasKey(obj, key.split('.'))) {
                    setKey(obj, key.split('.'), defaults[key]);
                    if (canLog) defaulted[key] = true;
                    (aliases[key] || []).forEach(function(x) {
                        if (hasKey(obj, x.split('.'))) return;
                        setKey(obj, x.split('.'), defaults[key]);
                    });
                }
            });
        }
        function hasKey(obj, keys) {
            let o = obj;
            if (!configuration['dot-notation']) keys = [
                keys.join('.')
            ];
            keys.slice(0, -1).forEach(function(key) {
                o = o[key] || {
                };
            });
            const key = keys[keys.length - 1];
            if (typeof o !== 'object') return false;
            else return key in o;
        }
        function setKey(obj, keys, value) {
            let o = obj;
            if (!configuration['dot-notation']) keys = [
                keys.join('.')
            ];
            keys.slice(0, -1).forEach(function(key) {
                key = sanitizeKey(key);
                if (typeof o === 'object' && o[key] === undefined) {
                    o[key] = {
                    };
                }
                if (typeof o[key] !== 'object' || Array.isArray(o[key])) {
                    if (Array.isArray(o[key])) {
                        o[key].push({
                        });
                    } else {
                        o[key] = [
                            o[key],
                            {
                            }
                        ];
                    }
                    o = o[key][o[key].length - 1];
                } else {
                    o = o[key];
                }
            });
            const key = sanitizeKey(keys[keys.length - 1]);
            const isTypeArray = checkAllAliases(keys.join('.'), flags.arrays);
            const isValueArray = Array.isArray(value);
            let duplicate = configuration['duplicate-arguments-array'];
            if (!duplicate && checkAllAliases(key, flags.nargs)) {
                duplicate = true;
                if (!isUndefined(o[key]) && flags.nargs[key] === 1 || Array.isArray(o[key]) && o[key].length === flags.nargs[key]) {
                    o[key] = undefined;
                }
            }
            if (value === increment()) {
                o[key] = increment(o[key]);
            } else if (Array.isArray(o[key])) {
                if (duplicate && isTypeArray && isValueArray) {
                    o[key] = configuration['flatten-duplicate-arrays'] ? o[key].concat(value) : (Array.isArray(o[key][0]) ? o[key] : [
                        o[key]
                    ]).concat([
                        value
                    ]);
                } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
                    o[key] = value;
                } else {
                    o[key] = o[key].concat([
                        value
                    ]);
                }
            } else if (o[key] === undefined && isTypeArray) {
                o[key] = isValueArray ? value : [
                    value
                ];
            } else if (duplicate && !(o[key] === undefined || checkAllAliases(key, flags.counts) || checkAllAliases(key, flags.bools))) {
                o[key] = [
                    o[key],
                    value
                ];
            } else {
                o[key] = value;
            }
        }
        function extendAliases(...args) {
            args.forEach(function(obj) {
                Object.keys(obj || {
                }).forEach(function(key) {
                    if (flags.aliases[key]) return;
                    flags.aliases[key] = [].concat(aliases[key] || []);
                    flags.aliases[key].concat(key).forEach(function(x) {
                        if (/-/.test(x) && configuration['camel-case-expansion']) {
                            const c = camelCase(x);
                            if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                                flags.aliases[key].push(c);
                                newAliases[c] = true;
                            }
                        }
                    });
                    flags.aliases[key].concat(key).forEach(function(x) {
                        if (x.length > 1 && /[A-Z]/.test(x) && configuration['camel-case-expansion']) {
                            const c = decamelize(x, '-');
                            if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                                flags.aliases[key].push(c);
                                newAliases[c] = true;
                            }
                        }
                    });
                    flags.aliases[key].forEach(function(x) {
                        flags.aliases[x] = [
                            key
                        ].concat(flags.aliases[key].filter(function(y) {
                            return x !== y;
                        }));
                    });
                });
            });
        }
        function checkAllAliases(key, flag) {
            const toCheck = [].concat(flags.aliases[key] || [], key);
            const keys = Object.keys(flag);
            const setAlias = toCheck.find((key)=>keys.includes(key)
            );
            return setAlias ? flag[setAlias] : false;
        }
        function hasAnyFlag(key) {
            const flagsKeys = Object.keys(flags);
            const toCheck = [].concat(flagsKeys.map((k)=>flags[k]
            ));
            return toCheck.some(function(flag) {
                return Array.isArray(flag) ? flag.includes(key) : flag[key];
            });
        }
        function hasFlagsMatching(arg, ...patterns) {
            const toCheck = [].concat(...patterns);
            return toCheck.some(function(pattern) {
                const match = arg.match(pattern);
                return match && hasAnyFlag(match[1]);
            });
        }
        function hasAllShortFlags(arg) {
            if (arg.match(negative) || !arg.match(/^-[^-]+/)) {
                return false;
            }
            let hasAllFlags = true;
            let next;
            const letters = arg.slice(1).split('');
            for(let j = 0; j < letters.length; j++){
                next = arg.slice(j + 2);
                if (!hasAnyFlag(letters[j])) {
                    hasAllFlags = false;
                    break;
                }
                if (letters[j + 1] && letters[j + 1] === '=' || next === '-' || /[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) || letters[j + 1] && letters[j + 1].match(/\W/)) {
                    break;
                }
            }
            return hasAllFlags;
        }
        function isUnknownOptionAsArg(arg) {
            return configuration['unknown-options-as-args'] && isUnknownOption(arg);
        }
        function isUnknownOption(arg) {
            if (arg.match(negative)) {
                return false;
            }
            if (hasAllShortFlags(arg)) {
                return false;
            }
            const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/;
            const normalFlag = /^-+([^=]+?)$/;
            const flagEndingInHyphen = /^-+([^=]+?)-$/;
            const flagEndingInDigits = /^-+([^=]+?\d+)$/;
            const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/;
            return !hasFlagsMatching(arg, flagWithEquals, negatedBoolean, normalFlag, flagEndingInHyphen, flagEndingInDigits, flagEndingInNonWordCharacters);
        }
        function defaultValue(key) {
            if (!checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts) && `${key}` in defaults) {
                return defaults[key];
            } else {
                return defaultForType(guessType(key));
            }
        }
        function defaultForType(type) {
            const def = {
                boolean: true,
                string: '',
                number: undefined,
                array: []
            };
            return def[type];
        }
        function guessType(key) {
            let type = 'boolean';
            if (checkAllAliases(key, flags.strings)) type = 'string';
            else if (checkAllAliases(key, flags.numbers)) type = 'number';
            else if (checkAllAliases(key, flags.bools)) type = 'boolean';
            else if (checkAllAliases(key, flags.arrays)) type = 'array';
            return type;
        }
        function isUndefined(num) {
            return num === undefined;
        }
        function checkConfiguration() {
            Object.keys(flags.counts).find((key)=>{
                if (checkAllAliases(key, flags.arrays)) {
                    error = Error(__('Invalid configuration: %s, opts.count excludes opts.array.', key));
                    return true;
                } else if (checkAllAliases(key, flags.nargs)) {
                    error = Error(__('Invalid configuration: %s, opts.count excludes opts.narg.', key));
                    return true;
                }
                return false;
            });
        }
        return {
            aliases: Object.assign({
            }, flags.aliases),
            argv: Object.assign(argvReturn, argv),
            configuration: configuration,
            defaulted: Object.assign({
            }, defaulted),
            error: error,
            newAliases: Object.assign({
            }, newAliases)
        };
    }
}
function combineAliases(aliases) {
    const aliasArrays = [];
    const combined = Object.create(null);
    let change = true;
    Object.keys(aliases).forEach(function(key) {
        aliasArrays.push([].concat(aliases[key], key));
    });
    while(change){
        change = false;
        for(let i = 0; i < aliasArrays.length; i++){
            for(let ii = i + 1; ii < aliasArrays.length; ii++){
                const intersect = aliasArrays[i].filter(function(v) {
                    return aliasArrays[ii].indexOf(v) !== -1;
                });
                if (intersect.length) {
                    aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii]);
                    aliasArrays.splice(ii, 1);
                    change = true;
                    break;
                }
            }
        }
    }
    aliasArrays.forEach(function(aliasArray) {
        aliasArray = aliasArray.filter(function(v, i, self) {
            return self.indexOf(v) === i;
        });
        const lastAlias = aliasArray.pop();
        if (lastAlias !== undefined && typeof lastAlias === 'string') {
            combined[lastAlias] = aliasArray;
        }
    });
    return combined;
}
function increment(orig) {
    return orig !== undefined ? orig + 1 : 1;
}
function sanitizeKey(key) {
    if (key === '__proto__') return '___proto___';
    return key;
}
const parser = new YargsParser({
    cwd: Deno.cwd,
    env: ()=>{
        Deno.env.toObject();
    },
    format: (str, arg)=>{
        return str.replace('%s', arg);
    },
    normalize: mod1.normalize,
    resolve: mod1.resolve,
    require: (path)=>{
        if (!path.match(/\.json$/)) {
            throw Error('only .json config files are supported in Deno');
        } else {
            return JSON.parse(Deno.readTextFileSync(path));
        }
    }
});
const yargsParser = function Parser(args, opts) {
    const result = parser.parse(args.slice(), opts);
    return result.argv;
};
yargsParser.detailed = function(args, opts) {
    return parser.parse(args.slice(), opts);
};
yargsParser.camelCase = camelCase;
yargsParser.decamelize = decamelize;
yargsParser.looksLikeNumber = looksLikeNumber;
let shim;
class Y18N {
    constructor(opts1){
        opts1 = opts1 || {
        };
        this.directory = opts1.directory || './locales';
        this.updateFiles = typeof opts1.updateFiles === 'boolean' ? opts1.updateFiles : true;
        this.locale = opts1.locale || 'en';
        this.fallbackToLanguage = typeof opts1.fallbackToLanguage === 'boolean' ? opts1.fallbackToLanguage : true;
        this.cache = {
        };
        this.writeQueue = [];
    }
    __(...args) {
        if (typeof arguments[0] !== 'string') {
            return this._taggedLiteral(arguments[0], ...arguments);
        }
        const str = args.shift();
        let cb = function() {
        };
        if (typeof args[args.length - 1] === 'function') cb = args.pop();
        cb = cb || function() {
        };
        if (!this.cache[this.locale]) this._readLocaleFile();
        if (!this.cache[this.locale][str] && this.updateFiles) {
            this.cache[this.locale][str] = str;
            this._enqueueWrite({
                directory: this.directory,
                locale: this.locale,
                cb
            });
        } else {
            cb();
        }
        return shim.format.apply(shim.format, [
            this.cache[this.locale][str] || str
        ].concat(args));
    }
    __n() {
        const args = Array.prototype.slice.call(arguments);
        const singular = args.shift();
        const plural = args.shift();
        const quantity = args.shift();
        let cb = function() {
        };
        if (typeof args[args.length - 1] === 'function') cb = args.pop();
        if (!this.cache[this.locale]) this._readLocaleFile();
        let str = quantity === 1 ? singular : plural;
        if (this.cache[this.locale][singular]) {
            const entry = this.cache[this.locale][singular];
            str = entry[quantity === 1 ? 'one' : 'other'];
        }
        if (!this.cache[this.locale][singular] && this.updateFiles) {
            this.cache[this.locale][singular] = {
                one: singular,
                other: plural
            };
            this._enqueueWrite({
                directory: this.directory,
                locale: this.locale,
                cb
            });
        } else {
            cb();
        }
        var values = [
            str
        ];
        if (~str.indexOf('%d')) values.push(quantity);
        return shim.format.apply(shim.format, values.concat(args));
    }
    setLocale(locale) {
        this.locale = locale;
    }
    getLocale() {
        return this.locale;
    }
    updateLocale(obj) {
        if (!this.cache[this.locale]) this._readLocaleFile();
        for(const key in obj){
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                this.cache[this.locale][key] = obj[key];
            }
        }
    }
    _taggedLiteral(parts, ...args) {
        let str = '';
        parts.forEach(function(part, i) {
            var arg = args[i + 1];
            str += part;
            if (typeof arg !== 'undefined') {
                str += '%s';
            }
        });
        return this.__.apply(this, [
            str
        ].concat([].slice.call(args, 1)));
    }
    _enqueueWrite(work) {
        this.writeQueue.push(work);
        if (this.writeQueue.length === 1) this._processWriteQueue();
    }
    _processWriteQueue() {
        var _this = this;
        var work = this.writeQueue[0];
        var directory = work.directory;
        var locale = work.locale;
        var cb = work.cb;
        var languageFile = this._resolveLocaleFile(directory, locale);
        var serializedLocale = JSON.stringify(this.cache[locale], null, 2);
        shim.fs.writeFile(languageFile, serializedLocale, 'utf-8', function(err) {
            _this.writeQueue.shift();
            if (_this.writeQueue.length > 0) _this._processWriteQueue();
            cb(err);
        });
    }
    _readLocaleFile() {
        var localeLookup = {
        };
        var languageFile = this._resolveLocaleFile(this.directory, this.locale);
        try {
            localeLookup = JSON.parse(shim.fs.readFileSync(languageFile, 'utf-8'));
        } catch (err) {
            if (err instanceof SyntaxError) {
                err.message = 'syntax error in ' + languageFile;
            }
            if (err.code === 'ENOENT') localeLookup = {
            };
            else throw err;
        }
        this.cache[this.locale] = localeLookup;
    }
    _resolveLocaleFile(directory, locale) {
        var file = shim.resolve(directory, './', locale + '.json');
        if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf('_')) {
            var languageFile = shim.resolve(directory, './', locale.split('_')[0] + '.json');
            if (this._fileExistsSync(languageFile)) file = languageFile;
        }
        return file;
    }
    _fileExistsSync(file) {
        return shim.exists(file);
    }
}
function y18n(opts, _shim) {
    shim = _shim;
    const y18n = new Y18N(opts);
    return {
        __: y18n.__.bind(y18n),
        __n: y18n.__n.bind(y18n),
        setLocale: y18n.setLocale.bind(y18n),
        getLocale: y18n.getLocale.bind(y18n),
        updateLocale: y18n.updateLocale.bind(y18n),
        locale: y18n.locale
    };
}
var State;
(function(State) {
    State[State["PASSTHROUGH"] = 0] = "PASSTHROUGH";
    State[State["PERCENT"] = 1] = "PERCENT";
    State[State["POSITIONAL"] = 2] = "POSITIONAL";
    State[State["PRECISION"] = 3] = "PRECISION";
    State[State["WIDTH"] = 4] = "WIDTH";
})(State || (State = {
}));
var WorP;
(function(WorP) {
    WorP[WorP["WIDTH"] = 0] = "WIDTH";
    WorP[WorP["PRECISION"] = 1] = "PRECISION";
})(WorP || (WorP = {
}));
class Flags {
    plus;
    dash;
    sharp;
    space;
    zero;
    lessthan;
    width = -1;
    precision = -1;
}
const min = Math.min;
const UNICODE_REPLACEMENT_CHARACTER = "\ufffd";
const FLOAT_REGEXP = /(-?)(\d)\.?(\d*)e([+-])(\d+)/;
var F;
(function(F) {
    F[F["sign"] = 1] = "sign";
    F[F["mantissa"] = 2] = "mantissa";
    F[F["fractional"] = 3] = "fractional";
    F[F["esign"] = 4] = "esign";
    F[F["exponent"] = 5] = "exponent";
})(F || (F = {
}));
class Printf {
    format;
    args;
    i;
    state = State.PASSTHROUGH;
    verb = "";
    buf = "";
    argNum = 0;
    flags = new Flags();
    haveSeen;
    tmpError;
    constructor(format4, ...args1){
        this.format = format4;
        this.args = args1;
        this.haveSeen = new Array(args1.length);
        this.i = 0;
    }
    doPrintf() {
        for(; this.i < this.format.length; ++this.i){
            const c = this.format[this.i];
            switch(this.state){
                case State.PASSTHROUGH:
                    if (c === "%") {
                        this.state = State.PERCENT;
                    } else {
                        this.buf += c;
                    }
                    break;
                case State.PERCENT:
                    if (c === "%") {
                        this.buf += c;
                        this.state = State.PASSTHROUGH;
                    } else {
                        this.handleFormat();
                    }
                    break;
                default:
                    throw Error("Should be unreachable, certainly a bug in the lib.");
            }
        }
        let extras = false;
        let err = "%!(EXTRA";
        for(let i = 0; i !== this.haveSeen.length; ++i){
            if (!this.haveSeen[i]) {
                extras = true;
                err += ` '${Deno.inspect(this.args[i])}'`;
            }
        }
        err += ")";
        if (extras) {
            this.buf += err;
        }
        return this.buf;
    }
    handleFormat() {
        this.flags = new Flags();
        const flags = this.flags;
        for(; this.i < this.format.length; ++this.i){
            const c = this.format[this.i];
            switch(this.state){
                case State.PERCENT:
                    switch(c){
                        case "[":
                            this.handlePositional();
                            this.state = State.POSITIONAL;
                            break;
                        case "+":
                            flags.plus = true;
                            break;
                        case "<":
                            flags.lessthan = true;
                            break;
                        case "-":
                            flags.dash = true;
                            flags.zero = false;
                            break;
                        case "#":
                            flags.sharp = true;
                            break;
                        case " ":
                            flags.space = true;
                            break;
                        case "0":
                            flags.zero = !flags.dash;
                            break;
                        default:
                            if ("1" <= c && c <= "9" || c === "." || c === "*") {
                                if (c === ".") {
                                    this.flags.precision = 0;
                                    this.state = State.PRECISION;
                                    this.i++;
                                } else {
                                    this.state = State.WIDTH;
                                }
                                this.handleWidthAndPrecision(flags);
                            } else {
                                this.handleVerb();
                                return;
                            }
                    }
                    break;
                case State.POSITIONAL:
                    if (c === "*") {
                        const worp = this.flags.precision === -1 ? WorP.WIDTH : WorP.PRECISION;
                        this.handleWidthOrPrecisionRef(worp);
                        this.state = State.PERCENT;
                        break;
                    } else {
                        this.handleVerb();
                        return;
                    }
                default:
                    throw new Error(`Should not be here ${this.state}, library bug!`);
            }
        }
    }
    handleWidthOrPrecisionRef(wOrP) {
        if (this.argNum >= this.args.length) {
            return;
        }
        const arg = this.args[this.argNum];
        this.haveSeen[this.argNum] = true;
        if (typeof arg === "number") {
            switch(wOrP){
                case WorP.WIDTH:
                    this.flags.width = arg;
                    break;
                default:
                    this.flags.precision = arg;
            }
        } else {
            const tmp = wOrP === WorP.WIDTH ? "WIDTH" : "PREC";
            this.tmpError = `%!(BAD ${tmp} '${this.args[this.argNum]}')`;
        }
        this.argNum++;
    }
    handleWidthAndPrecision(flags) {
        const fmt = this.format;
        for(; this.i !== this.format.length; ++this.i){
            const c = fmt[this.i];
            switch(this.state){
                case State.WIDTH:
                    switch(c){
                        case ".":
                            this.flags.precision = 0;
                            this.state = State.PRECISION;
                            break;
                        case "*":
                            this.handleWidthOrPrecisionRef(WorP.WIDTH);
                            break;
                        default:
                            {
                                const val = parseInt(c);
                                if (isNaN(val)) {
                                    this.i--;
                                    this.state = State.PERCENT;
                                    return;
                                }
                                flags.width = flags.width == -1 ? 0 : flags.width;
                                flags.width *= 10;
                                flags.width += val;
                            }
                    }
                    break;
                case State.PRECISION:
                    {
                        if (c === "*") {
                            this.handleWidthOrPrecisionRef(WorP.PRECISION);
                            break;
                        }
                        const val = parseInt(c);
                        if (isNaN(val)) {
                            this.i--;
                            this.state = State.PERCENT;
                            return;
                        }
                        flags.precision *= 10;
                        flags.precision += val;
                        break;
                    }
                default:
                    throw new Error("can't be here. bug.");
            }
        }
    }
    handlePositional() {
        if (this.format[this.i] !== "[") {
            throw new Error("Can't happen? Bug.");
        }
        let positional = 0;
        const format = this.format;
        this.i++;
        let err = false;
        for(; this.i !== this.format.length; ++this.i){
            if (format[this.i] === "]") {
                break;
            }
            positional *= 10;
            const val = parseInt(format[this.i]);
            if (isNaN(val)) {
                this.tmpError = "%!(BAD INDEX)";
                err = true;
            }
            positional += val;
        }
        if (positional - 1 >= this.args.length) {
            this.tmpError = "%!(BAD INDEX)";
            err = true;
        }
        this.argNum = err ? this.argNum : positional - 1;
        return;
    }
    handleLessThan() {
        const arg = this.args[this.argNum];
        if ((arg || {
        }).constructor.name !== "Array") {
            throw new Error(`arg ${arg} is not an array. Todo better error handling`);
        }
        let str = "[ ";
        for(let i = 0; i !== arg.length; ++i){
            if (i !== 0) str += ", ";
            str += this._handleVerb(arg[i]);
        }
        return str + " ]";
    }
    handleVerb() {
        const verb = this.format[this.i];
        this.verb = verb;
        if (this.tmpError) {
            this.buf += this.tmpError;
            this.tmpError = undefined;
            if (this.argNum < this.haveSeen.length) {
                this.haveSeen[this.argNum] = true;
            }
        } else if (this.args.length <= this.argNum) {
            this.buf += `%!(MISSING '${verb}')`;
        } else {
            const arg = this.args[this.argNum];
            this.haveSeen[this.argNum] = true;
            if (this.flags.lessthan) {
                this.buf += this.handleLessThan();
            } else {
                this.buf += this._handleVerb(arg);
            }
        }
        this.argNum++;
        this.state = State.PASSTHROUGH;
    }
    _handleVerb(arg) {
        switch(this.verb){
            case "t":
                return this.pad(arg.toString());
            case "b":
                return this.fmtNumber(arg, 2);
            case "c":
                return this.fmtNumberCodePoint(arg);
            case "d":
                return this.fmtNumber(arg, 10);
            case "o":
                return this.fmtNumber(arg, 8);
            case "x":
                return this.fmtHex(arg);
            case "X":
                return this.fmtHex(arg, true);
            case "e":
                return this.fmtFloatE(arg);
            case "E":
                return this.fmtFloatE(arg, true);
            case "f":
            case "F":
                return this.fmtFloatF(arg);
            case "g":
                return this.fmtFloatG(arg);
            case "G":
                return this.fmtFloatG(arg, true);
            case "s":
                return this.fmtString(arg);
            case "T":
                return this.fmtString(typeof arg);
            case "v":
                return this.fmtV(arg);
            case "j":
                return this.fmtJ(arg);
            default:
                return `%!(BAD VERB '${this.verb}')`;
        }
    }
    pad(s) {
        const padding = this.flags.zero ? "0" : " ";
        if (this.flags.dash) {
            return s.padEnd(this.flags.width, padding);
        }
        return s.padStart(this.flags.width, padding);
    }
    padNum(nStr, neg) {
        let sign;
        if (neg) {
            sign = "-";
        } else if (this.flags.plus || this.flags.space) {
            sign = this.flags.plus ? "+" : " ";
        } else {
            sign = "";
        }
        const zero = this.flags.zero;
        if (!zero) {
            nStr = sign + nStr;
        }
        const pad = zero ? "0" : " ";
        const len = zero ? this.flags.width - sign.length : this.flags.width;
        if (this.flags.dash) {
            nStr = nStr.padEnd(len, pad);
        } else {
            nStr = nStr.padStart(len, pad);
        }
        if (zero) {
            nStr = sign + nStr;
        }
        return nStr;
    }
    fmtNumber(n, radix, upcase = false) {
        let num = Math.abs(n).toString(radix);
        const prec = this.flags.precision;
        if (prec !== -1) {
            this.flags.zero = false;
            num = n === 0 && prec === 0 ? "" : num;
            while(num.length < prec){
                num = "0" + num;
            }
        }
        let prefix = "";
        if (this.flags.sharp) {
            switch(radix){
                case 2:
                    prefix += "0b";
                    break;
                case 8:
                    prefix += num.startsWith("0") ? "" : "0";
                    break;
                case 16:
                    prefix += "0x";
                    break;
                default:
                    throw new Error("cannot handle base: " + radix);
            }
        }
        num = num.length === 0 ? num : prefix + num;
        if (upcase) {
            num = num.toUpperCase();
        }
        return this.padNum(num, n < 0);
    }
    fmtNumberCodePoint(n) {
        let s = "";
        try {
            s = String.fromCodePoint(n);
        } catch  {
            s = UNICODE_REPLACEMENT_CHARACTER;
        }
        return this.pad(s);
    }
    fmtFloatSpecial(n) {
        if (isNaN(n)) {
            this.flags.zero = false;
            return this.padNum("NaN", false);
        }
        if (n === Number.POSITIVE_INFINITY) {
            this.flags.zero = false;
            this.flags.plus = true;
            return this.padNum("Inf", false);
        }
        if (n === Number.NEGATIVE_INFINITY) {
            this.flags.zero = false;
            return this.padNum("Inf", true);
        }
        return "";
    }
    roundFractionToPrecision(fractional, precision) {
        if (fractional.length > precision) {
            fractional = "1" + fractional;
            let tmp = parseInt(fractional.substr(0, precision + 2)) / 10;
            tmp = Math.round(tmp);
            fractional = Math.floor(tmp).toString();
            fractional = fractional.substr(1);
        } else {
            while(fractional.length < precision){
                fractional += "0";
            }
        }
        return fractional;
    }
    fmtFloatE(n, upcase = false) {
        const special = this.fmtFloatSpecial(n);
        if (special !== "") {
            return special;
        }
        const m = n.toExponential().match(FLOAT_REGEXP);
        if (!m) {
            throw Error("can't happen, bug");
        }
        let fractional = m[F.fractional];
        const precision = this.flags.precision !== -1 ? this.flags.precision : 6;
        fractional = this.roundFractionToPrecision(fractional, precision);
        let e = m[F.exponent];
        e = e.length == 1 ? "0" + e : e;
        const val = `${m[F.mantissa]}.${fractional}${upcase ? "E" : "e"}${m[F.esign]}${e}`;
        return this.padNum(val, n < 0);
    }
    fmtFloatF(n) {
        const special = this.fmtFloatSpecial(n);
        if (special !== "") {
            return special;
        }
        function expandNumber(n) {
            if (Number.isSafeInteger(n)) {
                return n.toString() + ".";
            }
            const t = n.toExponential().split("e");
            let m = t[0].replace(".", "");
            const e = parseInt(t[1]);
            if (e < 0) {
                let nStr = "0.";
                for(let i = 0; i !== Math.abs(e) - 1; ++i){
                    nStr += "0";
                }
                return nStr += m;
            } else {
                const splIdx = e + 1;
                while(m.length < splIdx){
                    m += "0";
                }
                return m.substr(0, splIdx) + "." + m.substr(splIdx);
            }
        }
        const val = expandNumber(Math.abs(n));
        const arr = val.split(".");
        const dig = arr[0];
        let fractional = arr[1];
        const precision = this.flags.precision !== -1 ? this.flags.precision : 6;
        fractional = this.roundFractionToPrecision(fractional, precision);
        return this.padNum(`${dig}.${fractional}`, n < 0);
    }
    fmtFloatG(n, upcase = false) {
        const special = this.fmtFloatSpecial(n);
        if (special !== "") {
            return special;
        }
        let P = this.flags.precision !== -1 ? this.flags.precision : 6;
        P = P === 0 ? 1 : P;
        const m = n.toExponential().match(FLOAT_REGEXP);
        if (!m) {
            throw Error("can't happen");
        }
        const X = parseInt(m[F.exponent]) * (m[F.esign] === "-" ? -1 : 1);
        let nStr = "";
        if (P > X && X >= -4) {
            this.flags.precision = P - (X + 1);
            nStr = this.fmtFloatF(n);
            if (!this.flags.sharp) {
                nStr = nStr.replace(/\.?0*$/, "");
            }
        } else {
            this.flags.precision = P - 1;
            nStr = this.fmtFloatE(n);
            if (!this.flags.sharp) {
                nStr = nStr.replace(/\.?0*e/, upcase ? "E" : "e");
            }
        }
        return nStr;
    }
    fmtString(s) {
        if (this.flags.precision !== -1) {
            s = s.substr(0, this.flags.precision);
        }
        return this.pad(s);
    }
    fmtHex(val, upper = false) {
        switch(typeof val){
            case "number":
                return this.fmtNumber(val, 16, upper);
            case "string":
                {
                    const sharp = this.flags.sharp && val.length !== 0;
                    let hex = sharp ? "0x" : "";
                    const prec = this.flags.precision;
                    const end = prec !== -1 ? min(prec, val.length) : val.length;
                    for(let i = 0; i !== end; ++i){
                        if (i !== 0 && this.flags.space) {
                            hex += sharp ? " 0x" : " ";
                        }
                        const c = (val.charCodeAt(i) & 255).toString(16);
                        hex += c.length === 1 ? `0${c}` : c;
                    }
                    if (upper) {
                        hex = hex.toUpperCase();
                    }
                    return this.pad(hex);
                }
            default:
                throw new Error("currently only number and string are implemented for hex");
        }
    }
    fmtV(val) {
        if (this.flags.sharp) {
            const options = this.flags.precision !== -1 ? {
                depth: this.flags.precision
            } : {
            };
            return this.pad(Deno.inspect(val, options));
        } else {
            const p = this.flags.precision;
            return p === -1 ? val.toString() : val.toString().substr(0, p);
        }
    }
    fmtJ(val) {
        return JSON.stringify(val);
    }
}
function sprintf(format, ...args) {
    const printf = new Printf(format, ...args);
    return printf.doPrintf();
}
const __default3 = {
    fs: {
        readFileSync: (path)=>{
            try {
                return Deno.readTextFileSync(path);
            } catch (err) {
                err.code = 'ENOENT';
                throw err;
            }
        },
        writeFile: Deno.writeFile
    },
    format: sprintf,
    resolve: (base, p1, p2)=>{
        try {
            return mod1.resolve(base, p1, p2);
        } catch (err) {
        }
    },
    exists: (file)=>{
        try {
            return Deno.statSync(file).isFile;
        } catch (err) {
            return false;
        }
    }
};
const y18n1 = (opts)=>{
    return y18n(opts, __default3);
};
class YError extends Error {
    constructor(msg1){
        super(msg1 || 'yargs error');
        this.name = 'YError';
        Error.captureStackTrace(this, YError);
    }
}
const importMeta = {
    url: "https://deno.land/x/yargs@v17.0.1-deno/lib/platform-shims/deno.ts",
    main: false
};
const REQUIRE_ERROR = 'require is not supported by ESM';
const REQUIRE_DIRECTORY_ERROR = 'loading a directory of commands is not supported yet for ESM';
const argv = [
    'deno run',
    ...Deno.args
];
const __dirname = new URL('.', importMeta.url).pathname;
let cwd = '';
let env = {
};
try {
    env = Deno.env.toObject();
    cwd = Deno.cwd();
} catch (err1) {
    if (err1.name !== 'PermissionDenied') {
        throw err1;
    }
}
const path1 = {
    basename: basename2,
    dirname: dirname2,
    extname: extname2,
    relative: (p1, p2)=>{
        try {
            return mod1.relative(p1, p2);
        } catch (err) {
            if (err.name !== 'PermissionDenied') {
                throw err;
            }
            return p1;
        }
    },
    resolve: mod1.resolve
};
const __default4 = {
    assert: {
        notStrictEqual: assertNotEquals,
        strictEqual: assertStrictEquals
    },
    cliui: ui,
    findUp: __default2,
    getEnv: (key)=>{
        return env[key];
    },
    inspect: Deno.inspect,
    getCallerFile: ()=>undefined
    ,
    getProcessArgvBin: ()=>{
        return 'deno';
    },
    mainFilename: cwd,
    Parser: yargsParser,
    path: path1,
    process: {
        argv: ()=>argv
        ,
        cwd: ()=>cwd
        ,
        execPath: ()=>{
            try {
                return Deno.execPath();
            } catch (_err) {
                return 'deno';
            }
        },
        exit: Deno.exit,
        nextTick: window.queueMicrotask,
        stdColumns: 80 ?? null
    },
    readFileSync: Deno.readTextFileSync,
    require: ()=>{
        throw new YError(REQUIRE_ERROR);
    },
    requireDirectory: ()=>{
        throw new YError(REQUIRE_DIRECTORY_ERROR);
    },
    stringWidth: (str)=>{
        return [
            ...str
        ].length;
    },
    y18n: y18n1({
        directory: mod1.resolve(__dirname, '../../locales'),
        updateFiles: false
    })
};
function assertNotStrictEqual(actual, expected, shim, message) {
    shim.assert.notStrictEqual(actual, expected, message);
}
function assertSingleKey(actual, shim) {
    shim.assert.strictEqual(typeof actual, 'string');
}
function objectKeys(object) {
    return Object.keys(object);
}
const completionShTemplate = `###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc
#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.
#
_{{app_name}}_yargs_completions()
{
    local cur_word args type_list

    cur_word="\${COMP_WORDS[COMP_CWORD]}"
    args=("\${COMP_WORDS[@]}")

    # ask yargs to generate completions.
    type_list=$({{app_path}} --get-yargs-completions "\${args[@]}")

    COMPREPLY=( $(compgen -W "\${type_list}" -- \${cur_word}) )

    # if no match was found, fall back to filename completion
    if [ \${#COMPREPLY[@]} -eq 0 ]; then
      COMPREPLY=()
    fi

    return 0
}
complete -o default -F _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
`;
const completionZshTemplate = `#compdef {{app_name}}
###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc
#    or {{app_path}} {{completion_command}} >> ~/.zsh_profile on OSX.
#
_{{app_name}}_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
`;
function isPromise(maybePromise) {
    return !!maybePromise && !!maybePromise.then && typeof maybePromise.then === 'function';
}
function parseCommand(cmd) {
    const extraSpacesStrippedCommand = cmd.replace(/\s{2,}/g, ' ');
    const splitCommand = extraSpacesStrippedCommand.split(/\s+(?![^[]*]|[^<]*>)/);
    const bregex = /\.*[\][<>]/g;
    const firstCommand = splitCommand.shift();
    if (!firstCommand) throw new Error(`No command found in: ${cmd}`);
    const parsedCommand = {
        cmd: firstCommand.replace(bregex, ''),
        demanded: [],
        optional: []
    };
    splitCommand.forEach((cmd, i)=>{
        let variadic = false;
        cmd = cmd.replace(/\s/g, '');
        if (/\.+[\]>]/.test(cmd) && i === splitCommand.length - 1) variadic = true;
        if (/^\[/.test(cmd)) {
            parsedCommand.optional.push({
                cmd: cmd.replace(bregex, '').split('|'),
                variadic
            });
        } else {
            parsedCommand.demanded.push({
                cmd: cmd.replace(bregex, '').split('|'),
                variadic
            });
        }
    });
    return parsedCommand;
}
const positionName = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth'
];
function argsert(arg1, arg2, arg3) {
    function parseArgs() {
        return typeof arg1 === 'object' ? [
            {
                demanded: [],
                optional: []
            },
            arg1,
            arg2
        ] : [
            parseCommand(`cmd ${arg1}`),
            arg2,
            arg3, 
        ];
    }
    try {
        let position = 0;
        const [parsed, callerArguments, _length] = parseArgs();
        const args = [].slice.call(callerArguments);
        while(args.length && args[args.length - 1] === undefined)args.pop();
        const length = _length || args.length;
        if (length < parsed.demanded.length) {
            throw new YError(`Not enough arguments provided. Expected ${parsed.demanded.length} but received ${args.length}.`);
        }
        const totalCommands = parsed.demanded.length + parsed.optional.length;
        if (length > totalCommands) {
            throw new YError(`Too many arguments provided. Expected max ${totalCommands} but received ${length}.`);
        }
        parsed.demanded.forEach((demanded)=>{
            const arg = args.shift();
            const observedType = guessType(arg);
            const matchingTypes = demanded.cmd.filter((type)=>type === observedType || type === '*'
            );
            if (matchingTypes.length === 0) argumentTypeError(observedType, demanded.cmd, position);
            position += 1;
        });
        parsed.optional.forEach((optional)=>{
            if (args.length === 0) return;
            const arg = args.shift();
            const observedType = guessType(arg);
            const matchingTypes = optional.cmd.filter((type)=>type === observedType || type === '*'
            );
            if (matchingTypes.length === 0) argumentTypeError(observedType, optional.cmd, position);
            position += 1;
        });
    } catch (err) {
        console.warn(err.stack);
    }
}
function guessType(arg) {
    if (Array.isArray(arg)) {
        return 'array';
    } else if (arg === null) {
        return 'null';
    }
    return typeof arg;
}
function argumentTypeError(observedType, allowedTypes, position) {
    throw new YError(`Invalid ${positionName[position] || 'manyith'} argument. Expected ${allowedTypes.join(' or ')} but received ${observedType}.`);
}
class GlobalMiddleware {
    constructor(yargs2){
        this.globalMiddleware = [];
        this.frozens = [];
        this.yargs = yargs2;
    }
    addMiddleware(callback, applyBeforeValidation, global = true) {
        argsert('<array|function> [boolean] [boolean]', [
            callback,
            applyBeforeValidation,
            global
        ], arguments.length);
        if (Array.isArray(callback)) {
            for(let i = 0; i < callback.length; i++){
                if (typeof callback[i] !== 'function') {
                    throw Error('middleware must be a function');
                }
                const m = callback[i];
                m.applyBeforeValidation = applyBeforeValidation;
                m.global = global;
            }
            Array.prototype.push.apply(this.globalMiddleware, callback);
        } else if (typeof callback === 'function') {
            const m = callback;
            m.applyBeforeValidation = applyBeforeValidation;
            m.global = global;
            this.globalMiddleware.push(callback);
        }
        return this.yargs;
    }
    addCoerceMiddleware(callback, option) {
        const aliases = this.yargs.getAliases();
        this.globalMiddleware = this.globalMiddleware.filter((m)=>{
            const toCheck = [
                ...aliases[option] || [],
                option
            ];
            if (!m.option) return true;
            else return !toCheck.includes(m.option);
        });
        callback.option = option;
        return this.addMiddleware(callback, true, true);
    }
    getMiddleware() {
        return this.globalMiddleware;
    }
    freeze() {
        this.frozens.push([
            ...this.globalMiddleware
        ]);
    }
    unfreeze() {
        const frozen = this.frozens.pop();
        if (frozen !== undefined) this.globalMiddleware = frozen;
    }
    reset() {
        this.globalMiddleware = this.globalMiddleware.filter((m)=>m.global
        );
    }
}
function commandMiddlewareFactory(commandMiddleware) {
    if (!commandMiddleware) return [];
    return commandMiddleware.map((middleware)=>{
        middleware.applyBeforeValidation = false;
        return middleware;
    });
}
function applyMiddleware(argv, yargs, middlewares, beforeValidation) {
    return middlewares.reduce((acc, middleware)=>{
        if (middleware.applyBeforeValidation !== beforeValidation) {
            return acc;
        }
        if (isPromise(acc)) {
            return acc.then((initialObj)=>Promise.all([
                    initialObj,
                    middleware(initialObj, yargs), 
                ])
            ).then(([initialObj, middlewareObj])=>Object.assign(initialObj, middlewareObj)
            );
        } else {
            const result = middleware(acc, yargs);
            return isPromise(result) ? result.then((middlewareObj)=>Object.assign(acc, middlewareObj)
            ) : Object.assign(acc, result);
        }
    }, argv);
}
function maybeAsyncResult(getResult, resultHandler, errorHandler = (err)=>{
    throw err;
}) {
    try {
        const result = isFunction(getResult) ? getResult() : getResult;
        return isPromise(result) ? result.then((result)=>resultHandler(result)
        ) : resultHandler(result);
    } catch (err) {
        return errorHandler(err);
    }
}
function isFunction(arg) {
    return typeof arg === 'function';
}
function whichModule(exported) {
    if (typeof require === 'undefined') return null;
    for(let i = 0, files = Object.keys(require.cache), mod; i < files.length; i++){
        mod = require.cache[files[i]];
        if (mod.exports === exported) return mod;
    }
    return null;
}
function objFilter(original = {
}, filter = ()=>true
) {
    const obj = {
    };
    objectKeys(original).forEach((key)=>{
        if (filter(key, original[key])) {
            obj[key] = original[key];
        }
    });
    return obj;
}
function setBlocking(blocking) {
    if (typeof process === 'undefined') return;
    [
        process.stdout,
        process.stderr
    ].forEach((_stream)=>{
        const stream = _stream;
        if (stream._handle && stream.isTTY && typeof stream._handle.setBlocking === 'function') {
            stream._handle.setBlocking(blocking);
        }
    });
}
function isBoolean(fail) {
    return typeof fail === 'boolean';
}
function usage(yargs, shim) {
    const __ = shim.y18n.__;
    const self = {
    };
    const fails = [];
    self.failFn = function failFn(f) {
        fails.push(f);
    };
    let failMessage = null;
    let showHelpOnFail = true;
    self.showHelpOnFail = function showHelpOnFailFn(arg1 = true, arg2) {
        function parseFunctionArgs() {
            return typeof arg1 === 'string' ? [
                true,
                arg1
            ] : [
                arg1,
                arg2
            ];
        }
        const [enabled, message] = parseFunctionArgs();
        failMessage = message;
        showHelpOnFail = enabled;
        return self;
    };
    let failureOutput = false;
    self.fail = function fail(msg, err) {
        const logger = yargs.getInternalMethods().getLoggerInstance();
        if (fails.length) {
            for(let i = fails.length - 1; i >= 0; --i){
                const fail = fails[i];
                if (isBoolean(fail)) {
                    if (err) throw err;
                    else if (msg) throw Error(msg);
                } else {
                    fail(msg, err, self);
                }
            }
        } else {
            if (yargs.getExitProcess()) setBlocking(true);
            if (!failureOutput) {
                failureOutput = true;
                if (showHelpOnFail) {
                    yargs.showHelp('error');
                    logger.error();
                }
                if (msg || err) logger.error(msg || err);
                if (failMessage) {
                    if (msg || err) logger.error('');
                    logger.error(failMessage);
                }
            }
            err = err || new YError(msg);
            if (yargs.getExitProcess()) {
                return yargs.exit(1);
            } else if (yargs.getInternalMethods().hasParseCallback()) {
                return yargs.exit(1, err);
            } else {
                throw err;
            }
        }
    };
    let usages = [];
    let usageDisabled = false;
    self.usage = (msg, description)=>{
        if (msg === null) {
            usageDisabled = true;
            usages = [];
            return self;
        }
        usageDisabled = false;
        usages.push([
            msg,
            description || ''
        ]);
        return self;
    };
    self.getUsage = ()=>{
        return usages;
    };
    self.getUsageDisabled = ()=>{
        return usageDisabled;
    };
    self.getPositionalGroupName = ()=>{
        return __('Positionals:');
    };
    let examples = [];
    self.example = (cmd, description)=>{
        examples.push([
            cmd,
            description || ''
        ]);
    };
    let commands = [];
    self.command = function command(cmd, description, isDefault, aliases, deprecated = false) {
        if (isDefault) {
            commands = commands.map((cmdArray)=>{
                cmdArray[2] = false;
                return cmdArray;
            });
        }
        commands.push([
            cmd,
            description || '',
            isDefault,
            aliases,
            deprecated
        ]);
    };
    self.getCommands = ()=>commands
    ;
    let descriptions = {
    };
    self.describe = function describe(keyOrKeys, desc) {
        if (Array.isArray(keyOrKeys)) {
            keyOrKeys.forEach((k)=>{
                self.describe(k, desc);
            });
        } else if (typeof keyOrKeys === 'object') {
            Object.keys(keyOrKeys).forEach((k)=>{
                self.describe(k, keyOrKeys[k]);
            });
        } else {
            descriptions[keyOrKeys] = desc;
        }
    };
    self.getDescriptions = ()=>descriptions
    ;
    let epilogs = [];
    self.epilog = (msg)=>{
        epilogs.push(msg);
    };
    let wrapSet = false;
    let wrap;
    self.wrap = (cols)=>{
        wrapSet = true;
        wrap = cols;
    };
    function getWrap() {
        if (!wrapSet) {
            wrap = windowWidth();
            wrapSet = true;
        }
        return wrap;
    }
    const deferY18nLookupPrefix = '__yargsString__:';
    self.deferY18nLookup = (str)=>deferY18nLookupPrefix + str
    ;
    self.help = function help() {
        if (cachedHelpMessage) return cachedHelpMessage;
        normalizeAliases();
        const base$0 = yargs.customScriptName ? yargs.$0 : shim.path.basename(yargs.$0);
        const demandedOptions = yargs.getDemandedOptions();
        const demandedCommands = yargs.getDemandedCommands();
        const deprecatedOptions = yargs.getDeprecatedOptions();
        const groups = yargs.getGroups();
        const options = yargs.getOptions();
        let keys = [];
        keys = keys.concat(Object.keys(descriptions));
        keys = keys.concat(Object.keys(demandedOptions));
        keys = keys.concat(Object.keys(demandedCommands));
        keys = keys.concat(Object.keys(options.default));
        keys = keys.filter(filterHiddenOptions);
        keys = Object.keys(keys.reduce((acc, key)=>{
            if (key !== '_') acc[key] = true;
            return acc;
        }, {
        }));
        const theWrap = getWrap();
        const ui = shim.cliui({
            width: theWrap,
            wrap: !!theWrap
        });
        if (!usageDisabled) {
            if (usages.length) {
                usages.forEach((usage)=>{
                    ui.div(`${usage[0].replace(/\$0/g, base$0)}`);
                    if (usage[1]) {
                        ui.div({
                            text: `${usage[1]}`,
                            padding: [
                                1,
                                0,
                                0,
                                0
                            ]
                        });
                    }
                });
                ui.div();
            } else if (commands.length) {
                let u = null;
                if (demandedCommands._) {
                    u = `${base$0} <${__('command')}>\n`;
                } else {
                    u = `${base$0} [${__('command')}]\n`;
                }
                ui.div(`${u}`);
            }
        }
        if (commands.length > 1 || commands.length === 1 && !commands[0][2]) {
            ui.div(__('Commands:'));
            const context = yargs.getInternalMethods().getContext();
            const parentCommands = context.commands.length ? `${context.commands.join(' ')} ` : '';
            if (yargs.getInternalMethods().getParserConfiguration()['sort-commands'] === true) {
                commands = commands.sort((a, b)=>a[0].localeCompare(b[0])
                );
            }
            commands.forEach((command)=>{
                const commandString = `${base$0} ${parentCommands}${command[0].replace(/^\$0 ?/, '')}`;
                ui.span({
                    text: commandString,
                    padding: [
                        0,
                        2,
                        0,
                        2
                    ],
                    width: maxWidth(commands, theWrap, `${base$0}${parentCommands}`) + 4
                }, {
                    text: command[1]
                });
                const hints = [];
                if (command[2]) hints.push(`[${__('default')}]`);
                if (command[3] && command[3].length) {
                    hints.push(`[${__('aliases:')} ${command[3].join(', ')}]`);
                }
                if (command[4]) {
                    if (typeof command[4] === 'string') {
                        hints.push(`[${__('deprecated: %s', command[4])}]`);
                    } else {
                        hints.push(`[${__('deprecated')}]`);
                    }
                }
                if (hints.length) {
                    ui.div({
                        text: hints.join(' '),
                        padding: [
                            0,
                            0,
                            0,
                            2
                        ],
                        align: 'right'
                    });
                } else {
                    ui.div();
                }
            });
            ui.div();
        }
        const aliasKeys = (Object.keys(options.alias) || []).concat(Object.keys(yargs.parsed.newAliases) || []);
        keys = keys.filter((key)=>!yargs.parsed.newAliases[key] && aliasKeys.every((alias)=>(options.alias[alias] || []).indexOf(key) === -1
            )
        );
        const defaultGroup = __('Options:');
        if (!groups[defaultGroup]) groups[defaultGroup] = [];
        addUngroupedKeys(keys, options.alias, groups, defaultGroup);
        const isLongSwitch = (sw)=>/^--/.test(getText(sw))
        ;
        const displayedGroups = Object.keys(groups).filter((groupName)=>groups[groupName].length > 0
        ).map((groupName)=>{
            const normalizedKeys = groups[groupName].filter(filterHiddenOptions).map((key)=>{
                if (~aliasKeys.indexOf(key)) return key;
                for(let i = 0, aliasKey; (aliasKey = aliasKeys[i]) !== undefined; i++){
                    if (~(options.alias[aliasKey] || []).indexOf(key)) return aliasKey;
                }
                return key;
            });
            return {
                groupName,
                normalizedKeys
            };
        }).filter(({ normalizedKeys  })=>normalizedKeys.length > 0
        ).map(({ groupName , normalizedKeys  })=>{
            const switches = normalizedKeys.reduce((acc, key)=>{
                acc[key] = [
                    key
                ].concat(options.alias[key] || []).map((sw)=>{
                    if (groupName === self.getPositionalGroupName()) return sw;
                    else {
                        return (/^[0-9]$/.test(sw) ? ~options.boolean.indexOf(key) ? '-' : '--' : sw.length > 1 ? '--' : '-') + sw;
                    }
                }).sort((sw1, sw2)=>isLongSwitch(sw1) === isLongSwitch(sw2) ? 0 : isLongSwitch(sw1) ? 1 : -1
                ).join(', ');
                return acc;
            }, {
            });
            return {
                groupName,
                normalizedKeys,
                switches
            };
        });
        const shortSwitchesUsed = displayedGroups.filter(({ groupName  })=>groupName !== self.getPositionalGroupName()
        ).some(({ normalizedKeys , switches  })=>!normalizedKeys.every((key)=>isLongSwitch(switches[key])
            )
        );
        if (shortSwitchesUsed) {
            displayedGroups.filter(({ groupName  })=>groupName !== self.getPositionalGroupName()
            ).forEach(({ normalizedKeys , switches  })=>{
                normalizedKeys.forEach((key)=>{
                    if (isLongSwitch(switches[key])) {
                        switches[key] = addIndentation(switches[key], '-x, '.length);
                    }
                });
            });
        }
        displayedGroups.forEach(({ groupName , normalizedKeys , switches  })=>{
            ui.div(groupName);
            normalizedKeys.forEach((key)=>{
                const kswitch = switches[key];
                let desc = descriptions[key] || '';
                let type = null;
                if (~desc.lastIndexOf(deferY18nLookupPrefix)) desc = __(desc.substring(deferY18nLookupPrefix.length));
                if (~options.boolean.indexOf(key)) type = `[${__('boolean')}]`;
                if (~options.count.indexOf(key)) type = `[${__('count')}]`;
                if (~options.string.indexOf(key)) type = `[${__('string')}]`;
                if (~options.normalize.indexOf(key)) type = `[${__('string')}]`;
                if (~options.array.indexOf(key)) type = `[${__('array')}]`;
                if (~options.number.indexOf(key)) type = `[${__('number')}]`;
                const deprecatedExtra = (deprecated)=>typeof deprecated === 'string' ? `[${__('deprecated: %s', deprecated)}]` : `[${__('deprecated')}]`
                ;
                const extra = [
                    key in deprecatedOptions ? deprecatedExtra(deprecatedOptions[key]) : null,
                    type,
                    key in demandedOptions ? `[${__('required')}]` : null,
                    options.choices && options.choices[key] ? `[${__('choices:')} ${self.stringifiedValues(options.choices[key])}]` : null,
                    defaultString(options.default[key], options.defaultDescription[key]), 
                ].filter(Boolean).join(' ');
                ui.span({
                    text: getText(kswitch),
                    padding: [
                        0,
                        2,
                        0,
                        2 + getIndentation(kswitch)
                    ],
                    width: maxWidth(switches, theWrap) + 4
                }, desc);
                if (extra) ui.div({
                    text: extra,
                    padding: [
                        0,
                        0,
                        0,
                        2
                    ],
                    align: 'right'
                });
                else ui.div();
            });
            ui.div();
        });
        if (examples.length) {
            ui.div(__('Examples:'));
            examples.forEach((example)=>{
                example[0] = example[0].replace(/\$0/g, base$0);
            });
            examples.forEach((example)=>{
                if (example[1] === '') {
                    ui.div({
                        text: example[0],
                        padding: [
                            0,
                            2,
                            0,
                            2
                        ]
                    });
                } else {
                    ui.div({
                        text: example[0],
                        padding: [
                            0,
                            2,
                            0,
                            2
                        ],
                        width: maxWidth(examples, theWrap) + 4
                    }, {
                        text: example[1]
                    });
                }
            });
            ui.div();
        }
        if (epilogs.length > 0) {
            const e = epilogs.map((epilog)=>epilog.replace(/\$0/g, base$0)
            ).join('\n');
            ui.div(`${e}\n`);
        }
        return ui.toString().replace(/\s*$/, '');
    };
    function maxWidth(table, theWrap, modifier) {
        let width = 0;
        if (!Array.isArray(table)) {
            table = Object.values(table).map((v)=>[
                    v
                ]
            );
        }
        table.forEach((v)=>{
            width = Math.max(shim.stringWidth(modifier ? `${modifier} ${getText(v[0])}` : getText(v[0])) + getIndentation(v[0]), width);
        });
        if (theWrap) width = Math.min(width, parseInt((theWrap * 0.5).toString(), 10));
        return width;
    }
    function normalizeAliases() {
        const demandedOptions = yargs.getDemandedOptions();
        const options = yargs.getOptions();
        (Object.keys(options.alias) || []).forEach((key)=>{
            options.alias[key].forEach((alias)=>{
                if (descriptions[alias]) self.describe(key, descriptions[alias]);
                if (alias in demandedOptions) yargs.demandOption(key, demandedOptions[alias]);
                if (~options.boolean.indexOf(alias)) yargs.boolean(key);
                if (~options.count.indexOf(alias)) yargs.count(key);
                if (~options.string.indexOf(alias)) yargs.string(key);
                if (~options.normalize.indexOf(alias)) yargs.normalize(key);
                if (~options.array.indexOf(alias)) yargs.array(key);
                if (~options.number.indexOf(alias)) yargs.number(key);
            });
        });
    }
    let cachedHelpMessage;
    self.cacheHelpMessage = function() {
        cachedHelpMessage = this.help();
    };
    self.clearCachedHelpMessage = function() {
        cachedHelpMessage = undefined;
    };
    self.hasCachedHelpMessage = function() {
        return !!cachedHelpMessage;
    };
    function addUngroupedKeys(keys, aliases, groups, defaultGroup) {
        let groupedKeys = [];
        let toCheck = null;
        Object.keys(groups).forEach((group)=>{
            groupedKeys = groupedKeys.concat(groups[group]);
        });
        keys.forEach((key)=>{
            toCheck = [
                key
            ].concat(aliases[key]);
            if (!toCheck.some((k)=>groupedKeys.indexOf(k) !== -1
            )) {
                groups[defaultGroup].push(key);
            }
        });
        return groupedKeys;
    }
    function filterHiddenOptions(key) {
        return yargs.getOptions().hiddenOptions.indexOf(key) < 0 || yargs.parsed.argv[yargs.getOptions().showHiddenOpt];
    }
    self.showHelp = (level)=>{
        const logger = yargs.getInternalMethods().getLoggerInstance();
        if (!level) level = 'error';
        const emit = typeof level === 'function' ? level : logger[level];
        emit(self.help());
    };
    self.functionDescription = (fn)=>{
        const description = fn.name ? shim.Parser.decamelize(fn.name, '-') : __('generated-value');
        return [
            '(',
            description,
            ')'
        ].join('');
    };
    self.stringifiedValues = function stringifiedValues(values, separator) {
        let string = '';
        const sep = separator || ', ';
        const array = [].concat(values);
        if (!values || !array.length) return string;
        array.forEach((value)=>{
            if (string.length) string += sep;
            string += JSON.stringify(value);
        });
        return string;
    };
    function defaultString(value, defaultDescription) {
        let string = `[${__('default:')} `;
        if (value === undefined && !defaultDescription) return null;
        if (defaultDescription) {
            string += defaultDescription;
        } else {
            switch(typeof value){
                case 'string':
                    string += `"${value}"`;
                    break;
                case 'object':
                    string += JSON.stringify(value);
                    break;
                default:
                    string += value;
            }
        }
        return `${string}]`;
    }
    function windowWidth() {
        const maxWidth = 80;
        if (shim.process.stdColumns) {
            return Math.min(80, shim.process.stdColumns);
        } else {
            return 80;
        }
    }
    let version = null;
    self.version = (ver)=>{
        version = ver;
    };
    self.showVersion = (level)=>{
        const logger = yargs.getInternalMethods().getLoggerInstance();
        if (!level) level = 'error';
        const emit = typeof level === 'function' ? level : logger[level];
        emit(version);
    };
    self.reset = function reset(localLookup) {
        failMessage = null;
        failureOutput = false;
        usages = [];
        usageDisabled = false;
        epilogs = [];
        examples = [];
        commands = [];
        descriptions = objFilter(descriptions, (k)=>!localLookup[k]
        );
        return self;
    };
    const frozens = [];
    self.freeze = function freeze() {
        frozens.push({
            failMessage,
            failureOutput,
            usages,
            usageDisabled,
            epilogs,
            examples,
            commands,
            descriptions
        });
    };
    self.unfreeze = function unfreeze() {
        const frozen = frozens.pop();
        if (!frozen) return;
        ({ failMessage , failureOutput , usages , usageDisabled , epilogs , examples , commands , descriptions ,  } = frozen);
    };
    return self;
}
function isIndentedText(text) {
    return typeof text === 'object';
}
function addIndentation(text, indent) {
    return isIndentedText(text) ? {
        text: text.text,
        indentation: text.indentation + indent
    } : {
        text,
        indentation: indent
    };
}
function getIndentation(text) {
    return isIndentedText(text) ? text.indentation : 0;
}
function getText(text) {
    return isIndentedText(text) ? text.text : text;
}
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    let i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [
            i
        ];
    }
    let j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}
const specialKeys = [
    '$0',
    '--',
    '_'
];
function validation(yargs, usage, shim) {
    const __ = shim.y18n.__;
    const __n = shim.y18n.__n;
    const self = {
    };
    self.nonOptionCount = function nonOptionCount(argv) {
        const demandedCommands = yargs.getDemandedCommands();
        const positionalCount = argv._.length + (argv['--'] ? argv['--'].length : 0);
        const _s = positionalCount - yargs.getInternalMethods().getContext().commands.length;
        if (demandedCommands._ && (_s < demandedCommands._.min || _s > demandedCommands._.max)) {
            if (_s < demandedCommands._.min) {
                if (demandedCommands._.minMsg !== undefined) {
                    usage.fail(demandedCommands._.minMsg ? demandedCommands._.minMsg.replace(/\$0/g, _s.toString()).replace(/\$1/, demandedCommands._.min.toString()) : null);
                } else {
                    usage.fail(__n('Not enough non-option arguments: got %s, need at least %s', 'Not enough non-option arguments: got %s, need at least %s', _s, _s.toString(), demandedCommands._.min.toString()));
                }
            } else if (_s > demandedCommands._.max) {
                if (demandedCommands._.maxMsg !== undefined) {
                    usage.fail(demandedCommands._.maxMsg ? demandedCommands._.maxMsg.replace(/\$0/g, _s.toString()).replace(/\$1/, demandedCommands._.max.toString()) : null);
                } else {
                    usage.fail(__n('Too many non-option arguments: got %s, maximum of %s', 'Too many non-option arguments: got %s, maximum of %s', _s, _s.toString(), demandedCommands._.max.toString()));
                }
            }
        }
    };
    self.positionalCount = function positionalCount(required, observed) {
        if (observed < required) {
            usage.fail(__n('Not enough non-option arguments: got %s, need at least %s', 'Not enough non-option arguments: got %s, need at least %s', observed, observed + '', required + ''));
        }
    };
    self.requiredArguments = function requiredArguments(argv, demandedOptions) {
        let missing = null;
        for (const key of Object.keys(demandedOptions)){
            if (!Object.prototype.hasOwnProperty.call(argv, key) || typeof argv[key] === 'undefined') {
                missing = missing || {
                };
                missing[key] = demandedOptions[key];
            }
        }
        if (missing) {
            const customMsgs = [];
            for (const key of Object.keys(missing)){
                const msg = missing[key];
                if (msg && customMsgs.indexOf(msg) < 0) {
                    customMsgs.push(msg);
                }
            }
            const customMsg = customMsgs.length ? `\n${customMsgs.join('\n')}` : '';
            usage.fail(__n('Missing required argument: %s', 'Missing required arguments: %s', Object.keys(missing).length, Object.keys(missing).join(', ') + customMsg));
        }
    };
    self.unknownArguments = function unknownArguments(argv, aliases, positionalMap, isDefaultCommand, checkPositionals = true) {
        const commandKeys = yargs.getInternalMethods().getCommandInstance().getCommands();
        const unknown = [];
        const currentContext = yargs.getInternalMethods().getContext();
        Object.keys(argv).forEach((key)=>{
            if (specialKeys.indexOf(key) === -1 && !Object.prototype.hasOwnProperty.call(positionalMap, key) && !Object.prototype.hasOwnProperty.call(yargs.getInternalMethods().getParseContext(), key) && !self.isValidAndSomeAliasIsNotNew(key, aliases)) {
                unknown.push(key);
            }
        });
        if (checkPositionals && (currentContext.commands.length > 0 || commandKeys.length > 0 || isDefaultCommand)) {
            argv._.slice(currentContext.commands.length).forEach((key)=>{
                if (commandKeys.indexOf('' + key) === -1) {
                    unknown.push('' + key);
                }
            });
        }
        if (unknown.length > 0) {
            usage.fail(__n('Unknown argument: %s', 'Unknown arguments: %s', unknown.length, unknown.join(', ')));
        }
    };
    self.unknownCommands = function unknownCommands(argv) {
        const commandKeys = yargs.getInternalMethods().getCommandInstance().getCommands();
        const unknown = [];
        const currentContext = yargs.getInternalMethods().getContext();
        if (currentContext.commands.length > 0 || commandKeys.length > 0) {
            argv._.slice(currentContext.commands.length).forEach((key)=>{
                if (commandKeys.indexOf('' + key) === -1) {
                    unknown.push('' + key);
                }
            });
        }
        if (unknown.length > 0) {
            usage.fail(__n('Unknown command: %s', 'Unknown commands: %s', unknown.length, unknown.join(', ')));
            return true;
        } else {
            return false;
        }
    };
    self.isValidAndSomeAliasIsNotNew = function isValidAndSomeAliasIsNotNew(key, aliases) {
        if (!Object.prototype.hasOwnProperty.call(aliases, key)) {
            return false;
        }
        const newAliases = yargs.parsed.newAliases;
        return [
            key,
            ...aliases[key]
        ].some((a)=>!Object.prototype.hasOwnProperty.call(newAliases, a) || !newAliases[key]
        );
    };
    self.limitedChoices = function limitedChoices(argv) {
        const options = yargs.getOptions();
        const invalid = {
        };
        if (!Object.keys(options.choices).length) return;
        Object.keys(argv).forEach((key)=>{
            if (specialKeys.indexOf(key) === -1 && Object.prototype.hasOwnProperty.call(options.choices, key)) {
                [].concat(argv[key]).forEach((value)=>{
                    if (options.choices[key].indexOf(value) === -1 && value !== undefined) {
                        invalid[key] = (invalid[key] || []).concat(value);
                    }
                });
            }
        });
        const invalidKeys = Object.keys(invalid);
        if (!invalidKeys.length) return;
        let msg = __('Invalid values:');
        invalidKeys.forEach((key)=>{
            msg += `\n  ${__('Argument: %s, Given: %s, Choices: %s', key, usage.stringifiedValues(invalid[key]), usage.stringifiedValues(options.choices[key]))}`;
        });
        usage.fail(msg);
    };
    let implied = {
    };
    self.implies = function implies(key, value) {
        argsert('<string|object> [array|number|string]', [
            key,
            value
        ], arguments.length);
        if (typeof key === 'object') {
            Object.keys(key).forEach((k)=>{
                self.implies(k, key[k]);
            });
        } else {
            yargs.global(key);
            if (!implied[key]) {
                implied[key] = [];
            }
            if (Array.isArray(value)) {
                value.forEach((i)=>self.implies(key, i)
                );
            } else {
                assertNotStrictEqual(value, undefined, shim);
                implied[key].push(value);
            }
        }
    };
    self.getImplied = function getImplied() {
        return implied;
    };
    function keyExists(argv, val) {
        const num = Number(val);
        val = isNaN(num) ? val : num;
        if (typeof val === 'number') {
            val = argv._.length >= val;
        } else if (val.match(/^--no-.+/)) {
            val = val.match(/^--no-(.+)/)[1];
            val = !argv[val];
        } else {
            val = argv[val];
        }
        return val;
    }
    self.implications = function implications(argv) {
        const implyFail = [];
        Object.keys(implied).forEach((key)=>{
            const origKey = key;
            (implied[key] || []).forEach((value)=>{
                let key = origKey;
                const origValue = value;
                key = keyExists(argv, key);
                value = keyExists(argv, value);
                if (key && !value) {
                    implyFail.push(` ${origKey} -> ${origValue}`);
                }
            });
        });
        if (implyFail.length) {
            let msg = `${__('Implications failed:')}\n`;
            implyFail.forEach((value)=>{
                msg += value;
            });
            usage.fail(msg);
        }
    };
    let conflicting = {
    };
    self.conflicts = function conflicts(key, value) {
        argsert('<string|object> [array|string]', [
            key,
            value
        ], arguments.length);
        if (typeof key === 'object') {
            Object.keys(key).forEach((k)=>{
                self.conflicts(k, key[k]);
            });
        } else {
            yargs.global(key);
            if (!conflicting[key]) {
                conflicting[key] = [];
            }
            if (Array.isArray(value)) {
                value.forEach((i)=>self.conflicts(key, i)
                );
            } else {
                conflicting[key].push(value);
            }
        }
    };
    self.getConflicting = ()=>conflicting
    ;
    self.conflicting = function conflictingFn(argv) {
        Object.keys(argv).forEach((key)=>{
            if (conflicting[key]) {
                conflicting[key].forEach((value)=>{
                    if (value && argv[key] !== undefined && argv[value] !== undefined) {
                        usage.fail(__('Arguments %s and %s are mutually exclusive', key, value));
                    }
                });
            }
        });
    };
    self.recommendCommands = function recommendCommands(cmd, potentialCommands) {
        const threshold = 3;
        potentialCommands = potentialCommands.sort((a, b)=>b.length - a.length
        );
        let recommended = null;
        let bestDistance = Infinity;
        for(let i = 0, candidate; (candidate = potentialCommands[i]) !== undefined; i++){
            const d = levenshtein(cmd, candidate);
            if (d <= threshold && d < bestDistance) {
                bestDistance = d;
                recommended = candidate;
            }
        }
        if (recommended) usage.fail(__('Did you mean %s?', recommended));
    };
    self.reset = function reset(localLookup) {
        implied = objFilter(implied, (k)=>!localLookup[k]
        );
        conflicting = objFilter(conflicting, (k)=>!localLookup[k]
        );
        return self;
    };
    const frozens = [];
    self.freeze = function freeze() {
        frozens.push({
            implied,
            conflicting
        });
    };
    self.unfreeze = function unfreeze() {
        const frozen = frozens.pop();
        assertNotStrictEqual(frozen, undefined, shim);
        ({ implied , conflicting  } = frozen);
    };
    return self;
}
let previouslyVisitedConfigs = [];
let shim1;
function applyExtends(config, cwd, mergeExtends, _shim) {
    shim1 = _shim;
    let defaultConfig = {
    };
    if (Object.prototype.hasOwnProperty.call(config, 'extends')) {
        if (typeof config.extends !== 'string') return defaultConfig;
        const isPath = /\.json|\..*rc$/.test(config.extends);
        let pathToDefault = null;
        if (!isPath) {
            try {
                pathToDefault = require.resolve(config.extends);
            } catch (_err) {
                return config;
            }
        } else {
            pathToDefault = getPathToDefaultConfig(cwd, config.extends);
        }
        checkForCircularExtends(pathToDefault);
        previouslyVisitedConfigs.push(pathToDefault);
        defaultConfig = isPath ? JSON.parse(shim1.readFileSync(pathToDefault, 'utf8')) : require(config.extends);
        delete config.extends;
        defaultConfig = applyExtends(defaultConfig, shim1.path.dirname(pathToDefault), mergeExtends, shim1);
    }
    previouslyVisitedConfigs = [];
    return mergeExtends ? mergeDeep(defaultConfig, config) : Object.assign({
    }, defaultConfig, config);
}
function checkForCircularExtends(cfgPath) {
    if (previouslyVisitedConfigs.indexOf(cfgPath) > -1) {
        throw new YError(`Circular extended configurations: '${cfgPath}'.`);
    }
}
function getPathToDefaultConfig(cwd, pathToExtend) {
    return shim1.path.resolve(cwd, pathToExtend);
}
function mergeDeep(config1, config2) {
    const target = {
    };
    function isObject(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
    }
    Object.assign(target, config1);
    for (const key of Object.keys(config2)){
        if (isObject(config2[key]) && isObject(target[key])) {
            target[key] = mergeDeep(config1[key], config2[key]);
        } else {
            target[key] = config2[key];
        }
    }
    return target;
}
var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
const DEFAULT_MARKER = /(^\*)|(^\$0)/;
var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _command, _cwd, _context, _completion, _completionCommand, _defaultShowHiddenOpt, _exitError, _detectLocale, _exitProcess, _frozens, _globalMiddleware, _groups, _hasOutput, _helpOpt, _logger, _output, _options, _parentRequire, _parserConfig, _parseFn_1, _parseContext, _pkgs, _preservedGroups, _processArgs, _recommendCommands, _shim_1, _strict, _strictCommands, _strictOptions, _usage, _versionOpt, _validation;
function YargsFactory(_shim) {
    return (processArgs = [], cwd = _shim.process.cwd(), parentRequire)=>{
        const yargs = new YargsInstance(processArgs, cwd, parentRequire, _shim);
        Object.defineProperty(yargs, 'argv', {
            get: ()=>{
                return yargs.parse();
            },
            enumerable: true
        });
        yargs.help();
        yargs.version();
        return yargs;
    };
}
const kCopyDoubleDash = Symbol('copyDoubleDash');
const kCreateLogger = Symbol('copyDoubleDash');
const kDeleteFromParserHintObject = Symbol('deleteFromParserHintObject');
const kFreeze = Symbol('freeze');
const kGetDollarZero = Symbol('getDollarZero');
const kGetParserConfiguration = Symbol('getParserConfiguration');
const kGuessLocale = Symbol('guessLocale');
const kGuessVersion = Symbol('guessVersion');
const kParsePositionalNumbers = Symbol('parsePositionalNumbers');
const kPkgUp = Symbol('pkgUp');
const kPopulateParserHintArray = Symbol('populateParserHintArray');
const kPopulateParserHintSingleValueDictionary = Symbol('populateParserHintSingleValueDictionary');
const kPopulateParserHintArrayDictionary = Symbol('populateParserHintArrayDictionary');
const kPopulateParserHintDictionary = Symbol('populateParserHintDictionary');
const kSanitizeKey = Symbol('sanitizeKey');
const kSetKey = Symbol('setKey');
const kUnfreeze = Symbol('unfreeze');
const kValidateAsync = Symbol('validateAsync');
const kGetCommandInstance = Symbol('getCommandInstance');
const kGetContext = Symbol('getContext');
const kGetHasOutput = Symbol('getHasOutput');
const kGetLoggerInstance = Symbol('getLoggerInstance');
const kGetParseContext = Symbol('getParseContext');
const kGetUsageInstance = Symbol('getUsageInstance');
const kGetValidationInstance = Symbol('getValidationInstance');
const kHasParseCallback = Symbol('hasParseCallback');
const kPostProcess = Symbol('postProcess');
const kRebase = Symbol('rebase');
const kReset = Symbol('reset');
const kRunYargsParserAndExecuteCommands = Symbol('runYargsParserAndExecuteCommands');
const kRunValidation = Symbol('runValidation');
const kSetHasOutput = Symbol('setHasOutput');
function isYargsInstance(y) {
    return !!y && typeof y.getInternalMethods === 'function';
}
class CommandInstance {
    constructor(usage1, validation1, globalMiddleware, shim2){
        this.requireCache = new Set();
        this.handlers = {
        };
        this.aliasMap = {
        };
        this.frozens = [];
        this.shim = shim2;
        this.usage = usage1;
        this.globalMiddleware = globalMiddleware;
        this.validation = validation1;
    }
    addDirectory(dir, req, callerFile, opts) {
        opts = opts || {
        };
        if (typeof opts.recurse !== 'boolean') opts.recurse = false;
        if (!Array.isArray(opts.extensions)) opts.extensions = [
            'js'
        ];
        const parentVisit = typeof opts.visit === 'function' ? opts.visit : (o)=>o
        ;
        opts.visit = (obj, joined, filename)=>{
            const visited = parentVisit(obj, joined, filename);
            if (visited) {
                if (this.requireCache.has(joined)) return visited;
                else this.requireCache.add(joined);
                this.addHandler(visited);
            }
            return visited;
        };
        this.shim.requireDirectory({
            require: req,
            filename: callerFile
        }, dir, opts);
    }
    addHandler(cmd, description, builder, handler, commandMiddleware, deprecated) {
        let aliases = [];
        const middlewares = commandMiddlewareFactory(commandMiddleware);
        handler = handler || (()=>{
        });
        if (Array.isArray(cmd)) {
            if (isCommandAndAliases(cmd)) {
                [cmd, ...aliases] = cmd;
            } else {
                for (const command of cmd){
                    this.addHandler(command);
                }
            }
        } else if (isCommandHandlerDefinition(cmd)) {
            let command = Array.isArray(cmd.command) || typeof cmd.command === 'string' ? cmd.command : this.moduleName(cmd);
            if (cmd.aliases) command = [].concat(command).concat(cmd.aliases);
            this.addHandler(command, this.extractDesc(cmd), cmd.builder, cmd.handler, cmd.middlewares, cmd.deprecated);
            return;
        } else if (isCommandBuilderDefinition(builder)) {
            this.addHandler([
                cmd
            ].concat(aliases), description, builder.builder, builder.handler, builder.middlewares, builder.deprecated);
            return;
        }
        if (typeof cmd === 'string') {
            const parsedCommand = parseCommand(cmd);
            aliases = aliases.map((alias)=>parseCommand(alias).cmd
            );
            let isDefault = false;
            const parsedAliases = [
                parsedCommand.cmd
            ].concat(aliases).filter((c)=>{
                if (DEFAULT_MARKER.test(c)) {
                    isDefault = true;
                    return false;
                }
                return true;
            });
            if (parsedAliases.length === 0 && isDefault) parsedAliases.push('$0');
            if (isDefault) {
                parsedCommand.cmd = parsedAliases[0];
                aliases = parsedAliases.slice(1);
                cmd = cmd.replace(DEFAULT_MARKER, parsedCommand.cmd);
            }
            aliases.forEach((alias)=>{
                this.aliasMap[alias] = parsedCommand.cmd;
            });
            if (description !== false) {
                this.usage.command(cmd, description, isDefault, aliases, deprecated);
            }
            this.handlers[parsedCommand.cmd] = {
                original: cmd,
                description,
                handler,
                builder: builder || {
                },
                middlewares,
                deprecated,
                demanded: parsedCommand.demanded,
                optional: parsedCommand.optional
            };
            if (isDefault) this.defaultCommand = this.handlers[parsedCommand.cmd];
        }
    }
    getCommandHandlers() {
        return this.handlers;
    }
    getCommands() {
        return Object.keys(this.handlers).concat(Object.keys(this.aliasMap));
    }
    hasDefaultCommand() {
        return !!this.defaultCommand;
    }
    runCommand(command, yargs, parsed, commandIndex, helpOnly, helpOrVersionSet) {
        const commandHandler = this.handlers[command] || this.handlers[this.aliasMap[command]] || this.defaultCommand;
        const currentContext = yargs.getInternalMethods().getContext();
        const parentCommands = currentContext.commands.slice();
        const isDefaultCommand = !command;
        if (command) {
            currentContext.commands.push(command);
            currentContext.fullCommands.push(commandHandler.original);
        }
        const builderResult = this.applyBuilderUpdateUsageAndParse(isDefaultCommand, commandHandler, yargs, parsed.aliases, parentCommands, commandIndex, helpOnly, helpOrVersionSet);
        if (isPromise(builderResult)) {
            return builderResult.then((result)=>{
                return this.applyMiddlewareAndGetResult(isDefaultCommand, commandHandler, result.innerArgv, currentContext, helpOnly, result.aliases, yargs);
            });
        } else {
            return this.applyMiddlewareAndGetResult(isDefaultCommand, commandHandler, builderResult.innerArgv, currentContext, helpOnly, builderResult.aliases, yargs);
        }
    }
    applyBuilderUpdateUsageAndParse(isDefaultCommand, commandHandler, yargs, aliases, parentCommands, commandIndex, helpOnly, helpOrVersionSet) {
        const builder = commandHandler.builder;
        let innerYargs = yargs;
        if (isCommandBuilderCallback(builder)) {
            const builderOutput = builder(yargs.getInternalMethods().reset(aliases), helpOrVersionSet);
            if (isPromise(builderOutput)) {
                return builderOutput.then((output)=>{
                    innerYargs = isYargsInstance(output) ? output : yargs;
                    return this.parseAndUpdateUsage(isDefaultCommand, commandHandler, innerYargs, parentCommands, commandIndex, helpOnly);
                });
            }
        } else if (isCommandBuilderOptionDefinitions(builder)) {
            innerYargs = yargs.getInternalMethods().reset(aliases);
            Object.keys(commandHandler.builder).forEach((key)=>{
                innerYargs.option(key, builder[key]);
            });
        }
        return this.parseAndUpdateUsage(isDefaultCommand, commandHandler, innerYargs, parentCommands, commandIndex, helpOnly);
    }
    parseAndUpdateUsage(isDefaultCommand, commandHandler, innerYargs, parentCommands, commandIndex, helpOnly) {
        if (isDefaultCommand) innerYargs.getInternalMethods().getUsageInstance().unfreeze();
        if (this.shouldUpdateUsage(innerYargs)) {
            innerYargs.getInternalMethods().getUsageInstance().usage(this.usageFromParentCommandsCommandHandler(parentCommands, commandHandler), commandHandler.description);
        }
        const innerArgv = innerYargs.getInternalMethods().runYargsParserAndExecuteCommands(null, undefined, true, commandIndex, helpOnly);
        if (isPromise(innerArgv)) {
            return innerArgv.then((argv)=>{
                return {
                    aliases: innerYargs.parsed.aliases,
                    innerArgv: argv
                };
            });
        } else {
            return {
                aliases: innerYargs.parsed.aliases,
                innerArgv: innerArgv
            };
        }
    }
    shouldUpdateUsage(yargs) {
        return !yargs.getInternalMethods().getUsageInstance().getUsageDisabled() && yargs.getInternalMethods().getUsageInstance().getUsage().length === 0;
    }
    usageFromParentCommandsCommandHandler(parentCommands, commandHandler) {
        const c = DEFAULT_MARKER.test(commandHandler.original) ? commandHandler.original.replace(DEFAULT_MARKER, '').trim() : commandHandler.original;
        const pc = parentCommands.filter((c)=>{
            return !DEFAULT_MARKER.test(c);
        });
        pc.push(c);
        return `$0 ${pc.join(' ')}`;
    }
    applyMiddlewareAndGetResult(isDefaultCommand, commandHandler, innerArgv, currentContext, helpOnly, aliases, yargs) {
        let positionalMap = {
        };
        if (helpOnly) return innerArgv;
        if (!yargs.getInternalMethods().getHasOutput()) {
            positionalMap = this.populatePositionals(commandHandler, innerArgv, currentContext, yargs);
        }
        const middlewares = this.globalMiddleware.getMiddleware().slice(0).concat(commandHandler.middlewares);
        innerArgv = applyMiddleware(innerArgv, yargs, middlewares, true);
        if (!yargs.getInternalMethods().getHasOutput()) {
            const validation = yargs.getInternalMethods().runValidation(aliases, positionalMap, yargs.parsed.error, isDefaultCommand);
            innerArgv = maybeAsyncResult(innerArgv, (result)=>{
                validation(result);
                return result;
            });
        }
        if (commandHandler.handler && !yargs.getInternalMethods().getHasOutput()) {
            yargs.getInternalMethods().setHasOutput();
            const populateDoubleDash = !!yargs.getOptions().configuration['populate--'];
            yargs.getInternalMethods().postProcess(innerArgv, populateDoubleDash, false, false);
            innerArgv = applyMiddleware(innerArgv, yargs, middlewares, false);
            innerArgv = maybeAsyncResult(innerArgv, (result)=>{
                const handlerResult = commandHandler.handler(result);
                if (isPromise(handlerResult)) {
                    return handlerResult.then(()=>result
                    );
                } else {
                    return result;
                }
            });
            if (!isDefaultCommand) {
                yargs.getInternalMethods().getUsageInstance().cacheHelpMessage();
            }
            if (isPromise(innerArgv) && !yargs.getInternalMethods().hasParseCallback()) {
                innerArgv.catch((error)=>{
                    try {
                        yargs.getInternalMethods().getUsageInstance().fail(null, error);
                    } catch (_err) {
                    }
                });
            }
        }
        if (!isDefaultCommand) {
            currentContext.commands.pop();
            currentContext.fullCommands.pop();
        }
        return innerArgv;
    }
    populatePositionals(commandHandler, argv, context, yargs) {
        argv._ = argv._.slice(context.commands.length);
        const demanded = commandHandler.demanded.slice(0);
        const optional = commandHandler.optional.slice(0);
        const positionalMap = {
        };
        this.validation.positionalCount(demanded.length, argv._.length);
        while(demanded.length){
            const demand = demanded.shift();
            this.populatePositional(demand, argv, positionalMap);
        }
        while(optional.length){
            const maybe = optional.shift();
            this.populatePositional(maybe, argv, positionalMap);
        }
        argv._ = context.commands.concat(argv._.map((a)=>'' + a
        ));
        this.postProcessPositionals(argv, positionalMap, this.cmdToParseOptions(commandHandler.original), yargs);
        return positionalMap;
    }
    populatePositional(positional, argv, positionalMap) {
        const cmd = positional.cmd[0];
        if (positional.variadic) {
            positionalMap[cmd] = argv._.splice(0).map(String);
        } else {
            if (argv._.length) positionalMap[cmd] = [
                String(argv._.shift())
            ];
        }
    }
    cmdToParseOptions(cmdString) {
        const parseOptions = {
            array: [],
            default: {
            },
            alias: {
            },
            demand: {
            }
        };
        const parsed = parseCommand(cmdString);
        parsed.demanded.forEach((d)=>{
            const [cmd, ...aliases] = d.cmd;
            if (d.variadic) {
                parseOptions.array.push(cmd);
                parseOptions.default[cmd] = [];
            }
            parseOptions.alias[cmd] = aliases;
            parseOptions.demand[cmd] = true;
        });
        parsed.optional.forEach((o)=>{
            const [cmd, ...aliases] = o.cmd;
            if (o.variadic) {
                parseOptions.array.push(cmd);
                parseOptions.default[cmd] = [];
            }
            parseOptions.alias[cmd] = aliases;
        });
        return parseOptions;
    }
    postProcessPositionals(argv, positionalMap, parseOptions, yargs) {
        const options = Object.assign({
        }, yargs.getOptions());
        options.default = Object.assign(parseOptions.default, options.default);
        for (const key of Object.keys(parseOptions.alias)){
            options.alias[key] = (options.alias[key] || []).concat(parseOptions.alias[key]);
        }
        options.array = options.array.concat(parseOptions.array);
        options.config = {
        };
        const unparsed = [];
        Object.keys(positionalMap).forEach((key)=>{
            positionalMap[key].map((value)=>{
                if (options.configuration['unknown-options-as-args']) options.key[key] = true;
                unparsed.push(`--${key}`);
                unparsed.push(value);
            });
        });
        if (!unparsed.length) return;
        const config = Object.assign({
        }, options.configuration, {
            'populate--': false
        });
        const parsed = this.shim.Parser.detailed(unparsed, Object.assign({
        }, options, {
            configuration: config
        }));
        if (parsed.error) {
            yargs.getInternalMethods().getUsageInstance().fail(parsed.error.message, parsed.error);
        } else {
            const positionalKeys = Object.keys(positionalMap);
            Object.keys(positionalMap).forEach((key)=>{
                positionalKeys.push(...parsed.aliases[key]);
            });
            Object.keys(parsed.argv).forEach((key)=>{
                if (positionalKeys.indexOf(key) !== -1) {
                    if (!positionalMap[key]) positionalMap[key] = parsed.argv[key];
                    argv[key] = parsed.argv[key];
                }
            });
        }
    }
    runDefaultBuilderOn(yargs) {
        if (!this.defaultCommand) return;
        if (this.shouldUpdateUsage(yargs)) {
            const commandString = DEFAULT_MARKER.test(this.defaultCommand.original) ? this.defaultCommand.original : this.defaultCommand.original.replace(/^[^[\]<>]*/, '$0 ');
            yargs.getInternalMethods().getUsageInstance().usage(commandString, this.defaultCommand.description);
        }
        const builder = this.defaultCommand.builder;
        if (isCommandBuilderCallback(builder)) {
            return builder(yargs, true);
        } else if (!isCommandBuilderDefinition(builder)) {
            Object.keys(builder).forEach((key)=>{
                yargs.option(key, builder[key]);
            });
        }
        return undefined;
    }
    moduleName(obj) {
        const mod = whichModule(obj);
        if (!mod) throw new Error(`No command name given for module: ${this.shim.inspect(obj)}`);
        return this.commandFromFilename(mod.filename);
    }
    commandFromFilename(filename) {
        return this.shim.path.basename(filename, this.shim.path.extname(filename));
    }
    extractDesc({ describe , description , desc  }) {
        for (const test of [
            describe,
            description,
            desc
        ]){
            if (typeof test === 'string' || test === false) return test;
            assertNotStrictEqual(test, true, this.shim);
        }
        return false;
    }
    freeze() {
        this.frozens.push({
            handlers: this.handlers,
            aliasMap: this.aliasMap,
            defaultCommand: this.defaultCommand
        });
    }
    unfreeze() {
        const frozen = this.frozens.pop();
        assertNotStrictEqual(frozen, undefined, this.shim);
        ({ handlers: this.handlers , aliasMap: this.aliasMap , defaultCommand: this.defaultCommand ,  } = frozen);
    }
    reset() {
        this.handlers = {
        };
        this.aliasMap = {
        };
        this.defaultCommand = undefined;
        this.requireCache = new Set();
        return this;
    }
}
function command(usage, validation, globalMiddleware, shim) {
    return new CommandInstance(usage, validation, globalMiddleware, shim);
}
function isCommandBuilderDefinition(builder) {
    return typeof builder === 'object' && !!builder.builder && typeof builder.handler === 'function';
}
function isCommandAndAliases(cmd) {
    return cmd.every((c)=>typeof c === 'string'
    );
}
function isCommandBuilderCallback(builder) {
    return typeof builder === 'function';
}
class Completion {
    constructor(yargs1, usage2, command1, shim3){
        var _a1, _b, _c;
        this.yargs = yargs1;
        this.usage = usage2;
        this.command = command1;
        this.shim = shim3;
        this.completionKey = 'get-yargs-completions';
        this.aliases = null;
        this.customCompletionFunction = null;
        this.zshShell = (_c = ((_a1 = this.shim.getEnv('SHELL')) === null || _a1 === void 0 ? void 0 : _a1.includes('zsh')) || ((_b = this.shim.getEnv('ZSH_NAME')) === null || _b === void 0 ? void 0 : _b.includes('zsh'))) !== null && _c !== void 0 ? _c : false;
    }
    defaultCompletion(args, argv, current, done) {
        const handlers = this.command.getCommandHandlers();
        for(let i = 0, ii = args.length; i < ii; ++i){
            if (handlers[args[i]] && handlers[args[i]].builder) {
                const builder = handlers[args[i]].builder;
                if (isCommandBuilderCallback(builder)) {
                    const y = this.yargs.getInternalMethods().reset();
                    builder(y, true);
                    return y.argv;
                }
            }
        }
        const completions = [];
        this.commandCompletions(completions, args, current);
        this.optionCompletions(completions, args, argv, current);
        done(null, completions);
    }
    commandCompletions(completions, args, current) {
        const parentCommands = this.yargs.getInternalMethods().getContext().commands;
        if (!current.match(/^-/) && parentCommands[parentCommands.length - 1] !== current) {
            this.usage.getCommands().forEach((usageCommand)=>{
                const commandName = parseCommand(usageCommand[0]).cmd;
                if (args.indexOf(commandName) === -1) {
                    if (!this.zshShell) {
                        completions.push(commandName);
                    } else {
                        const desc = usageCommand[1] || '';
                        completions.push(commandName.replace(/:/g, '\\:') + ':' + desc);
                    }
                }
            });
        }
    }
    optionCompletions(completions, args, argv, current) {
        if (current.match(/^-/) || current === '' && completions.length === 0) {
            const options = this.yargs.getOptions();
            const positionalKeys = this.yargs.getGroups()[this.usage.getPositionalGroupName()] || [];
            Object.keys(options.key).forEach((key)=>{
                const negable = !!options.configuration['boolean-negation'] && options.boolean.includes(key);
                const isPositionalKey = positionalKeys.includes(key);
                if (!isPositionalKey && !this.argsContainKey(args, argv, key, negable)) {
                    this.completeOptionKey(key, completions, current);
                    if (negable && !!options.default[key]) this.completeOptionKey(`no-${key}`, completions, current);
                }
            });
        }
    }
    argsContainKey(args, argv, key, negable) {
        if (args.indexOf(`--${key}`) !== -1) return true;
        if (negable && args.indexOf(`--no-${key}`) !== -1) return true;
        if (this.aliases) {
            for (const alias of this.aliases[key]){
                if (argv[alias] !== undefined) return true;
            }
        }
        return false;
    }
    completeOptionKey(key, completions, current) {
        const descs = this.usage.getDescriptions();
        const startsByTwoDashes = (s)=>/^--/.test(s)
        ;
        const isShortOption = (s)=>/^[^0-9]$/.test(s)
        ;
        const dashes = !startsByTwoDashes(current) && isShortOption(key) ? '-' : '--';
        if (!this.zshShell) {
            completions.push(dashes + key);
        } else {
            const desc = descs[key] || '';
            completions.push(dashes + `${key.replace(/:/g, '\\:')}:${desc.replace('__yargsString__:', '')}`);
        }
    }
    customCompletion(args, argv, current, done) {
        assertNotStrictEqual(this.customCompletionFunction, null, this.shim);
        if (isSyncCompletionFunction(this.customCompletionFunction)) {
            const result = this.customCompletionFunction(current, argv);
            if (isPromise(result)) {
                return result.then((list)=>{
                    this.shim.process.nextTick(()=>{
                        done(null, list);
                    });
                }).catch((err)=>{
                    this.shim.process.nextTick(()=>{
                        done(err, undefined);
                    });
                });
            }
            return done(null, result);
        } else if (isFallbackCompletionFunction(this.customCompletionFunction)) {
            return this.customCompletionFunction(current, argv, (onCompleted = done)=>this.defaultCompletion(args, argv, current, onCompleted)
            , (completions)=>{
                done(null, completions);
            });
        } else {
            return this.customCompletionFunction(current, argv, (completions)=>{
                done(null, completions);
            });
        }
    }
    getCompletion(args, done) {
        const current = args.length ? args[args.length - 1] : '';
        const argv = this.yargs.parse(args, true);
        const completionFunction = this.customCompletionFunction ? (argv)=>this.customCompletion(args, argv, current, done)
         : (argv)=>this.defaultCompletion(args, argv, current, done)
        ;
        return isPromise(argv) ? argv.then(completionFunction) : completionFunction(argv);
    }
    generateCompletionScript($0, cmd) {
        let script = this.zshShell ? completionZshTemplate : completionShTemplate;
        const name = this.shim.path.basename($0);
        if ($0.match(/\.js$/)) $0 = `./${$0}`;
        script = script.replace(/{{app_name}}/g, name);
        script = script.replace(/{{completion_command}}/g, cmd);
        return script.replace(/{{app_path}}/g, $0);
    }
    registerFunction(fn) {
        this.customCompletionFunction = fn;
    }
    setParsed(parsed) {
        this.aliases = parsed.aliases;
    }
}
function completion(yargs, usage, command, shim) {
    return new Completion(yargs, usage, command, shim);
}
class YargsInstance {
    constructor(processArgs = [], cwd1, parentRequire, shim4){
        this.customScriptName = false;
        this.parsed = false;
        _command.set(this, void 0);
        _cwd.set(this, void 0);
        _context.set(this, {
            commands: [],
            fullCommands: []
        });
        _completion.set(this, null);
        _completionCommand.set(this, null);
        _defaultShowHiddenOpt.set(this, 'show-hidden');
        _exitError.set(this, null);
        _detectLocale.set(this, true);
        _exitProcess.set(this, true);
        _frozens.set(this, []);
        _globalMiddleware.set(this, void 0);
        _groups.set(this, {
        });
        _hasOutput.set(this, false);
        _helpOpt.set(this, null);
        _logger.set(this, void 0);
        _output.set(this, '');
        _options.set(this, void 0);
        _parentRequire.set(this, void 0);
        _parserConfig.set(this, {
        });
        _parseFn_1.set(this, null);
        _parseContext.set(this, null);
        _pkgs.set(this, {
        });
        _preservedGroups.set(this, {
        });
        _processArgs.set(this, void 0);
        _recommendCommands.set(this, false);
        _shim_1.set(this, void 0);
        _strict.set(this, false);
        _strictCommands.set(this, false);
        _strictOptions.set(this, false);
        _usage.set(this, void 0);
        _versionOpt.set(this, null);
        _validation.set(this, void 0);
        __classPrivateFieldSet(this, _shim_1, shim4);
        __classPrivateFieldSet(this, _processArgs, processArgs);
        __classPrivateFieldSet(this, _cwd, cwd1);
        __classPrivateFieldSet(this, _parentRequire, parentRequire);
        __classPrivateFieldSet(this, _globalMiddleware, new GlobalMiddleware(this));
        this.$0 = this[kGetDollarZero]();
        this[kReset]();
        __classPrivateFieldSet(this, _command, __classPrivateFieldGet(this, _command));
        __classPrivateFieldSet(this, _usage, __classPrivateFieldGet(this, _usage));
        __classPrivateFieldSet(this, _validation, __classPrivateFieldGet(this, _validation));
        __classPrivateFieldSet(this, _options, __classPrivateFieldGet(this, _options));
        __classPrivateFieldGet(this, _options).showHiddenOpt = __classPrivateFieldGet(this, _defaultShowHiddenOpt);
        __classPrivateFieldSet(this, _logger, this[kCreateLogger]());
    }
    addHelpOpt(opt, msg) {
        const defaultHelpOpt = 'help';
        argsert('[string|boolean] [string]', [
            opt,
            msg
        ], arguments.length);
        if (__classPrivateFieldGet(this, _helpOpt)) {
            this[kDeleteFromParserHintObject](__classPrivateFieldGet(this, _helpOpt));
            __classPrivateFieldSet(this, _helpOpt, null);
        }
        if (opt === false && msg === undefined) return this;
        __classPrivateFieldSet(this, _helpOpt, typeof opt === 'string' ? opt : defaultHelpOpt);
        this.boolean(__classPrivateFieldGet(this, _helpOpt));
        this.describe(__classPrivateFieldGet(this, _helpOpt), msg || __classPrivateFieldGet(this, _usage).deferY18nLookup('Show help'));
        return this;
    }
    help(opt, msg) {
        return this.addHelpOpt(opt, msg);
    }
    addShowHiddenOpt(opt, msg) {
        argsert('[string|boolean] [string]', [
            opt,
            msg
        ], arguments.length);
        if (opt === false && msg === undefined) return this;
        const showHiddenOpt = typeof opt === 'string' ? opt : __classPrivateFieldGet(this, _defaultShowHiddenOpt);
        this.boolean(showHiddenOpt);
        this.describe(showHiddenOpt, msg || __classPrivateFieldGet(this, _usage).deferY18nLookup('Show hidden options'));
        __classPrivateFieldGet(this, _options).showHiddenOpt = showHiddenOpt;
        return this;
    }
    showHidden(opt, msg) {
        return this.addShowHiddenOpt(opt, msg);
    }
    alias(key, value) {
        argsert('<object|string|array> [string|array]', [
            key,
            value
        ], arguments.length);
        this[kPopulateParserHintArrayDictionary](this.alias.bind(this), 'alias', key, value);
        return this;
    }
    array(keys) {
        argsert('<array|string>', [
            keys
        ], arguments.length);
        this[kPopulateParserHintArray]('array', keys);
        return this;
    }
    boolean(keys) {
        argsert('<array|string>', [
            keys
        ], arguments.length);
        this[kPopulateParserHintArray]('boolean', keys);
        return this;
    }
    check(f, global) {
        argsert('<function> [boolean]', [
            f,
            global
        ], arguments.length);
        this.middleware((argv, _yargs)=>{
            return maybeAsyncResult(()=>{
                return f(argv);
            }, (result)=>{
                if (!result) {
                    __classPrivateFieldGet(this, _usage).fail(__classPrivateFieldGet(this, _shim_1).y18n.__('Argument check failed: %s', f.toString()));
                } else if (typeof result === 'string' || result instanceof Error) {
                    __classPrivateFieldGet(this, _usage).fail(result.toString(), result);
                }
                return argv;
            }, (err)=>{
                __classPrivateFieldGet(this, _usage).fail(err.message ? err.message : err.toString(), err);
                return argv;
            });
        }, false, global);
        return this;
    }
    choices(key, value) {
        argsert('<object|string|array> [string|array]', [
            key,
            value
        ], arguments.length);
        this[kPopulateParserHintArrayDictionary](this.choices.bind(this), 'choices', key, value);
        return this;
    }
    coerce(keys, value) {
        argsert('<object|string|array> [function]', [
            keys,
            value
        ], arguments.length);
        if (Array.isArray(keys)) {
            if (!value) {
                throw new YError('coerce callback must be provided');
            }
            for (const key of keys){
                this.coerce(key, value);
            }
            return this;
        } else if (typeof keys === 'object') {
            for (const key of Object.keys(keys)){
                this.coerce(key, keys[key]);
            }
            return this;
        }
        if (!value) {
            throw new YError('coerce callback must be provided');
        }
        __classPrivateFieldGet(this, _options).key[keys] = true;
        __classPrivateFieldGet(this, _globalMiddleware).addCoerceMiddleware((argv, yargs)=>{
            let aliases;
            return maybeAsyncResult(()=>{
                aliases = yargs.getAliases();
                return value(argv[keys]);
            }, (result)=>{
                argv[keys] = result;
                if (aliases[keys]) {
                    for (const alias of aliases[keys]){
                        argv[alias] = result;
                    }
                }
                return argv;
            }, (err)=>{
                throw new YError(err.message);
            });
        }, keys);
        return this;
    }
    conflicts(key1, key2) {
        argsert('<string|object> [string|array]', [
            key1,
            key2
        ], arguments.length);
        __classPrivateFieldGet(this, _validation).conflicts(key1, key2);
        return this;
    }
    config(key = 'config', msg, parseFn) {
        argsert('[object|string] [string|function] [function]', [
            key,
            msg,
            parseFn
        ], arguments.length);
        if (typeof key === 'object' && !Array.isArray(key)) {
            key = applyExtends(key, __classPrivateFieldGet(this, _cwd), this[kGetParserConfiguration]()['deep-merge-config'] || false, __classPrivateFieldGet(this, _shim_1));
            __classPrivateFieldGet(this, _options).configObjects = (__classPrivateFieldGet(this, _options).configObjects || []).concat(key);
            return this;
        }
        if (typeof msg === 'function') {
            parseFn = msg;
            msg = undefined;
        }
        this.describe(key, msg || __classPrivateFieldGet(this, _usage).deferY18nLookup('Path to JSON config file'));
        (Array.isArray(key) ? key : [
            key
        ]).forEach((k)=>{
            __classPrivateFieldGet(this, _options).config[k] = parseFn || true;
        });
        return this;
    }
    completion(cmd, desc, fn) {
        argsert('[string] [string|boolean|function] [function]', [
            cmd,
            desc,
            fn
        ], arguments.length);
        if (typeof desc === 'function') {
            fn = desc;
            desc = undefined;
        }
        __classPrivateFieldSet(this, _completionCommand, cmd || __classPrivateFieldGet(this, _completionCommand) || 'completion');
        if (!desc && desc !== false) {
            desc = 'generate completion script';
        }
        this.command(__classPrivateFieldGet(this, _completionCommand), desc);
        if (fn) __classPrivateFieldGet(this, _completion).registerFunction(fn);
        return this;
    }
    command(cmd, description, builder, handler, middlewares, deprecated) {
        argsert('<string|array|object> [string|boolean] [function|object] [function] [array] [boolean|string]', [
            cmd,
            description,
            builder,
            handler,
            middlewares,
            deprecated
        ], arguments.length);
        __classPrivateFieldGet(this, _command).addHandler(cmd, description, builder, handler, middlewares, deprecated);
        return this;
    }
    commands(cmd, description, builder, handler, middlewares, deprecated) {
        return this.command(cmd, description, builder, handler, middlewares, deprecated);
    }
    commandDir(dir, opts) {
        argsert('<string> [object]', [
            dir,
            opts
        ], arguments.length);
        const req = __classPrivateFieldGet(this, _parentRequire) || __classPrivateFieldGet(this, _shim_1).require;
        __classPrivateFieldGet(this, _command).addDirectory(dir, req, __classPrivateFieldGet(this, _shim_1).getCallerFile(), opts);
        return this;
    }
    count(keys) {
        argsert('<array|string>', [
            keys
        ], arguments.length);
        this[kPopulateParserHintArray]('count', keys);
        return this;
    }
    default(key, value, defaultDescription) {
        argsert('<object|string|array> [*] [string]', [
            key,
            value,
            defaultDescription
        ], arguments.length);
        if (defaultDescription) {
            assertSingleKey(key, __classPrivateFieldGet(this, _shim_1));
            __classPrivateFieldGet(this, _options).defaultDescription[key] = defaultDescription;
        }
        if (typeof value === 'function') {
            assertSingleKey(key, __classPrivateFieldGet(this, _shim_1));
            if (!__classPrivateFieldGet(this, _options).defaultDescription[key]) __classPrivateFieldGet(this, _options).defaultDescription[key] = __classPrivateFieldGet(this, _usage).functionDescription(value);
            value = value.call();
        }
        this[kPopulateParserHintSingleValueDictionary](this.default.bind(this), 'default', key, value);
        return this;
    }
    defaults(key, value, defaultDescription) {
        return this.default(key, value, defaultDescription);
    }
    demandCommand(min = 1, max, minMsg, maxMsg) {
        argsert('[number] [number|string] [string|null|undefined] [string|null|undefined]', [
            min,
            max,
            minMsg,
            maxMsg
        ], arguments.length);
        if (typeof max !== 'number') {
            minMsg = max;
            max = Infinity;
        }
        this.global('_', false);
        __classPrivateFieldGet(this, _options).demandedCommands._ = {
            min,
            max,
            minMsg,
            maxMsg
        };
        return this;
    }
    demand(keys, max, msg) {
        if (Array.isArray(max)) {
            max.forEach((key)=>{
                assertNotStrictEqual(msg, true, __classPrivateFieldGet(this, _shim_1));
                this.demandOption(key, msg);
            });
            max = Infinity;
        } else if (typeof max !== 'number') {
            msg = max;
            max = Infinity;
        }
        if (typeof keys === 'number') {
            assertNotStrictEqual(msg, true, __classPrivateFieldGet(this, _shim_1));
            this.demandCommand(keys, max, msg, msg);
        } else if (Array.isArray(keys)) {
            keys.forEach((key)=>{
                assertNotStrictEqual(msg, true, __classPrivateFieldGet(this, _shim_1));
                this.demandOption(key, msg);
            });
        } else {
            if (typeof msg === 'string') {
                this.demandOption(keys, msg);
            } else if (msg === true || typeof msg === 'undefined') {
                this.demandOption(keys);
            }
        }
        return this;
    }
    demandOption(keys, msg) {
        argsert('<object|string|array> [string]', [
            keys,
            msg
        ], arguments.length);
        this[kPopulateParserHintSingleValueDictionary](this.demandOption.bind(this), 'demandedOptions', keys, msg);
        return this;
    }
    deprecateOption(option, message) {
        argsert('<string> [string|boolean]', [
            option,
            message
        ], arguments.length);
        __classPrivateFieldGet(this, _options).deprecatedOptions[option] = message;
        return this;
    }
    describe(keys, description) {
        argsert('<object|string|array> [string]', [
            keys,
            description
        ], arguments.length);
        this[kSetKey](keys, true);
        __classPrivateFieldGet(this, _usage).describe(keys, description);
        return this;
    }
    detectLocale(detect) {
        argsert('<boolean>', [
            detect
        ], arguments.length);
        __classPrivateFieldSet(this, _detectLocale, detect);
        return this;
    }
    env(prefix) {
        argsert('[string|boolean]', [
            prefix
        ], arguments.length);
        if (prefix === false) delete __classPrivateFieldGet(this, _options).envPrefix;
        else __classPrivateFieldGet(this, _options).envPrefix = prefix || '';
        return this;
    }
    epilogue(msg) {
        argsert('<string>', [
            msg
        ], arguments.length);
        __classPrivateFieldGet(this, _usage).epilog(msg);
        return this;
    }
    epilog(msg) {
        return this.epilogue(msg);
    }
    example(cmd, description) {
        argsert('<string|array> [string]', [
            cmd,
            description
        ], arguments.length);
        if (Array.isArray(cmd)) {
            cmd.forEach((exampleParams)=>this.example(...exampleParams)
            );
        } else {
            __classPrivateFieldGet(this, _usage).example(cmd, description);
        }
        return this;
    }
    exit(code, err) {
        __classPrivateFieldSet(this, _hasOutput, true);
        __classPrivateFieldSet(this, _exitError, err);
        if (__classPrivateFieldGet(this, _exitProcess)) __classPrivateFieldGet(this, _shim_1).process.exit(code);
    }
    exitProcess(enabled = true) {
        argsert('[boolean]', [
            enabled
        ], arguments.length);
        __classPrivateFieldSet(this, _exitProcess, enabled);
        return this;
    }
    fail(f) {
        argsert('<function|boolean>', [
            f
        ], arguments.length);
        if (typeof f === 'boolean' && f !== false) {
            throw new YError("Invalid first argument. Expected function or boolean 'false'");
        }
        __classPrivateFieldGet(this, _usage).failFn(f);
        return this;
    }
    getAliases() {
        return this.parsed ? this.parsed.aliases : {
        };
    }
    async getCompletion(args, done) {
        argsert('<array> [function]', [
            args,
            done
        ], arguments.length);
        if (!done) {
            return new Promise((resolve, reject)=>{
                __classPrivateFieldGet(this, _completion).getCompletion(args, (err, completions)=>{
                    if (err) reject(err);
                    else resolve(completions);
                });
            });
        } else {
            return __classPrivateFieldGet(this, _completion).getCompletion(args, done);
        }
    }
    getDemandedOptions() {
        argsert([], 0);
        return __classPrivateFieldGet(this, _options).demandedOptions;
    }
    getDemandedCommands() {
        argsert([], 0);
        return __classPrivateFieldGet(this, _options).demandedCommands;
    }
    getDeprecatedOptions() {
        argsert([], 0);
        return __classPrivateFieldGet(this, _options).deprecatedOptions;
    }
    getDetectLocale() {
        return __classPrivateFieldGet(this, _detectLocale);
    }
    getExitProcess() {
        return __classPrivateFieldGet(this, _exitProcess);
    }
    getGroups() {
        return Object.assign({
        }, __classPrivateFieldGet(this, _groups), __classPrivateFieldGet(this, _preservedGroups));
    }
    getHelp() {
        __classPrivateFieldSet(this, _hasOutput, true);
        if (!__classPrivateFieldGet(this, _usage).hasCachedHelpMessage()) {
            if (!this.parsed) {
                const parse = this[kRunYargsParserAndExecuteCommands](__classPrivateFieldGet(this, _processArgs), undefined, undefined, 0, true);
                if (isPromise(parse)) {
                    return parse.then(()=>{
                        return __classPrivateFieldGet(this, _usage).help();
                    });
                }
            }
            const builderResponse = __classPrivateFieldGet(this, _command).runDefaultBuilderOn(this);
            if (isPromise(builderResponse)) {
                return builderResponse.then(()=>{
                    return __classPrivateFieldGet(this, _usage).help();
                });
            }
        }
        return Promise.resolve(__classPrivateFieldGet(this, _usage).help());
    }
    getOptions() {
        return __classPrivateFieldGet(this, _options);
    }
    getStrict() {
        return __classPrivateFieldGet(this, _strict);
    }
    getStrictCommands() {
        return __classPrivateFieldGet(this, _strictCommands);
    }
    getStrictOptions() {
        return __classPrivateFieldGet(this, _strictOptions);
    }
    global(globals, global) {
        argsert('<string|array> [boolean]', [
            globals,
            global
        ], arguments.length);
        globals = [].concat(globals);
        if (global !== false) {
            __classPrivateFieldGet(this, _options).local = __classPrivateFieldGet(this, _options).local.filter((l)=>globals.indexOf(l) === -1
            );
        } else {
            globals.forEach((g)=>{
                if (__classPrivateFieldGet(this, _options).local.indexOf(g) === -1) __classPrivateFieldGet(this, _options).local.push(g);
            });
        }
        return this;
    }
    group(opts, groupName) {
        argsert('<string|array> <string>', [
            opts,
            groupName
        ], arguments.length);
        const existing = __classPrivateFieldGet(this, _preservedGroups)[groupName] || __classPrivateFieldGet(this, _groups)[groupName];
        if (__classPrivateFieldGet(this, _preservedGroups)[groupName]) {
            delete __classPrivateFieldGet(this, _preservedGroups)[groupName];
        }
        const seen = {
        };
        __classPrivateFieldGet(this, _groups)[groupName] = (existing || []).concat(opts).filter((key)=>{
            if (seen[key]) return false;
            return seen[key] = true;
        });
        return this;
    }
    hide(key) {
        argsert('<string>', [
            key
        ], arguments.length);
        __classPrivateFieldGet(this, _options).hiddenOptions.push(key);
        return this;
    }
    implies(key, value) {
        argsert('<string|object> [number|string|array]', [
            key,
            value
        ], arguments.length);
        __classPrivateFieldGet(this, _validation).implies(key, value);
        return this;
    }
    locale(locale) {
        argsert('[string]', [
            locale
        ], arguments.length);
        if (!locale) {
            this[kGuessLocale]();
            return __classPrivateFieldGet(this, _shim_1).y18n.getLocale();
        }
        __classPrivateFieldSet(this, _detectLocale, false);
        __classPrivateFieldGet(this, _shim_1).y18n.setLocale(locale);
        return this;
    }
    middleware(callback, applyBeforeValidation, global) {
        return __classPrivateFieldGet(this, _globalMiddleware).addMiddleware(callback, !!applyBeforeValidation, global);
    }
    nargs(key, value) {
        argsert('<string|object|array> [number]', [
            key,
            value
        ], arguments.length);
        this[kPopulateParserHintSingleValueDictionary](this.nargs.bind(this), 'narg', key, value);
        return this;
    }
    normalize(keys) {
        argsert('<array|string>', [
            keys
        ], arguments.length);
        this[kPopulateParserHintArray]('normalize', keys);
        return this;
    }
    number(keys) {
        argsert('<array|string>', [
            keys
        ], arguments.length);
        this[kPopulateParserHintArray]('number', keys);
        return this;
    }
    option(key, opt) {
        argsert('<string|object> [object]', [
            key,
            opt
        ], arguments.length);
        if (typeof key === 'object') {
            Object.keys(key).forEach((k)=>{
                this.options(k, key[k]);
            });
        } else {
            if (typeof opt !== 'object') {
                opt = {
                };
            }
            __classPrivateFieldGet(this, _options).key[key] = true;
            if (opt.alias) this.alias(key, opt.alias);
            const deprecate = opt.deprecate || opt.deprecated;
            if (deprecate) {
                this.deprecateOption(key, deprecate);
            }
            const demand = opt.demand || opt.required || opt.require;
            if (demand) {
                this.demand(key, demand);
            }
            if (opt.demandOption) {
                this.demandOption(key, typeof opt.demandOption === 'string' ? opt.demandOption : undefined);
            }
            if (opt.conflicts) {
                this.conflicts(key, opt.conflicts);
            }
            if ('default' in opt) {
                this.default(key, opt.default);
            }
            if (opt.implies !== undefined) {
                this.implies(key, opt.implies);
            }
            if (opt.nargs !== undefined) {
                this.nargs(key, opt.nargs);
            }
            if (opt.config) {
                this.config(key, opt.configParser);
            }
            if (opt.normalize) {
                this.normalize(key);
            }
            if (opt.choices) {
                this.choices(key, opt.choices);
            }
            if (opt.coerce) {
                this.coerce(key, opt.coerce);
            }
            if (opt.group) {
                this.group(key, opt.group);
            }
            if (opt.boolean || opt.type === 'boolean') {
                this.boolean(key);
                if (opt.alias) this.boolean(opt.alias);
            }
            if (opt.array || opt.type === 'array') {
                this.array(key);
                if (opt.alias) this.array(opt.alias);
            }
            if (opt.number || opt.type === 'number') {
                this.number(key);
                if (opt.alias) this.number(opt.alias);
            }
            if (opt.string || opt.type === 'string') {
                this.string(key);
                if (opt.alias) this.string(opt.alias);
            }
            if (opt.count || opt.type === 'count') {
                this.count(key);
            }
            if (typeof opt.global === 'boolean') {
                this.global(key, opt.global);
            }
            if (opt.defaultDescription) {
                __classPrivateFieldGet(this, _options).defaultDescription[key] = opt.defaultDescription;
            }
            if (opt.skipValidation) {
                this.skipValidation(key);
            }
            const desc = opt.describe || opt.description || opt.desc;
            this.describe(key, desc);
            if (opt.hidden) {
                this.hide(key);
            }
            if (opt.requiresArg) {
                this.requiresArg(key);
            }
        }
        return this;
    }
    options(key, opt) {
        return this.option(key, opt);
    }
    parse(args, shortCircuit, _parseFn) {
        argsert('[string|array] [function|boolean|object] [function]', [
            args,
            shortCircuit,
            _parseFn
        ], arguments.length);
        this[kFreeze]();
        if (typeof args === 'undefined') {
            args = __classPrivateFieldGet(this, _processArgs);
        }
        if (typeof shortCircuit === 'object') {
            __classPrivateFieldSet(this, _parseContext, shortCircuit);
            shortCircuit = _parseFn;
        }
        if (typeof shortCircuit === 'function') {
            __classPrivateFieldSet(this, _parseFn_1, shortCircuit);
            shortCircuit = false;
        }
        if (!shortCircuit) __classPrivateFieldSet(this, _processArgs, args);
        if (__classPrivateFieldGet(this, _parseFn_1)) __classPrivateFieldSet(this, _exitProcess, false);
        const parsed = this[kRunYargsParserAndExecuteCommands](args, !!shortCircuit);
        const tmpParsed = this.parsed;
        __classPrivateFieldGet(this, _completion).setParsed(this.parsed);
        if (isPromise(parsed)) {
            return parsed.then((argv)=>{
                if (__classPrivateFieldGet(this, _parseFn_1)) __classPrivateFieldGet(this, _parseFn_1).call(this, __classPrivateFieldGet(this, _exitError), argv, __classPrivateFieldGet(this, _output));
                return argv;
            }).catch((err)=>{
                if (__classPrivateFieldGet(this, _parseFn_1)) {
                    __classPrivateFieldGet(this, _parseFn_1)(err, this.parsed.argv, __classPrivateFieldGet(this, _output));
                }
                throw err;
            }).finally(()=>{
                this[kUnfreeze]();
                this.parsed = tmpParsed;
            });
        } else {
            if (__classPrivateFieldGet(this, _parseFn_1)) __classPrivateFieldGet(this, _parseFn_1).call(this, __classPrivateFieldGet(this, _exitError), parsed, __classPrivateFieldGet(this, _output));
            this[kUnfreeze]();
            this.parsed = tmpParsed;
        }
        return parsed;
    }
    parseAsync(args, shortCircuit, _parseFn) {
        const maybePromise = this.parse(args, shortCircuit, _parseFn);
        if (!isPromise(maybePromise)) {
            return Promise.resolve(maybePromise);
        } else {
            return maybePromise;
        }
    }
    parseSync(args, shortCircuit, _parseFn) {
        const maybePromise = this.parse(args, shortCircuit, _parseFn);
        if (isPromise(maybePromise)) {
            throw new YError('.parseSync() must not be used with asynchronous builders, handlers, or middleware');
        }
        return maybePromise;
    }
    parserConfiguration(config) {
        argsert('<object>', [
            config
        ], arguments.length);
        __classPrivateFieldSet(this, _parserConfig, config);
        return this;
    }
    pkgConf(key, rootPath) {
        argsert('<string> [string]', [
            key,
            rootPath
        ], arguments.length);
        let conf = null;
        const obj = this[kPkgUp](rootPath || __classPrivateFieldGet(this, _cwd));
        if (obj[key] && typeof obj[key] === 'object') {
            conf = applyExtends(obj[key], rootPath || __classPrivateFieldGet(this, _cwd), this[kGetParserConfiguration]()['deep-merge-config'] || false, __classPrivateFieldGet(this, _shim_1));
            __classPrivateFieldGet(this, _options).configObjects = (__classPrivateFieldGet(this, _options).configObjects || []).concat(conf);
        }
        return this;
    }
    positional(key, opts) {
        argsert('<string> <object>', [
            key,
            opts
        ], arguments.length);
        const supportedOpts = [
            'default',
            'defaultDescription',
            'implies',
            'normalize',
            'choices',
            'conflicts',
            'coerce',
            'type',
            'describe',
            'desc',
            'description',
            'alias', 
        ];
        opts = objFilter(opts, (k, v)=>{
            let accept = supportedOpts.indexOf(k) !== -1;
            if (k === 'type' && [
                'string',
                'number',
                'boolean'
            ].indexOf(v) === -1) accept = false;
            return accept;
        });
        const fullCommand = __classPrivateFieldGet(this, _context).fullCommands[__classPrivateFieldGet(this, _context).fullCommands.length - 1];
        const parseOptions = fullCommand ? __classPrivateFieldGet(this, _command).cmdToParseOptions(fullCommand) : {
            array: [],
            alias: {
            },
            default: {
            },
            demand: {
            }
        };
        objectKeys(parseOptions).forEach((pk)=>{
            const parseOption = parseOptions[pk];
            if (Array.isArray(parseOption)) {
                if (parseOption.indexOf(key) !== -1) opts[pk] = true;
            } else {
                if (parseOption[key] && !(pk in opts)) opts[pk] = parseOption[key];
            }
        });
        this.group(key, __classPrivateFieldGet(this, _usage).getPositionalGroupName());
        return this.option(key, opts);
    }
    recommendCommands(recommend = true) {
        argsert('[boolean]', [
            recommend
        ], arguments.length);
        __classPrivateFieldSet(this, _recommendCommands, recommend);
        return this;
    }
    required(keys, max, msg) {
        return this.demand(keys, max, msg);
    }
    require(keys, max, msg) {
        return this.demand(keys, max, msg);
    }
    requiresArg(keys) {
        argsert('<array|string|object> [number]', [
            keys
        ], arguments.length);
        if (typeof keys === 'string' && __classPrivateFieldGet(this, _options).narg[keys]) {
            return this;
        } else {
            this[kPopulateParserHintSingleValueDictionary](this.requiresArg.bind(this), 'narg', keys, NaN);
        }
        return this;
    }
    showCompletionScript($0, cmd) {
        argsert('[string] [string]', [
            $0,
            cmd
        ], arguments.length);
        $0 = $0 || this.$0;
        __classPrivateFieldGet(this, _logger).log(__classPrivateFieldGet(this, _completion).generateCompletionScript($0, cmd || __classPrivateFieldGet(this, _completionCommand) || 'completion'));
        return this;
    }
    showHelp(level) {
        argsert('[string|function]', [
            level
        ], arguments.length);
        __classPrivateFieldSet(this, _hasOutput, true);
        if (!__classPrivateFieldGet(this, _usage).hasCachedHelpMessage()) {
            if (!this.parsed) {
                const parse = this[kRunYargsParserAndExecuteCommands](__classPrivateFieldGet(this, _processArgs), undefined, undefined, 0, true);
                if (isPromise(parse)) {
                    parse.then(()=>{
                        __classPrivateFieldGet(this, _usage).showHelp(level);
                    });
                    return this;
                }
            }
            const builderResponse = __classPrivateFieldGet(this, _command).runDefaultBuilderOn(this);
            if (isPromise(builderResponse)) {
                builderResponse.then(()=>{
                    __classPrivateFieldGet(this, _usage).showHelp(level);
                });
                return this;
            }
        }
        __classPrivateFieldGet(this, _usage).showHelp(level);
        return this;
    }
    scriptName(scriptName) {
        this.customScriptName = true;
        this.$0 = scriptName;
        return this;
    }
    showHelpOnFail(enabled, message) {
        argsert('[boolean|string] [string]', [
            enabled,
            message
        ], arguments.length);
        __classPrivateFieldGet(this, _usage).showHelpOnFail(enabled, message);
        return this;
    }
    showVersion(level) {
        argsert('[string|function]', [
            level
        ], arguments.length);
        __classPrivateFieldGet(this, _usage).showVersion(level);
        return this;
    }
    skipValidation(keys) {
        argsert('<array|string>', [
            keys
        ], arguments.length);
        this[kPopulateParserHintArray]('skipValidation', keys);
        return this;
    }
    strict(enabled) {
        argsert('[boolean]', [
            enabled
        ], arguments.length);
        __classPrivateFieldSet(this, _strict, enabled !== false);
        return this;
    }
    strictCommands(enabled) {
        argsert('[boolean]', [
            enabled
        ], arguments.length);
        __classPrivateFieldSet(this, _strictCommands, enabled !== false);
        return this;
    }
    strictOptions(enabled) {
        argsert('[boolean]', [
            enabled
        ], arguments.length);
        __classPrivateFieldSet(this, _strictOptions, enabled !== false);
        return this;
    }
    string(key) {
        argsert('<array|string>', [
            key
        ], arguments.length);
        this[kPopulateParserHintArray]('string', key);
        return this;
    }
    terminalWidth() {
        argsert([], 0);
        return __classPrivateFieldGet(this, _shim_1).process.stdColumns;
    }
    updateLocale(obj) {
        return this.updateStrings(obj);
    }
    updateStrings(obj) {
        argsert('<object>', [
            obj
        ], arguments.length);
        __classPrivateFieldSet(this, _detectLocale, false);
        __classPrivateFieldGet(this, _shim_1).y18n.updateLocale(obj);
        return this;
    }
    usage(msg, description, builder, handler) {
        argsert('<string|null|undefined> [string|boolean] [function|object] [function]', [
            msg,
            description,
            builder,
            handler
        ], arguments.length);
        if (description !== undefined) {
            assertNotStrictEqual(msg, null, __classPrivateFieldGet(this, _shim_1));
            if ((msg || '').match(/^\$0( |$)/)) {
                return this.command(msg, description, builder, handler);
            } else {
                throw new YError('.usage() description must start with $0 if being used as alias for .command()');
            }
        } else {
            __classPrivateFieldGet(this, _usage).usage(msg);
            return this;
        }
    }
    version(opt, msg, ver) {
        const defaultVersionOpt = 'version';
        argsert('[boolean|string] [string] [string]', [
            opt,
            msg,
            ver
        ], arguments.length);
        if (__classPrivateFieldGet(this, _versionOpt)) {
            this[kDeleteFromParserHintObject](__classPrivateFieldGet(this, _versionOpt));
            __classPrivateFieldGet(this, _usage).version(undefined);
            __classPrivateFieldSet(this, _versionOpt, null);
        }
        if (arguments.length === 0) {
            ver = this[kGuessVersion]();
            opt = defaultVersionOpt;
        } else if (arguments.length === 1) {
            if (opt === false) {
                return this;
            }
            ver = opt;
            opt = defaultVersionOpt;
        } else if (arguments.length === 2) {
            ver = msg;
            msg = undefined;
        }
        __classPrivateFieldSet(this, _versionOpt, typeof opt === 'string' ? opt : defaultVersionOpt);
        msg = msg || __classPrivateFieldGet(this, _usage).deferY18nLookup('Show version number');
        __classPrivateFieldGet(this, _usage).version(ver || undefined);
        this.boolean(__classPrivateFieldGet(this, _versionOpt));
        this.describe(__classPrivateFieldGet(this, _versionOpt), msg);
        return this;
    }
    wrap(cols) {
        argsert('<number|null|undefined>', [
            cols
        ], arguments.length);
        __classPrivateFieldGet(this, _usage).wrap(cols);
        return this;
    }
    [(_command = new WeakMap(), _cwd = new WeakMap(), _context = new WeakMap(), _completion = new WeakMap(), _completionCommand = new WeakMap(), _defaultShowHiddenOpt = new WeakMap(), _exitError = new WeakMap(), _detectLocale = new WeakMap(), _exitProcess = new WeakMap(), _frozens = new WeakMap(), _globalMiddleware = new WeakMap(), _groups = new WeakMap(), _hasOutput = new WeakMap(), _helpOpt = new WeakMap(), _logger = new WeakMap(), _output = new WeakMap(), _options = new WeakMap(), _parentRequire = new WeakMap(), _parserConfig = new WeakMap(), _parseFn_1 = new WeakMap(), _parseContext = new WeakMap(), _pkgs = new WeakMap(), _preservedGroups = new WeakMap(), _processArgs = new WeakMap(), _recommendCommands = new WeakMap(), _shim_1 = new WeakMap(), _strict = new WeakMap(), _strictCommands = new WeakMap(), _strictOptions = new WeakMap(), _usage = new WeakMap(), _versionOpt = new WeakMap(), _validation = new WeakMap(), kCopyDoubleDash)](argv) {
        if (!argv._ || !argv['--']) return argv;
        argv._.push.apply(argv._, argv['--']);
        try {
            delete argv['--'];
        } catch (_err) {
        }
        return argv;
    }
    [kCreateLogger]() {
        return {
            log: (...args)=>{
                if (!this[kHasParseCallback]()) console.log(...args);
                __classPrivateFieldSet(this, _hasOutput, true);
                if (__classPrivateFieldGet(this, _output).length) __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + '\n');
                __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + args.join(' '));
            },
            error: (...args)=>{
                if (!this[kHasParseCallback]()) console.error(...args);
                __classPrivateFieldSet(this, _hasOutput, true);
                if (__classPrivateFieldGet(this, _output).length) __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + '\n');
                __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + args.join(' '));
            }
        };
    }
    [kDeleteFromParserHintObject](optionKey) {
        objectKeys(__classPrivateFieldGet(this, _options)).forEach((hintKey)=>{
            if (((key)=>key === 'configObjects'
            )(hintKey)) return;
            const hint = __classPrivateFieldGet(this, _options)[hintKey];
            if (Array.isArray(hint)) {
                if (~hint.indexOf(optionKey)) hint.splice(hint.indexOf(optionKey), 1);
            } else if (typeof hint === 'object') {
                delete hint[optionKey];
            }
        });
        delete __classPrivateFieldGet(this, _usage).getDescriptions()[optionKey];
    }
    [kFreeze]() {
        __classPrivateFieldGet(this, _frozens).push({
            options: __classPrivateFieldGet(this, _options),
            configObjects: __classPrivateFieldGet(this, _options).configObjects.slice(0),
            exitProcess: __classPrivateFieldGet(this, _exitProcess),
            groups: __classPrivateFieldGet(this, _groups),
            strict: __classPrivateFieldGet(this, _strict),
            strictCommands: __classPrivateFieldGet(this, _strictCommands),
            strictOptions: __classPrivateFieldGet(this, _strictOptions),
            completionCommand: __classPrivateFieldGet(this, _completionCommand),
            output: __classPrivateFieldGet(this, _output),
            exitError: __classPrivateFieldGet(this, _exitError),
            hasOutput: __classPrivateFieldGet(this, _hasOutput),
            parsed: this.parsed,
            parseFn: __classPrivateFieldGet(this, _parseFn_1),
            parseContext: __classPrivateFieldGet(this, _parseContext)
        });
        __classPrivateFieldGet(this, _usage).freeze();
        __classPrivateFieldGet(this, _validation).freeze();
        __classPrivateFieldGet(this, _command).freeze();
        __classPrivateFieldGet(this, _globalMiddleware).freeze();
    }
    [kGetDollarZero]() {
        let $0 = '';
        let default$0;
        if (/\b(node|iojs|electron)(\.exe)?$/.test(__classPrivateFieldGet(this, _shim_1).process.argv()[0])) {
            default$0 = __classPrivateFieldGet(this, _shim_1).process.argv().slice(1, 2);
        } else {
            default$0 = __classPrivateFieldGet(this, _shim_1).process.argv().slice(0, 1);
        }
        $0 = default$0.map((x)=>{
            const b = this[kRebase](__classPrivateFieldGet(this, _cwd), x);
            return x.match(/^(\/|([a-zA-Z]:)?\\)/) && b.length < x.length ? b : x;
        }).join(' ').trim();
        if (__classPrivateFieldGet(this, _shim_1).getEnv('_') && __classPrivateFieldGet(this, _shim_1).getProcessArgvBin() === __classPrivateFieldGet(this, _shim_1).getEnv('_')) {
            $0 = __classPrivateFieldGet(this, _shim_1).getEnv('_').replace(`${__classPrivateFieldGet(this, _shim_1).path.dirname(__classPrivateFieldGet(this, _shim_1).process.execPath())}/`, '');
        }
        return $0;
    }
    [kGetParserConfiguration]() {
        return __classPrivateFieldGet(this, _parserConfig);
    }
    [kGuessLocale]() {
        if (!__classPrivateFieldGet(this, _detectLocale)) return;
        const locale = __classPrivateFieldGet(this, _shim_1).getEnv('LC_ALL') || __classPrivateFieldGet(this, _shim_1).getEnv('LC_MESSAGES') || __classPrivateFieldGet(this, _shim_1).getEnv('LANG') || __classPrivateFieldGet(this, _shim_1).getEnv('LANGUAGE') || 'en_US';
        this.locale(locale.replace(/[.:].*/, ''));
    }
    [kGuessVersion]() {
        const obj = this[kPkgUp]();
        return obj.version || 'unknown';
    }
    [kParsePositionalNumbers](argv) {
        const args = argv['--'] ? argv['--'] : argv._;
        for(let i = 0, arg; (arg = args[i]) !== undefined; i++){
            if (__classPrivateFieldGet(this, _shim_1).Parser.looksLikeNumber(arg) && Number.isSafeInteger(Math.floor(parseFloat(`${arg}`)))) {
                args[i] = Number(arg);
            }
        }
        return argv;
    }
    [kPkgUp](rootPath) {
        const npath = rootPath || '*';
        if (__classPrivateFieldGet(this, _pkgs)[npath]) return __classPrivateFieldGet(this, _pkgs)[npath];
        let obj = {
        };
        try {
            let startDir = rootPath || __classPrivateFieldGet(this, _shim_1).mainFilename;
            if (!rootPath && __classPrivateFieldGet(this, _shim_1).path.extname(startDir)) {
                startDir = __classPrivateFieldGet(this, _shim_1).path.dirname(startDir);
            }
            const pkgJsonPath = __classPrivateFieldGet(this, _shim_1).findUp(startDir, (dir, names)=>{
                if (names.includes('package.json')) {
                    return 'package.json';
                } else {
                    return undefined;
                }
            });
            assertNotStrictEqual(pkgJsonPath, undefined, __classPrivateFieldGet(this, _shim_1));
            obj = JSON.parse(__classPrivateFieldGet(this, _shim_1).readFileSync(pkgJsonPath, 'utf8'));
        } catch (_noop) {
        }
        __classPrivateFieldGet(this, _pkgs)[npath] = obj || {
        };
        return __classPrivateFieldGet(this, _pkgs)[npath];
    }
    [kPopulateParserHintArray](type, keys) {
        keys = [].concat(keys);
        keys.forEach((key)=>{
            key = this[kSanitizeKey](key);
            __classPrivateFieldGet(this, _options)[type].push(key);
        });
    }
    [kPopulateParserHintSingleValueDictionary](builder, type, key, value) {
        this[kPopulateParserHintDictionary](builder, type, key, value, (type, key, value)=>{
            __classPrivateFieldGet(this, _options)[type][key] = value;
        });
    }
    [kPopulateParserHintArrayDictionary](builder, type, key, value) {
        this[kPopulateParserHintDictionary](builder, type, key, value, (type, key, value)=>{
            __classPrivateFieldGet(this, _options)[type][key] = (__classPrivateFieldGet(this, _options)[type][key] || []).concat(value);
        });
    }
    [kPopulateParserHintDictionary](builder, type, key, value, singleKeyHandler) {
        if (Array.isArray(key)) {
            key.forEach((k)=>{
                builder(k, value);
            });
        } else if (((key)=>typeof key === 'object'
        )(key)) {
            for (const k of objectKeys(key)){
                builder(k, key[k]);
            }
        } else {
            singleKeyHandler(type, this[kSanitizeKey](key), value);
        }
    }
    [kSanitizeKey](key) {
        if (key === '__proto__') return '___proto___';
        return key;
    }
    [kSetKey](key, set) {
        this[kPopulateParserHintSingleValueDictionary](this[kSetKey].bind(this), 'key', key, set);
        return this;
    }
    [kUnfreeze]() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const frozen = __classPrivateFieldGet(this, _frozens).pop();
        assertNotStrictEqual(frozen, undefined, __classPrivateFieldGet(this, _shim_1));
        let configObjects;
        _a = this, _b = this, _c = this, _d = this, _e = this, _f = this, _g = this, _h = this, _j = this, _k = this, _l = this, _m = this, { options: ({
            set value (_o){
                __classPrivateFieldSet(_a, _options, _o);
            }
        }).value , configObjects , exitProcess: ({
            set value (_o1){
                __classPrivateFieldSet(_b, _exitProcess, _o1);
            }
        }).value , groups: ({
            set value (_o2){
                __classPrivateFieldSet(_c, _groups, _o2);
            }
        }).value , output: ({
            set value (_o3){
                __classPrivateFieldSet(_d, _output, _o3);
            }
        }).value , exitError: ({
            set value (_o4){
                __classPrivateFieldSet(_e, _exitError, _o4);
            }
        }).value , hasOutput: ({
            set value (_o5){
                __classPrivateFieldSet(_f, _hasOutput, _o5);
            }
        }).value , parsed: this.parsed , strict: ({
            set value (_o6){
                __classPrivateFieldSet(_g, _strict, _o6);
            }
        }).value , strictCommands: ({
            set value (_o7){
                __classPrivateFieldSet(_h, _strictCommands, _o7);
            }
        }).value , strictOptions: ({
            set value (_o8){
                __classPrivateFieldSet(_j, _strictOptions, _o8);
            }
        }).value , completionCommand: ({
            set value (_o9){
                __classPrivateFieldSet(_k, _completionCommand, _o9);
            }
        }).value , parseFn: ({
            set value (_o10){
                __classPrivateFieldSet(_l, _parseFn_1, _o10);
            }
        }).value , parseContext: ({
            set value (_o11){
                __classPrivateFieldSet(_m, _parseContext, _o11);
            }
        }).value ,  } = frozen;
        __classPrivateFieldGet(this, _options).configObjects = configObjects;
        __classPrivateFieldGet(this, _usage).unfreeze();
        __classPrivateFieldGet(this, _validation).unfreeze();
        __classPrivateFieldGet(this, _command).unfreeze();
        __classPrivateFieldGet(this, _globalMiddleware).unfreeze();
    }
    [kValidateAsync](validation, argv) {
        return maybeAsyncResult(argv, (result)=>{
            validation(result);
            return result;
        });
    }
    getInternalMethods() {
        return {
            getCommandInstance: this[kGetCommandInstance].bind(this),
            getContext: this[kGetContext].bind(this),
            getHasOutput: this[kGetHasOutput].bind(this),
            getLoggerInstance: this[kGetLoggerInstance].bind(this),
            getParseContext: this[kGetParseContext].bind(this),
            getParserConfiguration: this[kGetParserConfiguration].bind(this),
            getUsageInstance: this[kGetUsageInstance].bind(this),
            getValidationInstance: this[kGetValidationInstance].bind(this),
            hasParseCallback: this[kHasParseCallback].bind(this),
            postProcess: this[kPostProcess].bind(this),
            reset: this[kReset].bind(this),
            runValidation: this[kRunValidation].bind(this),
            runYargsParserAndExecuteCommands: this[kRunYargsParserAndExecuteCommands].bind(this),
            setHasOutput: this[kSetHasOutput].bind(this)
        };
    }
    [kGetCommandInstance]() {
        return __classPrivateFieldGet(this, _command);
    }
    [kGetContext]() {
        return __classPrivateFieldGet(this, _context);
    }
    [kGetHasOutput]() {
        return __classPrivateFieldGet(this, _hasOutput);
    }
    [kGetLoggerInstance]() {
        return __classPrivateFieldGet(this, _logger);
    }
    [kGetParseContext]() {
        return __classPrivateFieldGet(this, _parseContext) || {
        };
    }
    [kGetUsageInstance]() {
        return __classPrivateFieldGet(this, _usage);
    }
    [kGetValidationInstance]() {
        return __classPrivateFieldGet(this, _validation);
    }
    [kHasParseCallback]() {
        return !!__classPrivateFieldGet(this, _parseFn_1);
    }
    [kPostProcess](argv, populateDoubleDash, calledFromCommand, runGlobalMiddleware) {
        if (calledFromCommand) return argv;
        if (isPromise(argv)) return argv;
        if (!populateDoubleDash) {
            argv = this[kCopyDoubleDash](argv);
        }
        const parsePositionalNumbers = this[kGetParserConfiguration]()['parse-positional-numbers'] || this[kGetParserConfiguration]()['parse-positional-numbers'] === undefined;
        if (parsePositionalNumbers) {
            argv = this[kParsePositionalNumbers](argv);
        }
        if (runGlobalMiddleware) {
            argv = applyMiddleware(argv, this, __classPrivateFieldGet(this, _globalMiddleware).getMiddleware(), false);
        }
        return argv;
    }
    [kReset](aliases = {
    }) {
        __classPrivateFieldSet(this, _options, __classPrivateFieldGet(this, _options) || {
        });
        const tmpOptions = {
        };
        tmpOptions.local = __classPrivateFieldGet(this, _options).local ? __classPrivateFieldGet(this, _options).local : [];
        tmpOptions.configObjects = __classPrivateFieldGet(this, _options).configObjects ? __classPrivateFieldGet(this, _options).configObjects : [];
        const localLookup = {
        };
        tmpOptions.local.forEach((l)=>{
            localLookup[l] = true;
            (aliases[l] || []).forEach((a)=>{
                localLookup[a] = true;
            });
        });
        Object.assign(__classPrivateFieldGet(this, _preservedGroups), Object.keys(__classPrivateFieldGet(this, _groups)).reduce((acc, groupName)=>{
            const keys = __classPrivateFieldGet(this, _groups)[groupName].filter((key)=>!(key in localLookup)
            );
            if (keys.length > 0) {
                acc[groupName] = keys;
            }
            return acc;
        }, {
        }));
        __classPrivateFieldSet(this, _groups, {
        });
        const arrayOptions = [
            'array',
            'boolean',
            'string',
            'skipValidation',
            'count',
            'normalize',
            'number',
            'hiddenOptions', 
        ];
        const objectOptions = [
            'narg',
            'key',
            'alias',
            'default',
            'defaultDescription',
            'config',
            'choices',
            'demandedOptions',
            'demandedCommands',
            'deprecatedOptions', 
        ];
        arrayOptions.forEach((k)=>{
            tmpOptions[k] = (__classPrivateFieldGet(this, _options)[k] || []).filter((k)=>!localLookup[k]
            );
        });
        objectOptions.forEach((k)=>{
            tmpOptions[k] = objFilter(__classPrivateFieldGet(this, _options)[k], (k)=>!localLookup[k]
            );
        });
        tmpOptions.envPrefix = __classPrivateFieldGet(this, _options).envPrefix;
        __classPrivateFieldSet(this, _options, tmpOptions);
        __classPrivateFieldSet(this, _usage, __classPrivateFieldGet(this, _usage) ? __classPrivateFieldGet(this, _usage).reset(localLookup) : usage(this, __classPrivateFieldGet(this, _shim_1)));
        __classPrivateFieldSet(this, _validation, __classPrivateFieldGet(this, _validation) ? __classPrivateFieldGet(this, _validation).reset(localLookup) : validation(this, __classPrivateFieldGet(this, _usage), __classPrivateFieldGet(this, _shim_1)));
        __classPrivateFieldSet(this, _command, __classPrivateFieldGet(this, _command) ? __classPrivateFieldGet(this, _command).reset() : command(__classPrivateFieldGet(this, _usage), __classPrivateFieldGet(this, _validation), __classPrivateFieldGet(this, _globalMiddleware), __classPrivateFieldGet(this, _shim_1)));
        if (!__classPrivateFieldGet(this, _completion)) __classPrivateFieldSet(this, _completion, completion(this, __classPrivateFieldGet(this, _usage), __classPrivateFieldGet(this, _command), __classPrivateFieldGet(this, _shim_1)));
        __classPrivateFieldGet(this, _globalMiddleware).reset();
        __classPrivateFieldSet(this, _completionCommand, null);
        __classPrivateFieldSet(this, _output, '');
        __classPrivateFieldSet(this, _exitError, null);
        __classPrivateFieldSet(this, _hasOutput, false);
        this.parsed = false;
        return this;
    }
    [kRebase](base, dir) {
        return __classPrivateFieldGet(this, _shim_1).path.relative(base, dir);
    }
    [kRunYargsParserAndExecuteCommands](args, shortCircuit, calledFromCommand, commandIndex = 0, helpOnly = false) {
        let skipValidation = !!calledFromCommand || helpOnly;
        args = args || __classPrivateFieldGet(this, _processArgs);
        __classPrivateFieldGet(this, _options).__ = __classPrivateFieldGet(this, _shim_1).y18n.__;
        __classPrivateFieldGet(this, _options).configuration = this[kGetParserConfiguration]();
        const populateDoubleDash = !!__classPrivateFieldGet(this, _options).configuration['populate--'];
        const config = Object.assign({
        }, __classPrivateFieldGet(this, _options).configuration, {
            'populate--': true
        });
        const parsed = __classPrivateFieldGet(this, _shim_1).Parser.detailed(args, Object.assign({
        }, __classPrivateFieldGet(this, _options), {
            configuration: {
                'parse-positional-numbers': false,
                ...config
            }
        }));
        const argv = Object.assign(parsed.argv, __classPrivateFieldGet(this, _parseContext));
        let argvPromise = undefined;
        const aliases = parsed.aliases;
        let helpOptSet = false;
        let versionOptSet = false;
        Object.keys(argv).forEach((key)=>{
            if (key === __classPrivateFieldGet(this, _helpOpt) && argv[key]) {
                helpOptSet = true;
            } else if (key === __classPrivateFieldGet(this, _versionOpt) && argv[key]) {
                versionOptSet = true;
            }
        });
        argv.$0 = this.$0;
        this.parsed = parsed;
        if (commandIndex === 0) {
            __classPrivateFieldGet(this, _usage).clearCachedHelpMessage();
        }
        try {
            this[kGuessLocale]();
            if (shortCircuit) {
                return this[kPostProcess](argv, populateDoubleDash, !!calledFromCommand, false);
            }
            if (__classPrivateFieldGet(this, _helpOpt)) {
                const helpCmds = [
                    __classPrivateFieldGet(this, _helpOpt)
                ].concat(aliases[__classPrivateFieldGet(this, _helpOpt)] || []).filter((k)=>k.length > 1
                );
                if (~helpCmds.indexOf('' + argv._[argv._.length - 1])) {
                    argv._.pop();
                    helpOptSet = true;
                }
            }
            const handlerKeys = __classPrivateFieldGet(this, _command).getCommands();
            const requestCompletions = __classPrivateFieldGet(this, _completion).completionKey in argv;
            const skipRecommendation = helpOptSet || requestCompletions || helpOnly;
            if (argv._.length) {
                if (handlerKeys.length) {
                    let firstUnknownCommand;
                    for(let i = commandIndex || 0, cmd; argv._[i] !== undefined; i++){
                        cmd = String(argv._[i]);
                        if (~handlerKeys.indexOf(cmd) && cmd !== __classPrivateFieldGet(this, _completionCommand)) {
                            const innerArgv = __classPrivateFieldGet(this, _command).runCommand(cmd, this, parsed, i + 1, helpOnly, helpOptSet || versionOptSet || helpOnly);
                            return this[kPostProcess](innerArgv, populateDoubleDash, !!calledFromCommand, false);
                        } else if (!firstUnknownCommand && cmd !== __classPrivateFieldGet(this, _completionCommand)) {
                            firstUnknownCommand = cmd;
                            break;
                        }
                    }
                    if (!__classPrivateFieldGet(this, _command).hasDefaultCommand() && __classPrivateFieldGet(this, _recommendCommands) && firstUnknownCommand && !skipRecommendation) {
                        __classPrivateFieldGet(this, _validation).recommendCommands(firstUnknownCommand, handlerKeys);
                    }
                }
                if (__classPrivateFieldGet(this, _completionCommand) && ~argv._.indexOf(__classPrivateFieldGet(this, _completionCommand)) && !requestCompletions) {
                    if (__classPrivateFieldGet(this, _exitProcess)) setBlocking(true);
                    this.showCompletionScript();
                    this.exit(0);
                }
            }
            if (__classPrivateFieldGet(this, _command).hasDefaultCommand() && !skipRecommendation) {
                const innerArgv = __classPrivateFieldGet(this, _command).runCommand(null, this, parsed, 0, helpOnly, helpOptSet || versionOptSet || helpOnly);
                return this[kPostProcess](innerArgv, populateDoubleDash, !!calledFromCommand, false);
            }
            if (requestCompletions) {
                if (__classPrivateFieldGet(this, _exitProcess)) setBlocking(true);
                args = [].concat(args);
                const completionArgs = args.slice(args.indexOf(`--${__classPrivateFieldGet(this, _completion).completionKey}`) + 1);
                __classPrivateFieldGet(this, _completion).getCompletion(completionArgs, (err, completions)=>{
                    if (err) throw new YError(err.message);
                    (completions || []).forEach((completion)=>{
                        __classPrivateFieldGet(this, _logger).log(completion);
                    });
                    this.exit(0);
                });
                return this[kPostProcess](argv, !populateDoubleDash, !!calledFromCommand, false);
            }
            if (!__classPrivateFieldGet(this, _hasOutput)) {
                if (helpOptSet) {
                    if (__classPrivateFieldGet(this, _exitProcess)) setBlocking(true);
                    skipValidation = true;
                    this.showHelp('log');
                    this.exit(0);
                } else if (versionOptSet) {
                    if (__classPrivateFieldGet(this, _exitProcess)) setBlocking(true);
                    skipValidation = true;
                    __classPrivateFieldGet(this, _usage).showVersion('log');
                    this.exit(0);
                }
            }
            if (!skipValidation && __classPrivateFieldGet(this, _options).skipValidation.length > 0) {
                skipValidation = Object.keys(argv).some((key)=>__classPrivateFieldGet(this, _options).skipValidation.indexOf(key) >= 0 && argv[key] === true
                );
            }
            if (!skipValidation) {
                if (parsed.error) throw new YError(parsed.error.message);
                if (!requestCompletions) {
                    const validation = this[kRunValidation](aliases, {
                    }, parsed.error);
                    if (!calledFromCommand) {
                        argvPromise = applyMiddleware(argv, this, __classPrivateFieldGet(this, _globalMiddleware).getMiddleware(), true);
                    }
                    argvPromise = this[kValidateAsync](validation, argvPromise !== null && argvPromise !== void 0 ? argvPromise : argv);
                    if (isPromise(argvPromise) && !calledFromCommand) {
                        argvPromise = argvPromise.then(()=>{
                            return applyMiddleware(argv, this, __classPrivateFieldGet(this, _globalMiddleware).getMiddleware(), false);
                        });
                    }
                }
            }
        } catch (err) {
            if (err instanceof YError) __classPrivateFieldGet(this, _usage).fail(err.message, err);
            else throw err;
        }
        return this[kPostProcess](argvPromise !== null && argvPromise !== void 0 ? argvPromise : argv, populateDoubleDash, !!calledFromCommand, true);
    }
    [kRunValidation](aliases, positionalMap, parseErrors, isDefaultCommand) {
        aliases = {
            ...aliases
        };
        positionalMap = {
            ...positionalMap
        };
        const demandedOptions = {
            ...this.getDemandedOptions()
        };
        return (argv)=>{
            if (parseErrors) throw new YError(parseErrors.message);
            __classPrivateFieldGet(this, _validation).nonOptionCount(argv);
            __classPrivateFieldGet(this, _validation).requiredArguments(argv, demandedOptions);
            let failedStrictCommands = false;
            if (__classPrivateFieldGet(this, _strictCommands)) {
                failedStrictCommands = __classPrivateFieldGet(this, _validation).unknownCommands(argv);
            }
            if (__classPrivateFieldGet(this, _strict) && !failedStrictCommands) {
                __classPrivateFieldGet(this, _validation).unknownArguments(argv, aliases, positionalMap, !!isDefaultCommand);
            } else if (__classPrivateFieldGet(this, _strictOptions)) {
                __classPrivateFieldGet(this, _validation).unknownArguments(argv, aliases, {
                }, false, false);
            }
            __classPrivateFieldGet(this, _validation).limitedChoices(argv);
            __classPrivateFieldGet(this, _validation).implications(argv);
            __classPrivateFieldGet(this, _validation).conflicting(argv);
        };
    }
    [kSetHasOutput]() {
        __classPrivateFieldSet(this, _hasOutput, true);
    }
}
function isCommandBuilderOptionDefinitions(builder) {
    return typeof builder === 'object';
}
function isCommandHandlerDefinition(cmd) {
    return typeof cmd === 'object' && !Array.isArray(cmd);
}
function isSyncCompletionFunction(completionFunction) {
    return completionFunction.length < 3;
}
function isFallbackCompletionFunction(completionFunction) {
    return completionFunction.length > 3;
}
const Yargs = YargsFactory(__default4);
const osType1 = (()=>{
    const { Deno  } = globalThis;
    if (typeof Deno?.build?.os === "string") {
        return Deno.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows1 = osType1 === "windows";
const CHAR_FORWARD_SLASH1 = 47;
function assertPath1(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator1(code) {
    return code === 47;
}
function isPathSeparator1(code) {
    return isPosixPathSeparator1(code) || code === 92;
}
function isWindowsDeviceRoot1(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString1(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH1;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format2(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const WHITESPACE_ENCODINGS1 = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace1(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS1[c] ?? c;
    });
}
class DenoStdInternalError1 extends Error {
    constructor(message2){
        super(message2);
        this.name = "DenoStdInternalError";
    }
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg);
    }
}
const sep3 = "\\";
const delimiter3 = ";";
function resolve3(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        const { Deno  } = globalThis;
        if (i >= 0) {
            path = pathSegments[i];
        } else if (!resolvedDevice) {
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno.cwd();
        } else {
            if (typeof Deno?.env?.get !== "function" || typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath1(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator1(code)) {
                isAbsolute = true;
                if (isPathSeparator1(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator1(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator1(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator1(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot1(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator1(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator1(code)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString1(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator1);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize3(path) {
    assertPath1(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code)) {
            isAbsolute = true;
            if (isPathSeparator1(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot1(code)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator1(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString1(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator1);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator1(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute3(path) {
    assertPath1(path);
    const len = path.length;
    if (len === 0) return false;
    const code = path.charCodeAt(0);
    if (isPathSeparator1(code)) {
        return true;
    } else if (isWindowsDeviceRoot1(code)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator1(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join3(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path = paths[i];
        assertPath1(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert1(firstPart != null);
    if (isPathSeparator1(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator1(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator1(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator1(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize3(joined);
}
function relative3(from, to) {
    assertPath1(from);
    assertPath1(to);
    if (from === to) return "";
    const fromOrig = resolve3(from);
    const toOrig = resolve3(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath3(path) {
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = resolve3(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot1(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
function dirname3(path) {
    assertPath1(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator1(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator1(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator1(code)) {
        return path;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator1(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path.slice(0, end);
}
function basename3(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot1(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator1(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= start; --i){
            if (isPathSeparator1(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname3(path) {
    assertPath1(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot1(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path.length - 1; i >= start; --i){
        const code = path.charCodeAt(i);
        if (isPathSeparator1(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format5(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format2("\\", pathObject);
}
function parse3(path) {
    assertPath1(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code)) {
            rootEnd = 1;
            if (isPathSeparator1(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator1(code)) {
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path.charCodeAt(i);
        if (isPathSeparator1(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl3(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
function toFileUrl3(path) {
    if (!isAbsolute3(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod2 = function() {
    return {
        sep: sep3,
        delimiter: delimiter3,
        resolve: resolve3,
        normalize: normalize3,
        isAbsolute: isAbsolute3,
        join: join3,
        relative: relative3,
        toNamespacedPath: toNamespacedPath3,
        dirname: dirname3,
        basename: basename3,
        extname: extname3,
        format: format5,
        parse: parse3,
        fromFileUrl: fromFileUrl3,
        toFileUrl: toFileUrl3
    };
}();
const sep4 = "/";
const delimiter4 = ":";
function resolve4(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            const { Deno  } = globalThis;
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.cwd();
        }
        assertPath1(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH1;
    }
    resolvedPath = normalizeString1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize4(path) {
    assertPath1(path);
    if (path.length === 0) return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString1(path, !isAbsolute, "/", isPosixPathSeparator1);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
}
function isAbsolute4(path) {
    assertPath1(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
}
function join4(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path = paths[i];
        assertPath1(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize4(joined);
}
function relative4(from, to) {
    assertPath1(from);
    assertPath1(to);
    if (from === to) return "";
    from = resolve4(from);
    to = resolve4(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath4(path) {
    return path;
}
function dirname4(path) {
    assertPath1(path);
    if (path.length === 0) return ".";
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path.length - 1; i >= 1; --i){
        if (path.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path.slice(0, end);
}
function basename4(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= 0; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname4(path) {
    assertPath1(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format6(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format2("/", pathObject);
}
function parse4(path) {
    assertPath1(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path.length === 0) return ret;
    const isAbsolute = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute) ret.dir = "/";
    return ret;
}
function fromFileUrl4(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl4(path) {
    if (!isAbsolute4(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod3 = function() {
    return {
        sep: sep4,
        delimiter: delimiter4,
        resolve: resolve4,
        normalize: normalize4,
        isAbsolute: isAbsolute4,
        join: join4,
        relative: relative4,
        toNamespacedPath: toNamespacedPath4,
        dirname: dirname4,
        basename: basename4,
        extname: extname4,
        format: format6,
        parse: parse4,
        fromFileUrl: fromFileUrl4,
        toFileUrl: toFileUrl4
    };
}();
const SEP = isWindows1 ? "\\" : "/";
const SEP_PATTERN = isWindows1 ? /[\\/]+/ : /\/+/;
function common(paths, sep = SEP) {
    const [first = "", ...remaining] = paths;
    if (first === "" || remaining.length === 0) {
        return first.substring(0, first.lastIndexOf(sep) + 1);
    }
    const parts = first.split(sep);
    let endOfPrefix = parts.length;
    for (const path of remaining){
        const compare = path.split(sep);
        for(let i = 0; i < endOfPrefix; i++){
            if (compare[i] !== parts[i]) {
                endOfPrefix = i;
            }
        }
        if (endOfPrefix === 0) {
            return "";
        }
    }
    const prefix = parts.slice(0, endOfPrefix).join(sep);
    return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
}
const path2 = isWindows1 ? mod2 : mod3;
const { join: join5 , normalize: normalize5  } = path2;
const regExpEscapeChars = [
    "!",
    "$",
    "(",
    ")",
    "*",
    "+",
    ".",
    "=",
    "?",
    "[",
    "\\",
    "^",
    "{",
    "|"
];
const rangeEscapeChars = [
    "-",
    "\\",
    "]"
];
function globToRegExp(glob, { extended =true , globstar: globstarOption = true , os =osType1 , caseInsensitive =false  } = {
}) {
    if (glob == "") {
        return /(?!)/;
    }
    const sep = os == "windows" ? "(?:\\\\|/)+" : "/+";
    const sepMaybe = os == "windows" ? "(?:\\\\|/)*" : "/*";
    const seps = os == "windows" ? [
        "\\",
        "/"
    ] : [
        "/"
    ];
    const globstar = os == "windows" ? "(?:[^\\\\/]*(?:\\\\|/|$)+)*" : "(?:[^/]*(?:/|$)+)*";
    const wildcard = os == "windows" ? "[^\\\\/]*" : "[^/]*";
    const escapePrefix = os == "windows" ? "`" : "\\";
    let newLength = glob.length;
    for(; newLength > 1 && seps.includes(glob[newLength - 1]); newLength--);
    glob = glob.slice(0, newLength);
    let regExpString = "";
    for(let j = 0; j < glob.length;){
        let segment = "";
        const groupStack = [];
        let inRange = false;
        let inEscape = false;
        let endsWithSep = false;
        let i = j;
        for(; i < glob.length && !seps.includes(glob[i]); i++){
            if (inEscape) {
                inEscape = false;
                const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
                segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
                continue;
            }
            if (glob[i] == escapePrefix) {
                inEscape = true;
                continue;
            }
            if (glob[i] == "[") {
                if (!inRange) {
                    inRange = true;
                    segment += "[";
                    if (glob[i + 1] == "!") {
                        i++;
                        segment += "^";
                    } else if (glob[i + 1] == "^") {
                        i++;
                        segment += "\\^";
                    }
                    continue;
                } else if (glob[i + 1] == ":") {
                    let k = i + 1;
                    let value = "";
                    while(glob[k + 1] != null && glob[k + 1] != ":"){
                        value += glob[k + 1];
                        k++;
                    }
                    if (glob[k + 1] == ":" && glob[k + 2] == "]") {
                        i = k + 2;
                        if (value == "alnum") segment += "\\dA-Za-z";
                        else if (value == "alpha") segment += "A-Za-z";
                        else if (value == "ascii") segment += "\x00-\x7F";
                        else if (value == "blank") segment += "\t ";
                        else if (value == "cntrl") segment += "\x00-\x1F\x7F";
                        else if (value == "digit") segment += "\\d";
                        else if (value == "graph") segment += "\x21-\x7E";
                        else if (value == "lower") segment += "a-z";
                        else if (value == "print") segment += "\x20-\x7E";
                        else if (value == "punct") {
                            segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
                        } else if (value == "space") segment += "\\s\v";
                        else if (value == "upper") segment += "A-Z";
                        else if (value == "word") segment += "\\w";
                        else if (value == "xdigit") segment += "\\dA-Fa-f";
                        continue;
                    }
                }
            }
            if (glob[i] == "]" && inRange) {
                inRange = false;
                segment += "]";
                continue;
            }
            if (inRange) {
                if (glob[i] == "\\") {
                    segment += `\\\\`;
                } else {
                    segment += glob[i];
                }
                continue;
            }
            if (glob[i] == ")" && groupStack.length > 0 && groupStack[groupStack.length - 1] != "BRACE") {
                segment += ")";
                const type = groupStack.pop();
                if (type == "!") {
                    segment += wildcard;
                } else if (type != "@") {
                    segment += type;
                }
                continue;
            }
            if (glob[i] == "|" && groupStack.length > 0 && groupStack[groupStack.length - 1] != "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] == "+" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("+");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "@" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("@");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "?") {
                if (extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("?");
                    segment += "(?:";
                } else {
                    segment += ".";
                }
                continue;
            }
            if (glob[i] == "!" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("!");
                segment += "(?!";
                continue;
            }
            if (glob[i] == "{") {
                groupStack.push("BRACE");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "}" && groupStack[groupStack.length - 1] == "BRACE") {
                groupStack.pop();
                segment += ")";
                continue;
            }
            if (glob[i] == "," && groupStack[groupStack.length - 1] == "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] == "*") {
                if (extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("*");
                    segment += "(?:";
                } else {
                    const prevChar = glob[i - 1];
                    let numStars = 1;
                    while(glob[i + 1] == "*"){
                        i++;
                        numStars++;
                    }
                    const nextChar = glob[i + 1];
                    if (globstarOption && numStars == 2 && [
                        ...seps,
                        undefined
                    ].includes(prevChar) && [
                        ...seps,
                        undefined
                    ].includes(nextChar)) {
                        segment += globstar;
                        endsWithSep = true;
                    } else {
                        segment += wildcard;
                    }
                }
                continue;
            }
            segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        }
        if (groupStack.length > 0 || inRange || inEscape) {
            segment = "";
            for (const c of glob.slice(j, i)){
                segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
                endsWithSep = false;
            }
        }
        regExpString += segment;
        if (!endsWithSep) {
            regExpString += i < glob.length ? sep : sepMaybe;
            endsWithSep = true;
        }
        while(seps.includes(glob[i]))i++;
        if (!(i > j)) {
            throw new Error("Assertion failure: i > j (potential infinite loop)");
        }
        j = i;
    }
    regExpString = `^${regExpString}$`;
    return new RegExp(regExpString, caseInsensitive ? "i" : "");
}
function isGlob(str) {
    const chars = {
        "{": "}",
        "(": ")",
        "[": "]"
    };
    const regex = /\\(.)|(^!|\*|\?|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    if (str === "") {
        return false;
    }
    let match;
    while(match = regex.exec(str)){
        if (match[2]) return true;
        let idx = match.index + match[0].length;
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
            const n = str.indexOf(close, idx);
            if (n !== -1) {
                idx = n + 1;
            }
        }
        str = str.slice(idx);
    }
    return false;
}
function normalizeGlob(glob, { globstar =false  } = {
}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize5(glob);
    }
    const s = SEP_PATTERN.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize5(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function joinGlobs(globs, { extended =false , globstar =false  } = {
}) {
    if (!globstar || globs.length == 0) {
        return join5(...globs);
    }
    if (globs.length === 0) return ".";
    let joined;
    for (const glob of globs){
        const path = glob;
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `${SEP}${path}`;
        }
    }
    if (!joined) return ".";
    return normalizeGlob(joined, {
        extended,
        globstar
    });
}
const path3 = isWindows1 ? mod2 : mod3;
const { basename: basename5 , delimiter: delimiter5 , dirname: dirname5 , extname: extname5 , format: format7 , fromFileUrl: fromFileUrl5 , isAbsolute: isAbsolute5 , join: join6 , normalize: normalize6 , parse: parse5 , relative: relative5 , resolve: resolve5 , sep: sep5 , toFileUrl: toFileUrl5 , toNamespacedPath: toNamespacedPath5 ,  } = path3;
const mod4 = function() {
    return {
        SEP: SEP,
        SEP_PATTERN: SEP_PATTERN,
        win32: mod2,
        posix: mod3,
        basename: basename5,
        delimiter: delimiter5,
        dirname: dirname5,
        extname: extname5,
        format: format7,
        fromFileUrl: fromFileUrl5,
        isAbsolute: isAbsolute5,
        join: join6,
        normalize: normalize6,
        parse: parse5,
        relative: relative5,
        resolve: resolve5,
        sep: sep5,
        toFileUrl: toFileUrl5,
        toNamespacedPath: toNamespacedPath5,
        common,
        globToRegExp,
        isGlob,
        normalizeGlob,
        joinGlobs
    };
}();
async function emptyDir(dir) {
    try {
        const items = [];
        for await (const dirEntry of Deno.readDir(dir)){
            items.push(dirEntry);
        }
        while(items.length){
            const item = items.shift();
            if (item && item.name) {
                const filepath = join6(dir, item.name);
                await Deno.remove(filepath, {
                    recursive: true
                });
            }
        }
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        await Deno.mkdir(dir, {
            recursive: true
        });
    }
}
function emptyDirSync(dir) {
    try {
        const items = [
            ...Deno.readDirSync(dir)
        ];
        while(items.length){
            const item = items.shift();
            if (item && item.name) {
                const filepath = join6(dir, item.name);
                Deno.removeSync(filepath, {
                    recursive: true
                });
            }
        }
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        Deno.mkdirSync(dir, {
            recursive: true
        });
        return;
    }
}
function isSubdir(src, dest, sep = sep5) {
    if (src === dest) {
        return false;
    }
    const srcArray = src.split(sep);
    const destArray = dest.split(sep);
    return srcArray.every((current, i)=>destArray[i] === current
    );
}
function getFileInfoType(fileInfo) {
    return fileInfo.isFile ? "file" : fileInfo.isDirectory ? "dir" : fileInfo.isSymlink ? "symlink" : undefined;
}
async function ensureDir(dir) {
    try {
        const fileInfo = await Deno.lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            await Deno.mkdir(dir, {
                recursive: true
            });
            return;
        }
        throw err;
    }
}
function ensureDirSync(dir) {
    try {
        const fileInfo = Deno.lstatSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            Deno.mkdirSync(dir, {
                recursive: true
            });
            return;
        }
        throw err;
    }
}
async function ensureFile(filePath) {
    try {
        const stat = await Deno.lstat(filePath);
        if (!stat.isFile) {
            throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            await ensureDir(dirname5(filePath));
            await Deno.writeFile(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
function ensureFileSync(filePath) {
    try {
        const stat = Deno.lstatSync(filePath);
        if (!stat.isFile) {
            throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            ensureDirSync(dirname5(filePath));
            Deno.writeFileSync(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
async function exists(filePath) {
    try {
        await Deno.lstat(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
function existsSync(filePath) {
    try {
        Deno.lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
async function ensureLink(src, dest) {
    if (await exists(dest)) {
        const destStatInfo = await Deno.lstat(dest);
        const destFilePathType = getFileInfoType(destStatInfo);
        if (destFilePathType !== "file") {
            throw new Error(`Ensure path exists, expected 'file', got '${destFilePathType}'`);
        }
        return;
    }
    await ensureDir(dirname5(dest));
    await Deno.link(src, dest);
}
function ensureLinkSync(src, dest) {
    if (existsSync(dest)) {
        const destStatInfo = Deno.lstatSync(dest);
        const destFilePathType = getFileInfoType(destStatInfo);
        if (destFilePathType !== "file") {
            throw new Error(`Ensure path exists, expected 'file', got '${destFilePathType}'`);
        }
        return;
    }
    ensureDirSync(dirname5(dest));
    Deno.linkSync(src, dest);
}
async function ensureSymlink(src, dest) {
    const srcStatInfo = await Deno.lstat(src);
    const srcFilePathType = getFileInfoType(srcStatInfo);
    if (await exists(dest)) {
        const destStatInfo = await Deno.lstat(dest);
        const destFilePathType = getFileInfoType(destStatInfo);
        if (destFilePathType !== "symlink") {
            throw new Error(`Ensure path exists, expected 'symlink', got '${destFilePathType}'`);
        }
        return;
    }
    await ensureDir(dirname5(dest));
    const options = isWindows1 ? {
        type: srcFilePathType === "dir" ? "dir" : "file"
    } : undefined;
    await Deno.symlink(src, dest, options);
}
function ensureSymlinkSync(src, dest) {
    const srcStatInfo = Deno.lstatSync(src);
    const srcFilePathType = getFileInfoType(srcStatInfo);
    if (existsSync(dest)) {
        const destStatInfo = Deno.lstatSync(dest);
        const destFilePathType = getFileInfoType(destStatInfo);
        if (destFilePathType !== "symlink") {
            throw new Error(`Ensure path exists, expected 'symlink', got '${destFilePathType}'`);
        }
        return;
    }
    ensureDirSync(dirname5(dest));
    const options = isWindows1 ? {
        type: srcFilePathType === "dir" ? "dir" : "file"
    } : undefined;
    Deno.symlinkSync(src, dest, options);
}
function _createWalkEntrySync(path) {
    path = normalize6(path);
    const name = basename5(path);
    const info = Deno.statSync(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
async function _createWalkEntry(path) {
    path = normalize6(path);
    const name = basename5(path);
    const info = await Deno.stat(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
function include(path, exts, match, skip) {
    if (exts && !exts.some((ext)=>path.endsWith(ext)
    )) {
        return false;
    }
    if (match && !match.some((pattern)=>!!path.match(pattern)
    )) {
        return false;
    }
    if (skip && skip.some((pattern)=>!!path.match(pattern)
    )) {
        return false;
    }
    return true;
}
function wrapErrorWithRootPath(err, root) {
    if (err instanceof Error && "root" in err) return err;
    const e = new Error();
    e.root = root;
    e.message = err instanceof Error ? `${err.message} for path "${root}"` : `[non-error thrown] for path "${root}"`;
    e.stack = err instanceof Error ? err.stack : undefined;
    e.cause = err instanceof Error ? err.cause : undefined;
    return e;
}
async function* walk(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {
}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield await _createWalkEntry(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    try {
        for await (const entry of Deno.readDir(root)){
            assert1(entry.name != null);
            let path = join6(root, entry.name);
            if (entry.isSymlink) {
                if (followSymlinks) {
                    path = await Deno.realPath(path);
                } else {
                    continue;
                }
            }
            if (entry.isFile) {
                if (includeFiles && include(path, exts, match, skip)) {
                    yield {
                        path,
                        ...entry
                    };
                }
            } else {
                yield* walk(path, {
                    maxDepth: maxDepth - 1,
                    includeFiles,
                    includeDirs,
                    followSymlinks,
                    exts,
                    match,
                    skip
                });
            }
        }
    } catch (err) {
        throw wrapErrorWithRootPath(err, normalize6(root));
    }
}
function* walkSync(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {
}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield _createWalkEntrySync(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    let entries;
    try {
        entries = Deno.readDirSync(root);
    } catch (err) {
        throw wrapErrorWithRootPath(err, normalize6(root));
    }
    for (const entry of entries){
        assert1(entry.name != null);
        let path = join6(root, entry.name);
        if (entry.isSymlink) {
            if (followSymlinks) {
                path = Deno.realPathSync(path);
            } else {
                continue;
            }
        }
        if (entry.isFile) {
            if (includeFiles && include(path, exts, match, skip)) {
                yield {
                    path,
                    ...entry
                };
            }
        } else {
            yield* walkSync(path, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip
            });
        }
    }
}
function split(path) {
    const s = SEP_PATTERN.source;
    const segments = path.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(SEP_PATTERN);
    const isAbsolute_ = isAbsolute5(path);
    return {
        segments,
        isAbsolute: isAbsolute_,
        hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
        winRoot: isWindows1 && isAbsolute_ ? segments.shift() : undefined
    };
}
function throwUnlessNotFound(error) {
    if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
    }
}
function comparePath(a, b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
}
async function* expandGlob(glob, { root =Deno.cwd() , exclude =[] , includeDirs =true , extended =false , globstar =false , caseInsensitive  } = {
}) {
    const globOptions = {
        extended,
        globstar,
        caseInsensitive
    };
    const absRoot = isAbsolute5(root) ? normalize6(root) : joinGlobs([
        Deno.cwd(),
        root
    ], globOptions);
    const resolveFromRoot = (path)=>isAbsolute5(path) ? normalize6(path) : joinGlobs([
            absRoot,
            path
        ], globOptions)
    ;
    const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp(s, globOptions)
    );
    const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p)
        )
    ;
    const { segments , hasTrailingSep , winRoot  } = split(resolveFromRoot(glob));
    let fixedRoot = winRoot != undefined ? winRoot : "/";
    while(segments.length > 0 && !isGlob(segments[0])){
        const seg = segments.shift();
        assert1(seg != null);
        fixedRoot = joinGlobs([
            fixedRoot,
            seg
        ], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = await _createWalkEntry(fixedRoot);
    } catch (error) {
        return throwUnlessNotFound(error);
    }
    async function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        } else if (globSegment == "..") {
            const parentPath = joinGlobs([
                walkInfo.path,
                ".."
            ], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield await _createWalkEntry(parentPath);
                }
            } catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        } else if (globSegment == "**") {
            return yield* walk(walkInfo.path, {
                includeFiles: false,
                skip: excludePatterns
            });
        }
        yield* walk(walkInfo.path, {
            maxDepth: 1,
            match: [
                globToRegExp(joinGlobs([
                    walkInfo.path,
                    globSegment
                ], globOptions), globOptions), 
            ],
            skip: excludePatterns
        });
    }
    let currentMatches = [
        fixedRootInfo
    ];
    for (const segment of segments){
        const nextMatchMap = new Map();
        for (const currentMatch of currentMatches){
            for await (const nextMatch of advanceMatch(currentMatch, segment)){
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }
        currentMatches = [
            ...nextMatchMap.values()
        ].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry)=>entry.isDirectory
        );
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry)=>!entry.isDirectory
        );
    }
    yield* currentMatches;
}
function* expandGlobSync(glob, { root =Deno.cwd() , exclude =[] , includeDirs =true , extended =false , globstar =false , caseInsensitive  } = {
}) {
    const globOptions = {
        extended,
        globstar,
        caseInsensitive
    };
    const absRoot = isAbsolute5(root) ? normalize6(root) : joinGlobs([
        Deno.cwd(),
        root
    ], globOptions);
    const resolveFromRoot = (path)=>isAbsolute5(path) ? normalize6(path) : joinGlobs([
            absRoot,
            path
        ], globOptions)
    ;
    const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp(s, globOptions)
    );
    const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p)
        )
    ;
    const { segments , hasTrailingSep , winRoot  } = split(resolveFromRoot(glob));
    let fixedRoot = winRoot != undefined ? winRoot : "/";
    while(segments.length > 0 && !isGlob(segments[0])){
        const seg = segments.shift();
        assert1(seg != null);
        fixedRoot = joinGlobs([
            fixedRoot,
            seg
        ], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = _createWalkEntrySync(fixedRoot);
    } catch (error) {
        return throwUnlessNotFound(error);
    }
    function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        } else if (globSegment == "..") {
            const parentPath = joinGlobs([
                walkInfo.path,
                ".."
            ], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield _createWalkEntrySync(parentPath);
                }
            } catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        } else if (globSegment == "**") {
            return yield* walkSync(walkInfo.path, {
                includeFiles: false,
                skip: excludePatterns
            });
        }
        yield* walkSync(walkInfo.path, {
            maxDepth: 1,
            match: [
                globToRegExp(joinGlobs([
                    walkInfo.path,
                    globSegment
                ], globOptions), globOptions), 
            ],
            skip: excludePatterns
        });
    }
    let currentMatches = [
        fixedRootInfo
    ];
    for (const segment of segments){
        const nextMatchMap = new Map();
        for (const currentMatch of currentMatches){
            for (const nextMatch of advanceMatch(currentMatch, segment)){
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }
        currentMatches = [
            ...nextMatchMap.values()
        ].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry)=>entry.isDirectory
        );
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry)=>!entry.isDirectory
        );
    }
    yield* currentMatches;
}
async function move(src, dest, { overwrite =false  } = {
}) {
    const srcStat = await Deno.stat(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (overwrite) {
        if (await exists(dest)) {
            await Deno.remove(dest, {
                recursive: true
            });
        }
    } else {
        if (await exists(dest)) {
            throw new Error("dest already exists.");
        }
    }
    await Deno.rename(src, dest);
    return;
}
function moveSync(src, dest, { overwrite =false  } = {
}) {
    const srcStat = Deno.statSync(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (overwrite) {
        if (existsSync(dest)) {
            Deno.removeSync(dest, {
                recursive: true
            });
        }
    } else {
        if (existsSync(dest)) {
            throw new Error("dest already exists.");
        }
    }
    Deno.renameSync(src, dest);
}
async function ensureValidCopy(src, dest, options) {
    let destStat;
    try {
        destStat = await Deno.lstat(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (options.isFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
function ensureValidCopySync(src, dest, options) {
    let destStat;
    try {
        destStat = Deno.lstatSync(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (options.isFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
async function copyFile(src, dest, options) {
    await ensureValidCopy(src, dest, options);
    await Deno.copyFile(src, dest);
    if (options.preserveTimestamps) {
        const statInfo = await Deno.stat(src);
        assert1(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
function copyFileSync(src, dest, options) {
    ensureValidCopySync(src, dest, options);
    Deno.copyFileSync(src, dest);
    if (options.preserveTimestamps) {
        const statInfo = Deno.statSync(src);
        assert1(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copySymLink(src, dest, options) {
    await ensureValidCopy(src, dest, options);
    const originSrcFilePath = await Deno.readLink(src);
    const type = getFileInfoType(await Deno.lstat(src));
    if (isWindows1) {
        await Deno.symlink(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file"
        });
    } else {
        await Deno.symlink(originSrcFilePath, dest);
    }
    if (options.preserveTimestamps) {
        const statInfo = await Deno.lstat(src);
        assert1(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
function copySymlinkSync(src, dest, options) {
    ensureValidCopySync(src, dest, options);
    const originSrcFilePath = Deno.readLinkSync(src);
    const type = getFileInfoType(Deno.lstatSync(src));
    if (isWindows1) {
        Deno.symlinkSync(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file"
        });
    } else {
        Deno.symlinkSync(originSrcFilePath, dest);
    }
    if (options.preserveTimestamps) {
        const statInfo = Deno.lstatSync(src);
        assert1(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copyDir(src, dest, options) {
    const destStat = await ensureValidCopy(src, dest, {
        ...options,
        isFolder: true
    });
    if (!destStat) {
        await ensureDir(dest);
    }
    if (options.preserveTimestamps) {
        const srcStatInfo = await Deno.stat(src);
        assert1(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for await (const entry of Deno.readDir(src)){
        const srcPath = join6(src, entry.name);
        const destPath = join6(dest, basename5(srcPath));
        if (entry.isSymlink) {
            await copySymLink(srcPath, destPath, options);
        } else if (entry.isDirectory) {
            await copyDir(srcPath, destPath, options);
        } else if (entry.isFile) {
            await copyFile(srcPath, destPath, options);
        }
    }
}
function copyDirSync(src, dest, options) {
    const destStat = ensureValidCopySync(src, dest, {
        ...options,
        isFolder: true
    });
    if (!destStat) {
        ensureDirSync(dest);
    }
    if (options.preserveTimestamps) {
        const srcStatInfo = Deno.statSync(src);
        assert1(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert1(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for (const entry of Deno.readDirSync(src)){
        assert1(entry.name != null, "file.name must be set");
        const srcPath = join6(src, entry.name);
        const destPath = join6(dest, basename5(srcPath));
        if (entry.isSymlink) {
            copySymlinkSync(srcPath, destPath, options);
        } else if (entry.isDirectory) {
            copyDirSync(srcPath, destPath, options);
        } else if (entry.isFile) {
            copyFileSync(srcPath, destPath, options);
        }
    }
}
async function copy(src, dest, options = {
}) {
    src = resolve5(src);
    dest = resolve5(dest);
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = await Deno.lstat(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        await copySymLink(src, dest, options);
    } else if (srcStat.isDirectory) {
        await copyDir(src, dest, options);
    } else if (srcStat.isFile) {
        await copyFile(src, dest, options);
    }
}
function copySync(src, dest, options = {
}) {
    src = resolve5(src);
    dest = resolve5(dest);
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = Deno.lstatSync(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        copySymlinkSync(src, dest, options);
    } else if (srcStat.isDirectory) {
        copyDirSync(src, dest, options);
    } else if (srcStat.isFile) {
        copyFileSync(src, dest, options);
    }
}
var EOL;
(function(EOL) {
    EOL["LF"] = "\n";
    EOL["CRLF"] = "\r\n";
})(EOL || (EOL = {
}));
const regDetect = /(?:\r?\n)/g;
function detect(content) {
    const d = content.match(regDetect);
    if (!d || d.length === 0) {
        return null;
    }
    const hasCRLF = d.some((x)=>x === EOL.CRLF
    );
    return hasCRLF ? EOL.CRLF : EOL.LF;
}
function format8(content, eol) {
    return content.replace(regDetect, eol);
}
const mod5 = function() {
    return {
        emptyDir,
        emptyDirSync,
        ensureDir,
        ensureDirSync,
        ensureFile,
        ensureFileSync,
        ensureLink,
        ensureLinkSync,
        exists,
        existsSync,
        ensureSymlink,
        ensureSymlinkSync,
        expandGlob,
        expandGlobSync,
        _createWalkEntrySync,
        _createWalkEntry,
        walk,
        walkSync,
        move,
        moveSync,
        copy,
        copySync,
        EOL,
        detect,
        format: format8
    };
}();
function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b1 of buf){
        output.set(b1, index);
        index += b1.length;
    }
    return output;
}
function copy1(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
class Buffer {
    #buf;
    #off = 0;
    constructor(ab){
        this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
    }
    bytes(options = {
        copy: true
    }) {
        if (options.copy === false) return this.#buf.subarray(this.#off);
        return this.#buf.slice(this.#off);
    }
    empty() {
        return this.#buf.byteLength <= this.#off;
    }
    get length() {
        return this.#buf.byteLength - this.#off;
    }
    get capacity() {
        return this.#buf.buffer.byteLength;
    }
    truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }
    reset() {
        this.#reslice(0);
        this.#off = 0;
    }
     #tryGrowByReslice(n) {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    }
     #reslice(len1) {
        assert1(len1 <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len1);
    }
    readSync(p) {
        if (this.empty()) {
            this.reset();
            if (p.byteLength === 0) {
                return 0;
            }
            return null;
        }
        const nread = copy1(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy1(p, this.#buf, m);
    }
    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
     #grow(n1) {
        const m = this.length;
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        const i = this.#tryGrowByReslice(n1);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n1 <= Math.floor(c / 2) - m) {
            copy1(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n1 > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            const buf = new Uint8Array(Math.min(2 * c + n1, MAX_SIZE));
            copy1(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        this.#off = 0;
        this.#reslice(Math.min(m + n1, MAX_SIZE));
        return m;
    }
    grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }
    async readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = await r.read(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
    readFromSync(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = r.readSync(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
}
class BytesList {
    len = 0;
    chunks = [];
    constructor(){
    }
    size() {
        return this.len;
    }
    add(value, start = 0, end = value.byteLength) {
        if (value.byteLength === 0 || end - start === 0) {
            return;
        }
        checkRange(start, end, value.byteLength);
        this.chunks.push({
            value,
            end,
            start,
            offset: this.len
        });
        this.len += end - start;
    }
    shift(n) {
        if (n === 0) {
            return;
        }
        if (this.len <= n) {
            this.chunks = [];
            this.len = 0;
            return;
        }
        const idx = this.getChunkIndex(n);
        this.chunks.splice(0, idx);
        const [chunk] = this.chunks;
        if (chunk) {
            const diff = n - chunk.offset;
            chunk.start += diff;
        }
        let offset = 0;
        for (const chunk1 of this.chunks){
            chunk1.offset = offset;
            offset += chunk1.end - chunk1.start;
        }
        this.len = offset;
    }
    getChunkIndex(pos) {
        let max = this.chunks.length;
        let min = 0;
        while(true){
            const i = min + Math.floor((max - min) / 2);
            if (i < 0 || this.chunks.length <= i) {
                return -1;
            }
            const { offset , start , end  } = this.chunks[i];
            const len = end - start;
            if (offset <= pos && pos < offset + len) {
                return i;
            } else if (offset + len <= pos) {
                min = i + 1;
            } else {
                max = i - 1;
            }
        }
    }
    get(i) {
        if (i < 0 || this.len <= i) {
            throw new Error("out of range");
        }
        const idx = this.getChunkIndex(i);
        const { value , offset , start  } = this.chunks[idx];
        return value[start + i - offset];
    }
    *iterator(start = 0) {
        const startIdx = this.getChunkIndex(start);
        if (startIdx < 0) return;
        const first = this.chunks[startIdx];
        let firstOffset = start - first.offset;
        for(let i = startIdx; i < this.chunks.length; i++){
            const chunk = this.chunks[i];
            for(let j = chunk.start + firstOffset; j < chunk.end; j++){
                yield chunk.value[j];
            }
            firstOffset = 0;
        }
    }
    slice(start, end = this.len) {
        if (end === start) {
            return new Uint8Array();
        }
        checkRange(start, end, this.len);
        const result = new Uint8Array(end - start);
        const startIdx = this.getChunkIndex(start);
        const endIdx = this.getChunkIndex(end - 1);
        let written = 0;
        for(let i = startIdx; i < endIdx; i++){
            const chunk = this.chunks[i];
            const len = chunk.end - chunk.start;
            result.set(chunk.value.subarray(chunk.start, chunk.end), written);
            written += len;
        }
        const last = this.chunks[endIdx];
        const rest = end - start - written;
        result.set(last.value.subarray(last.start, last.start + rest), written);
        return result;
    }
    concat() {
        const result = new Uint8Array(this.len);
        let sum = 0;
        for (const { value , start , end  } of this.chunks){
            result.set(value.subarray(start, end), sum);
            sum += end - start;
        }
        return result;
    }
}
function checkRange(start, end, len) {
    if (start < 0 || len < start || end < 0 || len < end || end < start) {
        throw new Error("invalid range");
    }
}
const { Deno: Deno1  } = globalThis;
const noColor1 = typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
let enabled1 = !noColor1;
function code1(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run1(str, code) {
    return enabled1 ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
function bold1(str) {
    return run1(str, code1([
        1
    ], 22));
}
function red1(str) {
    return run1(str, code1([
        31
    ], 39));
}
function yellow(str) {
    return run1(str, code1([
        33
    ], 39));
}
function blue(str) {
    return run1(str, code1([
        34
    ], 39));
}
const ANSI_PATTERN1 = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType1;
(function(DiffType) {
    DiffType["removed"] = "removed";
    DiffType["common"] = "common";
    DiffType["added"] = "added";
})(DiffType1 || (DiffType1 = {
}));
class AssertionError1 extends Error {
    name = "AssertionError";
    constructor(message3){
        super(message3);
    }
}
function assert2(expr, msg = "") {
    if (!expr) {
        throw new AssertionError1(msg);
    }
}
const DEFAULT_BUFFER_SIZE = 32 * 1024;
async function readAll(r) {
    const buf = new Buffer();
    await buf.readFrom(r);
    return buf.bytes();
}
function readAllSync(r) {
    const buf = new Buffer();
    buf.readFromSync(r);
    return buf.bytes();
}
async function readRange(r, range) {
    let length = range.end - range.start + 1;
    assert2(length > 0, "Invalid byte range was passed.");
    await r.seek(range.start, Deno.SeekMode.Start);
    const result = new Uint8Array(length);
    let off = 0;
    while(length){
        const p = new Uint8Array(Math.min(length, DEFAULT_BUFFER_SIZE));
        const nread = await r.read(p);
        assert2(nread !== null, "Unexpected EOF reach while reading a range.");
        assert2(nread > 0, "Unexpected read of 0 bytes while reading a range.");
        copy1(p, result, off);
        off += nread;
        length -= nread;
        assert2(length >= 0, "Unexpected length remaining after reading range.");
    }
    return result;
}
function readRangeSync(r, range) {
    let length = range.end - range.start + 1;
    assert2(length > 0, "Invalid byte range was passed.");
    r.seekSync(range.start, Deno.SeekMode.Start);
    const result = new Uint8Array(length);
    let off = 0;
    while(length){
        const p = new Uint8Array(Math.min(length, DEFAULT_BUFFER_SIZE));
        const nread = r.readSync(p);
        assert2(nread !== null, "Unexpected EOF reach while reading a range.");
        assert2(nread > 0, "Unexpected read of 0 bytes while reading a range.");
        copy1(p, result, off);
        off += nread;
        length -= nread;
        assert2(length >= 0, "Unexpected length remaining after reading range.");
    }
    return result;
}
async function writeAll(w, arr) {
    let nwritten = 0;
    while(nwritten < arr.length){
        nwritten += await w.write(arr.subarray(nwritten));
    }
}
function writeAllSync(w, arr) {
    let nwritten = 0;
    while(nwritten < arr.length){
        nwritten += w.writeSync(arr.subarray(nwritten));
    }
}
async function* iter(r, options) {
    const bufSize = options?.bufSize ?? DEFAULT_BUFFER_SIZE;
    const b = new Uint8Array(bufSize);
    while(true){
        const result = await r.read(b);
        if (result === null) {
            break;
        }
        yield b.subarray(0, result);
    }
}
function* iterSync(r, options) {
    const bufSize = options?.bufSize ?? DEFAULT_BUFFER_SIZE;
    const b = new Uint8Array(bufSize);
    while(true){
        const result = r.readSync(b);
        if (result === null) {
            break;
        }
        yield b.subarray(0, result);
    }
}
async function copy2(src, dst, options) {
    let n = 0;
    const bufSize = options?.bufSize ?? DEFAULT_BUFFER_SIZE;
    const b = new Uint8Array(bufSize);
    let gotEOF = false;
    while(gotEOF === false){
        const result = await src.read(b);
        if (result === null) {
            gotEOF = true;
        } else {
            let nwritten = 0;
            while(nwritten < result){
                nwritten += await dst.write(b.subarray(nwritten, result));
            }
            n += nwritten;
        }
    }
    return n;
}
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    partial;
    name = "BufferFullError";
    constructor(partial1){
        super("Buffer full");
        this.partial = partial1;
    }
}
class PartialReadError extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    buf;
    rd;
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd1, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size), rd1);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert1(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr = await this.rd.read(p);
                const nread = rr ?? 0;
                assert1(nread >= 0, "negative read");
                return rr;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert1(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy1(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = p.subarray(0, bytesRead);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = p.subarray(0, bytesRead);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            if (err instanceof Deno.errors.BadResource) {
                throw err;
            }
            let partial;
            if (err instanceof PartialReadError) {
                partial = err.partial;
                assert1(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
                assert1(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = slice;
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = slice;
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = this.buf.subarray(this.r, this.w);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = this.buf.subarray(this.r, this.w);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    buf;
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer1, size1 = 4096){
        super();
        this.writer = writer1;
        if (size1 <= 0) {
            size1 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size1);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer2, size2 = 4096){
        super();
        this.writer = writer2;
        if (size2 <= 0) {
            size2 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size2);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
function createLPS(pat) {
    const lps = new Uint8Array(pat.length);
    lps[0] = 0;
    let prefixEnd = 0;
    let i = 1;
    while(i < lps.length){
        if (pat[i] == pat[prefixEnd]) {
            prefixEnd++;
            lps[i] = prefixEnd;
            i++;
        } else if (prefixEnd === 0) {
            lps[i] = 0;
            i++;
        } else {
            prefixEnd = lps[prefixEnd - 1];
        }
    }
    return lps;
}
async function* readDelim(reader, delim) {
    const delimLen = delim.length;
    const delimLPS = createLPS(delim);
    const chunks = new BytesList();
    const bufSize = Math.max(1024, delimLen + 1);
    let inspectIndex = 0;
    let matchIndex = 0;
    while(true){
        const inspectArr = new Uint8Array(bufSize);
        const result = await reader.read(inspectArr);
        if (result === null) {
            yield chunks.concat();
            return;
        } else if (result < 0) {
            return;
        }
        chunks.add(inspectArr, 0, result);
        let localIndex = 0;
        while(inspectIndex < chunks.size()){
            if (inspectArr[localIndex] === delim[matchIndex]) {
                inspectIndex++;
                localIndex++;
                matchIndex++;
                if (matchIndex === delimLen) {
                    const matchEnd = inspectIndex - delimLen;
                    const readyBytes = chunks.slice(0, matchEnd);
                    yield readyBytes;
                    chunks.shift(inspectIndex);
                    inspectIndex = 0;
                    matchIndex = 0;
                }
            } else {
                if (matchIndex === 0) {
                    inspectIndex++;
                    localIndex++;
                } else {
                    matchIndex = delimLPS[matchIndex - 1];
                }
            }
        }
    }
}
async function* readStringDelim(reader, delim, decoderOpts) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
    for await (const chunk of readDelim(reader, encoder.encode(delim))){
        yield decoder.decode(chunk);
    }
}
async function* readLines(reader, decoderOpts) {
    const bufReader = new BufReader(reader);
    let chunks = [];
    const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
    while(true){
        const res = await bufReader.readLine();
        if (!res) {
            if (chunks.length > 0) {
                yield decoder.decode(concat(...chunks));
            }
            break;
        }
        chunks.push(res.line);
        if (!res.more) {
            yield decoder.decode(concat(...chunks));
            chunks = [];
        }
    }
}
const DEFAULT_BUFFER_SIZE1 = 32 * 1024;
async function copyN(r, dest, size) {
    let bytesRead = 0;
    let buf = new Uint8Array(DEFAULT_BUFFER_SIZE1);
    while(bytesRead < size){
        if (size - bytesRead < DEFAULT_BUFFER_SIZE1) {
            buf = new Uint8Array(size - bytesRead);
        }
        const result = await r.read(buf);
        const nread = result ?? 0;
        bytesRead += nread;
        if (nread > 0) {
            let n = 0;
            while(n < nread){
                n += await dest.write(buf.slice(n, nread));
            }
            assert1(n === nread, "could not write");
        }
        if (result === null) {
            break;
        }
    }
    return bytesRead;
}
async function readShort(buf) {
    const high = await buf.readByte();
    if (high === null) return null;
    const low = await buf.readByte();
    if (low === null) throw new Deno.errors.UnexpectedEof();
    return high << 8 | low;
}
async function readInt(buf) {
    const high = await readShort(buf);
    if (high === null) return null;
    const low = await readShort(buf);
    if (low === null) throw new Deno.errors.UnexpectedEof();
    return high << 16 | low;
}
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
async function readLong(buf) {
    const high = await readInt(buf);
    if (high === null) return null;
    const low = await readInt(buf);
    if (low === null) throw new Deno.errors.UnexpectedEof();
    const big = BigInt(high) << 32n | BigInt(low);
    if (big > MAX_SAFE_INTEGER) {
        throw new RangeError("Long value too big to be represented as a JavaScript number.");
    }
    return Number(big);
}
function sliceLongToBytes(d, dest = new Array(8)) {
    let big = BigInt(d);
    for(let i = 0; i < 8; i++){
        dest[7 - i] = Number(big & 255n);
        big >>= 8n;
    }
    return dest;
}
class StringReader extends Buffer {
    constructor(s){
        super(new TextEncoder().encode(s).buffer);
    }
}
class MultiReader {
    readers;
    currentIndex = 0;
    constructor(...readers1){
        this.readers = readers1;
    }
    async read(p) {
        const r = this.readers[this.currentIndex];
        if (!r) return null;
        const result = await r.read(p);
        if (result === null) {
            this.currentIndex++;
            return 0;
        }
        return result;
    }
}
class LimitedReader {
    reader;
    limit;
    constructor(reader1, limit1){
        this.reader = reader1;
        this.limit = limit1;
    }
    async read(p) {
        if (this.limit <= 0) {
            return null;
        }
        if (p.length > this.limit) {
            p = p.subarray(0, this.limit);
        }
        const n = await this.reader.read(p);
        if (n == null) {
            return null;
        }
        this.limit -= n;
        return n;
    }
}
function isCloser(value) {
    return typeof value === "object" && value != null && "close" in value && typeof value["close"] === "function";
}
function readerFromIterable(iterable) {
    const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();
    const buffer = new Buffer();
    return {
        async read (p) {
            if (buffer.length == 0) {
                const result = await iterator.next();
                if (result.done) {
                    return null;
                } else {
                    if (result.value.byteLength <= p.byteLength) {
                        p.set(result.value);
                        return result.value.byteLength;
                    }
                    p.set(result.value.subarray(0, p.byteLength));
                    await writeAll(buffer, result.value.subarray(p.byteLength));
                    return p.byteLength;
                }
            } else {
                const n = await buffer.read(p);
                if (n == null) {
                    return this.read(p);
                }
                return n;
            }
        }
    };
}
function writerFromStreamWriter(streamWriter) {
    return {
        async write (p) {
            await streamWriter.ready;
            await streamWriter.write(p);
            return p.length;
        }
    };
}
function readerFromStreamReader(streamReader) {
    const buffer = new Buffer();
    return {
        async read (p) {
            if (buffer.empty()) {
                const res = await streamReader.read();
                if (res.done) {
                    return null;
                }
                await writeAll(buffer, res.value);
            }
            return buffer.read(p);
        }
    };
}
function writableStreamFromWriter(writer, options = {
}) {
    const { autoClose =true  } = options;
    return new WritableStream({
        async write (chunk, controller) {
            try {
                await writeAll(writer, chunk);
            } catch (e) {
                controller.error(e);
                if (isCloser(writer) && autoClose) {
                    writer.close();
                }
            }
        },
        close () {
            if (isCloser(writer) && autoClose) {
                writer.close();
            }
        },
        abort () {
            if (isCloser(writer) && autoClose) {
                writer.close();
            }
        }
    });
}
function readableStreamFromIterable(iterable) {
    const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();
    return new ReadableStream({
        async pull (controller) {
            const { value , done  } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
        async cancel (reason) {
            if (typeof iterator.throw == "function") {
                try {
                    await iterator.throw(reason);
                } catch  {
                }
            }
        }
    });
}
function readableStreamFromReader(reader, options = {
}) {
    const { autoClose =true , chunkSize =16640 , strategy ,  } = options;
    return new ReadableStream({
        async pull (controller) {
            const chunk = new Uint8Array(chunkSize);
            try {
                const read = await reader.read(chunk);
                if (read === null) {
                    if (isCloser(reader) && autoClose) {
                        reader.close();
                    }
                    controller.close();
                    return;
                }
                controller.enqueue(chunk.subarray(0, read));
            } catch (e) {
                controller.error(e);
                if (isCloser(reader)) {
                    reader.close();
                }
            }
        },
        cancel () {
            if (isCloser(reader) && autoClose) {
                reader.close();
            }
        }
    }, strategy);
}
const decoder = new TextDecoder();
class StringWriter {
    base;
    chunks = [];
    byteLength = 0;
    cache;
    constructor(base1 = ""){
        this.base = base1;
        const c = new TextEncoder().encode(base1);
        this.chunks.push(c);
        this.byteLength += c.byteLength;
    }
    write(p) {
        return Promise.resolve(this.writeSync(p));
    }
    writeSync(p) {
        this.chunks.push(p);
        this.byteLength += p.byteLength;
        this.cache = undefined;
        return p.byteLength;
    }
    toString() {
        if (this.cache) {
            return this.cache;
        }
        const buf = new Uint8Array(this.byteLength);
        let offs = 0;
        for (const chunk of this.chunks){
            buf.set(chunk, offs);
            offs += chunk.byteLength;
        }
        this.cache = decoder.decode(buf);
        return this.cache;
    }
}
const mod6 = function() {
    return {
        Buffer,
        BufferFullError,
        PartialReadError,
        BufReader,
        BufWriter,
        BufWriterSync,
        readDelim,
        readStringDelim,
        readLines,
        readAll,
        readAllSync,
        readRange,
        readRangeSync,
        writeAll,
        writeAllSync,
        iter,
        iterSync,
        copy: copy2,
        copyN,
        readShort,
        readInt,
        readLong,
        sliceLongToBytes,
        StringReader,
        MultiReader,
        LimitedReader,
        readerFromIterable,
        writerFromStreamWriter,
        readerFromStreamReader,
        writableStreamFromWriter,
        readableStreamFromIterable,
        readableStreamFromReader,
        StringWriter
    };
}();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validate(id) {
    return UUID_RE.test(id);
}
function generate() {
    return crypto.randomUUID();
}
const mod7 = function() {
    return {
        validate: validate,
        generate: generate
    };
}();
var LogLevels;
(function(LogLevels) {
    LogLevels[LogLevels["NOTSET"] = 0] = "NOTSET";
    LogLevels[LogLevels["DEBUG"] = 10] = "DEBUG";
    LogLevels[LogLevels["INFO"] = 20] = "INFO";
    LogLevels[LogLevels["WARNING"] = 30] = "WARNING";
    LogLevels[LogLevels["ERROR"] = 40] = "ERROR";
    LogLevels[LogLevels["CRITICAL"] = 50] = "CRITICAL";
})(LogLevels || (LogLevels = {
}));
const byLevel = {
    [String(LogLevels.NOTSET)]: "NOTSET",
    [String(LogLevels.DEBUG)]: "DEBUG",
    [String(LogLevels.INFO)]: "INFO",
    [String(LogLevels.WARNING)]: "WARNING",
    [String(LogLevels.ERROR)]: "ERROR",
    [String(LogLevels.CRITICAL)]: "CRITICAL"
};
function getLevelByName(name) {
    switch(name){
        case "NOTSET":
            return LogLevels.NOTSET;
        case "DEBUG":
            return LogLevels.DEBUG;
        case "INFO":
            return LogLevels.INFO;
        case "WARNING":
            return LogLevels.WARNING;
        case "ERROR":
            return LogLevels.ERROR;
        case "CRITICAL":
            return LogLevels.CRITICAL;
        default:
            throw new Error(`no log level found for "${name}"`);
    }
}
function getLevelName(level) {
    const levelName = byLevel[level];
    if (levelName) {
        return levelName;
    }
    throw new Error(`no level name found for level: ${level}`);
}
class LogRecord {
    msg;
    #args;
    #datetime;
    level;
    levelName;
    loggerName;
    constructor(options){
        this.msg = options.msg;
        this.#args = [
            ...options.args
        ];
        this.level = options.level;
        this.loggerName = options.loggerName;
        this.#datetime = new Date();
        this.levelName = getLevelName(options.level);
    }
    get args() {
        return [
            ...this.#args
        ];
    }
    get datetime() {
        return new Date(this.#datetime.getTime());
    }
}
class Logger {
    #level;
    #handlers;
    #loggerName;
    constructor(loggerName1, levelName1, options1 = {
    }){
        this.#loggerName = loggerName1;
        this.#level = getLevelByName(levelName1);
        this.#handlers = options1.handlers || [];
    }
    get level() {
        return this.#level;
    }
    set level(level) {
        this.#level = level;
    }
    get levelName() {
        return getLevelName(this.#level);
    }
    set levelName(levelName) {
        this.#level = getLevelByName(levelName);
    }
    get loggerName() {
        return this.#loggerName;
    }
    set handlers(hndls) {
        this.#handlers = hndls;
    }
    get handlers() {
        return this.#handlers;
    }
    _log(level, msg, ...args) {
        if (this.level > level) {
            return msg instanceof Function ? undefined : msg;
        }
        let fnResult;
        let logMessage;
        if (msg instanceof Function) {
            fnResult = msg();
            logMessage = this.asString(fnResult);
        } else {
            logMessage = this.asString(msg);
        }
        const record = new LogRecord({
            msg: logMessage,
            args: args,
            level: level,
            loggerName: this.loggerName
        });
        this.#handlers.forEach((handler)=>{
            handler.handle(record);
        });
        return msg instanceof Function ? fnResult : msg;
    }
    asString(data) {
        if (typeof data === "string") {
            return data;
        } else if (data === null || typeof data === "number" || typeof data === "bigint" || typeof data === "boolean" || typeof data === "undefined" || typeof data === "symbol") {
            return String(data);
        } else if (data instanceof Error) {
            return data.stack;
        } else if (typeof data === "object") {
            return JSON.stringify(data);
        }
        return "undefined";
    }
    debug(msg, ...args) {
        return this._log(LogLevels.DEBUG, msg, ...args);
    }
    info(msg, ...args) {
        return this._log(LogLevels.INFO, msg, ...args);
    }
    warning(msg, ...args) {
        return this._log(LogLevels.WARNING, msg, ...args);
    }
    error(msg, ...args) {
        return this._log(LogLevels.ERROR, msg, ...args);
    }
    critical(msg, ...args) {
        return this._log(LogLevels.CRITICAL, msg, ...args);
    }
}
const DEFAULT_FORMATTER = "{levelName} {msg}";
class BaseHandler {
    level;
    levelName;
    formatter;
    constructor(levelName2, options2 = {
    }){
        this.level = getLevelByName(levelName2);
        this.levelName = levelName2;
        this.formatter = options2.formatter || DEFAULT_FORMATTER;
    }
    handle(logRecord) {
        if (this.level > logRecord.level) return;
        const msg = this.format(logRecord);
        return this.log(msg);
    }
    format(logRecord) {
        if (this.formatter instanceof Function) {
            return this.formatter(logRecord);
        }
        return this.formatter.replace(/{(\S+)}/g, (match, p1)=>{
            const value = logRecord[p1];
            if (value == null) {
                return match;
            }
            return String(value);
        });
    }
    log(_msg) {
    }
    async setup() {
    }
    async destroy() {
    }
}
class ConsoleHandler extends BaseHandler {
    format(logRecord) {
        let msg = super.format(logRecord);
        switch(logRecord.level){
            case LogLevels.INFO:
                msg = blue(msg);
                break;
            case LogLevels.WARNING:
                msg = yellow(msg);
                break;
            case LogLevels.ERROR:
                msg = red1(msg);
                break;
            case LogLevels.CRITICAL:
                msg = bold1(red1(msg));
                break;
            default: break;
        }
        return msg;
    }
    log(msg) {
        console.log(msg);
    }
}
class WriterHandler extends BaseHandler {
    _writer;
    #encoder = new TextEncoder();
}
class FileHandler extends WriterHandler {
    _file;
    _buf;
    _filename;
    _mode;
    _openOptions;
    _encoder = new TextEncoder();
     #unloadCallback() {
        this.destroy();
    }
    constructor(levelName3, options3){
        super(levelName3, options3);
        this._filename = options3.filename;
        this._mode = options3.mode ? options3.mode : "a";
        this._openOptions = {
            createNew: this._mode === "x",
            create: this._mode !== "x",
            append: this._mode === "a",
            truncate: this._mode !== "a",
            write: true
        };
    }
    async setup() {
        this._file = await Deno.open(this._filename, this._openOptions);
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
        addEventListener("unload", this.#unloadCallback.bind(this));
    }
    handle(logRecord) {
        super.handle(logRecord);
        if (logRecord.level > LogLevels.ERROR) {
            this.flush();
        }
    }
    log(msg) {
        this._buf.writeSync(this._encoder.encode(msg + "\n"));
    }
    flush() {
        if (this._buf?.buffered() > 0) {
            this._buf.flush();
        }
    }
    destroy() {
        this.flush();
        this._file?.close();
        this._file = undefined;
        removeEventListener("unload", this.#unloadCallback);
        return Promise.resolve();
    }
}
class RotatingFileHandler extends FileHandler {
    #maxBytes;
    #maxBackupCount;
    #currentFileSize = 0;
    constructor(levelName4, options4){
        super(levelName4, options4);
        this.#maxBytes = options4.maxBytes;
        this.#maxBackupCount = options4.maxBackupCount;
    }
    async setup() {
        if (this.#maxBytes < 1) {
            this.destroy();
            throw new Error("maxBytes cannot be less than 1");
        }
        if (this.#maxBackupCount < 1) {
            this.destroy();
            throw new Error("maxBackupCount cannot be less than 1");
        }
        await super.setup();
        if (this._mode === "w") {
            for(let i = 1; i <= this.#maxBackupCount; i++){
                if (await exists(this._filename + "." + i)) {
                    await Deno.remove(this._filename + "." + i);
                }
            }
        } else if (this._mode === "x") {
            for(let i = 1; i <= this.#maxBackupCount; i++){
                if (await exists(this._filename + "." + i)) {
                    this.destroy();
                    throw new Deno.errors.AlreadyExists("Backup log file " + this._filename + "." + i + " already exists");
                }
            }
        } else {
            this.#currentFileSize = (await Deno.stat(this._filename)).size;
        }
    }
    log(msg) {
        const msgByteLength = this._encoder.encode(msg).byteLength + 1;
        if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
            this.rotateLogFiles();
            this.#currentFileSize = 0;
        }
        this._buf.writeSync(this._encoder.encode(msg + "\n"));
        this.#currentFileSize += msgByteLength;
    }
    rotateLogFiles() {
        this._buf.flush();
        Deno.close(this._file.rid);
        for(let i = this.#maxBackupCount - 1; i >= 0; i--){
            const source = this._filename + (i === 0 ? "" : "." + i);
            const dest = this._filename + "." + (i + 1);
            if (existsSync(source)) {
                Deno.renameSync(source, dest);
            }
        }
        this._file = Deno.openSync(this._filename, this._openOptions);
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
    }
}
class LoggerConfig {
    level;
    handlers;
}
const DEFAULT_LEVEL = "INFO";
const DEFAULT_CONFIG = {
    handlers: {
        default: new ConsoleHandler(DEFAULT_LEVEL)
    },
    loggers: {
        default: {
            level: DEFAULT_LEVEL,
            handlers: [
                "default"
            ]
        }
    }
};
const state1 = {
    handlers: new Map(),
    loggers: new Map(),
    config: DEFAULT_CONFIG
};
const handlers1 = {
    BaseHandler,
    ConsoleHandler,
    WriterHandler,
    FileHandler,
    RotatingFileHandler
};
function getLogger(name) {
    if (!name) {
        const d = state1.loggers.get("default");
        assert1(d != null, `"default" logger must be set for getting logger without name`);
        return d;
    }
    const result = state1.loggers.get(name);
    if (!result) {
        const logger = new Logger(name, "NOTSET", {
            handlers: []
        });
        state1.loggers.set(name, logger);
        return logger;
    }
    return result;
}
function debug(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").debug(msg, ...args);
    }
    return getLogger("default").debug(msg, ...args);
}
function info(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").info(msg, ...args);
    }
    return getLogger("default").info(msg, ...args);
}
function warning(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").warning(msg, ...args);
    }
    return getLogger("default").warning(msg, ...args);
}
function error(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").error(msg, ...args);
    }
    return getLogger("default").error(msg, ...args);
}
function critical(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").critical(msg, ...args);
    }
    return getLogger("default").critical(msg, ...args);
}
async function setup(config) {
    state1.config = {
        handlers: {
            ...DEFAULT_CONFIG.handlers,
            ...config.handlers
        },
        loggers: {
            ...DEFAULT_CONFIG.loggers,
            ...config.loggers
        }
    };
    state1.handlers.forEach((handler)=>{
        handler.destroy();
    });
    state1.handlers.clear();
    const handlers = state1.config.handlers || {
    };
    for(const handlerName in handlers){
        const handler = handlers[handlerName];
        await handler.setup();
        state1.handlers.set(handlerName, handler);
    }
    state1.loggers.clear();
    const loggers = state1.config.loggers || {
    };
    for(const loggerName in loggers){
        const loggerConfig = loggers[loggerName];
        const handlerNames = loggerConfig.handlers || [];
        const handlers = [];
        handlerNames.forEach((handlerName)=>{
            const handler = state1.handlers.get(handlerName);
            if (handler) {
                handlers.push(handler);
            }
        });
        const levelName = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new Logger(loggerName, levelName, {
            handlers: handlers
        });
        state1.loggers.set(loggerName, logger);
    }
}
await setup(DEFAULT_CONFIG);
const mod8 = await async function() {
    return {
        LogLevels: LogLevels,
        Logger: Logger,
        LoggerConfig: LoggerConfig,
        handlers: handlers1,
        getLogger: getLogger,
        debug: debug,
        info: info,
        warning: warning,
        error: error,
        critical: critical,
        setup: setup
    };
}();
function logAndFlush(level, msg) {
    const logger = mod8.getLogger();
    switch(level){
        case mod8.LogLevels.DEBUG:
            {
                logger.debug(msg);
                break;
            }
        case mod8.LogLevels.ERROR:
            {
                logger.error(msg);
                break;
            }
        case mod8.LogLevels.INFO:
            {
                logger.info(msg);
                break;
            }
        case mod8.LogLevels.WARNING:
            {
                logger.warning(msg);
                break;
            }
        default:
            throw new Error(`Invalid level, value: [${level}]`);
    }
    for (const handler of logger.handlers){
        let hasFlush = false;
        let proto = handler;
        do {
            const props = Object.getOwnPropertyNames(proto);
            if (props.includes("flush")) {
                hasFlush = true;
                break;
            }
        }while (null != (proto = Object.getPrototypeOf(proto)))
        if (hasFlush) {
            const obj = handler;
            try {
                obj.flush();
            } catch (e) {
                console.error(e.stack);
                logger.critical(e.stack);
            }
        }
    }
}
const __default5 = {
    debug (msg) {
        logAndFlush(mod8.LogLevels.DEBUG, msg);
    },
    error (msg) {
        logAndFlush(mod8.LogLevels.ERROR, msg);
    },
    info (msg) {
        logAndFlush(mod8.LogLevels.INFO, msg);
    },
    warning (msg) {
        logAndFlush(mod8.LogLevels.WARNING, msg);
    }
};
const __default6 = {
    copyOptions: function(options) {
        const copy = {
        };
        for(const key in options){
            if (options.hasOwnProperty(key)) {
                copy[key] = options[key];
            }
        }
        return copy;
    },
    ensureFlagExists: function(item, options) {
        if (!(item in options) || typeof options[item] !== "boolean") {
            options[item] = false;
        }
    },
    ensureSpacesExists: function(options) {
        if (!("spaces" in options) || typeof options.spaces !== "number" && typeof options.spaces !== "string") {
            options.spaces = 0;
        }
    },
    ensureAlwaysArrayExists: function(options) {
        if (!("alwaysArray" in options) || typeof options.alwaysArray !== "boolean" && !Array.isArray(options.alwaysArray)) {
            options.alwaysArray = false;
        }
    },
    ensureKeyExists: function(key, options) {
        if (!(key + "Key" in options) || typeof options[key + "Key"] !== "string") {
            options[key + "Key"] = options.compact ? "_" + key : key;
        }
    }
};
let currentElement, currentElementName;
function validateOptions(userOptions) {
    const options = __default6.copyOptions(userOptions);
    __default6.ensureFlagExists("ignoreDeclaration", options);
    __default6.ensureFlagExists("ignoreInstruction", options);
    __default6.ensureFlagExists("ignoreAttributes", options);
    __default6.ensureFlagExists("ignoreText", options);
    __default6.ensureFlagExists("ignoreComment", options);
    __default6.ensureFlagExists("ignoreCdata", options);
    __default6.ensureFlagExists("ignoreDoctype", options);
    __default6.ensureFlagExists("compact", options);
    __default6.ensureFlagExists("indentText", options);
    __default6.ensureFlagExists("indentCdata", options);
    __default6.ensureFlagExists("indentAttributes", options);
    __default6.ensureFlagExists("indentInstruction", options);
    __default6.ensureFlagExists("fullTagEmptyElement", options);
    __default6.ensureFlagExists("noQuotesForNativeAttributes", options);
    __default6.ensureSpacesExists(options);
    if (typeof options.spaces === "number") {
        options.spaces = Array(options.spaces + 1).join(" ");
    }
    __default6.ensureKeyExists("declaration", options);
    __default6.ensureKeyExists("instruction", options);
    __default6.ensureKeyExists("attributes", options);
    __default6.ensureKeyExists("text", options);
    __default6.ensureKeyExists("comment", options);
    __default6.ensureKeyExists("cdata", options);
    __default6.ensureKeyExists("doctype", options);
    __default6.ensureKeyExists("type", options);
    __default6.ensureKeyExists("name", options);
    __default6.ensureKeyExists("elements", options);
    return options;
}
function writeIndentation(options, depth, firstLine) {
    return (!firstLine && options.spaces ? "\n" : "") + Array(depth + 1).join(options.spaces);
}
function writeAttributes(attributes, options, depth) {
    if (options.ignoreAttributes) {
        return "";
    }
    let key, attr, attrName, quote;
    const result = [];
    for(key in attributes){
        if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== undefined) {
            quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== "string" ? "" : '"';
            attr = "" + attributes[key];
            attr = attr.replace(/"/g, "&quot;");
            attrName = key;
            result.push(options.spaces && options.indentAttributes ? writeIndentation(options, depth + 1, false) : " ");
            result.push(attrName + "=" + quote + attr + quote);
        }
    }
    if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
        result.push(writeIndentation(options, depth, false));
    }
    return result.join("");
}
function writeDeclaration(declaration, options, depth) {
    currentElement = declaration;
    currentElementName = "xml";
    return options.ignoreDeclaration ? "" : "<?" + "xml" + writeAttributes(declaration[options.attributesKey], options, depth) + "?>";
}
function writeInstruction(instruction, options, depth) {
    if (options.ignoreInstruction) {
        return "";
    }
    let key;
    for(key in instruction){
        if (instruction.hasOwnProperty(key)) {
            break;
        }
    }
    const instructionName = key;
    if (typeof instruction[key] === "object") {
        currentElement = instruction;
        currentElementName = instructionName;
        return "<?" + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + "?>";
    } else {
        const instructionValue = instruction[key] ? instruction[key] : "";
        return "<?" + instructionName + (instructionValue ? " " + instructionValue : "") + "?>";
    }
}
function writeComment(comment, options) {
    return options.ignoreComment ? "" : "<!--" + comment + "-->";
}
function writeCdata(cdata, options) {
    return options.ignoreCdata ? "" : "<![CDATA[" + cdata.replace("]]>", "]]]]><![CDATA[>") + "]]>";
}
function writeDoctype(doctype, options) {
    return options.ignoreDoctype ? "" : "<!DOCTYPE " + doctype + ">";
}
function writeText(text, options) {
    if (options.ignoreText) return "";
    text = "" + text;
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return text;
}
function hasContent(element, options) {
    let i;
    if (element.elements && element.elements.length) {
        for(i = 0; i < element.elements.length; ++i){
            switch(element.elements[i][options.typeKey]){
                case "text":
                    if (options.indentText) {
                        return true;
                    }
                    break;
                case "cdata":
                    if (options.indentCdata) {
                        return true;
                    }
                    break;
                case "instruction":
                    if (options.indentInstruction) {
                        return true;
                    }
                    break;
                case "doctype":
                case "comment":
                case "element":
                    return true;
                default:
                    return true;
            }
        }
    }
    return false;
}
function writeElement(element, options, depth) {
    currentElement = element;
    currentElementName = element.name;
    const xml = [], elementName = element.name;
    xml.push("<" + elementName);
    if (element[options.attributesKey]) {
        xml.push(writeAttributes(element[options.attributesKey], options, depth));
    }
    let withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]["xml:space"] === "preserve";
    if (!withClosingTag) {
        withClosingTag = options.fullTagEmptyElement;
    }
    if (withClosingTag) {
        xml.push(">");
        if (element[options.elementsKey] && element[options.elementsKey].length) {
            xml.push(writeElements(element[options.elementsKey], options, depth + 1, false));
            currentElement = element;
            currentElementName = element.name;
        }
        xml.push(options.spaces && hasContent(element, options) ? "\n" + Array(depth + 1).join(options.spaces) : "");
        xml.push("</" + elementName + ">");
    } else {
        xml.push("/>");
    }
    return xml.join("");
}
function writeElements(elements, options, depth, firstLine) {
    return elements.reduce(function(xml, element) {
        const indent = writeIndentation(options, depth, firstLine && !xml);
        switch(element.type){
            case "element":
                return xml + indent + writeElement(element, options, depth);
            case "comment":
                return xml + indent + writeComment(element[options.commentKey], options);
            case "doctype":
                return xml + indent + writeDoctype(element[options.doctypeKey], options);
            case "cdata":
                return xml + (options.indentCdata ? indent : "") + writeCdata(element[options.cdataKey], options);
            case "text":
                return xml + (options.indentText ? indent : "") + writeText(element[options.textKey], options);
            case "instruction":
                {
                    const instruction = {
                    };
                    instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
                    return xml + (options.indentInstruction ? indent : "") + writeInstruction(instruction, options, depth);
                }
        }
    }, "");
}
function hasContentCompact(element, options, anyContent) {
    let key;
    for(key in element){
        if (element.hasOwnProperty(key)) {
            switch(key){
                case options.parentKey:
                case options.attributesKey: break;
                case options.textKey:
                    if (options.indentText || anyContent) {
                        return true;
                    }
                    break;
                case options.cdataKey:
                    if (options.indentCdata || anyContent) {
                        return true;
                    }
                    break;
                case options.instructionKey:
                    if (options.indentInstruction || anyContent) {
                        return true;
                    }
                    break;
                case options.doctypeKey:
                case options.commentKey:
                    return true;
                default:
                    return true;
            }
        }
    }
    return false;
}
function writeElementCompact(element, name, options, depth, indent) {
    currentElement = element;
    currentElementName = name;
    const elementName = name;
    if (typeof element === "undefined" || element === null || element === "") {
        return options.fullTagEmptyElement ? "<" + elementName + "></" + elementName + ">" : "<" + elementName + "/>";
    }
    const xml = [];
    if (name) {
        xml.push("<" + elementName);
        if (typeof element !== "object") {
            xml.push(">" + writeText(element, options) + "</" + elementName + ">");
            return xml.join("");
        }
        if (element[options.attributesKey]) {
            xml.push(writeAttributes(element[options.attributesKey], options, depth));
        }
        let withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]["xml:space"] === "preserve";
        if (!withClosingTag) {
            withClosingTag = options.fullTagEmptyElement;
        }
        if (withClosingTag) {
            xml.push(">");
        } else {
            xml.push("/>");
            return xml.join("");
        }
    }
    xml.push(writeElementsCompact(element, options, depth + 1, false));
    currentElement = element;
    currentElementName = name;
    if (name) {
        xml.push((indent ? writeIndentation(options, depth, false) : "") + "</" + elementName + ">");
    }
    return xml.join("");
}
function writeElementsCompact(element, options, depth, firstLine) {
    let i, key, nodes, xml = [];
    for(key in element){
        if (element.hasOwnProperty(key)) {
            nodes = Array.isArray(element[key]) ? element[key] : [
                element[key]
            ];
            for(i = 0; i < nodes.length; ++i){
                switch(key){
                    case options.declarationKey:
                        xml.push(writeDeclaration(nodes[i], options, depth));
                        break;
                    case options.instructionKey:
                        xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : "") + writeInstruction(nodes[i], options, depth));
                        break;
                    case options.attributesKey:
                    case options.parentKey: break;
                    case options.textKey:
                        xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : "") + writeText(nodes[i], options));
                        break;
                    case options.cdataKey:
                        xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : "") + writeCdata(nodes[i], options));
                        break;
                    case options.doctypeKey:
                        xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options));
                        break;
                    case options.commentKey:
                        xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options));
                        break;
                    default:
                        xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options, undefined)));
                }
                firstLine = firstLine && !xml.length;
            }
        }
    }
    return xml.join("");
}
function __default7(js, options) {
    options = validateOptions(options);
    const xml = [];
    currentElement = js;
    currentElementName = "_root_";
    if (options.compact) {
        xml.push(writeElementsCompact(js, options, 0, true));
    } else {
        if (js[options.declarationKey]) {
            xml.push(writeDeclaration(js[options.declarationKey], options, 0));
        }
        if (js[options.elementsKey] && js[options.elementsKey].length) {
            xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
        }
    }
    return xml.join("");
}
class SimpleRequest1 {
    server;
    conn;
    ev;
    onDone;
    constructor(server1, conn1, ev1){
        this.server = server1;
        this.conn = conn1;
        this.ev = ev1;
        this.onDone = [];
    }
    get cache() {
        return this.ev.request.cache;
    }
    get credentials() {
        return this.ev.request.credentials;
    }
    get destination() {
        return this.ev.request.destination;
    }
    get headers() {
        return this.ev.request.headers;
    }
    get integrity() {
        return this.ev.request.integrity;
    }
    get isHistoryNavigation() {
        return this.ev.request.isHistoryNavigation;
    }
    get isReloadNavigation() {
        return this.ev.request.isReloadNavigation;
    }
    get keepalive() {
        return this.ev.request.keepalive;
    }
    get method() {
        return this.ev.request.method;
    }
    get mode() {
        return this.ev.request.mode;
    }
    get redirect() {
        return this.ev.request.redirect;
    }
    get referrer() {
        return this.ev.request.referrer;
    }
    get referrerPolicy() {
        return this.ev.request.referrerPolicy;
    }
    get signal() {
        return this.ev.request.signal;
    }
    get url() {
        return this.ev.request.url;
    }
    get path() {
        return new URL(this.ev.request.url).pathname;
    }
    get body() {
        return this.ev.request.body;
    }
    get bodyUsed() {
        return this.ev.request.bodyUsed;
    }
    async arrayBuffer() {
        return await this.ev.request.arrayBuffer();
    }
    async blob() {
        return await this.ev.request.blob();
    }
    async formData() {
        return await this.ev.request.formData();
    }
    async json() {
        return await this.ev.request.json();
    }
    async text() {
        return await this.ev.request.text();
    }
    async respondWith(r) {
        if (r instanceof Response) {
            await this.ev.respondWith(r);
        } else {
            if (r.json) {
                r.body = JSON.stringify(r.json, null, 4);
                if (!r.headers) {
                    r.headers = new Headers();
                }
                r.headers.set("content-type", "application/json");
            }
            const resp = new Response(r.body, {
                headers: r.headers,
                status: r.status,
                statusText: r.statusText
            });
            await this.ev.respondWith(resp);
            for (const fun of this.onDone){
                try {
                    fun();
                } catch (e) {
                    this.server.logger.error(String(e));
                }
            }
        }
    }
    get done() {
        return new Promise((resolve)=>{
            this.onDone.push(resolve);
        });
    }
}
function html(strings, ...values) {
    const l = strings.length - 1;
    let html = "";
    for(let i = 0; i < l; i++){
        let v = values[i];
        if (v instanceof Array) {
            v = v.join("");
        }
        const s = strings[i] + v;
        html += s;
    }
    html += strings[l];
    return html;
}
const __default8 = (dirname, entries)=>{
    return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Index of ${dirname}</title>
        <style>
          @media (min-width: 960px) {
            main {
              max-width: 960px;
            }
            body {
              padding-left: 32px;
              padding-right: 32px;
            }
          }
          @media (min-width: 600px) {
            main {
              padding-left: 24px;
              padding-right: 24px;
            }
          }
          a {
            color: #2196f3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          table th {
            text-align: left;
          }
          table td {
            padding: 12px 24px 0 0;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Index of ${dirname}</h1>
          <table>
            <tr>
              <th>Size</th>
              <th>Name</th>
            </tr>
            ${entries.map((entry)=>html`
                  <tr>
                    <td>
                      ${entry.size}
                    </td>
                    <td>
                      <a href="${entry.url}">${entry.name}</a>
                    </td>
                  </tr>
                `
    )}
          </table>
        </main>
      </body>
    </html>
  `;
};
const __default9 = async (logger, ev)=>{
    const path = new URL(ev.request.url).pathname;
    const msg = `Bad Request, method: [${ev.request.method}], path: [${path}]`;
    logger.error(msg);
    const headers = new Headers();
    headers.set("content-type", "application/json");
    try {
        await ev.respondWith(new Response(JSON.stringify({
            error: "400 Bad Request",
            path: path
        }, null, 4), {
            status: 400,
            headers
        }));
    } catch (_) {
    }
};
const __default10 = async (logger, ev)=>{
    const path = new URL(ev.request.url).pathname;
    const msg = `Not Found, method: [${ev.request.method}], path: [${path}]`;
    logger.error(msg);
    const headers = new Headers();
    headers.set("content-type", "application/json");
    try {
        await ev.respondWith(new Response(JSON.stringify({
            error: "404 Not Found",
            path: path
        }, null, 4), {
            status: 404,
            headers
        }));
    } catch (_) {
    }
};
const __default11 = async (logger, ev, e)=>{
    const err = e?.stack || String(e);
    const msg = `Server Error, method: [${ev.request.method}], url: [${ev.request.url}], error: \n${err}`;
    logger.error(msg);
    const headers = new Headers();
    headers.set("content-type", "application/json");
    try {
        await ev.respondWith(new Response(JSON.stringify({
            error: "500 Server Error"
        }, null, 4), {
            status: 500,
            headers
        }));
    } catch (_) {
    }
};
const CHAR_FORWARD_SLASH2 = 47;
function assertPath2(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator2(code) {
    return code === 47;
}
function normalizeString2(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH2;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function resolve6(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            const { Deno  } = globalThis;
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.cwd();
        }
        assertPath2(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH2;
    }
    resolvedPath = normalizeString2(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator2);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize7(path) {
    assertPath2(path);
    if (path.length === 0) return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString2(path, !isAbsolute, "/", isPosixPathSeparator2);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
}
function join7(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path = paths[i];
        assertPath2(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize7(joined);
}
function relative6(from, to) {
    assertPath2(from);
    assertPath2(to);
    if (from === to) return "";
    from = resolve6(from);
    to = resolve6(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function extname6(path) {
    assertPath2(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
const __default12 = (url)=>{
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith("/")) {
        normalizedUrl = `/${normalizedUrl}`;
    }
    try {
        normalizedUrl = decodeURI(normalizedUrl);
    } catch (e) {
        if (!(e instanceof URIError)) {
            throw e;
        }
    }
    if (normalizedUrl[0] !== "/") {
        throw new URIError("The request URI is malformed.");
    }
    normalizedUrl = normalize7(normalizedUrl);
    const startOfParams = normalizedUrl.indexOf("?");
    return startOfParams > -1 ? normalizedUrl.slice(0, startOfParams) : normalizedUrl;
};
const __default13 = (reader)=>{
    return new ReadableStream({
        async pull (controller) {
            const chunk = new Uint8Array(16640);
            try {
                const read = await reader.read(chunk);
                if (read === null) {
                    reader.close();
                    controller.close();
                    return;
                }
                controller.enqueue(chunk.subarray(0, read));
            } catch (e) {
                controller.error(e);
                reader.close();
            }
        },
        cancel () {
            reader.close();
        }
    });
};
const encoder = new TextEncoder();
const MEDIA_TYPES = {
    ".md": "text/markdown",
    ".html": "text/html",
    ".htm": "text/html",
    ".json": "application/json",
    ".map": "application/json",
    ".txt": "text/plain",
    ".js": "application/javascript",
    ".ts": "text/javascript",
    ".gz": "application/gzip",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif"
};
function fileLenToString(len) {
    const multiplier = 1024;
    let base = 1;
    const suffix = [
        "B",
        "K",
        "M",
        "G",
        "T"
    ];
    let suffixIndex = 0;
    while(base * 1024 < len){
        if (suffixIndex >= suffix.length - 1) {
            break;
        }
        base *= multiplier;
        suffixIndex++;
    }
    return `${(len / base).toFixed(2)}${suffix[suffixIndex]}`;
}
async function serveFile(ev, filePath) {
    const [file, fileInfo] = await Promise.all([
        Deno.open(filePath),
        Deno.stat(filePath), 
    ]);
    const headers = new Headers();
    headers.set("content-length", fileInfo.size.toString());
    const contentType = MEDIA_TYPES[extname6(filePath)];
    if (contentType) {
        headers.set("content-type", contentType);
    }
    const stream = __default13(file);
    await ev.respondWith(new Response(stream, {
        status: 200,
        headers
    }));
}
async function serveDir(conf, ev, dirPath) {
    const dirUrl = `/${relative6(conf.rootDirectory, dirPath)}`;
    const listEntry = [];
    if (dirUrl !== "/") {
        listEntry.push({
            size: "",
            name: "../",
            url: join7(dirUrl, ".."),
            isDirectory: true
        });
    }
    for await (const entry of Deno.readDir(dirPath)){
        const filePath = join7(dirPath, entry.name);
        if (entry.name === "index.html" && entry.isFile) {
            serveFile(ev, filePath);
            return;
        }
        const fileUrl = join7(dirUrl, entry.name);
        const fileInfo = await Deno.stat(filePath);
        listEntry.push({
            size: entry.isFile ? fileLenToString(fileInfo.size ?? 0) : "",
            name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
            url: normalize7(`${conf.path}${fileUrl}${entry.isDirectory ? "/" : ""}`),
            isDirectory: entry.isDirectory
        });
    }
    listEntry.sort((a, b)=>{
        if (a.isDirectory && !b.isDirectory) {
            return -1;
        } else if (!a.isDirectory && b.isDirectory) {
            return 1;
        }
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
    const formattedDirUrl = `${dirUrl.replace(/\/$/, "")}/`;
    const page = encoder.encode(__default8(formattedDirUrl, listEntry));
    const headers = new Headers();
    headers.set("content-type", "text/html");
    await ev.respondWith(new Response(page, {
        status: 200,
        headers
    }));
}
const __default14 = async (req)=>{
    let fsPath = "";
    const logger = req.server.logger;
    const conf = req.server.conf.files;
    try {
        const relativeUrl = req.path.substring(conf.path.length);
        const normalizedUrl = __default12(relativeUrl);
        fsPath = join7(conf.rootDirectory, normalizedUrl);
        const fileInfo = await Deno.stat(fsPath);
        if (fileInfo.isDirectory) {
            if (conf.dirListingEnabled) {
                await serveDir(conf, req.ev, fsPath);
            } else {
                throw new Deno.errors.NotFound();
            }
        } else {
            await serveFile(req.ev, fsPath);
        }
    } catch (e) {
        logger.error(`Error serving file, path: [${fsPath}]`);
        if (e instanceof URIError) {
            await __default9(logger, req.ev);
        } else if (e instanceof Deno.errors.NotFound) {
            await __default10(logger, req.ev);
        } else {
            await __default11(logger, req.ev, e);
        }
    }
};
const __default15 = async (req)=>{
    const logger = req.server.logger;
    const conf = req.server.conf.http;
    try {
        logger.info(`HTTP request received, method: [${req.method}], path: [${req.path}]`);
        const resp = await conf.handler(req);
        await req.respondWith(resp);
    } catch (e) {
        await __default11(logger, req.ev, e);
    }
};
const __default16 = (closer)=>{
    if (!closer) {
        return;
    }
    try {
        closer.close();
    } catch (_) {
    }
};
async function handleSockNoThrow(logger, conf, sock, id) {
    let activeOpsCount = 0;
    let closing = false;
    try {
        await new Promise((resolve)=>{
            const callWithOpCountNoThrow = async (fun, cb)=>{
                if (fun && !closing) {
                    activeOpsCount += 1;
                    try {
                        await cb();
                    } catch (e) {
                        logger.error(String(e));
                    }
                    activeOpsCount -= 1;
                }
                if (closing && 0 == activeOpsCount) {
                    resolve(null);
                }
            };
            sock.onopen = async (ev)=>{
                await callWithOpCountNoThrow(conf.onopen, async ()=>{
                    await conf.onopen(sock, ev);
                });
            };
            sock.onmessage = async (ev)=>{
                await callWithOpCountNoThrow(conf.onmessage, async ()=>{
                    await conf.onmessage(sock, ev);
                });
            };
            sock.onerror = async (ev)=>{
                await callWithOpCountNoThrow(conf.onerror, async ()=>{
                    await conf.onerror(sock, ev);
                });
            };
            sock.onclose = async (ev)=>{
                await callWithOpCountNoThrow(conf.onclose, async ()=>{
                    await conf.onclose(sock, ev);
                });
                logger.info(`WebSocket close message received, id: [${id}],` + ` activeOpsCount: [${activeOpsCount}]`);
                closing = true;
                if (0 == activeOpsCount) {
                    resolve(null);
                }
            };
        });
    } catch (e) {
        logger.error(String(e));
    }
}
const __default17 = async (req)=>{
    const logger = req.server.logger;
    const conf = req.server.conf.websocket;
    const conn = req.conn;
    let sock = null;
    try {
        if ("websocket" != req.headers.get("upgrade")) {
            await __default9(logger, req.ev);
            return;
        }
        const upg = Deno.upgradeWebSocket(req.ev.request);
        await req.ev.respondWith(upg.response);
        sock = upg.socket;
    } catch (e) {
        await __default11(logger, req.ev, e);
        return;
    }
    if (null != sock) {
        conn.trackWebSocket(sock);
        logger.info(`WebSocket connection opened, id: [${conn.httpConn.rid}]`);
        await handleSockNoThrow(logger, conf, sock, conn.httpConn.rid);
        __default16(sock);
        logger.info(`WebSocket connection closed, id: [${conn.httpConn.rid}]`);
    }
};
class LoggerWrapper {
    sl;
    constructor(sl1){
        this.sl = sl1;
    }
    info(msg) {
        if (this.sl?.info) {
            this.sl.info(msg);
        }
    }
    error(msg) {
        if (this.sl?.error) {
            this.sl.error(msg);
        }
    }
}
class SimpleConn {
    logger;
    tcpConn;
    httpConn;
    op;
    websocket;
    constructor(logger1, tcpConn1, httpConn1){
        this.logger = logger1;
        this.tcpConn = tcpConn1;
        this.httpConn = httpConn1;
        this.op = null;
        this.websocket = null;
    }
    trackOp(op) {
        this.op = op;
    }
    trackWebSocket(websocket) {
        this.websocket = websocket;
    }
    close() {
        __default16(this.websocket);
        __default16(this.httpConn);
        __default16(this.tcpConn);
    }
    async ensureDone() {
        if (null != this.op) {
            try {
                await this.op;
            } catch (e) {
                this.logger.error(String(e));
            }
        }
    }
}
class TrackingListener {
    logger;
    denoListener;
    activeConns;
    closed;
    op;
    constructor(logger2, listener1){
        this.logger = logger2;
        this.denoListener = listener1;
        this.activeConns = new Set();
        this.closed = false;
        this.op = null;
    }
    trackOp(op) {
        this.op = op;
    }
    trackConn(conn) {
        this.activeConns.add(conn);
    }
    untrackConn(conn) {
        this.activeConns.delete(conn);
    }
    close() {
        if (this.closed) {
            return;
        }
        this.closed = true;
        for (const conn of this.activeConns){
            __default16(conn);
        }
        __default16(this.denoListener);
    }
    async ensureDone() {
        const ops = [];
        for (const conn of this.activeConns){
            ops.push(conn.ensureDone());
        }
        await Promise.allSettled(ops);
        if (null != this.op) {
            try {
                await this.op;
            } catch (e) {
                this.logger.error(String(e));
            }
        }
    }
    status() {
        const listenerActive = !this.closed;
        const activeConnections = this.activeConns.size;
        let activeWebSockets = 0;
        for (const conn of this.activeConns){
            if (conn.websocket) {
                activeWebSockets += 1;
            }
        }
        return {
            listenerActive,
            activeConnections,
            activeWebSockets
        };
    }
}
const __default18 = async (logger, ev, location)=>{
    const path = new URL(ev.request.url).pathname;
    logger.info(`Redirecting from: [${path}] to [${location}]`);
    const headers = new Headers();
    headers.set("location", location);
    try {
        await ev.respondWith(new Response("", {
            status: 302,
            headers
        }));
    } catch (_) {
    }
};
class SimpleServer1 {
    conf;
    logger;
    listener;
    closing;
    onClose;
    constructor(conf1){
        this.conf = conf1;
        this.logger = new LoggerWrapper(conf1.logger);
        const denoListener1 = "certFile" in conf1.listen ? Deno.listenTls(conf1.listen) : Deno.listen(conf1.listen);
        this.listener = new TrackingListener(this.logger, denoListener1);
        this.closing = false;
        this.onClose = [];
        const listenerOp = this._spawnListenerOp(this.listener);
        this.listener.trackOp(listenerOp);
    }
    async close() {
        if (this.closing) {
            return;
        }
        this.closing = true;
        const st = this.status;
        this.logger.info(`Closing server, active connections: [${st.activeConnections}]`);
        this.listener.close();
        await this.listener.ensureDone();
        for (const fun of this.onClose){
            try {
                fun();
            } catch (e) {
                this.logger.error(e);
            }
        }
        this.logger.info("Server closed");
    }
    get done() {
        return new Promise((resolve)=>{
            this.onClose.push(resolve);
        });
    }
    get status() {
        return this.listener.status();
    }
    async _spawnListenerOp(listener) {
        for(;;){
            try {
                const tcpConn = await listener.denoListener.accept();
                if (!tcpConn) {
                    break;
                }
                const httpConn = Deno.serveHttp(tcpConn);
                const conn = new SimpleConn(this.logger, tcpConn, httpConn);
                const connOp = this._spawnConnOp(conn);
                conn.trackOp(connOp);
                listener.trackConn(conn);
            } catch (e) {
                if (this.closing) {
                    break;
                }
                this.logger.error(e);
            }
        }
    }
    async _spawnConnOp(conn) {
        for(;;){
            try {
                const ev = await conn.httpConn.nextRequest();
                if (!ev) {
                    break;
                }
                const req = new SimpleRequest1(this, conn, ev);
                if (this.conf.websocket && req.path === this.conf.websocket.path) {
                    await __default17(req);
                    break;
                }
                await this._handleReq(req);
            } catch (e) {
                if (!this.closing) {
                    this.logger.error(e);
                }
                break;
            }
        }
        this.listener.untrackConn(conn);
        __default16(conn);
    }
    async _handleReq(req) {
        try {
            if (this.conf.http && req.path.startsWith(this.conf.http.path)) {
                await __default15(req);
            } else if (this.conf.files && req.path.startsWith(this.conf.files.path)) {
                await __default14(req);
            } else if ("/" === req.path && this.conf.rootRedirectLocation) {
                await __default18(this.logger, req.ev, this.conf.rootRedirectLocation);
            } else {
                await __default10(this.logger, req.ev);
            }
        } catch (e) {
            await __default11(this.logger, req.ev, e);
        }
    }
    broadcastWebsocket(msg) {
        if (this.closing) {
            return;
        }
        let st = "";
        if ("string" !== typeof msg) {
            st = JSON.stringify(msg, null, 4);
        } else {
            st = String(msg);
        }
        for (const conn of this.listener.activeConns){
            if (null != conn.websocket) {
                conn.websocket.send(st);
            }
        }
    }
}
function existsSync1(filePath) {
    try {
        Deno.lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
const importMeta1 = {
    url: "https://deno.land/x/windows_scm@1.1.1/winscmStartDispatcher.ts",
    main: false
};
let workerStarted = false;
async function winscmStartDispatcher1(opts) {
    if (workerStarted) throw new Error("SCM worker is already started");
    if (!existsSync1(opts.libraryPath)) {
        throw new Error(`Native library not found, specified path: [${opts.libraryPath}]`);
    }
    if (!("string" === typeof opts.serviceName && opts.serviceName.length > 0)) {
        throw new Error("WinSCM service name must be specified");
    }
    const workerPath = new URL("./worker.ts", importMeta1.url).href;
    const worker = new Worker(workerPath, {
        type: "module",
        name: opts.workerName ?? "WinSCMWorker",
        deno: {
            namespace: true
        }
    });
    workerStarted = true;
    const promise = new Promise((resolve, reject)=>{
        worker.onmessage = (e)=>{
            const res = JSON.parse(e.data);
            if (true === res.success) {
                resolve(null);
            } else {
                reject(res.error ?? "N/A");
            }
        };
    });
    const workerRequest = {
        libraryPath: opts.libraryPath,
        serviceName: opts.serviceName,
        logFilePath: opts.logFilePath ?? ""
    };
    worker.postMessage(JSON.stringify(workerRequest));
    await promise;
}
export { mod7 as uuidv4 };
export { mod8 as log, __default5 as logger };
export { dayjs1 as dayjs };
export { Yargs as yargs };
export { __default7 as js2xml };
export { SimpleRequest1 as SimpleRequest, SimpleServer1 as SimpleServer };
export { winscmStartDispatcher1 as winscmStartDispatcher };
export { mod5 as fs };
export { mod6 as io };
export { mod4 as path };
