const {opcodes} = require('./constants')
const crypto = require('crypto')

class Script {
    static createFundingScript(local_pubkey, remote_pubkey) {
        const local = Script._key(local_pubkey)
        const remote = Script._key(remote_pubkey)

        const script = [opcodes.OP_2]
            .concat([local.length])
            .concat(local)
            .concat([remote.length])
            .concat(remote)
            .concat([opcodes.OP_2])
            .concat([opcodes.OP_CHECKMULTISIG])
        return Buffer.from(script)
    }

    static scriptPubKey(script) {
        const scripthash = crypto.createHash('sha256').update(script).digest()
        return Buffer.from([opcodes.OP_0].concat([scripthash.length]).concat(scripthash.toJSON().data))
    }

    static toLocalOutput(revocationPubkey, localDelayedPubkey, toSelfDelay) {
        const rev = Script._key(revocationPubkey)
        const loc = Script._key(localDelayedPubkey)
        const del = Script._key(toSelfDelay.toString(16)).reverse() // little endian
        if(del.length == 1) del.push(0) // pad TODO: how to verify this is correct that it is always 2 digit???

        const script = [opcodes.OP_IF]
            .concat([rev.length], rev)
            .concat(opcodes.OP_ELSE)
            .concat([del.length], del)
            .concat(opcodes.OP_CHECKSEQUENCEVERIFY)
            .concat(opcodes.OP_DROP)
            .concat([loc.length], loc)
            .concat(opcodes.OP_ENDIF)
            .concat(opcodes.OP_CHECKSIG)
        return Buffer.from(script)
        }

    static _key(k) { return typeof k == 'string' ? Buffer.from(k,'hex').toJSON().data : k } 
}

module.exports = Script