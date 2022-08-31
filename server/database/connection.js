const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true})
	.then(res => {
		console.log("connected to database")
	})
	.catch(err => {
		console.log("unable to connect! ", err)
	}) 