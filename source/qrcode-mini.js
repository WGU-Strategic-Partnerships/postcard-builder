// qrcode-mini.js — Compact QR Code encoder (no dependencies)
// Based on the public-domain qrcode-generator algorithm by Kazuhiko Arase.
// Supports modes: byte (UTF-8) only. Error correction: L/M/Q/H. Auto version selection.
// Usage: const matrix = QRCodeMini.generate("https://example.com", "M");
// Returns: 2D boolean array (true = dark module).

(function (global) {
  // ---- Galois Field (GF(256)) tables for error correction ----
  var EXP_TABLE = new Array(256);
  var LOG_TABLE = new Array(256);
  for (var i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
  for (var i = 8; i < 256; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
  }
  for (var i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
  }

  // Polynomial helpers
  function Polynomial(num, shift) {
    if (num.length === undefined) throw new Error("bad poly");
    var offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + (shift || 0));
    for (var i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
  }
  Polynomial.prototype.get = function (i) { return this.num[i]; };
  Polynomial.prototype.getLength = function () { return this.num.length; };
  Polynomial.prototype.multiply = function (e) {
    var num = new Array(this.getLength() + e.getLength() - 1);
    for (var i = 0; i < num.length; i++) num[i] = 0;
    for (var i = 0; i < this.getLength(); i++) {
      for (var j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gfMul(this.get(i), e.get(j));
      }
    }
    return new Polynomial(num, 0);
  };
  Polynomial.prototype.mod = function (e) {
    if (this.getLength() - e.getLength() < 0) return this;
    var ratio = LOG_TABLE[this.get(0)] - LOG_TABLE[e.get(0)];
    var num = new Array(this.getLength());
    for (var i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (var i = 0; i < e.getLength(); i++) {
      num[i] ^= EXP_TABLE[(LOG_TABLE[e.get(i)] + ratio + 255) % 255];
    }
    return new Polynomial(num, 0).mod(e);
  };

  // RS error correction generator polynomial of degree errLength
  function getErrorCorrectPolynomial(errLength) {
    var a = new Polynomial([1], 0);
    for (var i = 0; i < errLength; i++) {
      a = a.multiply(new Polynomial([1, EXP_TABLE[i]], 0));
    }
    return a;
  }

  // ---- Block & EC tables for versions 1..10 (covers up to ~174 bytes at L) ----
  // Each entry: [totalCodewords, ecCodewordsPerBlock, [block1Count, block1DataCw, block2Count, block2DataCw]]
  // Source: ISO/IEC 18004 Table 9. Only ECC level encoded — full table for L,M,Q,H per version.
  // Format: RS_BLOCK_TABLE[(version-1)*4 + ecIdx] where ecIdx: L=0,M=1,Q=2,H=3
  // Each entry per version+ec is groups: [count, totalCw, dataCw] tuples
  var RS_BLOCK_TABLE = [
    // v1
    [[1, 26, 19]], [[1, 26, 16]], [[1, 26, 13]], [[1, 26, 9]],
    // v2
    [[1, 44, 34]], [[1, 44, 28]], [[1, 44, 22]], [[1, 44, 16]],
    // v3
    [[1, 70, 55]], [[1, 70, 44]], [[2, 35, 17]], [[2, 35, 13]],
    // v4
    [[1, 100, 80]], [[2, 50, 32]], [[2, 50, 24]], [[4, 25, 9]],
    // v5
    [[1, 134, 108]], [[2, 67, 43]], [[2, 33, 15], [2, 34, 16]], [[2, 33, 11], [2, 34, 12]],
    // v6
    [[2, 86, 68]], [[4, 43, 27]], [[4, 43, 19]], [[4, 43, 15]],
    // v7
    [[2, 98, 78]], [[4, 49, 31]], [[2, 32, 14], [4, 33, 15]], [[4, 39, 13], [1, 40, 14]],
    // v8
    [[2, 121, 97]], [[2, 60, 38], [2, 61, 39]], [[4, 40, 18], [2, 41, 19]], [[4, 40, 14], [2, 41, 15]],
    // v9
    [[2, 146, 116]], [[3, 58, 36], [2, 59, 37]], [[4, 36, 16], [4, 37, 17]], [[4, 36, 12], [4, 37, 13]],
    // v10
    [[2, 86, 68], [2, 87, 69]], [[4, 69, 43], [1, 70, 44]], [[6, 43, 19], [2, 44, 20]], [[6, 43, 15], [2, 44, 16]],
  ];

  var EC_LEVEL_INDEX = { L: 0, M: 1, Q: 2, H: 3 };

  function getRSBlocks(typeNumber, ecLevel) {
    var ecIdx = EC_LEVEL_INDEX[ecLevel];
    var entry = RS_BLOCK_TABLE[(typeNumber - 1) * 4 + ecIdx];
    if (!entry) throw new Error("RS block missing v" + typeNumber + " " + ecLevel);
    var blocks = [];
    for (var g = 0; g < entry.length; g++) {
      var count = entry[g][0], totalCw = entry[g][1], dataCw = entry[g][2];
      for (var k = 0; k < count; k++) blocks.push({ totalCount: totalCw, dataCount: dataCw });
    }
    return blocks;
  }

  // ---- BitBuffer ----
  function BitBuffer() { this.buffer = []; this.length = 0; }
  BitBuffer.prototype.get = function (i) { return ((this.buffer[Math.floor(i / 8)] >>> (7 - i % 8)) & 1) === 1; };
  BitBuffer.prototype.put = function (num, length) {
    for (var i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) === 1);
  };
  BitBuffer.prototype.putBit = function (bit) {
    var bufIdx = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIdx) this.buffer.push(0);
    if (bit) this.buffer[bufIdx] |= 0x80 >>> (this.length % 8);
    this.length++;
  };

  // ---- UTF-8 encoder ----
  function utf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xC0 | (c >> 6)); out.push(0x80 | (c & 0x3F)); }
      else if (c < 0xD800 || c >= 0xE000) {
        out.push(0xE0 | (c >> 12)); out.push(0x80 | ((c >> 6) & 0x3F)); out.push(0x80 | (c & 0x3F));
      } else {
        i++; var c2 = str.charCodeAt(i);
        var cp = 0x10000 + (((c & 0x3FF) << 10) | (c2 & 0x3FF));
        out.push(0xF0 | (cp >> 18)); out.push(0x80 | ((cp >> 12) & 0x3F));
        out.push(0x80 | ((cp >> 6) & 0x3F)); out.push(0x80 | (cp & 0x3F));
      }
    }
    return out;
  }

  // ---- BCH for format/version info ----
  var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
  var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
  function getBCHTypeInfo(data) {
    var d = data << 10;
    while (bchDigit(d) - bchDigit(G15) >= 0) d ^= (G15 << (bchDigit(d) - bchDigit(G15)));
    return ((data << 10) | d) ^ G15_MASK;
  }
  function bchDigit(data) {
    var digit = 0;
    while (data !== 0) { digit++; data >>>= 1; }
    return digit;
  }

  // ---- Mask functions (8 patterns) ----
  function getMask(maskPattern, i, j) {
    switch (maskPattern) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case 7: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    }
    throw new Error("bad mask");
  }

  // ---- Alignment pattern positions ----
  var ALIGNMENT_PATTERNS = [
    [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
  ];

  // ---- QRCode core ----
  function QRCode(typeNumber, ecLevel) {
    this.typeNumber = typeNumber;
    this.ecLevel = ecLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }
  QRCode.prototype.addData = function (data) {
    var bytes = utf8Bytes(data);
    this.dataList.push({ mode: 4, length: bytes.length, bytes: bytes });
    this.dataCache = null;
  };
  QRCode.prototype.isDark = function (r, c) { return this.modules[r][c]; };
  QRCode.prototype.getModuleCount = function () { return this.moduleCount; };
  QRCode.prototype.make = function () { this.makeImpl(false, this.getBestMaskPattern()); };

  QRCode.prototype.makeImpl = function (test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = [];
    for (var i = 0; i < this.moduleCount; i++) {
      this.modules.push(new Array(this.moduleCount).fill(null));
    }
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) this.setupTypeNumber(test);
    if (this.dataCache === null) this.dataCache = this.createData();
    this.mapData(this.dataCache, maskPattern);
  };

  QRCode.prototype.setupPositionProbePattern = function (row, col) {
    for (var r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (var c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  };

  QRCode.prototype.setupPositionAdjustPattern = function () {
    var pos = ALIGNMENT_PATTERNS[this.typeNumber];
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var row = pos[i], col = pos[j];
        if (this.modules[row][col] !== null) continue;
        for (var r = -2; r <= 2; r++) {
          for (var c = -2; c <= 2; c++) {
            this.modules[row + r][col + c] =
              (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0));
          }
        }
      }
    }
  };

  QRCode.prototype.setupTimingPattern = function () {
    for (var r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = (r % 2 === 0);
    }
    for (var c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = (c % 2 === 0);
    }
  };

  QRCode.prototype.setupTypeInfo = function (test, maskPattern) {
    var ecBits = { L: 1, M: 0, Q: 3, H: 2 }[this.ecLevel];
    var data = (ecBits << 3) | maskPattern;
    var bits = getBCHTypeInfo(data);
    for (var i = 0; i < 15; i++) {
      var mod = !test && ((bits >> i) & 1) === 1;
      if (i < 6) this.modules[i][8] = mod;
      else if (i < 8) this.modules[i + 1][8] = mod;
      else this.modules[this.moduleCount - 15 + i][8] = mod;
    }
    for (var i = 0; i < 15; i++) {
      var mod = !test && ((bits >> i) & 1) === 1;
      if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod;
      else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
      else this.modules[8][15 - i - 1] = mod;
    }
    this.modules[this.moduleCount - 8][8] = !test;
  };

  QRCode.prototype.setupTypeNumber = function (test) {
    // For v7+; we only support up to v10, so include this for safety
    var bits = this.typeNumber << 12;
    var G18 = 0x1F25;
    while (bchDigit(bits) - bchDigit(G18) >= 0) bits ^= (G18 << (bchDigit(bits) - bchDigit(G18)));
    bits = (this.typeNumber << 12) | bits;
    for (var i = 0; i < 18; i++) {
      var mod = !test && ((bits >> i) & 1) === 1;
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  };

  QRCode.prototype.mapData = function (data, maskPattern) {
    var inc = -1;
    var row = this.moduleCount - 1;
    var bitIndex = 7;
    var byteIndex = 0;
    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (var c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            var dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            var mask = getMask(maskPattern, row, col - c);
            if (mask) dark = !dark;
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) { row -= inc; inc = -inc; break; }
      }
    }
  };

  QRCode.prototype.createData = function () {
    var rsBlocks = getRSBlocks(this.typeNumber, this.ecLevel);
    var buffer = new BitBuffer();
    for (var i = 0; i < this.dataList.length; i++) {
      var data = this.dataList[i];
      buffer.put(data.mode, 4);
      // byte mode length: 8 bits for v1-9, 16 bits for v10+
      var lengthBits = this.typeNumber < 10 ? 8 : 16;
      buffer.put(data.length, lengthBits);
      for (var j = 0; j < data.bytes.length; j++) buffer.put(data.bytes[j], 8);
    }
    var totalDataCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
    if (buffer.length > totalDataCount * 8) throw new Error("QR overflow: " + buffer.length + ">" + totalDataCount * 8);
    if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
    while (buffer.length % 8 !== 0) buffer.putBit(false);
    while (true) {
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(0xEC, 8);
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    return this.createBytes(buffer, rsBlocks);
  };

  QRCode.prototype.createBytes = function (buffer, rsBlocks) {
    var offset = 0;
    var maxDcCount = 0, maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length);
    var ecdata = new Array(rsBlocks.length);
    for (var r = 0; r < rsBlocks.length; r++) {
      var dcCount = rsBlocks[r].dataCount;
      var ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (var i = 0; i < dcCount; i++) dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      offset += dcCount;
      var rsPoly = getErrorCorrectPolynomial(ecCount);
      var rawPoly = new Polynomial(dcdata[r], rsPoly.getLength() - 1);
      var modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (var i = 0; i < ecdata[r].length; i++) {
        var modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }
    var totalCodeCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
    var data = new Array(totalCodeCount);
    var index = 0;
    for (var i = 0; i < maxDcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) data[index++] = dcdata[r][i];
      }
    }
    for (var i = 0; i < maxEcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) data[index++] = ecdata[r][i];
      }
    }
    return data;
  };

  QRCode.prototype.getBestMaskPattern = function () {
    var minLostPoint = 0, pattern = 0;
    for (var i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      var lostPoint = this.getLostPoint();
      if (i === 0 || minLostPoint > lostPoint) { minLostPoint = lostPoint; pattern = i; }
    }
    return pattern;
  };

  QRCode.prototype.getLostPoint = function () {
    var moduleCount = this.moduleCount;
    var lostPoint = 0;
    // simple penalty: row/col runs of 5+ same
    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount; col++) {
        var sameCount = 0;
        var dark = this.isDark(row, col);
        for (var r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (var c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            if (dark === this.isDark(row + r, col + c)) sameCount++;
          }
        }
        if (sameCount > 5) lostPoint += (3 + sameCount - 5);
      }
    }
    return lostPoint;
  };

  // ---- Public API ----
  function generate(text, ecLevel) {
    ecLevel = ecLevel || "M";
    // Pick smallest version that fits
    var bytes = utf8Bytes(text || "");
    // Capacity (data codewords) per version per EC level (byte mode):
    // We compute by iterating versions 1..10 and checking if it fits.
    for (var v = 1; v <= 10; v++) {
      try {
        var qr = new QRCode(v, ecLevel);
        qr.addData(text || "");
        qr.make();
        return qr.modules;
      } catch (e) {
        if (v === 10) throw e;
        continue;
      }
    }
  }

  global.QRCodeMini = { generate: generate };
})(typeof window !== 'undefined' ? window : this);
