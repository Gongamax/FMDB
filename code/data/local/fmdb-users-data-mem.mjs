import crypto from "crypto";

const users = [
  {
    ID: 0,
    username: "User1",
    password: "1234",
    email: "test@example.pt",
    token: "0b115b6e-8fcd-4b66-ac26-33392dcb9340",
  },
  {
    ID: 1,
    username: "User2",
    password: "1234",
    email: "test@example.pt",
    token: "3dfd8596-cfd3-431d-8e36-f0fc4c64f364",
  },
];
let nextId = 2;

export async function createUser(username, password, email) {
  let newUser = {
    username: `${username}`,
    password: `${password}`,
    email: `${email}`,
    ID: getNewUserId(),
    token: crypto.randomUUID(),
  };
  users.push(newUser);
  return newUser;
}

export async function getUser(userToken) {
  return users.find((user) => user.token == userToken);
}

export async function getUserInLogin(username, password) {
  return users.find(
    (user) => user.username == username && user.password == password
  );
}

export async function getUserByToken(token) {
  return getUserBy("token", token);
}

export async function getUserByUsername(username) {
  return getUserBy("username", username);
}

async function getUserBy(propName, value) {
  const user = users.find((u) => u[propName] == value);
  if (!user) {
    throw errors.NOT_FOUND("User");
  }
  return user;
}

function getNewUserId() {
  return nextId++;
}
