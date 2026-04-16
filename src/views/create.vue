<script setup>

import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router'
import { useStore } from '../stores/appStore.js'

const router = useRouter();
const store = useStore();
const showPass = ref(false);
const formData = reactive({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
})

const userVals = [
  { id: 1, text: 'Must have at least 5 characters', check: () => formData.username.length >= 5 },
  { id: 2, text: 'Must begin with a letter', check: () => /^[a-zA-Z]/.test(formData.username) },
  { id: 3, text: 'Can only contain letters and numbers', check: () => /^[a-z0-9]+$/i.test(formData.username) }
]

const passVals = [
  { id: 4, text: 'Must have at least 8 characters', check: () => formData.password.length >= 8 },
  { id: 5, text: 'Must have 1 uppercase character', check: () => /[A-Z]/.test(formData.password) },
  { id: 6, text: 'Must have 1 lowercase character', check: () => /[a-z]/.test(formData.password) },
  { id: 7, text: 'Must have 1 number', check: () => /[0-9]/.test(formData.password) },
  { id: 8, text: 'Must have 1 special character', check: () => /[!@#$%^&*?]/.test(formData.password) }
]

const firstNameVal = [
  { id: 9, text: 'Cannot be empty', check: () => formData.firstName.length >= 1 },
]

const lastNameVal = [
  { id: 10, text: 'Cannot be empty', check: () => formData.lastName.length >= 1 },
]

const emailVal = [
  { id: 11, text: 'Must be a valid email address', check: () => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) },
]

const userValsShown = computed(() => userVals.filter(r=>!r.check()))
const passValsShown = computed(() => passVals.filter(r=>!r.check()))
const firstValsShown = computed(() => firstNameVal.filter(r=>!r.check()))
const lastValsShown = computed(() => lastNameVal.filter(r=>!r.check()))
const emailValsShown = computed(() => emailVal.filter(r=>!r.check()))

const isFormValid = computed(() => userValsShown.value.length === 0 && passValsShown.value.length === 0 && firstValsShown.value.length === 0 && lastValsShown.value.length === 0 && emailValsShown.value.length === 0 )

const userExists = ref(false)

const handleCreate = async () => { 
    if (isFormValid.value) {
        const success = await store.createAcc({...formData})
    if (success) {
        router.push('/login')
        userExists.value = false;
    } else {
        userExists.value = true;
    }
  }
}

</script>


<template>

    <div class="createView">

    <div class="main">

    <div class="createComponent">
        <div class="createForm">
            <h1>Create Account</h1>
            <h3>Please Fill Out Your Creditionals</h3>
            <form>
                <div class="firstField">
                    <label for="firstName">First Name</label><br>
                    <input v-model="formData.firstName"><br>
                </div>
                <div class="lastField">
                    <label for="lastName">Last Name</label><br>
                    <input v-model="formData.lastName"><br>
                </div>
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
                <div class="emailField">
                    <label for="email">Email Address</label><br>
                    <input v-model="formData.email"><br>
                </div>
                <span v-if="userExists" class="error">*User Already Exists*</span>
                <RouterLink v-if="userExists" to='/login'>Sign In Instead?</RouterLink>
                <button @click.prevent="handleCreate" :disabled="!isFormValid">Create Account!</button>
            </form>
        </div>
    </div>

        <div v-if="!isFormValid" class="createValidation">
            <div v-if="firstValsShown.length > 0">
                <span class="titles">First Name</span>
                <ul>
                    <li v-for="showing in firstValsShown" :key="showing.id">{{ showing.text }}</li>
                </ul>
            </div>

            <div v-if="lastValsShown.length > 0">
                <span class="titles">Last Name</span>
                <ul>
                    <li v-for="showing in lastValsShown" :key="showing.id">{{ showing.text }}</li>
                </ul>
            </div>

            <div v-if="userValsShown.length > 0">
                <span class="titles">Username</span>
                <ul>
                    <li v-for="showing in userValsShown" :key="showing.id">{{ showing.text }}</li>
                </ul>
            </div>

            <div v-if="passValsShown.length > 0">
            <span class="titles">Password</span>
                <ul>
                    <li v-for="showing in passValsShown" :key="showing.id">{{ showing.text }}</li>
                </ul>
            </div>

            <div v-if="emailValsShown.length > 0">
                <span class="titles">Email</span>
                <ul>
                    <li v-for="showing in emailValsShown" :key="showing.id">{{ showing.text }}</li>
                </ul>
            </div>

        </div>

    </div>

    </div>

</template>


<style scoped>

.createView {
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
    transition: all 0.8s ease;
    gap: 20px;
}

.createComponent {
    display: flex;
    justify-content: center;
    gap: 20px;
    transition: all 0.8s ease;
}

.createForm {
    background: #d48f17;
    border-radius: 50px;
    box-sizing: border-box;
    padding: 30px;
    font-size: small;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 300px;
}

.createValidation {
    align-self: center;
    background-color: white;
    padding: 30px;
    border-radius: 50px;
    color: #8a5e12;
    font-size: 16px;
    width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.createValidation li.valid {
    visibility: hidden;
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
    margin-block-end: 1em;
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

.firstField {
    box-sizing: border-box;
    width: 160px;
    margin-bottom: 5px;
    justify-self: center;
}

.lastField {
    box-sizing: border-box;
    width: 160px;
    margin-bottom: 5px;
    justify-self: center;
}

.emailField {
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

a {
    color:#7a0400;
    justify-self: center;
}

.error {
    color:#590300;
    justify-self: center;
}

</style>