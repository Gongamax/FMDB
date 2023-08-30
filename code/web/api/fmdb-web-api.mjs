// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response

import toHttpResponse from './response-errors.mjs'


export default function (fmdbUsersServices, fmdbGroupServices, fmdbMovieServices) {
    // Validate arguments
    if (!fmdbUsersServices) {
        errors.INVALID_PARAMETER("usersServices")
    }
    if (!fmdbGroupServices) {
        errors.INVALID_PARAMETER("groupsServices")
    }
    if (!fmdbMovieServices) {
        errors.INVALID_PARAMETER("moviesServices")
    }
    return {
        createUser: createUserInternal,
        getGroup: handleRequest(getGroupInternal),
        getGroups : handleRequest(getGroupsInternal),
        getUser: handleRequest(getUserInternal),
        deleteGroup: handleRequest(deleteGroupInternal),
        createGroup: handleRequest(createGroupInternal),
        updateGroup: handleRequest(updateGroupInternal),
        getAllGroups : handleRequest(getAllGroupsInternal), 
        groupInfo : handleRequest(groupInfoInternal), 
        addMovieToGroup: handleRequest(addMovieToGroupInternal),
        deleteMovieFromGroup : handleRequest(deleteMovieFromGroupInternal),
        getTopMovies : getTopMoviesInternal,
        getMovieByExpression : getMovieByExpressionInternal
    }  

    async function createUserInternal(req, rsp){
        let newUser = await fmdbUsersServices.createUser(req.body.username, req.body.password, req.body.email)
        rsp.json(newUser).status(201)
        return{
                status : `User id ${newUser.ID} created with success`,
                user: newUser
        }
    }

    async function getGroupInternal(req, rsp){
        const groupId = req.params.groupId
        return fmdbGroupServices.getGroup(req.token, groupId)
    }

    async function getGroupsInternal(req, rsp){
        let groups = await fmdbGroupServices.getGroups(req.token, 0, req.query.limit, req.query.skip)
        return groups
    }

    async function getUserInternal(req, rsp){
        return fmdbGroupServices.getUser(req.token)
    }

    async function deleteGroupInternal(req, rsp){
        const groupId = req.params.groupId
        const group = await fmdbGroupServices.deleteGroup(req.token, req.params.groupId)
        return{
                status : `Group with id ${groupId} deleted with success`,
                group: group
        }
    }

    async function createGroupInternal(req, rsp){
        let newGroup = await fmdbGroupServices.createGroup(req.token, req.body.name, req.body.description)
        rsp.status(201)
        return {
            status : `Group with id ${newGroup.groupId} created with sucess`,
            group : newGroup
        }
    }

    async function updateGroupInternal(req, rsp){
        const groupId = req.params.groupId
        const group = await fmdbGroupServices.updateGroup(req.token, groupId, req.body.name, req.body.description)
        return {
                status: `Group with id ${groupId} updated with success`,
                group : group
            }
    }

    async function getAllGroupsInternal(req, rsp){
        const allGroups = await fmdbGroupServices.getAllGroups(req.query.limit, req.query.skip) 
        return {
            status : 'Showing all groups',
            allGroups : allGroups
        }
    }

    async function groupInfoInternal(req, rsp){
        const groupId = req.params.id
        const group = await  fmdbGroupServices.groupInfo(req.token, groupId, req.body)
        return {
            status : `Group with id ${groupId} info received`,
            group : group
        }
    }
    
    async function addMovieToGroupInternal(req, rsp){
        const movieId = req.params.movieId
        const groupId = req.params.groupId
        const movietoGroup = await fmdbGroupServices.addMovieToGroup(req.token,groupId, movieId)
        return{
             status : `Movie with id ${movieId} added to group ${groupId}`,
             movietoGroup : movietoGroup
            }
    }
    
    async function deleteMovieFromGroupInternal(req, rsp){
        const groupId = req.params.groupId
        const movieId = req.params.movieId
        const group = await fmdbGroupServices.deleteMovieFromGroup(req.token,groupId, movieId)
        return{
                status : `Group with id ${groupId} deleted movie ${movieId}`,
                group: group
        }
    }

    async function getTopMoviesInternal(req, rsp){
        let movies = await fmdbMovieServices.getTopMovies(req.query.limit, req.query.skip) 
        rsp.json(movies)
    }

    async function getMovieByExpressionInternal(req, rsp){
        let movies = await fmdbMovieServices.getMovieByExpression(req.params.expression, req.query.limit)
        rsp.json(movies)
    }

    function handleRequest(handler) {
        return async function(req, rsp) {
            const BEARER_STR = "Bearer "
            const tokenHeader = req.get("Authorization")
            if(!(tokenHeader && tokenHeader.startsWith(BEARER_STR) && tokenHeader.length > BEARER_STR.length)) {
                rsp
                    .status(401)
                    .json({error: `Invalid authentication token`})
                    return
            }
            req.token = tokenHeader.split(" ")[1]
            try {
                let body = await handler(req, rsp)
                rsp.json(body)
            } catch(e) {
                const response = toHttpResponse(e)
                rsp.status(response.status).json(response.body)
                console.log(e)
            }
        }
    }
}

