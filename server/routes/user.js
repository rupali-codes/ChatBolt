const express = require('express')
const User = require('../models/user')
const verify = require('../authentication/verify')
const router = new express.Router()

router.get('/', (req, res) => {
	res.render('index')
})

router.get('/signup', (req, res) => {
	res.render('signup')
})

router.get('/signin', (req, res) => {
	res.render('signin')
})

router.get('/user/chats', verify, (req, res) => {
	res.render('chats')
})


// router.get('/error', (req, res) => {
// 	res.render('error', {
// 			status: 400,
// 			msg: 'Unable to create account',
// 			error: 'uncaught error'
// 		})
// })


//creating user
router.post('/user/signup', async (req, res) => {
	try {
		const user = new User(req.body)
		const token = await user.generateJwtToken()
 
		await user.save()
		res.cookie("jwt", token)
		res.status(200)
		res.redirect('chats')
	} catch(err) {
		res.render('error', {
			status: 400,
			msg: 'Unable to create account',
			error: err.message
		})

	}
})

//logging in
router.post('/user/signin', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateJwtToken()

		if(!user) res.status(404).send({msg: "user not found"})

		res.cookie("jwt", token)
		res.status(200)
		res.redirect('/user/chats')
	} catch (err) {
		res.render('error', {
			status: 400,
			msg: 'User not found',
			error: err.message
		})
	}
})

//updating user profile
router.post('/user/updateProfile', verify, async (req, res) => {
	try {
		const user = req.user 
		user.name = req.body.name ? req.body.name : user.name
		user.username = req.body.username ? req.body.username : user.username
		user.email = req.body.email ? req.body.email : user.email
		user.password = req.body.password ? req.body.password : user.password

		await user.save()
		res.redirect('/user/chats')
	} catch (err) {
		res.render('error', {
			status: 400,
			msg: 'Can not update user profile',
			error: err.message
		})
	}
})

//logging out
router.post('/user/signout', verify, async(req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

		await req.user.save()
		res.status(200).redirect('/')

	} catch(err) {
		res.render('error', {
			status: 400,
			msg: 'Something went wrong',
			error: err.message
		})
	} 
})

//adding a friend
router.post('/user/chats/addFriend', verify, async (req, res) => {
	try {
		const user = await User.findOne({username: req.body.username})
		if(!user) res.send({
			msg: "user not found"
		})
		await req.user.friends.push(user._id)
		await req.user.save()
		res.redirect('/user/chats')
	} catch(err) {
		res.render('error', {
			status: 404,
			msg: 'Friend not found',
			error: err.message
		})
	}
})

//removing a friend
router.post('/user/chats/removeFriend/:id', verify, async (req, res) => {
	try {
		const id = req.params.id
		console.log("ID: ", id)
 
	 	req.user.friends = req.user.friends.filter(frnd => frnd._id != id)
	 	await req.user.save()

	 	res.redirect('/user/chats')
	} catch (err) {
		res.render('error', {
			status: 400,
			msg: 'Could not remove friend',
			error: err.message
		})
	}
})

router.get('/user/chats/friends', verify,  async (req, res) => {
	try {
		let allFrnds = []
		for (f of req.user.friends) {
			const user = await User.findById(f)
			allFrnds.push({
				reciever: user._id,
				name:  user.name.charAt(0).toUpperCase() + user.name.slice(1),
				username: user.username
			})
		}

		res.send(allFrnds)
	} catch(err) {
		res.render('error', {
			status: 404,
			msg: 'Unable to get friends',
			error: err.message
		})	}
})

router.get('/user/profile', verify, (req, res) => {
	try {
			const user = {
				userId: req.user._id,
				userSocketId: req.user.userSocketId,
				name: req.user.name, 
				username: req.user.username,
				email: req.user.email
			}
			res.send(user)
	} catch (err) {
		res.render('error', {
			status: 400,
			msg: 'Unable to get user profile',
			error: err.message
		})
	}
})

module.exports = router 