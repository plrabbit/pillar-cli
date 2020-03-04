/**
 * Creator.js
 * Main function of create script
 */

const fs = require('fs-extra')
const execa = require('execa')
const downloadRepo = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')

const generator = require('./generator')

const {hasGit, hasProjectGit, hasYarn, executeCommand, writeFile} = require(`../../utils`)

module.exports = class Creator {
  constructor(name, context) {
    this.name = name
    this.context = context

    this.run = this.run.bind(this)
  }

  async create(cliOptions = {}) {
    const {name, context, run, download} = this

    if (fs.existsSync(context + '/.tmp')) {
      fs.remove(context + '/.tmp')
    }
    let spinner = ora(`Downloading vunt-template`)
    spinner.start()
    await download('github:plrabbit/vunt', context + '/.tmp', {})
    spinner.stop()
    console.log(chalk.blueBright(`Download completed.`))

    /* Write Template files */
    await generator({projectName: name}, context + '/.tmp', context)
    fs.remove(context + '/.tmp')
    console.log(chalk.blueBright(`Write Template completed.`))


    fs.remove(`${context}/README.md`)

    /* Git Initiation */
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      await run('git init')
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
      console.log(chalk.blueBright(`Dependencies install completed.`))
    }

    console.log(`Running completion hooks...`)

    let gitCommitFailed = false
    if (shouldInitGit) {
      await run(`git add -A`)
      try {
        await run('git', ['commit', '-m', 'init'])
      } catch (e) {
        gitCommitFailed = true
      }
    }

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
  download(repo, dest, opts) {
    return new Promise((resolve, reject) => {
      downloadRepo(repo, dest, opts, err => {
        if (err) reject(err)
        else resolve()
      })
    }).catch(err => {
      console.log('\nFailed to download vunt-template. ' + chalk.redBright(err.message.trim()))
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
