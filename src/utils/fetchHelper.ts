// Helper function for authenticated fetching
export async function fetchWithAuth<T>(url: string, accessToken: string): Promise<T> {

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        // Optional: Add cache configuration
        cache: 'no-store', // or 'force-cache' depending on your needs
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from ${url}`);
    }

    return response.json();
}