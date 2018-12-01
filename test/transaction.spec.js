const Transaction = require('../src/transaction')
const Script = require('../src/script')
const testdata = require('./testdata')
const assert = require('assert');

describe('should create transaction', function () {
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
})