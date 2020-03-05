[
  'enhanceErrorMessages',
  'env',
  'executeCommand',
  'writeFile',
  'spinner',
  'clearConsole'
].forEach(n => {
  Object.assign(exports, require(`./${n}`))
})
