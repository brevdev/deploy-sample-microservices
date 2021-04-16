const brev = require('brev');

module.exports.handler = async (event, context) => {
    return brev.service("targetjs")
        .get("/foo", {})
        .then((response) => {
            return response;
        });
};
