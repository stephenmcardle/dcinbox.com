const getTimelineData = data => {
	const emailsByDate = {}
	
	data.forEach(email => {
		if (!(email.timestamp in emailsByDate)) {
			emailsByDate[email.timestamp] = {
				Republican: 0,
				Democrat: 0,
				Independent: 0
			}
		}
		if (email.party === "I") {
			emailsByDate[email.timestamp]["Independent"] += 1
		} else {
			emailsByDate[email.timestamp][email.party] += 1
		}
	})
	const canvasData = [
		{
			name: "Republican",
			type: "stackedColumn",
			color: "#dd3333",
			showInLegend: true,
			markerSize: 6,
			dataPoints: []
		},
		{
			name: "Democrat",
			type: "stackedColumn",
			color: "#3333dd",
			showInLegend: true,
			markerSize: 6,
			dataPoints: []
		},
		{
			name: "Independent",
			type: "stackedColumn",
			color: "#55cc55",
			showInLegend: true,
			markerSize: 6,
			dataPoints: []
		},
		{
			name: "Total",
			type: "stackedColumn",
			color: "#888888",
			showInLegend: false,
			markerSize: 6,
			visible: false,
			dataPoints: []
		}

	]
	for (let date in emailsByDate) {
		let year = Number(date.slice(0, 4))
		let month = Number(date.slice(5, 7))
		let day = Number(date.slice(8, 10))
		canvasData[0].dataPoints.push({x: [year, month, day], y: emailsByDate[date].Republican })
		canvasData[1].dataPoints.push({x: [year, month, day], y: emailsByDate[date].Democrat })
		canvasData[2].dataPoints.push({x: [year, month, day], y: emailsByDate[date].Independent })
		canvasData[3].dataPoints.push({x: [year, month, day], y: emailsByDate[date].Republican + emailsByDate[date].Democrat + emailsByDate[date].Independent })
	}
	return canvasData
}

const getPieData = (data, request) => {
	const numResults = data.length
	const field = request.field
	const emailsByField = {}
	
	data.forEach(email => {
		if (!(email[field] in emailsByField)) {
			emailsByField[email[field]] = 1
		} else {
			emailsByField[email[field]] += 1
		}
	})
	const dataPoints = []
	for (let fieldValue in emailsByField) {
		// Get the percentage for each field value, rounded to 2 decimal places
		let percentage = Math.round((emailsByField[fieldValue] * 100.0 / numResults) * 100) / 100
		if (fieldValue === 'undefined') {
			dataPoints.push({ y: percentage, label: 'N/A' })
		} else {
			dataPoints.push({ y: percentage, label: fieldValue })
		}
	}
	const canvasData = [{
		type: "pie",
		startAngle: 20,
		toolTipContent: "<b>{label}</b>: {y}%",
		showInLegend: "true",
		legendText: "{label}",
		indexLabelFontSize: 16,
		indexLabel: "{label} - {y}%",
		dataPoints: dataPoints
	}]
	return canvasData
}

const getColumnData = (data, request) => {
	const xAxis = request.xAxis
	const yAxis = request.yAxis
	const yAxisValues = {
		'party': ['Democrat', 'Republican'],
		'gender': ['M', 'F']
	}
	const emailsByField = {}
	
	data.forEach(email => {
		// If the yAxis is valid, as in it's not 'I' for independent or undefined gender
		if (yAxisValues[yAxis].includes(email[yAxis])) {
			// If xAxis value for this email is not in emailsByField
			if (!(email[xAxis] in emailsByField)) {
				// Set the value associated with this xAxis key to a new object
				emailsByField[email[xAxis]] = {}
				// Set the value associated with the xAxis[yAxis] key to 1
				emailsByField[email[xAxis]][email[yAxis]] = 1
			} else {
				// If just the yAxis value is not in the object associated with the current xAxis key
				if (!(email[yAxis] in emailsByField[email[xAxis]])) {
					// Set it equal to one
					emailsByField[email[xAxis]][email[yAxis]] = 1
				} else {
					// If it is present, increment it by 1
					emailsByField[email[xAxis]][email[yAxis]] += 1
				}
			}
		} else {
			//console.log('y axis not in y axis values')
		}
	})
	//console.log(emailsByField)
	const dataPoints1 = []
	const dataPoints2 = []
	for (let fieldValue in emailsByField) {
		if (yAxis === 'party') {
			//console.log(emailsByField[fieldValue]['Democrat'])
			if ('Democrat' in emailsByField[fieldValue]) {
				dataPoints1.push({ label: fieldValue, y: emailsByField[fieldValue]['Democrat'] })
			} else {
				dataPoints1.push({ label: fieldValue, y: 0 })
			}
			if ('Republican' in emailsByField[fieldValue]) {
				dataPoints2.push({ label: fieldValue, y: emailsByField[fieldValue]['Republican'] })
			} else {
				dataPoints2.push({ label: fieldValue, y: 0 })
			}
		}
		else if (yAxis === 'gender') {
			if ('M' in emailsByField[fieldValue]) {
				dataPoints1.push({ label: 'Male', y: emailsByField[fieldValue]['M'] })
			} else {
				dataPoints1.push({ label: 'fieldValue', y: 0 })
			}
			if ('F' in emailsByField[fieldValue]) {
				dataPoints2.push({ label: fieldValue, y: emailsByField[fieldValue]['F'] })
			} else {
				dataPoints2.push({ label: fieldValue, y: 0 })
			}
		}
	}
	return [dataPoints1, dataPoints2]
}

const getStackedBarData = (data, request) => {
	
}

module.exports = { getTimelineData, getPieData, getColumnData, getStackedBarData }