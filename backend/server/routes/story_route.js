const router = require('express').Router();

const { wrapAsync } = require('../../util/util');

const { createStory, showStory } = require('../controllers/story_controller');

router.route('/story/create').post(wrapAsync(createStory));

router.route('/story/show').get(wrapAsync(showStory));

module.exports = router;
