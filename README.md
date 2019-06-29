# iga

<p align="center">
  <a href="https://travis-ci.org/pablopunk/iga"><img src="https://img.shields.io/travis/pablopunk/iga.svg" /></a>
  <a href="https://github.com/pablopunk/miny"><img src="https://img.shields.io/badge/made_with-miny-1eced8.svg" /></a>
  <a href="https://www.npmjs.com/package/iga"><img src="https://img.shields.io/npm/dt/iga.svg" /></a>
</p>

<p align="center">
  <i>Quickly create an API with automatic routing</i>
</p>

Inspired by [NextJS](https://github.com/zeit/next.js), `iga` exposes a lightweight server using your file system as a router.

- One command
- _0 config ES6 modules_
- Use the file system as router
- Automatic code reloading
- Typescript out of the box _available soon_

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

## ES6

By default, `iga` allows you to write your API in es6 modules syntax, with 0 configurations, thanks to [sucrase](https://sucrase.io). I might extend this to use typescript out of the box too.

## Programmatic usage

`iga` exposes an API so it's easier to test and use as a library:

```js
const iga = require('iga')

iga({ root: '/path/to/api/folder', port: 3000 })
```

### Options

#### `root: string?`

> Path to the project that contains a 'routes' folder

Default: `process.cwd()`

#### `port: number?`

> Port that will be used to expose the API

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
