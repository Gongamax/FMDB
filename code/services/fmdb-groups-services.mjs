import errors from "../errors.mjs";

export default function (fmdbData, fmdbUsersData, fmdbMoviesData) {
  // Validate arguments
  if (!fmdbData) {
    throw errors.INVALID_PARAMETER("groupsData");
  }
  if (!fmdbUsersData) {
    throw errors.INVALID_PARAMETER("usersData");
  }
  if (!fmdbMoviesData) {
    throw errors.INVALID_PARAMETER("moviesData");
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
  };

  async function getGroups(userToken, q, limit = Infinity, skip = 0) {
    validateLimitAndSkip(limit, skip);
    const user = await isValidUser(userToken);
    return fmdbData.getGroups(user.ID, q, limit, skip);
  }

  async function getGroup(userToken, groupID) {
    const user = await isValidUser(userToken);
    const group = await fmdbData.getGroup(user.ID, groupID);
    if (!group) {
      throw errors.GROUP_NOT_FOUND(groupID);
    }
    return group;
  }

  async function getAllGroups(limit = Infinity, skip = 0) {
    validateLimitAndSkip(limit, skip);
    return fmdbData.getAllGroups(limit, skip);
  }

  async function groupInfo(userToken, groupID) {
    const user = await isValidUser(userToken);
    return fmdbData.groupInfo(user.ID, groupID);
  }

  async function deleteGroup(userToken, groupID) {
    const user = await isValidUser(userToken);
    return fmdbData.deleteGroup(user.ID, groupID);
  }

  async function createGroup(userToken, name, description) {
    // Validate all task properties
    const user = await isValidUser(userToken);
    if (!isValidString(userToken, name)) {
      throw errors.INVALID_PARAMETER("name");
    }
    if (!isValidString(userToken, description)) {
      throw errors.INVALID_PARAMETER("description");
    }
    return fmdbData.createGroup(name, description, user.ID);
  }

  async function updateGroup(userToken, groupID, name, description) {
    const user = await isValidUser(userToken);
    if (!isValidString(userToken, name)) {
      throw errors.INVALID_PARAMETER("name");
    }
    if (!isValidString(userToken, description)) {
      throw errors.INVALID_PARAMETER("description");
    }
    return fmdbData.updateGroup(user.ID, groupID, name, description);
  }

  async function deleteMovieFromGroup(userToken, groupID, movieId) {
    const user = await isValidUser(userToken);
    if (isNaN(movieId)) {
      throw errors.INVALID_PARAMETER("movieId");
    }
    const movie = await fmdbMoviesData.getMovieById(movieId);
    return fmdbData.deleteMovieFromGroup(user.ID, groupID, movie);
  }

  async function addMovieToGroup(userToken, groupID, movieId) {
    const user = await isValidUser(userToken);
    if (isNaN(movieId)) {
      throw errors.INVALID_PARAMETER("movieId");
    }
    const movie = await fmdbMoviesData.getMovieById(movieId);
    movie.genres = movie.genres.map((g) => g.name);
    return fmdbData.addMovieToGroup(user.ID, groupID, movie);
  }

  // Auxiliary functions

  function isValidString(value) {
    return typeof value == "string" && value != "";
  }

  async function isValidUser(userToken) {
    const user = await fmdbUsersData.getUser(userToken);
    if (!user) {
      throw errors.USER_NOT_FOUND();
    }
    return user;
  }

  function validateLimitAndSkip(limit, skip) {
    limit = Number(limit);
    skip = Number(skip);
    if (isNaN(limit) || isNaN(skip) || skip > limit) {
      throw errors.INVALID_PARAMETER(`skip or limit`);
    }
  }
}
