module.exports = function generateReadme(name, template) {
  return [
    `# ${name}\n`,
    '## Get Started',
    'First, install dependencies which the project need. You may use ```npm``` or any other package manager, such as ```yarn```, ```cnpm```.',
    '```',
    `npm install`,
    '```',
    `Then run the serve script.`,
    '```',
    `npm run serve`,
    '```',
    '## Customize Configuration',
    `See [${template.name}](${template.href}#readme)`,
    ''
  ].join('\n')
}
