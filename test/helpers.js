var fs = require('fs')

var json2text = function(lines) {
  var output = ''
  lines.forEach(function(line) {
    line.chunks.forEach(function(chunk) {
      output += chunk.str
    })
    output += '\n'
  })

  return output
}

var getExpected = function(name) {
  var content = fs.readFileSync('test/expected-' + name + '.json', 'utf8')

  return JSON.parse(content)
}

module.exports = {
  json2text: json2text,
  getExpected: getExpected
}
