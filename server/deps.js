var LogLevels;
(function(LogLevels1) {
    LogLevels1[LogLevels1["NOTSET"] = 0] = "NOTSET";
    LogLevels1[LogLevels1["DEBUG"] = 10] = "DEBUG";
    LogLevels1[LogLevels1["INFO"] = 20] = "INFO";
    LogLevels1[LogLevels1["WARNING"] = 30] = "WARNING";
    LogLevels1[LogLevels1["ERROR"] = 40] = "ERROR";
    LogLevels1[LogLevels1["CRITICAL"] = 50] = "CRITICAL";
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
    constructor(options2){
        this.msg = options2.msg;
        this.#args = [
            ...options2.args
        ];
        this.level = options2.level;
        this.loggerName = options2.loggerName;
        this.#datetime = new Date();
        this.levelName = getLevelName(options2.level);
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
    constructor(loggerName, levelName1, options1 = {
    }){
        this.#loggerName = loggerName;
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
const noColor = globalThis.Deno?.noColor ?? true;
let enabled2 = !noColor;
function code2(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code1) {
    return enabled2 ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
}
function bold(str) {
    return run(str, code2([
        1
    ], 22));
}
function red(str) {
    return run(str, code2([
        31
    ], 39));
}
function yellow(str) {
    return run(str, code2([
        33
    ], 39));
}
function blue(str) {
    return run(str, code2([
        34
    ], 39));
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
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
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError extends Error {
    constructor(message4){
        super(message4);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
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
    #tryGrowByReslice = (n)=>{
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    };
    #reslice = (len)=>{
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    };
    readSync(p) {
        if (this.empty()) {
            this.reset();
            if (p.byteLength === 0) {
                return 0;
            }
            return null;
        }
        const nread = copy(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy(p, this.#buf, m);
    }
    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
    #grow = (n)=>{
        const m = this.length;
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        const i = this.#tryGrowByReslice(n);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
            copy(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
            copy(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        this.#off = 0;
        this.#reslice(Math.min(m + n, MAX_SIZE));
        return m;
    };
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
var DiffType;
(function(DiffType1) {
    DiffType1["removed"] = "removed";
    DiffType1["common"] = "common";
    DiffType1["added"] = "added";
})(DiffType || (DiffType = {
}));
class AssertionError extends Error {
    constructor(message1){
        super(message1);
        this.name = "AssertionError";
    }
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
    constructor(rd1, size1 = 4096){
        if (size1 < 16) {
            size1 = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size1), rd1);
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
            assert(rr >= 0, "negative read");
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
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy(this.buf.subarray(this.r, this.w), p, 0);
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
                err.partial = p.subarray(0, bytesRead);
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
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let { partial: partial2  } = err;
            assert(partial2 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial2.byteLength > 0 && partial2[partial2.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial2 = partial2.subarray(0, partial2.byteLength - 1);
            }
            return {
                line: partial2,
                more: !this.eof
            };
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
                err.partial = slice;
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
                err.partial = this.buf.subarray(this.r, this.w);
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
    constructor(writer1, size2 = 4096){
        super();
        this.writer = writer1;
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
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
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
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
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
    constructor(writer2, size3 = 4096){
        super();
        this.writer = writer2;
        if (size3 <= 0) {
            size3 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size3);
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
            this.err = e;
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
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const DEFAULT_FORMATTER = "{levelName} {msg}";
class BaseHandler {
    level;
    levelName;
    formatter;
    constructor(levelName2, options3 = {
    }){
        this.level = getLevelByName(levelName2);
        this.levelName = levelName2;
        this.formatter = options3.formatter || DEFAULT_FORMATTER;
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
                msg = red(msg);
                break;
            case LogLevels.CRITICAL:
                msg = bold(red(msg));
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
    #unloadCallback = ()=>this.destroy()
    ;
    constructor(levelName3, options4){
        super(levelName3, options4);
        this._filename = options4.filename;
        this._mode = options4.mode ? options4.mode : "a";
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
        addEventListener("unload", this.#unloadCallback);
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
    constructor(levelName4, options5){
        super(levelName4, options5);
        this.#maxBytes = options5.maxBytes;
        this.#maxBackupCount = options5.maxBackupCount;
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
            if (existsSync1(source)) {
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
const handlers = {
    BaseHandler,
    ConsoleHandler,
    WriterHandler,
    FileHandler,
    RotatingFileHandler
};
function getLogger(name) {
    if (!name) {
        const d = state1.loggers.get("default");
        assert(d != null, `"default" logger must be set for getting logger without name`);
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
    const handlers1 = state1.config.handlers || {
    };
    for(const handlerName in handlers1){
        const handler = handlers1[handlerName];
        await handler.setup();
        state1.handlers.set(handlerName, handler);
    }
    state1.loggers.clear();
    const loggers = state1.config.loggers || {
    };
    for(const loggerName1 in loggers){
        const loggerConfig = loggers[loggerName1];
        const handlerNames = loggerConfig.handlers || [];
        const handlers2 = [];
        handlerNames.forEach((handlerName1)=>{
            const handler = state1.handlers.get(handlerName1);
            if (handler) {
                handlers2.push(handler);
            }
        });
        const levelName5 = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new Logger(loggerName1, levelName5, {
            handlers: handlers2
        });
        state1.loggers.set(loggerName1, logger);
    }
}
await setup(DEFAULT_CONFIG);
const mod = await async function() {
    return {
        LogLevels: LogLevels,
        Logger: Logger,
        LoggerConfig: LoggerConfig,
        handlers: handlers,
        getLogger: getLogger,
        debug: debug,
        info: info,
        warning: warning,
        error: error,
        critical: critical,
        setup: setup
    };
}();
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {
};
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path, base) {
            return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var dayjs_min = createCommonjsModule(function(module, exports) {
    !function(t, e) {
        module.exports = e();
    }(commonjsGlobal, function() {
        var t = 1000, e = 60000, n = 3600000, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", f = "month", h = "quarter", c = "year", d = "date", $ = "Invalid Date", l = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = {
            name: "en",
            weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
            months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
        }, m = function(t2, e2, n2) {
            var r2 = String(t2);
            return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
        }, g = {
            s: m,
            z: function(t2) {
                var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
                return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
            },
            m: function t2(e2, n2) {
                if (e2.date() < n2.date()) return -t2(n2, e2);
                var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, f), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), f);
                return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
            },
            a: function(t21) {
                return t21 < 0 ? Math.ceil(t21) || 0 : Math.floor(t21);
            },
            p: function(t21) {
                return ({
                    M: f,
                    y: c,
                    w: o,
                    d: a,
                    D: d,
                    h: u,
                    m: s,
                    s: i,
                    ms: r,
                    Q: h
                })[t21] || String(t21 || "").toLowerCase().replace(/s$/, "");
            },
            u: function(t21) {
                return t21 === void 0;
            }
        }, D = "en", v = {
        };
        v[D] = M;
        var p2 = function(t2) {
            return t2 instanceof _;
        }, S = function(t2, e2, n2) {
            var r2;
            if (!t2) return D;
            if (typeof t2 == "string") v[t2] && (r2 = t2), e2 && (v[t2] = e2, r2 = t2);
            else {
                var i2 = t2.name;
                v[i2] = t2, r2 = i2;
            }
            return !n2 && r2 && (D = r2), r2 || !n2 && D;
        }, w = function(t2, e2) {
            if (p2(t2)) return t2.clone();
            var n2 = typeof e2 == "object" ? e2 : {
            };
            return n2.date = t2, n2.args = arguments, new _(n2);
        }, O = g;
        O.l = S, O.i = p2, O.w = function(t2, e2) {
            return w(t2, {
                locale: e2.$L,
                utc: e2.$u,
                x: e2.$x,
                $offset: e2.$offset
            });
        };
        var _ = function() {
            function M2(t2) {
                this.$L = S(t2.locale, null, true), this.parse(t2);
            }
            var m2 = M2.prototype;
            return m2.parse = function(t2) {
                this.$d = (function(t3) {
                    var e2 = t3.date, n2 = t3.utc;
                    if (e2 === null) return new Date(NaN);
                    if (O.u(e2)) return new Date();
                    if (e2 instanceof Date) return new Date(e2);
                    if (typeof e2 == "string" && !/Z$/i.test(e2)) {
                        var r2 = e2.match(l);
                        if (r2) {
                            var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                            return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                        }
                    }
                    return new Date(e2);
                })(t2), this.$x = t2.x || {
                }, this.init();
            }, m2.init = function() {
                var t2 = this.$d;
                this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
            }, m2.$utils = function() {
                return O;
            }, m2.isValid = function() {
                return !(this.$d.toString() === $);
            }, m2.isSame = function(t2, e2) {
                var n2 = w(t2);
                return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
            }, m2.isAfter = function(t2, e2) {
                return w(t2) < this.startOf(e2);
            }, m2.isBefore = function(t2, e2) {
                return this.endOf(e2) < w(t2);
            }, m2.$g = function(t2, e2, n2) {
                return O.u(t2) ? this[e2] : this.set(n2, t2);
            }, m2.unix = function() {
                return Math.floor(this.valueOf() / 1000);
            }, m2.valueOf = function() {
                return this.$d.getTime();
            }, m2.startOf = function(t2, e2) {
                var n2 = this, r2 = !!O.u(e2) || e2, h2 = O.p(t2), $2 = function(t3, e3) {
                    var i2 = O.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
                    return r2 ? i2 : i2.endOf(a);
                }, l2 = function(t3, e3) {
                    return O.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [
                        0,
                        0,
                        0,
                        0
                    ] : [
                        23,
                        59,
                        59,
                        999
                    ]).slice(e3)), n2);
                }, y2 = this.$W, M3 = this.$M, m3 = this.$D, g2 = "set" + (this.$u ? "UTC" : "");
                switch(h2){
                    case c:
                        return r2 ? $2(1, 0) : $2(31, 11);
                    case f:
                        return r2 ? $2(1, M3) : $2(0, M3 + 1);
                    case o:
                        var D2 = this.$locale().weekStart || 0, v2 = (y2 < D2 ? y2 + 7 : y2) - D2;
                        return $2(r2 ? m3 - v2 : m3 + (6 - v2), M3);
                    case a:
                    case d:
                        return l2(g2 + "Hours", 0);
                    case u:
                        return l2(g2 + "Minutes", 1);
                    case s:
                        return l2(g2 + "Seconds", 2);
                    case i:
                        return l2(g2 + "Milliseconds", 3);
                    default:
                        return this.clone();
                }
            }, m2.endOf = function(t2) {
                return this.startOf(t2, false);
            }, m2.$set = function(t2, e2) {
                var n2, o2 = O.p(t2), h2 = "set" + (this.$u ? "UTC" : ""), $2 = (n2 = {
                }, n2[a] = h2 + "Date", n2[d] = h2 + "Date", n2[f] = h2 + "Month", n2[c] = h2 + "FullYear", n2[u] = h2 + "Hours", n2[s] = h2 + "Minutes", n2[i] = h2 + "Seconds", n2[r] = h2 + "Milliseconds", n2)[o2], l2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
                if (o2 === f || o2 === c) {
                    var y2 = this.clone().set(d, 1);
                    y2.$d[$2](l2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
                } else $2 && this.$d[$2](l2);
                return this.init(), this;
            }, m2.set = function(t2, e2) {
                return this.clone().$set(t2, e2);
            }, m2.get = function(t2) {
                return this[O.p(t2)]();
            }, m2.add = function(r2, h2) {
                var d2, $2 = this;
                r2 = Number(r2);
                var l2 = O.p(h2), y2 = function(t2) {
                    var e2 = w($2);
                    return O.w(e2.date(e2.date() + Math.round(t2 * r2)), $2);
                };
                if (l2 === f) return this.set(f, this.$M + r2);
                if (l2 === c) return this.set(c, this.$y + r2);
                if (l2 === a) return y2(1);
                if (l2 === o) return y2(7);
                var M3 = (d2 = {
                }, d2[s] = e, d2[u] = n, d2[i] = t, d2)[l2] || 1, m3 = this.$d.getTime() + r2 * M3;
                return O.w(m3, this);
            }, m2.subtract = function(t2, e2) {
                return this.add(-1 * t2, e2);
            }, m2.format = function(t2) {
                var e2 = this;
                if (!this.isValid()) return $;
                var n2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", r2 = O.z(this), i2 = this.$locale(), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = i2.weekdays, f2 = i2.months, h2 = function(t3, r3, i3, s3) {
                    return t3 && (t3[r3] || t3(e2, n2)) || i3[r3].substr(0, s3);
                }, c2 = function(t3) {
                    return O.s(s2 % 12 || 12, t3, "0");
                }, d2 = i2.meridiem || function(t3, e3, n3) {
                    var r3 = t3 < 12 ? "AM" : "PM";
                    return n3 ? r3.toLowerCase() : r3;
                }, l2 = {
                    YY: String(this.$y).slice(-2),
                    YYYY: this.$y,
                    M: a2 + 1,
                    MM: O.s(a2 + 1, 2, "0"),
                    MMM: h2(i2.monthsShort, a2, f2, 3),
                    MMMM: h2(f2, a2),
                    D: this.$D,
                    DD: O.s(this.$D, 2, "0"),
                    d: String(this.$W),
                    dd: h2(i2.weekdaysMin, this.$W, o2, 2),
                    ddd: h2(i2.weekdaysShort, this.$W, o2, 3),
                    dddd: o2[this.$W],
                    H: String(s2),
                    HH: O.s(s2, 2, "0"),
                    h: c2(1),
                    hh: c2(2),
                    a: d2(s2, u2, true),
                    A: d2(s2, u2, false),
                    m: String(u2),
                    mm: O.s(u2, 2, "0"),
                    s: String(this.$s),
                    ss: O.s(this.$s, 2, "0"),
                    SSS: O.s(this.$ms, 3, "0"),
                    Z: r2
                };
                return n2.replace(y, function(t3, e3) {
                    return e3 || l2[t3] || r2.replace(":", "");
                });
            }, m2.utcOffset = function() {
                return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
            }, m2.diff = function(r2, d2, $2) {
                var l2, y2 = O.p(d2), M3 = w(r2), m3 = (M3.utcOffset() - this.utcOffset()) * e, g2 = this - M3, D2 = O.m(this, M3);
                return D2 = (l2 = {
                }, l2[c] = D2 / 12, l2[f] = D2, l2[h] = D2 / 3, l2[o] = (g2 - m3) / 604800000, l2[a] = (g2 - m3) / 86400000, l2[u] = g2 / n, l2[s] = g2 / e, l2[i] = g2 / t, l2)[y2] || g2, $2 ? D2 : O.a(D2);
            }, m2.daysInMonth = function() {
                return this.endOf(f).$D;
            }, m2.$locale = function() {
                return v[this.$L];
            }, m2.locale = function(t2, e2) {
                if (!t2) return this.$L;
                var n2 = this.clone(), r2 = S(t2, e2, true);
                return r2 && (n2.$L = r2), n2;
            }, m2.clone = function() {
                return O.w(this.$d, this);
            }, m2.toDate = function() {
                return new Date(this.valueOf());
            }, m2.toJSON = function() {
                return this.isValid() ? this.toISOString() : null;
            }, m2.toISOString = function() {
                return this.$d.toISOString();
            }, m2.toString = function() {
                return this.$d.toUTCString();
            }, M2;
        }(), b = _.prototype;
        return w.prototype = b, [
            [
                "$ms",
                r
            ],
            [
                "$s",
                i
            ],
            [
                "$m",
                s
            ],
            [
                "$H",
                u
            ],
            [
                "$W",
                a
            ],
            [
                "$M",
                f
            ],
            [
                "$y",
                c
            ],
            [
                "$D",
                d
            ]
        ].forEach(function(t2) {
            b[t2[1]] = function(e2) {
                return this.$g(e2, t2[0], t2[1]);
            };
        }), w.extend = function(t2, e2) {
            return t2.$i || (t2(e2, _, w), t2.$i = true), w;
        }, w.locale = S, w.isDayjs = p2, w.unix = function(t2) {
            return w(1000 * t2);
        }, w.en = v[D], w.Ls = v, w.p = {
        }, w;
    });
});
const noColor1 = globalThis.Deno?.noColor ?? true;
let enabled1 = !noColor1;
function code1(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run1(str, code2) {
    return enabled1 ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
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
function green(str) {
    return run1(str, code1([
        32
    ], 39));
}
function white(str) {
    return run1(str, code1([
        37
    ], 39));
}
function gray(str) {
    return brightBlack(str);
}
function brightBlack(str) {
    return run1(str, code1([
        90
    ], 39));
}
const ANSI_PATTERN1 = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType1;
(function(DiffType2) {
    DiffType2["removed"] = "removed";
    DiffType2["common"] = "common";
    DiffType2["added"] = "added";
})(DiffType1 || (DiffType1 = {
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
                    type: DiffType1.common,
                    value: c
                })
            ),
            ...A.map((a)=>({
                    type: swapped ? DiffType1.added : DiffType1.removed,
                    value: a
                })
            ),
            ...suffixCommon.map((c)=>({
                    type: DiffType1.common,
                    value: c
                })
            ), 
        ];
    }
    const offset = N;
    const delta = M - N;
    const size4 = M + N + 1;
    const fp = new Array(size4).fill({
        y: -1
    });
    const routes = new Uint32Array((M * N + size4 + 1) * 2);
    const diffTypesPtrOffset = routes.length / 2;
    let ptr = 0;
    let p = -1;
    function backTrace(A1, B1, current, swapped1) {
        const M1 = A1.length;
        const N1 = B1.length;
        const result = [];
        let a = M1 - 1;
        let b = N1 - 1;
        let j = routes[current.id];
        let type = routes[current.id + diffTypesPtrOffset];
        while(true){
            if (!j && !type) break;
            const prev = j;
            if (type === 1) {
                result.unshift({
                    type: swapped1 ? DiffType1.removed : DiffType1.added,
                    value: B1[b]
                });
                b -= 1;
            } else if (type === 3) {
                result.unshift({
                    type: swapped1 ? DiffType1.added : DiffType1.removed,
                    value: A1[a]
                });
                a -= 1;
            } else {
                result.unshift({
                    type: DiffType1.common,
                    value: A1[a]
                });
                a -= 1;
                b -= 1;
            }
            j = routes[prev];
            type = routes[prev + diffTypesPtrOffset];
        }
        return result;
    }
    function createFP(slide, down, k, M1) {
        if (slide && slide.y === -1 && down && down.y === -1) {
            return {
                y: 0,
                id: 0
            };
        }
        if (down && down.y === -1 || k === M1 || (slide && slide.y) > (down && down.y) + 1) {
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
    function snake(k, slide, down, _offset, A1, B1) {
        const M1 = A1.length;
        const N1 = B1.length;
        if (k < -N1 || M1 < k) return {
            y: -1,
            id: -1
        };
        const fp1 = createFP(slide, down, k, M1);
        while(fp1.y + k < M1 && fp1.y < N1 && A1[fp1.y + k] === B1[fp1.y]){
            const prev = fp1.id;
            ptr++;
            fp1.id = ptr;
            fp1.y += 1;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = COMMON;
        }
        return fp1;
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
                type: DiffType1.common,
                value: c
            })
        ),
        ...backTrace(A, B, fp[delta + offset], swapped),
        ...suffixCommon.map((c)=>({
                type: DiffType1.common,
                value: c
            })
        ), 
    ];
}
const CAN_NOT_DISPLAY = "[Cannot display]";
class AssertionError1 extends Error {
    constructor(message2){
        super(message2);
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
        case DiffType1.added:
            return (s)=>green(bold1(s))
            ;
        case DiffType1.removed:
            return (s)=>red1(bold1(s))
            ;
        default:
            return white;
    }
}
function createSign(diffType) {
    switch(diffType){
        case DiffType1.added:
            return "+   ";
        case DiffType1.removed:
            return "-   ";
        default:
            return "    ";
    }
}
function buildMessage(diffResult) {
    const messages = [];
    messages.push("");
    messages.push("");
    messages.push(`    ${gray(bold1("[Diff]"))} ${red1(bold1("Actual"))} / ${green(bold1("Expected"))}`);
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
    throw new AssertionError1(msg);
}
function assertStrictEquals(actual, expected, msg) {
    if (actual === expected) {
        return;
    }
    let message3;
    if (msg) {
        message3 = msg;
    } else {
        const actualString = _format(actual);
        const expectedString = _format(expected);
        if (actualString === expectedString) {
            const withOffset = actualString.split("\n").map((l)=>`    ${l}`
            ).join("\n");
            message3 = `Values have the same structure but are not reference-equal:\n\n${red1(withOffset)}\n`;
        } else {
            try {
                const diffResult = diff(actualString.split("\n"), expectedString.split("\n"));
                const diffMsg = buildMessage(diffResult).join("\n");
                message3 = `Values are not strictly equal:\n${diffMsg}`;
            } catch  {
                message3 = `\n${red1(CAN_NOT_DISPLAY)} + \n\n`;
            }
        }
    }
    throw new AssertionError1(message3);
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
function isPosixPathSeparator(code2) {
    return code2 === 47;
}
function isPathSeparator(code2) {
    return isPosixPathSeparator(code2) || code2 === 92;
}
function isWindowsDeviceRoot(code2) {
    return code2 >= 97 && code2 <= 122 || code2 >= 65 && code2 <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code2;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code2 = path.charCodeAt(i);
        else if (isPathSeparator1(code2)) break;
        else code2 = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code2)) {
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
        } else if (code2 === 46 && dots !== -1) {
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
class DenoStdInternalError1 extends Error {
    constructor(message3){
        super(message3);
        this.name = "DenoStdInternalError";
    }
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg);
    }
}
const sep = "\\";
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
        const code2 = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code2)) {
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
            } else if (isWindowsDeviceRoot(code2)) {
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
        } else if (isPathSeparator(code2)) {
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
    const code2 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code2)) {
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
        } else if (isWindowsDeviceRoot(code2)) {
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
    } else if (isPathSeparator(code2)) {
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
    const code2 = path.charCodeAt(0);
    if (isPathSeparator(code2)) {
        return true;
    } else if (isWindowsDeviceRoot(code2)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join6(...paths) {
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
    assert1(firstPart != null);
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
                const code2 = resolvedPath.charCodeAt(2);
                if (code2 !== 63 && code2 !== 46) {
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
function dirname6(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code2)) {
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
        } else if (isWindowsDeviceRoot(code2)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code2)) {
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
function basename6(path, ext = "") {
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
            const code2 = path.charCodeAt(i);
            if (isPathSeparator(code2)) {
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
                    if (code2 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
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
        const code2 = path.charCodeAt(i);
        if (isPathSeparator(code2)) {
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
        if (code2 === 46) {
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
    let code2 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code2)) {
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
        } else if (isWindowsDeviceRoot(code2)) {
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
    } else if (isPathSeparator(code2)) {
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
        code2 = path.charCodeAt(i);
        if (isPathSeparator(code2)) {
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
        if (code2 === 46) {
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
const mod1 = function() {
    return {
        sep: sep,
        delimiter: delimiter,
        resolve: resolve,
        normalize: normalize,
        isAbsolute: isAbsolute,
        join: join6,
        relative: relative,
        toNamespacedPath: toNamespacedPath,
        dirname: dirname6,
        basename: basename6,
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
    const isAbsolute1 = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString(path, !isAbsolute1, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute1) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute1) return `/${path}`;
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
            const code2 = path.charCodeAt(i);
            if (code2 === 47) {
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
                    if (code2 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
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
        const code2 = path.charCodeAt(i);
        if (code2 === 47) {
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
        if (code2 === 46) {
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
    const isAbsolute2 = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute2) {
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
        const code2 = path.charCodeAt(i);
        if (code2 === 47) {
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
        if (code2 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute2) ret.dir = "/";
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
const mod2 = function() {
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
const path = isWindows ? mod1 : mod2;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join2 , normalize: normalize2 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path;
const align = {
    right: alignRight,
    center: alignCenter
};
const right = 1;
const left = 3;
class UI {
    constructor(opts2){
        var _a;
        this.width = opts2.width;
        this.wrap = (_a = opts2.wrap) !== null && _a !== void 0 ? _a : true;
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
function cliui(opts1, _mixin) {
    mixin = _mixin;
    return new UI({
        width: (opts1 === null || opts1 === void 0 ? void 0 : opts1.width) || getWindowWidth(),
        wrap: opts1 === null || opts1 === void 0 ? void 0 : opts1.wrap
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
function ui(opts1) {
    return cliui(opts1, {
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
function __default(start, callback) {
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
        const opts1 = Object.assign({
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
        const aliases = combineAliases(Object.assign(Object.create(null), opts1.alias));
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
        }, opts1.configuration);
        const defaults = Object.assign(Object.create(null), opts1.default);
        const configObjects = opts1.configObjects || [];
        const envPrefix = opts1.envPrefix;
        const notFlagsOption = configuration['populate--'];
        const notFlagsArgv = notFlagsOption ? '--' : '_';
        const newAliases = Object.create(null);
        const defaulted = Object.create(null);
        const __ = opts1.__ || mixin1.format;
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
        [].concat(opts1.array || []).filter(Boolean).forEach(function(opt) {
            const key = typeof opt === 'object' ? opt.key : opt;
            const assignment = Object.keys(opt).map(function(key1) {
                const arrayFlagKeys = {
                    boolean: 'bools',
                    string: 'strings',
                    number: 'numbers'
                };
                return arrayFlagKeys[key1];
            }).filter(Boolean).pop();
            if (assignment) {
                flags[assignment][key] = true;
            }
            flags.arrays[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts1.boolean || []).filter(Boolean).forEach(function(key) {
            flags.bools[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts1.string || []).filter(Boolean).forEach(function(key) {
            flags.strings[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts1.number || []).filter(Boolean).forEach(function(key) {
            flags.numbers[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts1.count || []).filter(Boolean).forEach(function(key) {
            flags.counts[key] = true;
            flags.keys.push(key);
        });
        [].concat(opts1.normalize || []).filter(Boolean).forEach(function(key) {
            flags.normalize[key] = true;
            flags.keys.push(key);
        });
        if (typeof opts1.narg === 'object') {
            Object.entries(opts1.narg).forEach(([key, value])=>{
                if (typeof value === 'number') {
                    flags.nargs[key] = value;
                    flags.keys.push(key);
                }
            });
        }
        if (typeof opts1.coerce === 'object') {
            Object.entries(opts1.coerce).forEach(([key, value])=>{
                if (typeof value === 'function') {
                    flags.coercions[key] = value;
                    flags.keys.push(key);
                }
            });
        }
        if (typeof opts1.config !== 'undefined') {
            if (Array.isArray(opts1.config) || typeof opts1.config === 'string') {
                [].concat(opts1.config).filter(Boolean).forEach(function(key) {
                    flags.configs[key] = true;
                });
            } else if (typeof opts1.config === 'object') {
                Object.entries(opts1.config).forEach(([key, value])=>{
                    if (typeof value === 'boolean' || typeof value === 'function') {
                        flags.configs[key] = value;
                    }
                });
            }
        }
        extendAliases(opts1.key, aliases, opts1.default, flags.arrays);
        Object.keys(defaults).forEach(function(key) {
            (flags.aliases[key] || []).forEach(function(alias) {
                defaults[alias] = defaults[key];
            });
        });
        let error1 = null;
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
        function eatNargs(i1, key, args1, argAfterEqualSign) {
            let ii;
            let toEat = checkAllAliases(key, flags.nargs);
            toEat = typeof toEat !== 'number' || isNaN(toEat) ? 1 : toEat;
            if (toEat === 0) {
                if (!isUndefined(argAfterEqualSign)) {
                    error1 = Error(__('Argument unexpected for: %s', key));
                }
                setArg(key, defaultValue(key));
                return i1;
            }
            let available = isUndefined(argAfterEqualSign) ? 0 : 1;
            if (configuration['nargs-eats-options']) {
                if (args1.length - (i1 + 1) + available < toEat) {
                    error1 = Error(__('Not enough arguments following: %s', key));
                }
                available = toEat;
            } else {
                for(ii = i1 + 1; ii < args1.length; ii++){
                    if (!args1[ii].match(/^-[^0-9]/) || args1[ii].match(negative) || isUnknownOptionAsArg(args1[ii])) available++;
                    else break;
                }
                if (available < toEat) error1 = Error(__('Not enough arguments following: %s', key));
            }
            let consumed = Math.min(available, toEat);
            if (!isUndefined(argAfterEqualSign) && consumed > 0) {
                setArg(key, argAfterEqualSign);
                consumed--;
            }
            for(ii = i1 + 1; ii < consumed + i1 + 1; ii++){
                setArg(key, args1[ii]);
            }
            return i1 + consumed;
        }
        function eatArray(i1, key, args1, argAfterEqualSign) {
            let argsToSet = [];
            let next = argAfterEqualSign || args1[i1 + 1];
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
                for(let ii = i1 + 1; ii < args1.length; ii++){
                    if (!configuration['greedy-arrays'] && argsToSet.length > 0 || nargsCount && typeof nargsCount === 'number' && argsToSet.length >= nargsCount) break;
                    next = args1[ii];
                    if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) break;
                    i1 = ii;
                    argsToSet.push(processValue(key, next));
                }
            }
            if (typeof nargsCount === 'number' && (nargsCount && argsToSet.length < nargsCount || isNaN(nargsCount) && argsToSet.length === 0)) {
                error1 = Error(__('Not enough arguments following: %s', key));
            }
            setArg(key, argsToSet);
            return i1;
        }
        function setArg(key, val) {
            if (/-/.test(key) && configuration['camel-case-expansion']) {
                const alias = key.split('.').map(function(prop) {
                    return camelCase(prop);
                }).join('.');
                addNewAlias(key, alias);
            }
            const value1 = processValue(key, val);
            const splitKey = key.split('.');
            setKey(argv, splitKey, value1);
            if (flags.aliases[key]) {
                flags.aliases[key].forEach(function(x) {
                    const keyProperties = x.split('.');
                    setKey(argv, keyProperties, value1);
                });
            }
            if (splitKey.length > 1 && configuration['dot-notation']) {
                (flags.aliases[splitKey[0]] || []).forEach(function(x) {
                    let keyProperties = x.split('.');
                    const a = [].concat(splitKey);
                    a.shift();
                    keyProperties = keyProperties.concat(a);
                    if (!(flags.aliases[key] || []).includes(keyProperties.join('.'))) {
                        setKey(argv, keyProperties, value1);
                    }
                });
            }
            if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
                const keys = [
                    key
                ].concat(flags.aliases[key] || []);
                keys.forEach(function(key1) {
                    Object.defineProperty(argvReturn, key1, {
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
                if (Array.isArray(val)) value = val.map((val1)=>{
                    return mixin1.normalize(val1);
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
        function setConfig(argv1) {
            const configLookup = Object.create(null);
            applyDefaultsAndAliases(configLookup, flags.aliases, defaults);
            Object.keys(flags.configs).forEach(function(configKey) {
                const configPath = argv1[configKey] || configLookup[configKey];
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
                                error1 = config;
                                return;
                            }
                        } else {
                            config = mixin1.require(resolvedConfigPath);
                        }
                        setConfigObject(config);
                    } catch (ex) {
                        if (ex.name === 'PermissionDenied') error1 = ex;
                        else if (argv1[configKey]) error1 = Error(__('Invalid JSON config file: %s', configPath));
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
        function applyEnvVars(argv1, configOnly) {
            if (typeof envPrefix === 'undefined') return;
            const prefix = typeof envPrefix === 'string' ? envPrefix : '';
            const env = mixin1.env();
            Object.keys(env).forEach(function(envVar) {
                if (prefix === '' || envVar.lastIndexOf(prefix, 0) === 0) {
                    const keys = envVar.split('__').map(function(key, i1) {
                        if (i1 === 0) {
                            key = key.substring(prefix.length);
                        }
                        return camelCase(key);
                    });
                    if ((configOnly && flags.configs[keys.join('.')] || !configOnly) && !hasKey(argv1, keys)) {
                        setArg(keys.join('.'), env[envVar]);
                    }
                }
            });
        }
        function applyCoercions(argv1) {
            let coerce;
            const applied = new Set();
            Object.keys(argv1).forEach(function(key) {
                if (!applied.has(key)) {
                    coerce = checkAllAliases(key, flags.coercions);
                    if (typeof coerce === 'function') {
                        try {
                            const value = maybeCoerceNumber(key, coerce(argv1[key]));
                            [].concat(flags.aliases[key] || [], key).forEach((ali)=>{
                                applied.add(ali);
                                argv1[ali] = value;
                            });
                        } catch (err) {
                            error1 = err;
                        }
                    }
                }
            });
        }
        function setPlaceholderKeys(argv1) {
            flags.keys.forEach((key)=>{
                if (~key.indexOf('.')) return;
                if (typeof argv1[key] === 'undefined') argv1[key] = undefined;
            });
            return argv1;
        }
        function applyDefaultsAndAliases(obj, aliases1, defaults1, canLog = false) {
            Object.keys(defaults1).forEach(function(key) {
                if (!hasKey(obj, key.split('.'))) {
                    setKey(obj, key.split('.'), defaults1[key]);
                    if (canLog) defaulted[key] = true;
                    (aliases1[key] || []).forEach(function(x) {
                        if (hasKey(obj, x.split('.'))) return;
                        setKey(obj, x.split('.'), defaults1[key]);
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
        function extendAliases(...args1) {
            args1.forEach(function(obj) {
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
            const setAlias = toCheck.find((key1)=>keys.includes(key1)
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
                    error1 = Error(__('Invalid configuration: %s, opts.count excludes opts.array.', key));
                    return true;
                } else if (checkAllAliases(key, flags.nargs)) {
                    error1 = Error(__('Invalid configuration: %s, opts.count excludes opts.narg.', key));
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
            error: error1,
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
    normalize: mod2.normalize,
    resolve: mod2.resolve,
    require: (path1)=>{
        if (!path1.match(/\.json$/)) {
            throw Error('only .json config files are supported in Deno');
        } else {
            return JSON.parse(Deno.readTextFileSync(path1));
        }
    }
});
const yargsParser = function Parser(args, opts1) {
    const result = parser.parse(args.slice(), opts1);
    return result.argv;
};
yargsParser.detailed = function(args, opts1) {
    return parser.parse(args.slice(), opts1);
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
function y18n(opts2, _shim) {
    shim = _shim;
    const y18n1 = new Y18N(opts2);
    return {
        __: y18n1.__.bind(y18n1),
        __n: y18n1.__n.bind(y18n1),
        setLocale: y18n1.setLocale.bind(y18n1),
        getLocale: y18n1.getLocale.bind(y18n1),
        updateLocale: y18n1.updateLocale.bind(y18n1),
        locale: y18n1.locale
    };
}
var State;
(function(State1) {
    State1[State1["PASSTHROUGH"] = 0] = "PASSTHROUGH";
    State1[State1["PERCENT"] = 1] = "PERCENT";
    State1[State1["POSITIONAL"] = 2] = "POSITIONAL";
    State1[State1["PRECISION"] = 3] = "PRECISION";
    State1[State1["WIDTH"] = 4] = "WIDTH";
})(State || (State = {
}));
var WorP;
(function(WorP1) {
    WorP1[WorP1["WIDTH"] = 0] = "WIDTH";
    WorP1[WorP1["PRECISION"] = 1] = "PRECISION";
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
const min1 = Math.min;
const UNICODE_REPLACEMENT_CHARACTER = "\ufffd";
const FLOAT_REGEXP = /(-?)(\d)\.?(\d*)e([+-])(\d+)/;
var F;
(function(F1) {
    F1[F1["sign"] = 1] = "sign";
    F1[F1["mantissa"] = 2] = "mantissa";
    F1[F1["fractional"] = 3] = "fractional";
    F1[F1["esign"] = 4] = "esign";
    F1[F1["exponent"] = 5] = "exponent";
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
        const format5 = this.format;
        this.i++;
        let err = false;
        for(; this.i !== this.format.length; ++this.i){
            if (format5[this.i] === "]") {
                break;
            }
            positional *= 10;
            const val = parseInt(format5[this.i]);
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
                    const end = prec !== -1 ? min1(prec, val.length) : val.length;
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
            const options6 = this.flags.precision !== -1 ? {
                depth: this.flags.precision
            } : {
            };
            return this.pad(Deno.inspect(val, options6));
        } else {
            const p = this.flags.precision;
            return p === -1 ? val.toString() : val.toString().substr(0, p);
        }
    }
    fmtJ(val) {
        return JSON.stringify(val);
    }
}
function sprintf(format5, ...args1) {
    const printf = new Printf(format5, ...args1);
    return printf.doPrintf();
}
const __default1 = {
    fs: {
        readFileSync: (path1)=>{
            try {
                return Deno.readTextFileSync(path1);
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
            return mod2.resolve(base, p1, p2);
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
const y18n1 = (opts2)=>{
    return y18n(opts2, __default1);
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
const argv1 = [
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
} catch (err) {
    if (err.name !== 'PermissionDenied') {
        throw err;
    }
}
const path1 = {
    basename: basename2,
    dirname: dirname2,
    extname: extname2,
    relative: (p1, p2)=>{
        try {
            return mod2.relative(p1, p2);
        } catch (err) {
            if (err.name !== 'PermissionDenied') {
                throw err;
            }
            return p1;
        }
    },
    resolve: mod2.resolve
};
const __default2 = {
    assert: {
        notStrictEqual: assertNotEquals,
        strictEqual: assertStrictEquals
    },
    cliui: ui,
    findUp: __default,
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
        argv: ()=>argv1
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
        directory: mod2.resolve(__dirname, '../../locales'),
        updateFiles: false
    })
};
function assertNotStrictEqual(actual, expected, shim1, message4) {
    shim1.assert.notStrictEqual(actual, expected, message4);
}
function assertSingleKey(actual, shim1) {
    shim1.assert.strictEqual(typeof actual, 'string');
}
function objectKeys(object) {
    return Object.keys(object);
}
const completionShTemplate = `###-begin-{{app_name}}-completions-###\n#\n# yargs command completion script\n#\n# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc\n#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.\n#\n_{{app_name}}_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word="\${COMP_WORDS[COMP_CWORD]}"\n    args=("\${COMP_WORDS[@]}")\n\n    # ask yargs to generate completions.\n    type_list=$({{app_path}} --get-yargs-completions "\${args[@]}")\n\n    COMPREPLY=( $(compgen -W "\${type_list}" -- \${cur_word}) )\n\n    # if no match was found, fall back to filename completion\n    if [ \${#COMPREPLY[@]} -eq 0 ]; then\n      COMPREPLY=()\n    fi\n\n    return 0\n}\ncomplete -o default -F _{{app_name}}_yargs_completions {{app_name}}\n###-end-{{app_name}}-completions-###\n`;
const completionZshTemplate = `#compdef {{app_name}}\n###-begin-{{app_name}}-completions-###\n#\n# yargs command completion script\n#\n# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc\n#    or {{app_path}} {{completion_command}} >> ~/.zsh_profile on OSX.\n#\n_{{app_name}}_yargs_completions()\n{\n  local reply\n  local si=$IFS\n  IFS=$'\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))\n  IFS=$si\n  _describe 'values' reply\n}\ncompdef _{{app_name}}_yargs_completions {{app_name}}\n###-end-{{app_name}}-completions-###\n`;
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
    splitCommand.forEach((cmd1, i)=>{
        let variadic = false;
        cmd1 = cmd1.replace(/\s/g, '');
        if (/\.+[\]>]/.test(cmd1) && i === splitCommand.length - 1) variadic = true;
        if (/^\[/.test(cmd1)) {
            parsedCommand.optional.push({
                cmd: cmd1.replace(bregex, '').split('|'),
                variadic
            });
        } else {
            parsedCommand.demanded.push({
                cmd: cmd1.replace(bregex, '').split('|'),
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
        const args1 = [].slice.call(callerArguments);
        while(args1.length && args1[args1.length - 1] === undefined)args1.pop();
        const length = _length || args1.length;
        if (length < parsed.demanded.length) {
            throw new YError(`Not enough arguments provided. Expected ${parsed.demanded.length} but received ${args1.length}.`);
        }
        const totalCommands = parsed.demanded.length + parsed.optional.length;
        if (length > totalCommands) {
            throw new YError(`Too many arguments provided. Expected max ${totalCommands} but received ${length}.`);
        }
        parsed.demanded.forEach((demanded)=>{
            const arg = args1.shift();
            const observedType = guessType(arg);
            const matchingTypes = demanded.cmd.filter((type)=>type === observedType || type === '*'
            );
            if (matchingTypes.length === 0) argumentTypeError(observedType, demanded.cmd, position);
            position += 1;
        });
        parsed.optional.forEach((optional)=>{
            if (args1.length === 0) return;
            const arg = args1.shift();
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
    constructor(yargs1){
        this.globalMiddleware = [];
        this.frozens = [];
        this.yargs = yargs1;
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
function applyMiddleware(argv1, yargs1, middlewares, beforeValidation) {
    return middlewares.reduce((acc, middleware)=>{
        if (middleware.applyBeforeValidation !== beforeValidation) {
            return acc;
        }
        if (isPromise(acc)) {
            return acc.then((initialObj)=>Promise.all([
                    initialObj,
                    middleware(initialObj, yargs1), 
                ])
            ).then(([initialObj, middlewareObj])=>Object.assign(initialObj, middlewareObj)
            );
        } else {
            const result = middleware(acc, yargs1);
            return isPromise(result) ? result.then((middlewareObj)=>Object.assign(acc, middlewareObj)
            ) : Object.assign(acc, result);
        }
    }, argv1);
}
function maybeAsyncResult(getResult, resultHandler, errorHandler = (err)=>{
    throw err;
}) {
    try {
        const result = isFunction(getResult) ? getResult() : getResult;
        return isPromise(result) ? result.then((result1)=>resultHandler(result1)
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
    for(let i = 0, files = Object.keys(require.cache), mod3; i < files.length; i++){
        mod3 = require.cache[files[i]];
        if (mod3.exports === exported) return mod3;
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
function usage(yargs1, shim1) {
    const __ = shim1.y18n.__;
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
        const [enabled2, message4] = parseFunctionArgs();
        failMessage = message4;
        showHelpOnFail = enabled2;
        return self;
    };
    let failureOutput = false;
    self.fail = function fail(msg1, err) {
        const logger = yargs1.getInternalMethods().getLoggerInstance();
        if (fails.length) {
            for(let i = fails.length - 1; i >= 0; --i){
                const fail1 = fails[i];
                if (isBoolean(fail1)) {
                    if (err) throw err;
                    else if (msg1) throw Error(msg1);
                } else {
                    fail1(msg1, err, self);
                }
            }
        } else {
            if (yargs1.getExitProcess()) setBlocking(true);
            if (!failureOutput) {
                failureOutput = true;
                if (showHelpOnFail) {
                    yargs1.showHelp('error');
                    logger.error();
                }
                if (msg1 || err) logger.error(msg1 || err);
                if (failMessage) {
                    if (msg1 || err) logger.error('');
                    logger.error(failMessage);
                }
            }
            err = err || new YError(msg1);
            if (yargs1.getExitProcess()) {
                return yargs1.exit(1);
            } else if (yargs1.getInternalMethods().hasParseCallback()) {
                return yargs1.exit(1, err);
            } else {
                throw err;
            }
        }
    };
    let usages = [];
    let usageDisabled = false;
    self.usage = (msg1, description)=>{
        if (msg1 === null) {
            usageDisabled = true;
            usages = [];
            return self;
        }
        usageDisabled = false;
        usages.push([
            msg1,
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
    self.epilog = (msg1)=>{
        epilogs.push(msg1);
    };
    let wrapSet = false;
    let wrap1;
    self.wrap = (cols)=>{
        wrapSet = true;
        wrap1 = cols;
    };
    function getWrap() {
        if (!wrapSet) {
            wrap1 = windowWidth();
            wrapSet = true;
        }
        return wrap1;
    }
    const deferY18nLookupPrefix = '__yargsString__:';
    self.deferY18nLookup = (str)=>deferY18nLookupPrefix + str
    ;
    self.help = function help() {
        if (cachedHelpMessage) return cachedHelpMessage;
        normalizeAliases();
        const base$0 = yargs1.customScriptName ? yargs1.$0 : shim1.path.basename(yargs1.$0);
        const demandedOptions = yargs1.getDemandedOptions();
        const demandedCommands = yargs1.getDemandedCommands();
        const deprecatedOptions = yargs1.getDeprecatedOptions();
        const groups = yargs1.getGroups();
        const options6 = yargs1.getOptions();
        let keys = [];
        keys = keys.concat(Object.keys(descriptions));
        keys = keys.concat(Object.keys(demandedOptions));
        keys = keys.concat(Object.keys(demandedCommands));
        keys = keys.concat(Object.keys(options6.default));
        keys = keys.filter(filterHiddenOptions);
        keys = Object.keys(keys.reduce((acc, key)=>{
            if (key !== '_') acc[key] = true;
            return acc;
        }, {
        }));
        const theWrap = getWrap();
        const ui1 = shim1.cliui({
            width: theWrap,
            wrap: !!theWrap
        });
        if (!usageDisabled) {
            if (usages.length) {
                usages.forEach((usage1)=>{
                    ui1.div(`${usage1[0].replace(/\$0/g, base$0)}`);
                    if (usage1[1]) {
                        ui1.div({
                            text: `${usage1[1]}`,
                            padding: [
                                1,
                                0,
                                0,
                                0
                            ]
                        });
                    }
                });
                ui1.div();
            } else if (commands.length) {
                let u = null;
                if (demandedCommands._) {
                    u = `${base$0} <${__('command')}>\n`;
                } else {
                    u = `${base$0} [${__('command')}]\n`;
                }
                ui1.div(`${u}`);
            }
        }
        if (commands.length > 1 || commands.length === 1 && !commands[0][2]) {
            ui1.div(__('Commands:'));
            const context = yargs1.getInternalMethods().getContext();
            const parentCommands = context.commands.length ? `${context.commands.join(' ')} ` : '';
            if (yargs1.getInternalMethods().getParserConfiguration()['sort-commands'] === true) {
                commands = commands.sort((a, b)=>a[0].localeCompare(b[0])
                );
            }
            commands.forEach((command1)=>{
                const commandString = `${base$0} ${parentCommands}${command1[0].replace(/^\$0 ?/, '')}`;
                ui1.span({
                    text: commandString,
                    padding: [
                        0,
                        2,
                        0,
                        2
                    ],
                    width: maxWidth(commands, theWrap, `${base$0}${parentCommands}`) + 4
                }, {
                    text: command1[1]
                });
                const hints = [];
                if (command1[2]) hints.push(`[${__('default')}]`);
                if (command1[3] && command1[3].length) {
                    hints.push(`[${__('aliases:')} ${command1[3].join(', ')}]`);
                }
                if (command1[4]) {
                    if (typeof command1[4] === 'string') {
                        hints.push(`[${__('deprecated: %s', command1[4])}]`);
                    } else {
                        hints.push(`[${__('deprecated')}]`);
                    }
                }
                if (hints.length) {
                    ui1.div({
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
                    ui1.div();
                }
            });
            ui1.div();
        }
        const aliasKeys = (Object.keys(options6.alias) || []).concat(Object.keys(yargs1.parsed.newAliases) || []);
        keys = keys.filter((key)=>!yargs1.parsed.newAliases[key] && aliasKeys.every((alias)=>(options6.alias[alias] || []).indexOf(key) === -1
            )
        );
        const defaultGroup = __('Options:');
        if (!groups[defaultGroup]) groups[defaultGroup] = [];
        addUngroupedKeys(keys, options6.alias, groups, defaultGroup);
        const isLongSwitch = (sw)=>/^--/.test(getText(sw))
        ;
        const displayedGroups = Object.keys(groups).filter((groupName)=>groups[groupName].length > 0
        ).map((groupName)=>{
            const normalizedKeys = groups[groupName].filter(filterHiddenOptions).map((key)=>{
                if (~aliasKeys.indexOf(key)) return key;
                for(let i = 0, aliasKey; (aliasKey = aliasKeys[i]) !== undefined; i++){
                    if (~(options6.alias[aliasKey] || []).indexOf(key)) return aliasKey;
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
                ].concat(options6.alias[key] || []).map((sw)=>{
                    if (groupName === self.getPositionalGroupName()) return sw;
                    else {
                        return (/^[0-9]$/.test(sw) ? ~options6.boolean.indexOf(key) ? '-' : '--' : sw.length > 1 ? '--' : '-') + sw;
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
            ui1.div(groupName);
            normalizedKeys.forEach((key)=>{
                const kswitch = switches[key];
                let desc = descriptions[key] || '';
                let type = null;
                if (~desc.lastIndexOf(deferY18nLookupPrefix)) desc = __(desc.substring(deferY18nLookupPrefix.length));
                if (~options6.boolean.indexOf(key)) type = `[${__('boolean')}]`;
                if (~options6.count.indexOf(key)) type = `[${__('count')}]`;
                if (~options6.string.indexOf(key)) type = `[${__('string')}]`;
                if (~options6.normalize.indexOf(key)) type = `[${__('string')}]`;
                if (~options6.array.indexOf(key)) type = `[${__('array')}]`;
                if (~options6.number.indexOf(key)) type = `[${__('number')}]`;
                const deprecatedExtra = (deprecated)=>typeof deprecated === 'string' ? `[${__('deprecated: %s', deprecated)}]` : `[${__('deprecated')}]`
                ;
                const extra = [
                    key in deprecatedOptions ? deprecatedExtra(deprecatedOptions[key]) : null,
                    type,
                    key in demandedOptions ? `[${__('required')}]` : null,
                    options6.choices && options6.choices[key] ? `[${__('choices:')} ${self.stringifiedValues(options6.choices[key])}]` : null,
                    defaultString(options6.default[key], options6.defaultDescription[key]), 
                ].filter(Boolean).join(' ');
                ui1.span({
                    text: getText(kswitch),
                    padding: [
                        0,
                        2,
                        0,
                        2 + getIndentation(kswitch)
                    ],
                    width: maxWidth(switches, theWrap) + 4
                }, desc);
                if (extra) ui1.div({
                    text: extra,
                    padding: [
                        0,
                        0,
                        0,
                        2
                    ],
                    align: 'right'
                });
                else ui1.div();
            });
            ui1.div();
        });
        if (examples.length) {
            ui1.div(__('Examples:'));
            examples.forEach((example)=>{
                example[0] = example[0].replace(/\$0/g, base$0);
            });
            examples.forEach((example)=>{
                if (example[1] === '') {
                    ui1.div({
                        text: example[0],
                        padding: [
                            0,
                            2,
                            0,
                            2
                        ]
                    });
                } else {
                    ui1.div({
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
            ui1.div();
        }
        if (epilogs.length > 0) {
            const e = epilogs.map((epilog)=>epilog.replace(/\$0/g, base$0)
            ).join('\n');
            ui1.div(`${e}\n`);
        }
        return ui1.toString().replace(/\s*$/, '');
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
            width = Math.max(shim1.stringWidth(modifier ? `${modifier} ${getText(v[0])}` : getText(v[0])) + getIndentation(v[0]), width);
        });
        if (theWrap) width = Math.min(width, parseInt((theWrap * 0.5).toString(), 10));
        return width;
    }
    function normalizeAliases() {
        const demandedOptions = yargs1.getDemandedOptions();
        const options6 = yargs1.getOptions();
        (Object.keys(options6.alias) || []).forEach((key)=>{
            options6.alias[key].forEach((alias)=>{
                if (descriptions[alias]) self.describe(key, descriptions[alias]);
                if (alias in demandedOptions) yargs1.demandOption(key, demandedOptions[alias]);
                if (~options6.boolean.indexOf(alias)) yargs1.boolean(key);
                if (~options6.count.indexOf(alias)) yargs1.count(key);
                if (~options6.string.indexOf(alias)) yargs1.string(key);
                if (~options6.normalize.indexOf(alias)) yargs1.normalize(key);
                if (~options6.array.indexOf(alias)) yargs1.array(key);
                if (~options6.number.indexOf(alias)) yargs1.number(key);
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
        return yargs1.getOptions().hiddenOptions.indexOf(key) < 0 || yargs1.parsed.argv[yargs1.getOptions().showHiddenOpt];
    }
    self.showHelp = (level)=>{
        const logger = yargs1.getInternalMethods().getLoggerInstance();
        if (!level) level = 'error';
        const emit = typeof level === 'function' ? level : logger[level];
        emit(self.help());
    };
    self.functionDescription = (fn)=>{
        const description = fn.name ? shim1.Parser.decamelize(fn.name, '-') : __('generated-value');
        return [
            '(',
            description,
            ')'
        ].join('');
    };
    self.stringifiedValues = function stringifiedValues(values, separator) {
        let string = '';
        const sep3 = separator || ', ';
        const array = [].concat(values);
        if (!values || !array.length) return string;
        array.forEach((value)=>{
            if (string.length) string += sep3;
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
        const maxWidth1 = 80;
        if (shim1.process.stdColumns) {
            return Math.min(80, shim1.process.stdColumns);
        } else {
            return 80;
        }
    }
    let version = null;
    self.version = (ver)=>{
        version = ver;
    };
    self.showVersion = (level)=>{
        const logger = yargs1.getInternalMethods().getLoggerInstance();
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
function validation2(yargs1, usage1, shim1) {
    const __ = shim1.y18n.__;
    const __n = shim1.y18n.__n;
    const self = {
    };
    self.nonOptionCount = function nonOptionCount(argv1) {
        const demandedCommands = yargs1.getDemandedCommands();
        const positionalCount = argv1._.length + (argv1['--'] ? argv1['--'].length : 0);
        const _s = positionalCount - yargs1.getInternalMethods().getContext().commands.length;
        if (demandedCommands._ && (_s < demandedCommands._.min || _s > demandedCommands._.max)) {
            if (_s < demandedCommands._.min) {
                if (demandedCommands._.minMsg !== undefined) {
                    usage1.fail(demandedCommands._.minMsg ? demandedCommands._.minMsg.replace(/\$0/g, _s.toString()).replace(/\$1/, demandedCommands._.min.toString()) : null);
                } else {
                    usage1.fail(__n('Not enough non-option arguments: got %s, need at least %s', 'Not enough non-option arguments: got %s, need at least %s', _s, _s.toString(), demandedCommands._.min.toString()));
                }
            } else if (_s > demandedCommands._.max) {
                if (demandedCommands._.maxMsg !== undefined) {
                    usage1.fail(demandedCommands._.maxMsg ? demandedCommands._.maxMsg.replace(/\$0/g, _s.toString()).replace(/\$1/, demandedCommands._.max.toString()) : null);
                } else {
                    usage1.fail(__n('Too many non-option arguments: got %s, maximum of %s', 'Too many non-option arguments: got %s, maximum of %s', _s, _s.toString(), demandedCommands._.max.toString()));
                }
            }
        }
    };
    self.positionalCount = function positionalCount(required, observed) {
        if (observed < required) {
            usage1.fail(__n('Not enough non-option arguments: got %s, need at least %s', 'Not enough non-option arguments: got %s, need at least %s', observed, observed + '', required + ''));
        }
    };
    self.requiredArguments = function requiredArguments(argv1, demandedOptions) {
        let missing = null;
        for (const key of Object.keys(demandedOptions)){
            if (!Object.prototype.hasOwnProperty.call(argv1, key) || typeof argv1[key] === 'undefined') {
                missing = missing || {
                };
                missing[key] = demandedOptions[key];
            }
        }
        if (missing) {
            const customMsgs = [];
            for (const key1 of Object.keys(missing)){
                const msg1 = missing[key1];
                if (msg1 && customMsgs.indexOf(msg1) < 0) {
                    customMsgs.push(msg1);
                }
            }
            const customMsg = customMsgs.length ? `\n${customMsgs.join('\n')}` : '';
            usage1.fail(__n('Missing required argument: %s', 'Missing required arguments: %s', Object.keys(missing).length, Object.keys(missing).join(', ') + customMsg));
        }
    };
    self.unknownArguments = function unknownArguments(argv1, aliases, positionalMap, isDefaultCommand, checkPositionals = true) {
        const commandKeys = yargs1.getInternalMethods().getCommandInstance().getCommands();
        const unknown = [];
        const currentContext = yargs1.getInternalMethods().getContext();
        Object.keys(argv1).forEach((key)=>{
            if (specialKeys.indexOf(key) === -1 && !Object.prototype.hasOwnProperty.call(positionalMap, key) && !Object.prototype.hasOwnProperty.call(yargs1.getInternalMethods().getParseContext(), key) && !self.isValidAndSomeAliasIsNotNew(key, aliases)) {
                unknown.push(key);
            }
        });
        if (checkPositionals && (currentContext.commands.length > 0 || commandKeys.length > 0 || isDefaultCommand)) {
            argv1._.slice(currentContext.commands.length).forEach((key)=>{
                if (commandKeys.indexOf('' + key) === -1) {
                    unknown.push('' + key);
                }
            });
        }
        if (unknown.length > 0) {
            usage1.fail(__n('Unknown argument: %s', 'Unknown arguments: %s', unknown.length, unknown.join(', ')));
        }
    };
    self.unknownCommands = function unknownCommands(argv1) {
        const commandKeys = yargs1.getInternalMethods().getCommandInstance().getCommands();
        const unknown = [];
        const currentContext = yargs1.getInternalMethods().getContext();
        if (currentContext.commands.length > 0 || commandKeys.length > 0) {
            argv1._.slice(currentContext.commands.length).forEach((key)=>{
                if (commandKeys.indexOf('' + key) === -1) {
                    unknown.push('' + key);
                }
            });
        }
        if (unknown.length > 0) {
            usage1.fail(__n('Unknown command: %s', 'Unknown commands: %s', unknown.length, unknown.join(', ')));
            return true;
        } else {
            return false;
        }
    };
    self.isValidAndSomeAliasIsNotNew = function isValidAndSomeAliasIsNotNew(key, aliases) {
        if (!Object.prototype.hasOwnProperty.call(aliases, key)) {
            return false;
        }
        const newAliases = yargs1.parsed.newAliases;
        return [
            key,
            ...aliases[key]
        ].some((a)=>!Object.prototype.hasOwnProperty.call(newAliases, a) || !newAliases[key]
        );
    };
    self.limitedChoices = function limitedChoices(argv1) {
        const options6 = yargs1.getOptions();
        const invalid = {
        };
        if (!Object.keys(options6.choices).length) return;
        Object.keys(argv1).forEach((key)=>{
            if (specialKeys.indexOf(key) === -1 && Object.prototype.hasOwnProperty.call(options6.choices, key)) {
                [].concat(argv1[key]).forEach((value)=>{
                    if (options6.choices[key].indexOf(value) === -1 && value !== undefined) {
                        invalid[key] = (invalid[key] || []).concat(value);
                    }
                });
            }
        });
        const invalidKeys = Object.keys(invalid);
        if (!invalidKeys.length) return;
        let msg1 = __('Invalid values:');
        invalidKeys.forEach((key)=>{
            msg1 += `\n  ${__('Argument: %s, Given: %s, Choices: %s', key, usage1.stringifiedValues(invalid[key]), usage1.stringifiedValues(options6.choices[key]))}`;
        });
        usage1.fail(msg1);
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
            yargs1.global(key);
            if (!implied[key]) {
                implied[key] = [];
            }
            if (Array.isArray(value)) {
                value.forEach((i)=>self.implies(key, i)
                );
            } else {
                assertNotStrictEqual(value, undefined, shim1);
                implied[key].push(value);
            }
        }
    };
    self.getImplied = function getImplied() {
        return implied;
    };
    function keyExists(argv1, val) {
        const num = Number(val);
        val = isNaN(num) ? val : num;
        if (typeof val === 'number') {
            val = argv1._.length >= val;
        } else if (val.match(/^--no-.+/)) {
            val = val.match(/^--no-(.+)/)[1];
            val = !argv1[val];
        } else {
            val = argv1[val];
        }
        return val;
    }
    self.implications = function implications(argv1) {
        const implyFail = [];
        Object.keys(implied).forEach((key)=>{
            const origKey = key;
            (implied[key] || []).forEach((value)=>{
                let key1 = origKey;
                const origValue = value;
                key1 = keyExists(argv1, key1);
                value = keyExists(argv1, value);
                if (key1 && !value) {
                    implyFail.push(` ${origKey} -> ${origValue}`);
                }
            });
        });
        if (implyFail.length) {
            let msg1 = `${__('Implications failed:')}\n`;
            implyFail.forEach((value)=>{
                msg1 += value;
            });
            usage1.fail(msg1);
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
            yargs1.global(key);
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
    self.conflicting = function conflictingFn(argv1) {
        Object.keys(argv1).forEach((key)=>{
            if (conflicting[key]) {
                conflicting[key].forEach((value)=>{
                    if (value && argv1[key] !== undefined && argv1[value] !== undefined) {
                        usage1.fail(__('Arguments %s and %s are mutually exclusive', key, value));
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
        if (recommended) usage1.fail(__('Did you mean %s?', recommended));
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
        assertNotStrictEqual(frozen, undefined, shim1);
        ({ implied , conflicting  } = frozen);
    };
    return self;
}
let previouslyVisitedConfigs = [];
let shim1;
function applyExtends(config, cwd1, mergeExtends, _shim) {
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
            pathToDefault = getPathToDefaultConfig(cwd1, config.extends);
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
function getPathToDefaultConfig(cwd1, pathToExtend) {
    return shim1.path.resolve(cwd1, pathToExtend);
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
    return (processArgs = [], cwd1 = _shim.process.cwd(), parentRequire)=>{
        const yargs1 = new YargsInstance(processArgs, cwd1, parentRequire, _shim);
        Object.defineProperty(yargs1, 'argv', {
            get: ()=>{
                return yargs1.parse();
            },
            enumerable: true
        });
        yargs1.help();
        yargs1.version();
        return yargs1;
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
            return innerArgv.then((argv1)=>{
                return {
                    aliases: innerYargs.parsed.aliases,
                    innerArgv: argv1
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
        const pc = parentCommands.filter((c1)=>{
            return !DEFAULT_MARKER.test(c1);
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
            const validation2 = yargs.getInternalMethods().runValidation(aliases, positionalMap, yargs.parsed.error, isDefaultCommand);
            innerArgv = maybeAsyncResult(innerArgv, (result)=>{
                validation2(result);
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
                innerArgv.catch((error1)=>{
                    try {
                        yargs.getInternalMethods().getUsageInstance().fail(null, error1);
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
        const options6 = Object.assign({
        }, yargs.getOptions());
        options6.default = Object.assign(parseOptions.default, options6.default);
        for (const key of Object.keys(parseOptions.alias)){
            options6.alias[key] = (options6.alias[key] || []).concat(parseOptions.alias[key]);
        }
        options6.array = options6.array.concat(parseOptions.array);
        options6.config = {
        };
        const unparsed = [];
        Object.keys(positionalMap).forEach((key1)=>{
            positionalMap[key1].map((value)=>{
                if (options6.configuration['unknown-options-as-args']) options6.key[key1] = true;
                unparsed.push(`--${key1}`);
                unparsed.push(value);
            });
        });
        if (!unparsed.length) return;
        const config = Object.assign({
        }, options6.configuration, {
            'populate--': false
        });
        const parsed = this.shim.Parser.detailed(unparsed, Object.assign({
        }, options6, {
            configuration: config
        }));
        if (parsed.error) {
            yargs.getInternalMethods().getUsageInstance().fail(parsed.error.message, parsed.error);
        } else {
            const positionalKeys = Object.keys(positionalMap);
            Object.keys(positionalMap).forEach((key1)=>{
                positionalKeys.push(...parsed.aliases[key1]);
            });
            Object.keys(parsed.argv).forEach((key1)=>{
                if (positionalKeys.indexOf(key1) !== -1) {
                    if (!positionalMap[key1]) positionalMap[key1] = parsed.argv[key1];
                    argv[key1] = parsed.argv[key1];
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
        const mod3 = whichModule(obj);
        if (!mod3) throw new Error(`No command name given for module: ${this.shim.inspect(obj)}`);
        return this.commandFromFilename(mod3.filename);
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
function command(usage2, validation2, globalMiddleware1, shim3) {
    return new CommandInstance(usage2, validation2, globalMiddleware1, shim3);
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
    constructor(yargs2, usage2, command1, shim3){
        var _a1, _b, _c;
        this.yargs = yargs2;
        this.usage = usage2;
        this.command = command1;
        this.shim = shim3;
        this.completionKey = 'get-yargs-completions';
        this.aliases = null;
        this.customCompletionFunction = null;
        this.zshShell = (_c = ((_a1 = this.shim.getEnv('SHELL')) === null || _a1 === void 0 ? void 0 : _a1.includes('zsh')) || ((_b = this.shim.getEnv('ZSH_NAME')) === null || _b === void 0 ? void 0 : _b.includes('zsh'))) !== null && _c !== void 0 ? _c : false;
    }
    defaultCompletion(args, argv, current, done) {
        const handlers1 = this.command.getCommandHandlers();
        for(let i = 0, ii = args.length; i < ii; ++i){
            if (handlers1[args[i]] && handlers1[args[i]].builder) {
                const builder = handlers1[args[i]].builder;
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
            const options6 = this.yargs.getOptions();
            const positionalKeys = this.yargs.getGroups()[this.usage.getPositionalGroupName()] || [];
            Object.keys(options6.key).forEach((key)=>{
                const negable = !!options6.configuration['boolean-negation'] && options6.boolean.includes(key);
                const isPositionalKey = positionalKeys.includes(key);
                if (!isPositionalKey && !this.argsContainKey(args, argv, key, negable)) {
                    this.completeOptionKey(key, completions, current);
                    if (negable && !!options6.default[key]) this.completeOptionKey(`no-${key}`, completions, current);
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
        const argv2 = this.yargs.parse(args, true);
        const completionFunction = this.customCompletionFunction ? (argv3)=>this.customCompletion(args, argv3, current, done)
         : (argv3)=>this.defaultCompletion(args, argv3, current, done)
        ;
        return isPromise(argv2) ? argv2.then(completionFunction) : completionFunction(argv2);
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
function completion(yargs3, usage3, command2, shim4) {
    return new Completion(yargs3, usage3, command2, shim4);
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
        this.middleware((argv2, _yargs)=>{
            return maybeAsyncResult(()=>{
                return f(argv2);
            }, (result)=>{
                if (!result) {
                    __classPrivateFieldGet(this, _usage).fail(__classPrivateFieldGet(this, _shim_1).y18n.__('Argument check failed: %s', f.toString()));
                } else if (typeof result === 'string' || result instanceof Error) {
                    __classPrivateFieldGet(this, _usage).fail(result.toString(), result);
                }
                return argv2;
            }, (err)=>{
                __classPrivateFieldGet(this, _usage).fail(err.message ? err.message : err.toString(), err);
                return argv2;
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
        __classPrivateFieldGet(this, _globalMiddleware).addCoerceMiddleware((argv2, yargs3)=>{
            let aliases;
            return maybeAsyncResult(()=>{
                aliases = yargs3.getAliases();
                return value(argv2[keys]);
            }, (result)=>{
                argv2[keys] = result;
                if (aliases[keys]) {
                    for (const alias of aliases[keys]){
                        argv2[alias] = result;
                    }
                }
                return argv2;
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
            return new Promise((resolve3, reject)=>{
                __classPrivateFieldGet(this, _completion).getCompletion(args, (err, completions)=>{
                    if (err) reject(err);
                    else resolve3(completions);
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
                const parse3 = this[kRunYargsParserAndExecuteCommands](__classPrivateFieldGet(this, _processArgs), undefined, undefined, 0, true);
                if (isPromise(parse3)) {
                    return parse3.then(()=>{
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
            return parsed.then((argv2)=>{
                if (__classPrivateFieldGet(this, _parseFn_1)) __classPrivateFieldGet(this, _parseFn_1).call(this, __classPrivateFieldGet(this, _exitError), argv2, __classPrivateFieldGet(this, _output));
                return argv2;
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
                const parse3 = this[kRunYargsParserAndExecuteCommands](__classPrivateFieldGet(this, _processArgs), undefined, undefined, 0, true);
                if (isPromise(parse3)) {
                    parse3.then(()=>{
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
            log: (...args2)=>{
                if (!this[kHasParseCallback]()) console.log(...args2);
                __classPrivateFieldSet(this, _hasOutput, true);
                if (__classPrivateFieldGet(this, _output).length) __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + '\n');
                __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + args2.join(' '));
            },
            error: (...args2)=>{
                if (!this[kHasParseCallback]()) console.error(...args2);
                __classPrivateFieldSet(this, _hasOutput, true);
                if (__classPrivateFieldGet(this, _output).length) __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + '\n');
                __classPrivateFieldSet(this, _output, __classPrivateFieldGet(this, _output) + args2.join(' '));
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
        const args2 = argv['--'] ? argv['--'] : argv._;
        for(let i = 0, arg; (arg = args2[i]) !== undefined; i++){
            if (__classPrivateFieldGet(this, _shim_1).Parser.looksLikeNumber(arg) && Number.isSafeInteger(Math.floor(parseFloat(`${arg}`)))) {
                args2[i] = Number(arg);
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
        var _a2, _b1, _c1, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const frozen = __classPrivateFieldGet(this, _frozens).pop();
        assertNotStrictEqual(frozen, undefined, __classPrivateFieldGet(this, _shim_1));
        let configObjects;
        _a2 = this, _b1 = this, _c1 = this, _d = this, _e = this, _f = this, _g = this, _h = this, _j = this, _k = this, _l = this, _m = this, { options: ({
            set value (_o){
                __classPrivateFieldSet(_a2, _options, _o);
            }
        }).value , configObjects , exitProcess: ({
            set value (_o){
                __classPrivateFieldSet(_b1, _exitProcess, _o);
            }
        }).value , groups: ({
            set value (_o){
                __classPrivateFieldSet(_c1, _groups, _o);
            }
        }).value , output: ({
            set value (_o){
                __classPrivateFieldSet(_d, _output, _o);
            }
        }).value , exitError: ({
            set value (_o){
                __classPrivateFieldSet(_e, _exitError, _o);
            }
        }).value , hasOutput: ({
            set value (_o){
                __classPrivateFieldSet(_f, _hasOutput, _o);
            }
        }).value , parsed: this.parsed , strict: ({
            set value (_o){
                __classPrivateFieldSet(_g, _strict, _o);
            }
        }).value , strictCommands: ({
            set value (_o){
                __classPrivateFieldSet(_h, _strictCommands, _o);
            }
        }).value , strictOptions: ({
            set value (_o){
                __classPrivateFieldSet(_j, _strictOptions, _o);
            }
        }).value , completionCommand: ({
            set value (_o){
                __classPrivateFieldSet(_k, _completionCommand, _o);
            }
        }).value , parseFn: ({
            set value (_o){
                __classPrivateFieldSet(_l, _parseFn_1, _o);
            }
        }).value , parseContext: ({
            set value (_o){
                __classPrivateFieldSet(_m, _parseContext, _o);
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
            tmpOptions[k] = (__classPrivateFieldGet(this, _options)[k] || []).filter((k1)=>!localLookup[k1]
            );
        });
        objectOptions.forEach((k)=>{
            tmpOptions[k] = objFilter(__classPrivateFieldGet(this, _options)[k], (k1)=>!localLookup[k1]
            );
        });
        tmpOptions.envPrefix = __classPrivateFieldGet(this, _options).envPrefix;
        __classPrivateFieldSet(this, _options, tmpOptions);
        __classPrivateFieldSet(this, _usage, __classPrivateFieldGet(this, _usage) ? __classPrivateFieldGet(this, _usage).reset(localLookup) : usage(this, __classPrivateFieldGet(this, _shim_1)));
        __classPrivateFieldSet(this, _validation, __classPrivateFieldGet(this, _validation) ? __classPrivateFieldGet(this, _validation).reset(localLookup) : validation2(this, __classPrivateFieldGet(this, _usage), __classPrivateFieldGet(this, _shim_1)));
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
        const argv2 = Object.assign(parsed.argv, __classPrivateFieldGet(this, _parseContext));
        let argvPromise = undefined;
        const aliases = parsed.aliases;
        let helpOptSet = false;
        let versionOptSet = false;
        Object.keys(argv2).forEach((key)=>{
            if (key === __classPrivateFieldGet(this, _helpOpt) && argv2[key]) {
                helpOptSet = true;
            } else if (key === __classPrivateFieldGet(this, _versionOpt) && argv2[key]) {
                versionOptSet = true;
            }
        });
        argv2.$0 = this.$0;
        this.parsed = parsed;
        if (commandIndex === 0) {
            __classPrivateFieldGet(this, _usage).clearCachedHelpMessage();
        }
        try {
            this[kGuessLocale]();
            if (shortCircuit) {
                return this[kPostProcess](argv2, populateDoubleDash, !!calledFromCommand, false);
            }
            if (__classPrivateFieldGet(this, _helpOpt)) {
                const helpCmds = [
                    __classPrivateFieldGet(this, _helpOpt)
                ].concat(aliases[__classPrivateFieldGet(this, _helpOpt)] || []).filter((k)=>k.length > 1
                );
                if (~helpCmds.indexOf('' + argv2._[argv2._.length - 1])) {
                    argv2._.pop();
                    helpOptSet = true;
                }
            }
            const handlerKeys = __classPrivateFieldGet(this, _command).getCommands();
            const requestCompletions = __classPrivateFieldGet(this, _completion).completionKey in argv2;
            const skipRecommendation = helpOptSet || requestCompletions || helpOnly;
            if (argv2._.length) {
                if (handlerKeys.length) {
                    let firstUnknownCommand;
                    for(let i = commandIndex || 0, cmd; argv2._[i] !== undefined; i++){
                        cmd = String(argv2._[i]);
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
                if (__classPrivateFieldGet(this, _completionCommand) && ~argv2._.indexOf(__classPrivateFieldGet(this, _completionCommand)) && !requestCompletions) {
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
                    (completions || []).forEach((completion1)=>{
                        __classPrivateFieldGet(this, _logger).log(completion1);
                    });
                    this.exit(0);
                });
                return this[kPostProcess](argv2, !populateDoubleDash, !!calledFromCommand, false);
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
                skipValidation = Object.keys(argv2).some((key)=>__classPrivateFieldGet(this, _options).skipValidation.indexOf(key) >= 0 && argv2[key] === true
                );
            }
            if (!skipValidation) {
                if (parsed.error) throw new YError(parsed.error.message);
                if (!requestCompletions) {
                    const validation3 = this[kRunValidation](aliases, {
                    }, parsed.error);
                    if (!calledFromCommand) {
                        argvPromise = applyMiddleware(argv2, this, __classPrivateFieldGet(this, _globalMiddleware).getMiddleware(), true);
                    }
                    argvPromise = this[kValidateAsync](validation3, argvPromise !== null && argvPromise !== void 0 ? argvPromise : argv2);
                    if (isPromise(argvPromise) && !calledFromCommand) {
                        argvPromise = argvPromise.then(()=>{
                            return applyMiddleware(argv2, this, __classPrivateFieldGet(this, _globalMiddleware).getMiddleware(), false);
                        });
                    }
                }
            }
        } catch (err) {
            if (err instanceof YError) __classPrivateFieldGet(this, _usage).fail(err.message, err);
            else throw err;
        }
        return this[kPostProcess](argvPromise !== null && argvPromise !== void 0 ? argvPromise : argv2, populateDoubleDash, !!calledFromCommand, true);
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
        return (argv2)=>{
            if (parseErrors) throw new YError(parseErrors.message);
            __classPrivateFieldGet(this, _validation).nonOptionCount(argv2);
            __classPrivateFieldGet(this, _validation).requiredArguments(argv2, demandedOptions);
            let failedStrictCommands = false;
            if (__classPrivateFieldGet(this, _strictCommands)) {
                failedStrictCommands = __classPrivateFieldGet(this, _validation).unknownCommands(argv2);
            }
            if (__classPrivateFieldGet(this, _strict) && !failedStrictCommands) {
                __classPrivateFieldGet(this, _validation).unknownArguments(argv2, aliases, positionalMap, !!isDefaultCommand);
            } else if (__classPrivateFieldGet(this, _strictOptions)) {
                __classPrivateFieldGet(this, _validation).unknownArguments(argv2, aliases, {
                }, false, false);
            }
            __classPrivateFieldGet(this, _validation).limitedChoices(argv2);
            __classPrivateFieldGet(this, _validation).implications(argv2);
            __classPrivateFieldGet(this, _validation).conflicting(argv2);
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
const Yargs = YargsFactory(__default2);
const osType1 = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows1 = osType1 === "windows";
const CHAR_FORWARD_SLASH1 = 47;
function assertPath1(path2) {
    if (typeof path2 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path2)}`);
    }
}
function isPosixPathSeparator1(code3) {
    return code3 === 47;
}
function isPathSeparator1(code3) {
    return isPosixPathSeparator1(code3) || code3 === 92;
}
function isWindowsDeviceRoot1(code3) {
    return code3 >= 97 && code3 <= 122 || code3 >= 65 && code3 <= 90;
}
function normalizeString1(path2, allowAboveRoot, separator, isPathSeparator2) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code3;
    for(let i = 0, len = path2.length; i <= len; ++i){
        if (i < len) code3 = path2.charCodeAt(i);
        else if (isPathSeparator2(code3)) break;
        else code3 = CHAR_FORWARD_SLASH1;
        if (isPathSeparator2(code3)) {
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
                if (res.length > 0) res += separator + path2.slice(lastSlash + 1, i);
                else res = path2.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code3 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format2(sep3, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep3 + base;
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
const sep3 = "\\";
const delimiter3 = ";";
function resolve3(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path2;
        if (i >= 0) {
            path2 = pathSegments[i];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path2 = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path2 = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path2 === undefined || path2.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path2 = `${resolvedDevice}\\`;
            }
        }
        assertPath1(path2);
        const len = path2.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute3 = false;
        const code3 = path2.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator1(code3)) {
                isAbsolute3 = true;
                if (isPathSeparator1(path2.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator1(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path2.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator1(path2.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator1(path2.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path2.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path2.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot1(code3)) {
                if (path2.charCodeAt(1) === 58) {
                    device = path2.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator1(path2.charCodeAt(2))) {
                            isAbsolute3 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator1(code3)) {
            rootEnd = 1;
            isAbsolute3 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path2.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute3;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString1(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator1);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize3(path2) {
    assertPath1(path2);
    const len = path2.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute3 = false;
    const code3 = path2.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code3)) {
            isAbsolute3 = true;
            if (isPathSeparator1(path2.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path2.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path2.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path2.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path2.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path2.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot1(code3)) {
            if (path2.charCodeAt(1) === 58) {
                device = path2.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path2.charCodeAt(2))) {
                        isAbsolute3 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator1(code3)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString1(path2.slice(rootEnd), !isAbsolute3, "\\", isPathSeparator1);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute3) tail = ".";
    if (tail.length > 0 && isPathSeparator1(path2.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute3) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute3) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute3(path2) {
    assertPath1(path2);
    const len = path2.length;
    if (len === 0) return false;
    const code3 = path2.charCodeAt(0);
    if (isPathSeparator1(code3)) {
        return true;
    } else if (isWindowsDeviceRoot1(code3)) {
        if (len > 2 && path2.charCodeAt(1) === 58) {
            if (isPathSeparator1(path2.charCodeAt(2))) return true;
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
        const path2 = paths[i];
        assertPath1(path2);
        if (path2.length > 0) {
            if (joined === undefined) joined = firstPart = path2;
            else joined += `\\${path2}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
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
function toNamespacedPath3(path2) {
    if (typeof path2 !== "string") return path2;
    if (path2.length === 0) return "";
    const resolvedPath = resolve3(path2);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code3 = resolvedPath.charCodeAt(2);
                if (code3 !== 63 && code3 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot1(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path2;
}
function dirname3(path2) {
    assertPath1(path2);
    const len = path2.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code3 = path2.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code3)) {
            rootEnd = offset = 1;
            if (isPathSeparator1(path2.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path2.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path2.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path2;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code3)) {
            if (path2.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator1(path2.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator1(code3)) {
        return path2;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator1(path2.charCodeAt(i))) {
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
    return path2.slice(0, end);
}
function basename3(path2, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path2);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path2.length >= 2) {
        const drive = path2.charCodeAt(0);
        if (isWindowsDeviceRoot1(drive)) {
            if (path2.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path2.length) {
        if (ext.length === path2.length && ext === path2) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path2.length - 1; i >= start; --i){
            const code3 = path2.charCodeAt(i);
            if (isPathSeparator1(code3)) {
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
                    if (code3 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
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
        else if (end === -1) end = path2.length;
        return path2.slice(start, end);
    } else {
        for(i = path2.length - 1; i >= start; --i){
            if (isPathSeparator1(path2.charCodeAt(i))) {
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
        return path2.slice(start, end);
    }
}
function extname3(path2) {
    assertPath1(path2);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path2.length >= 2 && path2.charCodeAt(1) === 58 && isWindowsDeviceRoot1(path2.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path2.length - 1; i >= start; --i){
        const code3 = path2.charCodeAt(i);
        if (isPathSeparator1(code3)) {
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
        if (code3 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path2.slice(startDot, end);
}
function format5(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format2("\\", pathObject);
}
function parse3(path2) {
    assertPath1(path2);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path2.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code3 = path2.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code3)) {
            rootEnd = 1;
            if (isPathSeparator1(path2.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path2.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path2.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path2.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code3)) {
            if (path2.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path2.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path2;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path2;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator1(code3)) {
        ret.root = ret.dir = path2;
        return ret;
    }
    if (rootEnd > 0) ret.root = path2.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path2.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code3 = path2.charCodeAt(i);
        if (isPathSeparator1(code3)) {
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
        if (code3 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path2.slice(startPart, end);
        }
    } else {
        ret.name = path2.slice(startPart, startDot);
        ret.base = path2.slice(startPart, end);
        ret.ext = path2.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path2.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl3(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path2 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path2 = `\\\\${url.hostname}${path2}`;
    }
    return path2;
}
function toFileUrl3(path2) {
    if (!isAbsolute3(path2)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path2.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
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
const mod3 = function() {
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
        let path2;
        if (i >= 0) path2 = pathSegments[i];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path2 = Deno.cwd();
        }
        assertPath1(path2);
        if (path2.length === 0) {
            continue;
        }
        resolvedPath = `${path2}/${resolvedPath}`;
        resolvedAbsolute = path2.charCodeAt(0) === CHAR_FORWARD_SLASH1;
    }
    resolvedPath = normalizeString1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize4(path2) {
    assertPath1(path2);
    if (path2.length === 0) return ".";
    const isAbsolute4 = path2.charCodeAt(0) === 47;
    const trailingSeparator = path2.charCodeAt(path2.length - 1) === 47;
    path2 = normalizeString1(path2, !isAbsolute4, "/", isPosixPathSeparator1);
    if (path2.length === 0 && !isAbsolute4) path2 = ".";
    if (path2.length > 0 && trailingSeparator) path2 += "/";
    if (isAbsolute4) return `/${path2}`;
    return path2;
}
function isAbsolute4(path2) {
    assertPath1(path2);
    return path2.length > 0 && path2.charCodeAt(0) === 47;
}
function join4(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path2 = paths[i];
        assertPath1(path2);
        if (path2.length > 0) {
            if (!joined) joined = path2;
            else joined += `/${path2}`;
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
function toNamespacedPath4(path2) {
    return path2;
}
function dirname4(path2) {
    assertPath1(path2);
    if (path2.length === 0) return ".";
    const hasRoot = path2.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path2.length - 1; i >= 1; --i){
        if (path2.charCodeAt(i) === 47) {
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
    return path2.slice(0, end);
}
function basename4(path2, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path2);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path2.length) {
        if (ext.length === path2.length && ext === path2) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path2.length - 1; i >= 0; --i){
            const code3 = path2.charCodeAt(i);
            if (code3 === 47) {
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
                    if (code3 === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
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
        else if (end === -1) end = path2.length;
        return path2.slice(start, end);
    } else {
        for(i = path2.length - 1; i >= 0; --i){
            if (path2.charCodeAt(i) === 47) {
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
        return path2.slice(start, end);
    }
}
function extname4(path2) {
    assertPath1(path2);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path2.length - 1; i >= 0; --i){
        const code3 = path2.charCodeAt(i);
        if (code3 === 47) {
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
        if (code3 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path2.slice(startDot, end);
}
function format6(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format2("/", pathObject);
}
function parse4(path2) {
    assertPath1(path2);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path2.length === 0) return ret;
    const isAbsolute5 = path2.charCodeAt(0) === 47;
    let start;
    if (isAbsolute5) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path2.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code3 = path2.charCodeAt(i);
        if (code3 === 47) {
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
        if (code3 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute5) {
                ret.base = ret.name = path2.slice(1, end);
            } else {
                ret.base = ret.name = path2.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute5) {
            ret.name = path2.slice(1, startDot);
            ret.base = path2.slice(1, end);
        } else {
            ret.name = path2.slice(startPart, startDot);
            ret.base = path2.slice(startPart, end);
        }
        ret.ext = path2.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path2.slice(0, startPart - 1);
    else if (isAbsolute5) ret.dir = "/";
    return ret;
}
function fromFileUrl4(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl4(path2) {
    if (!isAbsolute4(path2)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(path2.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod4 = function() {
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
const path2 = isWindows1 ? mod3 : mod4;
const { basename: basename5 , delimiter: delimiter5 , dirname: dirname5 , extname: extname5 , format: format7 , fromFileUrl: fromFileUrl5 , isAbsolute: isAbsolute5 , join: join5 , normalize: normalize5 , parse: parse5 , relative: relative5 , resolve: resolve5 , sep: sep5 , toFileUrl: toFileUrl5 , toNamespacedPath: toNamespacedPath5 ,  } = path2;
export { existsSync1 as existsSync };
export { mod as log };
export { basename5 as basename, dirname5 as dirname, join5 as join };
export { dayjs_min as dayjs };
export { Yargs as yargs };
