import { MessageType } from "./MessageType";

export interface ServerMessage {
  message_type: MessageType;
  payload: string;
}
