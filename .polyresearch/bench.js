/* eslint-disable no-console -- benchmark output */
'use strict'

let path = require('path')
let repoRoot = path.resolve(__dirname, '..')
let postcss = require(path.join(repoRoot, 'lib', 'postcss'))
let crypto = require('crypto')

// ============================================================================
// Deterministic PRNG (mulberry32)
// ============================================================================

function prng(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

// ============================================================================
// CSS generation
// ============================================================================

let PROPS = [
  'color', 'background-color', 'margin', 'padding', 'font-size',
  'line-height', 'display', 'position', 'width', 'height',
  'border', 'border-radius', 'opacity', 'z-index', 'overflow',
  'text-align', 'font-weight', 'transform', 'transition',
  'box-shadow', 'flex', 'justify-content', 'align-items', 'gap',
  'max-width', 'min-height', 'cursor', 'text-decoration',
  'letter-spacing', 'background', 'animation'
]

let VALS = {
  'color': ['#333', 'red', 'rgba(0,0,0,.5)', 'inherit', 'var(--c)'],
  'background-color': ['#fff', '#eee', 'transparent', 'rgba(255,255,255,.9)'],
  'margin': ['0', '8px', '16px 24px', '0 auto'],
  'padding': ['0', '12px', '8px 16px', '4px 8px 4px 8px'],
  'font-size': ['14px', '1rem', '1.5em', 'clamp(1rem, 2vw, 2rem)'],
  'line-height': ['1.5', 'normal', '1.2'],
  'display': ['block', 'flex', 'grid', 'none', 'inline-flex'],
  'position': ['relative', 'absolute', 'fixed', 'sticky'],
  'width': ['100%', '200px', 'auto', 'calc(100% - 32px)'],
  'height': ['auto', '100%', '100vh', 'fit-content'],
  'border': ['none', '1px solid #ccc', '2px dashed #999'],
  'border-radius': ['4px', '8px', '50%', '0'],
  'opacity': ['0', '0.5', '1'],
  'z-index': ['1', '10', '100', 'auto'],
  'overflow': ['hidden', 'auto', 'scroll'],
  'text-align': ['left', 'center', 'right'],
  'font-weight': ['400', '700', 'bold'],
  'transform': ['none', 'translateX(50%)', 'rotate(45deg)', 'scale(1.1)'],
  'transition': ['all .3s ease', 'opacity .2s', 'none'],
  'box-shadow': ['none', '0 2px 4px rgba(0,0,0,.1)', '0 4px 8px rgba(0,0,0,.2)'],
  'flex': ['1', '0 0 auto', '1 1 0%'],
  'justify-content': ['center', 'space-between', 'flex-start'],
  'align-items': ['center', 'stretch', 'flex-start'],
  'gap': ['8px', '16px', '0'],
  'max-width': ['100%', '1200px', 'none'],
  'min-height': ['0', '100vh', '200px'],
  'cursor': ['pointer', 'default', 'not-allowed'],
  'text-decoration': ['none', 'underline'],
  'letter-spacing': ['normal', '0.5px', '-0.5px'],
  'background': ['#f0f0f0', 'linear-gradient(to right, #000, #fff)', 'url("bg.png") no-repeat'],
  'animation': ['fadeIn .5s ease', 'spin 1s linear infinite', 'none']
}

let SELECTORS = [
  '.container', '.wrapper', '.header', '.footer', '.nav',
  '.btn', '.card', '.modal', '.form', '.input', '.label',
  '.icon', '.badge', '.alert', '.grid', '.row', '.col',
  '.section', '.article', '.list', '.item', '.link',
  '.title', '.image', '.menu', '.dropdown', '.tooltip',
  '.sidebar', '.panel', '.table', '.tag', '.chip'
]

let PSEUDOS = [':hover', ':focus', ':active', ':first-child', '::before', '::after']
let COMBINATORS = [' ', ' > ', ' + ']
let MEDIA = [
  '(min-width: 768px)',
  '(max-width: 1024px)',
  'screen and (min-width: 1200px)',
  '(prefers-color-scheme: dark)'
]

function genSelector(rng, suffix) {
  let s = pick(rng, SELECTORS) + '-' + suffix
  if (rng() < 0.3) s += pick(rng, PSEUDOS)
  if (rng() < 0.35) s += pick(rng, COMBINATORS) + pick(rng, SELECTORS)
  return s
}

function genDecls(rng, count) {
  let out = ''
  for (let i = 0; i < count; i++) {
    let p = PROPS[(Math.floor(rng() * PROPS.length) + i) % PROPS.length]
    out += '  ' + p + ': ' + pick(rng, VALS[p]) + ';\n'
  }
  return out
}

function genRule(rng, idx, indent) {
  let pfx = indent || ''
  let declCount = 3 + Math.floor(rng() * 6)
  let sel = genSelector(rng, idx)
  let decls = genDecls(rng, declCount)
  if (pfx) decls = decls.replace(/^/gm, pfx)
  return pfx + sel + ' {\n' + decls + pfx + '}\n'
}

function generateLargeCSS() {
  let rng = prng(42)
  let parts = []
  let ruleIdx = 0

  for (let i = 0; i < 5000; i++) {
    if (i % 80 === 0) {
      parts.push('/* Section ' + (Math.floor(i / 80) + 1) + ' */\n')
    }

    if (i % 150 === 0 && i > 0) {
      let block = '@media ' + pick(rng, MEDIA) + ' {\n'
      let inner = 3 + Math.floor(rng() * 8)
      for (let j = 0; j < inner; j++) {
        block += genRule(rng, ruleIdx++, '  ')
      }
      block += '}\n'
      parts.push(block)
      continue
    }

    if (i % 400 === 0) {
      parts.push(
        '@keyframes anim-' + i + ' {\n' +
        '  0% { opacity: 0; transform: translateY(20px); }\n' +
        '  50% { opacity: 0.5; }\n' +
        '  100% { opacity: 1; transform: translateY(0); }\n' +
        '}\n'
      )
    }

    parts.push(genRule(rng, ruleIdx++, ''))
  }

  return parts.join('\n')
}

function generateCSSFiles(count) {
  let rng = prng(7777)
  let files = []
  let ruleIdx = 0

  for (let f = 0; f < count; f++) {
    let parts = []
    let ruleCount = 10 + Math.floor(rng() * 110)

    for (let i = 0; i < ruleCount; i++) {
      if (i % 25 === 0 && rng() < 0.3) {
        let block = '@media ' + pick(rng, MEDIA) + ' {\n'
        let inner = 1 + Math.floor(rng() * 4)
        for (let j = 0; j < inner; j++) {
          block += genRule(rng, ruleIdx++, '  ')
        }
        block += '}\n'
        parts.push(block)
      } else {
        parts.push(genRule(rng, ruleIdx++, ''))
      }
    }

    files.push(parts.join('\n'))
  }

  return files
}

// ============================================================================
// Plugins for Workload B
//
// Design constraints:
//   - PostCSS re-walks the AST when visitor callbacks mutate nodes (markDirty).
//   - Non-idempotent visitors cause infinite re-walks.
//   - Mutations go in Once handlers (run once, no re-walk risk).
//   - Read-only visitors exercise the dispatch machinery safely.
//   - prepare() gives per-file state when needed.
// ============================================================================

/**
 * Plugin 1 — bulk transforms via Once (exercises walkDecls, walkComments,
 * cloneBefore, remove). Mutations happen in a single pass, no re-walk.
 */
let bulkTransformPlugin = {
  postcssPlugin: 'bench-bulk-transform',
  Once(root) {
    root.walkDecls(/^(transform|transition|animation)$/, decl => {
      decl.cloneBefore({ prop: '-webkit-' + decl.prop })
    })
    root.walkComments(comment => {
      comment.remove()
    })
  }
}

/**
 * Plugin 2 — read-only visitor: Declaration (exercises Declaration dispatch
 * for every declaration node). Accumulates per-file stats via prepare().
 */
let declInspectPlugin = {
  postcssPlugin: 'bench-decl-inspect',
  prepare() {
    let count = 0
    let totalLen = 0
    return {
      Declaration(decl) {
        count++
        totalLen += decl.prop.length + decl.value.length
      },
      OnceExit(root, { result }) {
        result.messages.push({ type: 'decl-stats', plugin: 'bench-decl-inspect', count, totalLen })
      }
    }
  }
}

/**
 * Plugin 3 — read-only visitor: Rule + AtRule (exercises Rule and AtRule
 * dispatch paths, selector and params accessors).
 */
let structureInspectPlugin = {
  postcssPlugin: 'bench-structure-inspect',
  prepare() {
    let ruleCount = 0
    let atRuleCount = 0
    let selectorLen = 0
    return {
      Rule(rule) {
        ruleCount++
        selectorLen += rule.selector.length
      },
      AtRule(atRule) {
        atRuleCount++
        if (atRule.params) selectorLen += atRule.params.length
      },
      OnceExit(root, { result }) {
        result.messages.push({
          type: 'structure-stats',
          plugin: 'bench-structure-inspect',
          ruleCount,
          atRuleCount,
          selectorLen
        })
      }
    }
  }
}

/**
 * Plugin 4 — Once handler that walks the full tree and namespaces selectors.
 * Exercises walkRules, selector mutation. Runs once per file in Once, no
 * re-walk risk.
 */
let namespacePlugin = {
  postcssPlugin: 'bench-namespace',
  Once(root) {
    root.walkRules(rule => {
      rule.selector = rule.selector.replace(/\.([\w])/g, '.ns-$1')
    })
  }
}

let plugins = [bulkTransformPlugin, declInspectPlugin, structureInspectPlugin, namespacePlugin]

// ============================================================================
// Part A: Parse + Stringify (no plugins, no source maps)
// ============================================================================

let largeCSS = generateLargeCSS()
let lineCountA = largeCSS.split('\n').length

let WARMUP_A = 3
let RUNS_A = 10

for (let i = 0; i < WARMUP_A; i++) {
  postcss.parse(largeCSS).toString()
}

let timesA = []
let outputA

for (let i = 0; i < RUNS_A; i++) {
  let start = process.hrtime.bigint()
  let root = postcss.parse(largeCSS)
  outputA = root.toString()
  let end = process.hrtime.bigint()
  timesA.push(Number(end - start) / 1e6)
}

timesA.sort((a, b) => a - b)
let medianA = timesA[Math.floor(timesA.length / 2)]

let fingerprintA = crypto
  .createHash('sha256')
  .update(outputA)
  .digest('hex')
  .slice(0, 12)

// ============================================================================
// Part B: Plugin pipeline (4 plugins, 250 files)
// ============================================================================

let cssFiles = generateCSSFiles(250)
let fileCountB = cssFiles.length

let WARMUP_B = 1
let RUNS_B = 5

function runWorkloadB() {
  let processor = postcss(plugins)
  let totalLen = 0
  for (let f = 0; f < cssFiles.length; f++) {
    let result = processor.process(cssFiles[f], { from: 'file-' + f + '.css' })
    totalLen += result.css.length
  }
  return totalLen
}

for (let i = 0; i < WARMUP_B; i++) {
  runWorkloadB()
}

let timesB = []
let outputLenB

for (let i = 0; i < RUNS_B; i++) {
  let start = process.hrtime.bigint()
  outputLenB = runWorkloadB()
  let end = process.hrtime.bigint()
  timesB.push(Number(end - start) / 1e6)
}

timesB.sort((a, b) => a - b)
let medianB = timesB[Math.floor(timesB.length / 2)]

// Fingerprint B: hash of concatenated output from all 250 files
let hashB = crypto.createHash('sha256')
let verifyProcessor = postcss(plugins)
for (let f = 0; f < cssFiles.length; f++) {
  hashB.update(verifyProcessor.process(cssFiles[f], { from: 'file-' + f + '.css' }).css)
}
let fingerprintB = hashB.digest('hex').slice(0, 12)

// ============================================================================
// Composite metric
// ============================================================================

let SCALE_B = 5
let composite = medianA + medianB / SCALE_B

console.log('METRIC_A: ' + medianA.toFixed(2))
console.log('METRIC_A_MIN: ' + Math.min(...timesA).toFixed(2))
console.log('METRIC_A_MAX: ' + Math.max(...timesA).toFixed(2))
console.log('LINES: ' + lineCountA)
console.log('FINGERPRINT_A: ' + fingerprintA)
console.log('')
console.log('METRIC_B: ' + medianB.toFixed(2))
console.log('METRIC_B_MIN: ' + Math.min(...timesB).toFixed(2))
console.log('METRIC_B_MAX: ' + Math.max(...timesB).toFixed(2))
console.log('FILES: ' + fileCountB)
console.log('OUTPUT_LENGTH: ' + outputLenB)
console.log('FINGERPRINT_B: ' + fingerprintB)
console.log('')
console.log('METRIC: ' + composite.toFixed(2))
