const { pool } = require('./mysqlcon');

const createProduct = async (product, variants, images) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const [result] = await conn.query('INSERT INTO product SET ?', product);
        await conn.query('INSERT INTO variant(product_id, color_id, size, stock) VALUES ?', [variants]);
        await conn.query('INSERT INTO product_images(product_id, image) VALUES ?', [images]);
        await conn.query('COMMIT');
        return result.insertId;
    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error);
        return -1;
    } finally {
        await conn.release();
    }
};

const getProducts = async (pageSize, paging = 0, requirement = {}) => {
    const condition = { sql: '', binding: [] };
    if (requirement.category) {
        condition.sql = 'WHERE category = ?';
        condition.binding = [requirement.category];
    } else if (requirement.keyword != null) {
        condition.sql = 'WHERE title LIKE ?';
        condition.binding = [`%${requirement.keyword}%`];
    } else if (requirement.id != null) {
        condition.sql = 'WHERE id = ?';
        condition.binding = [requirement.id];
    }

    const limit = {
        sql: 'LIMIT ?, ?',
        binding: [pageSize * paging, pageSize],
    };

    const productQuery = 'SELECT * FROM product ' + condition.sql + ' ORDER BY id ' + limit.sql;
    const productBindings = condition.binding.concat(limit.binding);
    const [products] = await pool.query(productQuery, productBindings);

    const productCountQuery = 'SELECT COUNT(*) as count FROM product ' + condition.sql;
    const productCountBindings = condition.binding;

    const [productCounts] = await pool.query(productCountQuery, productCountBindings);

    return {
        products: products,
        productCount: productCounts[0].count,
    };
};

const getHotProducts = async (hotId) => {
    const productQuery = 'SELECT product.* FROM product INNER JOIN hot_product ON product.id = hot_product.product_id WHERE hot_product.hot_id = ? ORDER BY product.id';
    const productBindings = [hotId];
    const [hots] = await pool.query(productQuery, productBindings);
    return hots;
};

const getProductsVariants = async (productIds) => {
    const queryStr = 'SELECT * FROM variant INNER JOIN color ON variant.color_id = color.id WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

const getProductsImages = async (productIds) => {
    const queryStr = 'SELECT * FROM product_images WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

<<<<<<< HEAD
const getProductById = async (productId) => {
    const queryStr = 'SELECT * FROM product WHERE id = ?';
    const bindings = [productId];
=======
const press = async (product_id) => {
    const conn = await pool.getConnection();
    try{

        await conn.query('START TRANSACTION');
        const lockQuery = 'SELECT press FROM product WHERE id = ? FOR UPDATE';
        const updateQuery = 'UPDATE product SET press = press+1 WHERE id = ?';
        await conn.query(lockQuery, [product_id]);
        await conn.query(updateQuery, [product_id]);
        await conn.query('COMMIT');
        return true ;
    }catch (error){
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
} ;


const hotSuggestion = async (product_id) => {
    const conn = await pool.getConnection();
    await conn.query('START TRANSACTION');
    const queryStr = `SELECT id AS product_id, press AS star FROM product WHERE id <> ? AND category = (SELECT category FROM product WHERE id = ?) ORDER BY press DESC;` ;
    const results = await pool.query(queryStr, [product_id, product_id]) ;
    await conn.query('COMMIT');
    return results[0] ;
}

const innnerjoin = async (group1,group2) => {
    const results = [] ;
    group1.forEach(item1 => {
        const matchUser = group2.find(item2 => item2.user_id === item1.user_id) ;
        if(matchUser){
            results.push({
                user_id : item1.user_id,
                diff : item1.star - matchUser.star //add back after
            }) ;
        } 
    }) ;
    return results ;
}


const genSlopeOneValue = async (targetProductid, userProductsid, user_id) => {
    const conn = await pool.getConnection();
    let star = 0 ;
    let total_voter = 0 ;
    await conn.query('START TRANSACTION');
    const targetPeopleInfoQuery = "SELECT user_id, star FROM review WHERE product_id = ? ;";
    const targetPeopleInfo = await pool.query(targetPeopleInfoQuery, [targetProductid]) ;
    for(let i=0; i<userProductsid.length; i++){
        const subPeopleInfoQuery = "SELECT user_id, star FROM review WHERE product_id = ?;" ;
        const subPeopleInfo = await pool.query(subPeopleInfoQuery, [userProductsid[i]]) ;
        const innerJoinGroup = await innnerjoin(targetPeopleInfo[0], subPeopleInfo[0]) ;
        if(innerJoinGroup.length > 0){
            total_voter += innerJoinGroup.length ;
            const diff = innerJoinGroup.reduce((sum, item) => sum + item.diff, 0)/innerJoinGroup.length;
            star += (subPeopleInfo[0].find(item => item.user_id === user_id).star + diff)*innerJoinGroup.length ;
        }
    }
    await conn.query('COMMIT');
    if(total_voter > 0){
        star = star/total_voter ;
    }else{
        star = 3 ;
    }
    
    return {
        product_id : targetProductid,
        star : star
    }
} ;

const slopeOne = async (user_id, product_id) => {
    const conn = await pool.getConnection();
    try{
        await conn.query('START TRANSACTION');
        const userQuery = "SELECT product_id, star FROM review WHERE user_id = ? ;" ;
        const userReviews = await pool.query(userQuery, [user_id]) ;
        let results ;
        if(userReviews[0].length < 1){
            results = await hotSuggestion(product_id) ;
        }else{
            const userProductsid = userReviews[0].map(item => item.product_id) ;
            const allProductsIdQuery = "SELECT id AS product_id FROM product ;" ;
            const allProducts = await pool.query(allProductsIdQuery) ;
            for(let i=0; i<allProducts[0].length; i++){
                if(!userReviews[0].find(item => item.product_id === allProducts[0][i].product_id)){
                    const star = await genSlopeOneValue(allProducts[0][i].product_id, userProductsid, user_id) ;
                    userReviews[0].push(star) ;
                }
            }
            results = userReviews[0].sort((a, b) => b.star - a.star) ;
            const indexToRemove = results.findIndex(item => item.product_id === product_id);
            if(indexToRemove !== -1){
                results.splice(indexToRemove, 1) ;
            }
            console.log("slopeone result", results) ;
        }
        await conn.query('COMMIT');
        return results.slice(0, 10) ;
    }catch (error){
        console.log(error) ;
        await conn.query('ROLLBACK');
        return {error};
    }finally {
        await conn.release();
    }
} ;

const getProductById = async (id) => {
    const queryStr = 'SELECT * FROM product WHERE id = ?';
    const bindings = [id];
>>>>>>> 63ab43a2ef407bd6275f59dffb59dff645e9d481
    const [products] = await pool.query(queryStr, bindings);
    return products[0];
};

module.exports = {
    createProduct,
    getProducts,
    getHotProducts,
    getProductsVariants,
    getProductsImages,
<<<<<<< HEAD
    getProductById
};
=======
    press,
    slopeOne,
    getProductById,
};
>>>>>>> 63ab43a2ef407bd6275f59dffb59dff645e9d481
