const Message = require('../models/message_model');
const User = require('../models/user_model');

const createMessage = async (req, res) => {
    let { message } = req.body;

    const messageId = await Message.createMessage(message);
    if (messageId == -1) {
        res.status(500);
    } else {
        res.status(200).send({ messageId });
    }
};

const createRoom = async (req, res) => {
    let room = req.body.room;

    const roomId = await Message.createRoom(room);
    if (roomId == -1) {
        res.status(500);
    } else {
        res.status(200).send({ roomId });
    }
};

const getMessagesByRoomId = async (req, res) => {
    const roomId = req.params.roomId;

    const messages = await Message.getMessagesByRoomId(roomId);
    if (messages == -1) {
        res.status(500);
    } else {
        res.status(200).send({ messages });
    }
};

const getRoomsByUserId = async (req, res) => {
    const userId = req.params.userId;

    const user = await User.getUserDetailById(userId);

    if (user.role_id == 1) {
        const rooms = await Message.getAllRooms();
        if (rooms == -1) {
            res.status(500);
        } else {
            res.status(200).send({ rooms });
        }
        return;
    }

    const rooms = await Message.getRoomsByUserId(userId);
    if (rooms == -1) {
        res.status(500);
    } else {
        res.status(200).send({ rooms });
    }
};

module.exports = {
    createMessage,
    createRoom,
    getMessagesByRoomId,
    getRoomsByUserId,
};
