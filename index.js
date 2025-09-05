#!/usr/bin/env node
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

/**
 * Create a standard single-browser connection (existing API)
 */
function createConnection(userConfig = {}, contextGetter) {
  return require('playwright/lib/mcp/index').createConnection(userConfig, contextGetter);
}

/**
 * Simple mock implementation for demonstration purposes.
 * In a real implementation, this would need to connect to actual MCP servers.
 */
class ServerClientWrapper {
  constructor(server, browserId) {
    this._server = server;
    this._browserId = browserId;
    this._mockState = {
      currentUrl: 'about:blank',
      navigationHistory: []
    };
  }

  async listTools() {
    // Mock implementation - return standard browser tools
    return [
      { name: 'browser_navigate', description: 'Navigate to a URL' },
      { name: 'browser_snapshot', description: 'Take a snapshot' },
      { name: 'browser_click', description: 'Click an element' }
    ];
  }

  async callTool(toolRequest) {
    const { name, arguments: args } = toolRequest;
    
    // Mock implementations for demonstration
    switch (name) {
      case 'browser_navigate':
        this._mockState.currentUrl = args.url;
        this._mockState.navigationHistory.push(args.url);
        return {
          content: [{
            type: 'text',
            text: `### Result\nNavigated to ${args.url} in browser "${this._browserId}"\n\n### Ran Playwright code\n\`\`\`js\nawait page.goto('${args.url}');\n\`\`\``
          }],
          isError: false
        };
        
      case 'browser_snapshot':
        return {
          content: [{
            type: 'text',
            text: `### Page state\n- Page URL: ${this._mockState.currentUrl}\n- Browser ID: ${this._browserId}\n- Mock snapshot for isolated browser instance`
          }],
          isError: false
        };
        
      default:
        return {
          content: [{
            type: 'text',
            text: `### Mock Response\nTool ${name} called in browser "${this._browserId}" with args: ${JSON.stringify(args)}`
          }],
          isError: false
        };
    }
  }

  async close() {
    // Mock cleanup
  }
}

/**
 * Simple multi-browser manager that maintains multiple browser connections
 */
class MultiBrowserManager {
  constructor() {
    this._browsers = new Map(); // browserId -> ServerClientWrapper
    this._defaultBrowserId = 'default';
  }

  async initialize(config = {}, contextGetter) {
    // Create the default browser connection
    const defaultServer = await createConnection(config, contextGetter);
    const defaultWrapper = new ServerClientWrapper(defaultServer, this._defaultBrowserId);
    this._browsers.set(this._defaultBrowserId, defaultWrapper);
    return this;
  }

  async createBrowser(browserId, config = {}, contextGetter) {
    if (this._browsers.has(browserId)) {
      throw new Error(`Browser "${browserId}" already exists`);
    }

    const server = await createConnection(config, contextGetter);
    const wrapper = new ServerClientWrapper(server, browserId);
    this._browsers.set(browserId, wrapper);
    return wrapper;
  }

  getBrowser(browserId = this._defaultBrowserId) {
    const browser = this._browsers.get(browserId);
    if (!browser) {
      throw new Error(`Browser "${browserId}" not found`);
    }
    return browser;
  }

  listBrowsers() {
    return Array.from(this._browsers.keys());
  }

  async closeBrowser(browserId) {
    if (browserId === this._defaultBrowserId) {
      throw new Error('Cannot close the default browser instance');
    }

    const browser = this._browsers.get(browserId);
    if (!browser) {
      throw new Error(`Browser "${browserId}" not found`);
    }

    await browser.close();
    this._browsers.delete(browserId);
  }

  async closeAll() {
    for (const [browserId, browser] of this._browsers) {
      await browser.close();
    }
    this._browsers.clear();
  }
}

/**
 * Create a multi-browser manager
 */
async function createMultiBrowserManager(userConfig = {}, contextGetter) {
  const manager = new MultiBrowserManager();
  await manager.initialize(userConfig, contextGetter);
  return manager;
}

class SimpleBrowserContextFactory {
  constructor(contextGetter) {
    this.name = "custom";
    this.description = "Connect to a browser using a custom context getter";
    this._contextGetter = contextGetter;
  }
  async createContext() {
    const browserContext = await this._contextGetter();
    return {
      browserContext,
      close: () => browserContext.close()
    };
  }
}

module.exports = { 
  createConnection, 
  createMultiBrowserManager,
  MultiBrowserManager
};
