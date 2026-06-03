// ==============================
// 📦 Import Dependencies
// ==============================

require("dotenv").config() // 🌍 Load .env

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { cloudinary, connectCloudinary } = require("../config/cloudinary")
const Doctor = require("../models/doctorModel")

// ==============================
// 🩺 Initial Doctors Data
// ==============================

const doctors = [
    {
        name: "Dr Richard James",
        email: "richard.james01@gmail.com",
        password: "rich_ccd784512",
        speciality: "General physician",
        degree: "MBBS",
        experience: "4 Years",
        fees: 200,
        gender: "Male",
        address: { line1: "17th Cross", line2: "New York" },
        image: "https://img.freepik.com/premium-photo/smiling-indian-male-doctor-poses-aggressively_1147429-124281.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Emily Larson",
        email: "emily.larson02@gmail.com",
        password: "lara_cfg653921",
        speciality: "Gynecologist",
        degree: "MBBS",
        experience: "3 Years",
        fees: 600,
        gender: "Female",
        address: { line1: "27th Cross", line2: "Paris" },
        image: "https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Sarah Patel",
        email: "sarah.patel03@gmail.com",
        password: "patel_sing982314",
        speciality: "Dermatologist",
        degree: "MBBS",
        experience: "2 Years",
        fees: 300,
        gender: "Female",
        address: { line1: "37th Cross", line2: "Mumbai" },
        image: "https://img.freepik.com/premium-photo/female-doctor-white-lab-coat-stethoscope-long-wavy-brown-hair-warm-smile-professional-headshot_1263303-2131.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Christopher Lee",
        email: "christopher.lee04@gmail.com",
        password: "dr_leebru561294",
        speciality: "Pediatricians",
        degree: "MBBS",
        experience: "4 Years",
        fees: 400,
        gender: "Male",
        address: { line1: "47th Cross", line2: "Singapore" },
        image: "https://img.freepik.com/premium-photo/confident-care-smiling-mexican-doctor-30-years-old-arms-crossed_1106493-270285.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Jennifer Garcia",
        email: "jennifer.garcia05@gmail.com",
        password: "jennie_garcie741236",
        speciality: "Neurologist",
        degree: "MBBS",
        experience: "5 Years",
        fees: 700,
        gender: "Female",
        address: { line1: "57th Cross", line2: "Barcelona" },
        image: "https://img.freepik.com/premium-photo/healthcare-doctor-nurse-woman-with-stethoscope-hospital-bokeh-happy-with-smile-health-trust-mission-professional-medical-expert-worker-with-wellness-motivation-vision_590464-84897.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Andrew Williams",
        email: "andrew.williams06@gmail.com",
        password: "andrew_xx219845",
        speciality: "General physician",
        degree: "MBBS",
        experience: "6 Years",
        fees: 350,
        gender: "Male",
        address: { line1: "18th Cross", line2: "Toronto" },
        image: "https://img.freepik.com/premium-photo/healthcare-profession-people-medicine-concept-smiling-male-doctor-white-coat-blue-background_380164-92262.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Olivia Brown",
        email: "olivia.brown07@gmail.com",
        password: "olive@333632981",
        speciality: "Gynecologist",
        degree: "MBBS",
        experience: "5 Years",
        fees: 650,
        gender: "Female",
        address: { line1: "21st Cross", line2: "Berlin" },
        image: "https://img.freepik.com/free-photo/portrait-young-female-doctor_23-2148396648.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Michael Smith",
        email: "michael.smith08@gmail.com",
        password: "jackson_##874521",
        speciality: "Neurologist",
        degree: "MBBS",
        experience: "8 Years",
        fees:900,
        gender: "Male",
        address: { line1: "33rd Cross", line2: "Sydney" },
        image: "https://img.freepik.com/premium-photo/male-doctor-light-surface_392895-24691.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr David Wilson",
        email: "david.wilson09@gmail.com",
        password: "david_(go)913452",
        speciality: "General physician",
        degree: "MBBS",
        experience: "3 Years",
        fees: 150,
        gender: "Male",
        address: { line1: "12th Cross", line2: "Delhi" },
        image: "https://img.freepik.com/premium-photo/smiling-handsome-indian-man-doctor-wearing-stylish-eyeglasses-white-coat-with-crossed-arms_695242-23680.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Emma Taylor",
        email: "emma.taylor10@gmail.com",
        password: "emma_?taylor345912",
        speciality: "Dermatologist",
        degree: "MBBS",
        experience: "4 Years",
        fees: 400,
        gender: "Female",
        address: { line1: "41st Cross", line2: "Rome" },
        image: "https://img.freepik.com/free-photo/image-professional-woman-doctor-physician-with-clipboard-writing-listening-patient-hospital-cl_1258-87691.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Daniel Moore",
        email: "daniel.moore11@gmail.com",
        password: "dani_moo672143",
        speciality: "Pediatricians",
        degree: "MBBS",
        experience: "6 Years",
        fees: 500,
        gender: "Female",
        address: { line1: "23rd Cross", line2: "Dubai" },
        image: "https://img.freepik.com/premium-photo/beautiful-young-doctor-blue-background_1092063-1141.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Sophia Martinez",
        email: "sophia.martinez12@gmail.com",
        password: "sophi@moore841256",
        speciality: "Gynecologist",
        degree: "MBBS",
        experience: "8 Years",
        fees: 750,
        gender: "Female",
        address: { line1: "11th Cross", line2: "Madrid" },
        image: "https://img.freepik.com/premium-photo/young-handsome-doctor-with-blond-hair_1155010-2655.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr James Anderson",
        email: "james.anderson13@gmail.com",
        password: "jamie/mackie259871",
        speciality: "Neurologist",
        degree: "MBBS",
        experience: "9 Years",
        fees: 1100,
        gender: "Male",
        address: { line1: "29th Cross", line2: "Chicago" },
        image: "https://img.freepik.com/premium-photo/portrait-professional-medical-doctor-with-stethoscope-holding-health-card-standing-isolated-blue-wall_575980-43717.jpg"
    },
    {
        name: "Dr Isabella Thomas",
        email: "isabella.thomas14@gmail.com",
        password: "issy@764325",
        speciality: "Dermatologist",
        degree: "MBBS",
        experience: "5 Years",
        fees: 550,
        gender: "Female",
        address: { line1: "9th Cross", line2: "Milan" },
        image: "https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Benjamin Harris",
        email: "benjamin.harris15@gmail.com",
        password: "benjaaaa582164",
        speciality: "General physician",
        degree: "MBBS",
        experience: "10 Years",
        fees: 600,
        gender: "Male",
        address: { line1: "5th Cross", line2: "Los Angeles" },
        image: "https://img.freepik.com/free-photo/hospital-healthcare-workers-covid-19-treatment-concept-young-doctor-scrubs-making-daily-errands-clinic-listening-patient-symptoms-look-camera-professional-physician-curing-diseases_1258-57233.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Ethan Clark",
        email: "ethan.clark16@gmail.com",
        password: "ethan//741962",
        speciality: "Dermatologist",
        degree: "MBBS",
        experience: "6 Years",
        fees: 650,
        gender: "Male",
        address: { line1: "16th Cross", line2: "Bangkok" },
        image: "https://img.freepik.com/premium-photo/smiling-male-doctor-dressed-uniform_1101054-31053.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Mia Walker",
        email: "mia.walker17@gmail.com",
        password: "miallll863214",
        speciality: "Gynecologist",
        degree: "MBBS",
        experience: "7 Years",
        fees: 700,
        gender: "Female",
        address: { line1: "22nd Cross", line2: "Tokyo" },
        image: "https://img.freepik.com/free-photo/confident-doctor-clinic_23-2151983463.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_rp_progressive&w=740&q=80"
    },
    {
        name: "Dr Lucas Scott",
        email: "lucas.scott18@gmail.com",
        password: "luuuuu512894",
        speciality: "Neurologist",
        degree: "MBBS",
        experience: "8 Years",
        fees: 850,
        gender: "Male",
        address: { line1: "14th Cross", line2: "Seoul" },
        image: "https://img.freepik.com/premium-photo/smiling-male-doctor-dressed-uniform_1101054-31036.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Grace Hall",
        email: "grace.hall19@gmail.com",
        password: "gracccccehhhh931572",
        speciality: "Pediatricians",
        degree: "MBBS",
        experience: "4 Years",
        fees: 450,
        gender: "Female",
        address: { line1: "8th Cross", line2: "Istanbul" },
        image: "https://img.freepik.com/free-photo/photo-young-doctor-with-stethoscope-folder-blue-posing_496169-2159.jpg?t=st=1774012367~exp=1774015967~hmac=322e3d0851d683af94d5c856c7857c8ac25c71bc9dd234a4278cde6030ea530b&w=1480"
    },
    {
        name: "Dr Henry Young",
        email: "henry.young20@gmail.com",
        password: "honeyyoung642198",
        speciality: "General physician",
        degree: "MBBS",
        experience: "11 Years",
        fees: 700,
        gender: "Male",
        address: { line1: "2nd Cross", line2: "San Francisco" },
        image: "https://img.freepik.com/free-photo/portrait-successful-mid-adult-doctor-with-crossed-arms_1262-12865.jpg?uid=R223141381&ga=GA1.1.726442252.1763564901&semt=ais_hybrid&w=740&q=80"
    },
    {
        name: "Dr Patty West",
        email: "patme20@gmail.com",
        password: "patyme642198",
        speciality: "Gastroenterologist",
        degree: "MBBS",
        experience: "5 Years",
        fees: 700,
        gender: "Female",
        address: { line1: "2nd Cross", line2: "San Francisco" },
        image: "https://img.freepik.com/premium-psd/female-medic-wearing-lab-coat-mock-up-design_23-2150293773.jpg"
    }
]

// ==============================
// 🌱 Seed Function
// ==============================

async function seedDoctors() {

    try {

        await mongoose.connect(process.env.MONGO_URL)

        console.log("🟢 MongoDB Connected")

        // ☁️ Connect cloudinary
        connectCloudinary()

        for (let doc of doctors) {

            // 🛑 Avoid duplicate doctors
            const existingDoctor = await Doctor.findOne({ email: doc.email })

            if (existingDoctor) {
                console.log("⚠️ Doctor already exists:", doc.email)
                continue
            }

            // 🔐 Hash doctor password
            const hashedPassword = await bcrypt.hash(doc.password, 10)

            const doctor = new Doctor({
                name: doc.name,
                email: doc.email,
                password: hashedPassword,
                speciality: doc.speciality,
                degree: doc.degree,
                experience: doc.experience,
                fees: doc.fees,
                gender: doc.gender,
                address: doc.address,
                image: doc.image,
                date: new Date()
            })

            await doctor.save()

            console.log("✅ " + doc.name + " inserted")

        }

        console.log("🎉 All doctors inserted successfully!")

        process.exit()

    } catch (err) {

        console.log("❌ Error:", err)

    }

}

seedDoctors()
