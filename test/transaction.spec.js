const Transaction = require('../src/transaction')
const Script = require('../src/script')
const testdata = require('./testdata')
const assert = require('assert');

describe('should create transaction', function () {
    it('properly creates funding script', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const witness = Script.createFundingScript(local, remote)
        const witstr = Buffer.from(witness).toString('hex')
        assert.strictEqual(witstr, testdata.funding.witness_script)
    })
})