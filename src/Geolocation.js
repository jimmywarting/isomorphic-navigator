import parse from '../lib/wifi-parse-mac.js'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const encode = x => encoder.encode(x)
const decode = x => decoder.decode(x)
const headers = {
  'pragma': 'no-cache',
  'cache-control': 'no-cache',
  'content-type': 'application/json',
  'sec-fetch-site': 'none',
  'sec-fetch-mode': 'no-cors',
  'sec-fetch-dest': 'empty',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
}
// {
//   "age": 0,
//   "channel": 1,
//   "macAddress": "c0-89-ab-82-2b-e0",
//   "signalStrength": -66,
//   "signalToNoiseRatio": 30
// },
// {
//   "age": 0,
//   "channel": 36,
//   "macAddress": "c0-89-ab-82-2b-e4",
//   "signalStrength": -74,
//   "signalToNoiseRatio": 22
// }

const opt = {
  cmd: [],
  stdin: 'piped',
  stdout: 'piped',
  stderr: 'piped'
}

async function read (cmd) {
  // await Deno.permissions.query({ name: 'run', command: cmd[0] })
  await Deno.permissions.request({ name: 'run', command: cmd[0] })
  const p = Deno.run({ ...opt, cmd })
  return decode(await p.output())
}

async function get () {
  const wifi = await read([
    '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport',
    '--scan'
  ])
  const parsed = parse(wifi)

  const res = await fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      wifiAccessPoints: parsed.map(x => ({
        age: 0,
        channel: x.channel,
        macAddress: x.bssid,
        signalStrength: x.signal_level,
        signalToNoiseRatio: 0
      }))
    })
  })

  const data = await res.json()
  const coords = new GeolocationCoordinates(key, {
    accuracy: data.accuracy,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: data.location.lat,
    longitude: data.location.lng,
    speed: null,
  })

  return new GeolocationPosition(key, coords)
}

const map = []
const key = Symbol('constructor')

class Geolocation {
  [Symbol.toStringTag] = 'Geolocation'
  constructor (symbol) {
    if (symbol !== key) { throw new TypeError('Illegal constructor') }
  }

  getCurrentPosition (successCallback, errorCallback, options) {
    get(options).then(successCallback, errorCallback)
  }

  clearWatch (watchId) {
    map[watchId] = null
  }

  watchPosition (successCallback, errorCallback, options) {
    return map.length
  }
}

class GeolocationCoordinates {
  [Symbol.toStringTag] = 'GeolocationCoordinates'
  constructor (symbol, coords) {
    if (symbol !== key) { throw new TypeError('Illegal constructor') }
    this.accuracy = coords.accuracy
    this.altitude = coords.altitude
    this.altitudeAccuracy = coords.altitudeAccuracy
    this.heading = coords.heading
    this.latitude = coords.latitude
    this.longitude = coords.longitude
    this.speed = coords.speed
  }
}

class GeolocationPosition {
  [Symbol.toStringTag] = 'GeolocationPosition'
  constructor (symbol, coords) {
    if (symbol !== key) { throw new TypeError('Illegal constructor') }

    this.coords = coords
    this.timestamp = Date.now()
  }
}

const geolocation = new Geolocation(key)

Object.defineProperty(Navigator.prototype, 'geolocation', {
  get: () => geolocation,
  set: () => { }
})

globalThis.Geolocation = Geolocation
globalThis.GeolocationCoordinates = GeolocationCoordinates
globalThis.GeolocationPosition = GeolocationPosition

geolocation.getCurrentPosition(console.log)
