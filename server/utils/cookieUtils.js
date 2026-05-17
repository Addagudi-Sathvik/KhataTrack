const REFRESH_COOKIE = 'refreshToken';

const sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
const secure = process.env.NODE_ENV === 'production';

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/api/auth'
  });
}

export function getRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
}
