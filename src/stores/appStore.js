import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

export const useStore = defineStore('store', () => {

    const router = useRouter()

    const savedUser = localStorage.getItem('user');

    const currUser = ref({
        _id: null,
        username: null
    })

    if (savedUser && savedUser !== '[object Object]') {
        try {
            const parsed = JSON.parse(savedUser)
            currUser.value = parsed;
        } catch (e) {
            console.error("Storage parse error", e);
        }
    }

    const authToken = ref(localStorage.getItem('authToken') || null)
    const targetUser = ref(null)

    const friends = ref([])
    const inReqs = ref([])
    const outReqs = ref([])

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
                    errorState.value = 'Invalid username or password'
                } else {
                    errorState.value = 'Server error'
                }
            return false
            }

        const result = await response.json()
        if (response.ok) {
            currUser.value = result.user
            authToken.value = result.authToken

            localStorage.setItem('user', JSON.stringify(result.user))
            localStorage.setItem('authToken', result.authToken)
        }

        return true

        } catch (error) {
            console.log(error)
            return false
        }
    }
    
    function signOut() {
        currUser.value = { username: null }
        localStorage.removeItem('username')
        localStorage.removeItem('authToken')
    }

    const getAuth = () => ({
        'Content-Type': 'application-json',
        'Authorization': `Bearer ${authToken.value}`
    })

    async function findUser(username) {

        errorState.value = ''

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = `${host}/users?limit=10&search=${encodeURIComponent(username)}`

        try {
            const response = await fetch(url, { 
                headers: getAuth() 
            })
            const data = await response.json()

            const userArray = data.users || []
    
            const found = userArray.find(u => u.username.toLowerCase() === username.toLowerCase())

            if (found) {
                return found._id
            } else {
                errorState.value = 'User not found'
            return null;
            }
        } catch (error) {
            console.error("SEARCH CRASHED:", error)
            return null
        }
    }

    async function getFriends() {

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'

        try {
            const response = await fetch(`${host}/user`, {
                method: 'GET',
                headers: getAuth(),
            })
            const data = await response.json()
            friends.value = data.friends || []
        } catch (e) {
            console.error("Failed to fetch friends", e)
        }
    }

    async function sendReq(username) {

        errorState.value = ''

        const nameToSearch = username.trim().toLowerCase()

        if (nameToSearch === currUser.value.username.toLowerCase()) {
            errorState.value = "You cannot add yourself as a friend"
            return false
        }

        const isAlreadyFriend = friends.value.some(f => f.username.toLowerCase() === nameToSearch.toLowerCase())

        if (isAlreadyFriend) {
            errorState.value = `${nameToSearch} is already your friend`
            return false
        }

        const isPendingOut = outReqs.value.some(r => r.receiver?.username?.toLowerCase() === nameToSearch)
        const isPendingIn = inReqs.value.some(r => r.sender?.username?.toLowerCase() === nameToSearch)

        if (isPendingOut || isPendingIn) {
            errorState.value = `A friend request with ${nameToSearch} is already pending`
            return false
        }

        const userId = await findUser(username)

        if (!userId) {
            errorState.value = "Could not find that user"
            return false
        }
        
        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = `${host}/friend-request/${userId}`

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: getAuth(),
            })

            console.log("POST Response Status:", response.status)

            if (response.ok) {
                await getReq()
                return true
            } else {
                const errorData = await response.json().catch(() => ({}))
                errorState.value = errorData.message || "Server refused the request"
                return false
            }
        } catch (error) {
            console.error("Network or Script Error:", error)
            errorState.value = "Failed to communicate with server"
            return false
        }
    }

    async function handleReq(requestId, acceptStatus) {

        errorState.value = ''

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = `${host}/friend-request/${requestId}?accept=${String(acceptStatus)}`

        try {
            const response = await fetch(url, {
            method: 'PATCH',
            headers: getAuth(),
        })

        const result = await response.json();
        console.log("Server Response after Patch:", result)

        if (!response.ok) {
            throw new Error('Failed to update friend request')
        }

        this.inReqs = this.inReqs.filter(r => r._id !== requestId)
        await getReq()
        await getFriends()
    
  } catch (err) {
    errorState.value = err.message;
  }
}

    async function getReq() {

        errorState.value = ''

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = `${host}/friend-requests`

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: getAuth(),
                cache: 'no-store'
            })

            if (!response.ok) {
                throw new Error('Failed to fetch requests')
            }

            const data = await response.json()
            const requests = Array.isArray(data) ? data : (data.requests || [])
            const myId = String(currUser.value?._id || currUser.value?.id || "").trim()

            inReqs.value = requests.filter(req => req.receiver?.userId === myId)
            outReqs.value = requests.filter(req => req.sender?.userId === myId)

        } catch {
            errorState.value = 'Could not load friend requests'
            return []
        }
    }

    async function removeFriend(userId) {

        errorState.value = ''

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = `${host}/friend/${userId}`

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: getAuth(),
            })

            if (response.ok) {
                await getFriends()
                await getReq()
            }
        } catch (err) {
            errorState.value = "Failed to remove friend"
            console.error(err)
        }
    }

    watch(() => currUser.value?._id, (newId) => {
        if (newId) {
            console.log("User detected, fetching friend requests...");
            getReq();
        }
    }, 
        { immediate: true }
    )

    return { currUser, capitalUser, targetUser, friends, inReqs, outReqs, errorState, isAuth, signIn, createAcc, signOut, findUser, getFriends, sendReq, handleReq, getReq, removeFriend }
})