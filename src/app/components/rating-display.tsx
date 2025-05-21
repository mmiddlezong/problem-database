import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export default async function RatingDisplay() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  // Get the user's rating from the database
  const userResult = await db
    .select({ rating: users.rating })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (userResult.length === 0) {
    return <div>User not found</div>;
  }

  const userRating = userResult[0].rating;

  return (
    <div className="bg-slate-800 shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold mb-2 text-white">Your Rating</h2>
      <div className="text-3xl font-bold text-blue-400">{userRating}</div>
    </div>
  );
}