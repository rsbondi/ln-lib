// ref: https://github.com/lightningnetwork/lightning-rfc/blob/master/03-transactions.md
const Script = require('../src/script')

class Channel {
    constructor(local_funding_pubkey, remote_funding_pubkey) {
        this.local_funding_pubkey = local_funding_pubkey,
        this.remote_funding_pubkey = remote_funding_pubkey
    }

    fund(inputs, satoshis, change_out) {
        let tx = {
            inputs: inputs,
            outputs: []
        }
        let to_local_out = {
            value: satoshis,
            n: 0,
            scriptPubKey: Script.scriptPubKey(Script.createFundingScript(this.local_funding_pubkey, this.remote_funding_pubkey))
        }
        tx.outputs.push(to_local_out)
        return tx
    }

}

module.exports = Channel

//        return Buffer.from([opcodes.OP_0].concat([scripthash.length]).concat(Script._key(scripthash)))

