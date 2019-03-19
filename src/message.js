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

    parser(n) {
        return {
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
                        channel_flags, option_upfront_shutdown_script, name: 'open_channel'}
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
        
                return {name:'accept_channel', temporary_channel_id, dust_limit_satoshis, max_htlc_value_in_flight_msat, channel_reserve_satoshis, htlc_minimum_msat,
                        minimum_depth, to_self_delay, max_accepted_htlcs, funding_pubkey, revocation_basepoint, payment_basepoint, 
                        delayed_payment_basepoint, htlc_basepoint, first_per_commitment_point, option_upfront_shutdown_script}
        
            },
        
            // funding_created
            34: () => {
                const temporary_channel_id = this._read(32)
                const funding_txid = this._read(32)
                const funding_output_index = this._readInt(2)
                const signature = this._read(64)
        
                return {name: 'funding_created', temporary_channel_id, funding_txid, funding_output_index, signature}
            },
        
            // funding_signed
            35: () => {
                const channel_id = this._read(32)
                const signature = this._read(64)
        
                return {name: 'funding_signed', channel_id, signature}
            },
        
            // funding_locked
            36: () => {
                const channel_id = this._read(32)
                const next_per_commitment_point = this._read(33)
        
                return {name: 'funding_locked', channel_id, next_per_commitment_point}
            },
        
            // shutdown
            38: () => {
                const channel_id = this._read(32)
                const len = this._readInt(2)
                const scriptpubkey = this._read(len)
        
                return {name: 'shutdown', channel_id, scriptpubkey}
            },
        
            // closing_signed
            39: () => {
                const channel_id = this._read(32)
                const fee_satoshis = this._readInt(8)
                const signature = this._read(64)
        
                return {name: 'closing_signed', channel_id, fee_satoshis, signature}
            },
        
            // update_add_htlc
            128: () => {
                const channel_id = this._read(32)
                const id = this._read(8)
                const amount_msat = this._readInt(8)
                const payment_hash = this._read(32)
                const cltv_expiry = this._readInt(4)
                const onion_routing_packet = this._read(1366)
                
                return {name: 'update_add_htlc', channel_id, id, amount_msat, payment_hash, cltv_expiry, onion_routing_packet}
            },
        
            // update_fulfill_htlc
            130: () => {
                const channel_id = this._read(32)
                const id = this._read(8)
                const payment_preimage = this._read(32)
        
                return {name: 'update_fulfill_htlc', channel_id, id, payment_preimage}
            },
        
            // update_fail_htlc
            131: () => {
                const channel_id = this._read(32)
                const id = this._read(8)
                const len = this._readInt(2)
                const reason = this._read(len) // TODO: string???
        
                return {name: 'update_fail_htlc', channel_id, id, reason}
            },
        
            // update_fail_malformed_htlc
            135: () => {
                const channel_id = this._read(32)
                const id = this._read(8)
                const sha256_of_onion = this._read(32)
                const failure_code = this._read(2)
        
                return {name: 'update_fail_malformed_htlc', channel_id, id, sha256_of_onion, failure_code}
            },
        
            // commitment_signed
            132: () => {
                const channel_id = this._read(32)
                const signature = this._read(64)
                const num_htlcs = this._readInt(2)
                let htlc_signatures = []
                for(let i=0; i < num_htlcs; i++) htlc_signatures.push(this._read(64))
                
                return {name: 'commitment_signed', channel_id, signature, htlc_signatures}
            },
        
            // revoke_and_ack
            133: () => {
                const channel_id = this._read(32)
                const per_commitment_secret = this._read(32)
                const next_per_commitment_point = this._read(33)
        
                return {name: 'revoke_and_ack', channel_id, per_commitment_secret, next_per_commitment_point}
            },
        
            // update_fee
            134: () => {
                const channel_id = this._read(32)
                const feerate_per_kw = this._readInt(4)
        
                return {name:'update_fee', channel_id, feerate_per_kw}
            },
        
            // channel_reestablish
            136: () => {
                const channel_id = this._read(32)
                const next_local_commitment_number = this._readInt(8)
                const next_remote_revocation_number = this._readInt(8)
        
                // TODO: check against flags???
                // [32:your_last_per_commitment_secret] (option_data_loss_protect)
                // [33:my_current_per_commitment_point] (option_data_loss_protect)
        
                return {name: 'channel_reestablish', channel_id, next_local_commitment_number, next_remote_revocation_number}
            },
        
            /* BOLT 7 */
        
            // announcement_signatures
            259: () => {
                const channel_id = this._read(32)
                const short_channel_id = this._read(8)
                const node_signature = this._read(64)
                const bitcoin_signature = this._read(64)
        
                return {name: 'announcement_signatures', channel_id, short_channel_id, node_signature, bitcoin_signature}
            },
        
            // channel_announcement
            256: () => {
                const node_signature_1 = this._read(64)
                const node_signature_2 = this._read(64)
                const bitcoin_signature_1 = this._read(64)
                const bitcoin_signature_2 = this._read(64)
                const len = this._readInt(2)
                const features = this._read(len)
                const chain_hash = this._read(32)
                const short_channel_id = this._read(8)
                const node_id_1 = this._read(33)
                const node_id_2 = this._read(33)
                const bitcoin_key_1 = this._read(33)
                const bitcoin_key_2 = this._read(33)
        
                return {name: 'channel_announcement', node_signature_1, node_signature_2, bitcoin_signature_1, bitcoin_signature_2,
                        features, chain_hash, short_channel_id, node_id_1, node_id_2, bitcoin_key_1, bitcoin_key_2}
            },
        
            // node_announcement
            257: () => {
                const signature = this._read(64)
                const flen = this._readInt(2)
                const features =  this._read(flen)
                const timestamp = this._readInt(4)
                const node_id = this._read(33)
                const rgb_color = this._read(3)
                const alias = this._read(32) // TODO: string???
                const addrlen = this._readInt(2)
                const addresses = this._read(addrlen)
        
                /* TODO: need to understand better
        addresses allows a node to announce its willingness to accept incoming network connections: it contains a series of address descriptors for connecting to the node. The first byte describes the address type and is followed by the appropriate number of bytes for that type.
        
        The following address descriptor types are defined:
        
        1: ipv4; data = [4:ipv4_addr][2:port] (length 6)
        2: ipv6; data = [16:ipv6_addr][2:port] (length 18)
        3: Tor v2 onion service; data = [10:onion_addr][2:port] (length 12)
        version 2 onion service addresses; Encodes an 80-bit, truncated SHA-1 hash of a 1024-bit RSA public key for the onion service (a.k.a. Tor hidden service).
        4: Tor v3 onion service; data = [35:onion_addr][2:port] (length 37)
        version 3 (prop224) onion service addresses; Encodes: [32:32_byte_ed25519_pubkey] || [2:checksum] || [1:version], where checksum = sha3(".onion checksum" | pubkey || version)[:2].
                */
        
                return {name: 'node_announcement', signature, features, timestamp, node_id, rgb_color, alias, addresses}
            },
        
            // channel_update
            258: () => {
                const signature = this._read(64)
                const chain_hash = this._read(32)
                const short_channel_id = this._read(8)
                const timestamp = this._readInt(4)
                const message_flags = this._read(1)
                const channel_flags = this._read(1)
                const cltv_expiry_delta = this._readInt(2)
                const htlc_minimum_msat = this._readInt(8)
                const fee_base_msat = this._readInt(4)
                const fee_proportional_millionths = this._readInt(4)
                const htlc_maximum_msat = this.index < this.bytes.length ? this._readInt(8) : null
        
                return {name: 'channel_update', signature, chain_hash, short_channel_id, timestamp, message_flags, channel_flags,
                        cltv_expiry_delta, htlc_minimum_msat, fee_base_msat, fee_proportional_millionths, htlc_maximum_msat}
            }
        
        }[n]
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

        const parser = this.parser(msgType)
        if(typeof parser == 'undefined') {
            return {error: 'invalid message type'}
        }
        return parser()
    }
}

module.exports = Message