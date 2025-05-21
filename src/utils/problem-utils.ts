import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { problems, problemAttempts, users } from "@/db/schema";
import { eq, and, isNull, sql, gte, lte } from "drizzle-orm";
import 'server-only';

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
        .map((paragraph) => paragraph.trim()) // Trim each paragraph
        .filter((paragraph) => paragraph) // Remove empty paragraphs
        .map((paragraph) => `<p>${paragraph}</p>`) // Wrap each paragraph in <p> tags
        .join("\n"); // Join back with newlines for readability
}

/**
 * Fetches a problem's LaTeX content by its path
 * Note: This only fetches the problem statement, not the solution
 * @param filePath The path of the problem to fetch
 * @returns The LaTeX content of the problem
 */
export async function getProblemTex(filePath: string) {
    try {
        // Add authorization header to secure this endpoint
        const API_SECRET_KEY = process.env.API_SECRET_KEY || "secure-api-key-replace-in-production";
        
        const response = await fetch(`${API_BASE_URL}/api/tex/problem`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_SECRET_KEY}`
            },
            body: JSON.stringify({ filePath: filePath }),
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
 * Fetches a problem's metadata and bodies by its path
 * SECURITY: This function should only be called from server-side code as it contains solutions.
 * @param filePath The path of the problem to fetch
 * @returns The full object for the problem
 */
export async function getProblemFull(filePath: string) {
    try {
        // Add authorization header to secure this endpoint
        const API_SECRET_KEY = process.env.API_SECRET_KEY || "secure-api-key-replace-in-production";
        
        const response = await fetch(`${API_BASE_URL}/api/tex`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_SECRET_KEY}`
            },
            body: JSON.stringify({ filePath: filePath }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch full problem: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching full problem for ${filePath}:`, error);
        return null;
    }
}

export async function getNextProblem() {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error(`User is not authenticated`);
        }
        if (!session.user.email) {
            throw new Error(`User does not have an email`);
        }

        // Get the user's ID and rating
        const userResult = await db.select({ id: users.id, rating: users.rating }).from(users).where(eq(users.email, session.user.email)).limit(1);
        if (userResult.length === 0) {
            throw new Error(`User not found in database`);
        }

        const userId = userResult[0].id;
        const userRating = userResult[0].rating;

        const ratingWindowLower = 50;
        const ratingWindowUpper = 100;

        const minProblemRating = userRating - ratingWindowLower; // e.g., 1400
        const maxProblemRating = userRating + ratingWindowUpper; // e.g., 1700

        const nextProblemResult = await db
            .select({
                id: problems.id,
                source: problems.source,
                contentPath: problems.contentPath,
                format: problems.format,
                rating: problems.rating,
            })
            .from(problems)
            .leftJoin(
                problemAttempts,
                and(
                    // The ON condition for the join
                    eq(problems.id, problemAttempts.problemId),
                    eq(problemAttempts.userId, userId) // Crucially, filter by user_id in the JOIN condition
                )
            )
            .where(
                and(
                    // Combine all WHERE conditions
                    isNull(problemAttempts.problemId), // Condition 1: Unattempted by this user
                    gte(problems.rating, minProblemRating), // Condition 2: Problem rating >= minProblemRating
                    lte(problems.rating, maxProblemRating) // Condition 3: Problem rating <= maxProblemRating
                )
            ) // Optional: Add ordering and limit if you want a specific number or random selection
            .orderBy(sql`RANDOM()`) // For example, get a random one within the range
            .limit(1); // For example, get just one

        if (nextProblemResult.length > 0) {
            return nextProblemResult[0];
        }

        const nextProblemResult2 = await db
            .select({
                id: problems.id,
                source: problems.source,
                contentPath: problems.contentPath,
                format: problems.format,
                rating: problems.rating,
            })
            .from(problems)
            .leftJoin(
                problemAttempts,
                and(
                    // The ON condition for the join
                    eq(problems.id, problemAttempts.problemId),
                    eq(problemAttempts.userId, userId) // Crucially, filter by user_id in the JOIN condition
                )
            )
            .where(
                and(
                    // Combine all WHERE conditions
                    isNull(problemAttempts.problemId) // Condition 1: Unattempted by this user
                )
            )
            .orderBy(sql`ABS(${problems.rating} - ${userRating})`)
            .limit(1);

        return nextProblemResult2[0] || null;
    } catch (error) {
        console.error(`Error fetching next problem:`, error);
        return null;
    }
}
