require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const { pool } = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');


const USER_ROLE = {
    ALL: -1,
    ADMIN: 1,
    USER: 2,
};

const signUp = async (name, roleId, email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        if (emails[0].length > 0) {
            await conn.query('COMMIT');
            return { error: 'Email Already Exists' };
        }

        const loginAt = new Date();

        const user = {
            provider: 'native',
            role_id: roleId,
            email: email,
            password: bcrypt.hashSync(password, salt),
            name: name,
            picture: null,
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt,
        };
        const accessToken = jwt.sign(
            {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
            TOKEN_SECRET
        );
        user.access_token = accessToken;

        const queryStr = 'INSERT INTO user SET ?';
        const [result] = await conn.query(queryStr, user);

        user.id = result.insertId;
        await conn.query('COMMIT');
        return { user };
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return { error };
    } finally {
        await conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = users[0];
        if (!bcrypt.compareSync(password, user.password)) {
            await conn.query('COMMIT');
            console.log('wrong');
            return { error: 'Password is wrong' };
        }

        const loginAt = new Date();
        const accessToken = jwt.sign(
            {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
            TOKEN_SECRET
        );

        const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);
        await conn.query('COMMIT');
        user.access_token = accessToken;
        user.login_at = loginAt;
        user.access_expired = TOKEN_EXPIRE;

        return { user };
    } catch (error) {
        await conn.query('ROLLBACK');
        return { error };
    } finally {
        await conn.release();
    }
};

const reward = async (user_id, reward_id) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const queryStr1 = 'INSERT INTO rewardrecord (user_id, reward_id, used) VALUES (?, ?, 0) ;' ;
        await conn.query(queryStr1, [user_id, reward_id]) ;

        const queryStr2 = `
            SELECT 
            id AS reward_id, title, description, value 
            FROM reward 
            WHERE id = ? ;` ;
        const rewardDetail = await conn.query(queryStr2, [reward_id]) ;

        await conn.query('COMMIT');
        return rewardDetail[0] ;
    }catch (error){
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
} ;

const checkReward = async (user_id) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');

        const queryStr = `
            SELECT 
            rewardrecord.id AS rewardrecord_id, rewardrecord.user_id, 
            rewardrecord.used, reward.title, 
            reward.description, reward.value
            FROM rewardrecord 
            JOIN reward ON rewardrecord.reward_id = reward.id
            WHERE rewardrecord.user_id = ? AND rewardrecord.used = 0` ;
        const results = await conn.query(queryStr, [user_id]) ;

        await conn.query('COMMIT');
        return results[0] ;
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
} ;

const useReward = async (user_id, rewardrecord_id) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const queryStr1 = 'UPDATE rewardrecord SET used = 1 WHERE user_id = ? AND id = ? ;' ;
        await conn.query(queryStr1, [user_id, rewardrecord_id]) ;

        const queryStr2 = `
            SELECT 
            id AS rewardrecord_id, reward_id, used
            FROM rewardrecord 
            WHERE id = ? ;` ;
        const rewardDetail = await conn.query(queryStr2, [rewardrecord_id]) ;

        await conn.query('COMMIT');
        return rewardDetail[0] ;
    }catch (error){
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
} ;

const isTodayCheckIn = async (user_id, year, month, day) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        
        const queryStr = 'SELECT * FROM checkin WHERE user_id = ? AND year = ? AND month = ? AND day = ? ;';
        const results = await conn.query(queryStr, [user_id, year, month, day]);
        await conn.query('COMMIT');
        if (results[0].length === 0){
            return true ;
        }else{
            return false;
        }

    }catch (error){
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
}

function checkContinuity(year1, month1, day1, year2, month2, day2) {
    console.log(`${year1}-${month1}-${day1}`, `${year2}-${month2}-${day2}`) ;
      const currentDate = new Date(year1, month1-1, day1);
      const prevDate = new Date(year2, month2-1, day2);
      const timeDiff = currentDate.getTime() - prevDate.getTime();
      const oneDay = 24 * 60 * 60 * 1000; 
      if (timeDiff !== oneDay) {
        return false ;
      }
      return true ;
}

const lastDayCon = async (user_id, year, month, day) => {
    const conn = await pool.getConnection();
    const queryStr = 'SELECT * FROM checkin WHERE user_id = ? ORDER BY year DESC, month DESC, day DESC LIMIT 1 ;' ;
    const results = await conn.query(queryStr, [user_id]) ;
    if(results[0].length !== 0 && checkContinuity(year, month, day, results[0][0].year, results[0][0].month, results[0][0].day)){
        if(results[0][0].conday >= 6){
            return 0 ;
        }else{
            return results[0][0].conday+1 ;
        }
    }
    return 1 ;
}

