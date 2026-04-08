<script setup>

import { ref, computed, watch, nextTick } from 'vue'

import { useStore } from '../stores/appStore.js'
const store = useStore()

const newMessage = ref('')

const chatBox = computed(() => {
    if (!store.targetUser || !store.currUser) return []
    return store.messages.filter(m => (m.from === store.currUser.user && m.to === store.targetUser) || (m.from === store.targetUser && m.to === store.currUser.user) )
})

const sendMessage = () => {
  if (newMessage.value.trim()) {
    store.sendMsg(store.targetUser, newMessage.value)
    newMessage.value = ''
  }
}

const chat = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chat.value) {
    chat.value.scrollTop = chat.value.scrollHeight
  }
}

watch(() => chatBox.value, () => {
  scrollToBottom()
}, { deep: true })

watch(() => store.targetUser, () => {
  scrollToBottom()
});

</script>

<template>

<div class="main">

<div class="text">
    <h1>Welcome {{ store.capitalUser }}!</h1>
    <h2 v-if="store.targetUser">You are now chatting with {{ store.capitalTarget }}</h2>
    <h2 v-else>Please Choose a Friend to Chat With</h2>
</div>

<div class="chatbox" v-if="store.targetUser" ref="chat">
    <div v-for="(msg, index) in chatBox" :key="index" :class="['bubble', msg.from === store.currUser.user ? 'right' : 'left']">
        <p>{{ msg.message }}</p>
    </div>
</div>

<div class="chatInput" v-if="store.targetUser">
    <input id="sendInput" v-model="newMessage" @keydown.enter="sendMessage" placeholder="Send A Message?" />
    <button id="sendMessage" @click.prevent="sendMessage">Send</button>
</div>

<div v-if="store.showProfile" class="profileInfo">
    <div class="modal">
        <h3>Account Details <button id="exit" @click="store.showProfile = false">Exit</button></h3>

        <div class="profileBody" v-if="store.profileData">
            <div class="info">
                <label>Username</label>
                <p>{{ store.profileData.username }}</p>
            </div>
            <div class="info">
                <label>Full Name</label>
                <p>{{ store.profileData.firstName }} {{ store.profileData.lastName }}</p>
            </div>
            <div class="info">
                <label>Email</label>
                <p>{{ store.profileData.email }}</p>
            </div>
        </div>
    </div>
</div>

</div>

</template>

<style scoped>

.main {
    background-color: #bdbfa3;
    border-radius: 30px;
    padding: 20px;
    gap: 20px;
}

.text {
    margin-left: 20px;
    line-height: 20px;
}

.chatbox {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    background: #fdfdfd;
    border-radius: 10px;
    gap: 10px;
    height: 58%;
    margin-bottom: 5px;
}

.bubble {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 20px;
}

.right {
    align-self: flex-end;
    background-color: #87662e;
    color: white;
    border-bottom-right-radius: 2px;
}

.left {
    align-self: flex-start;
    background-color: #e9e9eb;
    color: black;
    border-bottom-left-radius: 2px;
}

.chatInput {
    margin-bottom: 20px;
}

#sendMessage {
    border: none;
    background-color: #6e5324;
    color: white;
    font-size: 1em;
    border-radius: 20px;
    padding: 15px 20px;
    margin-top: 10px;
    margin-left: 15px;
}

#sendInput {
    border-radius: 20px;
    padding: 15px 20px;
    width: 85%;
    margin-top: 10px;
}


.profileInfo {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.modal {
    padding: 20px;
    border-radius: 30px;
    width: 500px;
    border: 1px solid #444;
    background-color: #bdbfa3;
}

.info {
    margin-bottom: 15px;
}

.info label {
    font-size: 1rem;
    color: #333;
    display: block;
}

.info p {
    font-size: 1.2rem;
    margin: 5px 0;
}

#exit {
    border-radius: 10px;
    border: none;
    background-color: #6e5324;
    color: white;
    padding: 5px 10px;
    position: absolute;
    top: 33%;
    left: 63%;
}


</style>