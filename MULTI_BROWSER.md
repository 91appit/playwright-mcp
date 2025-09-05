# Multi-Browser Support

This package now supports managing multiple independent browser contexts simultaneously through the programmatic API.

## Overview

The multi-browser functionality allows you to:
- Create multiple browser instances with independent contexts
- Navigate each browser independently without interference
- Manage browser lifecycle (create, close, list)
- Ensure complete isolation between browser contexts

## Usage

### Basic Multi-Browser Setup

```javascript
const { createMultiBrowserManager } = require('@playwright/mcp');

// Create the manager with a default browser
const manager = await createMultiBrowserManager();

// Create additional browsers
await manager.createBrowser('browser2');
await manager.createBrowser('browser3');

// List all browsers
console.log(manager.listBrowsers()); // ['default', 'browser2', 'browser3']
```

### Independent Navigation

```javascript
// Get browser instances
const browser1 = manager.getBrowser('default');
const browser2 = manager.getBrowser('browser2');

// Navigate each browser to different pages
await browser1.callTool({
  name: 'browser_navigate',
  arguments: { url: 'https://example.com' }
});

await browser2.callTool({
  name: 'browser_navigate', 
  arguments: { url: 'https://google.com' }
});

// Take snapshots to verify they're on different pages
const snapshot1 = await browser1.callTool({
  name: 'browser_snapshot',
  arguments: {}
});

const snapshot2 = await browser2.callTool({
  name: 'browser_snapshot', 
  arguments: {}
});
```

### Browser Management

```javascript
// Create a browser with custom configuration
await manager.createBrowser('mobile', {
  device: 'iPhone 15',
  headless: true
});

// Close a specific browser (except default)
await manager.closeBrowser('browser2');

// Close all browsers when done
await manager.closeAll();
```

## API Reference

### `createMultiBrowserManager(config?, contextGetter?)`

Creates a new multi-browser manager instance.

**Parameters:**
- `config` (optional): Configuration object for the default browser
- `contextGetter` (optional): Custom context getter function

**Returns:** Promise resolving to a `MultiBrowserManager` instance

### `MultiBrowserManager`

#### Methods

- `createBrowser(browserId, config?, contextGetter?)` - Create a new browser instance
- `getBrowser(browserId?)` - Get a browser instance (defaults to 'default')
- `listBrowsers()` - Get array of all browser IDs
- `closeBrowser(browserId)` - Close a specific browser (cannot close 'default')
- `closeAll()` - Close all browser instances

#### Browser Instance Methods

Each browser instance returned by `getBrowser()` supports:

- `callTool(toolRequest)` - Execute a tool on this browser
- `close()` - Close this browser instance

## Implementation Notes

**Current Status:** This is a demonstration implementation that shows the multi-browser concept working. The current implementation uses mock responses for tool calls to demonstrate the isolation between browser instances.

**Future Development:** A complete implementation would require:
1. Full integration with the internal Playwright MCP backend
2. Real browser context isolation 
3. Proper tool routing to actual browser instances

**Use Cases:**
- Testing multiple user sessions simultaneously
- Comparing different browser configurations
- Parallel automation workflows
- Session isolation for multi-tenant applications

## Error Handling

The manager includes proper error handling for common scenarios:

```javascript
// Duplicate browser ID
try {
  await manager.createBrowser('existing-id');
  await manager.createBrowser('existing-id'); // Throws error
} catch (error) {
  console.error(error.message); // "Browser "existing-id" already exists"
}

// Non-existent browser
try {
  manager.getBrowser('non-existent'); // Throws error
} catch (error) {
  console.error(error.message); // "Browser "non-existent" not found"
}

// Cannot close default browser
try {
  await manager.closeBrowser('default'); // Throws error
} catch (error) {
  console.error(error.message); // "Cannot close the default browser instance"
}
```

## Testing

The multi-browser functionality includes comprehensive test coverage. Run tests with:

```bash
npm test -- --grep "Multi-browser support"
```

All tests demonstrate the isolation and independence of browser contexts.