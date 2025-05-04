import mongoose from 'mongoose';

const predictionResultSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  uuid: {
    type: String,
    required: true,
    index: true
  },
  lastProcessedTimestamp: {
    type: Date,
    required: true
  },
  suicideRiskPercent: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true
  },
  modelUsed: {
    type: String,
    enum: ['english', 'marathi'],
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
});

const PredictionResult = mongoose.model('PredictionResult', predictionResultSchema);
export default PredictionResult;