const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const db = require("./src/config/db").development;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database Connection
const dbase = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
});

dbase.connect((error) => {
    if (error) {
        console.error("Database Connection Failed:", error.message);
        return;
    }
    console.log("Connected to Database");
});


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));


// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


// ROUTES


// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT role FROM login_info WHERE mail_id = ? AND password = ?";
    dbase.query(query, [email, password], (err, result) => {
        if (err) return res.status(500).json({ error: "Database query failed" });
        if (result.length === 0) return res.status(404).json({ error: "Invalid credentials" });
        res.status(200).json({ role: result[0].role });
    });
});


// Fetch student details
app.get("/student-details/:email", (req, res) => {
    const { email } = req.params;
    const query = "SELECT reg_no, user_name, start_year, end_year FROM student WHERE mail = ?";
    dbase.query(query, [email], (err, result) => {
        if (err) return res.status(500).json({ error: "Database query failed" });
        if (result.length === 0) return res.status(404).json({ error: "Student not found" });
        res.status(200).json(result[0]);
    });
});


// Submit event for approval
app.post("/submit-for-approval", (req, res) => {
    const {
        event_name, category, start_date, end_date,
        location, website_link, mode, organization
    } = req.body;


    if (!event_name || !category || !start_date || !end_date || !location || !mode || !organization) {
        return res.status(400).json({ error: "Missing required fields" });
    }


    const query = `
        INSERT INTO events
        (event_name, category, start_date, end_date, location, website_link, mode, organization, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;


    dbase.query(query, [
        event_name, category, start_date, end_date,
        location, website_link, mode, organization
    ], (err) => {
        if (err) return res.status(500).json({ error: "Submission failed" });
        res.status(201).json({ message: "Event submitted for approval" });
    });
});


// Fetch approved events
app.get("/fetch-approved-events", (req, res) => {
    dbase.query("SELECT * FROM events WHERE status = 'approved'", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(200).json(results);
    });
});


// Fetch pending events
app.get("/fetch-pending-events", (req, res) => {
    dbase.query("SELECT * FROM events WHERE status = 'pending'", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(200).json(results);
    });
});


// Update event status
app.put("/update-event-status/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;


    if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }


    const query = "UPDATE events SET status = ? WHERE event_id = ?";
    dbase.query(query, [status, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
        res.status(200).json({ message: `Event ${id} marked as ${status}` });
    });
});


// Soft delete event
app.delete("/delete-event/:id", (req, res) => {
    const { id } = req.params;
    dbase.query("UPDATE events SET status = 'deleted' WHERE event_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Deletion failed" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
        res.status(200).json({ message: `Event ${id} marked as deleted` });
    });
});


// Submit event history
app.post("/submit-in-eventhistory", upload.single("image"), (req, res) => {
    const {
        s_reg_no, stud_name, end_year,
        event_id, category, event_name,
        e_organisers, start_date, end_date,
        description
    } = req.body;


    const image = req.file ? req.file.path.replace(/\\/g, "/") : null;


    if (!s_reg_no || !stud_name || !end_year || !event_id || !category || !event_name || !e_organisers || !start_date || !end_date || !description || !image) {
        return res.status(400).json({ error: "All fields including image and description are required" });
    }


    const query = `
        INSERT INTO event_history
        (s_reg_no,  event_id, category, event_name, e_organisers, start_date, end_date, image, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;


    dbase.query(query, [
        s_reg_no, stud_name, end_year, event_id,
        category, event_name, e_organisers,
        start_date, end_date, image, description
    ], (err) => {
        if (err) return res.status(500).json({ error: "Submission failed" });
        res.status(201).json({ message: "Event summary submitted successfully" });
    });
});


// Fetch all event history
app.get("/fetch-event_history", (req, res) => {
    dbase.query("SELECT * FROM event_history", (err, results) => {
        if (err) return res.status(500).json({ error: "Database query failed" });
        res.status(200).json(results);
    });
});


// Fetch pending summaries only
app.get("/fetch-pending-summaries", (req, res) => {
    dbase.query("SELECT * FROM event_history WHERE status = 'pending'", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(200).json(results);
    });
});


// Filtered event history fetch
app.get("/get-event-history", (req, res) => {
    const { category, end_year, event_id, reg_no } = req.query;


    let query = `
        SELECT
            id, s_reg_no, stud_name, event_name, end_year, category,
            start_date, end_date, e_organisers, description, image, status, rejection_reason
        FROM event_history
        WHERE 1 = 1
    `;
    const params = [];
    if (category) { query += ` AND category = ?`; params.push(category); }
    if (end_year) { query += ` AND end_year = ?`; params.push(end_year); }
    if (event_id) { query += ` AND event_id = ?`; params.push(event_id); }
    if (reg_no) { query += ` AND s_reg_no LIKE ?`; params.push(`%${reg_no}%`); }


    dbase.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Database query failed" });
        res.json(results);
    });
});


// Get full event details by ID
app.get("/get-event-details/:id", (req, res) => {
    dbase.query("SELECT * FROM event_history WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch event details" });
        if (results.length === 0) return res.status(404).json({ error: "Event not found" });
        res.json(results[0]);
    });
});


// Approve summary
app.put("/approve-summary/:id", (req, res) => {
    dbase.query("UPDATE event_history SET status = 'approved', rejection_reason = NULL WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Approval failed" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Summary not found" });
        res.status(200).json({ message: `Summary ${req.params.id} approved` });
    });
});


// Reject summary with reason
app.put("/reject-summary/:id", (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Rejection reason is required" });


    dbase.query("UPDATE event_history SET status = 'rejected', rejection_reason = ? WHERE id = ?", [reason, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Rejection failed" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Summary not found" });
        res.status(200).json({ message: `Summary ${req.params.id} rejected` });
    });
});


// Fetch only approved summaries
app.get("/approve-event-history", (req, res) => {
    dbase.query("SELECT * FROM event_history WHERE status = 'approved'", (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching approved event history" });
        res.json(results);
    });
});


// Fetch summary history for a student (approved or rejected)
app.get('/event-history/:regNo', (req, res) => {
    const sql = "SELECT * FROM event_history WHERE s_reg_no = ? AND status IN ('approved', 'rejected')";
    dbase.query(sql, [req.params.regNo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching event history' });
        res.json(results);
    });
});


// Fetch event by ID (only approved)
app.get("/events/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT event_name, category, start_date, end_date, organization FROM events WHERE event_id = ? AND status = 'approved'";
    dbase.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database query failed" });
        if (result.length === 0) return res.status(404).json({ error: "Event not found or not approved" });
        res.status(200).json(result[0]);
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});