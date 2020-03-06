# compare

A tool for interactively debugging pelias api queries.

This tool has three modes, a standalone mode, standalone SPA and an api/bundled mode. They share 99.9% of code and really only differ in their code entry points that specify some booleans to configure them.

### Standalone mode

Built by `yarn build`
Served by default with `yarn serve`

The standalone mode is what is hosted on https://pelias.github.io/compare/ - it defaults to geocoding against two geocode.earth api servers if other hosts aren't specified. It puts query params in location.hash of the url.

### Standalone SPA mode

Built by `yarn build:spa`

For now, this is hosted at https://pelias-compare.firebaseapp.com/. The only real difference is that this uses Single Page App (SPA) style routing, where every url is redirected to index.html, and query parameters are updated in location.search. The idea is that this could be hosted at compare.geocode.earth, so if you're debugging an http query at api.geocode.earth/xxxx you can just change the first part of the url to "compare" to get the gaphical experience. 


### API/bundled mode

The api/bundled mode is what is in-lined into the pelias api server. It defaults to geocoding against the host which it is served from.

The compiled output of the api/bundled version is published as a dependency free npm package called (pelias-compare)[https://www.npmjs.com/package/pelias-compare] - the api server takes this on as a dependency so it can serve the frontend on the server without needing any of the web frontend dependencies in its build chain.

*As a result, please only add new deps with `yarn add --dev` or `npm install --save-dev`*

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

### Compiles and minifies for SPA
```
yarn build:spa
```

Compiled artifacts will be output to spa/

### Publish a new version to npmjs
```
yarn publish
```
