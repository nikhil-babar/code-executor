const { default: axios } = require('axios')
const { URL, URLSearchParams } = require('url')
require('dotenv').config()


module.exports = async function getGoogleAuth({ code }) {
    try {
        const baseUrl = new URL(process.env.TOKEN_URI)

        const options = {
            grant_type: 'authorization_code',
            redirect_uri: process.env.REDIRECT_URI,
            client_secret: process.env.CLIENT_SECRET,
            client_id: process.env.CLIENT_ID,
            code
        }

        const params = new URLSearchParams()
        Object.entries(options).forEach(([key, value]) => params.append(key, value))

        const res = await axios.post(baseUrl.href, params.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })

        console.log(res.data)

        return res.data
    } catch (err) {
        console.log(err.message)

        return null
    }
}