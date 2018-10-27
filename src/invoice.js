const secp256k1 = require('secp256k1')
const bech32 = require('bech32')
const crypto = require('crypto')
const big = require('bignumber.js')
const {prefixes, amounts} = require('./constants')
const {convertWords, decodeTypes} = require('./util')

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

      const signature = convertWords(this.read(104), 5, 8, false)
      this.signature = Buffer.from(signature)
    }
  }

  requesterPubKey() {
    const data_part_less_sig = convertWords(this.bech32.words.slice(0, -104), 5, 8,true)
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

}

module.exports = PaymentRequest

