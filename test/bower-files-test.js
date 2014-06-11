'use strict';

var fs     = require('fs');
var should = require('should');
var path   = require('path');
var cwd    = process.cwd();

// Tests
// -----
describe('bower-files tests', function () {

  // After each, reset the `process.cwd()`
  afterEach(function () {
    cd('../');
    deleteCache('bower-files.js');
    deleteCache('defaults.js');
    deleteCache('exists.js');
    deleteCache('resolve-path.js');
  });

  describe('Level 1', function () {
    it('should use the override', override);
    it('should handle glob files', globs);
    it('should get list of files without being split by extension', justArray);
    it('should get only the files with a certain extension', justOneExt);
    it('should get devDependencies when option is given', devDependencies);
    it('should not get devDependencies when option is not given', noDevDependencies);
  });

  describe('Level 2', function () {
    it('handles symbolic links', symbolicLinks);
    it('handles no bower.json', noBower);
    it('handles missing dependencies', missingDependencies);
    it('handles no main property', noMain);
  });

});

// Helper functions
// ----------------
function cd(dir) {
  process.chdir(path.join(__dirname, dir));
}
function getModule(options) {
  return require('../lib/bower-files.js')(options);
}
function deleteCache(filepath) {
  delete require.cache[require.resolve('../lib/' + filepath)];
}

// override
// --------
function override() {
  cd('override');
  var files        = getModule()
    , pathToJquery = './override/bower_components/jquery/dist/jquery.min.js'
    ;

  should(files).be.ok;
  should(files).be.an.Object;
  should(files).have.property('js');
  should(files.js).be.an.Array;
  pathToJquery = require.resolve(pathToJquery);
  should(files.js).containEql(pathToJquery);
}

// globs
// -----
function globs() {
  cd('globs');
  var files = getModule();

  should(files).be.ok;
  should(files).be.an.Object;
  ['eot', 'svg', 'ttf', 'woff'].map(function (fontExt) {
    should(files).have.property(fontExt);
    should(files[fontExt]).be.an.Array;
    should(files[fontExt][0]).eql(path.resolve('./bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.' + fontExt));
  });
}

// justArray
// ---------
function justArray() {
  cd('just-array');
  var files = getModule({
    json: path.join(__dirname, 'just-array/bower.json'),
    ext: false
  });

  should(files).be.ok;
  should(files).be.an.Array;
  should(files).have.lengthOf(3);
}

// justOneExt
// ----------
function justOneExt() {
  cd('just-one-ext');
  var files = getModule({
    ext: 'css'
  });

  should(files).be.ok;
  should(files).be.an.Array;
  should(files).have.lengthOf(1);
  should(files[0]).be.equal(path.join(
    __dirname,
    '/just-one-ext/bower_components/bootstrap/dist/css/bootstrap.css'
  ));
}

// devDependencies
// ---------------
function devDependencies() {
  cd('dev-dependencies');
  var files = getModule({
    dev: true,
    ext: 'js'
  });

  should(files).be.ok;
  should(files).be.an.Array;
  should(files).have.lengthOf(4);
}

// noDevDependencies
// ---------------
function noDevDependencies() {
  cd('dev-dependencies');
  var files = getModule({
    ext: 'js'
  });

  should(files).be.ok;
  should(files).be.an.Array;
  should(files).have.lengthOf(3);
}

// noBower
// -------
function noBower() {
  cd('no-bower');
  var files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: Error reading project ');
}

// symbolicLinks
// -------------
function symbolicLinks() {
  var source     = path.join(__dirname, 'symlinks/angular');
  var dest       = path.join(__dirname, 'symlinks/bower_components/angular');
  var expectedJS = path.join(__dirname, 'symlinks/bower_components/angular/angular.js');

  try {
    fs.symlinkSync(source, dest);
    cd('symlinks');
    var files = getModule({ext: 'js'});

    should(files).be.ok;
    should(files).be.an.Array;
    should(files).have.lengthOf(1);
    should(files[0]).be.equal(expectedJS);
  } catch(err) {
    throw err;
  } finally {
    fs.unlinkSync(dest);
  }
};

// missingDependencies
// -------------------
function missingDependencies() {
  cd('missing-dependencies');
  var files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: Missing dependency "jquery"');

  deleteCache('bower-files.js');
  cd('missing-child-dependencies');
  files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: Missing dependency "sizzle"');
}

// noMain
// ------
function noMain() {
  cd('no-main');
  var files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: No main property: "jquery".');
}
