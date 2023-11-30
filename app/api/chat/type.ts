export type MemChatMsg = {
  time: number;
  name: string;
  message: string;
  id: string;
};

export type MemChatLog = {
  [key: string]: MemChatMsg[];
};
