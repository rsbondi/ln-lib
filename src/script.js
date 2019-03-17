// BOLT3

const {ops} = require('./util/constants')
const crypto = require('crypto')
const ripemd160 = require('ripemd160')

class ScriptBuilder {
    constructor() { this.bytes = [] }
    op(...codes) { 
        codes.forEach(code => this.bytes = this.bytes.concat(Array.isArray(code) ? code : [code]))
        return this 
    }
    buffer() { return Buffer.from(this.bytes) }
}

class Script {
    // 2 of 2 multisig script for creating commitments
    // hashed in scriptPubKey for funding
    static createFundingScript(local_pubkey, remote_pubkey) {
        const local = Script._key(local_pubkey)
        const remote = Script._key(remote_pubkey)

        return new ScriptBuilder()
            .op(ops.OP_2)
            .op(ops.push(local))
            .op(ops.push(remote))
            .op(ops.OP_2)
            .op(ops.OP_CHECKMULTISIG)
            .buffer()
    }

    static scriptPubKey(script) {
        const scripthash = crypto.createHash('sha256').update(script).digest()
        return Buffer.from([ops.OP_0].concat(ops.push(scripthash)))
    }

    static p2wpkh(pk) {
        const pubkey = Script._keybuf(pk)
        const scripthash = crypto.createHash('sha256').update(pubkey).digest()
        const rmd160 = new ripemd160().update(scripthash).digest()
        return Buffer.from([ops.OP_0].concat(ops.push(rmd160)))
    }

    static toLocalOutput(revocationPubkey, localDelayedPubkey, toSelfDelay) {
        const rev = Script._key(revocationPubkey)
        const loc = Script._key(localDelayedPubkey)
        const del = Script._int(toSelfDelay)

        return new ScriptBuilder()
            .op(ops.OP_IF)
            .op(ops.push(rev))
            .op(ops.OP_ELSE)
            .op(ops.push(del))
            .op(ops.OP_CHECKSEQUENCEVERIFY)
            .op(ops.OP_DROP)
            .op(ops.push(loc))
            .op(ops.OP_ENDIF)
            .op(ops.OP_CHECKSIG)
            .buffer()
    }

    static offeredHTLCout(revocationpubkey, local_htlcpubkey, remote_htlcpubkey, payment_hash) {
        const revpk = Script._keybuf(revocationpubkey)
        const local = Script._key(local_htlcpubkey)
        const remote = Script._key(remote_htlcpubkey)
        const phash = Script._keybuf(payment_hash)

        const scripthash = crypto.createHash('sha256').update(revpk).digest()
        const rmd160revoke = new ripemd160().update(scripthash).digest().toJSON().data
        const rmd160payhash = new ripemd160().update(phash).digest().toJSON().data

        return new ScriptBuilder()
            .op(ops.OP_DUP, ops.OP_HASH160)
            .op(ops.push(rmd160revoke), ops.OP_EQUAL)
            .op(ops.OP_IF)
            .op(ops.OP_CHECKSIG)
            .op(ops.OP_ELSE)
            .op(ops.push(remote), ops.OP_SWAP, ops.OP_SIZE, 1, 32, ops.OP_EQUAL)
            .op(ops.OP_NOTIF)
            .op(ops.OP_DROP, ops.OP_2, ops.OP_SWAP)
            .op(ops.push(local), ops.OP_2, ops.OP_CHECKMULTISIG)
            .op(ops.OP_ELSE)
            .op(ops.OP_HASH160, ops.push(rmd160payhash), ops.OP_EQUALVERIFY)
            .op(ops.OP_CHECKSIG)
            .op(ops.OP_ENDIF)
            .op(ops.OP_ENDIF)
            .buffer()
    }

    static receivedHTLCout(revocationpubkey, local_htlcpubkey, remote_htlcpubkey, payment_hash, expiry) {
        const revpk = Script._keybuf(revocationpubkey)
        const local = Script._key(local_htlcpubkey)
        const remote = Script._key(remote_htlcpubkey)
        const phash = Script._keybuf(payment_hash)
        const exp = Script._int(expiry)
        const scripthash = crypto.createHash('sha256').update(revpk).digest()
        const rmd160revoke = new ripemd160().update(scripthash).digest().toJSON().data
        const rmd160payhash = new ripemd160().update(phash).digest().toJSON().data

        return new ScriptBuilder()
            .op(ops.OP_DUP, ops.OP_HASH160)
            .op(ops.push(rmd160revoke), ops.OP_EQUAL) 
            .op(ops.OP_IF)
            .op(ops.OP_CHECKSIG)
            .op(ops.OP_ELSE)
            .op(ops.push(remote), ops.OP_SWAP, ops.OP_SIZE, 1, 32, ops.OP_EQUAL)
            .op(ops.OP_IF)
            .op(ops.OP_HASH160, ops.push(rmd160payhash), ops.OP_EQUALVERIFY)
            .op(ops.OP_2, ops.OP_SWAP)
            .op(ops.push(local), ops.OP_2, ops.OP_CHECKMULTISIG)
            .op(ops.OP_ELSE, ops.OP_DROP, ops.push(exp), ops.OP_CHECKLOCKTIMEVERIFY, ops.OP_DROP)
            .op(ops.OP_CHECKSIG)
            .op(ops.OP_ENDIF)
            .op(ops.OP_ENDIF)
            .buffer()
    }

    static _key(k) { 
        if(typeof k == 'string') {
            if(k.length % 2) k = '0'+k
            return Buffer.from(k,'hex').toJSON().data
        }
        if(Buffer.isBuffer(k)) return k.toJSON().data
        throw ({message: 'value must be of type string of Buffer, recieved '+ typeof k})
    } 
    static _keybuf(k) { 
        if(typeof k == 'string') {
            return Buffer.from(k,'hex')
        }
        if(Buffer.isBuffer(k)) return k
        throw ({message: 'value must be of type string of Buffer, recieved '+ typeof k})
    }
    static _int(i) {
        if(typeof i != 'number') throw({message: `expected number, received ${typeof i}`})
        const buf = Script._key(i.toString(16)).reverse() // little endian
        if(buf.length == 1) buf.push(0) // pad TODO: how to verify this is correct that it is always 2 digit???
        return buf
    }
}

module.exports = Script