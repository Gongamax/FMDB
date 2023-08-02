import crypto from "crypto";
import errors from "../../errors.mjs";

const baseURL = "http://localhost:9200/";

export async function getUserInLogin(username, password) {
  return fetch(baseURL + `users/_search?q=${username}&q=${password}`, {
    headers: { Accept: "application/json" },
  })
    .then((response) => response.json())
    .then(
      (body) =>
        body.hits.hits.map((t) => {
          return {
            ID: t._id,
            userName: t._source.username,
            password: t._source.password,
            token: t._source.token,
          };
        })[0]
    );
}

export async function getUserByUsername(username) {
  return fetch(baseURL + `users/_search?q=username:"${username}"`, {
    headers: { Accept: "application/json" },
  })
    .then((response) => response.json())
    .then(
      (body) =>
        body.hits.hits.map((t) => {
          return {
            ID: t._id,
            userName: t._source.username,
            password: t._source.password,
            token: t._source.token,
          };
        })[0]
    );
}

export async function getUser(token) {
  return fetch(baseURL + `users/_search?q=token:"${token}"`, {
    headers: { Accept: "application/json" },
  })
    .then((response) => response.json())
    .then(
      (body) =>
        body.hits.hits.map((t) => {
          return {
            ID: t._id,
            userName: t._source.username,
            password: t._source.password,
            token: t._source.token,
          };
        })[0]
    );
}

export async function createUser(username, password) {
  const randomToken = crypto.randomUUID();
  const userExists = await checkIfUserExists(username);
  if (userExists) {
    throw errors.USER_ALREADY_EXISTS();
  }
  const body = {
    username: username,
    password: password,
    userId: getNewUserId(),
    token: randomToken,
  };

  try {
    const response = await fetch(baseURL + `users/_doc?refresh=wait_for`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const result = await response.json();
    return {
      username: username,
      password: password,
      userId: result._id,
      token: randomToken,
    };
  } catch (e) {
    throw e;
  }
}

// Auxiliary functions

async function checkIfUserExists(username) {
  try {
    const response = await fetch(
      baseURL + `users/_search?q=username:${username}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const json = await response.json();
    return json.hits.total.value > 0;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

let userId = 0;
function getNewUserId() {
  return userId++;
}
