import { component$ } from '@builder.io/qwik';
import { LuFolder, LuShoppingBag, LuUtensils, LuGithub } from '@qwikest/icons/lucide';
import { cn } from '~/lib/utils';
import { Button } from './Button/Button';
import { signIn } from 'next-auth/react';
import { useSignIn } from '~/routes/plugin@auth';
// TODO: Import these components after they are converted to Qwik
// import { Button } from '~/components/ui/button';
// import { TagButton } from '~/components/tag/tag-button';
// import { LoginButton } from '~/components/login/login-button';
// import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';

interface TagItem {
  name: string;
  icon: any; // Will need proper typing once we have Qwik-compatible icons
  count: number;
  active?: boolean;
}

// TODO: Replace with proper auth mechanism for Qwik
async function getSession() {
  return null;
}

// TODO: Replace with proper API call for Qwik
async function getUserTags() {
  return [];
}

export const Sidebar = component$(() => {
  const signInSig = useSignIn()
  const tags: TagItem[] = [
    {
      name: "All Bookmarks",
      icon: <LuFolder class="h-4 w-4 text-blue-600" />,
      count: 128,
      active: true,
    },
    {
      name: "Frontend Dev",
      icon: (
        <div class="h-4 w-4 bg-blue-100 rounded flex items-center justify-center">
          <span class="text-xs text-blue-600">F</span>
        </div>
      ),
      count: 42,
    },
    {
      name: "Learning",
      icon: (
        <div class="h-4 w-4 bg-green-100 rounded flex items-center justify-center">
          <span class="text-xs text-green-600">L</span>
        </div>
      ),
      count: 36,
    },
    {
      name: "Entertainment",
      icon: (
        <div class="h-4 w-4 bg-purple-100 rounded flex items-center justify-center">
          <span class="text-xs text-purple-600">E</span>
        </div>
      ),
      count: 24,
    },
    {
      name: "Shopping",
      icon: <LuShoppingBag class="h-4 w-4 text-red-600" />,
      count: 18,
    },
    {
      name: "Recipes",
      icon: <LuUtensils class="h-4 w-4 text-yellow-600" />,
      count: 8,
    },
  ];

  // TODO: Replace with proper Qwik data fetching
  // const session = useSignal(null);
  // const userTags = useSignal([]);

  return (
    <div class="w-[210px] flex-shrink-0 bg-muted flex flex-col">
      <div class="p-2">
        <h2 class="font-semibold text-lg">Tags</h2>
      </div>
      <div class="px-2 py-1">
        {/* <TagButton /> */}
      </div>
      <div class="flex-1 overflow-auto">
        <ul class="py-2">
          {tags.map((tag) => (
            <li key={tag.name}>
              {/* Replace with Qwik Button component once converted */}
              <button
                class={cn(
                  "w-full justify-start px-4 py-2 h-auto",
                  tag.active && "bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <span class="flex items-center gap-2 w-full">
                  {tag.icon}
                  <span class="flex-1 text-left text-sm">{tag.name}</span>
                  <span class="text-xs text-muted-foreground">{tag.count}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div class="p-2 border-t">
        <Button onClick$={() => signInSig.submit({ redirectTo: "/" })} class="w-full"><LuGithub class="h-4 w-4" /> Github Login</Button>
      </div>
    </div>
  );
}); 