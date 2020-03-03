module.exports = function generateReadme (name) {
  return [
    `# ${name}\n`,
    '## Get Started',
    `First you must install dependencies which the project need.`,
    '```',
    `npm install`,
    '```',
    'or any other package manager, such as ```yarn```, ```cnpm```.',
    `Then run the serve script.`,
    '```',
    `npm run serve`,
    '```',
    '## Customize configuration',
    'See [Vunt in Github](https://github.com/plrabbit/vunt/blob/master/README.md).',
    ''
  ].join('\n')
}
