import { onMessage, sendMessage } from "../lib/message";

export default defineBackground(() => {
  console.log('background script loaded', { id: browser.runtime.id });

  browser.action.setBadgeText({ text: "N" });

  onMessage('userInfo', (e) => {
    console.log('userInfo', e);
    storage.setItem('local:userInfo', e.data)
  })

  onMessage('injectContent', async (e) => {
    console.log('injectContent', e);
    await browser.scripting.executeScript({
      target: { tabId: e.data },
      files: ['content-scripts/inject.js'],
    });

    return true
  })

  onMessage('openTabs', async (e) => {
    console.log('openTabs')
    e.data.forEach(async (url: string) => browser.tabs.create({url}))
    return true
  })

});
