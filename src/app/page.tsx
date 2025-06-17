import SignIn from "./components/sign-in";
import ProblemWrapper from "./components/problem-wrapper";
import RatingDisplay from "./components/rating-display";
import { getNextProblem, getProblemTex } from "@/utils/problem-utils";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Get the user's rating from the database
    const userResult = await db
        .select({ rating: users.rating })
        .from(users)
        .where(eq(users.email, session.user.email!))
        .limit(1);

    if (userResult.length === 0) {
        return <div>User not found</div>;
    }

    const initialRating = userResult[0].rating;

    const nextProblem = await getNextProblem();
    let problemTex = "";
    if (nextProblem) {
        problemTex = await getProblemTex(nextProblem.contentPath);
    }

    return (
        <>
            <header className="p-4 bg-slate-800 shadow-md mb-6">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Math Problem Database</h1>
                    Signed in as {session.user.email}
                </div>
            </header>

            <main className="container mx-auto px-4">
                {nextProblem ? (
                    <ProblemWrapper 
                        problem={nextProblem} 
                        problemTex={problemTex} 
                        initialRating={initialRating}
                    />
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/4">
                            <RatingDisplay rating={initialRating} />
                        </div>
                        <div className="md:flex-1">
                            <div className="bg-slate-800 shadow-md rounded-lg p-6 text-center">
                                <h2 className="text-2xl font-bold text-white mb-4">Congratulations!</h2>
                                <p className="text-gray-300">You have finished all the problems in our database.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
