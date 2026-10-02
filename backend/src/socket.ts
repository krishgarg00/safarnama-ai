import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (socketServer: Server) => {
  io = socketServer;

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};