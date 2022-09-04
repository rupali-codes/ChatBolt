const User = require('../models/user')
const verify = require('../authentication/verify')

const getUserById = async (id) => {
	return await User.findById({_id: id})
	// if(!user) return {
	// 	error: "user not found"
	// }

	// return user
}


module.exports = {
	getUserById
}