import mongoose from "mongoose"
import bcrypt from "bcryptjs"

// ================= CONFIG =================
const MONGODB_URI = "mongodb://localhost:27017/service_db"

const PRO_COUNT = 400
const CLIENT_COUNT = 1600
const BOOKINGS_COUNT = 1000

const STATUSES = ["pending", "approved", "rejected"]
const LOCATIONS = ["hargeisa", "burco", "borama", "ceer", "berbera"]
const SKILLS = ["Electrician", "Painter", "Plumber", "Mechanic", "Carpenter"]

// ================= CONNECT =================
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("✅ MongoDB Connected")
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message)
    process.exit(1)
  }
}

// ================= HELPERS =================
const randomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)]

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

// ================= MAIN SEED =================
const seedAll = async () => {
  await connectDB()

  const db = mongoose.connection.db
  const usersCollection = db.collection("users")
  const bookingsCollection = db.collection("bookings")

  // Clear old data
  await usersCollection.deleteMany({})
  await bookingsCollection.deleteMany({})
  console.log("🗑 Old users & bookings cleared")

  // Hash password once
  const hashedPassword = await bcrypt.hash("123456", 10)

  // ================= CREATE PROS =================
  let pros = []

  for (let i = 1; i <= PRO_COUNT; i++) {
    pros.push({
      name: `pro${i}`,
      email: `pro${i}@homeman.com`,
      password: hashedPassword,
      role: "pro",
      location: randomItem(LOCATIONS),
      phone: `63477${String(i).padStart(4, "0")}`,
      isVerified: true,
      isSuspended: false,
      skills: [randomItem(SKILLS)],
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    })
  }

  const insertedPros = await usersCollection.insertMany(pros)
  console.log("✅ 400 Professionals Created")

  // ================= CREATE CLIENTS =================
  let clients = []

  for (let i = 1; i <= CLIENT_COUNT; i++) {
    clients.push({
      name: `client${i}`,
      email: `client${i}@homeman.com`,
      password: hashedPassword,
      role: "client",
      location: randomItem(LOCATIONS),
      phone: `63588${String(i).padStart(4, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    })
  }

  const insertedClients = await usersCollection.insertMany(clients)
  console.log("✅ 1600 Clients Created")

  // ================= CREATE BOOKINGS =================
  let bookings = []

  const proIds = Object.values(insertedPros.insertedIds)
  const clientIds = Object.values(insertedClients.insertedIds)

  for (let i = 0; i < BOOKINGS_COUNT; i++) {
    const createdAt = randomDate(new Date(2025, 0, 1), new Date())

    bookings.push({
      client: randomItem(clientIds),
      professional: randomItem(proIds),
      status: randomItem(STATUSES),
      rating: null,
      createdAt,
      updatedAt: createdAt,
      __v: 0
    })
  }

  await bookingsCollection.insertMany(bookings)
  console.log("✅ 1000 Bookings Created")

  console.log("🎉 DATABASE SEEDED SUCCESSFULLY")
  process.exit()
}

seedAll()