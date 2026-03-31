import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useStore = defineStore('store', () => {
    const router = useRouter();

    //const storedUsers = localStorage.getItem('db_users')
    //const storedMsgs = localStorage.getItem('db_messages')
    //const storedSession = localStorage.getItem('current_session')

    const currUser = ref({
        username: localStorage.getItem('username') || null,
    })

    const errorState = ref('')


    const capitalUser = computed(() => {
        if (!currUser.value) return ''
        const name = currUser.value.username
        return name.charAt(0).toUpperCase() + name.slice(1)
    })

    const isAuth = computed(() => {
        return !!currUser.value.username
    })

    async function createAcc(user) {

        errorState.value = ''
        
        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = host + '/user'

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user),
        }

        console.log(`POST /user with body`, user)

        try {
            const response = await fetch(url, options)
            console.log(`Response status: ${response.status}`)

            if (!response.ok) {
                const result = await response.json()
                console.log(result)

                if (response.status === 400) {
                    let errMessage = 'Validation Error'
                    if (result.errors) {
                        errMessage += ' ' + Object.values(result.errors).map(err => err.message).join(' ')
                    }
                    errorState.value = errMessage;
                } else if (response.status === 409) {
                    errorState.value = 'Duplicate account'
                } else {
                    errorState.value = 'Server Error'
                }
                return false
            }

        return true

        } catch (error) {
        console.log(error)
        return false
        }
    }

    async function signIn(username, password) {

        errorState.value = ''

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = host + '/user/login'

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
        }

        console.log(`POST /user/login for: ${username}`)

        try {
            const response = await fetch(url, options)
            console.log(`Response status: ${response.status}`)

            if (!response.ok) {
                if (response.status === 401 || response.status === 400) {
                    errorState.value = 'Invalid username or password.';
                } else {
                    errorState.value = 'Server error';
                }
            return false;
            }

        const result = await response.json()
        console.log(result)

        currUser.value = result.user
        localStorage.setItem('username', result.user.username)

        return true

        } catch (error) {
        console.log(error)
        return false
        }
    }
    
    function signOut() {
        currUser.value = { username: null }
        localStorage.removeItem('username')
    }



    //const targetUser = ref(null)

    /*const capitalTarget = computed(() => {
        if (!targetUser.value) return ''
        const name = targetUser.value
        return name.charAt(0).toUpperCase() + name.slice(1)
    })*/
    
    /*const users = ref( storedUsers ? JSON.parse(storedUsers) : [
        { user: 'froggy700', pass: 'fliesAndl1ly5!', friends: ['eatinBugs'], outReqs: [], inReqs: [] },
        { user: 'coolestk9', pass: 'barkWoof&gr0wl', friends: ['prettyKitty'], outReqs: [], inReqs: [] },
        { user: 'prettyKitty', pass: 'm30wBiscu!ts', friends: ['coolestk9'], outReqs: [], inReqs: [] },
        { user: 'loudTweeter', pass: 'ch1rpCheep?', friends: [], outReqs: [], inReqs: [] },
        { user: 'eatinBugs', pass: 'lizzyB0cephu$', friends: ['froggy700'], outReqs: [], inReqs: [] },
    ])*/

    /*const messages = ref( storedMsgs ? JSON.parse(storedMsgs) : [
        { from: 'froggy700', to: 'eatinBugs', message: 'Those flies you made last night really hit the spot man'},
        { from: 'eatinBugs', to: 'froggy700', message: 'The secret is using a little bit of worms and a lot of love :)'},
        { from: 'prettyKitty', to: 'coolestk9', message: 'This morning my owner tried to hide a pill in a bit of tuna. Does she think im stupid?'},
        { from: 'coolestk9', to: 'prettyKitty', message: 'How dare she! Luckily, my owner doesnt do that. I do get a piece of cheese every morning though.'},
    ])*/

    /*watch(users, (val) => {
        localStorage.setItem('db_users', JSON.stringify(val))
    }, { deep: true } )

    watch(messages, (val) => {
        localStorage.setItem('db_messages', JSON.stringify(val))
    }, { deep: true } )

    watch(currUser, (val) => {
        if (val) localStorage.setItem('current_session', JSON.stringify(val))
        else localStorage.removeItem('current_session')
    }, { deep: true } )
    */

    /*function signIn(username, password) {
        const user = users.value.find( u => u.user === username && u.pass === password )
        if (user) { 
            currUser.value = user
            return true 
        }
        return false;
    }*/

    /*function createAcc(username, password) {
        if (users.value.some(u => u.user === username)) return false;
        users.value.push({
            user: username,
            pass: password,
            friends: [],
            outReqs: [],
            inReqs: []
        })
        return true
    }*/

    /*function signOut() {
        currUser.value = null
        targetUser.value = null
    }*/

    /*function sendMsg(to, message) {
        if (!currUser.value || !message ) return;
        messages.value.push({
            from: currUser.value.user,
            to: to,
            message: message
        })
    }*/

    /*function sendReq(tarName) {
        const target = users.value.find(u => u.user === tarName)
        const savedUser = currUser.value

        if (target && savedUser && target.user !== savedUser.user) {
            if (!target.inReqs.includes(savedUser.user) && !savedUser.friends.includes(target.user)) {
                target.inReqs.push(savedUser.user)
                currUser.value.outReqs.push(tarName)
            }
        }
    }*/

    /*function acceptReq(reqName) {
        const request = users.value.find(u => u.user === reqName)
        const savedUser = currUser.value

        if (savedUser && request) {
            savedUser.friends.push(reqName)
            request.friends.push(savedUser.user)
            savedUser.inReqs = savedUser.inReqs.filter(name => name !== reqName)
            request.outReqs = request.outReqs.filter(name => name !== savedUser.user)
        }
    }*/

    return { currUser, capitalUser, errorState, isAuth, signIn, createAcc, signOut }
})