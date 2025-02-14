require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Role-based modules
const adminModules = [
    { name: "API Trigger", type: "api_trigger" },
    { name: "Time Trigger", type: "time_trigger" },
    { name: "Send Email", type: "send_email" },
    { name: "Update Database", type: "update_database" },
    { name: "IF Condition", type: "if_condition" },
    { name: "Webhook", type: "webhook" }
];

const supportModules = [
    { name: "API Trigger", type: "api_trigger" },
    { name: "Time Trigger", type: "time_trigger" },
    { name: "Send Email", type: "send_email" }
];

// MongoDB Schema for Automation Flows
const flowSchema = new mongoose.Schema({
    user: String,
    flow: Object
});
const Flow = mongoose.model("Flow", flowSchema);

// **1️⃣ Get Role & Modules**
app.get("/getRole", (req, res) => {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: "User is required" });

    const role = user === "admin" ? "admin" : "support";
    const modules = role === "admin" ? adminModules : supportModules;
    res.json({ role, modules });
});

// **2️⃣ Save Automation Flow**
app.post("/saveFlow", async (req, res) => {
    const { user, flow } = req.body;
    if (!user || !flow) return res.status(400).json({ error: "User and flow data required" });

    try {
        const existingFlow = await Flow.findOne({ user });
        if (existingFlow) {
            existingFlow.flow = flow;
            await existingFlow.save();
        } else {
            const newFlow = new Flow({ user, flow });
            await newFlow.save();
        }
        res.json({ message: "Flow saved successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// **3️⃣ Load Automation Flow**
app.get("/loadFlow", async (req, res) => {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: "User is required" });

    try {
        const flowData = await Flow.findOne({ user });
        if (flowData) {
            res.json({ flow: flowData.flow });
        } else {
            res.json({ message: "No saved flow found", flow: {} });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// **4️⃣ Export Automation Flow as JSON**
app.get("/exportFlow", async (req, res) => {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: "User is required" });

    try {
        const flowData = await Flow.findOne({ user });
        if (flowData) {
            res.json({ flow: JSON.stringify(flowData.flow, null, 2) });
        } else {
            res.json({ message: "No saved flow found", flow: "{}" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
