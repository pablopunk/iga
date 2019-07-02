export default req => {
  if (req.query && req.query.id) {
    return req.query.id
  }
  return 'id does not exist in query'
}
