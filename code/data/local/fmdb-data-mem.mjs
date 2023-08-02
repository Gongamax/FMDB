// Module manages application users data.
// In this specific module, data is stored in memory
let groups = [];
let groupId = 0;

export async function getGroup(userID, ID) {
  return groups
    .filter((group) => group.user_Id == userID)
    .find((group) => group.groupId == ID);
}

export async function getGroups(userID, q, limit, skip) {
  const predicate = q ? (m) => m.title.includes(q) : (m) => true;
  const retGroups = groups
    .filter((group) => group.user_Id === userID)
    .filter(predicate);
  const end = limit != Infinity ? skip + limit : groups.length;
  return retGroups.slice(skip, end);
}

export async function getAllGroups(limit, skip) {
  const end = limit != Infinity ? skip + limit : groups.length;
  return groups.slice(skip, end);
}

export async function createGroup(name, description, userID) {
  let newGroup = {
    Name: name,
    Description: description,
    movies: [],
    user_Id: userID,
    groupId: getNewGroupId(),
    TotalTime: 0,
  };
  groups.push(newGroup);
  return newGroup;
}

export async function updateGroup(userID, ID, name, description) {
  let temp = groups.map((group) => {
    if (group.user_Id == userID && group.groupId == ID) {
      return { ...group, Name: name, Description: description };
    }
    return group;
  });
  groups = temp;
}

export async function groupInfo(userID, ID) {
  let group = groups.filter((group) => group.user_Id == userID && group.groupId == ID);
  let Info = {
    Groupname: group[0].Name,
    GroupDescription: group[0].Description,
    MoviesNames: group[0].movies.map((movie) => movie.Title),
    TotalDuration: group[0].TotalTime,
  };
  return Info;
}

export async function deleteGroup(userID, ID) {
  let groupIdx = groups.findIndex((group) => group.groupId == ID && group.user_Id == userID);
  groups.splice(groupIdx, 1);
}

export async function addMovieToGroup(userID, ID, movie) {
  let groupIdx = groups.findIndex((group) => group.groupId == ID && group.user_Id == userID);
  groups[groupIdx].movies.push(movie);
  groups[groupIdx].TotalTime += Number(movie.runtime);
}

export async function deleteMovieFromGroup(userID, groupID, movie) {
  let groupIdx = groups.findIndex((group) => group.groupId == groupID && group.user_Id == userID);
  if (!movie) {
    throw new Error("Movie not found in group");
  }
  groups[groupIdx].TotalTime -= Number(movie.runtime);
  groups[groupIdx].movies = groups[groupIdx].movies.filter(
    (m) => m.id !== movie.id
  );
}

function getNewGroupId() {
  return groupId++;
}
