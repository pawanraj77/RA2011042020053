const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Define the base URL of John Doe Railways' API
const API_BASE_URL = 'http://20.244.56.144/train/trains';

// Utility function to calculate departure time considering delays
function calculateDepartureWithDelay(departure, delay) {
    const departureTime = new Date(departure);
    departureTime.setMinutes(departureTime.getMinutes() + delay);
    return departureTime;
}

// GET endpoint to fetch and display train schedules
app.get('/trains', async (req, res) => {
    try {
        // Fetch train data from the API
        const response = await axios.get(`${API_BASE_URL}/trains`);
        const trains = response.data;

        const currentTime = new Date();
        const next30Minutes = new Date();
        next30Minutes.setMinutes(next30Minutes.getMinutes() + 30);

        // Filter and sort trains according to requirements
        const relevantTrains = trains.filter(train => {
            const departureTime = calculateDepartureWithDelay(train.departure, train.delay);
            return departureTime > next30Minutes && departureTime < currentTime + 12 * 60 * 60 * 1000;
        }).sort((a, b) => {
            if (a.price === b.price) {
                if (a.availableTickets === b.availableTickets) {
                    const aDeparture = calculateDepartureWithDelay(a.departure, a.delay);
                    const bDeparture = calculateDepartureWithDelay(b.departure, b.delay);
                    return bDeparture - aDeparture;
                }
                return b.availableTickets - a.availableTickets;
            }
            return a.price - b.price;
        });

        // Return the filtered and sorted train data
        res.json(relevantTrains);
    } catch (error) {
        console.error('Error fetching train data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});