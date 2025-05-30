import { defineExtensionMessaging } from "@webext-core/messaging"
export interface WebsiteInfo {
  title: string;
  description: string;
  ico: string;
  url: string;
}

interface ProtocolMap {
  userInfo(user: any): void;
  injectContent(tabId: number): Promise<boolean>;
  websiteInfo(websiteInfo: WebsiteInfo): boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
