<template>
  <div class="call">
    <h2>Mon ID : {{ myId }}</h2>

    <div v-if="incomingCall">
      <p>Appel entrant de : {{ incomingCall.from }}</p>
      <button @click="acceptCall">Accepter</button>
    </div>

    <!-- Vidéos -->
    <video ref="localVideo" autoplay muted style="width:300px" />
    <video ref="remoteVideo" autoplay style="width:300px" />

    <input v-model="targetId" placeholder="ID destinataire" />
    <button @click="callUser(targetId)">Appeler</button>
    <button @click="hangUp(targetId)">Raccrocher</button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { useWebRTC } from "@/services/webRTC.js"

const myId = new URLSearchParams(window.location.search).get("id") || "user1"
const targetId = ref("")

const localVideo = ref(null)
const remoteVideo = ref(null)

const { localStream, remoteStream, incomingCall, callUser, acceptCall, hangUp } = useWebRTC(myId)

watch(localStream, (stream) => {
  if (localVideo.value && stream) localVideo.value.srcObject = stream
})

watch(remoteStream, (stream) => {
  if (remoteVideo.value && stream) remoteVideo.value.srcObject = stream
})
</script>