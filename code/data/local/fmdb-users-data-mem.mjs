import crypto from 'crypto'

const users = []
let userId = 0

export async function createUser(username, password){
    let newUser ={
        userName:`${username}`,
        password:`${password}`,
        ID: getNewUserId(),
        token: crypto.randomUUID()
    }
    users.push(newUser)
    return newUser
}

export async function getUser(userToken) {
    return users.find(user => user.token == userToken)
}

export async function getUserInLogin(username,password){
    return users.find(user=> user.userName==username && user.password==password)
}

export async function getUserByToken(token) {
    return getUserBy("token", token)
}

export async function getUserByUsername(username) {
    return getUserBy("userName", username)
}

async function getUserBy(propName, value) {
    const user = users.find(u => u[propName] == value)
    if(!user) {
        throw errors.NOT_FOUND('User')
    }
    return user
}

function getNewUserId() {
    return userId++
}
