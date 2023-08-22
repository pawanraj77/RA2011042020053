const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/numbers', async (req, res) => {
    const urls = req.query.url;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'Invalid URL(s)' });
    }

    const requests = urls.map(async (url) => {
        try {
            const response = await axios.get(url, { timeout: 500 });
            return response.data.numbers || [];
        } catch (error) {
            // Ignore timeouts or invalid responses
            return [];
        }
    });

    try {
        const results = await Promise.all(requests);
        const mergedNumbers = results.reduce((merged, numbers) => merged.concat(numbers), []);
        const uniqueSortedNumbers = Array.from(new Set(mergedNumbers)).sort((a, b) => a - b);

        return res.json({ numbers: uniqueSortedNumbers });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
