const { Worker } = require('worker_threads');
const path = require('path');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workerPath = path.join(__dirname, '../workers/uploadWorker.js');
    const worker = new Worker(workerPath, {
      workerData: { 
        fileBuffer: req.file.buffer,
        originalname: req.file.originalname
      }
    });

    worker.on('message', (message) => {
      if (message.success) {
        return res.status(200).json({ 
          success: true, 
          message: 'Upload completed successfully', 
          inserted: message.inserted 
        });
      } else {
        return res.status(500).json({ success: false, message: message.error });
      }
    });

    worker.on('error', (error) => {
      if (!res.headersSent) {
        return res.status(500).json({ success: false, message: error.message });
      }
    });

    worker.on('exit', (code) => {
      if (code !== 0 && !res.headersSent) {
        return res.status(500).json({ success: false, message: `Worker stopped with exit code ${code}` });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
