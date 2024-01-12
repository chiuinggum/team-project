const router = require('express').Router();

const { wrapAsync } = require('../../util/util');

const { createMessage, createRoom, getMessagesByRoomId, getRoomsByUserId } = require('../controllers/message_controller');

const { memoryUpload, uploadToS3 } = require('../../util/util');

const cpUpload = memoryUpload.fields([{ name: 'image', maxCount: 1 }]);

router.route('/message').post(wrapAsync(createMessage));

router.route('/message/room').post(wrapAsync(createRoom));

router.route('/message/:roomId').get(wrapAsync(getMessagesByRoomId));

router.route('/message/rooms/:userId').get(wrapAsync(getRoomsByUserId));

router.route('/message/uploadImage').post(cpUpload, wrapAsync(uploadToS3));

module.exports = router;
