import SignIn from "./components/sign-in";
import ProblemDisplay from "./components/problem-display";
import RatingDisplay from "./components/rating-display";
import AnswerSubmission from "./components/answer-submission";
import { getNextProblem, getProblemTex } from "@/utils/problem-utils";
import { auth } from "@/auth";

export default async function Home() {
    const session = await auth();
    if (!session?.user) {
        return (
            <>
                <header className="p-4 bg-slate-800 shadow-md mb-6">
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold text-white">Math Problem Database</h1>
                        <SignIn />
                    </div>
                </header>
                <div>please log in!</div>
            </>
        );
    }

    const nextProblem = await getNextProblem();
    if (!nextProblem) {
        return <div>No problem found.</div>;
    }
    const problemTex = await getProblemTex(nextProblem.contentPath);

    return (
        <>
            <header className="p-4 bg-slate-800 shadow-md mb-6">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Math Problem Database</h1>
                    <SignIn />
                </div>
            </header>

            <main className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4">
                        <RatingDisplay />
                    </div>
                    <div className="md:flex-1">
                        <ProblemDisplay problem={nextProblem} problemTex={problemTex} />
                        <div className="mt-6">
                            <AnswerSubmission problemId={nextProblem.id} />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
