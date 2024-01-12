const { pool } = require('./mysqlcon');

const createMessage = async (message) => {
    console.log(message);
    delete message.nowRoom;
    const [result] = await pool.query('INSERT INTO message SET ?', message);
    return result.insertId;
};

const createRoom = async (room) => {
    const [result] = await pool.query('INSERT INTO rooms SET ?', room);
    return result.insertId;
};

const getMessagesByRoomId = async (roomId) => {
    const [messages] = await pool.query('SELECT * FROM message WHERE room_id = ?', [roomId]);
    return messages;
};

const getRoomsByUserId = async (userId) => {
    const [rooms] = await pool.query('SELECT * FROM rooms WHERE user_id = ?', [userId]);
    return rooms;
};

const getAllRooms = async () => {
    const [rooms] = await pool.query('SELECT * FROM rooms');
    return rooms;
};

module.exports = {
    createMessage,
    createRoom,
    getMessagesByRoomId,
    getRoomsByUserId,
    getAllRooms,
};
