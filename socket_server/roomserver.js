const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });


    socket.on("customEvent", (data) => {
        console.log("Custom event received:", data);

    });


    socket.on("broadcastProductId", (productId) => {
        console.log("Broadcasting productId to all clients:", productId);
        io.emit("updateProduct", productId);
    });


    socket.on("joinRoom", (participantName) => {
        io.emit("userJoined", participantName); // Broadcast to all clients
    });

    socket.on("leaveRoom", (participantName) => {
        io.emit("userLeft", participantName); // Broadcast to all clients
    });

});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
