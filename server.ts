const axios = require("axios");
const express = require("express");
import { InfluxDB, Point } from "@influxdata/influxdb-client";
const rateLimit = require("express-rate-limit");

// InfluxDB creds
const INFLUX_URL = "http://localhost:8086";
const INFLUX_TOKEN = "token";
const INFLUX_ORG = "org";
const INFLUX_BUCKET = "bucket";
const INFLUX_MEASUREMENT = "measurement";

const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });

const HOME_ASSISTANT_IP = "192.168.1.2";
const HOME_ASSISTANT_TOKEN = "token";

const hostname = "192.168.1.1";
const port = 12345;

const app = express();

app.use("/assets", express.static("assets"));

// Apply rate limits
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  message: "Chill Yo!",
});
app.use("/lightbulb/turn_on", limiter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/index.html", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/lightbulb/turn_on", async (req, res) => {
  console.log(req.rawHeaders);
  let client_ip =
    req.rawHeaders[
      req.rawHeaders.findIndex((item) => item === "X-Forwarded-For") + 1
    ];
  let user_agent =
    req.rawHeaders[
      req.rawHeaders.findIndex((item) => item === "user-agent") + 1
    ];
  let referer =
    req.rawHeaders[req.rawHeaders.findIndex((item) => item === "referer") + 1];

  let body = "";

  req.on("data", (chunk) => (body += chunk.toString()));

  req.on("end", async () => {
    try {
      await turnOnLightbulb();
      logToInfluxDB(client_ip, user_agent, referer, "white");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("OK");
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("Internal Server Error");
    }
  });
});

app.listen(port, hostname, () => {
  console.log(`Server is listening at http://${hostname}:${port}`);
});

async function turnOnLightbulb() {
  const postData = {
    entity_id: "light.door_lamp",
  };

  const postHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
  };

  try {
    await axios.post(
      `http://${HOME_ASSISTANT_IP}api/services/light/turn_on`,
      postData,
      {
        headers: postHeaders,
      },
    );
  } catch (error) {
    console.error(error);
  }
}

function logToInfluxDB(client_ip, user_agent, referer, color) {
  const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);

  let dataPoint = new Point(INFLUX_MEASUREMENT)
    .tag("client_ip", client_ip)
    .tag("user_agent", user_agent)
    .tag("referer", referer)
    .stringField("color", color)
    .timestamp(new Date());

  writeApi.writePoint(dataPoint);
  writeApi.close();
}
