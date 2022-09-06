const Message = require('../models/message')

const generateMessage = async (senderId, senderSocketId, recieverId, recieverSocketId, text) => {
	try {
		const msg = new Message({
			sender: senderId,
			reciever: recieverId,
			text
		})

		await msg.save()
		
		return {
			senderId,
			senderSocketId,
			recieverId,
			recieverSocketId,
			text,  
			createdAt: new Date().getTime()
		}
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