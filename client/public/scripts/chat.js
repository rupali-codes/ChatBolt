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

const mobUserProfile = document.querySelector('#mob__user__profile')
const mobChat = document.querySelector('#mob__chat')
const mobFriends = document.querySelector('#mob__friends')
const sbarBtn = document.querySelector('#sbar__btn')
const closeSbarBtn = document.querySelector('#close__sbar__btn')
const closeUserProfileBtn = document.querySelector('#close__user__profile__btn')
const closeFriendsBtn = document.querySelector('#close__friends__btn')
const sbar = document.querySelector('#sbar')
const toFriends = document.querySelector('#to__friends')
const toUserProfile = document.querySelector('#to__user__profile')
const userProfilePic = document.querySelector('#user__profile__pic')

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

const avatars = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9']

const randomNum = Math.floor(Math.random()*9) + 1

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

		console.log(randomNum)

		userProfilePic.src = `/img/avatars/${avatars[randomNum]}.png`
 
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

sbarBtn.addEventListener('click', (e) => {
	e.preventDefault()

	sbar.classList.remove('hidden')
	sbarBtn.classList.add('hidden')
	mobChat.classList.add('hidden')
	closeSbarBtn.addEventListener('click', (e) => {
		e.preventDefault()

		mobChat.classList.remove('hidden')
		sbar.classList.add('hidden')
		sbarBtn.classList.remove('hidden')
		mobUserProfile.classList.add('hidden')

	})

	toUserProfile.addEventListener('click', (e) => {
		e.preventDefault()

		mobUserProfile.classList.remove('hidden')
		mobChat.classList.add('hidden')
		sbarBtn.classList.remove('hidden')
		sbar.classList.add('hidden')
		mobFriends.classList.add('hidden')

		closeUserProfileBtn.addEventListener('click', (e) => {
			e.preventDefault()

			mobChat.classList.remove('hidden')
			sbar.classList.add('hidden')
			sbarBtn.classList.remove('hidden')
			mobUserProfile.classList.add('hidden')

		})
	})

	toFriends.addEventListener('click', (e) => {
		e.preventDefault()

		mobFriends.classList.remove('hidden')
		mobChat.classList.add('hidden')
		sbarBtn.classList.remove('hidden')
		sbar.classList.add('hidden')
		mobUserProfile.classList.add('hidden')

		closeFriendsBtn.addEventListener('click', (e) => {
			e.preventDefault()

			mobChat.classList.remove('hidden')
			sbar.classList.add('hidden')
			sbarBtn.classList.remove('hidden')
			mobFriends.classList.add('hidden')
		})
	})

})
