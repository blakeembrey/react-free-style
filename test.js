/* global describe, it */

var expect = require('chai').expect
var reactFreeStyle = require('./')

describe('react free style', function () {
  it('should pass this test', function () {
    expect(reactFreeStyle).have.keys(['create'])
    expect(reactFreeStyle.create).to.be.a('function')
  })
})
