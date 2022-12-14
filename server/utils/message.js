const Message = require('../models/message')
const Conversation = require('../models/conversation')

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

const deleteMessage = async (msgId) => {
	try {
		await Message.findByIdAndDelete({_id: msgId})

		await Message.save()
	} catch (err) {
		return {
			msg: "can not delete message",
			err: err.message
		}
	}
}

const setNewConv = async (member1, member2, message) => {
	try {
		const conv = new Conversation ({
			member1,
			member2,
			messages: message
		})

		return await conv.save()
	} catch(err) {
		return {
			msg: "can not set new coneversation",
			err: err.message
		}
	}
}

const getAllMessages = async () => {
	try {
		const messages = await Message.find()
		return messages
	} catch(err) {
		console.log("can not get messages, Error: ", err)
	}
}

module.exports = {
	generateMessage, 
	deleteMessage,
	setNewConv,
	getAllMessages
} 