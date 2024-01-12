require('dotenv').config();
const Story = require('../models/story_model');

const createStory = async (req, res) => {
    console.log('createStory', req.body);
    const { picUrl, purchase_url, create_time } = req.body;
    console.log('createStory12345', picUrl, purchase_url, create_time);
    const { story, error } = await Story.createStory(picUrl, purchase_url, create_time);
    if (error) {
        return res.status(400).json({ error });
    }
    return res.status(200).json(story);
};

const showStory = async (req, res) => {
    const { stories, error } = await Story.showStory();
    if (error) {
        return res.status(400).json({ error });
    }
    return res.status(200).json(stories);
};

module.exports = {
    createStory,
    showStory,
};
