const fs = require('fs-extra')
const path = require('path')
const validateProjectName = require('validate-npm-package-name')
const inquirer = require('inquirer')
const chalk = require('chalk')

const {clearConsole} = require('./utils')
const templateContents = require('./lib/create/templateContents')
const Creator = require('./lib/create/Creator')

async function create(projectName, options) {
  // Get Node.js working directory
  const cwd = process.cwd()

  // See if is create in current directoy
  const inCurrent = projectName === '.'

  // If create in current directory, get the folder name.
  const name = inCurrent ? path.relative('../', cwd) : projectName

  // Get absolute path for the project
  let targetDir
  if (process.env.NODE_ENV === 'development') {
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

  /* Template choosing */
  await clearConsole()
  const {template} = await inquirer.prompt([
    {
      name: 'template',
      type: 'list',
      message: `Choose a template:`,
      choices: getTemplateChoices()
    }
  ])
  if (!template) {
    return
  }

  options.usingTemplate = templateContents.filter(n => n.name.toLowerCase() === template)[0]

  /* Target directory handler */
  if (fs.existsSync(targetDir)) {
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

function getTemplateChoices() {
  const contents = templateContents.map(n => {
    return {
      name: `${n.name} (${n.description})`,
      value: n.name.toLowerCase()
    }
  })
  return contents.concat({name: 'Cancel', value: ''})
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    console.log(chalk.red(err))
    process.exit(1)
  })
}
