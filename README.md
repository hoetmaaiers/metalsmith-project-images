# Metalsmith Project Images

A metalsmith plugin that scan all images in subfolders and add it to metadata.

## Install

```sh
npm install --save metalsmith-project-images
```

## Quick usage

```js
var Metalsmith = require('metalsmith');
var images = require('metalsmith-project-images');

var metalsmith = new Metalsmith(__dirname)
  .use(images({
  	pattern: 'projects/**/*'
  });
```

## Api

```
.use(images(options))
```

### Options

**pattern**
**image extensions**
**pattern**