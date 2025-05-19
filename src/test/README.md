# Testing Next Occurrence Across Workspace Extension

This directory contains tests for the Next Occurrence Across Workspace VS Code extension.

## Tests Included

1. **Extension Activation Test**: Verifies that the extension is present and can be activated.
2. **Case-insensitive Search Test**: Tests that the extension uses case-insensitive features for searching.

## Running Tests

To run all tests, use the following command from the root of the project:

```bash
npm run test:all
```

This will compile the extension, compile the tests, and run all tests.

If you just want to run the tests without recompiling:

```bash
npm run test
```

## Test Structure

The tests are structured as follows:

### Activation Test

This test verifies that:
- The extension is present in VS Code
- The extension can be activated
- The required commands are registered

### Case-insensitive Search Test

This test examines the extension's source code to verify:
- The regular expression used for searching includes the 'i' flag for case-insensitivity
- The comparison for determining if search text has changed uses case-insensitive comparison (toLowerCase)

## Future Test Improvements

The test suite could be expanded to include:

1. Integration tests with actual file operations
2. Testing the "findNextOccurrence" command with real selections
3. Testing the "findPreviousOccurrence" command
4. Testing navigation through multiple occurrences
5. Testing status bar updates
6. Performance testing with larger files 