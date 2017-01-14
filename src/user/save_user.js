const http = require('http')
const validateUser = require('./validate_user')
const validateCampaign = require('./validate_campaign')
const debug = require('debug')('user')

module.exports = function saveUser(user, { source }) {
  return new Promise((resolve, reject) => {
    // validate user data
    const invalid = validateUser(user)
    if (invalid) return reject(invalid)

    // validate campaign
    const campaign = validateCampaign(user.campaign)
    if (!campaign) return reject('user must have a campaign')

    // validate source
    if (!source) return reject('user must have a source')

    // build data object for POST to central
    const data = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      zip: user.zip,
      campaign,
      source,
    }

    // convert data to a query-encoded string key1=val1&key2=val2
    const encodedData = (
      Object.keys(data)
      .map(key => `${key}=${data[key]}`)
      .join('&')
    )

    // options for http request
    const API_OPTIONS = {
      hostname: process.env.DATA_API,
      port: process.env.DATA_API_PORT,
      path: '/api/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Authorization': `Bearer ${process.env.DATA_API_TOKEN}`,
      },
    }

    // make the request
    const req = http.request(API_OPTIONS, (res) => {
      debug(`Status: ${res.statusCode}`)
      debug(`Headers: ${JSON.stringify(res.headers)}`)
      res.setEncoding('utf8')

      // listen for the response data
      res.on('data', (body) => {
        debug(`Body: ${body}`)
        resolve(body)
      })
    })
    req.on('error', (err) => {
      debug(`problem with request: ${err.message}`)
    })

    // send our data
    req.write(encodedData)

    // end the request
    req.end()
  })
}
