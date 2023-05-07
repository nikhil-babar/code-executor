const router = require('express').Router();
const authMiddleware = require('../middleware/auth.middleware');
require('dotenv').config()

router.get('/google', (req, res, next) => authMiddleware.googleAuth(req, res, next, { grant_type: 'code' }), async (req, res) => {
    try {
        res.redirect('/auth/getAuthStatus')
    } catch (error) {
        res.sendStatus(500)
    }
})

router.get('/github', (req, res, next) => authMiddleware.githubAuth(req, res, next, { grant_type: 'code' }), async (req, res) => {
    try {
        res.redirect('/auth/getAuthStatus')
    } catch (error) {
        res.sendStatus(500)
    }
})

router.get('/getAuthStatus', (req, res, next) => authMiddleware.githubAuth(req, res, next, { grant_type: 'refresh_token' }), (_req, res) => res.sendStatus(200))

module.exports = router