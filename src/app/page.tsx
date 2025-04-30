import MathJaxProvider from "./components/mathjax-provider";
import SignIn from "./components/sign-in";
import ProblemSelector from "./components/problem-selector";
import { getProblemTex } from "@/utils/problem-utils";
import { db } from "@/db/drizzle";
import { problems } from "@/db/schema";

/**
 * Gets all available problems from the database
 * @returns An array of problem content paths (filenames)
 */
async function getAvailableProblems() {
    try {
        // Query the database for all problems, returning only the contentPath field
        const result = await db.select({ path: problems.contentPath })
            .from(problems)
            .orderBy(problems.createdAt);
        
        // Extract the contentPath values into a string array
        return result.map(problem => problem.path);
    } catch (error) {
        console.error("Error fetching problems from database:", error);
        return [];
    }
}

export default async function Home() {
    const problemTex = await getProblemTex();
    const availableProblems = await getAvailableProblems();
    
    return (
        <>
            <header className="p-4 bg-slate-800 shadow-md mb-6">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Math Problem Database</h1>
                    <SignIn />
                </div>
            </header>
            
            <main className="container mx-auto px-4">
                <div className="bg-slate-900 shadow-lg rounded-lg p-6 mb-6">
                    <MathJaxProvider>
                        <ProblemSelector 
                            problems={availableProblems}
                            initialProblemTex={problemTex}
                        />
                    </MathJaxProvider>
                </div>
            </main>
        </>
    );
}
