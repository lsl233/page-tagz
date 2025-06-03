import { formatLocalUserInfo } from '@packages/utils/format-user-info';
import { onMessage, sendMessage } from '../lib/message';

export default defineContentScript({
  matches: ['http://localhost/*'],
  runAt: 'document_end',
  async main() {
    console.log('content script loaded')
    const user = formatLocalUserInfo(window.localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY))
    await sendMessage('userInfo', user)

    // window.addEventListener('storage', function (event) {
    //   console.log('storage', event);
    // });
    const listener = (event: MessageEvent) => {
      const { data, type } = event.data
      if (type === 'CONTENT_SCRIPT_LOADED') {
        console.log('CONTENT_SCRIPT_LOADED')
        window.postMessage({ type: 'CONTENT_SCRIPT_LOADED_RECEIVED' }, '*')
      }

      if (type === 'OPEN_ALL_BOOKMARKS') {
        sendMessage('openTabs', data)
      }
    }
    window.addEventListener('message', listener)
  },
});