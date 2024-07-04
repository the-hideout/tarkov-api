const setCorsHeaders = (response, config) => {
  const corsConfig = config instanceof Object ? config : {};

  response.headers.set(
    'Access-Control-Allow-Credentials',
    corsConfig?.allowCredentials ?? 'true',
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    corsConfig?.allowHeaders ?? 'application/json, Content-type',
  )
  response.headers.set(
    'Access-Control-Allow-Methods',
    corsConfig?.allowMethods ?? 'OPTIONS, GET, POST',
  )
  response.headers.set('Access-Control-Allow-Origin', corsConfig?.allowOrigin ?? '*')
  response.headers.set('X-Content-Type-Options', 'nosniff')
}

export default setCorsHeaders;
