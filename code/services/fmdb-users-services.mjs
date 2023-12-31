import errors from "../errors.mjs";
import bcrypt from "bcrypt";

export default function (fmdbUsersData) {
  // Validate arguments
  if (!fmdbUsersData) {
    throw errors.INVALID_PARAMETER("fmdbUsersData");
  }

  return {
    getUser: getUser,
    createUser: createUser,
    signUp: signUp,
    validateUser: validateUser,
    getUserInLogin,
    getUserInLogin,
    validateCredentials: validateCredentials,
    getUserByID: getUserByID,
  };

  async function getUser(userToken) {
    const user = await fmdbUsersData.getUser(userToken);
    if (!user) {
      throw errors.USER_NOT_FOUND();
    }
    return user;
  }

  async function getUserByID(ID) {
    const user = await fmdbUsersData.getUserByID(ID);
    if (!user) {
      throw errors.USER_NOT_FOUND();
    }
    return user;
  }

  async function getUserInLogin(username, password) {
    const user = await fmdbUsersData.getUserInLogin(username, password);
    if (!user) {
      throw errors.USER_NOT_FOUND();
    }
    return user;
  }

  async function createUser(username, password, email) {
    try {
      const hashPassword = await bcrypt.hash(password, 10);
      return fmdbUsersData.createUser(username, hashPassword, email);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function signUp(username, password, confirmPassword, email) {
    if (password != confirmPassword) {
      throw errors.PASSWORDS_DO_NOT_MATCH();
    }
    return createUser(username, password, email);
  }

  async function validateUser(username, password) {
    return fmdbUsersData
      .getUserInLogin(username, password)
      .then((user) => {
        if (user)
          return Promise.resolve({
            userName: user.userName,
            password: user.password,
            token: user.token,
          });
      })
      .catch((e) => Promise.reject(e));
  }

  async function validateCredentials(username, password) {
    try {
      const user = await fmdbUsersData.getUserByUsername(username);
      if (user == null) {
        throw errors.USER_NOT_FOUND;
      }
      if (await bcrypt.compare(password, user.password)) {
        return user;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
