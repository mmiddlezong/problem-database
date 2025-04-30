import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { problems } from "./schema";
import { eq } from "drizzle-orm";
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

async function fetchTexMetadata(filename: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tex/${filename}`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching metadata for ${filename}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting database seed...");

  try {
    // Step 1: Get list of all available TeX files
    const texFiles = await fetchAllTexFiles();
    console.log(`Found ${texFiles.length} TeX files to import`);

    // Step 2: Process each file and create problem entries
    for (const filename of texFiles) {
      // Skip processing if we already have this file (using the filename as keyphrase)
      const existingProblem = await db.select().from(problems).where(eq(problems.keyphrase, filename)).limit(1);
      
      if (existingProblem.length > 0) {
        console.log(`Problem ${filename} already exists, skipping...`);
        continue;
      }
      
      // Fetch metadata from API
      const metadata = await fetchTexMetadata(filename);
      
      if (!metadata) {
        console.error(`Failed to fetch metadata for ${filename}, skipping...`);
        continue;
      }
      
      // Extract fields from metadata
      const { source, author, hyperlink, answer, keyphrase } = metadata;
      
      // Insert problem into database
      await db.insert(problems).values({
        source: source || null,
        hyperlink: hyperlink || null,
        keyphrase: keyphrase || null, // Use keyphrase from metadata or null
        contentPath: filename, // Store filename as content path
        answer: answer || null,
        rating: 1200, // Default rating
        author: author || null,
        createdAt: new Date(),
      });
      
      console.log(`Imported problem: ${filename}`);
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