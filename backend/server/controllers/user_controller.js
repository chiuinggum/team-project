require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const signUp = async (req, res) => {
    let { name } = req.body;
    const { email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).send({ error: 'Request Error: name, email and password are required.' });
        return;
    }

    if (!validator.isEmail(email)) {
        res.status(400).send({ error: 'Request Error: Invalid email format' });
        return;
    }

    name = validator.escape(name);

    const result = await User.signUp(name, User.USER_ROLE.USER, email, password);
    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({ error: 'Database Query Error' });
        return;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
        },
    });
};

const nativeSignIn = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return { error: 'Request Error: email and password are required.', status: 400 };
    }
    try {
        const { user } = await User.nativeSignIn(email, password);
<<<<<<< HEAD
        console.log(user);
=======
>>>>>>> 63ab43a2ef407bd6275f59dffb59dff645e9d481

        res.status(200).send({
            data: {
                access_token: user.access_token,
                access_expired: user.access_expired,
                login_at: user.login_at,
                user: {
                    id: user.id,
                    provider: user.provider,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                },
            },
        });
    } catch (error) {
        return { error };
    }
};


const checkIn = async (req, res) => {
    try{
        const user_id = req.query.user_id ;
        const year = req.query.year ;
        const month = req.query.month ;
        const day = req.query.day ;
        let hasCheckedIn ;
        const firstCheckIn = await User.isTodayCheckIn(user_id, year, month, day) ;
        if (firstCheckIn){
            const continueDay = await User.lastDayCon(user_id, year, month, day) ;
            console.log(continueDay) ;
            var checkInResult = await User.checkIn(user_id, year, month, day, continueDay) ;
            var reward = await User.reward(user_id, continueDay) ;
            hasCheckedIn = false ;
        }else{
            hasCheckedIn = true ;
        }
        res.status(200).json({
            user_id : user_id,
            hasCheckedIn : hasCheckedIn,
            dates : checkInResult,
            reward : reward,
            continueDay : continueDay
        }) ;
        
    }catch(error){
        return { error } ;
    }
} ;


const logout = async (req, res) => {
    const id = 10240 ;
    try{
        const lastLogin = await User.findLastLogin(id) ;
        User.logout(lastLogin.id) ;
        res.status(200).json({}) ;
    }catch(error){
        return { error } ;
    }
    
};

const favorite = async (req, res) => {
    const product_id = req.body.product_id ;
    const user_id = req.body.user_id ;
    try{
        const result = await User.favorite(user_id, product_id) ;
        res.status(200).json({
            user_id : user_id,
            product_id : product_id,
            favorited : true
        }) ;
    }catch(error){
        return { error } ;
    }
}

const deleteFavorite = async (req, res) => {
    const product_id = req.body.product_id ;
    const user_id = req.body.user_id ;
    try{
        await User.deleteFavorite(user_id, product_id) ;
        res.status(200).json({
            user_id : user_id,
            product_id : product_id,
            favorited : false
        }) ;
    }catch(error){
        return {error} ;
    }
} 

const getFavorite = async (req, res) => {
    const user_id = req.query.user_id ;
    const product_id = req.query.product_id ;
    let favorite ;
    try{
        const result = await User.getFavorite(user_id, product_id) ;
        if (result.length === 0){
            favorite = false ;
        }else{
            favorite = true ;
        }
        res.status(200).json({
            user_id : user_id,
            product_id : product_id,
            favorited : favorite
        }) ;
        return ;
    }catch(error){
        return {error} ;
    }
}

const healthCheck = async (req, res) => {
    res.status(200).json({ok:"OK"}) ;
}


const facebookSignIn = async (accessToken) => {
    if (!accessToken) {
        return { error: 'Request Error: access token is required.', status: 400 };
    }

    try {
        const profile = await User.getFacebookProfile(accessToken);
        const { id, name, email } = profile;

        if (!id || !name || !email) {
            return { error: 'Permissions Error: facebook access token can not get user id, name or email' };
        }

        return await User.facebookSignIn(id, User.USER_ROLE.USER, name, email);
    } catch (error) {
        return { error: error };
    }
};

const signIn = async (req, res) => {
    const data = req.body;

    let result;
    switch (data.provider) {
        case 'native':
            result = await nativeSignIn(data.email, data.password);
            break;
        case 'facebook':
            result = await facebookSignIn(data.access_token);
            break;
        default:
            result = { error: 'Wrong Request' };
    }

    if (result.error) {
        const status_code = result.status ? result.status : 403;
        res.status(status_code).send({ error: result.error });
        return;
    }
    const user = result.user;
    if (!user) {
        res.status(500).send({ error: 'Database Query Error' });
        return;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
        },
    });
};

const getUserProfile = async (req, res) => {
    res.status(200).send({
        data: {
            id: req.user.id,
            provider: req.user.provider,
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture,
        },
    });
    return;
};

const checkReward = async(req, res) => {
    const user_id = req.query.user_id ;
    try{
        const results = await User.checkReward(user_id) ;
        res.status(200).json({
            user_id : user_id,
            reward : results
        }) ;
    }catch(error){
        return { error: error };
    }
} ;

const reward = async (req, res) => {
    const {user_id, reward_id} = req.body ;
    try{
        const result = await User.reward(user_id, reward_id) ;
        res.status(200).json({
            user_id : user_id,
            reward : result
        }) ;
    }catch(error){
        return {error : error} ;
    }
} ;

const useReward = async (req, res) => {
    const {user_id, rewardrecord_id} = req.body ;
    try{
        const result = await User.useReward(user_id, rewardrecord_id) ;
        res.status(200).json({
            user_id : user_id,
            reward : result
        }) ;
    }catch(error){
        return {error : error} ;
    }
}

module.exports = {
    signUp,
    nativeSignIn,
    logout,
    checkIn,
    favorite,
    deleteFavorite,
    getFavorite,
    healthCheck,
    signIn,
    getUserProfile,
    checkReward,
    useReward,
    reward
};
