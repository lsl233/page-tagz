import { defineExtensionMessaging } from "@webext-core/messaging"

interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface WebsiteInfo {
  id?: string;
  title: string;
  description: string;
  ico: string;
  url: string;
  tags: string[];
}

interface ProtocolMap {
  userInfo(user: any): void;
  injectContent(tabId: number): Promise<boolean>;
  websiteInfo(websiteInfo: WebsiteInfo): boolean;
  openTabs(urls: string[]): boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
