;(function (root, factory) {
  var api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.Cipher = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict'

  // 截止时间：2026-10-11 00:00:00 东八区，之后不再提供校验
  var DEADLINE = new Date('2026-10-11T00:00:00+08:00').getTime()

  /* ---------------- AES S-Box ---------------- */
  var SBOX_HEX =
    '637c777bf26b6fc53001672bfed7ab76' +
    'ca82c97dfa5947f0add4a2af9ca472c0' +
    'b7fd9326363ff7cc34a5e5f171d83115' +
    '04c723c31896059a071280e2eb27b275' +
    '09832c1a1b6e5aa0523bd6b329e32f84' +
    '53d100ed20fcb15b6acbbe394a4c58cf' +
    'd0efaafb434d338545f9027f503c9fa8' +
    '51a3408f929d38f5bcb6da2110fff3d2' +
    'cd0c13ec5f974417c4a77e3d645d1973' +
    '60814fdc222a908846eeb814de5e0bdb' +
    'e0323a0a4906245cc2d3ac629195e479' +
    'e7c8376d8dd54ea96c56f4ea657aae08' +
    'ba78252e1ca6b4c6e8dd741f4bbd8b8a' +
    '703eb5664803f60e613557b986c11d9e' +
    'e1f8981169d98e949b1e87e9ce5528df' +
    '8ca1890dbfe6426841992d0fb054bb16'

  var SBOX = new Uint8Array(256)
  for (var si = 0; si < 256; si++) {
    SBOX[si] = parseInt(SBOX_HEX.substr(si * 2, 2), 16)
  }

  var RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40]
  var NK = 8 // AES-256
  var NR = 14 // 轮数
  var NB = 4

  /* ---------------- AES 基础运算 ---------------- */
  function mul2 (x) {
    return ((x << 1) ^ (x & 0x80 ? 0x1b : 0)) & 0xff
  }

  function subWord (x) {
    return (
      ((SBOX[(x >>> 24) & 0xff] << 24) |
        (SBOX[(x >>> 16) & 0xff] << 16) |
        (SBOX[(x >>> 8) & 0xff] << 8) |
        SBOX[x & 0xff]) >>>
      0
    )
  }

  // AES-256 密钥扩展，返回 60 个 32bit 轮密钥
  function expandKey (key) {
    var total = NB * (NR + 1)
    var w = new Uint32Array(total)
    var i

    for (i = 0; i < NK; i++) {
      w[i] =
        ((key[4 * i] << 24) |
          (key[4 * i + 1] << 16) |
          (key[4 * i + 2] << 8) |
          key[4 * i + 3]) >>>
        0
    }

    for (i = NK; i < total; i++) {
      var temp = w[i - 1]
      if (i % NK === 0) {
        temp = ((temp << 8) | (temp >>> 24)) >>> 0
        temp = (subWord(temp) ^ (RCON[i / NK - 1] << 24)) >>> 0
      } else if (i % NK === 4) {
        temp = subWord(temp)
      }
      w[i] = (w[i - NK] ^ temp) >>> 0
    }
    return w
  }

  // 加密单个 16 字节分组
  function encryptBlock (w, input) {
    var s = new Uint8Array(16)
    var i, t

    for (i = 0; i < 16; i++) {
      s[i] = input[i] ^ ((w[i >> 2] >>> (24 - 8 * (i & 3))) & 0xff)
    }

    for (var round = 1; round <= NR; round++) {
      for (i = 0; i < 16; i++) s[i] = SBOX[s[i]]

      // ShiftRows
      t = s[1];  s[1] = s[5];  s[5] = s[9];  s[9] = s[13]; s[13] = t
      t = s[2];  s[2] = s[10]; s[10] = t
      t = s[6];  s[6] = s[14]; s[14] = t
      t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t

      if (round !== NR) {
        for (var c = 0; c < 4; c++) {
          var p = c * 4
          var a0 = s[p], a1 = s[p + 1], a2 = s[p + 2], a3 = s[p + 3]
          var b0 = mul2(a0), b1 = mul2(a1), b2 = mul2(a2), b3 = mul2(a3)
          s[p]     = b0 ^ b1 ^ a1 ^ a2 ^ a3
          s[p + 1] = a0 ^ b1 ^ b2 ^ a2 ^ a3
          s[p + 2] = a0 ^ a1 ^ b2 ^ b3 ^ a3
          s[p + 3] = b0 ^ a0 ^ a1 ^ a2 ^ b3
        }
      }

      var off = round * 4
      for (i = 0; i < 16; i++) {
        s[i] ^= (w[off + (i >> 2)] >>> (24 - 8 * (i & 3))) & 0xff
      }
    }
    return s
  }

  /* ---------------- CTR 模式 ---------------- */
  // iv: 8 字节
  function ctrXor (key, iv, data) {
    var w = expandKey(key)
    var out = new Uint8Array(data.length)
    var counter = new Uint8Array(16)
    counter.set(iv, 0)

    var offset = 0
    var blockIndex = 0

    while (offset < data.length) {
      var n = blockIndex
      for (var i = 15; i >= 8; i--) {
        counter[i] = n & 0xff
        n = Math.floor(n / 256)
      }

      var ks = encryptBlock(w, counter)
      var len = Math.min(16, data.length - offset)
      for (var j = 0; j < len; j++) {
        out[offset + j] = data[offset + j] ^ ks[j]
      }
      offset += len
      blockIndex++
    }
    return out
  }

  /* ---------------- Base64 ---------------- */
  var B64CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  var B64LOOKUP = (function () {
    var t = new Int16Array(256)
    for (var i = 0; i < 256; i++) t[i] = -1
    for (var j = 0; j < B64CHARS.length; j++) t[B64CHARS.charCodeAt(j)] = j
    return t
  })()

  function b64encode (bytes) {
    var out = ''
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i]
      var b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined
      var b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined

      out += B64CHARS[b0 >> 2]
      out += B64CHARS[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)]
      out +=
        b1 === undefined
          ? '='
          : B64CHARS[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)]
      out += b2 === undefined ? '=' : B64CHARS[b2 & 63]
    }
    return out
  }

  function b64decode (str) {
    str = String(str).replace(/[^A-Za-z0-9+/]/g, '')
    var out = []
    var buffer = 0
    var bits = 0

    for (var i = 0; i < str.length; i++) {
      var v = B64LOOKUP[str.charCodeAt(i)]
      if (v < 0) continue
      buffer = ((buffer << 6) | v) & 0xffffff
      bits += 6
      if (bits >= 8) {
        bits -= 8
        out.push((buffer >> bits) & 0xff)
      }
    }
    return new Uint8Array(out)
  }

  /* ---------------- UTF-8 编解码 ---------------- */
  function strToBytes (str) {
    var bytes = []
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i)
      if (c < 0x80) {
        bytes.push(c)
      } else if (c < 0x800) {
        bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var c2 = str.charCodeAt(++i)
        var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00)
        bytes.push(
          0xf0 | (cp >> 18),
          0x80 | ((cp >> 12) & 0x3f),
          0x80 | ((cp >> 6) & 0x3f),
          0x80 | (cp & 0x3f)
        )
      } else {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
      }
    }
    return new Uint8Array(bytes)
  }

  function bytesToStr (bytes) {
    var str = ''
    var i = 0
    while (i < bytes.length) {
      var b = bytes[i]
      var cp
      if (b < 0x80) {
        cp = b; i += 1
      } else if (b < 0xe0) {
        cp = ((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f); i += 2
      } else if (b < 0xf0) {
        cp = ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f); i += 3
      } else {
        cp = ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) |
             ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f); i += 4
      }
      if (cp > 0xffff) {
        cp -= 0x10000
        str += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff))
      } else {
        str += String.fromCharCode(cp)
      }
    }
    return str
  }

  /* ---------------- 工具 ---------------- */
  function deriveKey (keyText) {
    var kb = strToBytes(keyText)
    if (kb.length === 0) kb = new Uint8Array([0])
    var key = new Uint8Array(32)
    var h = 0x811c9dc5
    for (var i = 0; i < 32; i++) {
      h ^= (kb[i % kb.length] + i) & 0xff
      h = Math.imul(h, 0x01000193) >>> 0
      key[i] = ((h >>> 24) ^ kb[i % kb.length]) & 0xff
    }
    return key
  }

  function fnv1a (bytes, key) {
    var h = 0x811c9dc5
    var i
    for (i = 0; i < bytes.length; i++) {
      h ^= bytes[i]
      h = Math.imul(h, 0x01000193) >>> 0
    }
    for (i = 0; i < key.length; i++) {
      h ^= key[i]
      h = Math.imul(h, 0x01000193) >>> 0
    }
    return h >>> 0
  }

  function randomBytes (n) {
    var b = new Uint8Array(n)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(b)
    } else {
      var seed = Date.now() ^ (Math.random() * 0xffffffff)
      for (var i = 0; i < n; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        b[i] = (seed >>> 16) & 0xff
      }
    }
    return b
  }

  /* ---------------- 时间校验 ----------------
   * 说明：不再预存/预比密钥。密钥对不对由解密时末尾的 FNV 校验判定：
   *  - 密钥错 → CTR 密钥流错 → 明文乱码 → 校验位不符 → 抛错
   *  - 密钥对 → 校验通过 → 返回明文
   * 这样 SECRET_TEXT 就完全不需要存在于代码里，避免泄漏答案。
   */
  function checkTime () {
    if (Date.now() >= DEADLINE) {
      throw new Error('HanYe Agent CTF 已结束，已无法再检验密钥。')
    }
  }

  /* ---------------- 对外接口 ---------------- */

  /**
   * 解密函数
   * @param {string} cipherText Base64 密文
   * @param {string} keyText    用户提供的密钥（任意字符串）
   * @returns {string} 明文
   * @throws {Error} 时间已过 / 密钥错误或密文被篡改
   */
  function decrypt (cipherText, keyText) {
    checkTime()

    var key = deriveKey(String(keyText == null ? '' : keyText))
    var data = b64decode(cipherText)

    if (data.length < 12) {
      throw new Error('解密失败：密钥错误或数据已被篡改')
    }

    var iv = data.subarray(0, 8)
    var cipher = data.subarray(8, data.length - 4)
    var check = data.subarray(data.length - 4)

    var plain = ctrXor(key, iv, cipher)

    var h = fnv1a(plain, key)
    if (
      ((h >>> 24) & 0xff) !== check[0] ||
      ((h >>> 16) & 0xff) !== check[1] ||
      ((h >>> 8) & 0xff) !== check[2] ||
      (h & 0xff) !== check[3]
    ) {
      throw new Error('密钥错误，请提示用户继续猜测。')
    }

    return bytesToStr(plain)
  }

  /**
   * 加密函数（仅出题/本地调试用，游戏端不需要调用）
   * @param {string} plainText 明文
   * @param {string} keyText   密钥
   * @returns {string} Base64 密文
   */
  function encrypt (plainText, keyText) {
    checkTime()

    var key = deriveKey(String(keyText == null ? '' : keyText))
    var plain = strToBytes(plainText)
    var iv = randomBytes(8)
    var cipher = ctrXor(key, iv, plain)

    var h = fnv1a(plain, key)
    var check = new Uint8Array(4)
    check[0] = (h >>> 24) & 0xff
    check[1] = (h >>> 16) & 0xff
    check[2] = (h >>> 8) & 0xff
    check[3] = h & 0xff

    var out = new Uint8Array(8 + cipher.length + 4)
    out.set(iv, 0)
    out.set(cipher, 8)
    out.set(check, 8 + cipher.length)

    return b64encode(out)
  }

  return {
    encrypt: encrypt,
    decrypt: decrypt,
    DEADLINE: DEADLINE
    // 注意：不再导出 SECRET_TEXT
  }
})