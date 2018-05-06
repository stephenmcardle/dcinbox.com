process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const Promise = require('bluebird')
const axios = require('axios')
const _ = require('underscore')
const graphs = require('./graphs')

const elasticSearch = queryData => {
	return new Promise((resolve, reject) => {
		axios({
			method: 'get',
			url: process.env.ES_URL,
			data: queryData
		})
		.then(response => {
			let results = response.data.hits.hits
			// Remove duplicate emails from ES data
			results = _.uniq(results, function(p){ return p._source.Body; })
			let data = []
			// Only keep relevant data
			results.forEach(item => {
				let date = item._source.Date
				let timestamp = date.slice(0, date.indexOf('T'))
				let result = {
					name: item._source.Name,
					address: item._source.Address,
					timestamp: timestamp,
					subject: item._source.Subject,
					body: item._source.Body,
					district: item._source.district,
					title: item._source.title,
					gender: item._source.gender,
					state: item._source.state,
					party: item._source.party,
					score: item._score
				}
				if (result.party === "I") {
					result.party = "Independent"
				}
				data.push(result)
			})
			resolve(data)
		})
		.catch(err => {
			reject(err)
		})
	})
}

const search = requestBody => {
	const queryData = {
	    "query": {
	    	"bool": {
	    		"must": [
	    			{
	    				"range": {
		    				"Date": {

		    				}
	    				}
	    			}
	    		]
	    	}
		},
		"size": 100,
		"from": 0,
		"sort": {
			"Date": "desc",
			"_score": "desc"
		}
	}
	// Check for optional search fields
	// This avoids searching for the empty string
	if (requestBody.startDate !== '') {
		queryData.query.bool.must[0].range.Date["gte"] = requestBody.startDate
	}
	if (requestBody.endDate !== '') {
		queryData.query.bool.must[0].range.Date["lte"] = requestBody.endDate
	}
	if (requestBody.query !== '') {
		queryData.query.bool.must.push({"match": {"Body": requestBody.query}})
	}
	if (requestBody.party !== '') {
		queryData.query.bool.must.push({"match": {"party": requestBody.party}})
	}
	if (requestBody.gender !== '') {
		queryData.query.bool.must.push({"match": {"gender": requestBody.gender}})
	}
	if (requestBody.state !== '') {
		queryData.query.bool.must.push({"match": {"state": requestBody.state}})
	}
	if (requestBody.district !== undefined && requestBody.district !== '') {
		queryData.query.bool.must.push({"match": {"district": requestBody.district}})
	}
	if (requestBody.chamber === 'Senate') {
		queryData.query.bool.must.push({
			"bool": {
				"should": [
					{"term": {"title": "Senator, 1st Class"}},
					{"term": {"title": "Senator, 2nd Class"}},
					{"term": {"title": "Senator, 3rd Class"}}
				]
			}
		})
	} else if (requestBody.chamber === 'House') {
		queryData.query.bool.must.push({
			"bool": {
				"should": [
					{"term": {"title": "Representative"}},
					{"term": {"title": "Delegate"}},
					{"term": {"title": "Resident Commissioner"}}
				]
			}
		})
	}	
	return new Promise((resolve, reject) => {
		elasticSearch(queryData)
		.then(results => {
			const returnData = [results, graphs.getTimelineData(results)]
			resolve(returnData)
		})
		.catch(err => {
			reject(err)
		})
	})
}

const visualize = requestBody => {
	const queryData = {
	    "query": {
	    	"match_all": {}	
	    },
		"size": 100,
		"from": 0,
		"sort": {
			"Date": "desc"
		}
	}
	if (requestBody.query !== '') {
		queryData.query = {
			"match": {"Body": requestBody.query}
		}
	}
	return new Promise((resolve, reject) => {
		elasticSearch(queryData)
		.then(results => {
			// Possible input values
			const fieldNames = ['party', 'state', 'gender', 'timestamp']
			const xAxisNames = ['timestamp', 'state']
			const yAxisNames = ['party', 'gender']
			// Error checking input
			if (fieldNames.indexOf(requestBody.field) === -1) {
				reject('Invalid Field of Interest')
			}
			if (xAxisNames.indexOf(requestBody.xAxis) === -1) {
				reject('Invalid X Axis Value')
			}
			if (yAxisNames.indexOf(requestBody.yAxis) === -1) {
				reject('Invalid Y Axis Value')
			}
			// Call appropriate function to get chart data
			if (requestBody.type === 'pie') {
				resolve(graphs.getPieData(results, requestBody))
			} else if (requestBody.type === 'column') {
				resolve(graphs.getColumnData(results, requestBody))
			} else if (requestBody.type === 'stacked-bar') {
				resolve(graphs.getStackedBarData(results, requestBody))
			} else {
				reject('Invalid Chart Type')
			}
		})
		.catch(err => {
			reject(err)
		})
	})
}

module.exports = { search, visualize }

