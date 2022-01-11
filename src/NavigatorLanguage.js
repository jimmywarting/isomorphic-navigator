const languages = [new Intl.NumberFormat().resolvedOptions().locale]

class NavigatorLanguage {
  get language () {
    return languages[0]
  }

  get languages () {
    return languages
  }
}

const { constructor, ...properties }
  = Object.getOwnPropertyDescriptors(NavigatorLanguage.prototype)

for (let key in properties) properties[key].set = v => { }

Object.defineProperties(Navigator.prototype, properties)
