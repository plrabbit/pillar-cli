#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const minimist = require('minimist')

program.version(`vunt-cli v${require('./package').version}`)

program
  .command('create <project-name>')
  .description('create a new project')
  .option('-e, --no-depend', 'Skip dependencies installation')
  .option('-n, --no-git', 'Skip git initialization')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }

    require('./create')(name, options)
  })

program.commands.forEach(c => c.on('--help', () => console.log()))

const {enhanceErrorMessages} = require('./utils')

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

program.parse(process.argv)
if (program.args.length < 1) return program.help()

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/(^--no-)|(^--)/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
