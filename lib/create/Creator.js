/**
 * Creator.js
 * Main function of create script
 */

const fs = require('fs-extra')
const execa = require('execa')
const downloadRepo = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')

const generator = require('./generator')

const {hasGit, executeCommand, writeFile} = require(`../../utils`)

module.exports = class Creator {
  constructor(name, context) {
    this.name = name
    this.context = context

    this.run = this.run.bind(this)
  }

  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, {cwd: this.context})
  }

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

  async create() {
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

    const {npmInstall} = await inquirer.prompt([
      {
        name: 'npmInstall',
        type: 'confirm',
        message: `Install dependencies with NPM?`
      }
    ])
    // const npmInstall = true

    fs.remove(`${context}/README.md`)

    /* Git Initiation */
    if (hasGit()) {
      await run('git init')
    } else {
      console.log(chalk.yellow(`Git is not detected. You may configure it yourself.`))
    }

    /* Install Dependencies */
    if (npmInstall) {
      console.log(`Installing dependencies...`)
      await executeCommand('yarn', ['install', '--loglevel', 'error'], context)
      console.log(chalk.blueBright(`Dependencies install completed.`))
    }

    console.log(`Running completion hooks...`)

    let gitCommitFailed = false
    if (hasGit()) {
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
      chalk.cyan(`${npmInstall ? '' : ` ${chalk.gray('$')} npm install\n`}`) +
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
}
