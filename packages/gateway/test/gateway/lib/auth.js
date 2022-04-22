
module.exports = async (req) => {
  if (req.url.indexOf('forbidden') !== -1) {
    return { statusCode: 403 };
  }
};
