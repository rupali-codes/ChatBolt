require('dotenv').config()
require('./database/connection')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const ejs = require('ejs')
const cookieParser = require('cookie-parser')
const socketio = require('socket.io')
const http = require('http')
const { getUserById, getALLUsers } = require('./utils/user')
const { generateMessage, deleteMessage, setNewConv, getAllMessages } = require('./utils/message')
const verify = require('./authentication/verify')
const User = require('./models/user')

const publicDirPath = path.join(__dirname, '../client/public')
const viewsDirPath = path.join(__dirname, '../client/views')
const partialsDirPath = path.join(__dirname, '../client/views/paritials')

const app = express()
const port = process.env.PORT

const userRouter = require('./routes/user')
const messageRouter = require('./routes/message')

const test = "hey testing"

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(publicDirPath))
app.use(userRouter)
app.use(messageRouter)
app.set('view engine', 'ejs')
app.set('views', viewsDirPath)
app.use(cookieParser())

const server = http.createServer(app)
const io = socketio(server)

io.on('connection',  async (socket) => {
	console.log("new websocket connection, ", socket.id)

		socket.on('join', async (currentUserId, callback) => {
			const currentUser = await getUserById(currentUserId)
			console.log("current user: ", currentUser.name, socket.id)

			currentUser.userSocketId = socket.id
			await currentUser.save()
			callback()
		})
	
		socket.on('sendMessage', async (message, callback) => {

			console.log('sendMessage Called')

			const msg = await generateMessage(message.senderId, message.recieverId, message.text)
			const reciever = await getUserById(message.recieverId)
			socket.emit('sender', msg)

			if(reciever.userSocketId != socket.id ) {
				console.log("true")
				socket.to(reciever.userSocketId).emit('reciever', msg)
			} 
			

			socket.broadcast.to(socket.id).emit('reciever', msg)

			callback()
		})

		socket.on('toFriend', async ({senderId, recieverId}, callback) => {
			const reciever = await getUserById(recieverId)
			const currentUser = await getUserById(senderId)

			console.log("curret: ", currentUser.userSocketId)
			let allConv = await getAllMessages()

			if(!allConv) {
				console.log('no message found')
			} 

			for(msg of allConv) {
				if(msg.sender == senderId && msg.reciever == recieverId) {
					socket.emit('sender', msg)
				} 

				if(msg.sender == recieverId && msg.reciever == senderId) {
					socket.emit('reciever', msg)
				}
			}


			socket.emit('to-friend-profile', {
				id: reciever._id,
				name: reciever.name,
				username: reciever.username
			})

			callback()
		})

		socket.on('removeMessage', async (messageId, callback) => {
			await deleteMessage(messageId)
		})
  
})

server.listen(port, () => {
	console.log(`server running at port ${port}`)
}) 