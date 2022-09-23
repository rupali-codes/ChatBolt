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
const chatsTemp = document.querySelector('#chats__temp')
const userDetails = document.querySelector('#user__details')

const updateProfileForm = document.querySelector('#update__profile__form')
const messageForm = document.querySelector('#message__form')
const messageInput = document.querySelector('#message__input')
const sendButton = document.querySelector('#send__message__btn')
const addFriendForm = document.querySelector('#add__friend__form')
const addFriendBtn = document.querySelector('#add__friend__btn')
const editProfileBtn = document.querySelector('#edit__profile__btn')
const updateProfileBtn = document.querySelector('#update__profile__btn')


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

socket.on('connect', () => {
	console.log('conncted socket it: ', socket.id)
})

//socket.io events
socket.on('reciever', (message) => {
	const html = Mustache.render(getMessageTemplate, {
		id: message._id,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	chatMessages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})

socket.on('sender', (message) => {
	const html = Mustache.render(sendMessageTemplate, {
		id: message._id,
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
		id: friend.id,
		name:  friend.name.charAt(0).toUpperCase() + friend.name.slice(1),
		username: friend.username
	})

	friendProfile.innerHTML = html
})

//custom events

;( function() {
	fetch('/user/chats/friends')
	.then(res => res.json())
	.then(friends => {
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
 
		socket.emit('join', user.userId, (err) => {
			if(err) console.log(err)
		})

		userProfile.innerHTML = html
	})
})()

sidebar.addEventListener('click', (e) => {
	e.preventDefault()
	const recieverId = e.target.querySelector('#reciever').innerHTML
	const senderId = document.querySelector('#sender').innerHTML

	chatsTemp.classList.add('hidden')

	chatMessages.textContent = ''	

	sendButton.addEventListener('click', (e) => {
		e.preventDefault()
		const message = {
			text: messageInput.value,
			senderId,  
			recieverId
		}
		
		socket.emit('sendMessage', message, (error) => {
			// sendButton.removeAttribute('disabled')
			messageInput.value = ''
			messageInput.focus()

			if(error) {
				console.log("could not send message: ", error)
			}
		})
 
	});


	socket.emit('toFriend', ({senderId, recieverId}), (error) => {
		if(error) {
			console.log("friend profile error, ", error)
		}
	})

})  

editProfileBtn.addEventListener('click', (e) => {
	e.preventDefault()

	userProfile.classList.toggle('hidden')
	updateProfileForm.classList.toggle('hidden')

})

updateProfileBtn.addEventListener('click', (e) => {

	userProfile.classList.remove('hidden')
	updateProfileForm.classList.add('hidden')

})


//delete message
chatMessages.addEventListener('click', (e) => {
	const messageId = e.target.parentElement.querySelector('#sId').innerHTML
	socket.emit('removeMessage', messageId, (error) => {
		if(error) {
			console.log("friend profile error, ", error)
		}
	})

	window.location.reload(true)

})
