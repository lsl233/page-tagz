import { defineExtensionMessaging } from "@webext-core/messaging"

interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface WebsiteInfo {
  title: string;
  description: string;
  ico: string;
  url: string;
  tags?: Tag[];
}

interface ProtocolMap {
  userInfo(user: any): void;
  injectContent(tabId: number): Promise<boolean>;
  websiteInfo(websiteInfo: WebsiteInfo): boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
