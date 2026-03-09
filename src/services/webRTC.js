import { ref } from "vue"
import SimplePeer from "simple-peer"
import { socket } from "@/configs/socket.config.js"

export function useWebRTC(myId) {
  const localStream = ref(null)
  const remoteStream = ref(null)
  const incomingCall = ref(null)
  let peer = null

  socket.on("connect", () => {
    socket.emit("register", myId)
    console.log("✅ Enregistré :", myId)
  })

  if (socket.connected) {
    socket.emit("register", myId)
    console.log("✅ Déjà connecté, enregistré :", myId)
  }

  const startMedia = async () => {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
  }

  const callUser = async (userId) => {
    await startMedia()

    peer = new SimplePeer({ initiator: true, stream: localStream.value })

    peer = new SimplePeer({ initiator: true, trickle: false, stream: localStream.value })

    peer.on("signal", (signal) => {
      console.log(`📞 Envoi signal à ${userId}`)
      socket.emit("call-user", { to: userId, signal, from: myId })
    })

    peer.on("stream", (stream) => {
      console.log("🎥 Stream distant reçu")
      remoteStream.value = stream
    })
  }

  socket.off("incoming-call")
  socket.on("incoming-call", ({ signal, from }) => {
    console.log(`📲 Appel entrant de ${from}`)
    incomingCall.value = { signal, from }
  })


  socket.off("call-accepted")
  socket.on("call-accepted", (signal) => {
    console.log("✅ Appel accepté, connexion en cours...")
    peer.signal(signal)
  })


  const acceptCall = async () => {
    const callerFrom = incomingCall.value.from
    const callerSignal = incomingCall.value.signal
    incomingCall.value = null

    await startMedia()

    peer = new SimplePeer({ initiator: false, trickle: false, stream: localStream.value })

    peer.on("signal", (signal) => {
      console.log(`📡 Envoi answer à ${callerFrom}`)
      socket.emit("accept-call", { to: callerFrom, signal })
    })

    peer.on("stream", (stream) => {
      console.log("🎥 Stream distant reçu", stream)
      remoteStream.value = stream
    })

    peer.signal(callerSignal)
  }


  const hangUp = (userId) => {
    console.log("📵 Raccrochage")
    peer?.destroy()
    localStream.value?.getTracks().forEach(t => t.stop())
    localStream.value = null
    remoteStream.value = null
    socket.emit("hang-up", { to: userId })
  }

  socket.off("call-ended")
  socket.on("call-ended", () => {
    console.log("📵 Appel terminé par l'autre")
    peer?.destroy()
    remoteStream.value = null
  })

  return { localStream, remoteStream, incomingCall, callUser, acceptCall, hangUp }
}