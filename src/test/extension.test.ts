import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Next Occurrence Across Workspace Tests', () => {
	// Basic test for extension activation
	test('Extension should be present and activated', async function() {
		this.timeout(10000); // Increase timeout for activation
		
		// Get the extension
		const extension = vscode.extensions.getExtension('charlontank.next-occurence-across-workspace');
		assert.ok(extension, 'Extension should be present');
		
		// Ensure extension is activated
		if (!extension.isActive) {
			await extension.activate();
		}
		
		assert.ok(extension.isActive, 'Extension should be activated');
	});
});
