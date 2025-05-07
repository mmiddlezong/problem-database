import { boolean, timestamp, pgTable, text, primaryKey, integer, uuid, varchar, pgEnum } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// Problem format enum
export const problemFormatEnum = pgEnum("problem_format", ["short-answer", "proof", "multiple-choice"]);

export const users = pgTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    rating: integer("rating").default(1200).notNull(),
});

export const accounts = pgTable(
    "accounts",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
);

export const sessions = pgTable("sessions", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verification_tokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        {
            compositePk: primaryKey({
                columns: [verificationToken.identifier, verificationToken.token],
            }),
        },
    ]
);

export const authenticators = pgTable(
    "authenticators",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: boolean("credentialBackedUp").notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        {
            compositePK: primaryKey({
                columns: [authenticator.userId, authenticator.credentialID],
            }),
        },
    ]
);

export const problems = pgTable("problems", {
    id: uuid("id").primaryKey().defaultRandom(),
    source: varchar("source", { length: 255 }),
    hyperlink: varchar("hyperlink", { length: 255 }),
    keyphrase: varchar("keyphrase", { length: 255 }),
    contentPath: varchar("content_path", { length: 255 }).notNull(), // Path to TeX file in storage bucket
    format: problemFormatEnum("format").notNull(), // Problem format (short-answer, proof, or multiple-choice)
    answer: text("answer"), // For automatic grading purposes (optional)
    rating: integer("rating").default(1200),
    author: varchar("author", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const problemAttempts = pgTable("problem_attempts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    problemId: uuid("problem_id").references(() => problems.id, {
        onDelete: "set null",
    }),
    userAnswer: text("user_answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    ratingChange: integer("rating_change").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow(),
});

export const ratingHistory = pgTable("rating_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    problemAttemptId: uuid("problem_attempt_id").references(() => problemAttempts.id, { onDelete: "set null" }),
    oldRating: integer("old_rating").notNull(),
    ratingChange: integer("rating_change").notNull(),
    newRating: integer("new_rating").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
});
