const brev = require('brev');

module.exports.handler = (request) => {
  return brev.http_request('foopython')['Payload']
}
