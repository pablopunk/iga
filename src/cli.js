#!/usr/bin/env node
import mri from 'mri'
import exposeServer from '..'

const args = mri(process.argv.slice(2))
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
    exposeServer()
    break
  default:
    console.log('Unknown command', command)
    break
}
