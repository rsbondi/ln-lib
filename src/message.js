// BOLT1

class Message {
    /**
     * 
     * @param {Buffer} hex the message bytes
     */
    constructor(hex) {
        this.bytes = hex
        this.index = 0 // byte
    }

    parsers = {
        // init
        16: () => {
            const gflen = this._readInt(2)
            const globalfeatures = this._read(gflen)

            const lflen = this._readInt(2)
            const localfeatures = this._read(lflen)

            return {name: 'init', globalfeatures, localfeatures}
        },

        // error
        17: () => {
            const chanId = this._read(32)
            const len = this._readInt(2)
            const data = this._read(len)

            return {name: 'error', chanId, data}
        },

        // ping
        18: () => {
            const num_pong_bytes = this._readInt(2)
            const byteslen = this._readInt(2)
            const ignored = this._read(byteslen)

            return {name: 'ping', num_pong_bytes, ignored}
        },

        // pong
        19: () => {
            const byteslen = this._readInt(2)
            const ignored = this._read(byteslen)

            return {name: 'pong', ignored}
        }


    }

    _read(n) {
        const b = this.bytes.slice(this.index, this.index + n)
        this.index += n
        return b
    }

    _readInt(n) {
        const buf = this._read(n)
        let bitindex = 0
        let val = 0
        for (let byte = n - 1; ~byte; byte--) {
            for (let bit = 0; bit < 8; bit++ , bitindex++) {
                val += ((buf[byte] >> bit) & 1) * (1 << bitindex)
            }
        }
        return val
    }

    _parse() {
        const msgType = this._readInt(2)
        // index now points to payload

        if(!(msgType in this.parsers)) {
            return {error: 'invalid message type'}
        }
        return this.parsers(msgType)()
    }
}

module.exports = Message