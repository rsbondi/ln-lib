// ref: https://github.com/lightningnetwork/lightning-rfc/blob/master/03-transactions.md
const Script = require('../src/script')
const crypto = require('crypto')

class Channel {
    constructor(local_funding_pubkey, remote_funding_pubkey) {
        this.local_funding_pubkey = local_funding_pubkey,
        this.remote_funding_pubkey = remote_funding_pubkey
    }

    fund(inputs, satoshis, change_out) {
        let tx = {
            version: 2,
            locktime: 542251326,
            inputs: inputs,
            outputs: [],
        }
        let to_local_out = {
            value: satoshis,
            n: 0,
            scriptPubKey: Script.scriptPubKey(Script.createFundingScript(this.local_funding_pubkey, this.remote_funding_pubkey))
        }
        tx.outputs.push(to_local_out)
        tx.outputs.push(change_out)
        return tx
    }

    setBasepoints(basepoint_open, basepoint_accept) {
        this.basepoint_open = basepoint_open
        this.basepoint_accept = basepoint_accept
        this.obscurator = this.commitmentObscurator(basepoint_open, basepoint_accept)
    }

    commitmentSequence(num) {
        const obsucreCommitNum = parseInt(this.obscurator.slice(0, 3).toString('hex'), 16) ^ num
        const commitBuff = Buffer.from(obsucreCommitNum.toString(16), 'hex')
        const sequenceBuff = Buffer.concat([Buffer.from([0x80]), commitBuff])
        return parseInt(sequenceBuff.toString('hex'), 16)
    }

    commitmentLocktime(num) {
        const obsucreCommitNum = parseInt(this.obscurator.slice(-3).toString('hex'), 16) ^ num
        const commitBuff = Buffer.from(obsucreCommitNum.toString(16), 'hex')
        const lockBuff = Buffer.concat([Buffer.from([0x20]), commitBuff])
        return parseInt(lockBuff.toString('hex'), 16)
    }

    commitmentObscurator(basepoint_open, basepoint_accept) {
        basepoint_open = typeof basepoint_open == 'string' ? Buffer.from(basepoint_open,'hex') : basepoint_open
        basepoint_accept = typeof basepoint_accept == 'string' ? Buffer.from(basepoint_accept,'hex') : basepoint_accept
        const basepoint = Buffer.concat([basepoint_open, basepoint_accept])
        const hash = crypto.createHash('sha256').update(basepoint).digest()
        const last48bits = hash.slice(-6)
        return last48bits
    }

}

module.exports = Channel

//        return Buffer.from([opcodes.OP_0].concat([scripthash.length]).concat(Script._key(scripthash)))

