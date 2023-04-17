const router = require('express').Router();
const jwt = require('jsonwebtoken');
const getGoogleAuth = require('../utils/getGoogleAuth');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');
require('dotenv').config()

router.get('/google', async (req, res) => {
    try {
        const { code } = req.query
        const token = await getGoogleAuth({ code })
        const user = jwt.decode(token.id_token)

        if (!user || !user.email_verified) {
            return res.sendStatus(403)
        }

        await User.findOneAndUpdate({
            email: user.email
        }, { ...user }, { upsert: true, new: true })

        req.session.token = {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_in: token.expires_in
        }

        res.redirect('/auth/getAuthStatus')
    } catch (error) {
        console.log('Route error' + error.message)

        res.sendStatus(500)
    }
})

router.get('/getAuthStatus', authMiddleware, (_req, res) => res.sendStatus(200))

module.exports = router