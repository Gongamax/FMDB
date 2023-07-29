import assert from  'assert'

import * as cmdbData from '../data/cmdb-data-mem.mjs'
import * as cmdbMoviesData from '../data/imdb-movies-data.mjs'//'./data/cmdb-movies-data-mem.mjs'
import cmdbServicesInit from '../services/cmdb-services.mjs'
import cmdbApiInit from '../web/api/cmdb-web-api.mjs'
import * as e from '../errors.mjs'
import crypto from 'crypto'
import { utils } from 'mocha'

const cmdbServices = cmdbServicesInit(cmdbMoviesData, cmdbData )

//TO TEST: npx mocha .\code\test\services-test.mjs

describe('CMDB services', function () {
  describe('CMDB Tests ', function () {
        it('get top 250 movies', async function() {
      // Arrange
      let obj = await cmdbServices.getTopMovies(undefined, undefined)
      // Act 
      // Assert
      assert.equal(obj != undefined, true)
      assert.equal(obj[0].id != undefined && obj[0].title != undefined, true)
      assert.equal(obj.length, 250)
    })
    it('invalid limit parameter', async function() {
      // Arrange
      // Act 
      try {
        await cmdbServices.getTopMovies(300, 1)
      } catch(e) {
        assert.equal(e.code, 1)
        assert.equal(e.message, "Invalid argument skip or limit")
        return
      }
      // Assert
      assert.fail("Exception should be thrown")
    })
  it('invalid expression parameter', async function() {
      // Arrange
      // Act 
      try {
        await cmdbServices.getMovieByExpression(undefined, 1, 5)
      } catch(e) {
        assert.equal(e.code, 1)
        assert.equal(e.message, "Invalid argument skip or limit")
        return
      }
      // Assert
      assert.fail("Exception should be thrown")
    })
    it('get movie by ID', async function() {
      // Arrange
      const Inception_Movie_ID = "tt1375666"
      let obj = await cmdbServices.getMovieById(Inception_Movie_ID)
      // Act 
      // Assert
      assert.equal(obj != undefined, true)
      assert.equal(obj.title, "Inception")
    })
  it('get groups of user that are not in database', async function() {
      // Arrange
        const userId = crypto.randomUUID()
      // Act 
      try {
        await cmdbServices.getGroups(userId,1)
      } catch(e) {
        assert.equal(e.code, 2)
        assert.equal(e.message, 'User not found') 
        return
      }
      // Assert
      assert.fail("Exception should be thrown")
    })
  it('create user, create group and get group info', async function() {
      // Arrange
      // Act
      let userId = await createUserTest()
      let newGroup = await cmdbServices.createGroup(userId, "Group 1", "Description 1")
      let objInfo = await cmdbServices.groupInfo(userId, newGroup.groupId)
      // Assert
      assert.equal(newGroup != undefined, true)
      assert.equal(objInfo.Groupname == newGroup.Name, true)
    })
  it('Create Group and delete it', async function() {
    // Arrange
    let userToken = await createUserTest()
    let newGroup = await cmdbServices.createGroup(userToken, "Group 2", "Description 2")
    const idGroup = newGroup.groupId
    await cmdbServices.deleteGroup(userToken, idGroup)
    // Act 
    try{
      const group = await cmdbServices.getGroup(userToken, idGroup)
    }catch(e){
      assert.equal(e.code, 3)
      assert.equal(`Group with id ${idGroup} not found`, e.message)
      return
    }
    // Assert
    assert.fail("It should have throwed exception")
  })
  it('Create Group and update group', async function() {
    // Arrange
    let userToken = await createUserTest()
    let newGroup = await cmdbServices.createGroup(userToken, "Group 3", "Description 3")
    const idGroup = newGroup.groupId
    // Act 
    await cmdbServices.updateGroup(userToken, idGroup, "Group Updated", "Description Updated")
    const groupUpdated = await cmdbServices.getGroup(userToken, idGroup)

    // Assert
    assert.equal(groupUpdated.Name, "Group Updated")
  })
  it('Add movie to a group and delete it', async function() {
    // Arrange
    const user = await createUserTest()
    let newGroup = await cmdbServices.createGroup(user, "Group 4", "Description 4")
    const idGroup = newGroup.groupId
    // Act 
    await cmdbServices.addMovieToGroup(user, idGroup, "tt1375666")
    const group = await cmdbServices.getGroup(user, idGroup)
    // Assert
    assert.equal(group.movies[0].title, "Inception")

    //Delete act
    await cmdbServices.deleteMovieFromGroup(user, idGroup, "tt1375666")
    //Assert after delete
    assert.equal(group.movies.length, 0)
  })
  it('Create 3 groups and get All groups', async function() {
    // Arrange
    let userToken = await createUserTest()
    await cmdbServices.createGroup(userToken, "Group 5", "Description 5")
    await cmdbServices.createGroup(userToken, "Group 6", "Description 6")
    await cmdbServices.createGroup(userToken, "Group 7", "Description 7")
    // Act 
    const groups = await cmdbServices.getAllGroups()
    
    // Assert
    assert.equal(groups.length, 9)
  })
    //Teste para cima
  })
})


async function createUserTest(){
  const newUser = await cmdbServices.createUser("Test")
  return newUser.token
}