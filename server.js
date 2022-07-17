///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

const http = require("http");
const CONSTANTS = require("./utils/constants.js");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const { connected } = require("process");

const { PORT, CLIENT } = CONSTANTS;

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const httpServer = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = req.url === "/" ? "/public/index.html" : req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = "text/html";
  if (extname === ".js") contentType = "text/javascript";
  else if (extname === ".css") contentType = "text/css";

  // pipe the proper file to the res object
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(`${__dirname}/${filePath}`, "utf8").pipe(res);
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// Create the WebSocket Server using the HTTP server
const wsServer = new WebSocket.Server({ server: httpServer });

// Respond to connection events
wsServer.on("connection", (socket) => {
  console.log("A new client has connected to the server!");

  socket.on("message", (data) => {
    console.log(data);
    // Broadcast messages received to all other clients
    broadcast(data, socket);
  });
});

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

function broadcast(data, socketToOmit) {
  // Implement the broadcast pattern. Exclude the emitting socket!
  wsServer.clients.forEach((connectedClient) => {
    if (
      connectedClient.readyState === WebSocket.OPEN &&
      connectedClient !== socketToOmit
    ) {
      connectedClient.send(data);
    }
  });
}

// Start the server listening on localhost:8080
httpServer.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${wsServer.address().port}`);
});
