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

      let predictedRating = 1200;

      // Initial rating alignment:
      // AoPS wiki rating 1 (AMC 10 early) is 1000, AoPS wiki rating 10 (hardest IMO) is 3000
      
      // For AMC problems, calculate rating based on problem number
      if (source && source.match(/AMC\s+10[AB]\s+\d{4}\/\d+/)) {
        // Extract problem number after the slash
        const match = source.match(/\/(\d+)$/);
        // Extract year from the source
        const yearMatch = source.match(/AMC\s+10[AB]\s+(\d{4})/);
        
        if (match && match[1]) {
          const problemNumber = parseInt(match[1], 10);
          // AMC 10 problems typically increase in difficulty
          // Problem #1 is around 1000, Problem #25 is around 1750
          // Linear scaling between these points
          predictedRating = 1000 + (problemNumber - 1) * (1750 - 1000) / 24;
          
          // Apply year-based rating adjustments
          if (yearMatch && yearMatch[1]) {
            const year = parseInt(yearMatch[1], 10);
            if (year < 2000) {
              predictedRating -= 100; // Subtract 100 for problems before 2000
            } else if (year < 2010) {
              predictedRating -= 50; // Subtract 50 for problems between 2000-2009
            }
          }
          
          console.log(`AMC problem ${source} - Problem #${problemNumber} - Rating: ${predictedRating.toFixed(0)}`);
        }
      }
      if (source && source.match(/AMC\s+12[AB]\s+\d{4}\/\d+/)) {
        // Extract problem number after the slash
        const match = source.match(/\/(\d+)$/);
        // Extract year from the source
        const yearMatch = source.match(/AMC\s+12[AB]\s+(\d{4})/);
        
        if (match && match[1]) {
          const problemNumber = parseInt(match[1], 10);
          // AMC 12 problems typically increase in difficulty
          // Problem #1 is around 1100, Problem #25 is around 2000
          // Linear scaling between these points
          predictedRating = 1100 + (problemNumber - 1) * (2000 - 1100) / 24;
          
          // Apply year-based rating adjustments
          if (yearMatch && yearMatch[1]) {
            const year = parseInt(yearMatch[1], 10);
            if (year < 2000) {
              predictedRating -= 100; // Subtract 100 for problems before 2000
            } else if (year < 2010) {
              predictedRating -= 50; // Subtract 50 for problems between 2000-2009
            }
          }
          
          console.log(`AMC problem ${source} - Problem #${problemNumber} - Rating: ${predictedRating.toFixed(0)}`);
        }
      }
      
      predictedRating = Math.round(predictedRating);
      
      // Create values object for insertion
      const problemValues = {
        source: source || null,
        hyperlink: hyperlink || null,
        keyphrase: keyphrase || null, // Use keyphrase from metadata or null
        contentPath: filePath, // Store filePath as content path
        format: format || "short-answer", // Use format from metadata or default to short-answer
        answer: answer || null,
        rating: predictedRating, // Use predicted rating based on problem source
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