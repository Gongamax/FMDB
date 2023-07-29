export default function(fmdbUsersData) {
    // Validate arguments
    if (!fmdbUsersData) {
        throw errors.INVALID_PARAMETER('fmdbUsersData')
    }

    return {
        getUser : getUser,
        createUser : createUser,
        validateUser:validateUser,
        getUserInLogin, getUserInLogin,
        validateCredentials : validateCredentials,
        getUserByID : getUserByID
    }

    async function getUser(userToken){
        const user = await cmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return user
    }

    async function getUserByID(ID){
        const user = await cmdbData.getUserByID(ID)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return user
    }

    async function getUserInLogin(username, password){
        const user = await cmdbData.getUserInLogin(username, password)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return user
    }

    async function createUser(username, password){
        return cmdbData.createUser(username, password)
    }
    

    async function validateUser(username, password){
        return cmdbData.getUserInLogin(username, password)
                .then(user => { 
                    if(user)
                        return Promise.resolve({userName : user.userName , password : user.password, token : user.token})
                }).catch(e => Promise.reject(e)) 
    }

    async function validateCredentials(username, password) {
        try {
            const user = await cmdbData.getUserByUsername(username)
            if(user == null){
                return errors.USER_NOT_FOUND
            }
            if(user.password != password) {
                return null
            }
            return user.token
        } catch(e) {
            return null
        }
    }
}