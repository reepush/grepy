# grepy

Wrapper around command line grep with JSON output

## Install
```shell
npm install --save grepy
```

## Usage

### Callback

```js
grepy(pattern, path, args, function(match) {
  ...
})
```

### Stream

`grepy` emits one parsed line at a time, so it is possible to process data "on the fly" without buffering. Thanks to streams here.


```js
grepy.stream(pattern, path, args)
```

## Output format
```js
[
  { filename: <filename>, lineNumber: <line number>,
    chunks: [
      { str: <substring>, matched <true | false> },
      { str: <substring>, matched <true | false> },
      ...
    ]
  },
  { filename: <filename>, lineNumber: <line number>,
    chunks: [
      { str: <substring>, matched <true | false> },
      { str: <substring>, matched <true | false> },
      ...
    ]
  },
  ...
]
```

## Examples

For more examples take a look at `test/test.js`

```js
var grepy = require('grepy')
var args = grepy.defaultArgs.concat('--context=3')
var log = console.log.bind(console)

grepy('twinkle', 'test/test.txt', args, function(match) {
  match.forEach(function(line) {
    log('filename:', line.filename)
    log('line number:', line.lineNumber)

    line.chunks.forEach(function(chunk) {
      var isMatched = chunk.matched ? 'matched' : 'not matched'
      log('this part of line is ' + isMatched + ':')
      log(chunk.str)
    })
    log()
  })
})
```

```js
// npm install grepy request concat-stream
var grepy = require('grepy')
var request = require('request')
var args = grepy.defaultArgs.concat(['--perl-regexp', '--only-matching'])
var log = console.log.bind(console)
var concat = require('concat-stream')

var pattern = "<dd class='value m_temp c'>\\K[^<]+"
var match = grepy.stream(pattern, '-', args)

log('Go for a walk?')
log('Oh, it is cold outside...')
request('http://gismeteo.com').pipe(match).pipe(concat(function(data) {
  log(data[0].chunks[0].str + '°C')
}))
```
