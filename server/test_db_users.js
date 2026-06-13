const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function analyzeUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        console.log(`Analyzing ${users.length} users:`);

        for (const user of users) {
            const count = await Transaction.countDocuments({ user: user._id });
            console.log(`User ID: ${user._id} | Name: ${user.name} | Email: ${user.email} | Transactions count: ${count}`);
            if (count > 0) {
                const earliest = await Transaction.findOne({ user: user._id }).sort({ date: 1 });
                const latest = await Transaction.findOne({ user: user._id }).sort({ date: -1 });
                console.log(`   -> Date Range: ${earliest.date.toISOString().split('T')[0]} to ${latest.date.toISOString().split('T')[0]}`);
            }
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

analyzeUsers();
