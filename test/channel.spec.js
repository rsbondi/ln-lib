const Channel = require('../src/channel')
const Script = require('../src/script')
const testdata = require('./testdata')
const assert = require('assert');

const commit = testdata.commitment
const common = commit.common
const txs = commit.txs
const funding = testdata.funding

describe('Test funding transactions', function () {
    it('properly creates funding wscript', function () {
        const local = funding.local_funding_pubkey
        const remote = funding.remote_funding_pubkey
        const witness = Script.createFundingScript(local, remote)
        const witstr = witness.toString('hex')
        assert.strictEqual(witstr, funding.witness_script)
    })

    it('properly creates to_local wscript', function () {
        const revpk = common.local_revocation_pubkey
        const delpk = common.local_delayedpubkey
        const to_self_delay = common.local_delay
        const witness = Script.toLocalOutput(revpk, delpk, to_self_delay)
        const witstr = witness.toString('hex')
        assert.strictEqual(witstr, testdata.commitment.txs[0].to_local.wscript)
    })

})

describe('Test commitment transactions', function () {
    it('properly creates to_local scriptPubKey', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        const intx = testdata.funding.input_tx
        const tx = chan.fund([{txid: intx.input_txid, n: intx.input_index}], intx.funding_satoshis, '')
        assert.strictEqual(tx.outputs[0].scriptPubKey.toString('hex'), "0020c015c4a6be010e21657068fc2e6a9d02b27ebe4d490a25846f7237f104d1a3cd")
    })

    it('properly creates sequence', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        chan.setBasepoints(common.local_payment_basepoint, common.remote_payment_basepoint)
        const sequence = chan.commitmentSequence(0) // TODO: this works but does not match the docs, need to find out what's up
        assert.strictEqual(sequence, 2150346808)
    })

    it('properly creates locktime', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        chan.setBasepoints(common.local_payment_basepoint, common.remote_payment_basepoint)
        const locktime = chan.commitmentLocktime(42)
        assert.strictEqual(locktime, 542251326)
    })
})