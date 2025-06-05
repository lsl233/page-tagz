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
        `${import.meta.env.VITE_API_URL}/api/bookmarks/check?url=${encodeURIComponent(url)}&userId=${userId}`
      );

      if (response.ok) {
        const bookmark = await response.json();
        setIsEditing(true);
        return bookmark
      }
      return false
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false
    }
  }

  const initializeWebPageListener = async () => {
    console.log('initializeWebPageListener', isMounted.current)
    if (isMounted.current) return;
    isMounted.current = true;

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    console.log('tab', tab)
    if (!tab.id || !tab.url) return console.warn('No active tab found');

    const bookmarked = await checkExistingBookmark(tab.url, userInfo.id);

    if (bookmarked) {
      setWebsiteInfo({
        id: bookmarked.id,
        title: bookmarked.title || '',
        description: bookmarked.description,
        url: bookmarked.url,
        tags: bookmarked.tags
      });
      setIsEditing(true);
    } else {
      setWebsiteInfo({
        title: tab.title || '',
        description: '',
        url: tab.url,
        tags: []
      });
      setIsEditing(false);
    }

    setIsLoading(false);

    try {
      await sendMessage('injectContent', tab.id);

    } catch (e) {
      setIsLoading(false);
      console.log(e)
    }
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
        onSubmit={() => setIsEditing(true)}
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
