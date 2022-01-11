const platform = Deno.build.os
const userAgent = 'Deno/' + Deno.version.deno

class NavigatorID {
    get appCodeName () { return 'Mozilla' }
    get appName () { return 'Netscape' }
    get appVersion () { return '' }
    get platform () { return platform }
    get product () { return 'Gecko' }
    get productSub () { return '20030107' }
    get userAgent () { return userAgent }
    get vendor () { return 'Google Inc.' }
    get vendorSub () { return '' }
}

const { constructor, ...properties }
    = Object.getOwnPropertyDescriptors(NavigatorID.prototype)

for (let key in properties) properties[key].set = v => { }

Object.defineProperties(Navigator.prototype, properties)
