"use client";

import { useState, useEffect } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

type AnswerSubmissionProps = {
    problemId: string;
    onRatingUpdate?: (newRating: number) => void;
    onNextProblem?: () => void;
    isLoadingNext?: boolean;
};

export default function AnswerSubmission({ problemId, onRatingUpdate, onNextProblem, isLoadingNext }: AnswerSubmissionProps) {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [solution, setSolution] = useState<string>("");
    const [yourAnswer, setYourAnswer] = useState<string>("");
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [ratingChange, setRatingChange] = useState<number>(0);
    const [newRating, setNewRating] = useState<number>(0);
    
    // Reset state when problemId changes (new problem loaded)
    useEffect(() => {
        setIsSubmitted(false);
        setSolution("");
        setYourAnswer("");
        setIsCorrect(false);
        setRatingChange(0);
        setNewRating(0);
    }, [problemId]);
    
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
        setIsCorrect(json.isCorrect || false);
        setRatingChange(json.ratingChange || 0);
        setNewRating(json.newRating || 0);
        
        // Update the parent component's rating display
        if (onRatingUpdate && json.newRating) {
            onRatingUpdate(json.newRating);
        }
        
    }
    return (
        <div className="bg-slate-800 shadow-md rounded-lg p-4 mb-6">
            {!isSubmitted ? (
                <form action={submitAnswer} className="flex flex-row gap-3 items-center">
                    <div className="w-full">
                        <input
                            type="text"
                            name="answer"
                            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:border-blue-500 h-10"
                            placeholder="Enter your answer here"
                        />
                    </div>

                    <button
                        type="submit"
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors h-10"
                    >
                        Submit
                    </button>
                </form>
            ) : (
                <MathJaxContext>
                    <div className="space-y-4">
                        <div className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 space-y-2">
                            <div>
                                <span className="text-blue-400 font-semibold mr-3">Your Answer:</span>
                                <span className="text-white font-mono">{yourAnswer}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </div>
                                <div className="text-gray-300">
                                    Rating: {ratingChange > 0 ? '+' : ''}{ratingChange} → {newRating}
                                </div>
                            </div>
                        </div>
                        <article className="prose prose-invert mx-auto lg:prose-lg p-6 bg-slate-800 rounded-lg border border-slate-600">
                            <MathJax dangerouslySetInnerHTML={{__html: solution}}></MathJax>
                        </article>
                        <div className="flex justify-center">
                            <button
                                onClick={onNextProblem}
                                disabled={isLoadingNext}
                                className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingNext ? 'Loading...' : 'Next Problem'}
                            </button>
                        </div>
                    </div>
                </MathJaxContext>
            )}
        </div>
    );
}
