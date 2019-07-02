const test = require('myass')
const path = require('path')
const { default: m } = require('..')
const unfetch = require('isomorphic-unfetch')
const getPort = require('get-port')

const root = path.join(__dirname, 'example')

function genericTest(endpoint, responseText) {
  return async t => {
    const port = await getPort()
    const server = await m({ root, port, silent: true })
    const res = await unfetch(`http://localhost:${port}${endpoint}`)
    const data = await res.text()
    server.close()
    t.is(data, responseText)
  }
}

function genericStatusCodeTest(endpoint, expectedCode) {
  return async t => {
    const port = await getPort()
    const server = await m({ root, port, silent: true })
    const res = await unfetch(`http://localhost:${port}${endpoint}`)
    const code = res.status
    server.close()
    t.is(code, expectedCode)
  }
}

test(
  'Creates an index.js endpoint at /',
  genericTest('/', 'hello from index.js')
)

test('Creates a named endpoint', genericTest('/foo', 'hello from foo.js'))

test(
  'Supports nested folders with index.js support',
  genericTest('/bar', 'hello from bar/index.js')
)

test(
  'Supports typescript',
  genericTest('/typescript', 'hello from typescript.ts')
)

test(
  'Returns 404 for empty endpoint',
  genericStatusCodeTest('/idontexist', 404)
)
