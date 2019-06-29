#!/usr/bin/env node
'use strict'
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
var _mri = require('mri')
var _mri2 = _interopRequireDefault(_mri)
var _2 = require('..')
var _3 = _interopRequireDefault(_2)

const args = _mri2.default.call(void 0, process.argv.slice(2))
const commands = args._

let command

if (!commands || commands.length < 1) {
  command = 'dev'
} else {
  command = commands[0]
}

switch (command) {
  case 'start':
  case 'dev':
    _3.default.call(void 0)
    break
  default:
    console.log('Unknown command', command)
    break
}
