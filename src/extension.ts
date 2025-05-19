// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

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

	// Create a settings status bar button
	const settingsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
	settingsStatusBarItem.text = "$(gear)";
	settingsStatusBarItem.tooltip = "Next Occurrence Across Workspace Settings";
	settingsStatusBarItem.command = "next-occurence-across-workspace.openSettings";
	settingsStatusBarItem.show();
	context.subscriptions.push(settingsStatusBarItem);

	// Keep track of the current search
	let occurrences: OccurrenceLocation[] = [];
	let currentIndex = -1;
	let searchText = '';

	// Helper function to check if a file should be ignored based on gitignore
	async function shouldIgnoreFile(filePath: string, workspaceFolder: string): Promise<boolean> {
		try {
			const gitignorePath = path.join(workspaceFolder, '.gitignore');
			if (!fs.existsSync(gitignorePath)) {
				return false;
			}
			
			const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
			const gitignorePatterns = gitignoreContent
				.split('\n')
				.filter(line => line.trim() && !line.startsWith('#'))
				.map(line => line.trim());
			
			// Get relative path to check against gitignore patterns
			const relativePath = path.relative(workspaceFolder, filePath);
			
			for (const pattern of gitignorePatterns) {
				// Very basic pattern matching - could be improved for complex patterns
				if (pattern.endsWith('/')) {
					// Directory pattern
					const dirPattern = pattern.slice(0, -1);
					if (relativePath.startsWith(dirPattern + path.sep) || 
					    relativePath === dirPattern) {
						return true;
					}
				} else if (pattern.includes('*')) {
					// Wildcard pattern
					const regexPattern = pattern
						.replace(/\./g, '\\.')
						.replace(/\*/g, '.*')
						.replace(/\?/g, '.');
					
					const regex = new RegExp(`^${regexPattern}$`);
					if (regex.test(relativePath) || 
					    regex.test(path.basename(relativePath))) {
						return true;
					}
				} else {
					// Exact match or path prefix
					if (relativePath === pattern || 
					    relativePath.startsWith(pattern + path.sep) || 
					    path.basename(relativePath) === pattern) {
						return true;
					}
				}
			}
			
			return false;
		} catch (error) {
			console.error('Error checking gitignore:', error);
			return false;
		}
	}

	// Helper function to find all occurrences and return them
	async function findAllOccurrencesInWorkspace(text: string): Promise<OccurrenceLocation[]> {
		// Show status while searching
		statusBarItem.text = `$(search) Searching for "${text}"...`;
		statusBarItem.show();
		
		const results: OccurrenceLocation[] = [];
		
		// Escape special regex characters
		const escapedText = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		
		try {
			// Get configuration settings
			const config = vscode.workspace.getConfiguration('nextOccurenceAcrossWorkspace');
			
			// Get exclude patterns as a simple array
			const excludePatterns = config.get<string[]>('excludePatterns', []);
			
			const includeHiddenFiles = config.get<boolean>('includeHiddenFiles', false);
			const respectGitignore = config.get<boolean>('respectGitignore', true);
			
			// Create the exclude pattern string
			const excludePattern = `{${excludePatterns.join(',')}}`;
			
			// Define include pattern based on whether to include hidden files
			let includePattern = '**/*';
			if (!includeHiddenFiles) {
				// Exclude files and folders starting with a dot
				includePattern = '**/*[^.]?*';
			}
			
			// Get workspace folders
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				throw new Error('No workspace folders found');
			}
			
			// Use VS Code's built-in search functionality
			const files = await vscode.workspace.findFiles(
				includePattern,
				excludePattern,
				undefined
			);
			
			// Filter files based on gitignore if needed
			let filteredFiles = files;
			if (respectGitignore) {
				filteredFiles = [];
				
				for (const fileUri of files) {
					const filePath = fileUri.fsPath;
					let shouldInclude = true;
					
					// Check against each workspace folder's gitignore
					for (const folder of workspaceFolders) {
						if (filePath.startsWith(folder.uri.fsPath) && 
						    await shouldIgnoreFile(filePath, folder.uri.fsPath)) {
							shouldInclude = false;
							break;
						}
					}
					
					if (shouldInclude) {
						filteredFiles.push(fileUri);
					}
				}
			}
			
			// Process each file
			for (const fileUri of filteredFiles) {
				try {
					const document = await vscode.workspace.openTextDocument(fileUri);
					const content = document.getText();
					
					// Use case-insensitive search
					const regex = new RegExp(escapedText, 'gi');
					
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
				const excludeCount = excludePatterns.length;
				const gitignoreMsg = respectGitignore ? ", respecting .gitignore" : "";
				const filesSearched = filteredFiles.length;
				const filesExcluded = files.length - filteredFiles.length;
				statusBarItem.text = `$(search) Found ${results.length} matches in ${filesSearched} files for "${text}" (${filesExcluded} files excluded by .gitignore, ${excludeCount} patterns excluded${gitignoreMsg})`;
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
		
		// If the search text has changed (case-insensitive comparison), reset the search
		if (newSearchText.toLowerCase() !== searchText.toLowerCase()) {
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
		
		// If the search text has changed (case-insensitive comparison), reset the search
		if (newSearchText.toLowerCase() !== searchText.toLowerCase()) {
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

	// Register command to open settings
	const settingsDisposable = vscode.commands.registerCommand('next-occurence-across-workspace.openSettings', () => {
		// Open the settings UI focused on this extension's settings
		vscode.commands.executeCommand('workbench.action.openSettings', 'nextOccurenceAcrossWorkspace');
	});

	context.subscriptions.push(nextDisposable, prevDisposable, settingsDisposable);
	context.subscriptions.push(statusBarItem);
}

// This method is called when your extension is deactivated
export function deactivate() {}
