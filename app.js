// server.js (or your main server file)
import express from 'express';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import { scrapeAndAnswer } from './scrapeAndAnswer.js';

dotenv.config();
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

console.log('Hugging Face API Key:', process.env.HUGGING_FACE_API_KEY ? 'Loaded' : 'Missing');

const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve static files
app.use(express.static(path.resolve(__dirname, './public')));

// Handle all other routes with React's index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './public', 'index.html'));
});

app.post('/api/process', async (req, res) => {
    const { urls, question } = req.body; // Ensure 'urls' is correctly named here
    console.log('Received Request:', { urls, question });

    try {
        if (!urls || urls.length === 0) {
            throw new Error('No URLs provided.');
        }
        const { answer, sources } = await scrapeAndAnswer(urls, question);
        console.log('Returning Answer:', answer);
        res.json({ answer, sources });
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the request. Please try again later.' });
    }
});

app.post('/api/test', async (req, res) => {
    try {
        const { answer, sources } = await scrapeAndAnswer(); // This will use default static question and context
        res.json({ answer, sources });
    } catch (error) {
        console.error('Error in test endpoint:', error.message);
        res.status(500).json({ error: 'An error occurred while testing the Hugging Face API.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
