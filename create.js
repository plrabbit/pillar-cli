const fs = require('fs-extra')
const path = require('path')
const readline = require('readline')
const validateProjectName = require('validate-npm-package-name')
const inquirer = require('inquirer')
const chalk = require('chalk')

const Creator = require('./lib/create/Creator')

async function clearConsole(title) {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    if (title) {
      console.log(title)
    }
  }
}

async function create(projectName, options) {
  // Get Node.js working directory
  const cwd = process.cwd()

  // See if is create in current directoy
  const inCurrent = projectName === '.'

  // If create in current directory, get the folder name.
  const name = inCurrent ? path.relative('../', cwd) : projectName

  // Get absolute path for the project
  let targetDir
  if(process.env.NODE_ENV === 'development') {
    targetDir = inCurrent ? path.resolve(cwd, '../') : path.resolve(cwd, `../${projectName}`)
  } else {
    targetDir = inCurrent ? path.resolve(cwd, '.') : path.resolve(cwd, projectName)
  }

  const result = validateProjectName(name)

  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    process.exit(1)
  }

  if (fs.existsSync(targetDir)) {
    await clearConsole()

    if (inCurrent) {
      const {ok} = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: `Generate project in current directory?`
        }
      ])
      if (!ok) {
        return
      }
    } else {
      const {action} = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
          choices: [
            {name: 'Overwrite', value: 'overwrite'},
            {name: 'Cancel', value: false}
          ]
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  }

  const creator = new Creator(projectName, targetDir)
  await creator.create(options)

}

module.exports = (...args) => {
  return create(...args).catch(err => {
    console.log(chalk.red(err))
    process.exit(1)
  })
}
