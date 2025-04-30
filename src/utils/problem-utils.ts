// API endpoint
const API_BASE_URL = "http://localhost:3002";

/**
 * Processes LaTeX content to handle paragraph breaks properly
 * @param content The raw LaTeX content
 * @returns Processed LaTeX content with proper HTML paragraph breaks
 */
export function processLatexContent(content: string): string {
    // Replace double newlines with paragraph breaks
    // This converts LaTeX paragraph breaks to HTML paragraph elements
    return content
        .split(/\n\s*\n/) // Split by empty lines (one or more newlines with optional whitespace)
        .map(paragraph => paragraph.trim()) // Trim each paragraph
        .filter(paragraph => paragraph) // Remove empty paragraphs
        .map(paragraph => `<p>${paragraph}</p>`) // Wrap each paragraph in <p> tags
        .join('\n'); // Join back with newlines for readability
}

/**
 * Fetches a problem's LaTeX content by its ID
 * @param problemId The ID of the problem to fetch
 * @returns The LaTeX content of the problem
 */
export async function getProblemTex(problemId = "p1") {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tex/problem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: problemId })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch problem: ${response.status}`);
        }
        
        const data = await response.json();
        // Process the content to handle paragraph breaks
        return processLatexContent(data.problem);
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
        const response = await fetch(`${API_BASE_URL}/api/tex`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: problemId })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch full problem: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error fetching full problem for ${problemId}:`, error);
        return null;
    }
}