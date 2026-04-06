import mongoose from 'mongoose'

const { Schema } = mongoose

const holdingSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  coinGeckoId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
})

const portfolioSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  holdings: {
    type: [holdingSchema],
    default: [],
  },
}, {
  timestamps: true,
})

export default mongoose.model('Portfolio', portfolioSchema)
