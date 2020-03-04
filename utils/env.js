const { execSync } = require('child_process')

// env detection
exports.hasGit = () => {
  let _hasGit
  try {
    execSync('git --version', { stdio: 'ignore' })
    _hasGit = true
  } catch (e) {
    _hasGit = false
  }
  return _hasGit
}

exports.hasProjectGit = (cwd) => {
  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  return result
}

exports.hasYarn = () => {
  let _hasYarn
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    _hasYarn = true
  } catch (e) {
    _hasYarn = false
  }
  return _hasYarn
}
