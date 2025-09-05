/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect } from './fixtures';

test.describe('Multi-browser support via programmatic API', () => {
  test('can create and manage multiple browser connections', async ({ server }) => {
    const { createMultiBrowserManager } = require('../index');
    
    // Create manager
    const manager = await createMultiBrowserManager();
    
    // Verify default browser exists
    const browsers = manager.listBrowsers();
    expect(browsers).toContain('default');
    
    // Create a second browser
    await manager.createBrowser('secondary');
    
    // Verify both browsers exist
    const updatedBrowsers = manager.listBrowsers();
    expect(updatedBrowsers).toHaveLength(2);
    expect(updatedBrowsers).toContain('default');
    expect(updatedBrowsers).toContain('secondary');
    
    // Get different browser connections
    const defaultBrowser = manager.getBrowser('default');
    const secondaryBrowser = manager.getBrowser('secondary');
    
    expect(defaultBrowser).toBeDefined();
    expect(secondaryBrowser).toBeDefined();
    expect(defaultBrowser).not.toBe(secondaryBrowser);
    
    // Clean up
    await manager.closeBrowser('secondary');
    await manager.closeAll();
  });

  test('browsers can navigate independently', async ({ server }) => {
    const { createMultiBrowserManager } = require('../index');
    
    const manager = await createMultiBrowserManager();
    await manager.createBrowser('browser2');
    
    const browser1 = manager.getBrowser('default');
    const browser2 = manager.getBrowser('browser2');
    
    // Navigate browser1 to hello world
    const nav1Response = await browser1.callTool({
      name: 'browser_navigate',
      arguments: { url: server.HELLO_WORLD },
    });
    
    expect(nav1Response).toBeDefined();
    expect(nav1Response.isError).toBeFalsy();
    
    // Navigate browser2 to empty page
    const nav2Response = await browser2.callTool({
      name: 'browser_navigate',
      arguments: { url: server.EMPTY_PAGE },
    });
    
    expect(nav2Response).toBeDefined();
    expect(nav2Response.isError).toBeFalsy();
    
    // Take snapshots of both browsers to verify they're on different pages
    const snapshot1 = await browser1.callTool({
      name: 'browser_snapshot',
      arguments: {},
    });
    
    const snapshot2 = await browser2.callTool({
      name: 'browser_snapshot',
      arguments: {},
    });
    
    // Snapshots should be different since browsers are on different pages
    expect(snapshot1.content[0].text).not.toEqual(snapshot2.content[0].text);
    
    await manager.closeAll();
  });

  test('can close individual browsers', async ({ server }) => {
    const { createMultiBrowserManager } = require('../index');
    
    const manager = await createMultiBrowserManager();
    await manager.createBrowser('temp');
    
    expect(manager.listBrowsers()).toContain('temp');
    
    // Close the temp browser
    await manager.closeBrowser('temp');
    
    expect(manager.listBrowsers()).not.toContain('temp');
    expect(manager.listBrowsers()).toContain('default'); // Default should still exist
    
    await manager.closeAll();
  });

  test('cannot close default browser', async ({ server }) => {
    const { createMultiBrowserManager } = require('../index');
    
    const manager = await createMultiBrowserManager();
    
    // Try to close default browser - should throw
    await expect(manager.closeBrowser('default')).rejects.toThrow('Cannot close the default browser instance');
    
    await manager.closeAll();
  });

  test('error handling for non-existent browsers', async ({ server }) => {
    const { createMultiBrowserManager } = require('../index');
    
    const manager = await createMultiBrowserManager();
    
    // Try to get non-existent browser
    expect(() => manager.getBrowser('non-existent')).toThrow('Browser "non-existent" not found');
    
    // Try to close non-existent browser
    await expect(manager.closeBrowser('non-existent')).rejects.toThrow('Browser "non-existent" not found');
    
    await manager.closeAll();
  });

  test('cannot create browser with duplicate ID', async ({ server }) => {
    const { createMultiBrowserManager } = require('../index');
    
    const manager = await createMultiBrowserManager();
    await manager.createBrowser('test-browser');
    
    // Try to create another browser with same ID
    await expect(manager.createBrowser('test-browser')).rejects.toThrow('Browser "test-browser" already exists');
    
    await manager.closeAll();
  });
});