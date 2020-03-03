# compare

A tool for interactively debugging pelias api queries.

This tool has two modes, a standalone mode and a bundled mode.

The standalone mode is what is hosted on https://pelias.github.io/compare/ - it defaults to geocoding against two geocode.earth api servers.

The api mode is what is in-lined into the pelias api server. It defaults to geocoding against the host which it is served from.

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

Compiled artifacts will be output to dist/

### Compiles and minifies for api production
```
yarn build:api
```

Compiled artifacts will be output to dist/