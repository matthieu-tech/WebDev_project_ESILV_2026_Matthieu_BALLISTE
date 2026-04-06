import User from './user-schema.js'

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
function usersRoutes(app) {
  app.get('/verify-email', async (request, reply) => {
    // Récupérer le token de validation depuis la querystring de la requête
    const { token } = request.query

    // Valider la présence du token
    if (!token) {
      return reply.status(400).send({ error: 'Token de validation requis' })
    }

    // Rechercher l'utilisateur correspondant au token de validation
    const user = await User.findOne({ validationToken: token })

    // Gérer le cas où le token est invalide
    if (!user) {
      return reply.status(400).send({ error: 'Token de validation invalide' })
    }

    // Vérifier si l'utilisateur a déjà validé son email
    if (user.emailVerified) {
      return reply.status(409).send({ error: 'Adresse email déjà validée' })
    }

    // Marquer l'email comme vérifié et supprimer le token de validation
    user.emailVerified = true
    user.validationToken = null

    // Sauvegarder les modifications dans la base de données
    await user.save()

    return reply.send({ message: 'Adresse email validée avec succès' })
  })

  app.get('/me', {
    onRequest: [app.authenticate], // Protéger cette route pour qu'elle soit accessible uniquement aux utilisateurs authentifiés
  }, async (request, reply) => {
    return reply.send({ user: request.currentUser })
  })

  // Routes réservées aux administrateurs
  app.get('/', {
    onRequest: [app.requireAdmin],
  }, async (request, reply) => {
    // Pagination via query params ?page=1&limit=20
    const page = Math.max(1, parseInt(request.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit) || 20))
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find()
        .select('-passwordHash -validationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ])

    return reply.send({ users, total, page, limit })
  })

  app.get('/:id', {
    onRequest: [app.requireAdmin],
  }, async (request, reply) => {
    // Attention: les params sont toujours des strings, même si l'ID est un ObjectId dans MongoDB
    const { id } = request.params

    const user = await User.findById(id)
      .select('-passwordHash -validationToken')
      .lean()

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.send({ user })
  })

  app.delete('/:id', {
    onRequest: [app.requireAdmin],
  }, async (request, reply) => {
    const { id } = request.params

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.status(204).send()
  })
}

export default usersRoutes
