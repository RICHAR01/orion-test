import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import cors from 'koa-cors';
// import mount from 'koa-mount'
// import serve from 'koa-static'

import config from '../config'
import { errorMiddleware } from '../src/middleware/error'
import { ensureUser } from '../src/middleware/auth'
import { queryParserMiddleware } from '../src/middleware/queryParser'
import { initSources } from './connector'

const app = new Koa()

// Note: Con esto creamos los modelos con su respectivo datasource.
initSources(app);

app.use(cors(config.cors))
app.use(logger())
app.use(bodyParser())
app.use(errorMiddleware())

// app.use(convert(mount('/docs', serve(`${process.cwd()}/docs`))))

app.use(queryParserMiddleware())
app.use(ensureUser)

const modules = require('../src/modules')
modules(app)

app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`)
})

export default app
