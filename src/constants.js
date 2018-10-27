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

module.exports = {
    prefixes: prefixes,
    amounts: amounts
}