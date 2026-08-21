require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db =require("./db");
const {connectMongo, getMongo} = require("./mongo");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
    res.json({message: "era tech solutions help desk api is running"});
});

// MYSQL routes--------------------------------------------


// get /departments
app.get("/departments", (req, res) => {
    const sql = "SELECT * FROM departments";
    db.query(sql,(error, results) => {
        if(error){
            console.error("error getting departments:", error);
            return res.status(500).json({
                error:"failed to get departments"
            });
        }
        res.json(results);
    });
});

// get /users-  returns all users(password excluded)
app.get("/users", (req, res) => {
    const sql = "SELECT id, first_name, last_name, email, role, department_id FROM users";
    db.query(sql, (error, results) => {
        if(error){
            console.error("error getting users:", error);
            return res.status(500).json({error: "failed to get users"});
        }
        res.json(results);
    });
});

// get /tickets
app.get("/tickets", (req, res) => {
    const sql = "SELECT * FROM tickets";
    db.query(sql, (error, results) => {
        if(error){
            console.error("error getting tickets:", error);
            return res.status(500).json({error: "failed to get tickets"});
        }
        res.json(results);
    });
});

// get /tickets/open - returns only opened tickets
app.get("/tickets/open", (req, res) => {
    const sql = "SELECT * FROM tickets WHERE status = 'open'";
    db.query(sql, (error, results) => {
        if(error){
            console.error("error getting open tickets:", error);
            return res.status(500).json({error: "failed to get open tickets"});
        }
        res.json(results);
    });
});

// GET /tickets/:id
app.get("/tickets/:id", (req, res) => {
    const ticketId = req.params.id;
    const sql = "SELECT * FROM tickets WHERE id = ?";
    db.query(sql, [ticketId], (error, results) => {
        if(error){
            console.error("error getting ticket: ", error);
            return res.status(500).json({error: "failed to get ticket"});
        }
        if(results.length === 0){
            return res.status(404).json({error: "ticket not found"});
        }
        res.json(results[0]);
    });
});

// get /ticket-notes - returns all ticket notes from MongoDB
app.get("/ticket-notes", async (req, res) => {
    try {
        const mongoDb = getMongo();
        const notes = await mongoDb.collection("ticket_notes").find({}).toArray();
        res.json(notes);
    } catch(error){
        console.error("error getting ticket notes: ", error);
        res.status(500).json({error:"failed to get ticket notes"});
    }
});

// MONGODB Route ---------------------------------------------------------

// get /ticket-notes/:ticketId - returns notes for specific ticket
app.get("/ticket-notes/:ticketId", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.ticketId);
        const mongoDb = getMongo();
        const notes = await mongoDb.collection("ticket_notes").find({ticket_id: ticketId}).toArray();
        res.json(notes);
    } catch(error){
        console.error("error getting notes for ticket", error);
        res.status(500).json({error: "failed to get ticket notes"});
    };
});

// get /acitivities-logs - returns activity logs from MongoDB
app.get("/activity-logs", async (req, res) => {
    try {
        const mongoDb = getMongo();
        const logs = await mongoDb.collection("activity_logs").find({}).sort({timestamp: -1}).toArray();
        res.json(logs);
    } catch(error){
        console.error("error getting activity logs:", error);
        res.status(500).json({error: "failed to get activity logs"});
    }
});

// start server- waits for MongoDB before listening
async function startServer() {
    await connectMongo();
    app.listen(PORT, () => {
        console.log(`server running at http://localhost:${PORT}`);
    });
};

startServer();