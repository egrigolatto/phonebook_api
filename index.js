require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/persons");

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body), // Muestra el cuerpo de la solicitud
    ].join(" ");
  })
);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

let visitas = 0;

app.get("/info", (request, response) => {
  const fechaHoraActual = new Date();

  visitas++;

  const formatoFechaHora =
    fechaHoraActual.toDateString() + " " + fechaHoraActual.toLocaleTimeString();

  const respuestaTexto = `Phonebook has info for ${visitas} people <br><br> ${formatoFechaHora}`;

  response.send(respuestaTexto);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  // Verificar si ya existe una persona con el mismo nombre
  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        const errorMessage =
          "El nombre ya está en uso. Por favor, elige otro nombre.";
        return response.status(400).json({ error: errorMessage });
      }

      // Si no hay una persona con el mismo nombre, proceder con la creación
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      return person.save();
    })
    .then((savedPerson) => {
      response.json(savedPerson.toJSON());
    })
    .catch((error) => {
      next(error);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
