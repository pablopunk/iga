import fs from 'fs'
import path from 'path'
import http from 'http'
import requireString from 'require-from-string'
import * as sucrase from 'sucrase'
import pathExists from 'path-exists'
import pkg from '../package.json'

let handlerCache = {}

function getFromCache(url) {
  return handlerCache[url] || null
}

function setInCache(url, handler) {
  handlerCache[url] = handler
}

export default async function({
  root = process.cwd(),
  port = 3000,
  silent = false,
  useCache = true
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
      if (useCache) {
        const handlerFromCache = getFromCache(req.url)
        if (handlerFromCache) {
          return handlerFromCache(req, res)
        }
      }
      const endpointCode = getEndpointCode(endpoint)
      const endpointCodeTransformed = sucrase.transform(endpointCode, {
        transforms: ['imports', 'typescript']
      }).code
      const endpointHandler = requireString(endpointCodeTransformed)
      if (typeof endpointHandler === 'function') {
        useCache && setInCache(req.url, endpointHandler)
        return endpointHandler(req, res)
      } else if (typeof endpointHandler.default === 'function') {
        useCache && setInCache(req.url, endpointHandler.default)
        return endpointHandler.default(req, res)
      }

      throw new Error(`Endpoint ${endpoint} does not export a function`)
    } catch (err) {
      res.statusCode = 500

      // Respond with error if not in production
      if (process.env.NODE_ENV !== 'production') {
        return res.end(err.message)
      }

      // Log error in production
      console.error(err.message)
      return res.end('500')
    }
  })

  server.listen(port)

  if (!silent) {
    console.log(`${pkg.name} running at`, port)
  }

  return server
}

function getEndpointCode(file) {
  return fs.readFileSync(file, 'utf-8')
}

function getEndpointFile(root, paths) {
  const extensions = ['js', 'ts']
  for (let extension of extensions) {
    const fileName = `${paths[paths.length - 1]}.${extension}`
    const filePath = paths
      .slice(paths.length - 2, paths.length - 1)
      .concat(fileName)
    const pathWithoutIndex = path.join(root, 'routes', ...filePath)

    if (pathExists.sync(pathWithoutIndex)) {
      return pathWithoutIndex
    }

    const pathWithIndex = path.join(
      root,
      'routes',
      ...paths,
      `index.${extension}`
    )

    if (pathExists.sync(pathWithIndex)) {
      return pathWithIndex
    }
  }

  return null
}
