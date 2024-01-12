const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();
const morganBody = require('morgan-body');
const { rateLimiterRoute } = require('./util/ratelimiter');
const Cache = require('./util/cache');
const { PORT_TEST, PORT, NODE_ENV, API_VERSION, TOKEN_SECRET } = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : PORT;
const jwt = require('jsonwebtoken');

// Express Initialization
const express = require('express');
const cors = require('cors');
const app = express();

app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
morganBody(app);

// CORS allow all
app.use(cors());

// healthcheck
app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK');
})
const createToken = (userName) => {
    const roomName = 'quickstart-room';
    // Use the userId as the identity of the participant
    const participantIdentity = `user-${userName}`;
  
    const at = new AccessToken('APIFpxSwC59GoH6', 'l69Gyn8eMMASfFjl5jSuDCFRerMYptZU867VuScf7KAB', {
      identity: participantIdentity,
    });

    if (userName === 'yh') {
        at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canPublishData: true, canSubscribe: true });
      } else {
        // 只能加入會議室，但不能發布視訊和音頻
        at.addGrant({ roomJoin: true, room: roomName, canPublish: false, canPublishData: true, canSubscribe: true });
      }

    return at.toJwt();
  }
  
  app.get('/getToken', (req, res) => {
    // 這裡假設客戶端發送的 JWT 放在 Authorization 頭部
    const authHeader = req.headers.authorization;
    console.log('received from fron', authHeader);
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      console.log('received from fron token', token);
      jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        console.log('JWT payload:', user);

        const userName = user.name;

        console.log('name is', userName);
        res.send({ token: createToken(userName) });
      });
    } else {
      // 沒有 token，返回錯誤
      res.sendStatus(401);
    }
  });

// app.get('/getToken', (req, res) => {
//     res.send(createToken());
// });


// API routes
app.use('/api/' + API_VERSION, rateLimiterRoute, [
    require('./server/routes/admin_route'),
    require('./server/routes/product_route'),
    require('./server/routes/marketing_route'),
    require('./server/routes/user_route'),
    require('./server/routes/order_route'),
    // chiu
    require('./server/routes/review_route'),
    require('./server/routes/message_route'),
    require('./server/routes/story_route'),
]);

// Page not found
app.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Error handling
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500).send('Internal Server Error');
});

if (NODE_ENV != 'production') {
    app.listen(port, async () => {
        Cache.connect().catch(() => {
            console.log('redis connect fail');
        });
        console.log(`Listening on port: ${port}`);
    });
}

module.exports = app;
