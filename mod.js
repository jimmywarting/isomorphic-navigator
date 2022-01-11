/*! isomorphic-navigator. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

import './src/NavigatorID.js'
import './src/NavigatorLanguage.js'
import './src/Clipboard.js'
import './src/Geolocation.js'

const _key = Symbol('constructor')

class Navigator {
  constructor (key) {
    if (key !== _key) { throw new TypeError('Illegal constructor') }
  }
}

if (!globalThis.navigator) {
  globalThis.Navigator = Navigator
  globalThis.navigator = new Navigator(constructor)
}
