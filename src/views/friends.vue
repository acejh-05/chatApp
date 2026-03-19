<script setup>

import { ref } from 'vue'

import { useStore } from '../stores/appStore';
const store = useStore();

const selectFriend = (name) => {
    store.targetUser = name
}

const newFriend = ref('');

const sendRequest = () => {
  if (newFriend.value.trim() !== '') {
    store.sendReq(newFriend.value.trim())
    newFriend.value = ''
  }
};

</script>

<template>

<div class="sidebar">

<div class="friends">

    <h2>Friends</h2>
        <li v-for="friend in store.currUser?.friends" :key="friend" @click="selectFriend(friend)" class="clickable">{{ friend }}</li>
    <div class="addFriend">
        <input id="addFriend" v-model="newFriend" placeholder="Enter your friend's username" @keyup.enter="sendRequest"/>
        <button @click="sendRequest" class="add">Add Friend</button>
    </div>

    <h2>Incoming Friend Requests</h2>
        <li v-for="req in store.currUser?.inReqs" :key="req">{{ req }}
            <button @click="store.acceptReq(req)" class="accept">Accept</button>
            <button @click="denyReq(req)" class="deny">Deny</button>
        </li>

    <h2>Outgoing Friend Requests</h2>
        <li v-for="req in store.currUser?.outReqs" :key="out">{{ req }} (Pending)</li>
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

</style>