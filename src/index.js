/* eslint-disable no-console */
const express = require('express')
const path = require('path')
const logger = require('morgan')
const compression = require('compression')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const dotenv = require('dotenv')
const saveUser = require('./user/save_user')
const debug = require('debug')('app')

// Load environment variables from .env file
dotenv.load()

if (!process.env.PORT) {
  debug('Please `cp example_dot_env .env` to create your .env file.')
  debug('Or, please add a port to your .env file.')
  process.exit(1)
}

const app = express()

app.set('view engine', 'html')
app.set('port', process.env.PORT)
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(methodOverride('_method'))
app.use(express.static(path.resolve(__dirname, '../public')))

// web app endpoints
app.post('/submit', (req, res) => {
  // form data is in req.body
  console.log(req.body)

  saveUser(req.body, {
    source: 'web',
  })
  .then((data) => {
    debug(data)
    // redirect to a static confirmation page for now
    res.redirect('/success.html')
  })
  .catch((reason) => {
    debug(reason)
    // TODO(pascal): redirect to an error message
    res.redirect('/')
  })
})

// Production error handler
if (app.get('env') === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.sendStatus(err.status || 500)
  })
}

app.listen(app.get('port'), () => {
  debug(`Express server listening on port ${app.get('port')}`)
})

module.exports = app
