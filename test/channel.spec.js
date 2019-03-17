const Channel = require('../src/channel')
const Script = require('../src/script')
const Fee = require('../src/fee')
const testdata = require('./data/testdata_channels')
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
        const script = Script.offeredHTLCout(common.local_revocation_pubkey, 
            common.localpubkey, 
            common.remotepubkey,
            crypto.createHash('sha256').update(Buffer.from(common.htlc_2_payment_preimage, 'hex')).digest())
        assert.strictEqual(script.toString('hex'), "76a91414011f7254d96b819c76986c277d115efce6f7b58763ac67210394854aa6eab5b2a8122cc726e9dded053a2184d88256816826d6231c068d4a5b7c820120876475527c21030d417a46946384f88d5f3337267c5e579765875dc4daca813e21734b140639e752ae67a914b43e1b38138a41b37f7cd9a1d274bc63e3a9b5d188ac6868")
        assert.strictEqual(Script.scriptPubKey(script).toString('hex'), "0020403d394747cae42e98ff01734ad5c08f82ba123d3d9a620abda88989651e2ab5")

        const script3 = Script.offeredHTLCout(common.local_revocation_pubkey, 
            common.localpubkey, 
            common.remotepubkey,
            crypto.createHash('sha256').update(Buffer.from(common.htlc_3_payment_preimage, 'hex')).digest())
        assert.strictEqual(script3.toString('hex'), "76a91414011f7254d96b819c76986c277d115efce6f7b58763ac67210394854aa6eab5b2a8122cc726e9dded053a2184d88256816826d6231c068d4a5b7c820120876475527c21030d417a46946384f88d5f3337267c5e579765875dc4daca813e21734b140639e752ae67a9148a486ff2e31d6158bf39e2608864d63fefd09d5b88ac6868")
        assert.strictEqual(Script.scriptPubKey(script3).toString('hex'), "0020c20b5d1f8584fd90443e7b7b720136174fa4b9333c261d04dbbd012635c0f419")
    })

    it('properly creates received HTLC wscript', function () {
        const script = Script.receivedHTLCout(common.local_revocation_pubkey, 
            common.localpubkey, 
            common.remotepubkey,
            crypto.createHash('sha256').update(Buffer.from(common.htlc_0_payment_preimage, 'hex')).digest(),
            common.htlc_0_expiry
            )
        assert.strictEqual(script.toString('hex'), "76a91414011f7254d96b819c76986c277d115efce6f7b58763ac67210394854aa6eab5b2a8122cc726e9dded053a2184d88256816826d6231c068d4a5b7c8201208763a914b8bcb07f6344b42ab04250c86a6e8b75d3fdbbc688527c21030d417a46946384f88d5f3337267c5e579765875dc4daca813e21734b140639e752ae677502f401b175ac6868")
        assert.strictEqual(Script.scriptPubKey(script).toString('hex'), "002052bfef0479d7b293c27e0f1eb294bea154c63a3294ef092c19af51409bce0e2a")

        const script1 = Script.receivedHTLCout(common.local_revocation_pubkey, 
            common.localpubkey, 
            common.remotepubkey,
            crypto.createHash('sha256').update(Buffer.from(common.htlc_1_payment_preimage, 'hex')).digest(),
            common.htlc_1_expiry
            )
        assert.strictEqual(script1.toString('hex'), "76a91414011f7254d96b819c76986c277d115efce6f7b58763ac67210394854aa6eab5b2a8122cc726e9dded053a2184d88256816826d6231c068d4a5b7c8201208763a9144b6b2e5444c2639cc0fb7bcea5afba3f3cdce23988527c21030d417a46946384f88d5f3337267c5e579765875dc4daca813e21734b140639e752ae677502f501b175ac6868")
        assert.strictEqual(Script.scriptPubKey(script1).toString('hex'), "0020748eba944fedc8827f6b06bc44678f93c0f9e6078b35c6331ed31e75f8ce0c2d")

        const script4 = Script.receivedHTLCout(common.local_revocation_pubkey, 
            common.localpubkey, 
            common.remotepubkey,
            crypto.createHash('sha256').update(Buffer.from(common.htlc_4_payment_preimage, 'hex')).digest(),
            common.htlc_4_expiry
            )
        assert.strictEqual(script4.toString('hex'), "76a91414011f7254d96b819c76986c277d115efce6f7b58763ac67210394854aa6eab5b2a8122cc726e9dded053a2184d88256816826d6231c068d4a5b7c8201208763a91418bc1a114ccf9c052d3d23e28d3b0a9d1227434288527c21030d417a46946384f88d5f3337267c5e579765875dc4daca813e21734b140639e752ae677502f801b175ac6868")
        assert.strictEqual(Script.scriptPubKey(script4).toString('hex'), "00208c48d15160397c9731df9bc3b236656efb6665fbfe92b4a6878e88a499f741c4")

    })

    it('properly creates sequence', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        chan.setBasepoints(common.local_payment_basepoint, common.remote_payment_basepoint)
        chan.commitment_number = 42
        const sequence = chan.commitmentSequence()
        assert.strictEqual(sequence, 2150346808)
    })

    it('properly creates locktime', function () {
        const local = testdata.funding.local_funding_pubkey
        const remote = testdata.funding.remote_funding_pubkey
        const chan = new Channel(local, remote)
        chan.setBasepoints(common.local_payment_basepoint, common.remote_payment_basepoint)
        chan.commitment_number = 42
        const locktime = chan.commitmentLocktime()
        assert.strictEqual(locktime, 542251326)
    })

    
})

describe('Test errors', function () {
    it('script parameters do not accept invalid type expecting array result', function () {
        assert.throws(
            () => {
                Script.createFundingScript([1, 2, 3], '')
            },
            {
                message:  'value must be of type string of Buffer, recieved object'
            }
        )
    })

    it('script parameters do not accept invalid type expecting Buffer result', function () {
        assert.throws(
            () => {
                Script.p2wpkh([1, 2, 3])
            },
            {
                message:  'value must be of type string of Buffer, recieved object'
            }
        )
    })

    it('script parameters do not accept invalid number type', function () {
        assert.throws(
            () => {
                Script.toLocalOutput('', '', '')
            },
            {
                message:  'expected number, received string'
            }
        )
    })
})

describe('Test fees', function () {
    it('calculate fee', function () {
        let feeCalc = new Fee(5000, 546)
        const fee =feeCalc.calculateAndTrim({
            offered: [
                {value_msat: 5000000},
                {value_msat: 1000000},
            ],
            received: [
                {value_msat: 7000000},
                {value_msat: 800000},
            ]
        })
        assert.strictEqual(fee, 7140)
    })

    it('check proper trimming of outputs', function () {
        let feeCalc = new Fee(5000, 546)
        let htlcs = {
            offered: [
                {value_msat: 5000000},
                {value_msat: 1000000},
            ],
            received: [
                {value_msat: 7000000},
                {value_msat: 800000},
            ]
        }
        const fee =feeCalc.calculateAndTrim(htlcs)
        assert.strictEqual(htlcs.offered[0].trimmed, undefined)
        assert.strictEqual(htlcs.offered[1].trimmed, true)
        assert.strictEqual(htlcs.received[0].trimmed, undefined)
        assert.strictEqual(htlcs.received[1].trimmed, true)
    })
})

