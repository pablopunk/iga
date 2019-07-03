# iga

<p align="center">
  <a href="https://travis-ci.org/pablopunk/iga"><img src="https://img.shields.io/travis/pablopunk/iga.svg" /></a>
  <a href="https://github.com/pablopunk/miny"><img src="https://img.shields.io/badge/made_with-miny-1eced8.svg" /></a>
  <a href="https://www.npmjs.com/package/iga"><img src="https://img.shields.io/npm/dt/iga.svg" /></a>
  <a href="https://packagephobia.now.sh/result?p=iga"><img src="https://packagephobia.now.sh/badge?p=sucrase" alt="install size"></a>
</p>

<p align="center">
  <i>Zero config typescript/es6 server with the filesystem as the router</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/pablopunk/art/master/iga/iga.svg?sanitize=true" alt="logo">
</p>

Inspired by [NextJS](https://github.com/zeit/next.js), `iga` exposes a lightweight server using your file system as a router.

- One command
- 0 config ES6 modules
- Typescript out of the box
- Use the file system as the router
- Automatic code reloading

## Install

```sh
npm install iga
```

## Usage

In your `package.json`:

```json
{
  "scripts": {
    "dev": "iga",
    "start": "iga start"
  }
}
```

Then create a `routes` folder with an `index.js`. Each route should export a function with the **standard NodeJS `request` and `response` objects** with some [helpers](#helpers).

```js
// routes/index.js
export default () => 'Hello from iga!'
```

If you run `npm start` and you visit http://localhost:3000 you will see `Hello from iga!`.

### Routes

Now let's create another endpoint. Create a file `routes/random-fruit.js`:

```js
// routes/random-fruit.js
export default () => {
  const fruits = ['apple', 'orange', 'pear']
  const random = Math.floor(Math.random() * 3)

  return fruits[random]
}
```

Now if you run `npm start` again and visit http://localhost:3000/random-fruit you will get any of the fruits we declared in the file.

If you don't want to restart the server everytime you make changes, use `npm run dev` to disable cache and see the latest changes to your code.

#### Response / Request

`iga` catches the return value of your function and makes an http response with it, so you can do things like:

- `return 'some text'`: Response will be plain text
- `return { foo: bar }`: Response will be JSON
- `return 403`: Response will send a 403 status code

If you still want to do something manually, you can use both `request` and `response` objects, like:

```js
export default (req, res) => {
  res.end(`Hello from ${req.url}`)
}
```

In this case the return value will be ignored, because http headers have already been sent with `res.end`.

#### Helpers

> `request.query`

Contains the result of `require('url').parse(req.url, true).query`, so you can code faster:

```js
// routes/find-user.js
export default req => {
  if (!req.query.userId) {
    return 403 // bad request
  }

  const user = getUserFromDatabase({ id: req.query.userId })
  if (!user) {
    return 404 // not found
  }

  return { results: [user] }
}
```

#### Filesystem as the router

As you might have noticed by the previous examples, `iga` convers your file system into routes as follows:

- `routes/index.js`: `/`
- `routes/foo.js`: `/foo`
- `routes/foo/bar.js`: `/foo/bar`
- `routes/also-typescript.ts`: `/also-typescript`

## ES6 / Typescript

By default, `iga` allows you to write your code in es5 `module.exports`, es6 `export default`or even **typescript**, with 0 configurations, thanks to [sucrase](https://sucrase.io). For `.js` files it will allow you to write es6 modules, but you can also directly write typescript in `.ts` files.

```ts
import { ServerResponse, IncomingMessage } from 'http'

export default function(req: IncomingMessage, res: ServerResponse) {
  res.end('hello from typescript.ts')
}
```

## async/await

If you want to, your exported function can be an `async` function so you can use `await` inside it to manage promises.

## CLI

### Commands

> `iga`

Without any arguments, `iga` will build your project everytime there's a change in your `routes` folder, so you can focus on coding.

> `iga start`

It will start the server without rebuilding. This should be used in production.

### Options

> `-p | --port XXXX`

_Optional_. Start the server on port `XXXX`. Defaults to 3000.

####

## Programmatic usage

`iga` exposes an API so it's easier to test and use as a library:

```js
import iga from 'iga'
import http from 'http'

const server = new http.Server(iga)
```

If you want, there are some options you can customize:

```js
import { getMiddleWare } from 'iga'
import http from 'http'

const server = new http.Server(
  getMiddleWare({
    root: '/path/to/my/project',
    useCache: false
  })
)
```

### Options

#### `root?: string`

> Path to the project that contains a 'routes' folder

Default: `process.cwd()`

#### `useCache?: boolean`

> If `false` everytime you change your code you will
> be able to see the new version on the server
> This is what `iga` command uses with no arguments

Default: `true`

## License

MIT

## Author

| ![me](https://gravatar.com/avatar/fa50aeff0ddd6e63273a068b04353d9d?size=100) |
| ---------------------------------------------------------------------------- |
| [Pablo Varela](https://pablo.pink)                                           |
