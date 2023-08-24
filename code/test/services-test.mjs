import assert from "assert";

import * as fmdbData from "../data/local/fmdb-data-mem.mjs";
import * as fmdbMoviesData from "../data/tmdb-movies-data.mjs";
import * as fmdbUsersData from "../data/local/fmdb-users-data-mem.mjs";
import fmdbUsersServices from "../services/fmdb-users-services.mjs";
import fmdbMoviesServices from "../services/fmdb-movies-services.mjs";
import fmdbGroupServicesInit from "../services/fmdb-groups-services.mjs";
import crypto from "crypto";

const fmdbGroupServices = fmdbGroupServicesInit(
  fmdbData,
  fmdbUsersData,
  fmdbMoviesData
);
const fmdbMovieServices = fmdbMoviesServices(fmdbMoviesData);
const fmdbUserServices = fmdbUsersServices(fmdbUsersData);

//TO TEST: npx mocha .\code\test\services-test.mjs

describe("CMDB services", function () {
  describe("CMDB Tests ", function () {
    it("get top movies", async function () {
      // Arrange
      let obj = await fmdbMovieServices.getTopMovies(undefined, undefined);
      // Act
      // Assert
      assert.equal(obj != undefined, true);
      assert.equal(obj[0].id != undefined && obj[0].title != undefined, true);
      assert.equal(obj.length, 20);
    });
    it("invalid limit parameter", async function () {
      // Arrange
      // Act
      try {
        await fmdbMovieServices.getTopMovies(10, 20);
      } catch (e) {
        assert.equal(e.code, 1);
        assert.equal(e.message, "Invalid argument skip or limit");
        return;
      }
      // Assert
      assert.fail("Exception should be thrown");
    });
    it("invalid expression parameter", async function () {
      // Arrange
      // Act
      try {
        await fmdbMovieServices.getMovieByExpression(undefined, 1, 5);
      } catch (e) {
        assert.equal(e.code, 1);
        assert.equal(e.message, "Invalid argument skip or limit");
        return;
      }
      // Assert
      assert.fail("Exception should be thrown");
    });
    it("get movie by ID", async function () {
      // Arrange
      const Godfather_Movie_ID = "238";
      let obj = await fmdbMovieServices.getMovieById(Godfather_Movie_ID);
      // Act
      // Assert
      assert.equal(obj != undefined, true);
      assert.equal(obj.title, "The Godfather");
    });
    it("get groups of user that are not in database", async function () {
      // Arrange
      const userId = crypto.randomUUID();
      // Act
      try {
        await fmdbGroupServices.getGroups(userId, 1);
      } catch (e) {
        assert.equal(e.code, 2);
        assert.equal(e.message, "User not found");
        return;
      }
      // Assert
      assert.fail("Exception should be thrown");
    });
    it("create user, create group and get group info", async function () {
      // Arrange
      // Act
      let userId = await createUserTest();
      let newGroup = await fmdbGroupServices.createGroup(
        userId,
        "Group 1",
        "Description 1"
      );
      let objInfo = await fmdbGroupServices.groupInfo(userId, newGroup.groupId);
      // Assert
      assert.equal(newGroup != undefined, true);
      assert.equal(objInfo.Groupname == newGroup.Name, true);
    });
    it("Create Group and delete it", async function () {
      // Arrange
      let userToken = await createUserTest();
      let newGroup = await fmdbGroupServices.createGroup(
        userToken,
        "Group 2",
        "Description 2"
      );
      const idGroup = newGroup.groupId;
      await fmdbGroupServices.deleteGroup(userToken, idGroup);
      // Act
      try {
        const group = await fmdbGroupServices.getGroup(userToken, idGroup);
      } catch (e) {
        assert.equal(e.code, 3);
        assert.equal(`Group with id ${idGroup} not found`, e.message);
        return;
      }
      // Assert
      assert.fail("It should have throwed exception");
    });
    it("Create Group and update group", async function () {
      // Arrange
      let userToken = await createUserTest();
      let newGroup = await fmdbGroupServices.createGroup(
        userToken,
        "Group 3",
        "Description 3"
      );
      const idGroup = newGroup.groupId;
      // Act
      await fmdbGroupServices.updateGroup(
        userToken,
        idGroup,
        "Group Updated",
        "Description Updated"
      );
      const groupUpdated = await fmdbGroupServices.getGroup(userToken, idGroup);

      // Assert
      assert.equal(groupUpdated.Name, "Group Updated");
    });
    it("Add movie to a group and delete it", async function () {
      // Arrange
      const user = await createUserTest();
      let newGroup = await fmdbGroupServices.createGroup(
        user,
        "Group 4",
        "Description 4"
      );
      const idGroup = newGroup.groupId;
      // Act
      await fmdbGroupServices.addMovieToGroup(user, idGroup, 27205);
      const group = await fmdbGroupServices.getGroup(user, idGroup);
      // Assert
      assert.equal(group.movies[0].title, "Inception");

      //Delete act
      await fmdbGroupServices.deleteMovieFromGroup(user, idGroup, 27205);
      //Assert after delete
      assert.equal(group.movies.length, 0);
    });
    it("Create 3 groups and get All groups", async function () {
      // Arrange
      let userToken = await createUserTest();
      await fmdbGroupServices.createGroup(
        userToken,
        "Group 5",
        "Description 5"
      );
      await fmdbGroupServices.createGroup(
        userToken,
        "Group 6",
        "Description 6"
      );
      await fmdbGroupServices.createGroup(
        userToken,
        "Group 7",
        "Description 7"
      );
      // Act
      const groups = await fmdbGroupServices.getAllGroups();
      // Assert
      assert.equal(groups.length, 6);
    });
  });
});

//Helper function

async function createUserTest() {
  const newUser = await fmdbUserServices.createUser("Test", "1234", "test");
  return newUser.token;
}
