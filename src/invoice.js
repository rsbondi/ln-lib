const secp256k1 = require('secp256k1')
const bech32 = require('bech32')
const crypto = require('crypto')
const big = require('bignumber.js')

const prefixes = [
  "lnbcrt",
  "lnbc",
  "lntb",
  "lnsb"
]

const amounts = {
  '': new big(1),
  'm': new big(0.001),
  'u': new big(0.000001),
  'n': new big(0.000000001),
  'p': new big(0.000000000001)
}

function processHex(data, enc) {return Buffer.from(PaymentRequest._convert(data, 5, 8, false)).toString(enc)}

function processInt(data) {
  let val = 0
  for (let i = 0; i < data.length; i++) {
    let word = data[i]
    val += word * Math.pow(32, data.length - i - 1)
  }
  return val

}

// TODO: use reader  in PaymentRequest
class Reader {
  constructor(words) {
    this.index = 0
    this.words = words
  }
  read(n) {
    let response = []
    let val
    for (let i = 0; i < n; i++) {
      if(!(i%8)) val = 0
      let wordIndex = Math.floor(this.index / 5)
      let bitIndex = 4 - this.index % 5
      let word = this.words[wordIndex]
      let pow = (1 << (7 - i%8)) * (word >> bitIndex & 1)
      val += pow
      if(i%8==7) response.push(val)
      this.index++
    }
    return response
  }

  readInt(n) {
    let val = 0
    for (let i = 0; i < n; i++) {
      let wordIndex = Math.floor(this.index / 5)
      let bitIndex = 4 - this.index % 5
      let word = this.words[wordIndex]
      let pow = (1 << (n - i - 1)) * (word >> bitIndex & 1)
      val += pow
      this.index++
    }
    return val
  }

  remaining() {
    return 5 * this.words.length - this.index
  }
}

const decodeTypes = {
  1: {label: 'payment_hash',          process(data) { return processHex(data, 'hex') } },
 13: {label: 'description',           process(data) { return processHex(data, 'utf8') } },
 19: {label: 'payee_pubkey',          process(data) { return processHex(data, 'hex') }},
 23: {label: 'purpose_hash',          process(data) { return processHex(data, 'hex') }},
  6: {label: 'expiry',                process(data) { return processInt(data) }},
 24: {label: 'min_final_cltv_expiry', process(data) { return processInt(data) }},
  9: {label: 'witness',               process(data) { return processHex(data, 'hex') } }, // or fallback address TODO: verify correctness
  3: {
         label: 'routing',
         process(data) { 
             const reader = new Reader(data)
             let routing = []
             while(reader.remaining() >= 408) // why again trailing 4 bits???
                 routing.push({
                     pubkey                     : Buffer.from(reader.read(264)).toString('hex'),
                     short_channel_id           : Buffer.from(reader.read(64)).toString('hex'),
                     fee_base_msat              : reader.readInt(32),
                     fee_proportional_millionths: reader.readInt(32),
                     cltv_expiry_delta          : reader.readInt(16)
                 })
             return routing
        }
     },
}
class PaymentRequest {

  constructor(req) {
    // if request provided, start decoding, otherwise call "encode" later
    if (req) {
      this.invoice = req
      this.bech32 = bech32.decode(req, 9999)
      this.prefix = prefixes.reduce((o, c, i) => {
        if (!o && this.bech32.prefix.match(c)) o = c
        return o
      }, '')

      const amt = this.bech32.prefix.slice(this.prefix.length)
      if (amt) {
        const unit = amt.slice(-1)
        if (~Object.keys(amounts).indexOf(unit)) {
          const val = new big(amt.slice(0, -1))
          this.amount = val.times(amounts[unit])
        } else this.amount = new big(amt) // no units
      } else this.amount = new big(0)

      this._readBits = 0

      this.timestamp = this.readInt(35)

      this.tagged = []
      while (this._unread() > 520) { // have data
        const type = this.readInt(5)
        const len = this.readInt(10)
        const data = this.read(len)
        this.tagged.push({type: decodeTypes[type].label, data: decodeTypes[type] && decodeTypes[type].process(data) || data})

      }

      const signature = PaymentRequest._convert(this.read(104), 5, 8, false)
      this.signature = Buffer.from(signature)
    }
  }

  requesterPubKey() {
    const data_part_less_sig = PaymentRequest._convert(this.bech32.words.slice(0, -104), 5, 8,true)
    const msg = Buffer.concat([Buffer.from(this.bech32.prefix, 'utf8'), Buffer.from(data_part_less_sig)]) // prefix concat data all in bytes
    const sighash = crypto.createHash('sha256').update(msg).digest()

    return secp256k1.recover(sighash, this.signature.slice(0, -1), this.signature.slice(-1)[0])

  }

  read(n) {
    let wordIndex = this._readBits / 5
    this._readBits += n*5
    return this.bech32.words.slice(wordIndex, wordIndex+n)
  }

  readInt(n) {
    let val = 0
    for (let i = 0; i < n; i++) {
      let wordIndex = Math.floor(this._readBits / 5)
      let bitIndex = 4 - this._readBits % 5
      let word = this.bech32.words[wordIndex]
      let pow = (1 << (n - i - 1)) * (word >> bitIndex & 1)
      val += pow
      this._readBits++
    }
    return val
  }

  _unread() {
    return 5 * this.bech32.words.length - this._readBits
  }

  targetPubKey() {

  }



  // from bech32 lib, not exposed
  static _convert(data, inBits, outBits, pad) {
    var value = 0
    var bits = 0
    var maxV = (1 << outBits) - 1

    var result = []
    for (var i = 0; i < data.length; ++i) {
      value = (value << inBits) | data[i]
      bits += inBits

      while (bits >= outBits) {
        bits -= outBits
        result.push((value >> bits) & maxV)
      }
    }

    if (pad) {
      if (bits > 0) {
        result.push((value << (outBits - bits)) & maxV)
      }
    } 

    return result
  }
}

module.exports = PaymentRequest

