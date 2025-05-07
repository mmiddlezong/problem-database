import MathJaxProvider from "./components/mathjax-provider";
import SignIn from "./components/sign-in";
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
                <div className="bg-slate-900 shadow-lg rounded-lg p-6 mb-6">
                    <MathJaxProvider>
                        <article className="prose prose-invert mx-auto lg:prose-lg p-6 bg-slate-800 rounded-lg border border-slate-600">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: problemTex,
                                }}
                            />
                        </article>
                    </MathJaxProvider>
                </div>
            </main>
        </>
    );
}
