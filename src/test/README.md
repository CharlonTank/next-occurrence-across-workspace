# Testing Next Occurrence Across Workspace Extension

This directory contains tests for the Next Occurrence Across Workspace VS Code extension.

## Tests Included

1. **Extension Activation Test**: Verifies that the extension is present and can be activated.

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

## Future Test Improvements

More comprehensive tests could be added in the future to test:

1. Command registration
2. Case-insensitive search functionality 
3. Navigation between occurrences
4. Status bar updates

These would require setting up a proper test workspace with sample files. 