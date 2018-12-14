const {ops} = require('./constants')
const crypto = require('crypto')
const ripemd160 = require('ripemd160')

class Script {
    // 2 of 2 multisig script for creating commitments
    // hashed in scriptPubKey for funding
    static createFundingScript(local_pubkey, remote_pubkey) {
        const local = Script._key(local_pubkey)
        const remote = Script._key(remote_pubkey)

        const script = [ops.OP_2]
            .concat(ops.push(local))
            .concat(ops.push(remote))
            .concat([ops.OP_2])
            .concat([ops.OP_CHECKMULTISIG])
        return Buffer.from(script)
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

        const script = [ops.OP_IF]
            .concat(ops.push(rev))
            .concat(ops.OP_ELSE)
            .concat(ops.push(del))
            .concat(ops.OP_CHECKSEQUENCEVERIFY)
            .concat(ops.OP_DROP)
            .concat(ops.push(loc))
            .concat(ops.OP_ENDIF)
            .concat(ops.OP_CHECKSIG)
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

        const script = [ops.OP_DUP, ops.OP_HASH160]
            .concat(ops.push(rmd160revoke).concat([ops.OP_EQUAL]))
            .concat([ops.OP_IF])
            .concat([ops.OP_CHECKSIG])
            .concat([ops.OP_ELSE])
            .concat(ops.push(remote).concat([ops.OP_SWAP, ops.OP_SIZE, 1, 32, ops.OP_EQUAL]))
            .concat([ops.OP_NOTIF])
            .concat([ops.OP_DROP, ops.OP_2, ops.OP_SWAP])
            .concat(ops.push(local), [ops.OP_2, ops.OP_CHECKMULTISIG])
            .concat([ops.OP_ELSE])
            .concat([ops.OP_HASH160], ops.push(rmd160payhash), [ops.OP_EQUALVERIFY])
            .concat([ops.OP_CHECKSIG])
            .concat([ops.OP_ENDIF])
            .concat([ops.OP_ENDIF])
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

        const script = [ops.OP_DUP, ops.OP_HASH160]
            .concat(ops.push(rmd160revoke)).concat([ops.OP_EQUAL]) 
            .concat([ops.OP_IF])
            .concat([ops.OP_CHECKSIG])
            .concat([ops.OP_ELSE])
            .concat(ops.push(remote), [ops.OP_SWAP, ops.OP_SIZE, 1, 32, ops.OP_EQUAL])
            .concat([ops.OP_IF])
            .concat([ops.OP_HASH160], ops.push(rmd160payhash), [ops.OP_EQUALVERIFY])
            .concat([ops.OP_2, ops.OP_SWAP])
            .concat(ops.push(local), [ops.OP_2, ops.OP_CHECKMULTISIG])            
            .concat([ops.OP_ELSE, ops.OP_DROP], ops.push(exp), [ops.OP_CHECKLOCKTIMEVERIFY, ops.OP_DROP])
            .concat([ops.OP_CHECKSIG])
            .concat([ops.OP_ENDIF])
            .concat([ops.OP_ENDIF])
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