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
    el.addEventListener('load', loadCallback)
    document.head.appendChild(el)
  })
}

function importJs(url) {
  return new Promise(resolve => {
    const el = document.createElement('script')
    el.src = url
    el.async = false // 保持时序
    el.crossOrigin = 'anonymous' // 避免window.onerror拿不到脚本的报错
    const loadCallback2 = function() {
      el.removeEventListener('load', loadCallback2)
      resolve()
    }
    el.addEventListener('load', loadCallback2)
    document.body.appendChild(el)
  })
}

if (window.exports === undefined && window.require === undefined) {
  window.exports = { 'runtime-lib': true }
  window.require = function(module) {
    return module === 'vue' ? Vue : null
  }
}

export function tmsImportLib(libName, libUrl) {
  const js = `${libUrl}/${libName}/${libName}.umd.min.js`
  const css = `${libUrl}/${libName}/${libName}.css`

  // eslint-disable-next-line no-undef
  if (exports[libName]) return exports[libName]

  return new Promise(async resolve => {
    await importCss(css)
    await importJs(js)
    resolve(window.exports[libName])
  })
}
