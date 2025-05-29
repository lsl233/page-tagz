import { defineExtensionMessaging } from "@webext-core/messaging"

interface ProtocolMap {
  userInfo(user: any): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
