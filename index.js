module.exports = function(d, recursive, regExp) {
  const dir = require('node-dir')
  const path = require('path')

  if (!Array.isArray(d)) {
    d = [d]
  }
  
  let keys = []
  d.forEach(directory => {
    let basepath =
      directory[0] === '.'
        ? path.resolve(__dirname + path.sep + directory)
        : directory

    try {
      basepath = require.resolve(basepath)
    } catch (err) {
      if (
        err.message.length > 18 &&
        err.message.slice(0, 18) === 'Cannot find module'
      ) {
        basepath = err.message.slice(20, -1)
      } else {
        throw err
      }
    }
    
    const dirKeys = dir
      .files(basepath, {
        sync: true,
        recursive: recursive || false
      })
      .filter(function(file) {
        return file.match(regExp || /\.(json|js)$/)
      })
      .map(function(file) {
        return '.' + path.sep + file.slice(basepath.length + 1)
      })    
      
    keys = keys.concat(dirKeys)
  })


  const context = function(key) {
    return require(context.resolve(key))
  }

  context.resolve = function(key) {
    return directory + path.sep + key
  }

  context.keys = function() {
    return keys
  }

  return context
}
