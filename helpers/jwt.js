const { expressjwt: jwt } = require("express-jwt");
const api = process.env.API_URL;

function authJwt() {
  const secret = process.env.secret;
  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    // list of API to be excluded from aunthentication
    path: [
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      // `${api}/users/register`,
      `${api}/users/createUser`,
    ],
  });
}

//FIXME: According to the fine manual, an isRevoked function should accept two arguments and return a Promise. There's no third done argument:
// https://github.com/auth0/express-jwt#api
// NOTE: This code caused auth failure. The next code works
// req: what user is sending, payload: what's in data
// async function isRevoked(req, payload, done) {
//   if (!payload.isAdmin) {
//     done(null, true); // reject token
//   }

//   done(); // accept token
// }

async function isRevoked(req, payload) {
  // console.log(payload);
  if (payload.isAdmin == false) {
    // console.log("Not Admin");
    return true;
  }
  // console.log("Admin");
  return false;
}

module.exports = authJwt;
