import fetch from 'node-fetch'
import request from 'supertest'
import express from 'express'

import assert from 'assert'
import * as cmdbData from '../data/cmdb-data-mem.mjs'
import * as cmdbMoviesData from '../data/imdb-movies-data.mjs'
import cmdbServicesInit from '../services/cmdb-services.mjs'
import cmdbApiInit from '../web/api/cmdb-web-api.mjs'
import { app } from '../cmdb-server.mjs'
const cmdbServices = cmdbServicesInit(cmdbMoviesData, cmdbData )
const cmdbApi = cmdbApiInit(cmdbServices)


describe('Api tests ',function()  {

	it('create a group ', async function()  {
        let a = cmdbData.createUser('Ricardo')

	    const response = await request(app)
        .post(`/api/users/:${a.ID}/groups`)
        .set('Authorization', `Bearer ${(await a).token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);
        
		
		
	});
    it('delete a group', async function(){
        let a = cmdbData.createUser('Ricardo')
        let b = cmdbData.createGroup('b','c',a.ID)
        const response = request(app)
        .delete(`/api/users/:${a.ID}/groups/76`)
        .expect(400)

    });
    
		
	
    
    it('get top movies', async function ()  {

		const response = await request(app)
            .get('/api/topMovies', /*cmdbApi.getTopMovies()*/)
			.query('5')
            .expect('Content-Type', /json/)
			.expect(200)
            
        
		   

	});
    it('create a group and update', async () => {
        let a = cmdbData.createUser('Ricardo')
        let b = cmdbData.createGroup('b','c',a.ID)
    
   
        const response2 = await request(app)
			.put(`/api/users/:${a.ID}/groups/:${b.ID}`)
            .set('Authorization', `Bearer ${(await a).token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200); // or see below
		
		
	});

    it('movie by expression', async function(){
        const expression = 'The Godfather'
        const response = request(app)
           .get(`/api/movies/:${expression}`)
           .set('Accept', 'application/json')
		   .expect('Content-Type', /json/)
           .expect(200)

    })

    it('create user', async function(){
        const response = request(app)
        .post('/api/users')
        .set('Accept', 'application/json')
		.expect('Content-Type', /json/)
        .send('ricardo')
        .expect(201)

    })

   
});