/**
 * Middleware que valida que el usuario autenticado tenga el rol `REPORT`.
 * Devuelve 403 si no existe `req.user` o si no contiene el rol.
 */
function checkReportRole(req, res, next) {
  const user = req.user;
  if (!user || !user.roles) {
    return res.status(403).json({ message: 'REPORT role required' });
  }
  if (!user.roles.includes('REPORT')) {
    return res.status(403).json({ message: 'REPORT role required' });
  }
  next();
}

module.exports = { checkReportRole };
