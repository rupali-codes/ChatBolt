const User = require('../models/user')
const verify = require('../authentication/verify')

const getUserById = async (reciever) => {
	return await User.findById({_id: reciever})
}

const getALLUsers = async () => await User.find()

module.exports = {
	getUserById,
	getALLUsers
}