'use strict';

var debug = require('debug')('metalsmith-project-images'),
    path = require('path'),
    fs = require("fs"),
    matcher = require('minimatch'),
    _ = require('lodash');


// Expose `plugin`.
module.exports = plugin;
module.exports.isAuthorizedFile = isAuthorizedFile;
module.exports.normalizeOptions = normalizeOptions;
module.exports.getMatchingFiles = getMatchingFiles;

/**
 *
 * @param {Object} options
 *   @property {String} pattern
 *   @property {String | function} imagesDirectory - directory in which we will go looking for images
 *   @property {String} authorizedExts - images authorized image extensions
 * @return {Function}
 */
function plugin(options) {

return function innerFunction(files, metalsmith, done) {
  setImmediate(done);

  // sane default
  var optionsArray = [];

  if (_.isArray(options)) {
    // multiple options objects
    optionsArray = options;
  } else if (_.isObject(options)) {
    // one options object
    optionsArray = [options];
  }
  _.each(optionsArray, function(optionsItem) {
    addImagesToFiles(files, metalsmith, done, optionsItem);
  })
}

function addImagesToFiles(files, metalsmith, done, options) {
  // set options
  options = normalizeOptions(options)

  // get matching files
  var matchingFiles = getMatchingFiles(files, options.pattern);

  _.each(matchingFiles, function(file) {
    if (_.isUndefined(files[file])) return true;

    debug('processing ' + file);

    var imagesDirectory = options.imagesDirectory;
    if (typeof imagesDirectory === "function") {
    	imagesDirectory = imagesDirectory(file);
    }


    var imagesPath = path.join(metalsmith.source(), path.dirname(file), imagesDirectory);
    debug('searching for images in ' + imagesPath);
    var exist = fs.existsSync(imagesPath);
    // no access, skip the path
    if (!exist) return;

    var dirFiles = fs.readdirSync(imagesPath);
    files[file][options.imagesKey] = files[file][options.imagesKey] || [];

    // add files as images metadata
    _.each(dirFiles, function(dirFile) {
      // check extension and remove thumbnails
      if (isAuthorizedFile(dirFile, options.authorizedExts)) {
        var filePath = path.parse(file);

        var imagePath = path.join(filePath.dir, imagesDirectory, dirFile);
        debug('add image ' + imagePath);
        files[file][options.imagesKey].push(imagePath);
      }
    });

    files[file][options.imagesKey] = _.uniq(files[file][options.imagesKey]);
  });
};

}


/**
 * @param {Object} options
 * @param {Array} authorized extensions - e.g ['jpg', 'png', 'gif']
 * @return {Object}
 */
function normalizeOptions(options) {
  // define options
  var defaultOptions = {
    authorizedExts: ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
    pattern: '**/*.md',
    imagesDirectory: 'images',
    imagesKey: 'images',
  };

  return _.extend(defaultOptions, options);
}


/**
 * @param {String} file
 * @param {Array} authorized extensions - e.g ['jpg', 'png', 'gif']
 * @return {Boolean}
 */
function isAuthorizedFile(file, authorizedExtensions) {
  // get extension
  var extension = file.split('.').pop();
  return _.includes(authorizedExtensions, extension);
}


/**
 * @param {Array} files
 * @param {String} pattern
 *
 */
function getMatchingFiles(files, pattern) {
  var keys = Object.keys(files);

  return _.filter(keys, function(file) {
    // check if file is in the right path using regexp
    return matcher(file, pattern);
  });
}
