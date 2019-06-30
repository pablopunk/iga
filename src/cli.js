#!/usr/bin/env node
import path from 'path'
import pathExists from 'path-exists'
import mri from 'mri'
import exposeServer from '..'
import nodemon from 'nodemon'

const requiredFolderExists = pathExists.sync(path.join(process.cwd(), 'routes'))
if (!requiredFolderExists) {
  console.error('Folder `routes` does not exist in current directory')
  process.exit(1)
}

const args = mri(process.argv.slice(2))
const commands = args._

let command

if (!commands || commands.length < 1) {
  command = 'dev'
} else {
  command = commands[0]
}

const port = args.p || 3000

switch (command) {
  case 'start':
    exposeServer({ port })
    break
  case 'dev':
    nodemon({
      watch: path.join(process.cwd(), 'routes'),
      ext: 'js ts json',
      exec: 'iga start'
    })
      .on('restart', files => {
        console.log(
          '[Restarting] - Modified',
          files.map(f => path.basename(f)).join(', ')
        )
      })
      .on('quit', () => {
        console.log('[Exit]')
        process.exit(0)
      })
    break
  default:
    console.log('Unknown command', command)
    break
}
