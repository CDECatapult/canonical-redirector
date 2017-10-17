'use strict'

const http = require('http')
const nodeProcess = require('process')
const envalid = require('envalid')

const {CANONICAL_HOSTNAME, PORT} = envalid.cleanEnv(nodeProcess.env, {
  CANONICAL_HOSTNAME: envalid.host(),
  PORT: envalid.port({default: 4000})
}, {
  dotEnvPath: null
})

const server = http.createServer((req, res) => {
  if (req.url === '/healthcheck') {
    res.writeHead(200)
  } else {
    res.writeHead(301, {location: `https://${CANONICAL_HOSTNAME}${req.url}`})
  }
  res.end()
})
server.listen(PORT)

nodeProcess.on('SIGINT', () => {
  server.close()

  setTimeout(() => nodeProcess.exit(), 5000).unref()
})
