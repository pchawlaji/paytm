const mongoose = require('mongoose')
require('dotenv').config();

// Define the MongoDB connection URI with the database name
const uri = `${process.env.MONGODB_URI}/paytym`; // "paytym" is your database name

async function dbConnection() {
    try {
        console.log(uri)
        // Connect to the MongoDB server
        const client = await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        return client
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function disconnectDbConnection() {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

module.exports = { dbConnection, disconnectDbConnection }