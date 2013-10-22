fs = require('fs-extra')

sh = (cmd, callback) ->
  require('child_process').exec cmd, (error, stdout, stderr) ->
    process.stderr.write(stderr)
    process.exit(1) if error
    callback()

task 'integration', 'Test parser/stringifier on real CSS', ->
  invoke('clean')

  print = (text) ->
    process.stdout.write(text)
  error = (text) ->
    process.stderr.write("\n\n" + text + "\n")
    process.exit(1)

  https = require('https')
  http  = require('http')
  get = (url, callback) ->
    protocol = if url.match(/^https/) then https else http
    protocol.get url, (res) ->
      data = ''
      res.on 'data', (chunk) -> data += chunk
      res.on 'end', -> callback(data)

  postcss = require(__dirname + '/lib/postcss')
  test = (css) ->
    try
      processed = postcss.parse(css).toString()
    catch e
      fs.writeFileSync(__dirname + '/fail.css', css)
      error("Parsing error: #{ e.message }\nBad file was saved to fail.css")

    if processed != css
      fs.writeFileSync(__dirname + '/origin.css', css)
      fs.writeFileSync(__dirname + '/fail.css', processed)
      error("Wrong stringifing\n" +
            "Check difference between origin.css and fail.css")

  links = []
  nextLink = ->
    if links.length == 0
      print("\n")
      nextSite()
      return

    get links.shift(), (css) ->
      test(css)
      print('.')
      nextLink()

  sites = [{ name: 'GitHub',    url: 'https://github.com/' }
           { name: 'Twitter',   url: 'https://twitter.com/' }
           { name: 'Habrahabr', url: 'http://habrahabr.ru/' }
           { name: 'Bootstrap', url: 'http://getbootstrap.com/' }]
  nextSite = ->
    return if sites.length == 0
    site = sites.shift()

    print('Test ' + site.name + ' styles')
    get site.url, (html) ->
      links = html.match(/[^"]+\.css/g).map (i) -> i.replace(/^\.?\//, site.url)
      nextLink()

  nextSite()

task 'clean', 'Remove all temporary files', ->
  fs.removeSync(__dirname + '/build')
  fs.removeSync(__dirname + '/fail.css')
  fs.removeSync(__dirname + '/origin.css')

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
