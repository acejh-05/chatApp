<script setup>

import { ref, onMounted, nextTick, watch } from 'vue'
import { useStore } from '../stores/appStore.js'

const store = useStore()

onMounted(() => {
    store.getChats()
})

const newMsg = ref('');

const sendMsg = async () => {
    if (newMsg.value.trim() !== '') {
        await store.sendMsg(newMsg.value)
        newMsg.value = ''
    }
}

const newMember = ref('')
const isInviting = ref(false)

const sendInvite = async () => {
    if (!newMember.value) return

    isInviting.value = true
  
    const userId = await store.findUser(newMember.value)
  
    if (userId) {
        await store.sendInvite(store.currChat._id, userId);
        newMember.value = ''
    }
    isInviting.value = false;
}

const getName = (senderId) => {

  const chatUsers = store.currChat.users
  
  if (chatUsers) {
    const user = chatUsers.find(u => u.user_id === senderId)
    return user ? user.username : "Unknown User"
  }
  
  return "Loading..."
}

const container = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  })
}

watch(() => store.currMsgs, () => {
  scrollToBottom()
}, { deep: true })



</script>

<template>

<div class="main">

    <div class="header">

    <div class="text">
        <h2>Welcome {{ store.capitalUser }}!</h2>
        <div v-if="store.currChat">

            <h3 id="current">You are now chatting in {{  store.currChat.group_name }} - Members: {{ store.currChat.memberDisplayNames?.length > 0 ? store.currChat.memberDisplayNames.join(', ') : '' }} </h3>
            <div class="memberSearch">
                <input class="search" v-model="newMember" placeholder="search a username" @keyup.enter="sendInvite"/>
                <button @click="sendInvite" class="sendButton">Invite Member</button>
            </div>

        <div class="chatBox" ref="container">
            <div v-for="msg in store.currMsgs" :key="msg._id" :class="['messages', msg.sender === store.currUser._id ? 'right' : 'left']">
                <span class="senderName">{{ getName(msg.sender) }}</span>
                <div class="messageBubble">{{ msg.content }}</div>
            </div>
            <p v-if="store.currMsgs.length === 0">No messages yet</p>

        </div>

        <div class="input">
                <input class="search" v-model="newMsg" @keyup.enter="sendMsg" placeholder="Type a message...">
                <button class="sendButton" @click="sendMsg">Send</button>
        </div>

        </div>

        <div v-else><h3>Please Select or Create a Group Chat </h3></div>

    </div>

    </div>

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


</template>

<style scoped>

.main {
    background-color: #bdbfa3;
    border-radius: 30px;
    padding: 10px;
    gap: 20px;
    width: 70%;
}

.header {
    display: flex;
    justify-content: space-between;
}

.text {
    margin-left: 20px;
    line-height: 40px;
}

.chatForm {
    margin-right: 5px;
    line-height: 10px;
    background: lightgray;
    padding: 20px;
    border-radius: 30px;
    width: 50%;
    height: 100%;
}

.modal {
    padding: 20px;
    border-radius: 30px;
    width: 500px;
    border: 1px solid #444;
    background-color: #d9c76f;
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

button {
    color: #f8f8f8;
    background-color: #000;
    border-radius: 999px;
    padding: 10px 15px;
    border: 0;
    margin-top: 15px;
}

button:active {
    transform: scale(0.97);
}

#nameGroup {
    border-radius: 20px;
    padding: 5px;
    width: 200px;
    margin-top: 15px;
    margin-right: 15px;
}

#new {
    margin-bottom: 10px;
}

.chatBox {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    height: 230px;
    width: 60vw;
    overflow-y: auto;
    background-color: #f9f9f9;
    border-radius: 30px;
    margin-top: 10px;
    &::-webkit-scrollbar { display: none };
    -ms-overflow-style: none;  
    scrollbar-width: none;  
}

.messages {
    display: flex;
    flex-direction: column;
    max-width: 70%;
}

.senderName {
    font-size: 0.8rem;
    margin-bottom: 4px;
    color: #666;
}

.messageBubble {
    padding: 10px 15px;
    border-radius: 15px;
    font-size: 0.95rem;
    line-height: 1.4;
    word-wrap: break-word;
}

.right {
    align-self: flex-end; 
    align-items: flex-end;
}

.right .messageBubble {
    background-color: #d48f17;
    color: #333;
    border-bottom-right-radius: 2px; 
}

.left {
    align-self: flex-start; 
    align-items: flex-start; 
}

.left .messageBubble {
    background-color: #e0e0e0;
    color: #333;
    border-bottom-left-radius: 2px;
}

.search {
    border-radius: 20px;
    padding: 5px;
    width: 50%;
}

.memberSearch {
    margin-top: -30px;
}

#current {
    margin-top: -20px;
}

.input {
    width: 95%;
    background: #f9f9f9;
    border-radius: 20px;
    margin-top: 10px;
    padding: 15px;
    padding-top: 5px;
    justify-self: center;
}

.sendButton {
    margin-left: 10px;
}


</style>