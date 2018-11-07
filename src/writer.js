const bech32 = require('bech32')

class WordWriter {
    constructor() {
      this.words = []
    }

    write(bytes) {
        this.words = this.words.concat(bech32.toWords(bytes))
    }

    writeInt(val, n) {
        let bytes = []      
        let v = 0
        for (let i = 0; i < n; i++) {
          let comp = val >> i%32  
          let pow = (1 << (i%5)) * (comp & 1)
          if(i%32==31) val = comp // workaround for 32 bit limit on shift
          v += pow
          if(i%5==4 ) {
              bytes.unshift(v)
              v = 0
          }
        }
        this.words = this.words.concat(bytes)
    }

}

module.exports = WordWriter