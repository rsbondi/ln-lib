// TODO: use reader  in PaymentRequest
class Reader {
    constructor(words) {
      this.index = 0
      this.words = words
    }
    read(n) {
      let response = []
      let val
      for (let i = 0; i < n; i++) {
        if(!(i%8)) val = 0
        let wordIndex = Math.floor(this.index / 5)
        let bitIndex = 4 - this.index % 5
        let word = this.words[wordIndex]
        let pow = (1 << (7 - i%8)) * (word >> bitIndex & 1)
        val += pow
        if(i%8==7) response.push(val)
        this.index++
      }
      return response
    }
  
    readInt(n) {
      let val = 0
      for (let i = 0; i < n; i++) {
        let wordIndex = Math.floor(this.index / 5)
        let bitIndex = 4 - this.index % 5
        let word = this.words[wordIndex]
        let pow = (1 << (n - i - 1)) * (word >> bitIndex & 1)
        val += pow
        this.index++
      }
      return val
    }

    readWords(n) {
      let wordIndex = this.index / 5
      this.index += n*5
      return this.words.slice(wordIndex, wordIndex+n)
    }
  
  
    remaining() {
      return 5 * this.words.length - this.index
    }
  }
  
  module.exports = Reader