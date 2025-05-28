import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import '@packages/ui/globals.css';
// import { hello } from '@packages/utils';
import { Button } from '@packages/ui/components/button-loading';
import { Hello } from '@packages/business/components/hello';
import { BookmarkForm } from '../../components/BookmarkForm'
console.log(Hello);

function App() {
  const [count, setCount] = useState(0);

  // hello()

  return (
    <>
      <BookmarkForm
        onSubmit={() => {}}
        isEditing={false}
        isSubmitting={false}
        onCancel={() => {}}
      />
    </>
  );
}

export default App;
