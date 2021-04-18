const brev = require('brev');


module.exports.handler = (request, context) => {
  return brev.service("foopython")
      .get("/foo", {})
      .then((response) => {
        console.log("out:")
        console.log(response);
        return response;
    });
}
