import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users, problemAttempts, problems, ratingHistory } from "@/db/schema";
import { getProblemFull } from "@/utils/problem-utils";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const body = await request.json();
    const userAnswer = body.answer;
    const problemId = body.problemId;
    const session = await auth();
    
    if (!session?.user?.email) {
        return Response.json({ error: "not authenticated"}, { status: 403 });
    }
    
    // Get the user's ID and rating from the database based on their email
    const userResult = await db
        .select({ id: users.id, rating: users.rating })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
    
    if (userResult.length === 0) {
        return Response.json({ error: "user not found" }, { status: 404 });
    }
    
    const userId = userResult[0].id;
    const userRating = userResult[0].rating;
    
    // Check if the user has already attempted this problem
    const existingAttempt = await db
        .select({ id: problemAttempts.id })
        .from(problemAttempts)
        .where(
            and(
                eq(problemAttempts.userId, userId),
                eq(problemAttempts.problemId, problemId)
            )
        )
        .limit(1);
    
    // If the user has already attempted this problem, don't process the new attempt
    if (existingAttempt.length > 0) {
        return Response.json({ 
            code: "problem-already-attempted",
        });
    }
    
    // Fetch the problem to get the correct answer and current rating
    const problemResult = await db
        .select({ 
            answer: problems.answer,
            rating: problems.rating,
            contentPath: problems.contentPath,
        })
        .from(problems)
        .where(eq(problems.id, problemId))
        .limit(1);
    
    if (problemResult.length === 0) {
        return Response.json({ error: "problem not found" }, { status: 404 });
    }
    
    const correctAnswer = problemResult[0].answer;
    const problemRating = problemResult[0].rating || 1200; // Default to 1200 if not set
    
    // Check if the user's answer is correct
    // Note: In a real app, you might want to do more sophisticated comparison 
    // (ignoring case, whitespace, etc.) depending on the problem type
    const isCorrect = userAnswer?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase();
    
    // For a simple implementation, use a fixed rating change
    // In a real ELO system, you would calculate this based on user and problem ratings
    const ratingChange = isCorrect ? 10 : -10;
    
    // Update user rating
    const newUserRating = userRating + ratingChange;
    await db
        .update(users)
        .set({ rating: newUserRating })
        .where(eq(users.id, userId));
    
    // Record the attempt
    const attemptResult = await db
        .insert(problemAttempts)
        .values({
            userId: userId,
            problemId: problemId,
            userAnswer: userAnswer || "",
            isCorrect: isCorrect,
            ratingChange: ratingChange,
        })
        .returning({ id: problemAttempts.id });
    
    // Record the rating history for the user
    await db
        .insert(ratingHistory)
        .values({
            userId: userId,
            problemAttemptId: attemptResult[0].id,
            oldRating: userRating,
            ratingChange: ratingChange,
            newRating: newUserRating,
        });

    const problemFull = await getProblemFull(problemResult[0].contentPath);
    
    revalidatePath("/");
    
    return Response.json({ 
        code: "answer-submitted",
        isCorrect: isCorrect,
        ratingChange: ratingChange,
        newRating: newUserRating,
        correctAnswer: correctAnswer,
        content: problemFull,
    });
}