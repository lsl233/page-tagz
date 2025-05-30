import { onMessage } from "../lib/message";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

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
  

  // browser.action.onClicked.addListener(async () => {
  //   console.log('onClicked');
  //   const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  //   const tabId = tabs[0].id;
  //   console.log('tabId', tabId);
  //   if (!tabId) return console.warn('No active tab found');

  //   const res = await browser.scripting.executeScript({
  //     target: { tabId },
  //     func: injectedFunction,
  //   });
  //   console.log(res); // "Hello John!"
  // })

  // entrypoints/background.ts

});
