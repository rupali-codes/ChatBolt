const socket = io()

const getMessageTemplate = document.querySelector('#get__message__template').innerHTML
const sendMessageTemplate = document.querySelector('#send__message__template').innerHTML
const userProfileTemplate = document.querySelector('#user__profile__template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar__template').innerHTML
const friendProfileTemplate = document.querySelector('#friend__profile__template').innerHTML

const chatMessages = document.querySelector('#chat__messages')
const userProfile = document.querySelector('#user__profile')
const sidebar = document.querySelector('#sidebar')
const friendProfile = document.querySelector('#friend__profile')
const friend = document.querySelector('#friend')

const messageForm = document.querySelector('#message__form')
const messageInput = document.querySelector('#message__input')
const sendButton = document.querySelector('#send__message__btn')
const addFriendForm = document.querySelector('#add__friend__form')
const addFriendBtn = document.querySelector('#add__friend__btn')


const autoscroll = () => {
	const newMessage = chatMessages.lastElementChild

	const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = chatMessages.offsetHeight

    // Height of messages container
    const containerHeight = chatMessages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = chatMessages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        chatMessages.scrollTop = chatMessages.scrollHeight
    }
}

//socket.io events
socket.on('reciever', (message) => {
	console.log("We got message")
	const html = Mustache.render(getMessageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	chatMessages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})

socket.on('sender', (message) => {
	console.log("we are about to send a message")
	const html = Mustache.render(sendMessageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	chatMessages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})

socket.on('friends-data', ({friends}) => {
	const html = Mustache.render(sidebarTemplate, {
		friends
	})
	sidebar.innerHTML = html
})

socket.on('to-friend-profile', (friend) => {
	const html = Mustache.render(friendProfileTemplate, {
		name: friend.name
	})

	friendProfile.innerHTML = html
})

//custom events

;( function() {
	fetch('/user/chats/friends')
	.then(res => res.json())
	.then(friends => {
		console.log(friends)
		const html = Mustache.render(sidebarTemplate, {
			friends
		})

		sidebar.innerHTML = html
	})
})()

;(function() {
	fetch('/user/profile')
	.then(res => res.json())
	.then(user => {
		const html = Mustache.render(userProfileTemplate, {
			userId: user.userId,  
			userSocketId: user.userSocketId,
			name: user.name.charAt(0).toUpperCase() + user.name.slice(1), 
			username: user.username,
			email: user.email
		})

		userProfile.innerHTML = html
	})
})()

sidebar.addEventListener('click', (e) => {
	e.preventDefault()
	const friendId = e.target.querySelector('#friendId').innerHTML
	const friendSocketId = e.target.querySelector('#friendSocketId').innerHTML
	const userId = document.querySelector('#userId').innerHTML
	const userSocketId = document.querySelector('#userSocketId').innerHTML

	// *** to be continued
	// chatMessages.textContent = ''
	// socket.emit('conv', ({sender: userId, reciever: friendId}), (error) => {
	// 	if(error)
	// 		console.log("conv error: ", error)
	// })	

	sendButton.addEventListener('click', (e) => {
		e.preventDefault()
		const message = {
			text: messageInput.value,
			userId,  
			userSocketId,
			friendId,
			friendSocketId
		}
		// sendButton.setAttribute('disabled', 'disabled')
		

		socket.emit('sendMessage', message, (error) => {
			// sendButton.removeAttribute('disabled')
			messageInput.value = ''
			messageInput.focus()

			if(error) {
				console.log("could not send message: ", error)
			}
		})

		console.log('message', message)
	});


	socket.emit('toFriend', friendId, (error) => {
		if(error) {
			console.log("friend profile error, ", error)
		}
	})

})
