import { useEffect, useRef, useState } from 'react';
import '@packages/ui/globals.css';
import { BookmarkForm } from '../../components/BookmarkForm'
import { Button } from '@packages/ui/components/button-loading';
import { sendMessage, onMessage, type WebsiteInfo } from '../../lib/message';
import { Skeleton } from '@packages/ui/components/skeleton';
import { Toaster } from '@packages/ui/components/sonner';
import { BookmarkFormData } from '@packages/utils/src/zod-schema';

function App() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [websiteInfo, setWebsiteInfo] = useState<BookmarkFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          id: bookmark.id,
          title: bookmark.title,
          description: bookmark.description,
          url: bookmark.url,
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

      setIsLoading(false);
      
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

  if (isLoading) {
    return (
      <div className="p-4 w-96">
        <div className="space-y-4">
          {/* URL Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-10" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          
          {/* Title Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-8" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          
          {/* Description Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-18 w-full" /> {/* Textarea */}
          </div>
          
          {/* Tags Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Combobox */}
          </div>
          
          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

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
        isSubmitting={false}
        isEditing={isEditing}
        initialData={websiteInfo ? {
          id: websiteInfo.id || '',
          title: websiteInfo.title || '',
          url: websiteInfo.url || '',
          description: websiteInfo.description || '',
          tags: websiteInfo.tags || [],
        } : undefined}
      />
       <Toaster position="top-center" />
    </div>
  );
}

export default App;
