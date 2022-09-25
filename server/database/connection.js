const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_DB_URI, {useNewUrlParser: true})
	.then(res => {
		console.log("connected to database")
	})
	.catch(err => {
		console.log("unable to connect! ", err)
	}) 
