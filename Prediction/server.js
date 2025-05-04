import mongoose from 'mongoose';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Import models
import ChatLog from '../Models/chatLogs.js';
import PredictionResult from '../Models/predictionResult.js';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Initialize log file with timestamp
const logFile = path.join(logsDir, `detector_${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
fs.writeFileSync(logFile, `=== Detector Service Log Started at ${new Date().toISOString()} ===\n\n`);

// Enhanced logging function
const log = (message, level = 'INFO', toConsole = true) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  // Write to log file
  fs.appendFileSync(logFile, logMessage + '\n');
  
  // Also log to console if requested
  if (toConsole) {
    if (level === 'ERROR') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }
};

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    log(`Error connecting to MongoDB: ${error.message}`, 'ERROR');
    process.exit(1);
  }
};

// Function to check if text contains Marathi characters
const containsMarathiOrHindi = (text) => {
  // Range for Devanagari script (includes Hindi, Marathi, and other Indian languages)
  const devanagariRange = /[\u0900-\u097F]/;
  return devanagariRange.test(text);
};

// Function to run prediction on text using the appropriate model
const runPrediction = (text, useMarathiModel = false) => {
  return new Promise((resolve, reject) => {
    // Determine which script to use
    const scriptPath = path.join(__dirname, useMarathiModel ? 'predict_marathi.py' : 'predict.py');
    const scriptName = useMarathiModel ? 'predict_marathi.py' : 'predict.py';
    
    log(`Running prediction using ${scriptName}`);
    log(`Text length: ${text.length} characters`, 'DEBUG', false);
    
    // Log a snippet of the text (first 200 chars) to avoid excessive logging
    const textSnippet = text.length > 200 ? text.substring(0, 200) + '...' : text;
    log(`Text snippet: ${textSnippet}`, 'DEBUG', false);
    
    const pythonProcess = spawn('python3', [scriptPath]);
    
    let outputData = '';
    let errorData = '';

    // Send text to stdin
    pythonProcess.stdin.write(text + '\n');
    pythonProcess.stdin.write('END\n\n');
    pythonProcess.stdin.end();

    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect stderr data
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      log(`Python error output: ${data.toString()}`, 'ERROR');
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        log(`Python process exited with code ${code}`, 'ERROR');
        log(`Full error output: ${errorData}`, 'ERROR');
        reject(new Error(`Python process failed with code ${code}`));
        return;
      }

      try {
        // Log the full Python output to log file (but not console)
        log(`Full Python output: ${outputData}`, 'DEBUG', false);
        
        // Parse prediction results from output
        const predictionMatch = outputData.match(/Prediction: (suicide|non-suicide)/i);
        const confidenceMatch = outputData.match(/Confidence: (\d+\.\d+)%/);
        
        if (!predictionMatch || !confidenceMatch) {
          log('Failed to parse prediction output', 'ERROR');
          log(`Output was: ${outputData}`, 'ERROR');
          reject(new Error('Failed to parse prediction output'));
          return;
        }

        const predictionType = predictionMatch[1].toLowerCase();
        let confidence = parseFloat(confidenceMatch[1]);

        // Calculate suicide risk percentage
        let suicideRiskPercent;
        if (predictionType === 'suicide') {
          suicideRiskPercent = confidence;
        } else {
          // If non-suicide, invert the confidence as requested
          suicideRiskPercent = 100 - confidence;
        }

        log(`Prediction result: ${predictionType}, Confidence: ${confidence}%, Risk: ${suicideRiskPercent}%`);
        
        resolve({
          suicideRiskPercent,
          predictionType,
          modelUsed: useMarathiModel ? 'marathi' : 'english'
        });
      } catch (error) {
        log(`Error parsing prediction output: ${error}`, 'ERROR');
        reject(error);
      }
    });
  });
};

// Function to determine risk level based on percentage
const getRiskLevel = (percentage) => {
  if (percentage >= 70) return 'high';
  if (percentage >= 40) return 'moderate';
  return 'low';
};

// Main function to process all chats
const processAllChats = async () => {
  try {
    log('Starting chat processing...');
    
    // Get all chat logs
    const chatLogs = await ChatLog.find({}).sort({ timestamp: -1 });
    log(`Found ${chatLogs.length} chat logs to process`);
    
    for (const chatLog of chatLogs) {
      try {
        log(`Processing UUID: ${chatLog.uuid}, IP: ${chatLog.ipAddress || 'N/A'}`);
        
        // Check if we need to process this chat log
        const existingPrediction = await PredictionResult.findOne({ 
          uuid: chatLog.uuid,
          ipAddress: chatLog.ipAddress
        }).sort({ lastProcessedTimestamp: -1 });
        
        // Skip if already processed and no newer messages
        if (existingPrediction && 
            existingPrediction.lastProcessedTimestamp >= chatLog.timestamp) {
          log(`Skipping ${chatLog.uuid} - already processed at ${existingPrediction.lastProcessedTimestamp.toISOString()}`);
          continue;
        }
        
        // Combine all chat history into one string
        const fullText = chatLog.chatHistory.join(' ');
        log(`Processing chat log for ${chatLog.uuid} with ${chatLog.chatHistory.length} messages, total length: ${fullText.length} chars`);
        
        // Check if text contains Marathi characters
        const useMarathiModel = containsMarathiOrHindi(fullText);
        log(`Using ${useMarathiModel ? 'Marathi' : 'English'} model for prediction`);
        
        // Run prediction
        const predictionResult = await runPrediction(fullText, useMarathiModel);
        
        // Determine risk level
        const riskLevel = getRiskLevel(predictionResult.suicideRiskPercent);
        
        // Update chat log with prediction results
        chatLog.suicideRiskPercent = predictionResult.suicideRiskPercent;
        chatLog.riskLevel = riskLevel;
        await chatLog.save();
        log(`Updated ChatLog with suicideRiskPercent: ${predictionResult.suicideRiskPercent}%, riskLevel: ${riskLevel}`);
        
        // Save prediction result
        const newPrediction = await PredictionResult.create({
          ipAddress: chatLog.ipAddress,
          uuid: chatLog.uuid,
          lastProcessedTimestamp: chatLog.timestamp,
          suicideRiskPercent: predictionResult.suicideRiskPercent,
          riskLevel: riskLevel,
          modelUsed: predictionResult.modelUsed
        });
        log(`Created PredictionResult record: ${newPrediction._id}`);
        
        log(`Successfully processed ${chatLog.uuid}: Risk ${predictionResult.suicideRiskPercent.toFixed(2)}%, Level: ${riskLevel}, Model: ${predictionResult.modelUsed}`);
      } catch (error) {
        log(`Error processing chat log ${chatLog.uuid}: ${error}`, 'ERROR');
        // Continue with next chat log
      }
    }
    
    log('Finished processing all chat logs');
  } catch (error) {
    log(`Error in processAllChats: ${error}`, 'ERROR');
  }
};

/**
 * Detector Service
 * 
 * This service periodically processes all conversations in the database 
 * using the DL model to detect suicide risk.
 * 
 * Environment variables:
 * - MONGO_URI: MongoDB connection string (required)
 * - PROCESSING_INTERVAL_MINUTES: Interval between processing runs (default: 15)
 * - GOOGLE_API_KEY: API key for Google's services (required for Marathi/Hindi detection)
 */
const startDetectorService = async (intervalMinutes = 15) => {
  try {
    // Log startup information
    log(`Starting Detector Service with ${intervalMinutes} minute interval`);
    log(`Log file: ${logFile}`);
    
    // Connect to the database
    await connectDB();
    
    log(`Detector service started. Will process chats every ${intervalMinutes} minutes.`);
    
    // Process chats on startup
    await processAllChats();
    
    // Schedule periodic processing
    const intervalId = setInterval(async () => {
      log('Running scheduled chat processing...');
      await processAllChats();
    }, intervalMinutes * 60 * 1000);
    
    // Handle shutdown
    process.on('SIGINT', () => {
      log('Received SIGINT. Gracefully shutting down...', 'INFO');
      clearInterval(intervalId);
      log('Detector service stopped.', 'INFO');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      log('Received SIGTERM. Gracefully shutting down...', 'INFO');
      clearInterval(intervalId);
      log('Detector service stopped.', 'INFO');
      process.exit(0);
    });
    
  } catch (error) {
    log(`Error starting detector service: ${error}`, 'ERROR');
    process.exit(1);
  }
};

// Set interval from environment variable or use default
const PROCESSING_INTERVAL_MINUTES = parseInt(process.env.PROCESSING_INTERVAL_MINUTES || '15');

// Start the service
startDetectorService(PROCESSING_INTERVAL_MINUTES);