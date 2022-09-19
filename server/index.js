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
const { generateMessage, setNewConv, getAllMessages } = require('./utils/message')
const verify = require('./authentication/verify')
const User = require('./models/user')

const publicDirPath = path.join(__dirname, '../public')
const viewsDirPath = path.join(__dirname, '../views')
const partialsDirPath = path.join(__dirname, '../views/paritials')

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



app.get('/user/chats', verify, (req, res) => {
	res.render('chats')
})

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

			if(reciever.userSocketId != socket.id) {
				console.log("true")
				socket.to(reciever.userSocketId).emit('reciever', msg)
			} else {
				console.log("false")
				socket.to(reciever.userSocketId).emit('reciever', msg)
			}

			socket.broadcast.to(socket.id).emit('reciever', msg)

			callback()
		})

		socket.on('toFriend', async (reciever, callback) => {
			const user = await getUserById(reciever)
			socket.emit('to-friend-profile', {
				id: user._id,
				name: user.name,
				username: user.username
			})
		})

		socket.on('conv', async ({senderId, recieverId}) => {
			let allConv = await getAllMessages(senderId)
			const currentUser = await getUserById(senderId)
			const reciever = await getUserById(recieverId)

			if(!allConv) {
				console.log('no message found')
			}

			console.log("length: ", allConv.length)

			console.log("conv: ", allConv)
			for(msg of allConv) {
				if(msg.sender == senderId) {
					socket.to(currentUser.userSocketId).emit('sender', msg)
					socket.to(reciever.userSocketId).emit('reciever', msg)	
				} else {
					socket.to(currentUser.userSocketId).emit('reciever', msg)
					socket.to(reciever.userSocketId).emit('sender', msg)
				}
			}
		
		})
  
})

server.listen(port, () => {
	console.log(`server running at port ${port}`)
})