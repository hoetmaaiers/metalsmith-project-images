var _ = require('lodash'),
    path = require('path'),
    fs = require("fs"),
    assert = require('chai').assert,
    expect = require('chai').expect,
    Metalsmith = require('metalsmith'),
    images = require('../src/index.js'),
    normalizeOptions = images.normalizeOptions,
    getMatchingFiles = images.getMatchingFiles,
    isAuthorizedFile = images.isAuthorizedFile;

function getFilesWithImages(files) {
  return _.chain(files)
    .map(function(file, index, files) {
      var obj = {}
      obj[index] = file.images;
      return obj
    })
    .filter(function(file, index, files) {
      var key = Object.keys(file)[0]
      return !_.isUndefined(file[key]);
    })
    .value()
}

describe('Metalsmith-images', function() {

  describe('pure functions', function() {

    describe('#getMatchingFiles()', function() {
      it('should return matching files', function() {

        var files = {
          'projects/one.md': {},
          'projects/two.md': {},
          'projects/try.md': {},
          'projects/false.pdf': {},
        };

        var matchingFiles = getMatchingFiles(files, '**/*.md');
        assert.sameMembers(matchingFiles, [
          'projects/one.md',
          'projects/two.md',
          'projects/try.md'
        ]);
      })
    });

    describe('#normalizeOptions()', function() {
      it('should return an object', function() {
          var result = normalizeOptions({});
          expect(result).to.be.a('object');
      });

      it('should return default options when nothing is provided', function() {
          var result = normalizeOptions({});
          expect(result).to.eql({
            authorizedExts: ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
            pattern: '**/*.md',
            imagesDirectory: 'images',
          });
      });

      it('should extend default options with provided pattern', function() {
        var options = { pattern: 'test/*.md' };
        var updatedOptions = normalizeOptions(options);
        expect(updatedOptions).to.eql({
          authorizedExts: ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
          pattern: 'test/*.md',
          imagesDirectory: 'images'
        });
      })

      it('should extend default options with provided authorizedExts', function() {
        var options = { authorizedExts: ['tiff'] };
        var updatedOptions = normalizeOptions(options);
        expect(updatedOptions).to.eql({
          authorizedExts: ['tiff'],
          pattern: '**/*.md',
          imagesDirectory: 'images'
        })
      })

      it('should extend default options with provided imagesDirectory', function() {
        var options = { imagesDirectory: 'imgs' };
        var updatedOptions = normalizeOptions(options);
        expect(updatedOptions).to.eql({
          authorizedExts: ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
          pattern: '**/*.md',
          imagesDirectory: 'imgs'
        })
      })
    });

    describe('#isAuthorizedFile()', function() {

      it ('should return a boolean', function() {
        var result = isAuthorizedFile('filename.jpg', ['jpg', 'png', 'gif']);
        expect(result).to.be.a('boolean');
      });


      it ('should return true if file matches list of extensions', function() {
        var result = isAuthorizedFile('filename.jpg', ['jpg', 'png', 'gif']);
        expect(result).to.equal(true);
      });


      it ('should return false if file does not matches list of extensions', function() {
        var result = isAuthorizedFile('filename.jpeg', ['jpg', 'png', 'gif']);
        // assert.equal(result, false);
        expect(result).to.equal(false);
      });

    });

  });

  describe('#plugin', function() {

    it('should add images to metadata of matching files', function(done){
      var metalsmith = Metalsmith('test/fixtures/pattern');
      metalsmith
        .use(images({ pattern: '**/*.md' }))
        .build(function(err, files){
          if (err) return done(err);
          // console.log('FILES', files);
          var filesWithImages = getFilesWithImages(files);

          expect(filesWithImages).to.deep.include.members([
            { 'one/one.md': [ 'one/images/Toadle.gif', 'one/images/Toadle.png' ] },
            { 'three/three.md': [ 'three/images/listen.png', 'three/images/now.png' ] },
            { 'two/two.md': [ 'two/images/Toad.png' ] }
          ])

          done();
        });
    });

    it('should add images mathing the authorizedExts', function(done){
      var metalsmith = Metalsmith('test/fixtures/pattern');
      metalsmith
        .use(images({ pattern: '**/*.md', authorizedExts: ['gif'] }))
        .build(function(err, files){
          if (err) return done(err);
          var filesWithImages = getFilesWithImages(files)

          expect(filesWithImages).to.deep.include.members([
            { 'one/one.md': [ 'one/images/Toadle.gif' ] },
          ])

          done();
        });
    });


    it('should accept multiple options (as an array)', function(done){
      var metalsmith = Metalsmith('test/fixtures/pattern');
      metalsmith
        .use(images([ { pattern: 'src/projects/*.md', authorizedExts: ['gif'] }, { pattern: '**/*.md', } ]))
        .build(function(err, files){
          if (err) return done(err);

          var filesWithImages = getFilesWithImages(files)
          console.log(filesWithImages);
          expect(filesWithImages).to.deep.include.members([
            { 'one/one.md': [ 'one/images/Toadle.gif', 'one/images/Toadle.png' ] },
            { 'projects/hello/world.md': [ 'projects/hello/images/Toadle.gif', 'projects/hello/images/Toadle.png' ] }
          ])

          done();
        });
    });


  });
});
