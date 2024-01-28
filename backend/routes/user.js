const express = require('express');
const usersRouter = express.Router();
const JWT = require('jsonwebtoken');
const zod = require('zod');
const { User } = require('../db');
const { dbConnection, disconnectDbConnection } = require('../models/dbConnection')

// Define the user schema for validating the input
const userSchema = zod.object({
    firstName: zod.string(),
    lastName: zod.string(),
    email: zod.string().email(),
    password: zod.string()
})

// Define the user router
usersRouter.get('/', (req, res) => {
    res.send('users')
})

// Middleware for validating user input
const validateUserInput = (schema) => {
    return (req, res, next) => {
        const validated = schema.safeParse(req.body);
        if (!validated.success) {
            return res.status(400).json({ error: validated.error });
        }
        next();
    };
};

// Define the signup route
usersRouter.post('/signup', validateUserInput(userSchema), async (req, res) => {

    // Extract the data from the request body
    const { firstName, lastName, email, password } = req.body

    try {
        // Connect to the MongoDB server
        await dbConnection()
        console.log('Connected to MongoDB..2');

        const user = await User.findOne({ email });

        if (user) {
            return res.status(411).json({
                message: "Email already taken / Incorrect inputs"
            })
        }
        else {
            // Create a new user
            const newUser = new User({ firstName, lastName, email, password })
            try {

                const hashedPassword = await newUser.createHash(req.body.password);
                newUser.password = hashedPassword;

                await newUser.save();
                console.log('User created successfully');

                // Create a JWT token
                const tokenToReturn = JWT.sign({ firstName, lastName, email, password }, process.env.JWT_SECRET);
                res.send(tokenToReturn);
            } catch (err) {
                res.status(500).send(err.message);
            }
        }
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        // Close the connection only if it was successfully opened
        await disconnectDbConnection()
    }
})


// Define the signin route
usersRouter.post('/signin', validateUserInput(userSchema), async (req, res) => {

    // Extract the data from the request body
    const { email, password } = req.body

    try {
        // Connect to the MongoDB server
        await dbConnection()
        console.log('Connected to MongoDB..3');

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(411).json({
                message: "User Does not Exists"
            })
        } else {
            const isMatch = await user.validatePassword(req.body.password);
            if (!isMatch) {
                return res.status(411).json({
                    message: "Incorrect inputs"
                })
            }
            // Create a JWT token
            const tokenToReturn = JWT.sign({ email, password }, process.env.JWT_SECRET);
            res.send(tokenToReturn);
        }

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } finally {
        // Close the connection only if it was successfully opened
        await disconnectDbConnection()
        return
    }
})

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
};

// Add the error handler middleware at the end of your middleware stack
usersRouter.use(errorHandler);

module.exports = usersRouter;