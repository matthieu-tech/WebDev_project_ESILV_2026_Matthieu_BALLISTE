import Fastify from 'fastify'

import config from './config.js'
import envToLogger from './logger.js'
import authPlugin from './plugins/auth.js'
import mongoosePlugin from './plugins/mongoose.js'
import rootRoutes from './rootRoute.js'
import authRoutes from './users/auth-routes.js'
import usersRoutes from './users/users-routes.js'
import portfolioRoutes from './portfolios/portfolio-routes.js'
import actusRoutes from './actus/actus-routes.js'

import cors from '@fastify/cors'

async function buildApp() {
  const fastify = Fastify({
    logger: envToLogger[config.env] ?? true,
  })

  await fastify.register(cors, {
    origin: config.clientUrl,
    credentials: true,
  })

  await fastify.register(authPlugin)
  await fastify.register(mongoosePlugin)
  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(usersRoutes, { prefix: '/users' })
  fastify.register(portfolioRoutes, { prefix: '/portfolios' })
  fastify.register(actusRoutes, { prefix: '/actus' })
  fastify.register(rootRoutes)

  return fastify
}

export default buildApp
