
export default {
    INVALID_PARAMETER: argName => {
        return {
            code: 1,
            message: `Invalid argument ${argName}`
        }
    },
    USER_NOT_FOUND: () => {
        return {
            code: 2,
            message: `User not found`
        }
    },
    GROUP_NOT_FOUND: (idGroup) => {
        return {
            code: 3,
            message: `Group with id ${idGroup} not found`
        }
    },
    MOVIE_NOT_FOUND: (idMovie) => {
        return {
            code: 4,
            message: `Movie with id ${idMovie} not found`
        }
    }
}
