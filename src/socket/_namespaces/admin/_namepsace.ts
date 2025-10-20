import { io } from "@/socket/server";

export const adminNamespace = io.of("/admin");
adminNamespace.on("connection", (socket) => {
  console.log(`Admin connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Admin disconnected: ${socket.id}`);
  });

  // Additional event handlers can be added here
});
