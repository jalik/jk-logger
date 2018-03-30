/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Karl STEIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { extendRecursively } from '@jalik/extend';
import Observer from '@jalik/observer';
import Types from './types';

class Logger {
  constructor(options) {
    this.options = extendRecursively({
      active: true,
      console: {
        debug: true,
        error: true,
        info: true,
        other: true,
        warning: true,
      },
      displayContext: false,
    }, options);

    // Create observer
    this.observer = new Observer(this);

    // Check console availability
    if (typeof console !== 'object' || console === null) {
      throw new Error('The console object is not available in this environment.');
    }

    // Add polyfill methods to the console object
    // eslint-disable-next-line
    if (typeof console.log === 'function') {
      // eslint-disable-next-line
      if (typeof console.debug !== 'function') {
        // eslint-disable-next-line
        console.debug = console.log;
      }
      // eslint-disable-next-line
      if (typeof console.error !== 'function') {
        // eslint-disable-next-line
        console.error = console.log;
      }
      // eslint-disable-next-line
      if (typeof console.info !== 'function') {
        // eslint-disable-next-line
        console.info = console.log;
      }
      // eslint-disable-next-line
      if (typeof console.warn !== 'function') {
        // eslint-disable-next-line
        console.warn = console.log;
      }
    }
  }

  /**
   * Logs a debug message
   * @param message
   * @param context
   */
  debug(message, context) {
    return this.log(message, Types.debug, context);
  }

  /**
   * Logs an error message
   * @param messageOrError
   * @param context
   */
  error(messageOrError, context) {
    // eslint-disable-next-line
    const ctx = context || {};
    let msg = messageOrError;

    if (messageOrError instanceof Error) {
      // eslint-disable-next-line
      ctx.error = {};

      const attributes = ['name', 'message', 'reason', 'stack', 'type'];

      for (let i = 0; i < attributes.length; i += 1) {
        if (attributes[i] in messageOrError) {
          // eslint-disable-next-line
          ctx.error[attributes[i]] = messageOrError[attributes[i]];
        }
      }
      // eslint-disable-next-line
      const { message } = messageOrError;
      msg = message;
    }
    return this.log(msg, Types.error, ctx);
  }

  /**
   * Logs an information message
   * @param message
   * @param context
   */
  info(message, context) {
    return this.log(message, Types.info, context);
  }

  /**
   * Checks if the logger is active
   * @return {boolean}
   */
  isActive() {
    return this.options.active === true;
  }

  /**
   * Logs a message
   * @param message
   * @param type
   * @param context
   */
  log(message, type, context) {
    if (this.isActive()) {
      const args = [message];

      // Display context in console
      if (typeof context !== 'undefined' && this.options.displayContext === true) {
        args.push(context);
      }

      // Displays the message in the console
      switch (type) {
        case Types.debug:
          if (this.options.console.debug === true) {
            console.log.apply(this, args);
          }
          break;

        case Types.error:
          if (this.options.console.error === true) {
            console.error.apply(this, args);
          }
          break;

        case Types.info:
          if (this.options.console.info === true) {
            console.info.apply(this, args);
          }
          break;

        case Types.warning:
          if (this.options.console.warning === true) {
            console.warn.apply(this, args);
          }
          break;

        default:
          if ((typeof this.options.console[type] === 'boolean'
            && this.options.console[type] === true)
            || (typeof this.options.console[type] !== 'boolean'
              && this.options.console.other === true)) {
            console.log.apply(this, args);
          }
      }
    }

    // Notify all listeners
    this.observer.notify(type, ...[message, context]);
  }

  /**
   * Removes an event listener
   * @param event
   * @param callback
   */
  off(event, callback) {
    this.observer.detach(event, callback);
  }

  /**
   * Adds an event listener
   * @param event
   * @param callback
   */
  on(event, callback) {
    this.observer.attach(event, callback);
  }

  /**
   * Activates or deactivates the logger
   * @param active
   */
  setActive(active) {
    this.options.active = (active === true);
  }

  /**
   * Logs a warning message
   * @param message
   * @param context
   */
  warn(message, context) {
    return this.log(message, Types.warning, context);
  }
}

export default Logger;
