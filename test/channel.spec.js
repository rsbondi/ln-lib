const Channel = require('../src/channel')
const Script = require('../src/script')
const testdata = require('./testdata')
const assert = require('assert');
const crypto = require('crypto')

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

    it('properly creates to_local scriptPubKey', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        const intx = testdata.funding.input_tx
        const tx = chan.fund([{txid: intx.input_txid, n: intx.input_index}], intx.funding_satoshis, '')
        assert.strictEqual(tx.outputs[0].scriptPubKey.toString('hex'), "0020c015c4a6be010e21657068fc2e6a9d02b27ebe4d490a25846f7237f104d1a3cd")
    })

})    

describe('Test commitment transactions', function () {
    it('properly creates to_local wscript', function () {
        const revpk = common.local_revocation_pubkey
        const delpk = common.local_delayedpubkey
        const to_self_delay = common.local_delay
        const witness = Script.toLocalOutput(revpk, delpk, to_self_delay)
        const witstr = witness.toString('hex')
        assert.strictEqual(witstr, testdata.commitment.txs[0].to_local.wscript)
        assert.strictEqual(Script.scriptPubKey(witness).toString('hex'), "00204adb4e2f00643db396dd120d4e7dc17625f5f2c11a40d857accc862d6b7dd80e")
    })

    it('properly creates to_remote wscript', function () {
        const pk = common.remotepubkey
        const script = Script.p2wpkh(pk)
        assert.strictEqual(script.toString('hex'), "0014ccf1af2f2aabee14bb40fa3851ab2301de843110")
    })

    it('properly creates offered HTLC wscript', function () {
        const pk = common.remotepubkey
        const script = Script.offeredHTLCout(common.local_revocation_pubkey, 
            common.localpubkey, 
            common.remotepubkey,
            crypto.createHash('sha256').update(Buffer.from(common.htlc_2_payment_preimage, 'hex')).digest())
        assert.strictEqual(script.toString('hex'), "76a91414011f7254d96b819c76986c277d115efce6f7b58763ac67210394854aa6eab5b2a8122cc726e9dded053a2184d88256816826d6231c068d4a5b7c820120876475527c21030d417a46946384f88d5f3337267c5e579765875dc4daca813e21734b140639e752ae67a914b43e1b38138a41b37f7cd9a1d274bc63e3a9b5d188ac6868")
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