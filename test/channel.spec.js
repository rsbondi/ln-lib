const Channel = require('../src/channel')
const Script = require('../src/script')
const testdata = require('./testdata')
const assert = require('assert');

describe('Test transactions', function () {
    it('properly creates funding wscript', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const witness = Script.createFundingScript(local, remote)
        const witstr = witness.toString('hex')
        assert.strictEqual(witstr, testdata.funding.witness_script)
    })

    it('properly creates to_local wscript', function () {
        const revpk = testdata.commitment.common.local_revocation_pubkey
        const delpk = testdata.commitment.common.local_delayedpubkey
        const to_self_delay = testdata.commitment.common.local_delay
        const witness = Script.toLocalOutput(revpk, delpk, to_self_delay)
        const witstr = witness.toString('hex')
        assert.strictEqual(witstr, testdata.commitment.txs[0].to_local.wscript)
    })

    it('properly creates to_local scriptPubKey', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        const intx = testdata.funding.input_tx
        const tx = chan.fund([{txid: intx.input_txid, n: intx.input_index}], intx.funding_satoshis, '')
        assert.strictEqual(tx.outputs[0].scriptPubKey.toString('hex'), "0020c015c4a6be010e21657068fc2e6a9d02b27ebe4d490a25846f7237f104d1a3cd")
    })
})