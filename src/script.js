const {opcodes} = require('./constants')
const crypto = require('crypto')
const ripemd160 = require('ripemd160')

class Script {
    // 2 of 2 multisig script for creating commitments
    // hashed in scriptPubKey for funding
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

    static p2wpkh(pk) {
        const pubkey = typeof pk == 'string' ? Buffer.from(pk,'hex') : pk
        const scripthash = crypto.createHash('sha256').update(pubkey).digest()
        console.log('sha256', scripthash.toString('hex'))
        const rmd160 = new ripemd160().update(scripthash).digest()
        return Buffer.from([opcodes.OP_0].concat([rmd160.length]).concat(rmd160.toJSON().data))
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

    static toRemoteOutput(pk) {

    }

    static _key(k) { return typeof k == 'string' ? Buffer.from(k,'hex').toJSON().data : k } 
}

module.exports = Script