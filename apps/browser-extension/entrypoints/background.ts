import { onMessage } from "../lib/message";


export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  onMessage('userInfo', (e) => {
    console.log('userInfo', e);
    storage.setItem('local:userInfo', e.data)
  })
});
