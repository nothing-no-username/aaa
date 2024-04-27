const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('data', (req, res) => {
	if (req.method === 'POST') {
		return JSON.stringify(req.body)
	}
})

app.use(express.json())
app.use(morgan((tokens, req, res) => {
	return [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, 'content-length'), '-',
		tokens['response-time'](req, res), 'ms',
		tokens.data(req, res)
	].join(' ')
}))
app.use(cors())

let persons = [
	{
		"id": 1,
		"name": "Arto Hellas",
		"number": "040-123456"
	},
	{
		"id": 2,
		"name": "Ada Lovelace",
		"number": "39-44-5323523"
	},
	{
		"id": 3,
		"name": "Dan Abramov",
		"number": "12-43-234345"
	},
	{
		"id": 4,
		"name": "Mary Poppendieck",
		"number": "39-23-6423122"
	}
]

app.get('/', (request, response) => {
	response.send('funciona')
})

app.get('/api/persons', (request, response) => {
	response.json(persons)
})

app.get('/info', (request, response) => {
	const time = new Date()
	response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(p => p.id === id)
	//console.log('id:', id, 'person:', person)

	if (person) {
		response.json(person)
	}
	else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(p => p.id !== id)

	response.status(204).end()
})

app.post('/api/persons', (request, response) => {
	const body = request.body
	console.log('request:', request.headers)

	if (!body.name) {
		return response.status(400).json({ error: 'name missing' })
	}
	else if (!body.number) {
		return response.status(400).json({ error: 'number missing' })
	}

	for (let i = 0; i < persons.length; i++) {
		if (body.name === persons[i].name) {
			return response.status(400).json({ error: 'name must be unique' })
		}
	}

	const person = {
		name: body.name,
		number: body.number,
		id: Math.floor(Math.random() * 1000000000)
	}

	persons = persons.concat(person)

	response.json(person)
})



const PORT = 3001

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})







