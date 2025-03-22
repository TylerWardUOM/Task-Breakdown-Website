export const fetchApiKey = async () => {
    const response = await fetch('/api/openAIkey', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // Prevent caching issues
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    try {
        const data = await response.json(); // Directly parse JSON now
        if (!data.key) {
            throw new Error('API key is missing in response');
        }
        console.log("Fetched API Key:", data.key);
        return data.key;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error('Invalid JSON response');
    }
};
