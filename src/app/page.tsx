import MathJaxProvider from "./components/mathjax-provider";
import SignIn from "./components/sign-in";
import ProblemSelector from "./components/problem-selector-client";

async function getProblemTex(problemId = "p1") {
    try {
        const response = await fetch(`http://localhost:3002/api/tex/${problemId}/problem`);
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

async function getAvailableProblems() {
    try {
        const response = await fetch("http://localhost:3002/api/tex");
        if (!response.ok) {
            throw new Error(`Failed to fetch problems list: ${response.status}`);
        }
        const data = await response.json();
        return data.files || [];
    } catch (error) {
        console.error("Error fetching problems list:", error);
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
