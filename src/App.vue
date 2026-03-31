<script setup>

import { useRoute, useRouter } from 'vue-router';
import { useStore } from './stores/appStore'

const route = useRoute();
const router = useRouter();
const store = useStore();

</script>


<template>

<div class="app">

<nav>
  <div class="links-left"></div>
  <div class="links-right">
    <RouterLink v-if="['/', '/login'].includes(route.path)" id="createLink" to="/create">Create Account</RouterLink>
    <RouterLink v-if="['/', '/create'].includes(route.path)" id="signinLink" to="/login">Sign In</RouterLink>
    <RouterLink v-if="['/home'].includes(route.path)" id="signoutLink" to="/">Sign Out</RouterLink>
  </div>
</nav>

<img id="logo" src="../brassKitty.PNG" alt="brass cat logo">

<main>
  <RouterView />
</main>

<footer>
  <p>Kitty Chat - The chatting app for all furry, scaly, slimy, and feathery friends!</p>
</footer>

</div>

</template>

<style scoped>

html, body, * {
  margin: 0;
  padding: 0;
  font-family: 'SN Pro', 'sans-serif'
}

.app {
  height: 100vh;
  width: 100vw;
  justify-self: center;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 100%;
}

nav {
  background-color: #d9c76f;
  height: 80px;
}

main {
  background-color: #fff1ab;
  opacity: 90%;
  height: 100%;
}

footer {
  background-color: #d9c76f;
  height: 80px;
}

footer p {
  justify-self: center;
  padding: 30px;
  font-size: 1.2em;
}

#logo {
  height: 60vh;
  width: 50vw;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  filter: grayscale(100%);
}

.links-right {
    padding: 20px;
    margin-right: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

#createLink {
    display: inline-flex;
}

#signinLink {
    display: inline-flex;
}

#signoutLink {
   display: inline-flex;
   cursor: pointer;
}

a {
    display: inline-block;
    padding: 10px 15px;
    border-radius: 999px;
    color: #000;
    text-decoration: none;
    background-color: #d48f17;
}

.router-link-active {
  background-color: #965e0f;
  transition: background-color .25s ease-in, color 0s ease-in .25s;
}


</style>
