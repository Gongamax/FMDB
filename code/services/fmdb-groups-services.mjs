import errors from '../errors.mjs'

export default function(fmdbData) {
    // Validate arguments
    if (!fmdbData) {
        throw errors.INVALID_PARAMETER('usersData or groupsData')
    }
    return {
        getGroups: getGroups,
        getAllGroups: getAllGroups,
        getGroup: getGroup,
        deleteGroup: deleteGroup,
        deleteMovieFromGroup: deleteMovieFromGroup,
        createGroup: createGroup,
        updateGroup: updateGroup,
        addMovieToGroup: addMovieToGroup, 
        groupInfo: groupInfo,
    }

    async function getGroups(userToken, q, limit = Infinity, skip = 0) {
        limit = Number(limit)
        skip = Number(skip)
        if(isNaN(limit) || isNaN(skip)) {
            throw errors.INVALID_PARAMETER(`skip or limit`)
        }
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return fmdbData.getGroups(user.ID, q, limit, skip)
    }
        
    async function getGroup(userToken, groupID) {
        // Validate taskId
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        const group = await fmdbData.getGroup(user.ID, groupID)
        if(group) {
            return group
        }
        throw errors.GROUP_NOT_FOUND(groupID)
    }


    async function getAllGroups(limit = Infinity, skip = 0){
        limit = Number(limit)
        skip = Number(skip)
        if(isNaN(limit) || isNaN(skip)) {
            throw errors.INVALID_PARAMETER(`skip or limit`)
        }
        return fmdbData.getAllGroups(limit,skip)
    }

    async function groupInfo(userToken,groupID,){
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return fmdbData.groupInfo(user.ID,groupID)
    }

    async function deleteGroup(userToken, groupID) {
        // Validate taskId
        const user = await fmdbData.getUser(userToken)
        //console.log(user)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        return fmdbData.deleteGroup(user.ID, groupID)
    }
    

    async function createGroup(userToken,name,description) {
        // Validate all task properties
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        if(!isValidString(userToken,name)) {
             throw errors.INVALID_PARAMETER('name')
        }
        if(!isValidString(userToken,description)) {
            throw errors.INVALID_PARAMETER('description')
       }
        return fmdbData.createGroup(name, description,user.ID) 
    }

    async function updateGroup(userToken, groupID,name,description) {
        //console.log(`Services groupId : ${groupID}`)
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        if(!isValidString(userToken,name)) {
            throw errors.INVALID_PARAMETER('name')
        }
       if(!isValidString(userToken,description)) {
           throw errors.INVALID_PARAMETER('description')
        }
       return fmdbData.updateGroup(user.ID, groupID, name, description)
    }

    async function deleteMovieFromGroup(userToken,groupID,title){
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        
        if(!isValidString(userToken,title)) {
            throw errors.INVALID_PARAMETER('title')
       }
       return fmdbData.deleteMovieFromGroup(user.ID, groupID,title)
    }

    async function addMovieToGroup(userToken,groupID,movieId){
        const user = await fmdbData.getUser(userToken)
        if(!user) {
            throw errors.USER_NOT_FOUND()
        }
        if(!isValidString(userToken, movieId)) {
            throw errors.INVALID_PARAMETER('movieId')
       }
       return fmdbData.addMovieToGroup(user.ID, groupID,movieId)
    }

    // Auxiliary functions
    
    function isValidString(value) {
        return typeof value == 'string' && value != ""
    }

}