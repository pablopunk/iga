const test = require('myass')
const path = require('path')
const { default: m } = require('..')
const unfetch = require('isomorphic-unfetch')
const getPort = require('get-port')

const rootFolder = path.join(__dirname, 'example')

test('Creates an index.js endpoint at /', async t => {
  const port = await getPort()
  const server = await m({ root: rootFolder, port })
  const res = await unfetch(`http://localhost:${port}/`)
  const data = await res.text()
  server.close()
  t.is(data, 'hello from index.js')
})

test('Creates a named endpoint', async t => {
  const port = await getPort()
  const server = await m({ root: rootFolder, port })
  const res = await unfetch(`http://localhost:${port}/foo`)
  const data = await res.text()
  server.close()
  t.is(data, 'hello from foo.js')
})

test('Returns 404 for empty endpoint', async t => {
  const port = await getPort()
  const server = await m({ root: rootFolder, port })
  const res = await unfetch(`http://localhost:${port}/bar`)
  const code = res.status
  server.close()
  t.is(code, 404)
})
