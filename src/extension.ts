import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const MAVEN_DIRS = [
  'src/main/java',
  'src/main/resources',
  'src/test/java',
  'src/test/resources',
  'target',
];

function parseGroupId(pomPath: string): string | null {
  const content = fs.readFileSync(pomPath, 'utf-8');
  // Match top-level groupId (not inside <parent> or <dependency>)
  const match = content.match(/<groupId>([^<]+)<\/groupId>/);
  return match ? match[1].trim() : null;
}

function scaffoldMaven(pomUri: vscode.Uri) {
  const dir = path.dirname(pomUri.fsPath);

  // Don't scaffold if src/ already exists
  if (fs.existsSync(path.join(dir, 'src'))) {
    return;
  }

  const groupId = parseGroupId(pomUri.fsPath);
  const packagePath = groupId ? groupId.replace(/\./g, path.sep) : '';

  for (const d of MAVEN_DIRS) {
    const full = d.endsWith('java') && packagePath
      ? path.join(dir, d, packagePath)
      : path.join(dir, d);
    fs.mkdirSync(full, { recursive: true });
  }

  // Create Hello World in correct package
  const javaDir = packagePath
    ? path.join(dir, 'src/main/java', packagePath)
    : path.join(dir, 'src/main/java');
  const helloPath = path.join(javaDir, 'App.java');

  if (!fs.existsSync(helloPath)) {
    const lines: string[] = [];
    if (groupId) {
      lines.push(`package ${groupId};`, '');
    }
    lines.push(
      'public class App {',
      '    public static void main(String[] args) {',
      '        System.out.println("Hello, World!");',
      '    }',
      '}',
      '',
    );
    fs.writeFileSync(helloPath, lines.join('\n'));
  }

  // Create .vscode/settings.json to force Maven as build tool
  const vscodeDir = path.join(dir, '.vscode');
  const settingsPath = path.join(vscodeDir, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify({
      "java.configuration.updateBuildConfiguration": "automatic",
    }, null, 2) + '\n');
  }

  vscode.window.showInformationMessage(
    `Maven-Struktur erstellt in ${path.basename(dir) || dir}. Fenster neu laden?`,
    'Reload'
  ).then((choice) => {
    if (choice === 'Reload') {
      vscode.commands.executeCommand('java.clean.workspace').then(() => {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      }, () => {
        // java extension not installed, just reload
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      });
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  // Watch for new pom.xml files
  const watcher = vscode.workspace.createFileSystemWatcher('**/pom.xml');

  watcher.onDidCreate((uri) => scaffoldMaven(uri));

  // Also check existing pom.xml files on activation
  vscode.workspace.findFiles('**/pom.xml').then((files) => {
    for (const f of files) {
      scaffoldMaven(f);
    }
  });

  context.subscriptions.push(watcher);
}

export function deactivate() {}
