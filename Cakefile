fs = require('fs-extra')

sh = (cmd, callback) ->
  require('child_process').exec cmd, (error, stdout, stderr) ->
    process.stderr.write(stderr)
    process.exit(1) if error
    callback()

task 'clean', 'Remove all temporary files', ->
  fs.removeSync(__dirname + '/build')
  fs.removeSync(__dirname + '/autoprefixer.js')

task 'compile', 'Compile CoffeeScript to JS', ->
  invoke('clean')

  coffee = require('coffee-script')

  build = __dirname + '/build'
  fs.removeSync(build)
  fs.mkdirSync(build)

  ignore = fs.readFileSync(__dirname + '/.npmignore').toString().split("\n")
  ignore = ignore.concat(['.git', '.npmignore'])

  compileCoffee = (path) ->
    source = fs.readFileSync(path).toString()
    coffee.compile(source)

  compile = (dir = '/') ->
    path = __dirname + dir + '/'
    for name in fs.readdirSync(__dirname + dir)
      continue if ignore.some (i) -> i == name

      path       = dir + name
      sourcePath = __dirname + path
      buildPath  = build + path

      if fs.statSync(sourcePath).isDirectory()
        fs.mkdirSync(buildPath)
        compile(path + '/')
      else if name[-7..-1] == '.coffee'
        compiled = compileCoffee(sourcePath)
        jsPath   = buildPath.replace(/\.coffee$/, '.js')
        fs.writeFileSync(jsPath, compiled)
      else
        fs.copy(sourcePath, buildPath)

  compile()

task 'publish', 'Publish new version to npm', ->
  invoke('compile')
  build = __dirname + '/build/'
  sh "npm publish #{build}", ->
    fs.removeSync(build)
