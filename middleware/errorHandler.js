const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.log(err.stack);

  const status = return res.statusCode ? return res.statusCode : 500; // server error

  return res.status(status);

  res.json({ message: err.message });
};

module.exports = errorHandler;
