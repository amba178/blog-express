const express = require('express')
const mongoskin = require('mongoskin')
const bodyParser = require('body-parser')
const logger = requie('morgan')
const app = express()

const db = mongoskin.db('mongoskin://@localhost:27017/test', {safe:true})
/* to conncet to remote server */
//mongodb://[username:password@]host1[:port1][,host2[:port2]...][/[database][?options]]

//extract parameters and data from the request 
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

//Do something every time there is this value in the URL pattern of the request 
app.param('collectionName', (req, res, next, collectionName)=>{
	req.collection = db.collection(collectionName)
	return next()
})

//user friendly, let include a root route with a message that 
//asks users to specify a collection name in their URL 


//next middleware function in the application's
// request-response cycle
//middleware functions can perform the following tasks:
//1Execute any code
//2make changes the request and the response object
//3End the request-response cycle
//4Call the next middleware function the stack


app.get('/', (req, res, next)=>{
	res.send('Select a collection, e.g, /collections/messages')
})

app.get('/collections/:collectionName', (req, res, next)=>{
	req.collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray((e, results)=>{
		if(e)return next(e)
		res.send(results)
	})
})

