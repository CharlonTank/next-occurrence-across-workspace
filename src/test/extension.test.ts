import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Next Occurrence Across Workspace Tests', () => {
	// Basic test for extension activation
	test('Extension should be activated', async function() {
		this.timeout(10000); // Increase timeout for activation
		
		// Get the extension
		const extension = vscode.extensions.getExtension('charlontank.next-occurence-across-workspace');
		assert.ok(extension, 'Extension should be present');
		
		// Ensure extension is activated
		if (!extension.isActive) {
			await extension.activate();
		}
		
		assert.ok(extension.isActive, 'Extension should be activated');
		
		// Verify command registration
		const commands = await vscode.commands.getCommands();
		assert.ok(
			commands.includes('next-occurence-across-workspace.findNextOccurrence'),
			'Next occurrence command should be registered'
		);
		assert.ok(
			commands.includes('next-occurence-across-workspace.findPreviousOccurrence'),
			'Previous occurrence command should be registered'
		);
	});
	
	// Test case-insensitive search by examining the regex in the code
	test('Extension uses case-insensitive features', function() {
		// Read the extension.ts file
		const extensionPath = path.join(__dirname, '..', '..', 'src', 'extension.ts');
		const extensionContent = fs.readFileSync(extensionPath, 'utf8');
		
		// Check for case-insensitive features
		let hasCaseInsensitiveFeatures = false;
		
		// 1. Check if the regex uses the 'i' flag for case-insensitivity
		const regexPattern = /new RegExp\([^)]+,\s*['"]([^'"]*)['"]\)/g;
		let match;
		let foundCaseInsensitiveRegex = false;
		
		while ((match = regexPattern.exec(extensionContent)) !== null) {
			const flags = match[1];
			if (flags.includes('i')) {
				foundCaseInsensitiveRegex = true;
				break;
			}
		}
		
		assert.ok(foundCaseInsensitiveRegex, 'Extension should use case-insensitive regex flag');
		
		// 2. Check if comparison for search text change uses toLowerCase()
		const searchTextChangePattern = /newSearchText\.toLowerCase\(\)\s*!==\s*searchText\.toLowerCase\(\)/;
		const foundCaseInsensitiveComparison = searchTextChangePattern.test(extensionContent);
		
		assert.ok(foundCaseInsensitiveComparison, 'Extension should use case-insensitive comparison for search text changes');
	});
});
