# Alfred Atom Workflow

Simple workflow that allows you to browse and open [Atom](https://atom.io/) projects.

## Requirements

- NodeJS 8+
- [Atom Project Manager package](https://atom.io/packages/project-manager)
- Alfred 4 with paid [Alfred Powerpack](https://www.alfredapp.com/powerpack)

## Installation

### NPM (preferred)

This workflow can be installed with NPM, as an added bonus you'll get a notification when an update is available!

```shell
npm install -g alfred-atom
```

### Packal / GitHub

Because some dependencies are quite big you have to run `npm install` yourself after installing the workflow. Please follow these steps:

1. Download the latest `Atom.alfredworkflow` from [Packal](http://www.packal.org/workflow/atom) or [GitHub](https://github.com/Cloudstek/alfred-atom/releases) and import it in Alfred.
2. Open Alfred and go to Workflows. Right-click on Atom and click on *"Open in Terminal"*
3. In the terminal, enter `npm install`

## Usage

Simply type `atom` followed by space to list all projects. Optionally type a search string to filter results.

![alfred-atom](screenshot.png)

## Troubleshooting

> No projects are listed by the `atom` command

You most likely have an invalid `projects.cson` file. Some edge cases may be handled by the Atom Project Manager package but not handled in Alfred Atom Workflow. Check that the format matches https://github.com/danielbrodin/atom-project-manager#example.

Also check out the debug output, see the [Using the Workflow Debugger](https://www.alfredapp.com/help/workflows/advanced/debugger/) section of the Alfred documentation.

