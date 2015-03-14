/* global describe, it */

var expect = require('chai').expect
var reactFreeStyle = require('./')

describe('react free style', function () {
  it('should pass this test', function () {
    expect(reactFreeStyle).have.keys(['fresh'])
    expect(reactFreeStyle.fresh).to.be.a('function')
  })
})
