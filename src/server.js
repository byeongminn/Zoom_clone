import express from "express";
import SocketIO from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

let masterId;

wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName, masterIdSet) => {
        socket.join(roomName);
        const room =wsServer.sockets.adapter.rooms;
        const size = room.get(roomName).size;
        if(size===1) {
            masterId = socket.id;
            masterIdSet();
        }
        socket.in(roomName).emit("welcome");
    })
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    })
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })
    socket.on("questionSubmit", (question, roomName) => {
        socket.to(masterId).emit("questionSubmit",question);
    })
})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);