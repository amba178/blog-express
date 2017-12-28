//1-require dependencies
const express = require('express')
const http = require('http')
const path = require('path')
const OAuth = require('OAuth')
const models = require('./models')
const OAuth2 = OAuth.OAuth2
const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY
const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET
const cookieConst = process.env.COOKIE_CONST 
const sessionConst = process.env.SESSION_CONST 
const everyauth = require('everyauth')
const app = express()
const routes =require('./routes')
const server = http.createServer(app)

//3-connect to database 
const mongoose = require('mongoose')
const dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog'
const db = mongoose.connect(dbUrl, {safe: true})



// const collections = {
//   articles: db.collection('articles'),
//   users: db.collection('users')
// }

everyauth.debug = true 
everyauth.twitter 
	.consumerKey(twitterConsumerKey)
	.consumerSecret(twitterConsumerSecret)
	.findOrCreateUser(function(session, accessToken, accessTokenSecret,twitterUserMetadata){
		let promise = this.Promise()
		process.nextTick(()=>{
			if (twitterUserMetadata.screen_name === 'salemA6') {
          			session.user = twitterUserMetadata;
         			session.admin = true;
       		 }
       		 promise.fulfill(twitterUserMetadata)
		})
		return promise
	}).redirectPath('/admin')

//we need it because otherwise the session will be kept alive
//the Express.js request is intercepted by Everyauth automatically added /logout
//and never makes it to our /logout
everyauth.everymodule.handleLogout(routes.user.logout)

everyauth.everymodule.findUserById((user, callback) => {
  callback(user)
})


//Define in external modules(third-party)
const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const cookieParser = require('cookie-parser')


// //Expose collection to requrest handlers
// app.use((req, res, next) =>{
// 	if(!collections.articles || !collections.users) return next(new Error('No collections. '))
// 	req.collections = collections 
// 	return next()
// })


//Defined in the app or its modules such as 
app.use((req, res, next)=> {
  if (!models.Article || ! models.User) return next(new Error("No models."))
  req.models = models;
  return next();
})

//2-configure settings 
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

//4- defining middleware 
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser(cookieConst))
app.use(session({secret: sessionConst, resave: true, saveUninitialized: true}))
app.use(everyauth.middleware())
app.use(methodOverride())
app.use(require('stylus').middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))


//Authentication middleware
app.use((req, res, next) => {
	if(req.session && req.session.admin){
		//Available only to the views
		res.locals.admin = true
	}
	next()
})

//authorization 
let authorize = (req, res, next)=>{
	if(req.session && req.session.admin)
		return next()
	else
		return res.send(401)
}


//development only 
if(app.get('env')==='development'){
	app.use(errorHandler('dev'))
}

//pages and routes 
app.get('/', routes.index)
app.get('/login',  routes.user.login)
app.post('/login', routes.user.authenticate)
app.get('/admin',  authorize, routes.article.admin)
app.get('/post',   authorize, routes.article.post)
app.post('/post',  authorize, routes.article.postArticle)
app.get('/logout', routes.user.logout)
app.get('/articles/:slug', routes.article.show)


// REST API routes
app.all('/api', authorize)
app.get('/api/articles', routes.article.list)
app.post('/api/articles', routes.article.add)
app.put('/api/articles/:id', routes.article.edit)
app.delete('/api/articles/:id', routes.article.del)

// app.render(view, [locals], callback)
/*app.use('/admin', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
  console.log(req.originalUrl); // '/admin/new'
  console.log(req.baseUrl); // '/admin'
  console.log(req.path); // '/new'
  next();
})
*/


app.all('*', (req, res) => {
  res.status(404).send('The does not exist!')
  // res.status(404).render('error', {msg: 'The does not exist!'} )
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

