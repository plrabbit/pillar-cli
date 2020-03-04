const enhanceErrorMessages = require('./enhanceErrorMessages')
const {hasGit, hasProjectGit, hasYarn} = require('./env')
const {executeCommand} = require('./executeCommand')
const writeFile = require('./writeFile')
const {logWithSpinner,stopSpinner,pauseSpinner,resumeSpinner,failSpinner} = require('./spinner')
const clearConsole = require('./clearConsole')

module.exports = {
  enhanceErrorMessages,
  executeCommand,
  writeFile,
  clearConsole,

  hasGit,
  hasProjectGit,
  hasYarn,

  logWithSpinner,
  stopSpinner,
  pauseSpinner,
  resumeSpinner,
  failSpinner
}
