export default {
  port: process.env.PORT || 5000,
  email: {
    from: 'AnimeBeat ✉️',
    service: 'gmail',
    auth: {
      user: 'animebeat.hey@gmail.com',
      pass: '4n1m3b34tm41ls3rv1c3',
    }
  },
  paths: {
    app: 'http://www.animebeat.us'
  },
  roles: {
    "1": { id: 1, name: 'admin' },
    "2": { id: 2, name: 'manager' },
    "3": { id: 3, name: 'user' }
  },
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }
}
