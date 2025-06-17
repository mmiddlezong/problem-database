"use client";

import { useState } from "react";
import ProblemDisplay from "./problem-display";
import AnswerSubmission from "./answer-submission";
import RatingDisplay from "./rating-display";

type ProblemWrapperProps = {
    problem: any;
    problemTex: string;
    initialRating: number;
};

export default function ProblemWrapper({ problem: initialProblem, problemTex: initialProblemTex, initialRating }: ProblemWrapperProps) {
    const [currentRating, setCurrentRating] = useState(initialRating);
    const [currentProblem, setCurrentProblem] = useState(initialProblem);
    const [currentProblemTex, setCurrentProblemTex] = useState(initialProblemTex);
    const [isLoadingNext, setIsLoadingNext] = useState(false);
    const [allProblemsComplete, setAllProblemsComplete] = useState(false);

    const fetchNextProblem = async () => {
        setIsLoadingNext(true);
        try {
            const response = await fetch("/api/next-problem");
            const data = await response.json();
            
            if (data.problem) {
                setCurrentProblem(data.problem);
                setCurrentProblemTex(data.problemTex);
            } else {
                setAllProblemsComplete(true);
            }
        } catch (error) {
            console.error("Failed to fetch next problem:", error);
        } finally {
            setIsLoadingNext(false);
        }
    };

    if (allProblemsComplete) {
        return (
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                    <RatingDisplay rating={currentRating} />
                </div>
                <div className="md:flex-1">
                    <div className="bg-slate-800 shadow-md rounded-lg p-6 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Congratulations!</h2>
                        <p className="text-gray-300">You have finished all the problems in our database.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
                <RatingDisplay rating={currentRating} />
            </div>
            <div className="md:flex-1">
                <ProblemDisplay problem={currentProblem} problemTex={currentProblemTex} />
                <div className="mt-6">
                    <AnswerSubmission 
                        problemId={currentProblem.id} 
                        onRatingUpdate={setCurrentRating}
                        onNextProblem={fetchNextProblem}
                        isLoadingNext={isLoadingNext}
                    />
                </div>
            </div>
        </div>
    );
}