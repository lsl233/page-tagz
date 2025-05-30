import { useEffect, useRef, useState } from 'react';
import '@packages/ui/globals.css';
import { BookmarkForm } from '../../components/BookmarkForm'
import { Button } from '@packages/ui/components/button-loading';
import { sendMessage, onMessage, type WebsiteInfo } from '../../lib/message';

function App() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isMounted = useRef(false);

  const loadStoredUserInfo = async () => {
    const userInfo = await storage.getItem('local:userInfo')
    setUserInfo(userInfo);
  }

  const checkExistingBookmark = async (url: string, userId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/bookmarks/check?url=${encodeURIComponent(url)}&userId=${userId}`
      );
      
      if (response.ok) {
        const bookmark = await response.json();
        setWebsiteInfo({
          title: bookmark.title,
          description: bookmark.description,
          url: bookmark.url,
          ico: bookmark.ico,
          tags: bookmark.tags
        });
        setIsEditing(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  }

  const initializeWebPageListener = async () => {
    console.log('initializeWebPageListener', isMounted.current)
    if (isMounted.current) return;
    isMounted.current = true;
    
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    console.log('tab', tab)
    if (!tab.id) return console.warn('No active tab found');

    // 监听网页信息
    onMessage('websiteInfo', async (e) => {
      // 检查是否已收藏
      const isBookmarked = await checkExistingBookmark(e.data.url, userInfo.id);
      console.log('isBookmarked', isBookmarked)
      // 如果没有收藏过，使用页面信息
      if (!isBookmarked) {
        setWebsiteInfo(e.data);
        setIsEditing(false);
      }
      
      return true;
    });

    await sendMessage('injectContent', tab.id);
  }

  useEffect(() => {
    loadStoredUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo?.id) {
      initializeWebPageListener();
    }
  }, [userInfo]);

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
        isEditing={isEditing}
        isSubmitting={false}
        initialData={websiteInfo ? {
          title: websiteInfo.title || '',
          url: websiteInfo.url || '',
          description: websiteInfo.description || '',
          tags: websiteInfo.tags?.map(tag => tag.id) || [],
        } : undefined}
      />
    </div>
  );
}

export default App;
