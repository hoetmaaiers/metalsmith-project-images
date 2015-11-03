'use strict';

var debug = require('debug')('metalsmith-paths'),
    path = require('path'),
    fs = require("fs"),
    matcher = require('minimatch')
    _ = require('lodash');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

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


    /*
     * Defaults
     */
    var AUTHORIZED_EXTS = ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
      PATTERN = '',
      IMAGES_DIRECTORY = 'images';

    options = options || {};
    var authorizedExts = options.authorizedExts || AUTHORIZED_EXTS;
    var imagesDirectory = options.imagesDirectory || IMAGES_DIRECTORY;
    var pattern = options.pattern || PATTERN;

    var matchingFiles = getMatchingFiles(files, pattern);
    matchingFiles.forEach(function(file) {

      var imagesPath = path.join(metalsmith.source(), path.dirname(file), imagesDirectory);

      files[file].images = [];

      fs.readdir(imagesPath, function(err, dirFiles) {
        if (err) return err

        for (var i = 0; i < dirFiles.length; i++) {
          var dirfile = dirFiles[i];

          // get extension
          var ext = dirfile.split('.').pop();

          // check extension and remove thumbnails
          if (authorizedExts.indexOf(ext) != -1) {
            if (typeof files[file] != 'undefined') {
              var imagePath = path.join(files[file].path.dir, imagesDirectory, dirfile);
              files[file].images.push(imagePath);
            }
          }
        }
      });
    });
  };

  function getMatchingFiles(files, pattern) {

    return Object.keys(files).filter(function(file) {
      // parse file path correctly
      if (path.parse) {
        files[file].path = path.parse(file)
      } else {

        // add file path info
        var extension = path.extension(file)

        // parse manually
        files[file].path = {
          base: path.basename(file),
          dir: path.dirname(file),
          ext: extension,
          name: path.basename(file, extension)
        }
      }

      // check if file is in the right path using regexp
      return matcher(file, pattern);
    });
  }
}
