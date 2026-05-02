const axios = require('axios');

function convertMinutesToDateString(minutes, addDays = 0) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const now = new Date();
    now.setHours(hours, mins, 0, 0);
    if (addDays) {
        now.setDate(now.getDate() + addDays);
    }
    return now.toISOString();
}

/**
 * Service to fetch live train data from RailRadar API.
 */
exports.searchLiveTrains = async (source, destination, date) => {
    try {
        const apiKey = process.env.RAILRADAR_API_KEY;
        if (!apiKey) {
            console.log('No RailRadar API Key found. Falling back to DB.');
            return null;
        }

        // Station code mapping for cities used in the frontend
        const stationMapping = {
            "Agra": "AGC",
            "Ahmedabad": "ADI",
            "Bangalore": "SBC",
            "Bhopal": "BPL",
            "Chennai": "MAS",
            "Hyderabad": "HYB",
            "Jaipur": "JP",
            "Kolkata": "HWH",
            "Lucknow": "LKO",
            "Mumbai": "CSMT",
            "New Delhi": "NDLS",
            "Patna": "PNBE",
            "Pune": "PUNE",
            "Varanasi": "BSB"
        };

        const fromCode = stationMapping[source] || source;
        const toCode = stationMapping[destination] || destination;
        
        // Format date to DD-MM-YYYY if it exists
        let journeyDate = date;
        if (date) {
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                journeyDate = `${day}-${month}-${year}`;
            }
        }

        // Correct RailRadar API Endpoint
        const apiUrl = 'https://api.railradar.org/api/v1/trains/between';
        
        const apiParams = { from: fromCode, to: toCode };
        if (journeyDate) {
            apiParams.date = journeyDate;
        }
        
        const response = await axios.get(apiUrl, {
            params: apiParams,
            headers: {
                'x-api-key': apiKey,
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        // Mapping RailRadar response to internal Train format
        if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.trains)) {
            return response.data.data.trains.map(t => ({
                _id: `live_${t.trainNumber}`,
                name: t.trainName,
                number: t.trainNumber,
                source: t.sourceStationName || source,
                destination: t.destinationStationName || destination,
                departureTime: convertMinutesToDateString(t.fromStationSchedule?.departureMinutes || 600, (t.fromStationSchedule?.day || 1) - 1),
                arrivalTime: convertMinutesToDateString(t.toStationSchedule?.arrivalMinutes || 1200, (t.toStationSchedule?.day || 1) - 1),
                totalSeats: 400, // API might not provide seats, using default
                availableSeats: Math.floor(Math.random() * 100) + 10,
                basePrice: 500, // Default price for live data
                isLive: true
            }));
        }

        return null;
    } catch (error) {
        console.error('RailRadar API Error:', error.response?.data?.message || error.message);
        return null;
    }
};

exports.getLiveStatus = async (trainNumber) => {
    const generateMockStatus = (tn) => {
        const statuses = ["On Time", "Slight Delay", "Running Late", "Halted at Signal"];
        const locations = ["Agra Cantt", "Bhopal Jn", "Itarsi Jn", "Nagpur", "Balharshah", "Vijayawada Jn"];
        const nextLocations = ["Bhopal Jn", "Itarsi Jn", "Nagpur", "Balharshah", "Vijayawada Jn", "Chennai Central"];
        
        const locIdx = Math.floor(Math.random() * locations.length);
        const isBetween = Math.random() > 0.5;
        
        let currentLocation = locations[locIdx];
        let statusMessage = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (isBetween) {
            currentLocation = `Running between ${locations[locIdx]} and ${nextLocations[locIdx]}`;
            statusMessage = "En Route";
        }

        return {
            trainNumber: tn,
            currentLocation,
            delayMinutes: Math.floor(Math.random() * 45),
            statusMessage,
            lastUpdated: new Date().toLocaleString()
        };
    };

    try {
        const apiKey = process.env.RAILRADAR_API_KEY;
        if (!apiKey) return generateMockStatus(trainNumber);

        const apiUrl = `https://api.railradar.org/api/v1/trains/${trainNumber}`;
        const response = await axios.get(apiUrl, {
            headers: { 'x-api-key': apiKey },
            timeout: 3000
        });
        
        if (response.data && response.data.success) {
            return {
                trainNumber,
                currentLocation: response.data.data.currentStationName || "En Route",
                delayMinutes: response.data.data.delayInMinutes || 0,
                statusMessage: response.data.data.statusAsOf || "Running on time",
                lastUpdated: new Date().toLocaleString()
            };
        }
        return generateMockStatus(trainNumber);
    } catch (e) {
        return generateMockStatus(trainNumber);
    }
};
