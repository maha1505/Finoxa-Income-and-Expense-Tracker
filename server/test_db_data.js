const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables relative to this file
dotenv.config({ path: path.join(__dirname, '.env') });

const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function testConnection() {
    console.log('Using MONGO_URI:', process.env.MONGO_URI);
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set in environment variables!');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB.');

        // Get collection counts
        const userCount = await User.countDocuments();
        const transactionCount = await Transaction.countDocuments();
        console.log(`Total Users: ${userCount}`);
        console.log(`Total Transactions: ${transactionCount}`);

        if (transactionCount > 0) {
            // Find earliest and latest transaction dates
            const earliest = await Transaction.findOne().sort({ date: 1 });
            const latest = await Transaction.findOne().sort({ date: -1 });
            console.log(`Earliest Transaction Date: ${earliest.date} (${earliest.type}, amount: ${earliest.amount})`);
            console.log(`Latest Transaction Date: ${latest.date} (${latest.type}, amount: ${latest.amount})`);

            // Sample some transactions
            const samples = await Transaction.find().limit(5);
            console.log('Sample transactions:', JSON.stringify(samples, null, 2));
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error connecting or querying database:', err);
        process.exit(1);
    }
}

testConnection();
