import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fp from 'fastify-plugin'

import config from '../config.js'
import User from '../users/user-schema.js'

/**
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
async function authPlugin(fastify) {
  await fastify.register(fastifyCookie)
  await fastify.register(fastifyJwt, {
    secret: config.jwt.secret,
    cookie: {
      cookieName: config.jwt.cookieName,
      signed: false,
    },
  })

  fastify.decorateRequest('currentUser', null)

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true })
    } catch {
      return reply.status(401).send({ error: 'Authentification requise' })
    }

    const user = await User.findById(request.user.sub)
      .select('_id email username emailVerified role createdAt updatedAt')
      .lean()

    if (!user) {
      return reply.status(401).send({ error: 'Utilisateur introuvable' })
    }

    request.currentUser = user
  })

  fastify.decorate('requireAdmin', async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true })
    } catch {
      return reply.status(401).send({ error: 'Authentification requise' })
    }

    const user = await User.findById(request.user.sub)
      .select('_id email username emailVerified role createdAt updatedAt')
      .lean()

    if (!user) {
      return reply.status(401).send({ error: 'Utilisateur introuvable' })
    }

    if (user.role !== 'admin') {
      return reply.status(403).send({ error: 'Accès réservé aux administrateurs' })
    }

    request.currentUser = user
  })
}

export default fp(authPlugin)
