const jwt = require('jsonwebtoken')
const User = require('../models/users')

const auth = async (req, res, next) =>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        const user = await User.findOne({ _id: decoded._id })
    
    if(!user){
        res.status(401).send({ error: 'Please Authenticate' })
    }

    req.token = token
    req.user = user
    next()
    } catch (e) {
        res.status(500).send()
    }
}

module.exports = auth