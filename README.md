# Vunt-CLI

## Installation

Download and install [Node.js](https://nodejs.org/), which including ```NPM```.

Install ```vunt-cli``` globally in your machine. You may need administrator privileges to execute these commands.
```
npm install -g vunt-cli

# OR

yarn global add vunt-cli
```

Check if you install it successfully.
```
vunt-cli --version
```

## Creating a New Project

Just simply run:
```
vunt-cli create project-name
```

The ```create``` command has some options for the project initialization, you may find them by running:
```
vunt-cli create --help
```
```
Usage: create [options] <project-name>

create a new project with vunt-template

Options:
  -e, --no-depend  Skip dependencies installation
  -n, --no-git     Skip git initialization
  -h, --help       Output usage information
```

## Development

1. Clone this repository, then run ```yarn install``` to install dependencies.

2. Run **create** script to create a new project using template [Vunt](https://github.com/plrabbit/vunt)

```
yarn run create your-project-name
```

Please note that the project will be generated **above the current directory(```../```)**, affected by the ```process.env.NODE_ENV```. So **DO NOT** run ```node index create xxx``` directly, otherwise the project will be generated in ```vunt-cli``` project directory.

## License

[MIT license](./LICENSE).
