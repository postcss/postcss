import { AcceptedPlugin, Plugin, ProcessOptions } from './postcss'
import LazyResult from './lazy-result'
import Result from './result'
import Root from './root'

/**
 * Contains plugins to process CSS. Create one `Processor` instance,
 * initialize its plugins, and then use that instance on numerous CSS files.
 *
 * ```js
 * const processor = postcss([autoprefixer, precss])
 * processor.process(css1).then(result => console.log(result.css))
 * processor.process(css2).then(result => console.log(result.css))
 * ```
 */
export default class Processor {
  /**
   * Current PostCSS version.
   *
   * ```js
   * if (result.processor.version.split('.')[0] !== '6') {
   *   throw new Error('This plugin works only with PostCSS 6')
   * }
   * ```
   */
  version: string

  /**
   * Plugins added to this processor.
   *
   * ```js
   * const processor = postcss([autoprefixer, precss])
   * processor.plugins.length //=> 2
   * ```
   */
  plugins: Plugin<any>[]

  /**
   * Adds a plugin to be used as a CSS processor.
   *
   * PostCSS plugin can be in 4 formats:
   * * A plugin created by {@link postcss.plugin} method.
   * * A function. PostCSS will pass the function a @{link Root}
   *   as the first argument and current {@link Result} instance
   *   as the second.
   * * An object with a `postcss` method. PostCSS will use that method
   *   as described in #2.
   * * Another {@link Processor} instance. PostCSS will copy plugins
   *   from that instance into this one.
   *
   * Plugins can also be added by passing them as arguments when creating
   * a `postcss` instance (see [`postcss(plugins)`]).
   *
   * Asynchronous plugins should return a `Promise` instance.
   *
   * ```js
   * const processor = postcss()
   *   .use(autoprefixer)
   *   .use(precss)
   * ```
   *
   * @param plugin PostCSS plugin or {@link Processor} with plugins.
   * @return {Processes} Current processor to make methods chain.
   */
  use (plugin: AcceptedPlugin): this

  /**
   * Parses source CSS and returns a {@link LazyResult} Promise proxy.
   * Because some plugins can be asynchronous it doesn’t make
   * any transformations. Transformations will be applied
   * in the {@link LazyResult} methods.
   *
   * ```js
   * processor.process(css, { from: 'a.css', to: 'a.out.css' })
   *   .then(result => {
   *      console.log(result.css)
   *   })
   * ```
   *
   * @param css String with input CSS or any object with a `toString()` method,
   *            like a Buffer. Optionally, senda {@link Result} instance
   *            and the processor will take the {@link Root} from it.
   * @param opts Options.
   * @return Promise proxy.
   */
  process (
    css: string | { toString(): string } | Result | LazyResult | Root,
    options?: ProcessOptions
  ): LazyResult
}
