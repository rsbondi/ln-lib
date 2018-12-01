const {opcodes} = require('./constants')

class Script {
    static createFundingScript(local_pubkey, remote_pubkey) {
        if(typeof local_pubkey == 'string') local_pubkey = Buffer.from(local_pubkey,'hex').toJSON().data
        if(typeof remote_pubkey == 'string') remote_pubkey = Buffer.from(remote_pubkey,'hex').toJSON().data
        const commands = [opcodes.OP_2]
            .concat([local_pubkey.length])
            .concat(local_pubkey)
            .concat([remote_pubkey.length])
            .concat(remote_pubkey)
            .concat([opcodes.OP_2])
            .concat([opcodes.OP_CHECKMULTISIG])
        return commands
    }
}

module.exports = Script