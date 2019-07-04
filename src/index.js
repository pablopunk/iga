import fs from 'fs'
import path from 'path'
import { parse } from 'url'
import requireString from 'require-from-string'
import * as sucrase from 'sucrase'
import pathExists from 'path-exists'

const defaultRoutesPath = path.join(process.cwd(), 'routes')

let handlerCache = {}

function getFromCache(url) {
  return handlerCache[url] || null
}

function setInCache(url, handler) {
  handlerCache[url] = handler
}

function getHandlerDinamically(endpoint) {
  let endpointHandler
  const endpointCode = getEndpointCode(endpoint)
  const endpointCodeTransformed = sucrase.transform(endpointCode, {
    transforms: ['imports', 'typescript']
  }).code
  endpointHandler = requireString(endpointCodeTransformed)
  if (typeof endpointHandler === 'function') {
    return endpointHandler
  } else if (typeof endpointHandler.default === 'function') {
    return endpointHandler.default
  }

  throw new Error(`Endpoint ${endpoint} does not export a function`)
}

function getEndpointCode(file) {
  return fs.readFileSync(file, 'utf-8')
}

function getEndpointFile(routesPath, paths) {
  const extensions = ['js', 'ts']
  for (let extension of extensions) {
    const fileName = `${paths[paths.length - 1]}.${extension}`
    const filePath = paths
      .slice(paths.length - 2, paths.length - 1)
      .concat(fileName)
    const pathWithoutIndex = path.join(routesPath, ...filePath)

    if (pathExists.sync(pathWithoutIndex)) {
      return pathWithoutIndex
    }

    const pathWithIndex = path.join(routesPath, ...paths, `index.${extension}`)

    if (pathExists.sync(pathWithIndex)) {
      return pathWithIndex
    }
  }

  return null
}

const middleware = ({
  useCache = true,
  routes = defaultRoutesPath
} = {}) => async (req, res) => {
  const paths = req.url
    .split('?')[0]
    .split('/')
    .filter(Boolean)
  const endpoint = getEndpointFile(routes, paths)

  if (endpoint === null) {
    res.statusCode = 404
    return res.end('404')
  }

  req.query = parse(req.url, true).query

  try {
    let endpointHandler
    if (useCache) {
      const handlerFromCache = getFromCache(req.url)
      if (handlerFromCache) {
        endpointHandler = handlerFromCache
      }
    }

    if (!endpointHandler) {
      endpointHandler = getHandlerDinamically(endpoint)
      setInCache(req.url, endpointHandler)
    }

    let handlerResult = endpointHandler(req, res)
    if (res.finished) {
      return // headers were sent inside endpointHandler
    }

    if (typeof handlerResult.then === 'function') {
      handlerResult = await handlerResult
    }

    switch (typeof handlerResult) {
      case 'object':
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(handlerResult))
      case 'string':
        return res.end(handlerResult)
      case 'number':
        res.statusCode = handlerResult
        return res.end()
      default:
        console.error(
          `Unkown return type '${typeof handlerResult}' from endpoint ${endpoint}`
        )
        res.statusCode = 500
        return res.end()
    }
  } catch (err) {
    res.statusCode = 500

    // Log error in production
    if (process.env.NODE_ENV === 'production') {
      console.error(err.message)
      return res.end()
    }

    // Respond with error if not in production
    return res.end(err.message)
  }
}

export const getMiddleWare = args => middleware(args)
export default middleware()
