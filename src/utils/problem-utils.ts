// API endpoint
const API_BASE_URL = "http://localhost:3002";

/**
 * Fetches a problem's LaTeX content by its ID
 * @param problemId The ID of the problem to fetch
 * @returns The LaTeX content of the problem
 */
export async function getProblemTex(problemId = "p1") {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tex/${problemId}/problem`);
        if (!response.ok) {
            throw new Error(`Failed to fetch problem: ${response.status}`);
        }
        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error("Error fetching problem:", error);
        return "Error loading problem.";
    }
}

/**
 * Fetches a problem's metadata and bodies by its ID
 * @param problemId The ID of the problem to fetch
 * @returns The full object for the problem
 */
export async function getProblemFull(problemId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tex/${problemId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch full problem bodies: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching full problem bodies for ${problemId}:`, error);
        return null;
    }
}