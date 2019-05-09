const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cors = require('cors');

const routes = require('./routes');


const app = express();
app.use(cors({ origin: true }));

const port = process.env.PORT || 8000;
const server = require('http').Server(app);

server.listen(port, () => {
  console.log(`server listening-->${port}`);
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", routes);
