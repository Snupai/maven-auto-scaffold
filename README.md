# Maven Auto Scaffold

VS Code extension that automatically creates the Maven directory structure when a `pom.xml` is added to a workspace.

## Features

- Watches for new `pom.xml` files in any workspace
- Creates `src/main/java`, `src/main/resources`, `src/test/java`, `src/test/resources`, `target/`
- Reads `groupId` from `pom.xml` and creates the correct package structure
- Generates a Hello World `App.java` with the correct package declaration
- Creates `.vscode/settings.json` for automatic Maven build configuration
- Prompts to reload the window after scaffolding

## Installation

```bash
code --install-extension maven-auto-scaffold-x.x.x.vsix
```

## Build from source

```bash
npm install
npm run compile
npm run package
```
