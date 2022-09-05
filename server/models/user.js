const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const UserSchema = mongoose.Schema({
	name: {
		type: String,
		require: true
	},  
	username: {
		type: String,  
		unique: true
	},  
	email: {
		type: String,
		unique: true
	}, 
	password: {
		type: String,
		minlength: 8
	},
	friends: [{
		type: mongoose.Schema.Types.ObjectId
	}],
	tokens: [{
		token: {
			type: String, 
			require: true
		}
	}], 
	userSocketId: {
		type: String
	}

})

//generating token
UserSchema.methods.generateJwtToken = async function () {
	//using current user's id to generate token
	const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET) 
	this.tokens = this.tokens.concat({token})
	await this.save()
	return token
}

//logging in user
UserSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({email})

	if(!user) throw new Error("user not found")
	const isValidPswd = bcrypt.compare(password, user.password)
	if(!isValidPswd) throw new Error("incorrect password")

	return user
}

//hashing password before saving it
UserSchema.pre('save', async function (next) {
	if(this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8)
	}
	next()
}) 	 

const User = new mongoose.model('User', UserSchema)

module.exports = User