import { formatLocalUserInfo } from '@packages/utils/format-user-info';
import { onMessage, sendMessage } from '../lib/message';

export default defineContentScript({
  matches: ['http://localhost/*', 'https://page-tagz-web.vercel.app/*'],
  runAt: 'document_end',
  async main() {
    console.log('content script loaded')
    const user = formatLocalUserInfo(window.localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY))
    await sendMessage('userInfo', user)

    window.postMessage({ type: 'CONTENT_SCRIPT_LOADED' }, '*')
  },
});