const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
	sender: {
		type: String,
		ref: 'User'
	}, 
	reciever: {
		type: String, 
		ref: 'User'
	},
	text: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
})

module.exports = new mongoose.model('Message', messageSchema)