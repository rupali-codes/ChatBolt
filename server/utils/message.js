const Message = require('../models/message')

const generateMessage = async (senderId, senderSocketId, recieverId, recieverSocketId, text) => {
	try {
		const msg = new Message({
			sender: senderId,
			reciever: recieverId,
			text
		})

		console.log("genMSg: ", msg)

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

const getAllMessages = () => {
	return Messages.find()
}

module.exports = {
	generateMessage,
	getAllMessages
}