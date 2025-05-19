# Next Occurrence Across Workspace

This VS Code extension allows you to quickly navigate to the next occurrence of selected text across your entire workspace. It works similar to the "Find Next" functionality (Cmd+G on Mac, F3 on Windows/Linux) but extends it to work across multiple files.

## Features

- Jump to the next occurrence of selected text across your entire workspace
- Shows the current match number and total matches in the status bar
- Continues from the first occurrence when reaching the end of all occurrences

## How to Use

1. Select a piece of text in the editor
2. Press `Alt+F` (configurable in settings)
3. The extension will find all occurrences of the selected text across your workspace
4. Keep pressing `Alt+F` to navigate through all occurrences
5. When you reach the last occurrence, it will cycle back to the first one

## Requirements

- VS Code 1.60.0 or higher

## Extension Settings

This extension contributes the following settings:

* `next-occurence-across-workspace.findNextOccurrence`: Find the next occurrence of the selected text across the workspace

## Keybindings

By default, the extension uses `Alt+F` to navigate to the next occurrence. You can customize this in your keybindings.json file:

```json
{
  "key": "alt+f", // Change this to your preferred shortcut
  "command": "next-occurence-across-workspace.findNextOccurrence",
  "when": "editorTextFocus"
}
```

## Known Issues

- Binary files and large files might be skipped to improve performance
- The search may take longer in large workspaces with many files

## Release Notes

### 0.0.1

- Initial release of Next Occurrence Across Workspace
- Basic functionality to navigate through occurrences across files

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
