import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data-dev'],
    binaries: {
      chrome: '/Users/xxx/Code/slash/chrome/mac_arm-136.0.7103.113/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    },
  },
  manifest: {
    permissions: ['storage', 'activeTab', 'scripting', 'tabs'],
  }
});
