const mongoose = require('mongoose')

const convSchema = mongoose.Schema({
	member1: {
		type: mongoose.Schema.Types.ObjectId
	},
	member2: {
		type: mongoose.Schema.Types.ObjectId
	},
	messages: [{
		type: Object, 
		ref: 'Message'
	}]
})

module.exports = new mongoose.model('Conversation', convSchema)
