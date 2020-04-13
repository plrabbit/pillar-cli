# Pillar-CLI

> Scaffolding tool for web app development.

## 📦 Installation

Download and install [Node.js](https://nodejs.org/), which including ```NPM```.

Install ```pillar-cli``` globally in your machine. You may need administrator privileges to execute these commands.
```shell script
npm install -g @plrabbit/cli

# OR

yarn global add @plrabbit/cli
```

Check if you install it successfully.
```shell script
pillar --version
```

## 🆕 Creating a New Project

Just simply run:
```shell script
pillar create project-name
```

The ```create``` command has some options for the project initialization, you may find them by running:
```shell script
pillar create --help
```
```
Usage: create [options] <project-name>

create a new project

Options:
  -e, --no-depend  Skip dependencies installation
  -n, --no-git     Skip git initialization
  -h, --help       Output usage information
```

### Template(s)
name|description
:---:|:---:|
[Vunt](https://github.com/plrabbit/vunt)| Vue 2.x + Ant Design

## ‍💡 Development

1. Clone this repository, then run ```yarn install``` to install dependencies.

2. Run **create** script to create a new project.

> Please note that the project will be generated ```_test-output``` when ```process.env.NODE_ENV === 'development'```.

```shell script
yarn run create your-project-name
```

DO NOT run ```node ./bin create xxx``` directly, otherwise the project will be generated in ```pillar-cli``` project root directory, which will cause some unknown problem.

## ✅ License

[MIT license](./LICENSE).
