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
    const successMsg = ref('')

    const profileData = ref(null)
    const showProfile = ref(false)

    const userChats = ref([])
    const currChat = ref(null)
    const currMsgs = ref([])
    const chatInvites = ref([])

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
        successMsg.value = ''
        
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

        successMsg.value = "Account Created Successfully!"
        setTimeout(() => { successMsg.value = '' }, 5000)
        return true

        } catch (error) {
        console.log(error)
        return false
        }
    }

    async function signIn(username, password) {

        errorState.value = ''
        successMsg.value = ''

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
        currChat.value = null
        localStorage.removeItem('username')
        localStorage.removeItem('authToken')
    }

    const getAuth = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`
    })

    async function findUser(username) {

        errorState.value = ''
        successMsg.value = ''

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

    async function getProfile() {
  
        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = host + '/user'

        try {
            const response = await fetch(url, {
            method: 'GET',
            headers: getAuth(),
            })

            if (response.ok) {
                const result = await response.json()
                profileData.value = result
                showProfile.value = true
            } else {
                errorState.value = 'Could not fetch profile'
            }
        } catch (err) {
            errorState.value = 'Server connection failed'
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
        successMsg.value = ''

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
                alert("Friend Request Sent!")
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
        successMsg.value = ''

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
        successMsg.value = ''

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

            console.log(requests)

            inReqs.value = requests.filter(req => req.receiver?.userId === myId)
            outReqs.value = requests.filter(req => req.sender?.userId === myId)

        } catch {
            errorState.value = 'Could not load friend requests'
            return []
        }
    }

    async function removeFriend(userId) {

        errorState.value = ''
        successMsg.value = ''

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

    async function createChat(chatInfo) {
        errorState.value = ''
        successMsg.value = ''
        
        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        const url = host + '/chat'

        const options = {
            method: 'POST',
            headers: getAuth(),
            body: JSON.stringify(chatInfo),
        }
        
        try {
            const response = await fetch(url, options)
            console.log(`Response status: ${response.status}`)

            if (!response.ok) {
                const responseText = await response.text();
                let result = {};

                if (responseText) {
                    try {
                        result = JSON.parse(responseText)
                    } catch (e) {
                        console.error("Error parsing JSON:", e)
                        result = { errors: { parse: { message: "Unexpected server response format" } } }
                    }
                }

                console.log(result)

                if (response.status === 400) {
                    let errMessage = 'Validation Error'
                    if (result.errors) {
                        errMessage += ' ' + Object.values(result.errors).map(err => err.message).join(' ')
                    }
                    errorState.value = errMessage
                    console.log(errMessage)
                } else {
                    errorState.value = 'Server Error'
                }
                return false
            }

        alert("Group Chat Created Successfully!")
        await getChats()
        return true

        } catch (error) {
        console.log(error)
        return false
        }
    }

    async function getChats() {

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
    
        try {
            const userResponse = await fetch(`${host}/user`, {
                method: 'GET',
                headers: getAuth()
            })

            if (!userResponse.ok) throw new Error("Could not fetch user info")
        
            const userData = await userResponse.json()
            const chatIds = userData.chat_sessions || []
            chatInvites.value = (userData.requests || []).filter(req => req.kind === "ChatInvite") 

            const chatDetails = await Promise.all(chatIds.map(id => fetch(`${host}/chat/${id}`, { 
                headers: getAuth() 
            }).then(res => res.ok ? res.json() : null)))

            const results = chatDetails.filter(chat => chat !== null)

            for (let chat of results) {
                chat.memberDisplayNames = chat.users ? chat.users.map(u => u.username) : []

                if (chat.messages) {
                    chat.messages = chat.messages.map(msg => {
                        const user = chat.users.find(u => u._id === msg.sender)
                        return {...msg, sender_name: user ? user.username : 'Unknown'}
                    })
                }
            }

            userChats.value = results
            console.log(userChats.value)
            console.log(userData)

        } catch (error) {
            console.error("Error building chat list:", error)
        }
    }

async function selectChat(chat) {

    currChat.value = chat
    errorState.value = ''
    successMsg.value = ''
    
    const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
    try {
        const response = await fetch(`${host}/chat/${chat._id}/messages`, {
            method: 'GET',
            headers: getAuth()
        })
        
        if (response.ok) {
            currMsgs.value = await response.json()
        }

    } catch (error) {
        console.error("Failed to load messages:", error)
    }
}

async function sendInvite(chatId, userId) {

    errorState.value = ''
    successMsg.value = ''

    const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
    try {
        const response = await fetch(`${host}/chat/${chatId}/invitation/${userId}`, {
            method: 'POST',
            headers: getAuth()
        })

        if (response.ok) {
            alert("Invitation sent!")
        } else {
            alert("Could not send invitation")
        }
    } catch (err) {
        console.error("Invite Error:", err)
    }
}

async function handleInvite(chatId, requestId, isAccepted) {

    errorState.value = ''
    successMsg.value = ''

    const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
    const url = `${host}/chat/${chatId}/invitation/${requestId}?accept=${isAccepted}`

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: getAuth()
        })

        if (response.ok) {
            await getChats()
            const updatedChat = await response.json()
            return updatedChat
        }
    } catch (err) {
        console.error("Response Error:", err);
    }
}

async function sendMsg(text) {

    errorState.value = ''
    successMsg.value = ''

    if (!currChat.value) return

    const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
    
    try {
        const response = await fetch(`${host}/chat/${currChat.value._id}/message`, {
            method: 'POST',
            headers: getAuth(),
            body: JSON.stringify({ message: text })
        })

        if (response.ok) {
            await selectChat(currChat.value)
        }
    } catch (error) {
        errorState.value = "Failed to send message"
    }
}

    async function leaveChat(chatId) {

        errorState.value = ''
        successMsg.value = ''

        const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
        try {
            const response = await fetch(`${host}/chat/${chatId}/membership`, {
                method: 'DELETE',
                headers: getAuth()
            })

            if (response.ok) {
                userChats.value = userChats.value.filter(c => c._id !== chatId)
                currChat.value = null
            } else {
                const err = await response.json();
                errorState.value = err.message || "Failed to leave chat"
            }
        } catch (error) {
            console.error("LEAVE ERROR:", error)
            errorState.value = "Network error"
        }
    }

    return { currUser, capitalUser, targetUser, friends, inReqs, outReqs, errorState, successMsg, isAuth, 
        profileData, showProfile, userChats, currChat, currMsgs, chatInvites,
        getProfile, signIn, createAcc, signOut, findUser, getFriends, sendReq, handleReq, getReq, removeFriend, 
        createChat, getChats, selectChat, sendInvite, handleInvite, sendMsg, leaveChat }
})