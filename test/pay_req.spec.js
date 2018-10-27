const PaymentRequest = require('../src/invoice')
const testdata = require('./testdata')
const assert = require('assert');

describe('Test payment lib', function () {
    it('should initialize with proper bech32 prefix', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            assert.strictEqual(pay.prefix, data.prefix)

        })
    })

    it('should initialize with proper payment amount', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            assert.strictEqual(pay.amount.toNumber(), data.amount)

        })
    })
    
    it('should initialize with proper timestamp', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            assert.strictEqual(pay.timestamp, data.timestamp)

        })
    })
    
    it('should initialize to proper tagged data count', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            assert.strictEqual(data.tagged.length, pay.tagged.length)

        })
    })

    it('should initialize with proper signature', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            assert.strictEqual(data.signature, pay.signature.toString('hex'))

        })
    })

    it('should retrieve public key from request', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            if(data.pubKey) assert.strictEqual(data.pubKey, pay.requesterPubKey().toString('hex'))

        })
    })

    it('should get payment hash from tagged field', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            let testhash = data.tagged.filter(t => t.type == 'payment_hash')[0]
            let payhash = pay.tagged.filter(t => t.type == 'payment_hash')[0]
            assert.strictEqual(testhash.data, payhash.data)

        })
    })

    it('should get description from tagged field', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            let testdesc = data.tagged.filter(t => t.type == 'description')
            if(testdesc.length && testdesc[0].data) {  // am I handling empty ok here?
                let paydesc = pay.tagged.filter(t => t.type == 'description')
                assert.strictEqual(testdesc[0].data, paydesc[0].data)
            }

        })
    })

    it('properly calculates expiry', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            let testexpiry = data.tagged.filter(t => t.type == 'expiry')
            if(testexpiry.length) {
                let payexpiry = pay.tagged.filter(t => t.type == 'expiry')
                assert.strictEqual(testexpiry[0].data, payexpiry[0].data)
            }

        })
    })

})