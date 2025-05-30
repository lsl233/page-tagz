import { useEffect, useState } from 'react';
import '@packages/ui/globals.css';
import { BookmarkForm } from '../../components/BookmarkForm'
import { Button } from '@packages/ui/components/button-loading';
import { sendMessage, onMessage, type WebsiteInfo } from '../../lib/message';

function App() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);
  const isMounted = useRef(false);

  const loadStoredUserInfo = async () => {
    const userInfo = await storage.getItem('local:userInfo')
    setUserInfo(userInfo);
  }

  const initializeWebPageListener = async () => {
    console.log('getWebPageInfo', isMounted.current)
    if (isMounted.current) return;
    isMounted.current = true;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    console.log('tab', tab)
    if (!tab.id) return console.warn('No active tab found');

    onMessage('websiteInfo', (e) => {
      setWebsiteInfo(e.data)
      return true
    })

    await sendMessage('injectContent', tab.id)
  }

  useEffect(() => {
    loadStoredUserInfo()

    initializeWebPageListener()

  }, [])

  if (!userInfo || !userInfo.id) {
    return <Button onClick={() => {
      window.open('http://localhost:3001', '_blank')
    }}>Login</Button>
  }

  return (
    <div className="p-4 w-96">
      <BookmarkForm
        userId={userInfo.id}
        onSubmit={() => { }}
        isEditing={false}
        isSubmitting={false}
        initialData={{
          title: websiteInfo?.title || '',
          url: websiteInfo?.url || '',
          description: websiteInfo?.description || '',
          tags: [],
        }}
      />
    </div>
  );
}

export default App;
