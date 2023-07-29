export default function(fmdbMoviesData) {
    // Validate arguments
    if (!fmdbMoviesData) {
        throw errors.INVALID_PARAMETER('fmdbMoviesData')
    }

    return {
        getTopMovies: getTopMovies, 
        getMovieByExpression: getMovieByExpression, 
        getMovieById: getMovieById,
        getUpcomingMovies: getUpcomingMovies,
        getPopularMovies: getPopularMovies,
    }

    async function getTopMovies(limit = 250, skip = 0){
        validateLimitAndSkip(limit, skip)
        return fmdbMoviesData.getTopMovies(limit, skip)
    }

    async function getUpcomingMovies(limit = 20, skip = 0){
        validateLimitAndSkip(limit, skip)
        return fmdbMoviesData.getUpcomingMovies(limit, skip)
    }

    async function getPopularMovies(limit = 20, skip = 0){
        validateLimitAndSkip(limit, skip)
        return fmdbMoviesData.getPopularMovies(limit, skip)
    }
    
    async function getMovieByExpression(q, limit = Infinity, skip = 0){
        validateLimitAndSkip(limit, skip)
        return fmdbMoviesData.getMovieByExpression(q, limit, skip)
    }

    async function getMovieById(id){
        const movie = await fmdbMoviesData.getMovieById(id)
        if(!movie) {
            throw errors.MOVIE_NOT_FOUND(id)
        }
        return movie
    }

    //Auxiliary functions
    function validateLimitAndSkip(limit, skip){
        limit = Number(limit)
        skip = Number(skip)
        if(isNaN(limit) || isNaN(skip) || skip > limit) {
            throw errors.INVALID_PARAMETER(`skip or limit`)
        }
    }
}