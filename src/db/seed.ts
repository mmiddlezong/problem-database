import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { problems } from "./schema";
import "@/../envConfig"

// Set up database connection specifically for the seed script
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// API endpoint
const API_BASE_URL = "http://localhost:3002";

async function fetchAllTexFiles() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tex`);
    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error("Error fetching TeX files:", error);
    return [];
  }
}

async function fetchTexMetadata(filePath: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tex`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePath: filePath })
    });
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching metadata for ${filePath}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting database seed...");

  try {
    // Step 0: Wipe the existing problems table
    console.log("Clearing existing problems from database...");
    await db.delete(problems);
    console.log("Problems table cleared successfully.");

    // Step 1: Get list of all available TeX files
    const texFiles = await fetchAllTexFiles();
    console.log(`Found ${texFiles.length} TeX files to import`);

    // Step 2: Process each file and create problem entries
    for (const filePath of texFiles) {
      
      // Fetch metadata from API
      const metadata = await fetchTexMetadata(filePath);
      
      if (!metadata) {
        console.error(`Failed to fetch metadata for ${filePath}, skipping...`);
        continue;
      }
      
      // Extract fields from metadata
      const { source, author, hyperlink, answer, keyphrase, format } = metadata;
      
      // Create values object for insertion
      const problemValues = {
        source: source || null,
        hyperlink: hyperlink || null,
        keyphrase: keyphrase || null, // Use keyphrase from metadata or null
        contentPath: filePath, // Store filePath as content path
        format: format || "short-answer", // Use format from metadata or default to short-answer
        answer: answer || null,
        rating: 1200, // Default rating
        author: author || null,
        createdAt: new Date(),
      };
      
      // Print values for debugging
      console.log(`Problem values for ${filePath}:`, JSON.stringify(problemValues, null, 2));
      
      // Insert problem into database
      await db.insert(problems).values(problemValues);
      
      console.log(`Imported problem: ${filePath}`);
    }

    console.log("Database seed completed successfully!");
    return;
  } finally {
    // Clean up: Close the database connection
    await client.end();
  }
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Error during seed:", error);
  process.exit(1);
});