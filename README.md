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

```javascript
var metalsmith = new Metalsmith(__dirname);

var defaultOptions = {
	authorizedExts: ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
	pattern: '',
	imagesDirectory: 'images',
};

metalsmith.use(images(defaultOptions))
// or passing in no options will use the defaults
metalsmith.use(images())
```

##### One options object
```javascript
var options = {
	authorizedExts: ['gif']
	pattern: 'memes/**/*.md',
	imagesDirectory: 'giphys',
}
```

##### Multiple options objects
It is possible to define multiple configuration objects.

```javascript
var options = [
	// only add gif's to memes ;)
	{
		authorizedExts: ['gif']
		pattern: 'memes/**/*.md',
		imagesDirectory: 'giphys',
	},

	// add all images to its matching project
	{
		pattern: 'projects/**/*.md',
	},
]
```

### Options

| name | default | description |
| ------------- |:-------------|:-:|
| pattern | `**/*.md` | ...|
| authorizedExts | jpg, jpeg, svg, png, gif, JPG, JPEG, SVG, PNG, GIF | ... |
| imagesDirectory | `images` | ... |