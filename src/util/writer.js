// this is for bech32 5 bit word format

const bech32 = require('bech32')

class WordWriter {
    constructor() {
      this.words = [] // array of 5 bit words for bech32 encoding
      this.offset = 0
      this.leftover = 0
    }

    /**
     * read 8 bit words and append as 5 bit to internal buffer
     * @param {number[]} bytes array of 8 bit words to convert
     */
    write(bytes) {
        this.words = this.words.concat(bech32.toWords(bytes))
    }

    writeBytes(bytes) {
        let index = this.offset
        let v = this.leftover
        let result = []
        for (let i = 0; i < bytes.length; ++i) {
            for(let bit=0; bit < 8; bit++, index++) {
                let pow = (1 << (4-index%5)) * ((bytes[i] >> (7-bit)) & 1)
                v+=pow
                if(index%5==4) {
                    result.push(v)
                    v = 0
                }
            }
        }

        if(index % 5) {
            this.leftover = v
            this.offset = index % 5
        }
        this.words = this.words.concat(result) // append
    }

    /**
     * append an integer value to internal buffer
     * @param {number} val an integer value to append to internal buffer
     * @param {number} [n] an optional number of bits in increments of 5, if unknown, will be calculated and written 
     */
    writeInt(val, n) {
        if(!n) {                       // if length unkown, calculate and additionally append number of words
            let p = 0
            while(val > 1 << p) p++    // how many bits
            n = 5*Math.ceil((p+1)/5)   // sync to multiple of 5
            this.writeInt(n/5, 10)     // write number of 5 bit words to internal buffer
        }
        let bytes = []      
        let v = this.leftover
        for (let i = this.offset; i < n + this.offset; i++) {
            let comp = val >> i%32     // we need 35 for timestamp so workaround
            let pow = (1 << (i%5)) * (comp & 1) // each shift is 2^n, mod to the current word
            if(i%32==31) val = comp    // workaround for 32 bit limit on shift
            v += pow
            if(i%5==4 ) {              // we have a word
              bytes.unshift(v)         // big endian so unshift
              v = 0                    // start over for next word
            }
        }
        if((n+this.offset) % 5) {
            this.leftover = v
            this.offset = (n+this.offset) % 5
        }
        this.words = this.words.concat(bytes) // append
        
    }

}

module.exports = WordWriter