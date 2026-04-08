<script setup>

import { ref, onMounted } from 'vue'

import { useStore } from '../stores/appStore';
const store = useStore();

const newFriend = ref('');

onMounted(() => {
    store.getReq()
    store.getFriends()
    setInterval(() => {
        store.getReq()
        store.getFriends()
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

</script>

<template>

<div class="sidebar">

<div class="friends">

    <h2>Friends</h2>
    <div v-if="store.friends.length > 0">
        <li v-for="friend in store.friends" :key="friend._id" class="listItem">
            <span @click="selectFriend(friend.username)" class="clickable">{{ friend.username }}</span>
            <button @click.stop="handleRemove(friend.userId)" class="remove">Remove Friend</button>
        </li>
    </div>
    <span v-else>No friends yet.</span>

    <div class="addFriend">
        <input id="addFriend" v-model="newFriend" placeholder="Enter your friend's username" @keyup.enter="sendRequest"/>
        <button @click="sendRequest" class="add">Add Friend</button>
        <p v-if="store.errorState" class="error-msg"  >{{ store.errorState }}</p>
    </div>

    <div v-if="store.inReqs.length > 0">
    <h2>Incoming Friend Requests</h2>
        <li v-for="req in store.inReqs" :key="req.id">{{ req.sender?.username }}
            <button @click="store.handleReq(req._id, true)" class="accept">Accept</button>
            <button @click="store.handleReq(req._id, false)" class="deny">Deny</button>
        </li>
    </div>

    <div v-if="store.outReqs.length > 0">
    <h2>Outgoing Friend Requests</h2>
        <li v-for="req in store.outReqs" :key="req.id">{{ req.receiver?.username }} (Pending)</li>
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

#addFriend {
    border-radius: 20px;
    padding: 5px;
    width: 50%;
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
    margin-top: 10px;
    margin-bottom: 5px;
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

.remove {
    border: none;
    background-color: lightgray;
    border-radius: 20px;
    padding: 8px 12px;
}

</style>