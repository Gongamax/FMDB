// Application Entry Point. 
// Register all HTTP API routes and starts the server

import express from 'express'
// import * as fmdbData from './data/local/fmdb-data-mem.mjs'
// import * as fmdbUsersData from './data/local/fmdb-users-data-mem.mjs'
import * as fmdbData from './data/db/fmdb-data-elastic.mjs'
import * as fmdbUsersData from './data/db/fmdb-users-data-elastic.mjs'
import * as fmdbMoviesData from './data/tmdb-movies-data.mjs'
import fmdbGroupServicesInit from './services/fmdb-groups-services.mjs'
import fmdbUsersServicesInit from './services/fmdb-users-services.mjs'
import fmdbMoviesServicesInit from './services/fmdb-movies-services.mjs'
import fmdbApiInit from './web/api/fmdb-web-api.mjs'
import fmdbSiteInit from "./web/site/fmdb-web-site.mjs"
import authUiFunction from './web/site/fmdb-users-web-site.mjs'

import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'
import hbs from 'hbs'
import url from 'url'
import path from 'path'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

const fmdbGroupServices = fmdbGroupServicesInit(fmdbData,fmdbUsersData)
const fmdbUserServices = fmdbUsersServicesInit(fmdbUsersData)
const fmdbMovieServices = fmdbMoviesServicesInit(fmdbMoviesData)
const fmdbApi = fmdbApiInit(fmdbUserServices, fmdbGroupServices, fmdbMovieServices)
const fmdbSite = fmdbSiteInit(fmdbGroupServices, fmdbMovieServices)
const authRouter = authUiFunction(fmdbUserServices)

const swaggerDocument = yaml.load('./docs/fmdb-api-spec.yaml')
const PORT = 8888

console.log("Start setting up server")
export let app = express()
 
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json()) // Register middleware to handle request bodies with json format
app.use(express.urlencoded({ extended: false})) // Register middleware to handle request bodies with json format
app.use(cookieParser()) // Register middleware to handle request bodies with json format

app.use(morgan('dev'))

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
app.set('views', path.join(__dirname, 'web', 'site', 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/web/site/views/partials');
app.use(express.static('code/web/site/views')); 
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));

//Authentication
app.use("/api",authorizationMw)
app.use(authRouter)

// Public routes
app.get('/home', fmdbSite.getHome)
app.get('/topMovies', fmdbSite.getTopMovies)
app.get('/movies', fmdbSite.getMovieByExpression)
app.get('/movies/movie/:id', fmdbSite.getMovieById)
app.get('/groups', fmdbSite.getAllGroups)
app.get('/groups/newGroup', fmdbSite.getNewGroup)

// Authenticated routes
app.get('/users/:userId/groups',fmdbSite.getGroups)
app.get('/users/:userId/groups/:groupId', fmdbSite.getGroup)
app.get('/users/:userId/groups/:groupId/update', fmdbSite.getUpdateGroup)
app.get('/groups/newGroup', fmdbSite.getNewGroup)
app.post('/users/:userId/groups/:groupId/delete', fmdbSite.checkGroupAccess, fmdbSite.deleteGroup)
app.post('/groups/:groupId/:movieId/delete', fmdbSite.checkGroupAccess, fmdbSite.deleteMovieFromGroup)
app.post('/users/:userId/groups/:groupId/delete', fmdbSite.checkGroupAccess, fmdbSite.deleteGroup)
app.post('/users/:userId/groups/:groupId/deleteMovie/:movieId', fmdbSite.checkGroupAccess, fmdbSite.deleteMovieFromGroup)
app.post('/users/:userId/groups', fmdbSite.createGroup) 
app.post('/users/:userId/groups/:groupId/addMovie/:movieId', fmdbSite.checkGroupAccess, fmdbSite.addMovieToGroup)
app.post('/users/:userId/groups/:groupId/update', fmdbSite.checkGroupAccess, fmdbSite.updateGroup)

//api goups
app.get('/api/:userId/groups', fmdbApi.getGroups)
app.get('/api/groups', fmdbApi.getAllGroups)
app.get('/api/users/:userId/groups/:groupId', fmdbApi.getGroup)
app.get('/api/users/:userId', fmdbApi.getUser)
app.get('/api/topMovies', fmdbApi.getTopMovies)
app.get('/api/movies/:expression', fmdbApi.getMovieByExpression)
app.delete('/api/users/:userId/groups/:groupId', fmdbApi.deleteGroup)
app.delete('/api/groups/:groupId/:movieId', fmdbApi.deleteMovieFromGroup)
app.post('/api/users/:userId/groups', fmdbApi.createGroup)
app.post('/api/users', fmdbApi.createUser)
app.put('/api/users/:userId/groups/:groupId', fmdbApi.updateGroup)
app.put('/api/groups/:groupId/:movieId', fmdbApi.addMovieToGroup)


app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}/home`))

console.log("End setting up server")

// Route handling functions

function authorizationMw(req, rsp, next) {
    //console.log('authorizationMw', req.get('Authorization'))
    if(req.get('Authorization')){
            req.user = {
            token: req.get('Authorization').split(' ')[1]
        }
    }
    next()
}
  