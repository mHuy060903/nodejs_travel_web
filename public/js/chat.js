const socket = io();
const chatCenter = document.querySelector(".chat-messages");
const btnChat = document.querySelector(".btn");
const input = document.getElementById("msg");
const formChat = document.getElementById("chat-form");
const getDate = (date, hourss = false) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  if (hourss) {
    return `${day}-${month}-${year}  ${hours}:${minute}:${second}`;
  } else {
    return `${year}-${month}-${day}`;
  }
};
socket.on("join", (msg) => {
  console.log(msg);
});

formChat.addEventListener("submit", (e) => {
  e.preventDefault();

  const chatId = formChat.querySelector("[name=chatId]").value;
  const chatWithId = formChat.querySelector("[name=chatWithId]").value;
  const data = {
    chatId: chatId,
    content: input.value,
  };
  fetch(`/chatwith/${chatWithId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      input.value = "";
      socket.emit("postMessage", data);
    });
});

socket.on("post", (data) => {
  const chat = document.querySelector(`.chat${data.chat}`);
  const day = new Date(data.time).getDate();
  const month = new Date(data.time).getMonth() + 1;
  const year = new Date(data.time).getFullYear();
  const hours = new Date(data.time).getHours();
  const minute = new Date(data.time).getMinutes();
  const second = new Date(data.time).getSeconds();
  const time = `${day}-${month}-${year} ${hours}:${minute}:${second}`;
  console.log(day, month, year, hours, minute, second);
  const html = `
  <div class="message">
  <img src="/${data.sender.image}" class="chat_img" alt="" />
  <div class="message_container">
  <p class="meta">${data.sender.name}<span>${time}</span></p>
  <p class="text">${data.content}</p>
  </div>
</div>
  `;
  chat.insertAdjacentHTML("beforeend", html);
  chatCenter.scrollTop = chatCenter.scrollHeight;
});
