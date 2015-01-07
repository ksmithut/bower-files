'use strict';

var fs     = require('fs');
var path   = require('path');
var expect = require('expect.js');
var cwd    = process.cwd();

// Tests
// -----
describe('bower-files tests', function () {

  // After each, reset the `process.cwd()`
  afterEach(function () {
    cd('../../');
    deleteCache('index.js');
  });

  describe('Level 1', function () {

    it('should use the override', function () {
      cd('override');
      var files        = getModule();
      var pathToJquery = './2x-fixtures/override/bower_components/jquery/dist/jquery.min.js';
      expect(files).to.be.an(Object);
      expect(files.js).to.be.an(Array);
      pathToJquery = require.resolve(pathToJquery);
      expect(files.js).to.contain(pathToJquery);
    });

    it('should use the override for dependencies', function () {
      cd('override-dependencies');
      var files = getModule();
      expect(files).to.be.an(Object);
      expect(files.js).to.be(undefined);
    });

    it('should use the main file when self option is set', function () {
      cd('self-main');
      var files = getModule({self: true});
      expect(files).to.be.an(Object);
      expect(files.js).to.be.an(Array);
      expect(files.js[0]).to.contain('jquery');
      expect(files.js[1]).to.contain('bootstrap');
      expect(files.js[2]).to.be(path.join(__dirname, '2x-fixtures/self-main/lib/fastclick.js'));
    });

    it('should join extensions into a single property', function () {
      cd('join');
      var files = getModule({join: {fonts: ['eot', 'svg', 'ttf', 'woff', 'otf']}});
      expect(files).to.be.an(Object);
      expect(files.fonts).to.be.an(Array);
      expect(files.fonts.length).to.be(4);
    });

    it('should handle glob files', function () {
      cd('globs');
      var files = getModule();
      expect(files).to.be.an(Object);
      ['eot', 'svg', 'ttf', 'woff'].map(function (fontExt) {
        expect(files[fontExt]).to.be.an(Array);
        expect(files[fontExt][0]).to.eql(path.resolve('./bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.' + fontExt));
      });
    });

    it('should get list of files without being split by extension', function () {
      cd('just-array');
      var files = getModule({
        json: path.join(__dirname, '2x-fixtures/just-array/bower.json'),
        ext: false
      });
      expect(files).to.be.an(Array);
      expect(files.length).to.be(3);
    });

    it('should get only the files with a certain extension', function () {
      cd('just-one-ext');
      var files = getModule({ext: 'css'});
      expect(files).to.be.an(Array);
      expect(files.length).to.be(1);
      expect(files[0]).be.equal(path.join(
        __dirname,
        '2x-fixtures/just-one-ext/bower_components/bootstrap/dist/css/bootstrap.css'
      ));
    });

    it('should get devDependencies when option is given', function () {
      cd('dev-dependencies');
      var files = getModule({
        dev: true,
        ext: 'js'
      });
      expect(files).to.be.an(Array);
      expect(files.length).to.be(4);
    });

    it('should not get devDependencies when option is not given', function () {
      cd('dev-dependencies');
      var files = getModule({ext: 'js'});
      expect(files).to.be.an(Array);
      expect(files.length).to.be(3);
    });

    it('should follow symbolic links', function () {
      var source     = path.join(__dirname, '2x-fixtures/symlinks/angular');
      var dest       = path.join(__dirname, '2x-fixtures/symlinks/bower_components/angular');
      var expectedJS = path.join(__dirname, '2x-fixtures/symlinks/bower_components/angular/angular.js');
      try {
        fs.symlinkSync(source, dest);
        cd('symlinks');
        var files = getModule({ext: 'js'});
        expect(files).to.be.an(Array);
        expect(files.length).to.be(1);
        expect(files[0]).to.be(expectedJS);
      } catch(err) {
        throw err;
      } finally {
        fs.unlinkSync(dest);
      }
    });
  });


  describe('Level 2', function () {

    it('fails with no bower.json', function () {
      cd('no-bower');
      var error;
      try { var files = getModule(); }
      catch (e) { error = e; }
      expect(error).to.be.an(Error);
    });

    it('handles missing dependencies', function () {
      cd('missing-dependencies');
      var error;
      try { var files = getModule(); }
      catch (e) { error = e; }
      expect(error).to.be.an(Error);
      error = null;

      deleteCache('index.js');
      cd('missing-child-dependencies');
      try { var files = getModule(); }
      catch (e) { error = e; }
      expect(error).to.be.an(Error);
      error = null;
    });

    it('handles no main property', function () {
      cd('no-main');
      var error;
      try { var files = getModule(); }
      catch (e) { error = e; }
      expect(error).to.be.an(Error);
    });
  });

});

// Helper functions
// ----------------
function cd(dir) {
  process.chdir(path.join(__dirname, '2x-fixtures', dir));
}
function getModule(options) {
  return require('../')(options);
}
function deleteCache(filepath) {
  delete require.cache[require.resolve('../lib/' + filepath)];
}
