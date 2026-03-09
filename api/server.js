import { Server } from "socket.io"
import https from "https"
import express from "express"
import cors from "cors"
import fs from "fs"

const app = express()
app.use(cors())

const server = https.createServer({
  key: fs.readFileSync("cert.key"),
  cert: fs.readFileSync("cert.crt")
}, app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const fakeUsers = {
  "user1": { name: "Alice" },
  "user2": { name: "Bob" },
}

const connectedUsers = {}

io.on("connection", (socket) => {
  console.log(`🔌 Nouveau socket connecté : ${socket.id}`)

  socket.on("register", (userId) => {
    if (!fakeUsers[userId]) {
      console.log(`❌ User inconnu : ${userId}`)
      return
    }
    connectedUsers[userId] = socket.id
    console.log(`✅ ${fakeUsers[userId].name} (${userId}) enregistré`)
    console.log(`👥 Users connectés :`, connectedUsers)
  })

  socket.on("call-user", ({ to, signal, from }) => {
    console.log(`📞 ${from} appelle ${to}`)
    if (!connectedUsers[to]) {
      console.log(`❌ Destinataire ${to} introuvable`)
      return
    }
    io.to(connectedUsers[to]).emit("incoming-call", { signal, from })
    console.log(`📡 Signal transmis à ${to}`)
  })

  socket.on("accept-call", ({ to, signal }) => {
    console.log(`✅ Appel accepté, signal retourné à ${to}`)
    if (!connectedUsers[to]) {
      console.log(`❌ Appelant ${to} introuvable`)
      return
    }
    io.to(connectedUsers[to]).emit("call-accepted", signal)
  })

  socket.on("hang-up", ({ to }) => {
    console.log(`📵 Raccrochage vers ${to}`)
    if (connectedUsers[to]) {
      io.to(connectedUsers[to]).emit("call-ended")
    }
  })

  socket.on("disconnect", () => {
    const userId = Object.keys(connectedUsers).find(
      key => connectedUsers[key] === socket.id
    )
    if (userId) {
      console.log(`🔴 ${fakeUsers[userId]?.name} (${userId}) déconnecté`)
      delete connectedUsers[userId]
      console.log(`👥 Users restants :`, connectedUsers)
    }
  })
})

server.listen(3000, () => {
  console.log(`🚀 Serveur HTTPS lancé sur https://localhost:3000`)
  console.log(`👤 Users simulés disponibles :`, Object.keys(fakeUsers))
})