# install

```bash
> [sudo] npm install -g bower;
> bower install;
> python -m SimpleHTTPServer 8000
```

# usage

Enter any Pelias query string into the box on the top, and it will query
multiple Pelias instances with that query, displaying results side by side for easy comparison.

# advanced usage

you can use ```getEndpoints()``` and ```setEndpoints()``` in your browser `Console` tab to change which hosts are being queried, or use ```resetEndpoints()``` to reset to defaults.

your endpoint preferences are stored in `localStorage`, so they will persist between page loads.

# compare against localhost

you can update the endpoints to point to localhost; in your browser `Console` tab type:

```javascript
> getEndpoints()

[
  "https://api.geocode.earth",
  "http://another-pelias.com"
]
```
```javascript
> setEndpoints([
  "https://api.geocode.earth",
  "http://another-pelias.com",
  "http://localhost:3100"
])

MainController.js:112 saved to localStorage
```

# commit dependencies to github

please commit your `bower_components/*` to github so they are available on the github CDN.

# deploy to github.io

Github Pages is activated on the master branch, so open PRs as normal.

**note** it can take several minutes before the gh-pages content appears at http://pelias.github.io/compare
