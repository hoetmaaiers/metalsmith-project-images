'use strict';

var debug = require('debug')('metalsmith-paths'),
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
 *   @property {String} imagesDirectory - directory in which we will go looking for images
 *   @property {String} authorizedExts - images authorized image extensions
 * @return {Function}
 */
function plugin(options) {

  return function innerFunction(files, metalsmith, done) {
    setImmediate(done);

    // one options object
    if (_.isObject(options)) {
        addImagesToFiles(files, metalsmith, done, options);
    }

    // multiple options objects
    if (_.isArray(options)) {
        _.each(options, (optionsItem) => {
          addImagesToFiles(files, metalsmith, done, optionsItem);
        })
    }
}

function addImagesToFiles(files, metalsmith, done, options) {
  // set options
  options = normalizeOptions(options)

  // get matching files
  var matchingFiles = getMatchingFiles(files, options.pattern);

  _.each(matchingFiles, function(file) {
    if (_.isUndefined(files[file])) return true;


    var imagesPath = path.join(metalsmith.source(), path.dirname(file), options.imagesDirectory);
    var dirFiles = fs.readdirSync(imagesPath);
    files[file].images = files[file].images || [];

    // add files as images metadata
    _.each(dirFiles, function(dirFile) {
      // check extension and remove thumbnails
      if (isAuthorizedFile(dirFile, options.authorizedExts)) {
        var imagePath = path.join(files[file].path.dir, options.imagesDirectory, dirFile);
        files[file].images.push(imagePath);
      }
    });

    files[file].images = _.uniq(files[file].images);
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
    files[file].path = path.parse(file);

    // check if file is in the right path using regexp
    return matcher(file, pattern);
  });
}
