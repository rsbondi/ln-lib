// ref: https://github.com/lightningnetwork/lightning-rfc/blob/master/03-transactions.md
const Script = require('./script')
const crypto = require('crypto')
const Fee = require('./fee')


class Channel {
    constructor(local_funding_pubkey, remote_funding_pubkey, feerate_per_kw, dust_limit_satoshis) {
        this.local_funding_pubkey = local_funding_pubkey,
        this.remote_funding_pubkey = remote_funding_pubkey
        this.fees = new Fee(feerate_per_kw, dust_limit_satoshis)
        this.commitment_number = -1
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

    commitmentSequence() {
        // I am still not sure about this one, the rfc example does not seem to match, who can help???
        const obsucreCommitNum = parseInt(this.obscurator.slice(0, 3).toString('hex'), 16) ^ this.commitment_number
        const commitBuff = Buffer.from(obsucreCommitNum.toString(16), 'hex')
        const sequenceBuff = Buffer.concat([Buffer.from([0x80]), commitBuff])
        return parseInt(sequenceBuff.toString('hex'), 16)
    }

    commitmentLocktime() {
        const obsucreCommitNum = parseInt(this.obscurator.slice(-3).toString('hex'), 16) ^ this.commitment_number
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

    createCommitmentTx(tx) {
        let commitmentTx = { version: 2, inputs: [], outputs: []}
        this.commitment_number++

        commitmentTx.locktime = this.commitmentLocktime()
        tx.inputs[0].sequence = this.commitmentSequence() // ???
        commitmentTx.inputs.push(tx.inputs[0])

        commitmentTx.fee = this.fees.calculateAndTrim(tx.htlcs, tx.to_local, tx.to_remote)

        tx.htlcs.offered.forEach(o => { if(!o.trimmed) commitmentTx.outputs.push(o) })        
        tx.htlcs.received.forEach(o => { if(!o.trimmed) commitmentTx.outputs.push(o) })        

        if(!tx.to_local.trimmed) commitmentTx.outputs.push(tx.to_local)
        if(!tx.to_remote.trimmed) commitmentTx.outputs.push(tx.to_remote)

        commitmentTx.outputs.sort((a, b) => {
            return a.value < b.value ? 1 : b.value < a.value ? -1 : Buffer.compare(a.scriptPubKey, b.scriptPubKey)
        })
        return commitmentTx
    }

}

module.exports = Channel
