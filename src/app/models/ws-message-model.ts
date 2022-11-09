export interface WsMessage {
  id?: string;
  attributes?: any;
  createdAt?: Date;
  createdBy?: string;
  id_project?: string;
  recipient?: string;
  sender?: string;
  senderFullname?: string;
  status?: number;
  text?: string;
  updatedAt?: number;

}

export class WsMessage implements WsMessage { }
