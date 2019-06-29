import fs from 'fs'
import path from 'path'
import http from 'http'
import requireString from 'require-from-string'
import * as sucrase from 'sucrase'
import pathExists from 'path-exists'

export default async function({
  root = process.cwd(),
  port = 3000,
  silent = false
} = {}) {
  const server = new http.Server((req, res) => {
    const paths = req.url
      .split('?')[0]
      .split('/')
      .filter(Boolean)
    const endpoint = getEndpointFile(root, paths)

    if (endpoint === null) {
      res.statusCode = 404
      return res.end('404')
    }

    try {
      const endpointCode = getEndpointCode(endpoint)
      const endpointCodeTransformed = sucrase.transform(endpointCode, {
        transforms: ['imports']
      }).code
      const endpointHandler = requireString(endpointCodeTransformed)
      if (typeof endpointHandler === 'function') {
        return endpointHandler(req, res)
      } else if (typeof endpointHandler.default === 'function') {
        return endpointHandler.default(req, res)
      }

      throw new Error(`Endpoint ${endpoint} does not export a function`)
    } catch (err) {
      res.statusCode = 500
      return res.end(err.message)
    }
  })

  server.listen(port)
  if (!silent) {
    console.log('`apii` running at', port)
  }

  return server
}

function getEndpointCode(file) {
  return fs.readFileSync(file, 'utf-8')
}

function getEndpointFile(root, paths) {
  const fileName = `${paths[paths.length - 1]}.js`
  const filePath = paths
    .slice(paths.length - 2, paths.length - 1)
    .concat(fileName)
  const pathWithoutIndex = path.join(root, 'routes', ...filePath)

  if (pathExists.sync(pathWithoutIndex)) {
    return pathWithoutIndex
  }

  const pathWithIndex = path.join(root, 'routes', ...paths, 'index.js')

  if (pathExists.sync(pathWithIndex)) {
    return pathWithIndex
  }

  return null
}
