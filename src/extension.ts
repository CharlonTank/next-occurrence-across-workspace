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

	// Helper function to find all occurrences and return them
	async function findAllOccurrencesInWorkspace(text: string): Promise<OccurrenceLocation[]> {
		// Show status while searching
		statusBarItem.text = `$(search) Searching for "${text}"...`;
		statusBarItem.show();
		
		const results: OccurrenceLocation[] = [];
		
		// Escape special regex characters
		const escapedText = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		
		try {
			// Find all occurrences using the search API
			const files = await vscode.workspace.findFiles('**/*', '**/{node_modules,dist,out}/**');
			
			// Process each file
			for (const fileUri of files) {
				try {
					const document = await vscode.workspace.openTextDocument(fileUri);
					const content = document.getText();
					const regex = new RegExp(escapedText, 'gi'); // Using 'i' flag for case-insensitive matching
					
					let match;
					while ((match = regex.exec(content)) !== null) {
						const startPos = document.positionAt(match.index);
						const endPos = document.positionAt(match.index + match[0].length);
						const range = new vscode.Range(startPos, endPos);
						
						results.push({
							uri: fileUri,
							range: range
						});
					}
				} catch (error) {
					// Skip files that can't be read
					continue;
				}
			}
			
			if (results.length === 0) {
				statusBarItem.text = `$(error) No matches found for "${text}"`;
				setTimeout(() => statusBarItem.hide(), 3000);
			} else {
				statusBarItem.text = `$(search) Found ${results.length} matches for "${text}"`;
			}
			
			return results;
		} catch (error) {
			statusBarItem.text = `$(error) Error searching for "${text}"`;
			console.error(error);
			setTimeout(() => statusBarItem.hide(), 3000);
			throw error;
		}
	}

	// Helper function to navigate to a specific occurrence
	async function navigateToOccurrence(occurrence: OccurrenceLocation) {
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
	}

	// Register command for finding the next occurrence
	const nextDisposable = vscode.commands.registerCommand('next-occurence-across-workspace.findNextOccurrence', async () => {
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
			
			try {
				// Find all occurrences in the workspace
				occurrences = await findAllOccurrencesInWorkspace(searchText);
				
				if (occurrences.length === 0) {
					return; // Error message already shown in findAllOccurrencesInWorkspace
				}
			} catch (error) {
				return; // Error already handled in findAllOccurrencesInWorkspace
			}
		}
		
		if (occurrences.length === 0) {
			return; // No occurrences found
		}
		
		// Move to the next occurrence
		currentIndex = (currentIndex + 1) % occurrences.length;
		const occurrence = occurrences[currentIndex];
		
		// Update status
		statusBarItem.text = `$(search) Match ${currentIndex + 1}/${occurrences.length} for "${searchText}"`;
		
		// Navigate to the occurrence
		await navigateToOccurrence(occurrence);
	});

	// Register command for finding the previous occurrence
	const prevDisposable = vscode.commands.registerCommand('next-occurence-across-workspace.findPreviousOccurrence', async () => {
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
			
			try {
				// Find all occurrences in the workspace
				occurrences = await findAllOccurrencesInWorkspace(searchText);
				
				if (occurrences.length === 0) {
					return; // Error message already shown in findAllOccurrencesInWorkspace
				}
				
				// For previous, start at the end
				currentIndex = occurrences.length - 1;
			} catch (error) {
				return; // Error already handled in findAllOccurrencesInWorkspace
			}
		} else if (occurrences.length === 0) {
			return; // No occurrences found
		} else {
			// Move to the previous occurrence
			currentIndex = (currentIndex - 1 + occurrences.length) % occurrences.length;
		}
		
		const occurrence = occurrences[currentIndex];
		
		// Update status
		statusBarItem.text = `$(search) Match ${currentIndex + 1}/${occurrences.length} for "${searchText}"`;
		
		// Navigate to the occurrence
		await navigateToOccurrence(occurrence);
	});

	context.subscriptions.push(nextDisposable, prevDisposable);
	context.subscriptions.push(statusBarItem);
}

// This method is called when your extension is deactivated
export function deactivate() {}
