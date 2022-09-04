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

const generateMessage = (text) => {
	return {
		text,  
		createdAt: new Date().getTime()
	}
}

io.on('connection', (socket) => {
	console.log("new websocket connection, ", socket.id)
	// socket.on('join', (options, callback) => {
	// 	console.log("join")
		
		socket.on('toFriend', async (id, callback) => {
			const user = await getUserById(id)
			console.log("USER: ", user)
			socket.emit('to-friend-profile', {
				_id: user._id,
				name: user.name, 
				username: user.username
			})

			socket.on('sendMessage', (message, callback) => {
				console.log("sendMessage")
				console.log("message: ",message)
				const msg = generateMessage(message)
				socket.emit('sender', msg)
				socket.to(user)
				callback()
			})

		})


	// })
})

server.listen(port, () => {
	console.log(`server running at port ${port}`)
})
