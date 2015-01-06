'use strict';

var expect = require('expect.js');
var dedupe = require('../lib/utils/dedupe');

describe('dedupe', function () {

  it('should remove duplicates from an array', function () {
    expect(dedupe([1, 2, 3, 4, 4])).to.be.eql([1, 2, 3, 4]);
    expect(dedupe([5, 5, 5, 5])).to.be.eql([5]);
    expect(dedupe([null, undefined, null])).to.be.eql([null, undefined]);
  });

  it('should handle nothing or non-array being passed', function () {
    expect(dedupe()).to.be.eql([]);
  });

});
