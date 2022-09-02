const User = require('../models/user')
const verify = require('../authentication/verify')

const getUser = async (id) => {
	const user = await User.findById(id)
	if(!user) return {
		error: "user not found"
	}

	return user
}


module.exports = {
	getUser
}