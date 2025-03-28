const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

let hostSocket = null;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", ({ role }) => {
    if (role === "host") {
      if (hostSocket) {
        console.log("A host is already active. Rejecting new host.");
        socket.emit("error", "Only one host allowed.");
        return;
      }
      hostSocket = socket;
      console.log("Host joined:", socket.id);
    } else {
      console.log("Listener joined:", socket.id);
    }
  });

  socket.on("audio-stream", (audioBuffer) => {
    // Ensure only non-empty, non-silent buffers are broadcast
    if (audioBuffer && audioBuffer.length > 0 && audioBuffer.some(sample => sample !== 0)) {
        socket.broadcast.emit("audio-stream", audioBuffer);
    } else {
        console.warn("Received empty or silent buffer. Not broadcasting.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.id === hostSocket?.id) {
      console.log("Host disconnected");
      hostSocket = null;
    }
  });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
