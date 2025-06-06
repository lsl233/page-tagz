import { useEffect, useRef, useState } from 'react';
import '@packages/ui/globals.css';
import { BookmarkForm } from '../../components/BookmarkForm'
import { Button } from '@packages/ui/components/button-loading';
import { onMessage, sendMessage } from '../../lib/message';
import { Skeleton } from '@packages/ui/components/skeleton';
import { Toaster } from '@packages/ui/components/sonner';
import { BookmarkFormData } from '@packages/utils/src/zod-schema';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@packages/ui/components/card';


function App() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [websiteInfo, setWebsiteInfo] = useState<BookmarkFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);

  const loadStoredUserInfo = async () => {
    console.log('loadStoredUserInfo')
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
        icon: bookmarked.icon || tab.favIconUrl,
        tags: bookmarked.tags
      });
      setIsEditing(true);
    } else {
      setWebsiteInfo({
        title: tab.title || '',
        description: '',
        url: tab.url,
        icon: tab.favIconUrl || '',
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
    loadStoredUserInfo()
  }, []);

  useEffect(() => {
    if (userInfo?.id) {
      initializeWebPageListener();
    }
  }, [userInfo]);

  return (
    <div className="p-2 w-[480px] bg-gray-100/50">
      <Card className="w-full p-4 m-0">
        <CardHeader className="p-0 text-center">
          <CardTitle className="text-xl">PageTagz</CardTitle>
          <CardDescription>
            Just one click bookmarking
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {
            (!userInfo || !userInfo.id) ? (
              <Button className="w-full" onClick={() => {
                window.open('http://localhost:3001', '_blank')
              }}>Login</Button>
            ) : (
              (isLoading) ? (
                <div className="space-y-4">
                  {/* URL Field */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-8" /> {/* Label "URL" */}
                    <Skeleton className="h-10 w-full" /> {/* Input */}
                  </div>

                  {/* Title Field */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-10" /> {/* Label "Title" */}
                    <Skeleton className="h-10 w-full" /> {/* Input */}
                  </div>

                  {/* Tags Field */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" /> {/* Label "Tags" */}
                    <Skeleton className="h-10 w-full" /> {/* Combobox */}
                  </div>

                  {/* Submit Button */}
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <BookmarkForm
                    userId={userInfo.id}
                    onSubmit={() => setIsEditing(true)}
                    isSubmitting={false}
                    isEditing={isEditing}
                    initialData={websiteInfo ? {
                      id: websiteInfo.id || '',
                      title: websiteInfo.title || '',
                      url: websiteInfo.url || '',
                      icon: websiteInfo.icon || '',
                      description: websiteInfo.description || '',
                      tags: websiteInfo.tags || [],
                    } : undefined}
                  />
                  <Button variant="link" size="sm" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => {
                    window.open(`${import.meta.env.VITE_API_URL}`, '_blank')
                  }}>Go To Dashboard <ArrowRight /></Button>
                </>
              )
            )
          }

        </CardContent>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
