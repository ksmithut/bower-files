'use strict';

var should = require('should')
  , path   = require('path')
  , cwd    = process.cwd()
  , cd, getModule, deleteCache
  , override
  , justArray
  , justOneExt
  , throwError
  , noBower
  , missingDependencies
  , noMain
  ;

// Helper functions
// ----------------
cd = function (dir) {
  process.chdir(path.join(__dirname, dir));
};
getModule = function (options) {
  return require('../lib/bower-files.js')(options);
};
deleteCache = function (filepath) {
  delete require.cache[require.resolve('../lib/' + filepath)];
};

// override
// --------
override = function () {
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
};

// justArray
// ---------
justArray = function () {
  cd('just-array');
  var files = getModule({
    json: path.join(__dirname, 'just-array/bower.json'),
    ext: false
  });

  should(files).be.ok;
  should(files).be.an.Array;
  should(files).have.lengthOf(3);
};

// justOneExt
// ----------
justOneExt = function () {
  cd('just-one-ext');
  var files = getModule({
    ext: 'css'
  });

  should(files).be.ok;
  should(files).be.an.Array;
  should(files).have.lengthOf(1);
  should(files[0]).be.equal(
    __dirname +
    '/just-one-ext/bower_components/bootstrap/dist/css/bootstrap.css'
  );
};

// throwError
// ----------
throwError = function () {
  cd('no-bower');
  var files, err;
  try {
    files = getModule();
  } catch (exception) {
    err = exception;
  }
  should(err).be.ok;
  should(err).be.an.Error;
  err = err.toString();
  should(err).startWith('Error: Error reading project bower.json: ');
};

// noBower
// -------
noBower = function () {
  cd('no-bower');
  var files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: Error reading project bower.json: ');
};

// missingDependencies
// -------------------
missingDependencies = function () {
  cd('missing-dependencies');
  var files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: Missing dependency "jquery".');

  deleteCache('bower-files.js');
  cd('missing-child-dependencies');
  files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: Missing dependency "sizzle".');
};

// noMain
// ------
noMain = function () {
  cd('no-main');
  var files = getModule({throw: false});

  should(files).be.ok;
  should(files).be.an.Error;
  files = files.toString();
  should(files).startWith('Error: No main property: "jquery".');
};

// Tests
// -----
describe('bower-files tests', function () {

  // After each, reset the `process.cwd()`
  afterEach(function () {
    cd('../');
    deleteCache('bower-files.js');
  });

  describe('Level 1', function () {
    it('should use the override', override);
    it('should get list of files without being split by extension', justArray);
    it('should get only the files with a certain extension', justOneExt);
  });

  describe('Level 2', function () {
    it('should throw an error', throwError);
    it('handles no bower.json', noBower);
    it('handles missing dependencies', missingDependencies);
    it('handles no main property', noMain);
  });

});
