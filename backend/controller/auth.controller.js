const jwt = require('jsonwebtoken');
const UserDynamo = require('../models/userDynamo');

//Register | Create User Router controller
const RegisterUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({
                status: false,
                message: "Email and password are required"
            });
        }

        try {
            // Create new user
            const user = await UserDynamo.createUser({ email, password });

            // Generate JWT
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    throw err;
                }
                // Send token in response upon successful registration
                res.status(200).json({
                    status: true,
                    token: token,
                    message: "✨ :: User registered successfully!",
                });
            });
        } catch (error) {
            if (error.message.includes('User already exists')) {
                return res.status(400).send({
                    status: false,
                    message: "⚠️ :: User Already Exists!",
                });
            }
            throw error;
        }
    } catch(err) {
        return res.status(500).send({
            status: false,
            message: "☠️ :: Server Error: " + err.message,
        });
    }
}

//Login | Create User Router controller
const LoginUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({
                messageEmail: "Email and password are required"
            });
        }

        // Validate user credentials
        const validation = await UserDynamo.validateUserCredentials(email, password);
        
        if (!validation.valid) {
            if (validation.message.includes('Email')) {
                return res.status(400).send({
                    messageEmail: validation.message
                });
            } else {
                return res.status(400).send({
                    messagePw: validation.message
                });
            }
        }

        // Generate JWT
        const payload = { 
            user: {
                id: validation.user.id
            }
        };
                
        jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: 3600 }, (err, token) => {
            if(err){
                throw err;
            }
            return res.json({
                token: token,
                message: "🔓 :: Access Granted!"
            });
        });
    } catch(err) {
        return res.status(500).send({
            status: false,
            message: "☠️ :: Server Error: " + err.message,
        });
    }
}

module.exports = {
    RegisterUser,
    LoginUser,
}