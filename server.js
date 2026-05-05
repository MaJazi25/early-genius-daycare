const express = require("express")
const cors = require("cors")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000
const adminKey = process.env.ADMIN_KEY || "change-this-admin-key"

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"))

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      child_age TEXT,
      program TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      desired_start_date TEXT,
      message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

function saveSubmission(type, body, res) {
  const parentName = String(body.parentName || "").trim()
  const childAge = String(body.childAge || "").trim()
  const program = String(body.program || "").trim()
  const email = String(body.email || "").trim()
  const phone = String(body.phone || "").trim()
  const desiredStartDate = String(body.desiredStartDate || "").trim()
  const message = String(body.message || "").trim()

  if (!parentName || !email) {
    return res.status(400).json({
      success: false,
      message: "Parent name and email are required."
    })
  }

  db.run(
    `INSERT INTO submissions 
    (type, parent_name, child_age, program, email, phone, desired_start_date, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [type, parentName, childAge, program, email, phone, desiredStartDate, message],
    function (error) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Database error. Please try again."
        })
      }

      res.json({
        success: true,
        message: "Thank you. Your request has been received.",
        id: this.lastID
      })
    }
  )
}

app.post("/api/contact", (req, res) => {
  saveSubmission("Contact Request", req.body, res)
})

app.post("/api/tuition", (req, res) => {
  saveSubmission("Tuition Request", req.body, res)
})

app.post("/api/tour", (req, res) => {
  saveSubmission("Book a Tour", req.body, res)
})

app.get("/api/admin/submissions", (req, res) => {
  if (req.headers["x-admin-key"] !== adminKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized."
    })
  }

  db.all("SELECT * FROM submissions ORDER BY created_at DESC", [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Database error."
      })
    }

    res.json({
      success: true,
      submissions: rows
    })
  })
})

app.listen(port, () => {
  console.log(`Early Genius website is running at http://localhost:${port}`)
})
