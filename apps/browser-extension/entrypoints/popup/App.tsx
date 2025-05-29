import { useState } from 'react';
import '@packages/ui/globals.css';
import { BookmarkForm } from '../../components/BookmarkForm'
import { Button } from '@packages/ui/components/button-loading';

function App() {
  const [userInfo, setUserInfo] = useState<any>(null);

  const getUserInfo = async () => {
    const userInfo = await storage.getItem('local:userInfo')
    setUserInfo(userInfo);
  }

  useEffect(() => {
    getUserInfo()
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
        onSubmit={() => {}}
        isEditing={false}
        isSubmitting={false}
        onCancel={() => {}}
      />
    </div>
  );
}

export default App;
