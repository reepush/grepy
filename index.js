var spawn      = require('child_process').spawn,
    duplexer   = require('duplexer2'),
    through    = require('through2'),
    extend     = require('util-extend'),
    split      = require('split'),
    stripAnsi  = require('strip-ansi'),
    concat     = require('concat-stream')

var GREP_COLORS = 'ms=01;33:mc=01;33:sl=:cx=:fn=35:ln=01;32:bn=32:se=36'

var REGEXP = {}
REGEXP_CLOSE = '\\u001b\\[m\\u001b\\[K'
REGEXP['FILENAME'] = '\\u001b\\[35m\\u001b\\[K'  + '(.*?)' + REGEXP_CLOSE
REGEXP['DELIMITER'] = '\\u001b\\[36m\\u001b\\[K' + '(.*?)' + REGEXP_CLOSE
REGEXP['LINE_NUMBER'] = '\\u001b\\[01;32m\\u001b\\[K'   + '(.*?)' + REGEXP_CLOSE
REGEXP['MATCH'] = '\\u001b\\[01;33m\\u001b\\[K'  + '(.*?)' + REGEXP_CLOSE

function parse(line, enc, cb) {
  line = line.toString()
  if (!line) return cb()

  var filename = capture('FILENAME')
  var lineNumber = capture('LINE_NUMBER')
  capture('DELIMITER')

  var exec, matches = []
  var re = new RegExp(REGEXP['MATCH'], 'g')
  while ((exec = re.exec(line)) !== null) {
    matches.push({ start: exec.index, length: exec[0].length })
  }

  var chunks = []
  var i = 0
  matches.forEach(function(match) {
    if (i < match.start)
      chunks.push({ str: line.slice(i, match.start), matched: false })
    chunks.push({ str: stripAnsi(line.substr(match.start, match.length)), matched: true })
    i = match.start + match.length
  })
  if (i < (line.length-1))
    chunks.push({ str: line.slice(i), matched: false })

  cb(null, {
    filename: filename,
    lineNumber: lineNumber,
    chunks: chunks
  })

  function capture(name) {
    var re = new RegExp(REGEXP[name], 'g')
    var result = re.exec(line)[1]
    line = line.replace(re, '')
    return result
  }
}

function grepy(pattern, path, args, cb) {
  grepy.stream(pattern, path, args)
    .pipe(concat(function(res) {
      var json = '[' + JSON.stringify(res) + ']'
      cb(JSON.parse(json))
    }))
}

grepy.defaultArgs = ['--color=always', '--line-number', '--with-filename', '--label=stdin'],

grepy.stream = function(pattern, path, args) {
  var defaultPath = '-'

  args = args.length ? args : grepy.defaultArgs
  path = path || defaultPath

  var grep = spawn('grep', args.concat(pattern, path),
                   { env: extend(process.env, { 'GREP_COLORS' : GREP_COLORS }) })
  var parseStream = through.obj(parse)

  grep.stdout.pipe(split()).pipe(parseStream)
  return duplexer(grep.stdin, parseStream)
}

module.exports = grepy

