// Full Documentation - https://www.turbo360.co/docs
const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()
const data = require('../data')
const controllers = require('../controllers')


router.post('/search', (req, res) => {
	// Get ES search results
	data.search(req.body)
	.then(data => {
		res.json({
			confirmation: 'success',
			data: data
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

router.post('/visualize', (req, res) => {
	data.visualize(req.body)
	.then(data => {
		res.json({
			confirmation: 'success',
			data: data
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

router.get('/:resource', (req, res) => {
	const resource = req.params.resource
	const controller = controllers[resource] // check if valid resource

	if (controller == null){
		res.json({
			confirmation: 'fail',
			message: 'Invalid resource: ' + resource + '. Current resources: ' + Object.keys(controllers).join(', ')
		})
		return
	}

	controller.get(req.query)
	.then(data => {
		res.json({
			confirmation: 'success',
			data: data
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

router.get('/:resource/:id', (req, res) => {
	const resource = req.params.resource
	const controller = controllers[resource] // check if valid resource

	if (controller == null){
		res.json({
			confirmation: 'fail',
			message: 'Invalid resource: ' + resource + '. Current resources: ' + Object.keys(controllers).join(', ')
		})
		return
	}

	controller.getById(req.params.id)
	.then(data => {
		res.json({
			confirmation: 'success',
			data: data
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

router.post('/:resource', (req, res) => {
	const resource = req.params.resource
	const controller = controllers[resource] // check if valid resource

	if (controller == null){
		res.json({
			confirmation: 'fail',
			message: 'Invalid resource: ' + resource + '. Current resources: ' + Object.keys(controllers).join(', ')
		})
		return
	}

	// Ensure user is logged in
	if (req.vertexSession == null || req.vertexSession.user == null) {
		res.json({
			confirmation: "fail",
			message: "Not Authorized"
		})
		return
	}

	controller.post(req.body)
	.then(data => {
		res.json({
			confirmation: 'success',
			data: data
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

// update entity
router.put('/:resource/:id', (req, res) => {
	const resource = req.params.resource
	const controller = controllers[resource] // check if valid resource

	if (controller == null){
		res.json({
			confirmation: 'fail',
			message: 'Invalid resource: ' + resource + '. Current resources: ' + Object.keys(controllers).join(', ')
		})
		return
	}

	// Ensure user is logged in
	if (req.vertexSession == null || req.vertexSession.user == null) {
		res.json({
			confirmation: "fail",
			message: "Not Authorized"
		})
		return
	}

	controller.put(req.params.id, req.body)
	.then(data => {
		res.json({
			confirmation: 'success',
			data: data
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

// update entity directly from HTML form
router.post('/update/:resource/:id', (req, res) => {
	const resource = req.params.resource
	const controller = controllers[resource] // check if valid resource

	if (controller == null){
		res.json({
			confirmation: 'fail',
			message: 'Invalid resource: ' + resource + '. Current resources: ' + Object.keys(controllers).join(', ')
		})
		return
	}

	// Ensure user is logged in
	if (req.vertexSession == null || req.vertexSession.user == null) {
		res.json({
			confirmation: "fail",
			message: "Not Authorized"
		})
		return
	}

	controller.put(req.params.id, req.body)
	.then(data => {
		res.redirect('/admin/dashboard')
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

// delete entity directly from HTML form
router.get('/delete/:resource/:id', (req, res) => {
	const resource = req.params.resource
	const controller = controllers[resource]

	// Ensure user is logged in
	if (req.vertexSession == null || req.vertexSession.user == null) {
		res.json({
			confirmation: "fail",
			message: "Not Authorized"
		})
		return
	}

	controller.delete(req.params.id)
	.then(data => {
		res.redirect('/admin/dashboard')
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})



module.exports = router
