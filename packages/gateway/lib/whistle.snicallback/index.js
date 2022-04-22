exports.sniCallback = (req, { sniCallback }) => {
  if (sniCallback) {
    return sniCallback(req.originalReq.servername, req);
  }
  return false;
};
