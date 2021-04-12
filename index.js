const brev = require('brev');
const serverless = require('serverless-http');
const express = require('express');

const app = express()

app.get('/', (req, res) => {
  res.send('hi');
})


const handler = serverless(app);
module.exports.handler = async (request, context) => {
  const result = await handler(request, context);
  return result;
}
