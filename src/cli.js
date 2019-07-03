#!/usr/bin/env node
import path from 'path'
import http from 'http'
import pathExists from 'path-exists'
import mri from 'mri'
import pkg from '../package.json'
import { getMiddleWare } from '..'

const args = mri(process.argv.slice(2))
const commands = args._

if (args.v || args.version) {
  console.log(`Version ${pkg.version}`)
  process.exit(0)
}

const requiredFolderExists = pathExists.sync(path.join(process.cwd(), 'routes'))
if (!requiredFolderExists) {
  console.error('Folder `routes` does not exist in current directory')
  process.exit(1)
}

let command

if (!commands || commands.length < 1) {
  command = 'dev'
} else {
  command = commands[0]
}

const port = args.p || 3000

let middlewareOptions = { root: process.cwd() }

switch (command) {
  case 'start':
    middlewareOptions.useCache = true
    break
  case 'dev':
    middlewareOptions.useCache = false
    break
  default:
    console.log('Unknown command', command)
    process.exit(1)
}

const server = new http.Server(getMiddleWare(middlewareOptions))
server.listen(port)
console.log(`${pkg.name} ready on port`, port)
