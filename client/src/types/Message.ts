import { MessageType } from "./MessageType";

export interface MessageRender {
  user: string;
  message: string;
  message_type: MessageType;
}
