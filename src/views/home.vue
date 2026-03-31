<script setup>

import { onBeforeRouteLeave } from 'vue-router'
import { useStore } from '../stores/appStore.js'
const store = useStore()

onBeforeRouteLeave((to, from) => {
    const answer = window.confirm(
        'Are you sure you want to sign out?',
    )
    if (answer) {
        store.signOut()
        return true
    } else {
        return false
    }
})


</script>


<template>
    <div class="views">
        <RouterView class="sidebar" name="sidebar"></RouterView>
        <RouterView class="main" name="main"></RouterView>
    </div>

</template>


<style scoped>

.views {
    height: 70vh;
    width: 97%;
    justify-content: center;
    flex: 1;
    display: flex;
    gap: 20px;
    padding: 20px;
}

.sidebar {
    flex: 1;
}

.main {
    flex: 3;
}

</style>