const Message = require('../models/message')

const generateMessage = async (sender, reciever, text) => {
	try {
		const msg = new Message({
			sender,
			reciever,
			text,
			createdAt: new Date().getTime()
		})

		return await msg.save() 
	} catch(err) {
		return {
			msg: "can not generate message",
			err: err.message
		}
	}
}

const getAllMessages = async (sender) => {
	try {
		const messages = await Message.find({sender})
		return messages
	} catch(err) {
		console.log("can not get messages, Error: ", err)
	}
}

module.exports = {
	generateMessage, 
	getAllMessages
} 