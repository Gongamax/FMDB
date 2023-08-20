import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_Key = process.env.API_KEY;
const API_IMAGE = "https://image.tmdb.org/t/p/w500";

export async function getMovieByExpression(expression, limit, skip) {
  return fetchDataFromAPI(
    `https://api.themoviedb.org/3/search/movie?query=${expression}&api_key=${API_Key}`,
    function (obj, ...optionalParams) {
      const [limit, skip = 0] = optionalParams;
      obj.results.forEach((movie) => { movie.poster_path = API_IMAGE + movie.poster_path; });
      return obj.results.slice(skip, limit);
    },
    limit,
    skip
  );
}

export async function getUpcomingMovies(limit, skip) {
  return fetchDataFromAPI(
    `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_Key}`,
    processResults,
    limit,
    skip
  );
}

export async function getPopularMovies(limit, skip) {
  return fetchDataFromAPI(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_Key}`,
    processResults,
    limit,
    skip
  );
}

export async function getMovieById(movieId) {
  return fetchDataFromAPI(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_Key}`,
    (obj) => obj
  );
}

export async function getTopMovies(limit, skip = 0) {
  return fetchDataFromAPI(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_Key}`,
    processResults,
    limit,
    skip
  );
}

//Auxiliary functions

async function fetchDataFromAPI(url, callback, ...optionalParams) {
  return fetch(url)
    .then((response) => response.json())
    .then((obj) => callback(obj, ...optionalParams))
    .catch((err) => processError(err));
}

async function getAllGenres() {
  return fetchDataFromAPI(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_Key}`,
    (obj) => obj.genres
  );
}

// Create a global variable to store the genres data for caching
let cachedGenres = null;

// Fetch all genres and cache them for future use
async function fetchAndCacheGenres() {
  if (!cachedGenres) {
    cachedGenres = await getAllGenres();
  }
}

async function getMovieGenres(ids) {
  // Fetch and cache genres if not already cached
  await fetchAndCacheGenres();
  // Use the cached genres to filter and map the movie genres
  return cachedGenres.filter((g) => ids.includes(g.id)).map((g) => g.name);
}

async function processResults(obj, ...optionalParams) {
  const [limit, skip = 0] = optionalParams;
  let moviesArray = obj.results;

  // Fetch and cache genres if not already cached
  await fetchAndCacheGenres();

  const genrePromises = moviesArray.map((movie) =>
    getMovieGenres(movie.genre_ids)
  );
  const genresArray = await Promise.all(genrePromises);

  const retMovies = moviesArray.map((movie, index) => ({
    id: movie.id,
    title: movie.title,
    rank: index + 1,
    rating: movie.vote_average,
    image: API_IMAGE + movie.poster_path,
    releaseDate: movie.release_date,
    overview: movie.overview,
    genres: genresArray[index],
  }));

  const end = limit !== Infinity ? skip + limit : retMovies.length;
  return retMovies.slice(skip, end);
}

function processError(error) {
  console.log(`An error occurred ${error} `);
}
