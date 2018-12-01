const big = require('bignumber.js')

const prefixes = [
  "lnbcrt",
  "lnbc",
  "lntb",
  "lnsb"
]

const amounts = {
  '': new big(1),
  'm': new big(0.001),
  'u': new big(0.000001),
  'n': new big(0.000000001),
  'p': new big(0.000000000001)
}

const opcodes = { 
  OP_0: 0x00,
  OP_1: 0x51,
  OP_2: 0x52,
  OP_IF: 0x63,
  OP_NOTIF: 0x64,
  OP_ELSE: 0x67,
  OP_ENDIF: 0x68,
  OP_DROP: 0x75,
  OP_DUP: 0x76,
  OP_SWAP: 0x7c,
  OP_SIZE: 0x82,
  OP_EQUAL: 0x87,
  OP_EQUALVERIFY: 0x88,
  OP_RIPEMD160: 0xa6,
  OP_HASH160: 0xa9,
  OP_CHECKSIG: 0xac,
  OP_CHECKMULTISIG: 0xae,
  OP_CHECKLOCKTIMEVERIFY: 0xb1,
  OP_CHECKSEQUENCEVERIFY: 0xb2,
};

// this allows you to get code name from hex value
const codeops = Object.keys(opcodes).reduce((o, k) => { 
  o[opcodes[k]] = k; return o;
},{})

module.exports = {
    prefixes: prefixes,
    amounts: amounts,
    opcodes: opcodes
}