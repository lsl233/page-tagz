declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_LOCAL_STORAGE_USER_KEY: string;
    }
  }
}

export {}