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
        const user = await fmdbUsersData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return user
    }

    async function getUserByID(ID){
        const user = await fmdbUsersData.getUserByID(ID)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return user
    }

    async function getUserInLogin(username, password){
        const user = await fmdbUsersData.getUserInLogin(username, password)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return user
    }

    async function createUser(username, password){
        return fmdbUsersData.createUser(username, password)
    }
    

    async function validateUser(username, password){
        return fmdbUsersData.getUserInLogin(username, password)
                .then(user => { 
                    if(user)
                        return Promise.resolve({userName : user.userName , password : user.password, token : user.token})
                }).catch(e => Promise.reject(e)) 
    }

    async function validateCredentials(username, password) {
        try {
            const user = await fmdbUsersData.getUserByUsername(username)
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