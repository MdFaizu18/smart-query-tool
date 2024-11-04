// scrapeAndAnswer.js

import axios from 'axios';
import dotenv from 'dotenv'; // Correct import statement
dotenv.config(); // Load environment variables from .env file
import puppeteer from 'puppeteer';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/deepset/bert-large-uncased-whole-word-masking-squad2';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

async function fetchWithRetry(url, payload, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` }
            });
        } catch (error) {
            if (i === retries - 1 || !error.response) throw error; // Throw if it's the last retry or no response

            if (error.response && error.response.data.error.includes("currently loading")) {
                console.log(`Model is loading, retrying... (${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
            } else {
                throw error; // Other errors should be thrown
            }
        }
    }
}

async function fetchContextFromUrls(urls) {
    const contexts = [];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const url of urls) {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Example of extracting specific content
        const content = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h2, p')).map(element => element.innerText).join(' ');
        });

        contexts.push(content);
    }

    await browser.close();
    return contexts.join(' '); // Join all contexts together
}


export async function scrapeAndAnswer(url, question) {
    try {
        const context = await fetchContextFromUrls(url);
        const payload = {
            inputs: { question, context }
        };

        const response = await fetchWithRetry(HUGGING_FACE_API_URL, payload); // Use the retry function

        const answer = response.data?.answer || response.data?.answers[0]?.text || 'No answer found';
        return { answer, sources: url ? [url] : ["https://example.com"] };
    } catch (error) {
        console.error('Error in scrapeAndAnswer:', error.response ? error.response.data : error.message);
        throw new Error('Failed to retrieve data from Hugging Face API');
    }
}
