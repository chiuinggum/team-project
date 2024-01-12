const router = require('express').Router();
const { wrapAsync } = require('../../util/util');


const {
    getProducts,
    press,
    slopeOne,
    getProductById
} = require('../controllers/product_controller');

router.route('/products/press').get(wrapAsync(press)) ; 

router.route('/products/slopeone').get(wrapAsync(slopeOne)) ;

router.route('/products/:category(men|women|all|accessories|search|hot|details)').get(wrapAsync(getProducts));

router.route('/products/:id').get(wrapAsync(getProductById));


module.exports = router;
