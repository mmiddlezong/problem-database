import { auth } from "@/auth";
import { getNextProblem, getProblemTex } from "@/utils/problem-utils";

export async function GET() {
    const session = await auth();
    
    if (!session?.user?.email) {
        return Response.json({ error: "not authenticated" }, { status: 403 });
    }
    
    const nextProblem = await getNextProblem();
    if (!nextProblem) {
        return Response.json({ 
            problem: null,
            problemTex: "",
            message: "No more problems available" 
        });
    }
    
    const problemTex = await getProblemTex(nextProblem.contentPath);
    
    return Response.json({
        problem: nextProblem,
        problemTex: problemTex
    });
}