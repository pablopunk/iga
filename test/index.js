const http = require('http')
const path = require('path')
const test = require('myass')
const { getMiddleWare } = require('..')
const fetch = require('node-fetch')
const getPort = require('get-port')

const root = path.join(__dirname, 'example')

async function getResponseFrom(endpoint, cb) {
  const port = await getPort()
  const server = new http.Server(getMiddleWare({ root }))
  server.listen(port, () => {
    fetch(`http://localhost:${port}${endpoint}`).then(res => {
      server.close()
      cb(res)
    })
  })
}

function genericTest(endpoint, responseText) {
  return async t => {
    getResponseFrom(endpoint, async res => {
      const data = await res.text()
      t.is(data, responseText)
    })
  }
}

function genericStatusCodeTest(endpoint, expectedCode) {
  return async t => {
    getResponseFrom(endpoint, res => {
      const code = res.status
      t.is(code, expectedCode)
    })
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

test(
  'Returns custom status code as number',
  genericStatusCodeTest('/code', 203)
)

test('Supports async functions', genericTest('/async', 'hello from async.ts'))

test('Supports strings', genericTest('/string', 'just a string'))

test(
  'Ignores result when headers have been sent',
  genericTest('/headers-sent', 'first')
)

test('Sends parsed query.params', genericTest('/query?id=bar', 'bar'))

test('Supports json and sends correct data type', async t => {
  getResponseFrom('/json', async res => {
    const json = await res.json()
    t.is(json, { custom: 'foo' })
  })
})
