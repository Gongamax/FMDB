// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import toHttpResponse from '../api/response-errors.mjs'
import errors from '../../errors.mjs';

export default function (fmdbGroupServices, fmdbMovieServices, fmdbUsersServices) {
    if(!fmdbGroupServices) {
      throw errors.INVALID_PARAMETER('fmdbGroupServices')
    }
    if(!fmdbMovieServices) {
      throw errors.INVALID_PARAMETER('fmdbMovieServices')
    }
    if(!fmdbUsersServices) {
      throw errors.INVALID_PARAMETER('fmdbUsersServices')
    }

    return {
        checkGroupAccess : checkGroupAccess,
        getHome: getHome,
        getAllGroups: getAllGroups,
        getGroup: handleRequest(getGroup),
        getGroups: handleRequest(getGroups),
        getNewGroup: handleRequest(getNewGroup),
        getUpdateGroup : handleRequest(getUpdateGroup),
        addMovieToGroup: handleRequest(addMovieToGroup),
        deleteMovieFromGroup: handleRequest(deleteMovieFromGroup),
        createGroup: handleRequest(createGroup),
        deleteGroup: handleRequest(deleteGroup),
        updateGroup: handleRequest(updateGroup),
        getTopMovies: getTopMovies,
        getMovieByExpression: getMovieByExpression,
        getMovieById: getMovieById,
    }

    async function checkGroupAccess(req, res, next) {
      try {
        const token = req.cookies.token
        const user = await fmdbUsersServices.getUser(token)
        const group = await fmdbGroupServices.getGroup(user.token, req.params.groupId);
        if (group.user_Id !== user.ID) {
          return res.status(403).json('You do not have access to this group' );
        }
        next();
      } catch (err) {
          return res.status(500).send("An error occurred while checking group access")
      }
    }

    async function getHome(req, rsp){
      const upcomingMovies = await fmdbMovieServices.getUpcomingMovies(3, 0)
      const popularMovies = await fmdbMovieServices.getPopularMovies(9, 0)
      try {
          const user = await fmdbUsersServices.getUser(req.cookies.token)
          rsp.render('home', {upcomingMovies: upcomingMovies, popularMovies: popularMovies,loginId: req.cookies.token, user: user.userName})
      } catch (error) {
          //ignore error
          rsp.render('home', {upcomingMovies: upcomingMovies, popularMovies: popularMovies, loginId: req.cookies.token})
      }
    }
    
    async function getAllGroups(req,rsp){
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = req.query.skip ? parseInt(req.query.skip) : 0;
      const groups = await fmdbGroupServices.getAllGroups(limit, skip)
      groups.forEach(element => { element.movieId = req.query.movieId });
      rsp.render("groups", { title: 'All groups', groups: groups, loginId: req.cookies.token, limit: limit, skip : skip})
    }

    async function getGroups(req, rsp) {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10
      const skip = req.query.skip ? parseInt(req.query.skip) : 0
      const groups = await fmdbGroupServices.getGroups(req.token, req.query.q, limit, skip)
      groups.forEach(element => {element.movieId = req.query.movieId});
      rsp.render('groups', 
      { title: 'My groups', groups: groups, movieId: req.query.movieId, loginId: req.cookies.token, limit: limit, skip : skip})
    }

    async function getGroup(req, rsp) {
      const groupId = req.params.groupId
      const group = await fmdbGroupServices.getGroup(req.token, groupId)
      rsp.render('group', {group : group, loginId: req.cookies.token})
    }

    async function getNewGroup(req, rsp){
      rsp.render('newGroup', {user: req.token})
    }

    async function deleteGroup(req, rsp) {
      await fmdbGroupServices.deleteGroup(req.token, req.params.groupId)
      rsp.redirect(`/users/${req.token}/groups`)
    }

    async function updateGroup(req, rsp) {
        const groupId = req.params.groupId
        await fmdbGroupServices.updateGroup(req.token, groupId, req.body.name, req.body.description)
        rsp.redirect(`/users/${req.token}/groups`)
    }

    async function getUpdateGroup(req, rsp) {
      const group = await fmdbGroupServices.getGroup(req.token, req.params.groupId)
      rsp.render('UpdateGroup', {userId: group.user_Id, groupId: group.groupId, loginId: req.cookies.token})
    } 

    async function createGroup(req, rsp) {
      let newGroup = await fmdbGroupServices.createGroup(req.token,req.body.name, req.body.description)
      console.log(newGroup)
      rsp.redirect(`/users/${req.token}/groups`)
    }

    async function addMovieToGroup(req, rsp) {
      const movieId = req.params.movieId
      const groupId = req.params.groupId
      await fmdbGroupServices.addMovieToGroup(req.token,groupId, movieId)
      rsp.redirect(`/users/${req.token}/groups/${groupId}`)
    }
  
    async function deleteMovieFromGroup(req, rsp) {
      const groupId = req.params.groupId
      await fmdbGroupServices.deleteMovieFromGroup(req.token,groupId, req.params.movieId)
      rsp.redirect(`/users/${req.token}/groups/${groupId}`)
    }

    async function getTopMovies(req,rsp) {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20
      const skip = req.query.skip ? parseInt(req.query.skip) : 0
      let movies = await fmdbMovieServices.getTopMovies(limit, skip) 
      rsp.render("movies", { title: `Top Rated Movies`, movies: movies, loginId: req.cookies.token, limit: limit, skip : skip})
    }

    async function getMovieByExpression(req,rsp) {
      const limit = req.query.limit ? parseInt(req.query.limit) : 250
      const skip = req.query.skip ? parseInt(req.query.skip) : 0;
      let movies = await fmdbMovieServices.getMovieByExpression(req.query.expression, limit, skip)
      rsp.render("moviesExpression", { title: `Results for "${req.query.expression}"`,
       movies: movies, loginId: req.cookies.token, limit : limit, skip : skip, expression : req.query.expression})
    }

    async function getMovieById(req,rsp) {
      const movieId = req.params.id
      const movie = await fmdbMovieServices.getMovieById(movieId)
      rsp.render("movie",{ movie: movie, loginId: req.cookies.token}) 
    }

    function handleRequest(handler) {
      return async function(req, rsp) {
        try {
            const token = req.cookies.token;
            req.token = token
            let view = await handler(req, rsp)
            if(view) {
              rsp.render(view.name , view.data)
            }
        } catch(e) {
            // returning errors in Json format
            const response = toHttpResponse(e)
            rsp.status(response.status).json(response.body)
            console.log(e)
        }
      }
    }
}