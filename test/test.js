var expect      = require('chai').expect,
    stream      = require('stream'),
    grepy       = require('../'),
    expect      = require('chai').expect,
    concat      = require('concat-stream'),
    json2text   = require('./helpers').json2text,
    getExpected = require('./helpers').getExpected


describe('grep(pattern, path, args, cb)', function() {

  it('outputs lines with matches', function(done) {
    grepy('twinkle', 'test/test.txt', [], function(match) {
      var text = json2text(match)
      var expected = getExpected('outputs_lines_with_matches')
      expect(text).to.equal(expected)
      done()
    })
  })

  it('outputs right matches and line numbers', function(done) {
    grepy('twinkle', 'test/test.txt', [], function(match) {
      var expected = getExpected('outputs_right_matches_and_line_numbers', 'parse')
      expect(match).to.deep.equal(expected)
      done()
    })
  })

  it('handles ignore-case', function(done) {
    var args = grepy.defaultArgs.concat('--ignore-case')
    grepy('TWINKLE', 'test/test.txt', args, function(match) {
      var expected = getExpected('handles_ignore_case', 'parse')
      expect(match).to.deep.equal(expected)
      done()
    })
  })

  it('handles whole line match', function(done) {
    grepy('^.*$', 'test/test.txt', [], function(match) {
      var expected = getExpected('handles_whole_line_match', 'parse')
      expect(match).to.deep.equal(expected)
      done()
    })
  })

  it('handles matches at begin and end', function(done) {
    var args = grepy.defaultArgs.concat('--extended-regexp')
    grepy('(F|f)ar', 'test/test.txt', args, function(match) {
      var expected = getExpected('handles_matches_at_begin_and_end', 'parse')
      expect(match).to.deep.equal(expected)
      done()
    })
  })

})


// describe('grep(pattern, path, args, cb)', function() {
//   it('outputs lines with matches', function(done) {
//     grepy('twinkle', 'test/test.txt', [], function(match) {
//       var text = json2text(match)
//       var expected = getExpected('outputs_lines_with_matches')
//       expect(text).to.equal(expected)
//       done()
//     })
//   })

// })
