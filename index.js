require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/persons')


// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body), // Muestra el cuerpo de la solicitud
  ].join(' ')
}))

app.use(express.static('dist'))
app.use(express.json())
// app.use(requestLogger);
// app.use(morgan('tiny'));
app.use(cors())




// let persons = [
//   {
//     name: "Arto Hellas",
//     number: "5445645",
//     id: 1
//   },
//   {
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//     id: 2
//   },
//   {
//     name: "Dan Abramov",
//     number: "12-43-234345",
//     id: 3
//   },
//   {
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//     id: 4
//   },
// ]

// app.get('/', (request, response) => {
//   response.send('<h1>Hola mundo!</h1>')
// })


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   const person = persons.find(pers => pers.id === id)

//   if (person) {
//     response.json(person)
//   } else {
//     response.status(404).end()
//   }
// })

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id);

//   // Verificar si el ID existe en el array
//   const personToDelete = persons.find(pers => pers.id === id);

//   if (!personToDelete) {
//     return response.status(404).json({ error: 'Person not found' });
//   }

//   // Filtrar el array para eliminar el objeto con el ID correspondiente
//   persons = persons.filter(pers => pers.id !== id);

//   response.status(204).end();
// });

// const generateId = () => {
//   const maxId = persons.length > 0
//     ? Math.max(...persons.map(n => n.id))
//     : 0
//   return maxId + 1
// }

// app.post('/api/persons', (request, response) => {

//   const body = request.body

//   if (!body.name || !body.number) {
//     return response.status(400).json({
//       error: 'content missing'
//     })
//   }
//   const nameExists = persons.find(person => person.name === body.name);
//   if (nameExists) {
//     return response.status(400).json({
//       error: 'Name must be unique'
//     });
//   }

//   const person = {
//     name: body.name,
//     number: body.number,
//     id: generateId(),
//   }

//   persons = persons.concat(person)

//   response.json(person)
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// app.post('/api/persons', (request, response) => {
//   const body = request.body

//   if (body.name === undefined) {
//     return response.status(400).json({ error: 'content missing' })
//   }

//   const person = new Person({
//     name: body.name,
//     number: body.number,
//   })

//   person.save().then(savedPerson => {
//     response.json(savedPerson)
//   })
// })

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // Verificar si ya existe una persona con el mismo nombre
  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        const errorMessage = 'El nombre ya está en uso. Por favor, elige otro nombre.'
        return response.status(400).json({ error: errorMessage })
      }

      // Si no hay una persona con el mismo nombre, proceder con la creación
      const person = new Person({
        name: body.name,
        number: body.number,
      })

      return person.save()
    })
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => {
      next(error)
    })
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.get('/api/info', (request, response) => {
  // Obtener la fecha y hora actual
  const fechaHoraActual = new Date()
 

  // Formatear la fecha y hora según el formato deseado
  const formatoFechaHora = fechaHoraActual.toDateString() + ' ' + fechaHoraActual.toLocaleTimeString()

  // Crear el texto de respuesta
  const respuestaTexto = `Phonebook has info for 2 people <br><br> ${formatoFechaHora}`

  // Enviar la respuesta
  response.send(respuestaTexto)
})


// para capturar solicitudes realizadas a rutas inexistentes
app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`el puerto se esta ejecutando en http://localhost:${PORT}`)
})