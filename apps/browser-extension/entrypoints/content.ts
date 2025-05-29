import { formatLocalUserInfo } from '@packages/utils/format-user-info';
import { sendMessage } from '../lib/message';

export default defineContentScript({
  matches: ['http://localhost/*'],
  runAt: 'document_end',
  async main() {
    console.log('Hello content.11');
    // browser.cookies.get({
    //   url: 'http://localhost:3001',
    //   name: 'jwt',
    // }).then((cookie) => {
    //   console.log('cookie', cookie);
    // });
    const user = formatLocalUserInfo(window.localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY))
    await sendMessage('userInfo', user)
    window.addEventListener('storage', function (event) {
      console.log('storage', event);
    });
  },
});