require("dotenv").config();
const express = require("express");
const cors = require("cors");
const amqp = require("amqplib/callback_api");
const app = express();

app.use(cors());
amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  const server = require("http")
    .Server(app)
    .listen(8000, () => {
      console.log("open server!");
    });

  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    channel.assertQueue("message", {
      durable: false,
    });

    channel.consume(
      "message",
      function (msg) {
        console.log(" [x] Received ", msg.content.toString());
        const message = JSON.parse(msg.content.toString());
        console.log("nowRoom", message.nowRoom);
        console.log(io.sockets.adapter.rooms);
        io.sockets.in(message.nowRoom).emit("getMessageRoomReceive", message);

        fetch(`${process.env.BACKENDURL}/api/1.0/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          })
          .catch((err) => console.log(err));
      },
      {
        noAck: true,
      }
    );

    const queue = "message";

    channel.assertQueue(queue, {
      durable: false,
    });

    io.on("connection", (socket) => {
      //經過連線後在 console 中印出訊息
      console.log("success connect!");
      //監聽透過 connection 傳進來的事件
      socket.on("getMessage", (message) => {
        //回傳 message 給發送訊息的 Client
        socket.emit("getMessage", message);
      });

      socket.on("getMessageRoom", (message) => {
        //取得房間名稱
        console.log(message);
        console.log(socket.rooms);
        let nowRoom;
        for (let room of socket.rooms) {
          if (room !== socket.id) {
            nowRoom = room;
            break;
          }
        }

        message = JSON.parse(message);
        message.nowRoom = nowRoom;

        console.log(typeof message);
        console.log("message:", message);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        //回傳 message 給發送訊息的 Client
      });

      socket.on("addRoom", (room) => {
        //加入前檢查是否已有所在房間
        const nowRoom = Object.keys(socket.rooms).find((room) => {
          return room !== socket.id;
        });
        //有的話要先離開
        if (nowRoom) {
          console.log("leaving room", nowRoom);
          socket.leave(nowFoom);
        }
        //再加入新的
        socket.join(room);
        io.sockets.in(room).emit("addRoom", "已有新人加入聊天室！");
      });

      socket.on("joinRoom", (room) => {
        //加入前檢查是否已有所在房間
        console.log(room);
        const nowRoom = Object.keys(socket.rooms).find((room) => {
          return room !== socket.id;
        });
        //有的話要先離開
        if (nowRoom) {
          socket.leave(nowFoom);
        }
        //再加入新的
        socket.join(room);
        io.sockets.in(room).emit("joinRoom", "已有新人加入聊天室！");
      });
    });
  });
});
