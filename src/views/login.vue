<script setup>

import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../stores/appStore.js'

const router = useRouter();
const route = useRoute();
const store = useStore();
const showPass = ref(false);
const formData = reactive({
    username: "",
    password: "",
})

const isFormFilled = computed(() => {
    return Object.values(formData).every(val => val.trim() !== '')
});

const userExists = ref(true)

const handleLogin = async () => {
    if (isFormFilled.value) {
        const success = await store.signIn(formData.username, formData.password)
        if (success) {
            userExists.value = true;
            router.push('/home')
        } else {
            userExists.value = false;
        }
    }
}

/*const handleLogin = () => {
    userExists.value = true
    if (isFormFilled.value) {
        const success = store.signIn(formData.username, formData.password)
        if (success) {
            router.push('/home')
        } else {
            userExists.value = false
        }
        
    }
}*/

</script>


<template>

    <div class="loginView">

    <div class="main">

    <div class="loginComponent">
        <div class="loginForm">
            <h1>Sign Into Your Account</h1>
            <h3>Please Enter Your Credentials</h3>
            <form>
                <div class="usernameField">
                    <label for="username">Username</label><br>
                    <input v-model="formData.username"><br>
                </div>
                    <div class="passwordField">
                    <div class="passwordLabel">
                        <label for="password">Password</label>
                        <label class="switch">
                            <input type="checkbox" v-model="showPass">
                            <span class="slider"></span>
                        </label><br>
                    </div>
                    <input :type="showPass ? 'text' : 'password'" v-model="formData.password" /><br>
                </div>
                <span v-if="!userExists" class="error">*Username or Password is Incorrect*</span><br>
                <button @click.prevent="handleLogin">Sign In!</button>
            </form>
        </div>
    </div>

    </div>

    </div>

</template>


<style scoped>

.loginView {
   height: 100%;
   width: 100%;
   z-index: 10;
   justify-content: center;
   align-content: center;
}

a {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 999px;
    color: #000;
}

.main {
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.8s ease;
    gap: 20px;
}

.loginComponent {
    display: flex;
    justify-content: center;
    gap: 20px;
    transition: all 0.8s ease;
}

.loginForm {
    background-color: #d48f17;
    box-sizing: border-box;
    padding: 30px;
    border-radius: 50px;
    font-size: small;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 300px;
}

h1 {
    text-align: center;
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
    margin: 0;
}

h3 {
    text-align: center;
    display: block;
    font-size: 1.17em;
    margin-block-start: 1em;
    margin-block-end: 0.5em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
}

.usernameField {
    box-sizing: border-box;
    width: 160px;
    margin-bottom: 5px;
    justify-self: center;
}

.passwordField {
    box-sizing: border-box;
    width: 160px;
    margin-bottom: 5px;
    justify-self: center;
}

label {
    display: inline-block;
    margin-bottom: 5px;
}

input {
    box-sizing: border-box;
    width: 100%;
    margin-bottom: 5px;
}

button {
    font-size: medium;
    color: #f8f8f8;
    background-color: #000;
    border-radius: 999px;
    padding: 10px 15px;
    border: 0;
    display: flex;
    justify-self: center;
    margin-top: 15px;
}

button:active {
    transform: scale(0.97);
}

ul {
    padding-left: 15px;
    margin: 3px 0 10px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 30px;
  height: 18px;
}

.switch input { 
    opacity: 0; 
    width: 0; 
    height: 0; 
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px; 
  width: 14px;
  left: 2px; 
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4a90e2;
}

input:checked + .slider:before {
  transform: translateX(12px); 
}

.passwordLabel {
    display: flex;
    justify-content: space-between;
    align-items: center;            
    width: 150%;
}

.error {
    color: #590300;
    justify-self: center;
}

</style>