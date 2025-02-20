const socket = io();

// Запрос ника перед началом чата
let username = prompt("Введите ваш ник:");
while (!username) {
    username = prompt("Введите ваш ник:");
}

// Отправка ника серверу
socket.emit('setUsername', username);

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");

// Отправка сообщений
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message !== "") {
        socket.emit("chatMessage", { username, message });
        messageInput.value = "";
        socket.emit("stopTyping");
    }
});

// Отображение сообщений
socket.on("chatMessage", (data) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Отслеживание набора текста
messageInput.addEventListener("input", () => {
    socket.emit("typing");
});

// Отображение "Пользователь печатает..."
socket.on("typing", (username) => {
    let typingIndicator = document.getElementById("typingIndicator");
    if (!typingIndicator) {
        typingIndicator = document.createElement("div");
        typingIndicator.id = "typingIndicator";
        typingIndicator.style.color = "#666";
        messagesContainer.appendChild(typingIndicator);
    }
    typingIndicator.textContent = `${username} печатает...`;
});

// Скрытие "Пользователь печатает..."
socket.on("stopTyping", () => {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
});