const checkIn = async (user_id, year, month, day, cont) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const queryStr1 = 'INSERT IGNORE checkin (user_id, year, month, day, conday) VALUES (?, ?, ?, ?, ?)';
        await conn.query(queryStr1, [user_id, year, month, day, cont]);

        const queryStr2 = 'SELECT year, month, day FROM checkin WHERE user_id = ? AND year = ? AND month = ? ;' ;
        const results = await conn.query(queryStr2, [user_id, year, month]) ;

        await conn.query('COMMIT');

        return results[0];

    }catch (error){
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
} ;

const logout = async (row_id) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const logoutAt = new Date();
        const queryStr1 = 'SELECT login_at FROM checkin WHERE id = ?;' ;
        const loginAt = await conn.query(queryStr1, [row_id]);
        const timeDiff = (new Date(logoutAt) - new Date(loginAt[0][0].login_at))/1000 ;
        const queryStr2 = 'UPDATE checkin SET period = ? WHERE id = ? ;' ;
        await conn.query(queryStr2, [timeDiff, row_id]);
        console.log("logout") ;
        await conn.query('COMMIT');
        return true;

    }catch (error){
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
}

const favorite = async (user_id, product_id)  => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const queryStr = 'INSERT IGNORE favorite (user_id, product_id) VALUES (?,?) ;' ;
        await conn.query(queryStr, [user_id, product_id]) ;
        await conn.query('COMMIT');
        return  true;
    }catch (error) {
        console.log(error) ;
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const deleteFavorite = async (user_id, product_id)  => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const queryStr = 'DELETE FROM favorite WHERE user_id=? AND product_id=? ;' ;
        await conn.query(queryStr, [user_id, product_id]) ;
        await conn.query('COMMIT');
        return true ;
    }catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const getFavorite = async (user_id, product_id) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const queryStr = 'SELECT * FROM favorite WHERE user_id = ? AND product_id = ? ;' ;
        const results = await conn.query(queryStr, [user_id, product_id]) ;
        await conn.query('COMMIT');
        return results[0] ;
    }catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const facebookSignIn = async (id, roleId, name, email) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const loginAt = new Date();
        let user = {
            provider: 'facebook',
            role_id: roleId,
            email: email,
            name: name,
            picture: 'https://graph.facebook.com/' + id + '/picture?type=large',
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt,
        };
        const accessToken = jwt.sign(
            {
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
            TOKEN_SECRET
        );
        user.access_token = accessToken;

        const [users] = await conn.query("SELECT id FROM user WHERE email = ? AND provider = 'facebook' FOR UPDATE", [email]);
        let userId;
        if (users.length === 0) {
            // Insert new user
            const queryStr = 'insert into user set ?';
            const [result] = await conn.query(queryStr, user);
            userId = result.insertId;
        } else {
            // Update existed user
            userId = users[0].id;
            const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ?  WHERE id = ?';
            await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, userId]);
        }
        user.id = userId;

        await conn.query('COMMIT');

        return { user };
    } catch (error) {
        await conn.query('ROLLBACK');
        return { error };
    } finally {
        await conn.release();
    }
};

const getUserDetail = async (email, roleId) => {
    try {
        if (roleId) {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
            return users[0];
        } else {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
            return users[0];
        }
    } catch (e) {
        return null;
    }
};

const getUserDetailById = async (id) => {
    try {
        const [users] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        return users[0];
    } catch (e) {
        return null;
    }
};

const getFacebookProfile = async function (accessToken) {
    try {
        let res = await got('https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken, {
            responseType: 'json',
        });
        return res.body;
    } catch (e) {
        console.log(e);
        throw 'Permissions Error: facebook access token is wrong';
    }
};

const getUserNameById = async function(id){
    try {
        const [users] = await pool.query('SELECT name FROM user WHERE id = ?', [id]);
        return users[0].name;
    } catch (e) {
        return null;
    }
};

module.exports = {
    USER_ROLE,
    signUp,
    isTodayCheckIn,
    lastDayCon,
    checkIn,
    logout,
    favorite,
    getFavorite,
    nativeSignIn,
    facebookSignIn,
    getUserDetail,
    getUserDetailById,
    getFacebookProfile,
    deleteFavorite,
    reward,
    checkReward,
    useReward,
    getUserNameById
};


