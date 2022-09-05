require('dotenv').config()
require('./database/connection')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const ejs = require('ejs')
const cookieParser = require('cookie-parser')
const socketio = require('socket.io')
const http = require('http')
const { getUserById } = require('./utils/user')
const { generateMessage, getAllMessages } = require('./utils/message')
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

io.on('connection',  async (socket) => {
	console.log("new websocket connection, ", socket.id)

		req.user.userSocketId = socket.id
		await req.user.save()

		socket.on('sendMessage', async (message, callback) => {
			console.log("sendMessage:, ")
			
			const msg = await generateMessage(req.user._id, req.user.userSocketId, message.friendId, message.friendSocketId, message.text)
			// socket.emit('sender', msg)
			console.log("message: ",msg)
			socket.emit('sender', msg)

			console.log(msg)

			io.to(msg.recieverSocketId).emit('reciever', msg)
			callback()
		})

		socket.on('toFriend', async (id, callback) => {
			const user = await getUserById(id)
			console.log("USER: ", user)
			socket.emit('to-friend-profile', {
				id: user._id,
				name: user.name,
				username: user.username
			})
		})

		// *** to be continued
		// socket.on('conv', ({sender, reciever}) => {
		// 	const allConv = getAllMessages()

		// 	console.log(allConv)
		// 	for(msg of allConv) {
		// 		if(msg.sender == sender) {
		// 			socket.emit('sender', msg)
		// 		} else  {
		// 			socket.to()
		// 		}
		// 	}
		// })

	// })
})
})

server.listen(port, () => {
	console.log(`server running at port ${port}`)
})
