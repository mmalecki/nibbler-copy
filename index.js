var fs = require('fs')
var assert = require('assert')
var zlib = require('zlib')
var tar = require('tar-fs')
var exec = require('nibbler-exec')

module.exports = function(descriptor, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = null
  }

  var src = descriptor.src || '.'
  var dest = descriptor.dest

  assert(dest, '`dest` is required')

  fs.lstat(src, function(err, stat) {
    if (err) return cb(err)
    if (stat.isDirectory()) {
      var child = exec('mkdir -pv ' + dest + ' && tar -zxf- -C' + dest, options, cb)

      var source = tar.pack(src, {
        dereference: true
      })

      source
        .pipe(zlib.createGzip())
        .pipe(child.stdin)
    }
    else {
      fs.createReadStream(src)
        .pipe(exec('cat > ' + dest, options, cb).stdin)
    }
  })
}
