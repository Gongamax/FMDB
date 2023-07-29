import {del, get, post} from '../utils/fetch-wrapper.mjs'
import fmdbServices from '../../services/fmdb-groups-services.mjs'
import uriManager from '../utils/uri-manager.mjs'
import crypto from 'crypto'
import errors from '../../errors.mjs'
import fetch from 'node-fetch'

const INDEX_NAME = 'groups'
const URI_MANAGER_GROUPS = uriManager(INDEX_NAME)
const baseURL = "http://localhost:9200/"


    export async function getAllGroups(limit = Infinity, skip = 0){
        const query = {
            query: {
              match_all: {}
            },
            size: limit,
            from: skip
          }
        return post(URI_MANAGER_GROUPS.getAll(), query )
            .then(body => body.hits.hits.map(it => {return it._source}))
    }

    export async function getGroups(userId, q , skip = 0, limit = Infinity) {
        const query = {
            query: {
              match: {
                "user_Id": userId
              }
            },
            size : limit, //limit the number of groups
            from : skip
          }
        return post(URI_MANAGER_GROUPS.getAll(), query)
            .then(body =>{
                return body.hits.hits.map(it => {return it._source})
            })
    }


    export async function getGroup(userId, id){
        const group = await fetch(baseURL + `groups/_doc/${id}`, {
                    method : 'GET',
                    headers : {"Accept" : "application/json"}
            })
            .then(response => response.json())
            .then(body => body._source )
        return group;
    }

    export async function getUserInLogin(username, password){
        
        return fetch(baseURL + `users/_search?q=${username}&q=${password}`, {
                headers : {"Accept" : "application/json"}
             })
            .then(response => response.json())
            .then(body => body.hits.hits.map(t => { return {ID : t._id , userName : t._source.username,
                 password : t._source.password, token : t._source.token}})[0])
    }

    export async function getUserByUsername(username){
        return fetch(baseURL + `users/_search?q=username:"${username}"`, {
                headers : {"Accept" : "application/json"}
             })
            .then(response => response.json())
            .then(body => body.hits.hits.map(t => { return {ID : t._id , userName : t._source.username,
                 password : t._source.password, token : t._source.token}})[0])
    }

    export async function getUser(token){
        return fetch(baseURL + `users/_search?q=token:"${token}"`, {
                headers : {"Accept" : "application/json"}
             })
            .then(response => response.json())
            .then(body => body.hits.hits.map(t => { return {ID : t._id , userName : t._source.username,
                 password : t._source.password, token : t._source.token}})[0])
    }
    
    export async function groupInfo(userID, groupID){
        const result = get(URI_MANAGER_GROUPS.get(groupID))
            .then(rsp => rsp.json())
            .then(body => body.hits.hits.map(t => {return {id : t._source.Group_ID, Name : t._source.Name, Description : t._source.Description}}))
        console.log(result)
    }

    async function checkIfUserExists(username) {
        try {
            const response = await fetch(baseURL + `users/_search?q=username:${username}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const json = await response.json();
          return json.hits.total.value > 0;
        } catch (err) {
          console.error(err);
          throw err;
        }
      }


    export async function createUser(username, password){
      const randomToken = crypto.randomUUID()
      const randomID = crypto.randomUUID().slice(0,16)
      const userExists = await checkIfUserExists(username);
      if(userExists) {
          throw new Error('Username already exists')
      }
      const body = {
          username : username,
          password : password,
          userId : getNewUserId(),
          token : randomToken 
      }
        
      try{
          const response = await fetch(baseURL + `users/_doc?refresh=wait_for`, {
              method : "POST",
              body : JSON.stringify(body),
              headers : {
                  "Content-Type" : "application/json", 
                  "Accept" : "application/json"}
          })
          const result = await response.json();
          console.log(result)
          return {username : username, password : password, userId : result._id, token : randomToken};
      } catch(e){
          throw e;
      }
    }
 
    export async function createGroup(name, description, userID){
      const randomID = crypto.randomUUID().slice(0,16)
      const body = {
          Name : name, 
          Description: description,
          movies: [],
          user_Id: userID,
          groupId: randomID,
          Tempo: 0
      }
      try{
          const response = await fetch(baseURL + `groups/_doc/${randomID}?refresh=wait_for`, {
          method: 'PUT',
          body: JSON.stringify(body),
          headers: {
              "Content-Type": "application/json",
              "Accept" : "application/json"}
          })
          const result = await response.json()
          return {
              Name : name, 
              Description: description,
              movies: [],
              user_Id: userID,
              groupId: randomID,
              Tempo: 0
          }
      } catch(error) {
          throw new Error(`Failed to create group: ${response.statusText}`);
      }
    }

      export async function updateGroup(userId, id, name, description) {
        const url = baseURL + `groups/_update/${id}?refresh=wait_for`;
        let group = await getGroup(userId, id)
        if(group.user_Id !== userId){
            throw new Error('Invalid userID')
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script: {
                        source: `ctx._source.Name = params.name; ctx._source.Description = params.description;`,
                        lang: "painless",
                        params: {
                            name: name,
                            description: description
                        }
                    }
                })
            });
            const json = await response.json();
            return json;
        } catch (err) {
            throw new Error(`Failed to update the group: ${err}`);
        }
    }
    
      

    export async function deleteGroup(userId, groupId) {
        const url = `http://localhost:9200/${INDEX_NAME}/_doc/${groupId}?refresh=wait_for`;
        // check if userId is valid 
        let group = await getGroup(userId, groupId)
        if (group.user_Id !== userId || typeof userId !== 'string') {
            throw new Error('Invalid userId');
        }
    
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
    
            // check if response status code is not 2xx
            if (!response.ok) {
                const json = await response.json();
                if (json.code === 3 && json.message === `Group with id ${groupId} not found`) {
                    throw new Error('This group does not exist');
                } else {
                    throw new Error(`Failed to delete group: ${response.statusText}`);
                }
            }
            const json = await response.json();
            // check if response is not a json object
            if (!json || typeof json !== 'object') {
                throw new Error('Invalid JSON response');
            }
            //console.log(json);
        } catch (err) {
            console.error(err);
            throw new Error(`Failed to delete group: ${err.message}`);
        }
    }
    

    export async function addMovieToGroup(userID, groupId, movieID) {
        const movie = await fmdbServices.getMovieById(movieID);
        let group = await getGroup(userID, groupId);
        if (group.user_Id !== userID) {
          throw new Error("Invalid userID");
        }
        try {
          const currentTime = group.Tempo // fetch the current total time
          const updatedTime = currentTime + Number(movie.runtimeMins); // add the runtime of the new movie
          const updatedMovies = [...group.movies, movie]; // create a new movies array with the new movie added to it
          const response = await fetch(baseURL + `groups/_update/${groupId}/`, {
            method: "POST",
            body: JSON.stringify({
              doc: { movies: updatedMovies, Tempo: updatedTime}, // update the movies array and totalTime field
            }),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          const result = await response.json();
          return result;
        } catch (error) {
          console.error(`Error adding movie to group: ${error}`);
        }
      }

    export async function deleteMovieFromGroup(userId, groupId, movieId) {
        const movie = await getMovieById(movieId);
        let group = await getGroup(userId, groupId);
        if (group.user_Id !== userId) {
          throw new Error('Invalid userID');
        }
        const updatedMovies = group.movies.filter(m => m.id !== movieId);
        const updatedTime = group.Tempo - Number(movie.runtimeMins);
        try {
          const response = await fetch(baseURL + `groups/_update/${groupId}/`, {
            method: 'POST',
            body: JSON.stringify({
              doc: {
                movies: updatedMovies,
                Tempo: updatedTime
              }
            }),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          });
          const result = await response.json();
          return result;
        } catch (error) {
          console.error(`Error deleting movie from group: ${error}`);
        }
      }
    
let userId = 0
function getNewUserId() {
    return userId++
}

