const express = require('express')
const User = require('../models/user')
const router = new express.Router()

router.get('/msg', (req, res) => {
	res.send("Hello World! message")
})

module.exports = router