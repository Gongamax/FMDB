// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import toHttpResponse from "../api/response-errors.mjs";
import errors from "../../errors.mjs";

export default function (
  fmdbGroupServices,
  fmdbMovieServices,
  fmdbUsersServices
) {
  if (!fmdbGroupServices) {
    throw errors.INVALID_PARAMETER("fmdbGroupServices");
  }
  if (!fmdbMovieServices) {
    throw errors.INVALID_PARAMETER("fmdbMovieServices");
  }
  if (!fmdbUsersServices) {
    throw errors.INVALID_PARAMETER("fmdbUsersServices");
  }

  return {
    checkGroupAccess: checkGroupAccess,
    getHome: handleRequest(getHome),
    getAbout: handleRequest(getAbout),
    getAllGroups: handleRequest(getAllGroups),
    getGroup: handleRequest(getGroup),
    getGroups: handleRequest(getGroups),
    addMovieToGroup: handleRequest(addMovieToGroup),
    deleteMovieFromGroup: handleRequest(deleteMovieFromGroup),
    createGroup: handleRequest(createGroup),
    deleteGroup: handleRequest(deleteGroup),
    updateGroup: handleRequest(updateGroup),
    getTopMovies: handleRequest(getTopMovies),
    getMovieByExpression: handleRequest(getMovieByExpression),
    getMovieById: handleRequest(getMovieById),
  };

  async function checkGroupAccess(req, res, next) {
    try {
      const token = req.cookies.token;
      const user = await fmdbUsersServices.getUser(token);
      const group = await fmdbGroupServices.getGroup(
        user.token,
        req.params.groupId
      );
      if (group.user_Id !== user.ID) {
        return res.status(403).json("You do not have access to this group");
      }
      next();
    } catch (err) {
      return res
        .status(500)
        .send("An error occurred while checking group access");
    }
  }

  async function getHome(req, rsp) {
    const upcomingMovies = await fmdbMovieServices.getUpcomingMovies(3, 0);
    const popularMovies = await fmdbMovieServices.getPopularMovies(9, 0);
    return new View("home", {
      upcomingMovies: upcomingMovies,
      popularMovies: popularMovies,
    });
  }

  async function getAbout(req, rsp) {
    rsp.render("about");
  }

  async function getAllGroups(req, rsp) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const groups = await fmdbGroupServices.getAllGroups(limit, skip);
    return new View("groups", {
      title: "All groups",
      groups: groups,
      limit: limit,
      skip: skip,
    });
  }

  async function getGroups(req, rsp) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const groups = await fmdbGroupServices.getGroups(
      req.user.token,
      req.query.q,
      limit,
      skip
    );
    const movieIdToAdd = req.query.movieId;
    if (movieIdToAdd) {
      groups.forEach((group) => {
        if (!movieExistsInGroup(movieIdToAdd, group)) {
          group.movieId = movieIdToAdd;
        }
      });
    }
    return new View("groups", {
      title: "My Groups",
      groups: groups,
      limit: limit,
      skip: skip,
    });
  }

  async function getGroup(req, rsp) {
    const groupId = req.params.groupId;
    const group = await fmdbGroupServices.getGroup(req.user.token, groupId);
    return new View("group", { group: group });
  }

  async function deleteGroup(req, rsp) {
    await fmdbGroupServices.deleteGroup(req.user.token, req.params.groupId);
    rsp.redirect(`/auth/groups`);
  }

  async function updateGroup(req, rsp) {
    const groupId = req.params.groupId;
    await fmdbGroupServices.updateGroup(
      req.user.token,
      groupId,
      req.body.name,
      req.body.description
    );
    rsp.redirect(`/auth/groups`);
  }

  async function createGroup(req, rsp) {
    await fmdbGroupServices.createGroup(
      req.user.token,
      req.body.name,
      req.body.description
    );
    rsp.redirect(`/auth/groups`);
  }

  async function addMovieToGroup(req, rsp) {
    const movieId = req.params.movieId;
    const groupId = req.params.groupId;
    await fmdbGroupServices.addMovieToGroup(req.user.token, groupId, movieId);
    rsp.redirect(`/auth/groups/${groupId}`);
  }

  async function deleteMovieFromGroup(req, rsp) {
    const groupId = req.params.groupId;
    await fmdbGroupServices.deleteMovieFromGroup(
      req.user.token,
      groupId,
      req.params.movieId
    );
    rsp.redirect(`/auth/groups/${groupId}`);
  }

  async function getTopMovies(req, rsp) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    let movies = await fmdbMovieServices.getTopMovies(limit, skip);
    return new View("movies", {
      title: "Top movies",
      movies: movies,
      limit: limit,
      skip: skip,
    });
  }

  async function getMovieByExpression(req, rsp) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 250;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    let movies = await fmdbMovieServices.getMovieByExpression(
      req.query.expression,
      limit,
      skip
    );
    return new View("moviesExpression", {
      title: `Results for "${req.query.expression}"`,
      movies: movies,
      limit: limit,
      skip: skip,
      expression: req.query.expression,
    });
  }

  async function getMovieById(req, rsp) {
    const movieId = req.params.id;
    const movie = await fmdbMovieServices.getMovieById(movieId);
    return new View("movie", { movie: movie });
  }

  // Helper functions

  function movieExistsInGroup(movieId, group) {
    return group.movies.some((movie) => movie.id == movieId);
  }

  function View(name, data) {
    this.name = name;
    this.data = data;
  }

  function handleRequest(handler) {
    return async function (req, rsp) {
      try {
        let view = await handler(req, rsp);
        if (view) {
          rsp.render(view.name, Object.assign({ user: req.user }, view.data));
        }
      } catch (e) {
        // returning errors in Json format
        const response = toHttpResponse(e);
        rsp.status(response.status).json(response.body);
        console.log(e);
      }
    };
  }
}
