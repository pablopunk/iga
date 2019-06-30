# iga

<p align="center">
  <a href="https://travis-ci.org/pablopunk/iga"><img src="https://img.shields.io/travis/pablopunk/iga.svg" /></a>
  <a href="https://github.com/pablopunk/miny"><img src="https://img.shields.io/badge/made_with-miny-1eced8.svg" /></a>
  <a href="https://www.npmjs.com/package/iga"><img src="https://img.shields.io/npm/dt/iga.svg" /></a>
</p>

<p align="center">
  <i>Zero config typescript/es6 server with the filesystem as the router</i>
</p>

Inspired by [NextJS](https://github.com/zeit/next.js), `iga` exposes a lightweight server using your file system as a router.

- One command
- 0 config ES6 modules
- Typescript out of the box
- Use the file system as the router
- Automatic code reloading (_available soon_)

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

Then create a `routes` folder with an `index.js`. Each route should export a function with the standard NodeJS `request` and `response` objects:

```js
// routes/index.js
export default async (request, response) => {
  res.end('Hello from iga!')
}
```

If you run `npm start` and you visit http://localhost:3000 you will see `Hello from iga!`.

### Routes

Now let's create another endpoint. Create a file `routes/random-fruit.js`:

```js
// routes/random-fruit.js
export default async (request, response) => {
  const fruits = ['apple', 'orange', 'pear']
  const random = Math.floor(Math.random() * 3)

  res.end(fruits[random])
}
```

Now if you run `npm start` again and visit http://localhost:3000/random-fruit you will get any of the fruits we declared in the file.

If you don't want to restart the server everytime you make changes, use `npm run dev` to watch and reload the code whenever there are changed files.

> NOTE: `dev` feature is not available yet, if you use it, it will works as `npm start`. WIP

#### FS to route

As you might have noticed by the previous examples, `iga` convers your file system into routes as follows:

- `routes/index.js`: `/`
- `routes/foo.js`: `/foo`
- `routes/foo/bar.js`: `/foo/bar`
- `routes/also-typescript.ts`: `/also-typescript`

## ES6 / Typescript

By default, `iga` allows you to write your code in es6 modules syntax or even **typescript**, with 0 configurations, thanks to [sucrase](https://sucrase.io). For `.js` files it will allow you to write es6 modules, but you can also directly write typescript in `.ts` files.

```ts
import { ServerResponse, IncomingMessage } from 'http'

export default function(req: IncomingMessage, res: ServerResponse) {
  res.end('hello from typescript.ts')
}
```

## async/await

If you want to, your exported function can be an `async` function so you can use `await` inside it to manage promises.

## Programmatic usage

`iga` exposes an API so it's easier to test and use as a library:

```js
const iga = require('iga')

iga({ root: '/path/to/project/folder', port: 3000 })
```

### Options

#### `root: string?`

> Path to the project that contains a 'routes' folder

Default: `process.cwd()`

#### `port: number?`

> Port that will be used to expose the server

Default: `3000`

#### `silent: boolean?`

> If `true` it won't console.log anything

Default: `false`

## License

MIT

## Author

| ![me](https://gravatar.com/avatar/fa50aeff0ddd6e63273a068b04353d9d?size=100) |
| ---------------------------------------------------------------------------- |
| [Pablo Varela](https://pablo.pink)                                           |
