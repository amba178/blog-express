const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const routes =require('./routes')
const server = http.createServer(app)

const mongoskin = require('mongoskin')
const dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog'
const db = mongoskin.db(dbUrl)



const collections = {
  articles: db.collection('articles'),
  users: db.collection('users')
}

// const cookieParser = require('cookie-parser')
// const session = require('express-session')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

//Expose collection to requrest handlers
app.use((req, res, next) =>{
	if(!collections.articles || !collections.users) return next(new Error('No collections. '))
	req.collections = collections 
	return next()
})

app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// app.all('/', (req, res) => {
// 	res.render('index', {msg: 'Welcome to the Practical Node.js!'})
// })
app.locals.appTitle = 'blog-express'

// http.createServer(app).listen(app.get('port'), ()=>{
// 	console.log('Express server on port ' + app.get('port'))
// })

//Express.js middleware configuration
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride())
app.use(require('stylus').middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))

//development only 
if(app.get('env')==='development'){
	app.use(errorHandler('dev'))
}

//pages and routes 
app.get('/', routes.index)
app.get('/login',  routes.user.login)
app.post('/login', routes.user.authenticate)
app.get('/post',   routes.article.post)
app.post('/post',  routes.article.postArticle)
app.get('/logout', routes.user.logout)
app.get('/admin',  routes.article.admin)
app.get('/articles/:slug', routes.article.show)


// REST API routes
app.get('/api/articles', routes.article.list)
app.post('/api/articles', routes.article.add)
app.put('/api/articles/:id', routes.article.edit)
app.delete('/api/articles/:id', routes.article.del)



app.all('*', (req, res) => {
  res.status(404).send()
})


const boot = ()=>{ 
	   server.listen(app.get('port'), ()=>{
	   console.info('Express server on port ' + app.get('port'))
	  })
	} 
const shutdown = ()=>{
	server.close()
}
if(require.main === module){
	boot()
}else{
	console.info('Running app as a module')
	exports.boot = boot 
	exports.shutdown = shutdown 
	exports.port = app.get('port')
}

