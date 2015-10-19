# install

```bash
> [sudo] npm install -g bower;
> bower install;
> python -m SimpleHTTPServer 8000
```

# advanced usage

you can use ```getEndpoints()``` and ```setEndpoints()``` to change which hosts are being queried, or use ```resetEndpoints()``` to reset to defaults.

your endpoint preferences are stored in localStorage, so they will persist between page loads.

# deploy to github.io

simply open a [new PR against gh-pages](https://github.com/pelias/compare/compare/gh-pages...master)
