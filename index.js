require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const Contact = require('./models/contact')

app.use(express.static('dist'))

morgan.token('data', (req) => {
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

/*
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
*/
let persons = []

app.get('/', (request, response) => {
    response.send('funciona')
})

app.get('/api/persons', (request, response) => {
    Contact.find({}).then(contacts => {
        persons = contacts
        console.log('personas: \n', persons)
        response.json(contacts)
    })
})

app.get('/info', (request, response) => {
    const time = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`)
})

app.get('/api/persons/:id', (request, response, next) => {
    //const id = Number(request.params.id)
    //const person = persons.find(p => p.id === id)
    //console.log('id:', id, 'person:', person)
    Contact.findById(request.params.id).then(person => {
        console.log(person)

        if (person) {
            response.json(person)
        }

        response.status(404).end()
    }).catch(error => next(error))

    /*
    if (person) {
        response.json(person)
    }
    else {
        response.status(404).end()
    }
    */
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    //response.status(204).end()

    console.log('personas: \n', persons)

    Contact.findByIdAndDelete(request.params.id).then(() => response.status(204).end()).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    //console.log('request:', request.headers)


    const person = new Contact({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            persons.push(savedPerson)
            console.log('personas: \n', persons)
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    console.log('id para el put:', request.params.id)
    const person = {
        name: request.body.name,
        number: request.body.number
    }

    Contact.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedContact => response.json(updatedContact))
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    console.log(request)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    }

    if (error.name == 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})







