const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')




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
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body), // Muestra el cuerpo de la solicitud
  ].join(' ');
}));

app.use(express.json());
// app.use(requestLogger);
// app.use(morgan('tiny'));
app.use(cors())
let persons = [
  {
    name: "Arto Hellas",
    number: "5445645",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  },
]

app.get('/', (request, response) => {
  response.send('<h1>Hola mundo cruel!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})


app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(pers => pers.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  // Verificar si el ID existe en el array
  const personToDelete = persons.find(pers => pers.id === id);

  if (!personToDelete) {
    return response.status(404).json({ error: 'Person not found' });
  }

  // Filtrar el array para eliminar el objeto con el ID correspondiente
  persons = persons.filter(pers => pers.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {

  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const nameExists = persons.find(person => person.name === body.name);
  if (nameExists) {
    return response.status(400).json({
      error: 'Name must be unique'
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})






app.get('/api/info', (request, response) => {
  // Obtener la fecha y hora actual
  const fechaHoraActual = new Date();
 

  // Formatear la fecha y hora según el formato deseado
  const formatoFechaHora = fechaHoraActual.toDateString() + ' ' + fechaHoraActual.toLocaleTimeString();

  // Crear el texto de respuesta
  const respuestaTexto = `Phonebook has info for 2 people <br><br> ${formatoFechaHora}`;

  // Enviar la respuesta
  response.send(respuestaTexto);
})


// para capturar solicitudes realizadas a rutas inexistentes
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`el puerto se esta ejecutando en http://localhost:${PORT}`)
})