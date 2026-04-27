<script setup>

import { ref, onMounted, reactive, computed } from 'vue'

import { useStore } from '../stores/appStore';
const store = useStore();

const newFriend = ref('');

onMounted(() => {
    store.getReq()
    store.getFriends()
    store.getChats()
    setInterval(() => {
        store.getReq()
        store.getFriends()
        store.getChats()
    }, 30000)
})

const selectFriend = (name) => {
    store.targetUser = name
}

const sendRequest = async () => {
    if (newFriend.value.trim() !== '') {
        const success = await store.sendReq(newFriend.value.trim())
        if (success) {
            newFriend.value = ''
            setTimeout(() => store.getReq(), 500)
        }
    }
}

const handleRemove = async (userId) => {
    if (confirm("Are you sure you want to remove this friend?")) {
        await store.removeFriend(userId);
        await store.getFriends();
    }
}

const chatData = reactive({
    group_name: '',
    chat_type: "group",
})

const groupNameVal = [
  { id: 12, text: 'Cannot be empty', check: () => chatData.group_name.length >= 1 },
]

const nameValsShown = computed(() => groupNameVal.filter(r=>!r.check()))

const isFormValid = computed(() => nameValsShown.value.length === 0 )

const chatExists = ref(false)

const handleCreate = async () => { 
    const data = {
      group_name: chatData.group_name,
      chat_type: chatData.chat_type,
    }
    if (isFormValid.value) {
        const success = await store.createChat(data)
    if (success) {
        chatExists.value = false;
    } else {
        chatExists.value = true;
    }
  }
}

const handleSelect = (chat) => {
    store.selectChat(chat)
}

const handleLeave = async (chat) => {
    if (confirm("Are you sure you want to leave this chat?")) {
        await store.leaveChat(chat._id)
        await store.getChats()
    }
}



</script>

<template>

<div class="sidebar">

<div class="friends">

    <h2>Friends</h2>
    <div v-if="store.friends.length > 0">
        <li v-for="friend in store.friends" :key="friend._id" class="listItem">
            <span @click="selectFriend(friend.username)">{{ friend.username }}</span>
            <button @click.stop="handleRemove(friend.userId)" class="remove">Remove Friend</button>
        </li>
    </div>
    <span v-else>No friends yet.</span>

    <div>
        <input class="search" v-model="newFriend" placeholder="search a username" @keyup.enter="sendRequest"/>
        <button @click="sendRequest" class="add">Add Friend</button>
    </div>

    <div v-if="store.inReqs.length > 0">
    <h2>Incoming Friend Requests</h2>
        <li class="listItem" v-for="req in store.inReqs" :key="req.id">{{ req.sender?.username }}
            <button @click="store.handleReq(req._id, true)" class="accept">Accept</button>
            <button @click="store.handleReq(req._id, false)" class="deny">Deny</button>
        </li>
    </div>

    <div class="myChats">
        <h2>Your Chats</h2>
            <ul v-if="store.userChats && store.userChats.length > 0">
                <li v-for="chat in store.userChats" :key="chat._id" class="listItemChat">
                    <span id="name" @click.prevent="handleSelect(chat)">{{ chat.group_name }}</span>
                    <button v-if="store.currUser._id !== chat.owner?.user_id" @click="handleLeave(chat)" class="remove">Leave Chat</button>
                </li>
            </ul>
        <p v-else>You haven't joined any chats yet</p>
        <input class="search" placeholder='new chat name' v-model="chatData.group_name" @keyup.enter="sendRequest">
        <button class="add" @click.prevent="handleCreate" :disabled="!isFormValid">Create Group Chat</button>

        <div v-if="store.chatInvites.length > 0" class="invites">
            <h2>Incoming Group Invites</h2>
                <ul>
                <li class="listItemChat" v-for="invite in store.chatInvites" :key="invite._id"> 
                    {{ invite.chat.name }}
                    <button class="accept" @click="store.handleInvite(invite.chat.chatId, invite._id, true)">Accept</button>
                    <button class="deny" @click="store.handleInvite(invite.chat.chatId, invite._id, false)">Decline</button>
                </li>
                </ul>
        </div>

    </div>

</div>

</div>

</template>

<style scoped>

.sidebar {
    background-color: #fdffdb;
    border-radius: 30px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-height: 93%;
}

.friends {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

li {
    margin-left: 20px;
}

.add {
    border: none;
    background-color: #d48f17;
    border-radius: 20px;
    padding: 8px 12px;
    margin-top: 10px;
    margin-left: 10px;
}

.search {
    border-radius: 20px;
    padding: 5px;
    width: 45%;
    margin-top: 20px;
}

.accept {
    border: none;
    border-radius: 20px;
    padding: 8px 12px;
    background-color: #adab0e;
    margin: 5px;
    font-weight: bold;
    color: white;
}

.deny {
    border: none;
    border-radius: 20px;
    padding: 8px 12px;
    background-color:#ad560e;
    margin: 5px;
    color: white;
}

.listItem {
    display: flex;
    justify-content: space-between; 
    align-items: center;           
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    width: 80%;
    margin-left: -10px;
}

.listItemChat {
    display: flex;
    justify-content: space-between; 
    align-items: center;           
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    margin-left: -40px;
    width: 80%;
}

.listItem span, .listItem button#name, .listItem li {
  margin-left: 10px;
  text-align: left;
}

.clickable {
    border: none;
    background-color: white;
    border-radius: 20px;
    padding: 8px 12px;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 20px;
}

#name {
    background: rgba(255, 255, 255, 0.683);
    padding: 8px 12px;
    border-radius: 20px;
    border: solid 2px black;
    
}

.remove {
    border: none;
    background-color: lightgray;
    border-radius: 20px;
    padding: 8px 12px;
    margin-left: 10px;
}

.add {
    color: black;
    background-color: #d48f17;
    border-radius: 999px;
    padding: 10px 15px;
    border: 0;
    margin-top: 15px;
    width: 45%;
}

button:active {
    transform: scale(0.97);
}

</style>