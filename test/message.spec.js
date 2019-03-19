const Message = require('../src/message')
const assert = require('assert');


describe('Test Messages', function () {
    // TODO: find more meaningful test data
    it('unknown type returns error', function () {
        const msg = Buffer.from([0, 1])
        const bad = new Message(msg)
        assert.strictEqual(bad.message.error, 'invalid message type')
    })

    it('parse init message', function () {
        const msg = Buffer.from([0, 16, 0, 0, 0, 1, 1])
        const init = new Message(msg)
        assert.strictEqual(init.message.name, 'init')
        assert.strictEqual(init.message.globalfeatures.length, 0)
        assert.strictEqual(init.message.localfeatures[0], 1)
    })

    it('parse error message', function () {
        const msg = Buffer.from([
            0, 17, 
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            0, 1, 1])
        const error = new Message(msg)
        assert.strictEqual(error.message.name, 'error')
        assert.strictEqual(error.message.chanId.toString('hex'), '0101010101010101010101010101010101010101010101010101010101010101')
        assert.strictEqual(error.message.data[0], 1)
    })

    it('parse ping message', function () {
        const msg = Buffer.from([0, 18, 0, 1, 0, 1, 1])
        const ping = new Message(msg)
        assert.strictEqual(ping.message.name, 'ping')
        assert.strictEqual(ping.message.num_pong_bytes, 1)
        assert.strictEqual(ping.message.ignored[0], 1)
    })

    it('parse pong message', function () {
        const msg = Buffer.from([0, 19, 0, 1, 1])
        const pong = new Message(msg)
        assert.strictEqual(pong.message.name, 'pong')
        assert.strictEqual(pong.message.ignored[0], 1)
    })

}) 