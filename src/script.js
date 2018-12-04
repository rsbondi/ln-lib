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
        const pubkey = Script._keybuf(pk)
        const scripthash = crypto.createHash('sha256').update(pubkey).digest()
        const rmd160 = new ripemd160().update(scripthash).digest()
        return Buffer.from([opcodes.OP_0].concat([rmd160.length]).concat(rmd160.toJSON().data))
    }

    static toLocalOutput(revocationPubkey, localDelayedPubkey, toSelfDelay) {
        const rev = Script._key(revocationPubkey)
        const loc = Script._key(localDelayedPubkey)
        const del = Script._int(toSelfDelay)

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

    static offeredHTLCout(revocationpubkey, local_htlcpubkey, remote_htlcpubkey, payment_hash) {
        const revpk = Script._keybuf(revocationpubkey)
        const local = Script._key(local_htlcpubkey)
        const remote = Script._key(remote_htlcpubkey)
        const phash = Script._keybuf(payment_hash)

        const scripthash = crypto.createHash('sha256').update(revpk).digest()
        const rmd160revoke = new ripemd160().update(scripthash).digest().toJSON().data
        const rmd160payhash = new ripemd160().update(phash).digest().toJSON().data

        const script = [opcodes.OP_DUP, opcodes.OP_HASH160]
            .concat([rmd160revoke.length], rmd160revoke).concat([opcodes.OP_EQUAL]) 
            .concat([opcodes.OP_IF])
            .concat([opcodes.OP_CHECKSIG])
            .concat([opcodes.OP_ELSE])
            .concat([remote.length], remote).concat([opcodes.OP_SWAP, opcodes.OP_SIZE, 1, 32, opcodes.OP_EQUAL])
            .concat([opcodes.OP_NOTIF])
            .concat([opcodes.OP_DROP, opcodes.OP_2, opcodes.OP_SWAP])
            .concat([local.length], local, [opcodes.OP_2, opcodes.OP_CHECKMULTISIG])
            .concat([opcodes.OP_ELSE])
            .concat([opcodes.OP_HASH160, rmd160payhash.length], rmd160payhash, [opcodes.OP_EQUALVERIFY])
            .concat([opcodes.OP_CHECKSIG])
            .concat([opcodes.OP_ENDIF])
            .concat([opcodes.OP_ENDIF])
        return Buffer.from(script)

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

        const script = [opcodes.OP_DUP, opcodes.OP_HASH160]
            .concat([rmd160revoke.length], rmd160revoke).concat([opcodes.OP_EQUAL]) 
            .concat([opcodes.OP_IF])
            .concat([opcodes.OP_CHECKSIG])
            .concat([opcodes.OP_ELSE])
            .concat([remote.length], remote).concat([opcodes.OP_SWAP, opcodes.OP_SIZE, 1, 32, opcodes.OP_EQUAL])
            .concat([opcodes.OP_IF])
            .concat([opcodes.OP_HASH160, rmd160payhash.length], rmd160payhash, [opcodes.OP_EQUALVERIFY])
            .concat([opcodes.OP_2, opcodes.OP_SWAP])
            .concat([local.length], local, [opcodes.OP_2, opcodes.OP_CHECKMULTISIG])            
            .concat([opcodes.OP_ELSE, opcodes.OP_DROP, exp.length], exp, [opcodes.OP_CHECKLOCKTIMEVERIFY, opcodes.OP_DROP])
            .concat([opcodes.OP_CHECKSIG])
            .concat([opcodes.OP_ENDIF])
            .concat([opcodes.OP_ENDIF])
        return Buffer.from(script)

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