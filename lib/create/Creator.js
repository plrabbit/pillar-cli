/**
 * Creator.js
 * Main function of create script
 */

const readline = require('readline')
const fs = require('fs-extra')
const execa = require('execa')
const downloadRepo = require('download-git-repo')
const chalk = require('chalk')

const generator = require('./generator')
const generateReadme = require('./generateReadme')

const {
  logWithSpinner,
  stopSpinner,

  hasGit,
  hasProjectGit,
  hasYarn,

  executeCommand,
  writeFile
} = require(`../../utils`)

module.exports = class Creator {
  constructor(name, context) {
    this.name = name
    this.context = context

    this.run = this.run.bind(this)
  }

  async create(cliOptions = {}) {
    const {name, context, run, download} = this
    const tmpDir = `${context}/.tmp`

    if (fs.existsSync(tmpDir)) {
      await fs.remove(tmpDir)
    }
    logWithSpinner(`Downloading template...`)
    await download(`direct:${cliOptions.usingTemplate.archive}`, tmpDir)
    stopSpinner()

    /* Write Template files */
    logWithSpinner(`Writing template...`)
    await generator({projectName: name}, tmpDir, context)
    await fs.remove(context + '/.tmp')
    stopSpinner()

    /* Git Initiation */
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      logWithSpinner(`Initializing git repository...`)
      await run('git init')
      stopSpinner()
    }

    /* Install Dependencies */
    const shouldInstallDepend = this.shouldInstallDepend(cliOptions)
    if (shouldInstallDepend) {
      console.log(`Installing dependencies...`)
      if (hasYarn()) {
        await executeCommand('yarn', [], context)
      } else {
        await executeCommand('npm', ['install', '--loglevel', 'error'], context)
      }
      readline.clearScreenDown(process.stderr)
      console.log(`${chalk.green('✔')}  Dependencies installation completed.`)
    }

    logWithSpinner(`Generating README.md...`)
    await fs.remove(`${context}/README.md`)
    await writeFile(context, {
      'README.md': generateReadme(name, cliOptions.usingTemplate)
    })

    let gitCommitFailed = false
    if (shouldInitGit) {
      await run(`git add -A`)
      try {
        await run('git', ['commit', '-m', 'init'])
      } catch (e) {
        gitCommitFailed = true
      }
    }
    stopSpinner()

    console.log(chalk.greenBright(`\nAll done!!!\n`))
    console.log(
      `Get started with the following commands:\n\n` +
      (this.context === process.cwd() ? `` : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
      chalk.cyan(`${shouldInstallDepend ? '' : ` ${chalk.gray('$')} npm install\n`}`) +
      chalk.cyan(` ${chalk.gray('$')} npm run serve`)
    )
    console.log()

    if (gitCommitFailed) {
      console.log(
        chalk.yellow(`Skipped git commit due to missing username and email in git config.\n` +
          `You will need to perform the initial commit yourself.\n`)
      )
    }
  }

  /* Run commands without displaying */
  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, {cwd: this.context})
  }

  /* Download the vunt-template */
  download(repo, dest, opts = {}) {
    return new Promise((resolve, reject) => {
      downloadRepo(repo, dest, opts, err => {
        if (err) reject(err)
        else resolve()
      })
    }).catch(err => {
      console.log('\nFailed to download template. ' + chalk.redBright(err.message.trim()))
      process.exit(1)
    })
  }

  /* Should git be initialized? */
  shouldInitGit (cliOptions) {
    if (!hasGit()) {
      return false
    }
    // --no-git
    if (cliOptions.git === false || cliOptions.git === 'false') {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }

  /* Dependencies installation? */
  shouldInstallDepend(cliOptions) {
    // -e --no-depend
    return !(cliOptions.depend === false || cliOptions.depend === 'false');
  }
}
