require('dotenv').config();
const mysqlPromise = require('mysql2/promise');

const dbPromise = mysqlPromise.createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    (err) => {
        if (err) {
            console.error('Database connection error:', err);
        } else {
            console.log('Database connected successfully');
        }
    }
);

const createStory = async (picUrl, purchase_url, create_time) => {
    console.log('createStory', picUrl, purchase_url, create_time);
    try {
        await dbPromise.query('START TRANSACTION');
        const story = {
            picUrl: picUrl,
            purchase_url: purchase_url,
            create_time: create_time,
        };
        const queryStr = 'INSERT INTO story SET ?';
        const [result] = await dbPromise.query(queryStr, story);
        story.id = result.insertId;
        await dbPromise.query('COMMIT');
        return { story };
    } catch (error) {
        console.log(error);
        await dbPromise.query('ROLLBACK');
        return { error };
    }
};

const showStory = async () => {
    try {
        await dbPromise.query('START TRANSACTION');

        const oneDayAgo = new Date();
        console.log('oneDayAgo', oneDayAgo);
        oneDayAgo.setDate(oneDayAgo.getDate() - 5);
        console.log('oneDayAgo1', oneDayAgo);

        const [stories] = await dbPromise.query('SELECT * FROM story WHERE create_time >= ?', [oneDayAgo]);

        await dbPromise.query('COMMIT');
        return { stories };
    } catch (error) {
        console.log(error);
        await dbPromise.query('ROLLBACK');
        return { error };
    }
};

module.exports = {
    createStory,
    showStory,
};
