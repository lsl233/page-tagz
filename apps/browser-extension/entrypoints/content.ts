import { formatLocalUserInfo } from '@packages/utils/format-user-info';
import { onMessage, sendMessage } from '../lib/message';

function autoSendUserInfo() {
  const sendUserInfo = () => {
    const user = formatLocalUserInfo(window.localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY))
    sendMessage('userInfo', user)
  }
  sendUserInfo()
  window.addEventListener('storage', e => {
    if (e.key === import.meta.env.VITE_LOCAL_STORAGE_USER_KEY) {
      console.log('userInfo changed')
      sendUserInfo()
    }
  })
}

export default defineContentScript({
  matches: ['http://localhost/*', 'https://page-tagz-web.vercel.app/*'],
  runAt: 'document_end',
  async main() {
    console.log('content script loaded')

    autoSendUserInfo()

    window.postMessage({ type: 'CONTENT_SCRIPT_LOADED' }, '*')
  },
});