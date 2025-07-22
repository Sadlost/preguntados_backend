const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join_room", ({ playerName, room }) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, name: playerName });
    io.to(room).emit("update_players", rooms[room]);
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(p => p.id !== socket.id);
      io.to(room).emit("update_players", rooms[room]);
    }
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});