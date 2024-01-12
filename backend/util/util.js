require('dotenv').config();
const AWS = require('aws-sdk');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const port = process.env.PORT;
const User = require('../server/models/user_model');
const { TOKEN_SECRET, S3BUCKET, S3REGION, S3ACCESS_KEY_ID, S3SECRET_ACCESS_KEY } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library

const memoryStorage = multer.memoryStorage();

const memoryUpload = multer({ storage: memoryStorage });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const productId = req.body.product_id;
            const imagePath = path.join(__dirname, `../public/assets/${productId}`);
            if (!fs.existsSync(imagePath)) {
                fs.mkdirSync(imagePath);
            }
            cb(null, imagePath);
        },
        filename: (req, file, cb) => {
            const customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
            const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
            cb(null, customFileName + '.' + fileExtension);
        },
    }),
});

const uploadToS3 = async (req, res) => {
    console.log(req.files);
    const file = req.files['image'][0];

    // set AWS credentials
    AWS.config.update({
        accessKeyId: S3ACCESS_KEY_ID,
        secretAccessKey: S3SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3();

    // set new file name to prevent duplicate
    const fileName = 'image';
    const fileExtension = '.jpg';
    const date = Date.now();
    const newFileName = `${fileName}-${date}.${fileExtension}`;

    s3.upload(
        {
            Bucket: S3BUCKET,
            region: S3REGION,
            Key: newFileName,
            Body: file.buffer,
        },
        (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send({ error: err });
            }
            console.log(data);
            res.status(200).send({ url: data.Location });
        }
    );
};

const getImagePath = (protocol, hostname, productId) => {
    if (protocol == 'http') {
        return protocol + '://' + hostname + ':' + port + '/assets/' + productId + '/';
    } else {
        return protocol + '://' + hostname + '/assets/' + productId + '/';
    }
};

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
    return function (req, res, next) {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

const authentication = (roleId) => {
    return async function (req, res, next) {
        let accessToken = req.get('Authorization');
        if (!accessToken) {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }

        accessToken = accessToken.replace('Bearer ', '');
        if (accessToken == 'null') {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }

        try {
            const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
            req.user = user;
            if (roleId == null) {
                next();
            } else {
                let userDetail;
                if (roleId == User.USER_ROLE.ALL) {
                    userDetail = await User.getUserDetail(user.email);
                } else {
                    userDetail = await User.getUserDetail(user.email, roleId);
                }
                if (!userDetail) {
                    res.status(403).send({ error: 'Forbidden' });
                } else {
                    req.user.id = userDetail.id;
                    req.user.role_id = userDetail.role_id;
                    next();
                }
            }
            return;
        } catch (err) {
            res.status(403).send({ error: 'Forbidden' });
            return;
        }
    };
};

module.exports = {
    upload,
    memoryUpload,
    uploadToS3,
    getImagePath,
    wrapAsync,
    authentication,
};
