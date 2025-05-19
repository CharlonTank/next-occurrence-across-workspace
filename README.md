# 🔍 Next Occurrence Across Workspace

[![Version](https://img.shields.io/visual-studio-marketplace/v/charlontank.next-occurence-across-workspace)](https://marketplace.visualstudio.com/items?itemName=charlontank.next-occurence-across-workspace)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/charlontank.next-occurence-across-workspace)](https://marketplace.visualstudio.com/items?itemName=charlontank.next-occurence-across-workspace)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/charlontank.next-occurence-across-workspace)](https://marketplace.visualstudio.com/items?itemName=charlontank.next-occurence-across-workspace&ssr=false#review-details)
[![License](https://img.shields.io/github/license/CharlonTank/next-occurrence-across-workspace)](https://github.com/CharlonTank/next-occurrence-across-workspace/blob/master/LICENSE)

> 🚀 **Quickly navigate through all occurrences of selected text across your entire workspace**

Ever wanted to jump between all instances of a variable, function, or text pattern across your entire project? This extension makes it simple and fast!

## ✨ Features

- 🔎 Jump to the **next occurrence** of selected text with `Alt+F`
- 🔍 Jump to the **previous occurrence** with `Alt+Shift+F`
- 📊 See match statistics in the status bar (e.g., "Match 3/12 for 'myFunction'")
- 🔄 Cycle through occurrences automatically - when you reach the end, it loops back to the beginning

## 📋 How to Use

1. **Select** any text in your editor

   ```js
   const myVariable = "Hello World";
   ```

2. Press `Alt+F` to find the next occurrence or `Alt+Shift+F` for the previous one

3. The extension will:
   - Find all matching occurrences across your entire workspace
   - Show a status indicator with the total number of matches
   - Navigate to the next/previous occurrence

4. Keep pressing the shortcuts to navigate through all matches

## 🛠️ Requirements

- VS Code 1.95.0 or higher

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Find next occurrence | `Alt+F` |
| Find previous occurrence | `Alt+Shift+F` |

You can customize these in your keybindings.json file:

```json
[
  {
    "key": "alt+f",
    "command": "next-occurence-across-workspace.findNextOccurrence",
    "when": "editorTextFocus"
  },
  {
    "key": "alt+shift+f",
    "command": "next-occurence-across-workspace.findPreviousOccurrence",
    "when": "editorTextFocus"
  }
]
```

## 💡 Tips

- Works seamlessly with code, comments, strings, and any text content
- Great for refactoring when you need to check all instances of a function or variable
- Use it to navigate through code patterns or repeated text

## ⚠️ Known Issues

- Binary files and large files might be skipped to improve performance
- The search may take longer in large workspaces with many files

## 📝 Release Notes

### 0.0.6

- 🐛 Fixed functionality issues with both next and previous occurrence navigation
- 🔄 Improved search and occurrence tracking
- 🎨 Added extension logo

---

**Enjoy!** 💻 If you find this extension helpful, please consider leaving a review or star on [GitHub](https://github.com/CharlonTank/next-occurrence-across-workspace).

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)
