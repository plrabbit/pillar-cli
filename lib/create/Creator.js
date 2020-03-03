/**
 * Creator.js
 * Main function of create script
 */

const fs = require('fs-extra')
const execa = require('execa')
const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')

const generator = require('./generator')

const { hasGit } = require('../../utils/env')
const { writeFile } = require('../../utils/writeFile')
const { executeCommand } = require('../../utils/executeCommand')

module.exports = class Creator {
  constructor(name, context) {
    this.name = name
    this.context = context

    this.run = this.run.bind(this)
  }

  async run(command, args)
  {
    if (!args) {
      [command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, {cwd: this.context})
  }

  async create() {
    const { name, context, run } = this

    if (fs.existsSync('.tmp')) {
      fs.remove('.tmp')
    }
    let spinner = ora(`Downloading vunt-template`)
    spinner.start()
    download('github:plrabbit/vunt', './.tmp', {}, async err => {
      spinner.stop()
      if (err) console.log('Failed to download vunt-template. ' + chalk.redBright(err.message.trim()))
      else {
        console.log(chalk.blueBright(`Download completed.`))

        /* Write Template files */
        await generator({ projectName: name }, './.tmp', context)
        console.log(chalk.blueBright(`Write Template completed.`))

        const {npmInstall} = await inquirer.prompt([
          {
            name: 'npmInstall',
            type: 'confirm',
            message: `Install dependencies with NPM?`
          }
        ])

        fs.remove(`${context}/README.md`)

        /* Git Initiation */
        if(hasGit()) {
          console.log((await run('git init')).stdout)
        } else {
          console.log(chalk.yellow(`Git is not detected. You may configure it yourself.`))
        }

        /* Install Dependencies */
        if(npmInstall) {
          console.log(`Installing dependencies...`)
          await executeCommand('npm', ['install'], context)
          console.log(chalk.blueBright(`Dependencies install completed.`))
        }

        console.log(`Running completion hooks...`)

        if(hasGit()) {
          await run(`git add -A`)
          await run(`git commit -m 'init'`)
        }

        console.log(chalk.greenBright(`\nAll done!!!\n`))
      }
    })
  }
}
