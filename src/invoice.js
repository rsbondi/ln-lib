const secp256k1 = require('secp256k1')
const bech32 = require('bech32')
const crypto = require('crypto')
const big = require('bignumber.js')
const {prefixes, amounts} = require('./constants')
const {decodeTypes, encodeTypes} = require('./util')
const WordReader = require('./reader')
const WordWriter = require('./writer')

class PaymentRequest {
  constructor(req) {
    // if request provided, start decoding, otherwise call "encode" later
    if (req) {
      this.invoice = req
      this.bech32 = bech32.decode(req, 9999)
      this.reader = new WordReader(this.bech32.words)
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

      this.timestamp = this.reader.readInt(35)

      this.tagged = []
      while (this.reader.remaining() > 520) { // have data
        const type = this.reader.readInt(5)
        const len = this.reader.readInt(10)
        const data = this.reader.readWords(len)
        this.tagged.push({type: decodeTypes[type].label, data: decodeTypes[type] && decodeTypes[type].process(data) || data})

      }

      const signature = this.reader.read(104*5)
      this.signature = Buffer.from(signature)
    }
  }

  encode(obj) {
    this.writer = new WordWriter()
    this.prefix = obj.prefix
    this.writer.writeInt(obj.timestamp, 35)

    obj.tagged.forEach(t => {
      if(encodeTypes[t.type]) encodeTypes[t.type].process(this.writer, t.data)
    })
    console.log(bech32.encode(this.prefix, this.writer.words, 9999).slice(0, -6))
  }

  requesterPubKey() {
    const words = this.bech32.words.slice(0, -104)
    const rdr = new WordReader(words)
    const data_part_less_sig = rdr.read(words.length*5, true)
    const msg = Buffer.concat([Buffer.from(this.bech32.prefix, 'utf8'), Buffer.from(data_part_less_sig)]) // prefix concat data all in bytes
    const sighash = crypto.createHash('sha256').update(msg).digest()

    return secp256k1.recover(sighash, this.signature.slice(0, -1), this.signature.slice(-1)[0])

  }

}

module.exports = PaymentRequest

