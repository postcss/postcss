fs = require('fs-extra')

sh = (cmd, callback) ->
  require('child_process').exec cmd, (error, stdout, stderr) ->
    process.stderr.write(stderr)
    process.exit(1) if error
    callback()

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

getStyles = (url, callback) ->
  get url, (html) ->
    styles = html.match(/[^"]+\.css/g)
    error("Wrong answer from #{ url }") unless styles
    styles = styles.map (i) -> i.replace(/^\.?\.?\//, url)
    callback(styles)

task 'integration', 'Test parser/stringifier on real CSS', ->
  invoke('clean')

  require('coffee-script/register')
  postcss = require(__dirname + '/lib/postcss')
  test = (css) ->
    try
      processed = postcss().process(css, map: true, mapAnnotation: false).css
    catch e
      fs.writeFileSync(__dirname + '/fail.css', css)
      error("Parsing error: #{ e.stack }\nBad file was saved to fail.css")

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
    getStyles site.url, (styles) ->
      links = styles
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
      else if path == '/index.js'
        continue
      else if path == '/package.json'
        data = JSON.parse(fs.readFileSync(sourcePath))
        delete data['dependencies']['coffee-script']
        fs.writeFileSync(buildPath, JSON.stringify(data, null, 2))
      else
        fs.copy(sourcePath, buildPath)

  compile()

task 'bench', 'Benchmark on GitHub styles', ->
  invoke('compile')

  indent = (max, current) ->
    diff = max.toString().length - current.toString().length
    for i in [0...diff]
      print(' ')

  times = { }
  bench = (title, callback) ->
    print("#{ title }: ")
    indent('Gonzales', title)

    start = new Date()
    callback() for i in [0..10]
    time  = (new Date()) - start
    time  = Math.round(time / 10)
    print(time + " ms")

    if times.PostCSS
      slower = time / times.PostCSS
      if slower < 1
        print(" (#{ (1 / slower).toFixed(1) } times faster)")
      else
        print(" (#{ slower.toFixed(1) } times slower)")
    times[title] = time
    print("\n")

  print("Load GitHub styles")
  getStyles 'https://github.com/', (styles) ->
    get styles[0], (css) ->
      print("\n")

      postcss  = require(__dirname + '/build')
      bench 'PostCSS', -> postcss().process(css)

      CSSOM  = require('cssom')
      bench 'CSSOM', -> CSSOM.parse(css).toString()

      rework  = require('rework')
      bench 'Rework', -> rework(css).toString()

      gonzales = require('gonzales')
      bench 'Gonzales', -> gonzales.csspToSrc( gonzales.srcToCSSP(css) )

task 'publish', 'Publish new version to npm', ->
  invoke('compile')
  build = __dirname + '/build/'
  sh "npm publish #{build}", ->
    fs.removeSync(build)
