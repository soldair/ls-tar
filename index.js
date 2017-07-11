
var spawn = require('child_process').spawn
var eos = require('end-of-stream')
var split2 = require('split2')
var t2 = require('through2')
var once = require('once')
var os = require('os')

const DEFAULT_LIMIT = process.env.TAR_EXTRACT_LIMIT || Math.ceil(os.cpus().length/2)
// each execution uses 2 cores fully

var queue = []
var active = 0


module.exports = function (tar, cb) {
  lsStream(tar,function(err,stream){
    if(err) return cb(err)
    var entries = []
    stream.on('data',function(entry){
      entries.push(entry)
    })
    eos(stream,function(err){
      cb(err,err?false:entries)
    })
  })
}

module.exports.stream = lsStream

function lsStream(tar,cb){
  cb = once(cb)

  if (active >= module.exports.limit) {
    queue.push([tar, cb])
    return
  }

  active++
  setImmediate(function () {
    start(tar, cb)
  })

  function start (tar,cb) {
    var stream = lsParsed(tar, function () {
      // this is an end side channel. the api consumer just uses the stream error / end events
      if (queue.length) {
        var next = queue.shift()
        start(next[0], next[1])
      } else {
        active--
      }
    })

    cb(false, stream)
  }
}

module.exports.queue = queue
module.exports.limit = DEFAULT_LIMIT

function lsParsed (tar, onEnd) {
  var split, obj

  var stream = ls(tar, function (err) {
    if (err) obj.emit('error', err)
    else split.end()
    onEnd()
  })

  split = split2()
  obj = t2.obj(function (b, enc, cb) {
    var parts = (b + '').split(/(\s+)/g)

    // an invalid line of some sort.
    if (b.length < 10) return cb()

    cb(false, {name: parts.slice(10).join(''), size: parts[4]})
  })

  stream.pipe(split, {end: false}).pipe(obj)

  return obj
}

function ls (path, cb) {
  var proc = spawn('tar', ['-tvf', path])
  var c = 3
  var errData = []

  var errErr
  eos(proc.stderr, function (err) {
    errErr = err
    if (!--c) done()
  })

  var outErr
  eos(proc.stdout, function (err) {
    outErr = err
    if (!--c) done()
  })

  proc.stderr.on('data', function (b) {
    errData.push(b)
  })

  var calledDone = false
  var exited = false
  var hungStreamTimer
  var code
  proc.on('exit', function (exit) {
    code = exit
    exited = true
    if (!--c) done()
    else {
      // must call done within 500ms of exit. just in case someone doesnt drain stdout somehow
      hungStreamTimer = setTimeout(function () {
        done()
      }, 500)
    }
  })

  proc.on('error',function(err){
    console.log('wtf error ',err)
  })

  // set max time for process to live.
  var killTimer = setTimeout(function () {
    if (exited) return
    proc.kill('SIGKILL')
  }, 10000)

  function done () {
    if (calledDone) return

    calledDone = true
    clearTimeout(killTimer)
    clearTimeout(hungStreamTimer)

    if (code) {
      var msg = 'exit code ' + code
      if (errErr) {
        msg += '\n stderr error. ' + errErr
      }

      if (outErr) {
        msg += '\n stdout error. ' + outErr
      }

      if (errData.length) {
        msg += '\n========= stderr ============\n' + Buffer.concat(errData) + ' \n=======================\n'
      }

      var e = new Error(msg)

      e.code = code
      return cb(e)
    }
    cb()
  }

  proc.stdout.pid = proc.pid

  return proc.stdout
}

