const mongoose = require("mongoose")

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("🎉 MONGODB CONNECTED SUCCESSFULLY!✅");
    } catch(error) { 
        console.log("❌ DATABASE CONNECTION FAILED! : ", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;