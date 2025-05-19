# Testing Next Occurrence Across Workspace Extension

This directory contains tests for the Next Occurrence Across Workspace VS Code extension.

## Tests Included

1. **Extension Activation Test**: Verifies that the extension activates properly.
2. **Command Registration Test**: Checks that the extension registers its commands.
3. **Case-insensitive Search Test**: Tests that the extension properly finds occurrences of text regardless of case.

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

The tests create a temporary workspace with sample files containing text in different cases. The test then selects a word and uses the extension's commands to find occurrences, verifying that case-insensitive search works properly.

## Adding New Tests

When adding new tests:

1. Add the test in `extension.test.ts`
2. Make sure to clean up any resources in the `suiteTeardown` function
3. Run the tests to verify they pass

## Notes

- Tests may need to increase timeout values for long-running operations
- Some tests create temporary files that are cleaned up after tests run 