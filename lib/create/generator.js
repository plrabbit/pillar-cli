const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const chalk = require('chalk')

function bufferCompatible(contents) {
  if (Buffer.from && Buffer.from !== Uint8Array.from) {
    return Buffer.from(contents)
  } else {
    if (typeof contents === 'string') {
      throw new Error('The "contents" argument must be not of type string.')
    }
    return new Buffer(contents)
  }
}

module.exports = function (metadata = {}, source, destination = '.') {
  if (!source) {
    return Promise.reject(new Error(`Invalid source：${source}`))
  }

  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(source)
      .destination(destination)
      .use((files, metalsmith, done) => {
        Object.keys(files).forEach(fileName => {
          if (fileName === 'package.json') {
            const fileContentsString = files[fileName].contents.toString()
            files[fileName].contents = bufferCompatible(Handlebars.compile(fileContentsString)(metalsmith.metadata()))
          }
        })
        done()
      }).build(err => {
      if (err) {
        console.log(chalk.red(`Metalsmith build error: ${err}`))
        return reject(err)
      } else {
        return resolve()
      }
    })
  })
}
