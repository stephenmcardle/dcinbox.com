// Full Documentation - https://www.turbo360.co/docs
const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()
const controllers = require('../controllers')

router.get('/', (req, res) => {
	res.render('index', {pagename: 'Home'})
})

router.get('/about', (req, res) => {
	res.render('about', {pagename: 'About'})
})

router.get('/blog', (req, res) => {
	controllers.blog.get()
	.then(data => {
		data.forEach(post => {
			post.excerpt = post.body.slice(0, 250)
		})
		res.render('blog', { posts: data, pagename: 'Blog' });
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/blog/:slug', (req, res) => {
	controllers.blog.get({slug: req.params.slug})
	.then(data => {
		if (data.length !== 1) {
			res.redirect('/error?message=Post%20Not%20Found')
			return
		}
		const paragraphs = data[0].body.split('\r\n')
		res.render('post', { post: data[0], paragraphs: paragraphs, pagename: data[0].title });
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/visualize', (req, res) => {
	res.render('visualize', {pagename: 'Visualize'})
})

router.get('/admin/dashboard', (req, res) => {
	if (req.vertexSession == null){ // user not logged in, redirect to login page:
		res.redirect('/admin/login')
		return
	}

	if (req.vertexSession.user == null){ // user not logged in, redirect to login page:
		res.redirect('/admin/login')
		return
	}
	controllers.user.getById(req.vertexSession.user)
	.then(user => {
		if (user.role !== "admin") {
			res.json({
				confirmation: "fail",
				message: "Not Authorized"
			})
		} else {
			controllers.blog.get({})
			.then(data => {
				res.render('admin/dashboard', { posts: data })
			})
		}
	})
	.catch(err => {
		res.json({
			confirmation: "fail",
			message: err.message
		})
	})
})

router.get('/admin/login', (req, res) => {
	if (req.vertexSession == null || req.vertexSession.user == null) {
		res.render('admin/login', null)
	} else {
		res.redirect('/admin/dashboard')
		return
	}
})

router.get('/error', (req, res) => {
	res.render('error', {message: req.query.message, pagename: 'Error'})
})


module.exports = router
