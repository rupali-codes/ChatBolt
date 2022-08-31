const jwt = require('jsonwebtoken')
const User = require('../models/user')

const verify = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '')
		console.log("token: ", token)
		const decoded = jwt.verify(token, process.env.JWT_SECRET, {
			expiresIn: 60000
		})

		const user = await User.findOne({_id: decoded._id, "tokens.token": token})
		if(!user) throw new Error("user not found")

		req.user = user
		req.token = token
		next()	
	} catch(err) {
		console.log("can not verify user! \n", err.message)
		res.status(400).send(err.message)
	}
}

module.exports = verify
