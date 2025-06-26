export default{
  log: {
    level: 'silly',
    disabled: false,
  },
  cors: {
    origins: ['http://localhost:5173'],
    maxAge: 3 * 60 *60,
  },
  auth: {
    argon: {
      hashlength: 32,
      timeCost: 6,
      memoryCost: 2**17,
    },
    jwt: {
      audience: 'postman',
      issuer: 'api.myapp.local' ,
      expirationInterval: 60 * 60 ,
      secret: 'eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked',
    },
  },
};