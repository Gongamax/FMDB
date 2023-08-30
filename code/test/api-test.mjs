// Tests for the API
import request from "supertest";
import * as fmdbData from "../data/local/fmdb-data-mem.mjs";
import * as fmdbMoviesData from "../data/tmdb-movies-data.mjs";
import * as fmdbUsersData from "../data/local/fmdb-users-data-mem.mjs";
import fmdbUsersServices from "../services/fmdb-users-services.mjs";
import fmdbMoviesServices from "../services/fmdb-movies-services.mjs";
import fmdbGroupServicesInit from "../services/fmdb-groups-services.mjs";
import fmdbApiInit from "../web/api/fmdb-web-api.mjs";
import { app } from "../fmdb-server.mjs";

const fmdbGroupServices = fmdbGroupServicesInit(
  fmdbData,
  fmdbUsersData,
  fmdbMoviesData
);
const fmdbMovieServices = fmdbMoviesServices(fmdbMoviesData);
const fmdbUserServices = fmdbUsersServices(fmdbUsersData);
const fmdbApi = fmdbApiInit(
  fmdbUserServices,
  fmdbGroupServices,
  fmdbMovieServices
);

//TO RUN TESTS: npx mocha .\code\test\api-test.mjs
//PS: Make sure both server and database are running both locally or both on elastic

describe("Api tests ", function () {
  it("create a group ", async function () {
    const user = fmdbUserServices.createUser("Ricardo", "1234");
    await request(app)
      .post(`/api/groups`)
      .set("Authorization", `Bearer ${(await user).token}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);
  });
  it("delete a group", async function () {
    const user = fmdbUserServices.createUser("Ricardo", "1234");
    fmdbGroupServices.createGroup("b", "c", user.ID);
    request(app).delete(`/api/groups/76`).expect(400);
  });

  it("get top movies", async function () {
    await request(app)
      .get("/api/topMovies", fmdbApi.getTopMovies())
      .query("5")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("create a group and update", async () => {
    const user = fmdbUserServices.createUser("Ricardo", "1234");
    const group = fmdbGroupServices.createGroup("b", "c", user.ID);

    await request(app)
      .put(`/api/groups/:${group.ID}`)
      .set("Authorization", `Bearer ${(await user).token}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200); // or see below
  });

  it("movie by expression", async function () {
    const expression = "The Godfather";
    request(app)
      .get(`/api/movies/:${expression}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("create user", async function () {
    request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .send("ricardo")
      .expect(201);
  });
});
