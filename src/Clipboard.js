// TODO: Impl clipboard monitor & dispatch ClipboardEvent
// TODO: Impl copy/paste files (ClipboardItem)
// TODO: request/query clipboard

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const encode = x => encoder.encode(x)
const decode = x => decoder.decode(x)

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

async function write (cmd, data) {
  // await Deno.permissions.query({ name: 'run', command: cmd[0] })
  await Deno.permissions.request({ name: 'run', command: cmd[0] })
  const p = Deno.run({ ...opt, cmd })
  await p.stdin.write(encode(data))
  p.stdin.close()
  await p.status()
}

const dispatch = {
  linux: {
    async read () { },
    async readText () {
      // return read(['xclip', '-selection', 'clipboard', '-o']);
      return read(['xsel', '-b', '-o'])
    },
    async write (data) { },
    async writeText (data) {
      // return write(['xclip', '-selection', 'clipboard'], data);
      return write(['xsel', '-b', '-i'], data)
    }
  },
  darwin: {
    async read () { },
    async readText () {
      return read(['pbpaste'])
    },
    async write (data) { },
    async writeText (data) {
      return write(['pbcopy'], data)
    }
  },
  win: {
    async read () { },
    async readText () {
      const data = await read(['powershell', '-noprofile', '-command', 'Get-Clipboard'])
      return data.replace(/\r/g, '').replace(/\n$/, '')
    },
    async write (data) { },
    async writeText (data) {
      return write(['powershell', '-noprofile', '-command', '$input|Set-Clipboard'], data)
    }
  }
}

class Clipboard extends EventTarget {
  [Symbol.toStringTag] = 'Clipboard'
  // @ts-ignore (https://github.com/Microsoft/TypeScript/issues/8277)
  constructor (_key) {
    if (_key !== key) { throw new TypeError('Illegal constructor') }
    super()
  }
}

const system = dispatch[navigator.platform]
const key = Symbol('constructor')
const clipboard = new Clipboard(key)

Object.entries(system).forEach(([k, v]) => {
  Clipboard.prototype[k] = v
})

Object.defineProperty(Navigator.prototype, 'clipboard', {
  get: () => clipboard,
  set: () => { }
})

globalThis.Clipboard = Clipboard
