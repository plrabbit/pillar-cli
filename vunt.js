const program = require('commander')
const chalk = require('chalk')
const minimist = require('minimist')

const enhanceErrorMessages = require('./enhanceErrorMessages')

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

program
  .command('create <project-name>')
  .description('create a new project with vunt-template')
  .action(name => {
    console.log(name)
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }

    require('./create')(name)
  })

program.commands.forEach(c => c.on('--help', () => console.log()))

program.parse(process.argv)
if (program.args.length < 1) return program.help()
