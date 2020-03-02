/**
 * Creator.js
 * Main function of create script
 */

const fs = require('fs-extra')
const rm = require('rimraf').sync
const execa = require('execa')
const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')

const generator = require('./generator')

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
    if (fs.existsSync('.tmp')) {
      rm('.tmp')
    }
    let spinner = ora(`Downloading vunt-template`)
    spinner.start()
    download('github:plrabbit/vunt', './.tmp', {}, async err => {
      spinner.stop()
      if (err) console.log('Failed to download vunt-template. ' + chalk.redBright(err.message.trim()))
      else {
        console.log(chalk.yellow(`Download completed.`))

        /* Write Template files */
        await generator({ projectName: this.name }, './.tmp', this.name)
        console.log(chalk.yellow(`Generate completed.`))

        /* Git Initiation */
        // spinner = ora(`Initializing git repository...`)
        // spinner.start()
        // await this.run('git init')
        console.log(chalk.greenBright(`\nAll done!!!\n`))
      }
    })
  }
}
