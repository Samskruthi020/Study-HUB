import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../resources.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const resources = JSON.parse(data);
    res.json(resources);
});

// Placeholder: Will create backend/routes/execute.js for Judge0 code execution proxy.

export default router;
