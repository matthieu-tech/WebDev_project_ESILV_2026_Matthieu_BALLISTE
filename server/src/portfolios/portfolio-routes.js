import Portfolio from './portfolio-schema.js'

const MAX_PORTFOLIOS = 5

/**
 * @param {import('fastify').FastifyInstance} app
 */
function portfolioRoutes(app) {
  // GET /portfolios — lister les portfolios de l'utilisateur connecté
  app.get('/', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const portfolios = await Portfolio.find({ userId: request.currentUser._id }).lean()
    return reply.send({ portfolios })
  })

  // POST /portfolios — créer un nouveau portfolio (max 3 par utilisateur)
  app.post('/', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { name } = request.body

    if (!name || !name.trim()) {
      return reply.status(400).send({ error: 'Le nom du portfolio est requis' })
    }

    const count = await Portfolio.countDocuments({ userId: request.currentUser._id })
    if (count >= MAX_PORTFOLIOS) {
      return reply.status(409).send({ error: `Vous ne pouvez pas avoir plus de ${MAX_PORTFOLIOS} portfolios` })
    }

    const portfolio = await Portfolio.create({
      userId: request.currentUser._id,
      name: name.trim(),
    })

    return reply.status(201).send({ portfolio })
  })

  // GET /portfolios/:id — récupérer un portfolio avec ses holdings
  app.get('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: request.currentUser._id,
    }).lean()

    if (!portfolio) {
      return reply.status(404).send({ error: 'Portfolio introuvable' })
    }

    return reply.send({ portfolio })
  })

  // DELETE /portfolios/:id — supprimer un portfolio
  app.delete('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    const portfolio = await Portfolio.findOneAndDelete({
      _id: id,
      userId: request.currentUser._id,
    })

    if (!portfolio) {
      return reply.status(404).send({ error: 'Portfolio introuvable' })
    }

    return reply.status(204).send()
  })

  // POST /portfolios/:id/holdings — ajouter une crypto à un portfolio
  app.post('/:id/holdings', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params
    const { symbol, name, quantity, purchasePrice, purchaseDate, coinGeckoId } = request.body

    if (!symbol || !name || quantity == null || purchasePrice == null || !purchaseDate) {
      return reply.status(400).send({ error: 'Champs requis : symbol, name, quantity, purchasePrice, purchaseDate' })
    }

    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: request.currentUser._id,
    })

    if (!portfolio) {
      return reply.status(404).send({ error: 'Portfolio introuvable' })
    }

    portfolio.holdings.push({ symbol, name, quantity, purchasePrice, purchaseDate, coinGeckoId: coinGeckoId || null })
    await portfolio.save()

    const holding = portfolio.holdings[portfolio.holdings.length - 1]
    return reply.status(201).send({ holding })
  })

  // PUT /portfolios/:id/holdings/:holdingId — modifier une position
  app.put('/:id/holdings/:holdingId', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id, holdingId } = request.params
    const { symbol, name, quantity, purchasePrice, purchaseDate } = request.body

    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: request.currentUser._id,
    })

    if (!portfolio) {
      return reply.status(404).send({ error: 'Portfolio introuvable' })
    }

    const holding = portfolio.holdings.id(holdingId)
    if (!holding) {
      return reply.status(404).send({ error: 'Position introuvable' })
    }

    if (symbol != null) holding.symbol = symbol
    if (name != null) holding.name = name
    if (quantity != null) holding.quantity = quantity
    if (purchasePrice != null) holding.purchasePrice = purchasePrice
    if (purchaseDate != null) holding.purchaseDate = purchaseDate

    await portfolio.save()

    return reply.send({ holding })
  })

  // DELETE /portfolios/:id/holdings/:holdingId — supprimer une position
  app.delete('/:id/holdings/:holdingId', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id, holdingId } = request.params

    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: request.currentUser._id,
    })

    if (!portfolio) {
      return reply.status(404).send({ error: 'Portfolio introuvable' })
    }

    const holding = portfolio.holdings.id(holdingId)
    if (!holding) {
      return reply.status(404).send({ error: 'Position introuvable' })
    }

    holding.deleteOne()
    await portfolio.save()

    return reply.status(204).send()
  })
}

export default portfolioRoutes
