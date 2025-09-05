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

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Config } from './config';
import type { BrowserContext } from 'playwright';

export declare function createConnection(config?: Config, contextGetter?: () => Promise<BrowserContext>): Promise<Server>;

export interface ToolRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    uri?: string;
  }>;
  isError: boolean;
}

export interface BrowserInstance {
  callTool(request: ToolRequest): Promise<ToolResponse>;
  close(): Promise<void>;
}

export declare class MultiBrowserManager {
  constructor();
  initialize(config?: Config, contextGetter?: () => Promise<BrowserContext>): Promise<MultiBrowserManager>;
  createBrowser(browserId: string, config?: Config, contextGetter?: () => Promise<BrowserContext>): Promise<BrowserInstance>;
  getBrowser(browserId?: string): BrowserInstance;
  listBrowsers(): string[];
  closeBrowser(browserId: string): Promise<void>;
  closeAll(): Promise<void>;
}

export declare function createMultiBrowserManager(config?: Config, contextGetter?: () => Promise<BrowserContext>): Promise<MultiBrowserManager>;

export {};
