"use strict";

import { del, get, post, put } from "../utils/fetch-wrapper.mjs";
import uriManager from "../utils/uri-manager.mjs";
import crypto from "crypto";

const INDEX_NAME = "groups";
const URI_MANAGER = uriManager(INDEX_NAME);

export async function getAllGroups(limit = Infinity, skip = 0) {
  return get(URI_MANAGER.getAll()).then((body) =>
    body.hits.hits.map((it) => it._source).slice(skip, limit)
  );
}

export async function getGroup(userId, id) {
  return get(URI_MANAGER.get(id)).then((body) => body._source);
}

export async function getGroups(userId, q, limit = Infinity, skip = 0) {
  const query = {
    query: {
      match: {
        user_Id: userId,
      },
    },
    size: limit, //limit the number of groups
    from: skip,
  };
  return post(URI_MANAGER.getAll(), query).then((body) => {
    return body.hits.hits.map((it) => {
      return it._source;
    });
  });
}

export async function groupInfo(userID, groupID) {
  const result = get(URI_MANAGER.get(groupID))
    .then((body) => body._source);
  console.log(result);
}

export async function createGroup(name, description, userID) {
  const randomID = crypto.randomUUID().slice(0, 16);
  const body = {
    Name: name,
    Description: description,
    movies: [],
    user_Id: userID,
    groupId: randomID,
    TotalTime: 0,
  };
  try {
    return put(URI_MANAGER.update(randomID), body).then(() => {
      return body;
    });
  } catch (error) {
    throw new Error(`Failed to create group: ${response.statusText}`);
  }
}

export async function updateGroup(userId, id, name, description) {
  let group = await getGroup(userId, id);
  group.Name = name;
  group.Description = description;
  return put(URI_MANAGER.update(id), group)
    .then(() => {
      return group;
    })
    .catch((err) => {
      throw new Error(`Failed to update the group: ${err}`);
    });
}

export async function deleteGroup(userId, groupId) {
  return del(URI_MANAGER.delete(groupId))
    .then((body) => body._id)
    .catch((err) => {
      throw new Error(`Failed to delete group: ${err.message}`);
    });
}

export async function addMovieToGroup(userID, groupId, movie) {
  let group = await getGroup(userID, groupId);
  try {
    if (group.movies.find((m) => m.id == movie.id)) {
      throw new Error("Movie already exists in group")
    }
    group.movies.push(movie);
    group.TotalTime += Number(movie.runtime);
    return put(URI_MANAGER.update(groupId), group).then(() => {
      return group;
    });
  } catch (error) {
    console.error(`Error adding movie to group: ${error}`);
  }
}

export async function deleteMovieFromGroup(userId, groupId, movie) {
  let group = await getGroup(userId, groupId);
  try {
    group.movies = group.movies.filter((m) => m.id != movie.id);
    group.TotalTime -= Number(movie.runtime);
    return put(URI_MANAGER.update(groupId), group).then(() => {
      return group;
    });
  } catch (error) {
    console.error(`Error deleting movie from group: ${error}`);
  }
}
