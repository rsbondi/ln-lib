// BOLT3

class Fee {
    constructor(feerate_per_kw, dust_limit_satoshis) {
        this.feerate_per_kw = feerate_per_kw
        this.dust_limit_satoshis = dust_limit_satoshis
    }

    calculateAndTrim(htlcs, to_local, to_remote) {
        let feeweight = Fee.WEIGHT_COMMITMENT_BASE
        let dust = 0
        htlcs.offered.forEach(out => {
            const timeoutWeight = this.calculateType(Fee.TYPE_TIMEOUT)
            if(out.value_msat / 1000 >= this.dust_limit_satoshis + timeoutWeight) feeweight += Fee.WEIGHT_COMMITMENT_UNTRIMMED
            else {
                dust += out.value_msat / 1000
                out.trimmed = true
            }
        })
        htlcs.received.forEach(out => {
            const successWeight = this.calculateType(Fee.TYPE_SUCCESS)
            if(out.value_msat / 1000 >= this.dust_limit_satoshis + successWeight) feeweight += Fee.WEIGHT_COMMITMENT_UNTRIMMED
            else {
                dust += out.value_msat / 1000
                out.trimmed = true
            }
        })
        return Math.floor((feeweight * this.feerate_per_kw) / 1000)  + dust
    }

    calculateType(type) {
        switch (type) {

            case Fee.TYPE_SUCCESS:
                return Math.floor((Fee.WEIGHT_SUCCESS * this.feerate_per_kw) / 1000)

            case Fee.TYPE_TIMEOUT:
                return Math.floor((Fee.WEIGHT_TIMEOUT * this.feerate_per_kw) / 1000)
            
            default:
                throw({message: 'invalid fee type'})


        }
    }
}

Fee.TYPE_TIMEOUT = 1
Fee.TYPE_SUCCESS = 2
Fee.WEIGHT_COMMITMENT_BASE = 724
Fee.WEIGHT_COMMITMENT_UNTRIMMED = 172
Fee.WEIGHT_TIMEOUT = 663 // offered
Fee.WEIGHT_SUCCESS = 703 // received

module.exports = Fee
