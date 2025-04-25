import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Sidebar } from "~/components/Sidebar";

export default component$(() => {
  return (
    <div class="flex h-screen bg-background">
      <Sidebar />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
