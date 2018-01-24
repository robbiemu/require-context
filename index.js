module.exports = function(d, recursive, regExp) {
  const dir = require('node-dir')
  const path = require('path')

  if (!Array.isArray(d)) {
    d = [d]
  }
  
  const keysMap = {}
  keysmap.keys = []
  keysmap.directories = {}
  
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
      .filter(file => file.match(regExp || /\.(json|js)$/))
      .map(file => '.' + path.sep + file.slice(basepath.length + 1))
    
    dirKeys.forEach(file => keysMap.directories[file] = directory)
      
    keysMap.keys = keysMap.keys.concat(dirKeys)
  })

  const context = function(key) {
    return require(context.resolve(key))
  }

  context.resolve = function(key) {
    return keysMap.directories[key] + path.sep + key
  }

  context.keys = function() {
    return keysMap.keys
  }

  return context
}
