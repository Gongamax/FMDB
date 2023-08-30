"use strict";

import crypto from "crypto";
import errors from "../../errors.mjs";
import { get, post } from "../utils/fetch-wrapper.mjs";
import uriManager from "../utils/uri-manager.mjs";

const baseURL = "http://localhost:9200/";

const INDEX_NAME = "users";
const URI_MANAGER = uriManager(INDEX_NAME);

export async function getUserInLogin(username, password) {
  return fetch(baseURL + `users/_search?q=${username}&q=${password}`, {
    headers: { Accept: "application/json" },
  })
    .then((response) => response.json())
    .then((body) => body.hits.hits.map(createUserFromElastic)[0]);
}

export async function getUserByUsername(username) {
  return get(URI_MANAGER.getBy("username", username)).then((body) => {
    return body.hits.hits.map(createUserFromElastic)[0];
  });
}

export async function getUser(token) {
  return get(URI_MANAGER.getBy("token", token)).then(
    (body) => body.hits.hits.map(createUserFromElastic)[0]
  );
}

export async function createUser(username, password, email) {
  const randomToken = crypto.randomUUID();
  const userExists = await checkIfUserExists(username);
  if (userExists) {
    throw errors.USER_ALREADY_EXISTS();
  }
  const newUser = {
    username: username,
    password: password,
    email: email,
    token: randomToken,
  };

  try {
    return post(URI_MANAGER.create(), newUser).then((body) => {
      newUser.ID = body._id;
      return newUser;
    });
  } catch (e) {
    throw e;
  }
}

// Auxiliary functions

function createUserFromElastic(userElastic) {
  let user = userElastic._source;
  user.ID = userElastic._id;
  return user;
}

async function checkIfUserExists(username) {
  try {
    const user = await getUserByUsername(username);
    return user ? true : false;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
