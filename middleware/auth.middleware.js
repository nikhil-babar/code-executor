const { default: axios } = require('axios')
require('dotenv').config()

module.exports = async (req, res, next) => {
    try {
        if (!req.session.token) {
            console.log('no session stored')
            return res.sendStatus(403)
        }

        const { access_token } = req.session.token
        const response = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
            params: {
                access_token
            }
        })

        console.log('Access token verified', response.data)
        next()
    } catch (e) {
        if (e?.response.status != 400) return res.sendStatus(403)

        try {

            console.log("Token expired")

            const baseUrl = new URL(process.env.TOKEN_URI)

            const options = {
                grant_type: 'refresh_token',
                client_secret: process.env.CLIENT_SECRET,
                client_id: process.env.CLIENT_ID,
                refresh_token: req.session.token.refresh_token
            }

            const params = new URLSearchParams()
            Object.entries(options).forEach(([key, value]) => params.append(key, value))

            console.log(params.toString())

            const response = await axios.post(baseUrl.href, params.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })

            console.log(response.data)

            req.session.token = {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in
            }

            next()
        } catch (error) {
            console.log(error.message)

            res.sendStatus(403)
        }
    }
}