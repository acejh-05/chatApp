<script setup>



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