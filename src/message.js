// BOLT1 BOLT2 BOLT7

class Message {
    /**
     * 
     * @param {Buffer} hex the message bytes
     */
    constructor(hex) {
        this.bytes = hex
        this.index = 0 // byte
        this.message = this._parse(hex)
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
        },

        /* BOLT 2 */

        // open_channel
        32: () => {
           const chain_hash = this._read(32)
           const temporary_channel_id = this._read(32)
           const funding_satoshis = this._readInt(8)
           const push_msat = this._readInt(8)
           const dust_limit_satoshis = this._readInt(8)
           const max_htlc_value_in_flight_msat = this._readInt(8)
           const channel_reserve_satoshis = this._readInt(8)
           const htlc_minimum_msat = this._readInt(8)
           const feerate_per_kw = this._readInt(4)
           const to_self_delay = this._readInt(2)
           const max_accepted_htlcs = this._readInt(2)
           const funding_pubkey = this._read(33)
           const revocation_basepoint = this._read(33)
           const payment_basepoint = this._read(33)
           const delayed_payment_basepoint = this._read(33)
           const htlc_basepoint = this._read(33)
           const first_per_commitment_point = this._read(33)
           const channel_flags = this._read(1)
           if(this.index < this.bytes.length) {
               const shutdown_len = this._readInt(2)
               const option_upfront_shutdown_script = this._read(shutdown_len)
           }
           return {chain_hash, temporary_channel_id, funding_satoshis, push_msat, dust_limit_satoshis, max_htlc_value_in_flight_msat,
                    channel_reserve_satoshis, htlc_minimum_msat, feerate_per_kw, to_self_delay, max_accepted_htlcs, funding_pubkey,
                    revocation_basepoint, payment_basepoint, delayed_payment_basepoint, htlc_basepoint, first_per_commitment_point, 
                    channel_flags, option_upfront_shutdown_script}
        },

        // accept_channel
        33: () => {
            const temporary_channel_id = this._read(32)
            const dust_limit_satoshis = this._readInt(8)
            const max_htlc_value_in_flight_msat = this._readInt(8)
            const channel_reserve_satoshis = this._readInt(8)
            const htlc_minimum_msat = this._readInt(8)
            const minimum_depth = this._readInt(4)
            const to_self_delay = this._readInt(2)
            const max_accepted_htlcs = this._readInt(2)
            const funding_pubkey = this._read(33)
            const revocation_basepoint = this._read(33)
            const payment_basepoint = this._read(33)
            const delayed_payment_basepoint = this._read(33)
            const htlc_basepoint = this._read(33)
            const first_per_commitment_point = this._read(33)
            if(this.index < this.bytes.length) {
                const shutdown_len = this._readInt(2)
                const option_upfront_shutdown_script = this._read(shutdown_len)
            }

            return {temporary_channel_id, dust_limit_satoshis, max_htlc_value_in_flight_msat, channel_reserve_satoshis, htlc_minimum_msat,
                    minimum_depth, to_self_delay, max_accepted_htlcs, funding_pubkey, revocation_basepoint, payment_basepoint, 
                    delayed_payment_basepoint, htlc_basepoint, first_per_commitment_point, option_upfront_shutdown_script}

        },

        // funding_created
        34: () => {
            const temporary_channel_id = this._read(32)
            const funding_txid = this._read(32)
            const funding_output_index = this._readInt(2)
            const signature = this._read(64)

            return {temporary_channel_id, funding_txid, funding_output_index, signature}
        },

        // funding_signed
        35: () => {
            const channel_id = this._read(32)
            const signature = this._read(64)

            return {channel_id, signature}
        },

        // funding_locked
        36: () => {
            const channel_id = this._read(32)
            const next_per_commitment_point = this._read(33)

            return {channel_id, next_per_commitment_point}
        },

        // shutdown
        38: () => {
            const channel_id = this._read(32)
            const len = this._readInt(2)
            const scriptpubkey = this._read(len)

            return {channel_id, scriptpubkey}
        },

        // closing_signed
        39: () => {
            const channel_id = this._read(32)
            const fee_satoshis = this._readInt(8)
            const signature = this._read(64)

            return {channel_id, fee_satoshis, signature}
        },

        // update_add_htlc
        128: () => {
            const channel_id = this._read(32)
            const id = this._read(8)
            const amount_msat = this._readInt(8)
            const payment_hash = this._read(32)
            const cltv_expiry = this._readInt(4)
            const onion_routing_packet = this._read(1366)
            
            return {channel_id, id, amount_msat, payment_hash, cltv_expiry, onion_routing_packet}
        },

        // update_fulfill_htlc
        130: () => {
            const channel_id = this._read(32)
            const id = this._read(8)
            const payment_preimage = this._read(32)

            return {channel_id, id, payment_preimage}
        },

        // update_fail_htlc
        131: () => {
            const channel_id = this._read(32)
            const id = this._read(8)
            const len = this._readInt(2)
            const reason = this._read(len) // TODO: string???

            return {channel_id, id, reason}
        },

        // update_fail_malformed_htlc
        135: () => {
            const channel_id = this._read(32)
            const id = this._read(8)
            const sha256_of_onion = this._read(32)
            const failure_code = this._read(2)

            return {channel_id, id, sha256_of_onion, failure_code}
        },

        // commitment_signed
        132: () => {
            const channel_id = this._read(32)
            const signature = this._read(64)
            const num_htlcs = this._readInt(2)
            let htlc_signatures = []
            for(let i=0; i < num_htlcs; i++) htlc_signatures.push(this._read(64))
            
            return {channel_id, signature, htlc_signatures}
        },

        // revoke_and_ack
        133: () => {
            const channel_id = this._read(32)
            const per_commitment_secret = this._read(32)
            const next_per_commitment_point = this._read(33)

            return {channel_id, per_commitment_secret, next_per_commitment_point}
        },

        // update_fee
        134: () => {
            const channel_id = this._read(32)
            const feerate_per_kw = this._readInt(4)

            return {channel_id, feerate_per_kw}
        },

        // channel_reestablish
        136: () => {
            const channel_id = this._read(32)
            const next_local_commitment_number = this._readInt(8)
            const next_remote_revocation_number = this._readInt(8)

            // TODO: check against flags???
            // [32:your_last_per_commitment_secret] (option_data_loss_protect)
            // [33:my_current_per_commitment_point] (option_data_loss_protect)

            return {channel_id, next_local_commitment_number, next_remote_revocation_number}
        },

        /* BOLT 7 */

        // announcement_signatures
        259: () => {

        },

        // channel_announcement
        256: () => {

        },

        // node_announcement
        257: () => {

        },

        // channel_update
        258: () => {

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