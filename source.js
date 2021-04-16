const brev = require('brev');

module.exports.handler = async (event, context) => {
    console.log("in:")
    console.log(event);
    return brev.service("targetjs")
        .get("/foo", {})
        .then((response) => {
            console.log("out:")
            console.log(event);
            return response;
        });
};
