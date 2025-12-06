import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'rankings-data.json');

app.use(express.json());

// API Endpoints
app.get('/api/rankings', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading data file:", err);
      res.status(500).json({ error: "Failed to read data" });
    }
  } else {
    // Return empty state or null if no data yet
    res.json(null);
  }
});

app.post('/api/rankings', (req, res) => {
  try {
    const data = JSON.stringify(req.body);
    fs.writeFileSync(DATA_FILE, data);
    res.json({ success: true, timestamp: Date.now() });
  } catch (err) {
    console.error("Error writing data file:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Handle client-side routing by serving index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log("Dist directory not found. Make sure to run 'npm run build' first.");
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
