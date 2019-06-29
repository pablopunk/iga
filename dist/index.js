'use strict'
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj
  } else {
    var newObj = {}
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = obj[key]
        }
      }
    }
    newObj.default = obj
    return newObj
  }
}
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
Object.defineProperty(exports, '__esModule', { value: true })
var _fs = require('fs')
var _fs2 = _interopRequireDefault(_fs)
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _http = require('http')
var _http2 = _interopRequireDefault(_http)
var _requirefromstring = require('require-from-string')
var _requirefromstring2 = _interopRequireDefault(_requirefromstring)
var _sucrase = require('sucrase')
var sucrase = _interopRequireWildcard(_sucrase)
var _pathexists = require('path-exists')
var _pathexists2 = _interopRequireDefault(_pathexists)

exports.default = async function({ root = process.cwd(), port = 3000 } = {}) {
  const server = new _http2.default.Server((req, res) => {
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
      const endpointHandler = _requirefromstring2.default.call(
        void 0,
        endpointCodeTransformed
      )
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
  console.log('`apii` running at', port)

  return server
}

function getEndpointCode(file) {
  return _fs2.default.readFileSync(file, 'utf-8')
}

function getEndpointFile(root, paths) {
  const fileName = `${paths[paths.length - 1]}.js`
  const filePath = paths
    .slice(paths.length - 2, paths.length - 1)
    .concat(fileName)
  const pathWithoutIndex = _path2.default.join(root, 'routes', ...filePath)

  if (_pathexists2.default.sync(pathWithoutIndex)) {
    return pathWithoutIndex
  }

  const pathWithIndex = _path2.default.join(
    root,
    'routes',
    ...paths,
    'index.js'
  )

  if (_pathexists2.default.sync(pathWithIndex)) {
    return pathWithIndex
  }

  return null
}
