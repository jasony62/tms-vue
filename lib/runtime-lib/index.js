import Vue from 'vue'

function importCss(url) {
  return new Promise(resolve => {
    const el = document.createElement('link')
    el.rel = 'stylesheet'
    el.href = url
    const loadCallback = () => {
      el.removeEventListener('load', loadCallback)
      resolve()
    }
    const errorCallback = () => {
      el.removeEventListener('error', loadCallback)
      resolve()
    }
    el.addEventListener('load', loadCallback)
    el.addEventListener('error', errorCallback)
    document.head.appendChild(el)
  })
}

function importJs(url) {
  return new Promise(resolve => {
    const el = document.createElement('script')
    el.src = url
    el.async = false // 保持时序
    el.crossOrigin = 'anonymous' // 避免window.onerror拿不到脚本的报错
    const loadCallback = function() {
      el.removeEventListener('load', loadCallback)
      resolve()
    }
    const errorCallback = () => {
      el.removeEventListener('error', loadCallback)
      resolve()
    }
    el.addEventListener('load', loadCallback)
    el.addEventListener('error', errorCallback)
    document.body.appendChild(el)
  })
}

if (window.exports === undefined && window.require === undefined) {
  window.exports = { 'runtime-lib': true }
  window.require = function(module) {
    return module === 'vue' ? Vue : null
  }
}

export function tmsImportLib(url, { name = 'index', includeCss = true } = {}) {
  const js = `${url}/${name}.umd.min.js`

  let css
  if (includeCss) css = `${url}/${name}.css`

  // eslint-disable-next-line no-undef
  if (exports[url]) return exports[url]

  return new Promise(async resolve => {
    if (css) await importCss(css)
    await importJs(js)
    let lib = window.exports[name]
    window.exports[url] = lib
    delete window.exports[name]
    resolve(lib)
  })
}
