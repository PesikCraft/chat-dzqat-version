const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Раздача статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Проверяем, что файл index.html существует
app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "public", "index.html");
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Ошибка отправки index.html:", err);
            res.status(500).send("Файл не найден");
        }
    });
});

const users = {};

io.on("connection", (socket) => {
    console.log("Новый пользователь подключился");

    socket.on("setUsername", (username) => {
        users[socket.id] = username;
        io.emit("userConnected", username);
    });

    socket.on("chatMessage", (data) => {
        io.emit("chatMessage", data);
    });

    socket.on("typing", () => {
        if (users[socket.id]) {
            socket.broadcast.emit("typing", users[socket.id]);
        }
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping");
    });

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            io.emit("userDisconnected", users[socket.id]);
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});