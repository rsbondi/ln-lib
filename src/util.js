const WordReader = require('./reader')

function processHex(data, enc) {return Buffer.from(convertWords(data, 5, 8)).toString(enc)}

function processInt(data) {
  let val = 0
  for (let i = 0; i < data.length; i++) {
    let word = data[i]
    val += word * Math.pow(32, data.length - i - 1)
  }
  return val
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
             const reader = new WordReader(data)
             let routing = []
             while(reader.remaining() >= 404) 
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

  // from bech32 lib, not exposed, bech32.fromWords throws excess padding but works here
  // this is outside of bech32 spec at this point so different use case ok
  // only used here internally
  function convertWords(data, inBits, outBits) {
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
    return result
}

module.exports = {
    decodeTypes: decodeTypes
}