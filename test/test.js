var expect      = require('chai').expect,
    stream      = require('stream'),
    grepy       = require('../'),
    expect      = require('chai').expect,
    concat      = require('concat-stream'),
    fs          = require('fs'),
    json2text   = require('./helpers').json2text,
    getExpected = require('./helpers').getExpected


describe('grepy(pattern, path, args, cb)', function() {

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

  it('skips context delimiter', function(done) {
    var args = grepy.defaultArgs.concat('--context=1')
    grepy('twinkle', 'test/test.txt', args, function(match) {
      var expected = getExpected('skips_context_delimiter', 'parse')
      expect(match).to.deep.equal(expected)
      done()
    })
  })

})


describe('grepy.stream(pattern, path, args)', function() {

  it('seems to be duplex stream', function() {
    var stream = grepy.stream('twinkle', 'test/test.txt', [])
    if (!stream.writable || !stream.readable)
      throw new Error('Stream is not duplex one!')
  })

  it('could be piped and pipes out', function(done) {
    var readable = fs.createReadStream('test/test.txt')
    var grep = grepy.stream('twinkle', '-', [])

    readable.pipe(grep).pipe(concat(function(data) {
      if (data) done()
        else done(new Error('No data were piped out!'))
    }))
  })

  it('could be readable with path', function(done) {
    var grep = grepy.stream('twinkle', 'test/test.txt', [])

    grep.pipe(concat(function(data) {
      if (data) done()
        else done(new Error('No data were piped out!'))
    }))
  })

})
