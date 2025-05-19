import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Next Occurrence Across Workspace Tests', () => {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-test-'));
	let testFiles: string[] = [];

	// Setup test workspace with sample files
	suiteSetup(async () => {
		// Create test files with various text content for testing
		const file1Path = path.join(tmpDir, 'test1.txt');
		const file2Path = path.join(tmpDir, 'test2.txt');
		
		// Create files with mixed case content
		fs.writeFileSync(file1Path, 'This is a TEST file with mixed CASE content.\nIt has multiple lines with different Text cases.');
		fs.writeFileSync(file2Path, 'Another test FILE with different case patterns.\ntest TEST Test tEsT teXt.');
		
		testFiles = [file1Path, file2Path];
		
		// Open the test workspace folder
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(tmpDir));
		
		// Wait for the extension to activate
		await new Promise(resolve => setTimeout(resolve, 1000));
	});

	// Clean up test files after tests
	suiteTeardown(async () => {
		for (const file of testFiles) {
			if (fs.existsSync(file)) {
				fs.unlinkSync(file);
			}
		}
		
		// Close the workspace
		await vscode.commands.executeCommand('workbench.action.closeFolder');
	});

	test('Extension should be activated', async () => {
		const extension = vscode.extensions.getExtension('charlontank.next-occurence-across-workspace');
		assert.ok(extension);
		assert.strictEqual(extension?.isActive, true, 'Extension should be activated');
	});

	test('Extension registers commands', async () => {
		const commands = await vscode.commands.getCommands();
		assert.ok(commands.includes('next-occurence-across-workspace.findNextOccurrence'), 'findNextOccurrence command should be registered');
		assert.ok(commands.includes('next-occurence-across-workspace.findPreviousOccurrence'), 'findPreviousOccurrence command should be registered');
	});

	// Testing case-insensitive search functionality
	test('Case-insensitive search across workspace', async function() {
		this.timeout(10000); // Increase timeout for this test

		// Open the first test file
		const document = await vscode.workspace.openTextDocument(testFiles[0]);
		const editor = await vscode.window.showTextDocument(document);
		
		// Select the word "test" in lowercase
		const position = new vscode.Position(0, 10); // Position of "test" in the file
		editor.selection = new vscode.Selection(position, position.translate(0, 4));
		
		// Execute the find next occurrence command
		await vscode.commands.executeCommand('next-occurence-across-workspace.findNextOccurrence');
		
		// Allow time for the command to execute and results to be gathered
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// The selection should now be on "TEST" (uppercase) since we're doing case-insensitive search
		const selection = editor.selection;
		const selectedText = document.getText(selection);
		
		// Check that the selection is on a different case version of "test"
		assert.notStrictEqual(selectedText.toLowerCase(), selectedText, 
			'Selection should find different casing of the same word');
		assert.strictEqual(selectedText.toLowerCase(), 'test', 
			'Selected text should be a case variant of "test"');
	});
});
