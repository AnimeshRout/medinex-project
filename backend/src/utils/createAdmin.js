// ==============================
// 📦 Import Dependencies
// ==============================

require("dotenv").config(); // 🌍 Load environment variables
const mongoose = require("mongoose"); // 🗄 MongoDB connection
const bcrypt = require("bcryptjs");   // 🔐 Password hashing
const Admin = require("../models/adminModel"); // 👑 Admin model


// ==============================
// 🚀 Create Admin Function
// ==============================

async function createAdmin() {
  try {

    // 🔗 Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    // 🔎 Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: "medinexadmin@gmail.com"
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists in database");
      process.exit();
    }

    // 🔐 Hash the password
    const hashedPassword = await bcrypt.hash("medinex_admin_@docapp_9091", 10);

    // 👑 Create new admin
    const admin = new Admin({
      email: "medinexadmin@gmail.com",
      password: hashedPassword
    });

    // 💾 Save admin to database
    await admin.save();

    console.log("🎉 Admin created successfully!");
    console.log("📧 Email: medinexadmin@gmail.com");
    console.log("🔑 Password: medinex_admin_@docapp_9091");

    process.exit();

  } catch (error) {
    console.log("❌ Error creating admin:", error);
  }
}


// ==============================
// ▶ Run Script
// ==============================

createAdmin();