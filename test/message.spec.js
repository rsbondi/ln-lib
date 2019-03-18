const Message = require('../src/message')
const assert = require('assert');


describe('Test Messages', function () {
    it('unknown type returns error', function () {
        const msg = Buffer.from([0, 1])
        const bad = new Message(msg)
        assert.strictEqual(bad.message.error, 'invalid message type')
    })

    it('init message', function () {
        const msg = Buffer.from([0, 16, 0, 1, 1])
        const init = new Message(msg)
        assert.strictEqual(init.message.name, 'init')
    })


}) 