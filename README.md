# compare

A tool for interactively debugging pelias api queries.

This tool has two modes, a standalone mode and an api/bundled mode.

The standalone mode is what is hosted on https://pelias.github.io/compare/ - it defaults to geocoding against two geocode.earth api servers.

The api/bundled mode is what is in-lined into the pelias api server. It defaults to geocoding against the host which it is served from.

The compiled output of the api/bundled version is published as a dependency free npm package called (pelias-compare)[https://www.npmjs.com/package/pelias-compare] - the api server takes this on as a dependency so it can serve the frontend on the server without needing any of the web frontend dependencies in its build chain.

As a result, please only add new deps with `yarn add --dev` or `npm install --save-dev`

## Project setup
```
yarn install
```
### Compiles and hot-reloads for development
```
yarn serve
```

This will print out a message telling you what port it's running on locally. Generally http://localhost:8080

### Compiles and minifies for standalone production
```
yarn build
```

Compiled artifacts will be output to docs/ (so that this could be hosted on github pages easily)

### Compiles and minifies for api production
```
yarn build:api
```

Compiled artifacts will be output to dist-api/

### Publish a new version to npmjs
```
yarn publish
```
