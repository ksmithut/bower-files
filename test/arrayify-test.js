'use strict';

var expect   = require('expect.js');
var arrayify = require('../lib/utils/arrayify');

describe('arrayify', function () {

  it('should turn a non array into an array', function () {
    expect(arrayify(2)).to.be.eql([2]);
    expect(arrayify({})).to.be.eql([{}]);
    expect(arrayify('five')).to.be.eql(['five']);
  });

  it('should keep an array the way it is', function () {
    expect(arrayify([2])).to.be.eql([2]);
    expect(arrayify([{}])).to.be.eql([{}]);
    expect(arrayify(['five'])).to.be.eql(['five']);
  });

  it('should return an empty array if a nullish object is passed', function () {
    expect(arrayify()).to.be.eql([]);
    expect(arrayify(null)).to.be.eql([]);
    expect(arrayify(undefined)).to.be.eql([]);
  });

});
