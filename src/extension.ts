// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface OccurrenceLocation {
	uri: vscode.Uri;
	range: vscode.Range;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "next-occurence-across-workspace" is now active');

	// Create a status bar item to show the current search status
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(statusBarItem);

	// Keep track of the current search
	let occurrences: OccurrenceLocation[] = [];
	let currentIndex = -1;
	let searchText = '';

	const disposable = vscode.commands.registerCommand('next-occurence-across-workspace.findNextOccurrence', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showInformationMessage('No text selected');
			return;
		}

		// Get the selected text
		const newSearchText = editor.document.getText(selection);
		
		// If the search text has changed, reset the search
		if (newSearchText !== searchText) {
			searchText = newSearchText;
			currentIndex = -1;
			occurrences = [];
			
			// Show status while searching
			statusBarItem.text = `$(search) Searching for "${searchText}"...`;
			statusBarItem.show();
			
			// Find all occurrences in the workspace
			try {
				await findAllOccurrences(searchText, occurrences);
				
				if (occurrences.length === 0) {
					statusBarItem.text = `$(error) No matches found for "${searchText}"`;
					setTimeout(() => statusBarItem.hide(), 3000);
					return;
				}
				
				statusBarItem.text = `$(search) Found ${occurrences.length} matches for "${searchText}"`;
			} catch (error) {
				statusBarItem.text = `$(error) Error searching for "${searchText}"`;
				console.error(error);
				setTimeout(() => statusBarItem.hide(), 3000);
				return;
			}
		}
		
		// Move to the next occurrence
		currentIndex = (currentIndex + 1) % occurrences.length;
		const occurrence = occurrences[currentIndex];
		
		// Update status
		statusBarItem.text = `$(search) Match ${currentIndex + 1}/${occurrences.length} for "${searchText}"`;
		
		// Open the document and show the occurrence
		try {
			const document = await vscode.workspace.openTextDocument(occurrence.uri);
			const editor = await vscode.window.showTextDocument(document);
			
			// Select the occurrence
			editor.selection = new vscode.Selection(
				occurrence.range.start,
				occurrence.range.end
			);
			
			// Scroll to the occurrence
			editor.revealRange(occurrence.range, vscode.TextEditorRevealType.InCenter);
		} catch (error) {
			console.error('Error opening document:', error);
		}
	});

	context.subscriptions.push(disposable);
}

// Find all occurrences of the search text in the workspace
async function findAllOccurrences(searchText: string, occurrences: OccurrenceLocation[]): Promise<void> {
	// Escape special regex characters
	const escapedText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	
	// Find all occurrences using the search API
	const results = await vscode.workspace.findFiles('**/*', '**/{node_modules,dist,out}/**');
	
	// Process each file
	for (const fileUri of results) {
		try {
			const document = await vscode.workspace.openTextDocument(fileUri);
			const text = document.getText();
			const regex = new RegExp(escapedText, 'g');
			
			let match;
			while ((match = regex.exec(text)) !== null) {
				const startPos = document.positionAt(match.index);
				const endPos = document.positionAt(match.index + match[0].length);
				const range = new vscode.Range(startPos, endPos);
				
				occurrences.push({
					uri: fileUri,
					range: range
				});
			}
		} catch (error) {
			// Skip files that can't be read
			continue;
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
