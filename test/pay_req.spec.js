const PaymentRequest = require('../src/invoice')
const testdata = require('./testdata')
const assert = require('assert');

const req = "lnsb20300n1pdarmakpp57zzavxfm39rzg9juc6awru0zfgxvdaewkdupkmmw0x787ds0k04sdqcvdex2ct5v4jzq6twyp3k7er9cqzys7d9uyytydxmsqdz6h9s9wlu2276hjsysa3upu0mz0k55el5323634yjasmnep6hkmyh93ke6nj0v9p3rzgyl5wwu2cfplyg5wv9wdycqaaejt7"

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
            let testhash = data.tagged.map(t => t.type == 'payment_hash')[0]
            let payhash = pay.tagged.map(t => t.type == 'payment_hash')[0]
            assert.strictEqual(testhash, payhash)

        })
    })

    it('should get description from tagged field', function () {
        testdata.requests.forEach(data => {
            let pay = new PaymentRequest(data.request)
            let testdesc = data.tagged.map(t => t.type == 'description')[0]
            let paydesc = pay.tagged.map(t => t.type == 'description')[0]
            assert.strictEqual(testdesc, paydesc)

        })
    })

})