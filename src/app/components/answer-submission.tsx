"use client";

import { useState } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

type AnswerSubmissionProps = {
    problemId: string;
};

export default function AnswerSubmission({ problemId }: AnswerSubmissionProps) {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [solution, setSolution] = useState<string>("");
    const [yourAnswer, setYourAnswer] = useState<string>("");
    
    async function submitAnswer(formData: FormData) {
        const answer = formData.get("answer")?.toString();
        if (!answer) {
            console.error("Empty answer");
            return;
        }
        const response = await fetch("/api/answer", {
            method: "POST",
            body: JSON.stringify({ answer, problemId }),
        });
        const json = await response.json();
        setIsSubmitted(true);
        setSolution(json.content.bodies[1] || "");
        setYourAnswer(answer);
        
    }
    return (
        <div className="bg-slate-800 shadow-md rounded-lg p-4 mb-6">
            <form action={submitAnswer} className="flex flex-row">
                <div className="mb-4 w-full">
                    <input
                        type="text"
                        name="answer"
                        disabled={isSubmitted}
                        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Enter your answer here"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitted}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit
                </button>
            </form>

            {isSubmitted && (
                <MathJaxContext>
                    <article className="prose prose-invert mx-auto lg:prose-lg p-6 bg-slate-800 rounded-lg border border-slate-600">
                        <div>Your Answer: {yourAnswer}</div>
                        <MathJax dangerouslySetInnerHTML={{__html: solution}}></MathJax>
                    </article>
                </MathJaxContext>
            )}
        </div>
    );
}
