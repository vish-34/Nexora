require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { WebSocketServer, WebSocket } = require("ws");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const gridRoutes = require("./routes/gridRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const reportRoutes = require("./routes/reportRoutes");
const proposalRoutes = require("./routes/proposals.routes");
const weatherRoutes = require("./routes/weatherRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { setWsBroadcaster } = require("./controllers/reportController");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "4mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.send(
    JSON.stringify({
      event: "connected",
      message: "CoolNeighbour Telemetry WebSocket Online",
    })
  );
});

setWsBroadcaster((data) => {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
});

app.get(["/api/health", "/api/v1/health"], (req, res) => {
  res.json({
    status: "ok",
    service: "CoolNeighbour Core API",
    version: "1.0.0",
    mockAi: String(process.env.USE_MOCK_AI).toLowerCase() === "true",
    timestamp: new Date().toISOString(),
  });
});

app.use(["/api/grid", "/api/v1/heatgrid"], gridRoutes);
app.use(["/api/cooling-centers", "/api/v1/shelters"], shelterRoutes);
app.use(["/api/reports", "/api/v1/reports"], reportRoutes);
app.use(["/api/proposals", "/api/v1/proposals"], proposalRoutes);
app.use(["/api/weather", "/api/v1/weather"], weatherRoutes);
app.use(["/api/ai", "/api/v1/ai"], aiRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`CoolNeighbour Phase 2 backend listening on port ${PORT}`);
  });
}

module.exports = { app, server };
