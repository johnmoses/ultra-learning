import { ChatRoom } from "../types";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PackDetail: { packId: number };
  Chat: { room: ChatRoom }; // Add ChatScreen with room parameter
};

export type MainTabParamList = {
  Home: undefined;
  Learning: undefined;
  Chats: undefined; // Assuming this refers to the tab for chats
  Profile: undefined;
};
