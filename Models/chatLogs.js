import mongoose from 'mongoose';

//NLP SUCIDE DETECTION WILL NOT WORK IN MULTIUSER ENVIRONMENT WITH THIS SCHEMA
//WON'T BE ABLE TO STORE CONTEXT OF CHATS IN MUTLIUSER ENV
const chatLogsSchema = new mongoose.Schema({
  uuid:{
    type:String,
    required : true
  },
  chatHistory: {
    type:[String],
    required: true,
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    city: { type: String },
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatLog = mongoose.model('ChatLog', chatLogsSchema);
export default ChatLog;
