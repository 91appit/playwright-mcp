#!/usr/bin/env node
/**
 * Example demonstrating multi-browser functionality
 * 
 * This script shows how to:
 * - Create multiple browser instances
 * - Navigate them independently
 * - Take snapshots to verify isolation
 * - Clean up resources
 */

const { createMultiBrowserManager } = require('../index');

async function demonstrateMultiBrowser() {
  console.log('🚀 Starting multi-browser demonstration...\n');

  try {
    // Create the manager with a default browser
    console.log('1. Creating browser manager...');
    const manager = await createMultiBrowserManager();
    console.log('   ✓ Default browser created\n');

    // Create additional browsers
    console.log('2. Creating additional browsers...');
    await manager.createBrowser('secondary');
    await manager.createBrowser('mobile', { device: 'iPhone 15' });
    console.log('   ✓ Secondary browser created');
    console.log('   ✓ Mobile browser created\n');

    // List all browsers
    console.log('3. Available browsers:');
    const browsers = manager.listBrowsers();
    browsers.forEach(id => console.log(`   - ${id}${id === 'default' ? ' (default)' : ''}`));
    console.log('');

    // Get browser instances
    const defaultBrowser = manager.getBrowser('default');
    const secondaryBrowser = manager.getBrowser('secondary');
    const mobileBrowser = manager.getBrowser('mobile');

    // Navigate each browser to different URLs
    console.log('4. Navigating browsers independently...');
    
    console.log('   → Default browser: navigating to example.com');
    const nav1 = await defaultBrowser.callTool({
      name: 'browser_navigate',
      arguments: { url: 'https://example.com' }
    });
    
    console.log('   → Secondary browser: navigating to google.com');
    const nav2 = await secondaryBrowser.callTool({
      name: 'browser_navigate',
      arguments: { url: 'https://google.com' }
    });
    
    console.log('   → Mobile browser: navigating to github.com');
    const nav3 = await mobileBrowser.callTool({
      name: 'browser_navigate', 
      arguments: { url: 'https://github.com' }
    });
    console.log('   ✓ All browsers navigated successfully\n');

    // Take snapshots to verify isolation
    console.log('5. Taking snapshots to verify isolation...');
    
    const snapshot1 = await defaultBrowser.callTool({
      name: 'browser_snapshot',
      arguments: {}
    });
    
    const snapshot2 = await secondaryBrowser.callTool({
      name: 'browser_snapshot',
      arguments: {}
    });
    
    const snapshot3 = await mobileBrowser.callTool({
      name: 'browser_snapshot',
      arguments: {}
    });

    console.log('   📸 Default browser snapshot:');
    console.log('     ', snapshot1.content[0].text.split('\n')[1]); // Page URL line
    
    console.log('   📸 Secondary browser snapshot:');
    console.log('     ', snapshot2.content[0].text.split('\n')[1]); // Page URL line
    
    console.log('   📸 Mobile browser snapshot:');
    console.log('     ', snapshot3.content[0].text.split('\n')[1]); // Page URL line
    console.log('   ✓ Each browser has independent state\n');

    // Test closing a browser
    console.log('6. Testing browser management...');
    console.log('   → Closing secondary browser');
    await manager.closeBrowser('secondary');
    
    const remainingBrowsers = manager.listBrowsers();
    console.log('   ✓ Remaining browsers:', remainingBrowsers.join(', '));
    console.log('');

    // Test error handling
    console.log('7. Testing error handling...');
    try {
      manager.getBrowser('non-existent');
    } catch (error) {
      console.log('   ✓ Error correctly handled:', error.message);
    }

    try {
      await manager.closeBrowser('default');
    } catch (error) {
      console.log('   ✓ Cannot close default browser:', error.message);
    }
    console.log('');

    // Clean up
    console.log('8. Cleaning up...');
    await manager.closeAll();
    console.log('   ✓ All browsers closed\n');

    console.log('🎉 Multi-browser demonstration completed successfully!');
    console.log('\nKey benefits demonstrated:');
    console.log('- ✅ Multiple independent browser contexts');
    console.log('- ✅ Isolated navigation and state');
    console.log('- ✅ Custom browser configurations');
    console.log('- ✅ Proper lifecycle management');
    console.log('- ✅ Error handling and validation');
    
  } catch (error) {
    console.error('❌ Error during demonstration:', error.message);
    process.exit(1);
  }
}

// Run the demonstration if this script is executed directly
if (require.main === module) {
  demonstrateMultiBrowser().catch(console.error);
}

module.exports = { demonstrateMultiBrowser };