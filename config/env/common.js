export default {
  port: process.env.PORT || 5000,
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
