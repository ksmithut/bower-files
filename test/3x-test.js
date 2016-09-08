'use strict';

var path       = require('path');
var fs         = require('fs');
var expect     = require('chai').expect;
var FIXTURES = path.join(__dirname, '3x-fixtures');
var cd         = require('./helpers/cd')(FIXTURES);
var BowerFiles = require('../index');

describe('BowerFiles', function () {

  afterEach(function () {
    cd.reset();
  });

  // CONFIGURATION TESTING
  // =====================
  describe('configuration', function () {

    it('should set default configurations', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files._config).to.be.eql({
        cwd: path.resolve(FIXTURES, 'default'),
        json: 'bower.json',
        dir: path.resolve(FIXTURES, 'default', 'bower_components'),
        overrides: {},
        componentJson: '.bower.json',
        camelCase: true
      });
    });

    it('should fail if cwd isn\'t absolute', function () {
      cd('default');
      var files, error;
      try { files = new BowerFiles({ cwd: 'default' }); }
      catch(err) { error = err; }
      expect(files).to.be.equal(undefined);
      expect(error).to.be.instanceOf(Error);
    });

    it('should respect .bowerrc', function () {
      cd('bowerrc');
      var files = new BowerFiles();
      expect(files._config).to.be.eql({
        cwd: path.resolve(FIXTURES, 'bowerrc'),
        json: 'bower.json',
        dir: path.resolve(FIXTURES, 'bowerrc', 'components'),
        overrides: {},
        componentJson: '.bower.json',
        camelCase: true
      });
    });

    it('should respect given dir option', function () {
      /* jshint newcap: false */
      cd('default');
      var files = BowerFiles({dir: 'components'});
      expect(files._config).to.be.eql({
        cwd: path.resolve(FIXTURES, 'default'),
        json: 'bower.json',
        dir: path.resolve(FIXTURES, 'default', 'components'),
        overrides: {},
        componentJson: '.bower.json',
        camelCase: true
      });
    });

    it('should respect custom bower.json file', function () {
      cd('components');
      var files = new BowerFiles({json: 'component.json'});
      expect(files._component.dependencies).to.have.length(2);
    });

    it('should respect custom component configuration files', function () {
      cd('components');
      var files = new BowerFiles({
        json: 'component.json',
        componentJson: 'bower.json'
      });
      expect(files._component.dependencies[0].files()).to.be.eql([
        path.resolve(FIXTURES, 'components', 'bower_components',
          'bootstrap', 'dist', 'js', 'npm.js')
      ]);
    });

    it('should respect given overrides', function () {
      cd('default');
      var files = new BowerFiles({
        overrides: {jquery: {main: 'dist/jquery.min.js'}}
      });
      expect(files._component.dependencies[0].dependencies[0].files()).to.eql([
        path.resolve(FIXTURES, 'default',
          'bower_components', 'jquery', 'dist', 'jquery.min.js')
      ]);
    });

  });

  // COMPONENT TESTING
  describe('component', function () {

    it('should have a main component with full path to files', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files._component.files()).to.be.eql([
        path.resolve(FIXTURES, 'default', 'dist', 'helpers.js'),
        path.resolve(FIXTURES, 'default', 'dist', 'main.js'),
      ]);
    });

    it('should have a main component with dependencies', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files._component.dependencies).to.have.length(2);
      expect(files._component.devDependencies).to.have.length(1);
      expect(files._component.dependencies[0].name).to.be.equal('bootstrap');
      expect(files._component.dependencies[0].dir).to.be.equal(
        path.resolve(FIXTURES, 'default', 'bower_components')
      );
    });

    it('should handle symlinked components', function () {
      /* jshint maxstatements: false */
      cd('symlink');
      var symlinkDir = path.join(FIXTURES, 'symlink');
      var src        = path.join(symlinkDir, 'angular');
      var dest       = path.join(symlinkDir, 'bower_components', 'angular');
      var error;
      try {
        fs.symlinkSync(src, dest);
        var files = new BowerFiles();
        var ngRoute = files._component.dependencies[1];
        expect(ngRoute.dependencies[0]).to.be.ok;
        expect(ngRoute.dependencies[0].path).to.be.equal(dest);
      } catch (err) {
        error = err;
      } finally {
        fs.unlinkSync(dest);
      }
      if (error) { throw error; }
    });

  });

  // FILES TESTING
  describe('files', function () {
    /* jshint maxstatements: false */

    it('should not have duplicate files', function () {
      cd('duplicate');
      var files = new BowerFiles();
      expect(files.files).to.have.length(11);
    });

    it('should get self files', function () {
      cd('duplicate');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.self().files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js'),
        path.join(cwd, 'dist', 'helpers.js'),
        path.join(cwd, 'dist', 'main.js')
      ]);
      expect(files.self().self(false).files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js')
      ]);
    });

    it('should remove main files with main(false)', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.dev().main(false).files).to.be.eql([
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js'),
      ]);
    });

    it('should include main files with main(true)', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.dev().fileListProps('main').files).to.be.eql([
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js'),
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
    });

    it('should include files from files property', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.fileListProps(['files']).self(true).files).to.be.eql([
        path.join(dir, 'jquery/dist/jquery.js'),
        path.join(bs, 'dist/css/bootstrap.css'),
        path.join(bs, 'dist/js/bootstrap.js'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.woff'),
        path.join(cwd, 'dist.js')
      ])
    })

    it('should include files from main as a fallback', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.fileListProps(['files', 'main']).self(true).files).to.be.eql([
        path.join(dir, 'jquery/dist/jquery.js'),
        path.join(bs, 'dist/css/bootstrap.css'),
        path.join(bs, 'dist/js/bootstrap.js'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular/angular.js'),
        path.join(dir, 'angular-route/angular-route.js'),
        path.join(cwd, 'dist.js')
      ])
    })

    it('should include all files from main and files', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.fileListProps(['files', 'main'], false).self(true).files).to.be.eql([
        path.join(dir, 'jquery/dist/jquery.js'),
        path.join(bs, 'dist/css/bootstrap.css'),
        path.join(bs, 'dist/js/bootstrap.js'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.woff'),
        path.join(bs, 'less/bootstrap.less'),
        path.join(dir, 'angular/angular.js'),
        path.join(dir, 'angular-route/angular-route.js'),
        path.join(cwd, 'dist.js'),
        path.join(cwd, 'dist/helpers.js'),
        path.join(cwd, 'dist/main.js')
      ])
    })

    it('should ignore files from the ignore property', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      files = files
        .ignoreListProps('ignore')
        .fileListProps(['files', 'main'], false)
        .self(true)
        .files
      expect(files).to.be.eql([
        path.join(dir, 'jquery/dist/jquery.js'),
        path.join(bs, 'dist/css/bootstrap.css'),
        path.join(bs, 'dist/js/bootstrap.js'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist/fonts/glyphicons-halflings-regular.woff'),
        path.join(bs, 'less/bootstrap.less'),
        path.join(dir, 'angular/angular.js'),
        path.join(dir, 'angular-route/angular-route.js'),
        path.join(cwd, 'dist.js')
      ])
    })

    it('should get dev files', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.dev().files).to.be.eql([
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js'),
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
      expect(files.dev().dev(false).files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
    });

    it('should put devDependencies first', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.dev().files).to.be.eql([
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js'),
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
      expect(files.dev('after').files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js'),
        path.join(dir, 'angular-animate', 'angular-animate.js')
      ]);
    })

    it('should get files by extension', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.ext('js').files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
      expect(files.ext(true).files).to.be.eql({
        js: [
          path.join(dir, 'jquery', 'dist', 'jquery.js'),
          path.join(bs, 'dist', 'js', 'bootstrap.js'),
          path.join(dir, 'angular', 'angular.js'),
          path.join(dir, 'angular-route', 'angular-route.js')
        ],
        less: [path.join(bs, 'less', 'bootstrap.less')],
        css: [path.join(bs, 'dist', 'css', 'bootstrap.css')],
        eot: [
          path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot')
        ],
        svg: [
          path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg')
        ],
        ttf: [
          path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf')
        ],
        woff: [
          path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff')
        ],
      });
    });

    it('should get relative files', function () {
      cd('default');
      var files = new BowerFiles();
      var dir   = 'bower_components';
      var bs    = 'bootstrap';
      expect(files.relative().ext('js').files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(dir, bs, 'dist', 'js', 'bootstrap.js'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
      expect(
        files
          .relative(path.join(process.cwd(), '..'))
          .ext('js')
          .files
      ).to.be.eql([
        path.join('default', dir, 'jquery', 'dist', 'jquery.js'),
        path.join('default', dir, bs, 'dist', 'js', 'bootstrap.js'),
        path.join('default', dir, 'angular', 'angular.js'),
        path.join('default', dir, 'angular-route', 'angular-route.js')
      ]);
    });

    it('should join file extensions', function () {
      cd('default');
      var files   = new BowerFiles();
      var cwd     = process.cwd();
      var dir     = path.join(cwd, 'bower_components');
      var bs      = path.join(dir, 'bootstrap');
      var fontDef = {font: ['eot', 'svg', 'ttf', 'woff']};
      expect(files.ext(true).join(fontDef).files.font).to.be.eql([
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.eot'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.svg'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.ttf'),
        path.join(bs, 'dist', 'fonts', 'glyphicons-halflings-regular.woff')
      ]);
    });

    it('should get files by globbing', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.match('!**/glyphicons-halflings*').files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
    });

    it('should get files by globbing in cwd', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.match('*/bootstrap/**/*.js').files).to.be.eql([
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
      ]);
    });

    it('should support multiple match()', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(
        files
          .match('!**/glyphicons-halflings*')
          .match('!**/jquery/**')
          .files
      ).to.be.eql([
        path.join(bs, 'less', 'bootstrap.less'),
        path.join(bs, 'dist', 'css', 'bootstrap.css'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js')
      ]);
    });

    it('should allow caching filters', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      var self  = files.self();
      var js    = self.ext('js');
      var css   = self.ext('css');
      expect(js.files).to.be.eql([
        path.join(dir, 'jquery', 'dist', 'jquery.js'),
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
        path.join(dir, 'angular', 'angular.js'),
        path.join(dir, 'angular-route', 'angular-route.js'),
        path.join(cwd, 'dist', 'helpers.js'),
        path.join(cwd, 'dist', 'main.js')
      ]);
      expect(css.files).to.be.eql([
        path.join(bs, 'dist', 'css', 'bootstrap.css')
      ]);
    });


    it('should use all the options in a filter command', function () {
      cd('default');
      var files = new BowerFiles();
      var cwd   = process.cwd();
      var dir   = path.join(cwd, 'bower_components');
      var bs    = path.join(dir, 'bootstrap');
      expect(files.filter({
        ext: 'js',
        match: '**/bootstrap.*',
        self: true,
        dev: true
      })).to.be.eql([
        path.join(bs, 'dist', 'js', 'bootstrap.js'),
      ]);
    });

    it('should get no files when extension matches nothing', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files.ext('unknown-extension').files).to.be.eql([]);
    });

  });

  // dependency hash testing
  describe('dependencies', function () {

    it('should get dependency hash', function () {
      cd('default');
      var files = new BowerFiles();
      var dir = path.join(FIXTURES, 'default', 'bower_components');
      var strap = path.join(dir, 'bootstrap');
      var dist  = path.join(strap, 'dist');
      expect(files.deps).to.be.eql({
        jquery: [
          path.join(dir, 'jquery', 'dist', 'jquery.js')
        ],
        bootstrap: [
          path.join(strap, 'less', 'bootstrap.less'),
          path.join(dist, 'css', 'bootstrap.css'),
          path.join(dist, 'js', 'bootstrap.js'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.eot'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.svg'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.ttf'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.woff')
        ],
        angular: [
          path.join(dir, 'angular', 'angular.js')
        ],
        angularRoute: [
          path.join(dir, 'angular-route', 'angular-route.js')
        ]
      });
    });

    it('should get dependency hash with not camelCased deps', function () {
      cd('default');
      var files = new BowerFiles();
      var dir = path.join(FIXTURES, 'default', 'bower_components');
      var strap = path.join(dir, 'bootstrap');
      var dist  = path.join(strap, 'dist');
      expect(files.camelCase(false).deps).to.be.eql({
        jquery: [
          path.join(dir, 'jquery', 'dist', 'jquery.js')
        ],
        bootstrap: [
          path.join(strap, 'less', 'bootstrap.less'),
          path.join(dist, 'css', 'bootstrap.css'),
          path.join(dist, 'js', 'bootstrap.js'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.eot'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.svg'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.ttf'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.woff')
        ],
        angular: [
          path.join(dir, 'angular', 'angular.js')
        ],
        'angular-route': [
          path.join(dir, 'angular-route', 'angular-route.js')
        ]
      });
    });

    it('should get dependency hash with self', function () {
      cd('default');
      var files = new BowerFiles();
      var self  = path.join(FIXTURES, 'default');
      var dir   = path.join(self, 'bower_components');
      var strap = path.join(dir, 'bootstrap');
      var dist  = path.join(strap, 'dist');
      expect(files.self().deps).to.be.eql({
        self: [
          path.join(self, 'dist', 'helpers.js'),
          path.join(self, 'dist', 'main.js')
        ],
        jquery: [
          path.join(dir, 'jquery', 'dist', 'jquery.js')
        ],
        bootstrap: [
          path.join(strap, 'less', 'bootstrap.less'),
          path.join(dist, 'css', 'bootstrap.css'),
          path.join(dist, 'js', 'bootstrap.js'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.eot'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.svg'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.ttf'),
          path.join(dist, 'fonts', 'glyphicons-halflings-regular.woff')
        ],
        angular: [
          path.join(dir, 'angular', 'angular.js')
        ],
        angularRoute: [
          path.join(dir, 'angular-route', 'angular-route.js')
        ]
      });
    });

    it('should get dependency hash with dev', function () {
      cd('default');
      var files = new BowerFiles();
      var self  = path.join(FIXTURES, 'default');
      var dir   = path.join(self, 'bower_components');
      var strap = path.join(dir, 'bootstrap');
      var dist  = path.join(strap, 'dist');
      expect(files.dev().ext(true).deps).to.be.eql({
        jquery: {
          js: [path.join(dir, 'jquery', 'dist', 'jquery.js')]
        },
        bootstrap: {
          less : [path.join(strap, 'less', 'bootstrap.less')],
          css  : [path.join(dist, 'css', 'bootstrap.css')],
          js   : [path.join(dist, 'js', 'bootstrap.js')],
          eot  : [path.join(dist, 'fonts', 'glyphicons-halflings-regular.eot')],
          svg  : [path.join(dist, 'fonts', 'glyphicons-halflings-regular.svg')],
          ttf  : [path.join(dist, 'fonts', 'glyphicons-halflings-regular.ttf')],
          woff : [path.join(dist, 'fonts', 'glyphicons-halflings-regular.woff')]
        },
        angular: {
          js: [path.join(dir, 'angular', 'angular.js')]
        },
        angularRoute: {
          js: [path.join(dir, 'angular-route', 'angular-route.js')]
        },
        angularAnimate: {
          js: [path.join(dir, 'angular-animate', 'angular-animate.js')]
        }
      });
    });

    it('should get list of dependencies in order', function () {
      cd('default');
      var files = new BowerFiles();
      var self  = path.join(FIXTURES, 'default');
      var dir   = path.join(self, 'bower_components');
      var strap = path.join(dir, 'bootstrap');
      var dist  = path.join(strap, 'dist');
      expect(files.dev().depsArray).to.be.eql([
        {
          name: 'angular',
          files: [path.join(dir, 'angular', 'angular.js')]
        },
        {
          name: 'angularAnimate',
          files: [path.join(dir, 'angular-animate', 'angular-animate.js')]
        },
        {
          name: 'jquery',
          files: [path.join(dir, 'jquery', 'dist', 'jquery.js')]
        },
        {
          name: 'bootstrap',
          files: [
            path.join(strap, 'less', 'bootstrap.less'),
            path.join(dist, 'css', 'bootstrap.css'),
            path.join(dist, 'js', 'bootstrap.js'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.eot'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.svg'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.ttf'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.woff')
          ]
        },
        {
          name: 'angularRoute',
          files: [path.join(dir, 'angular-route', 'angular-route.js')]
        }
      ]);
    });

    it('should not care about devDependencies', function () {
      cd('production');
      var files = new BowerFiles();
      var self  = path.join(FIXTURES, 'production');
      var dir   = path.join(self, 'bower_components');
      var strap = path.join(dir, 'bootstrap');
      var dist  = path.join(strap, 'dist');
      expect(files.dev().depsArray).to.be.eql([
        {
          files: [],
          name: 'angularAnimate'
        },
        {
          name: 'jquery',
          files: [path.join(dir, 'jquery', 'dist', 'jquery.js')]
        },
        {
          name: 'bootstrap',
          files: [
            path.join(strap, 'less', 'bootstrap.less'),
            path.join(dist, 'css', 'bootstrap.css'),
            path.join(dist, 'js', 'bootstrap.js'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.eot'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.svg'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.ttf'),
            path.join(dist, 'fonts', 'glyphicons-halflings-regular.woff')
          ]
        },
        {
          name: 'angular',
          files: [path.join(dir, 'angular', 'angular.js')]
        },
        {
          name: 'angularRoute',
          files: [path.join(dir, 'angular-route', 'angular-route.js')]
        }
      ]);
    });

    it('should ignore empty main definition', function () {
      cd('empty-main');
      var files = new BowerFiles();
      expect(files.main(true).files).to.be.eql([]);
    });

  });

});
