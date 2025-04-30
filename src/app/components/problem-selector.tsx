'use client';

import { useState } from "react";

interface ProblemSelectorProps {
    problems: string[];
    initialProblemTex: string;
}

export default function ProblemSelector({
    problems,
    initialProblemTex
}: ProblemSelectorProps) {
    const [problemTex, setProblemTex] = useState(initialProblemTex);
    const [selectedProblem, setSelectedProblem] = useState('p1');

    const handleProblemChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const problemId = e.target.value;
        setSelectedProblem(problemId);
        
        if (!problemId) return;
        
        try {
            const response = await fetch(`http://localhost:3002/api/tex/${problemId}/problem`);
            if (!response.ok) {
                throw new Error(`Failed to fetch problem: ${response.status}`);
            }
            const data = await response.json();
            setProblemTex(data.content);
            
            // Force MathJax to re-render
            if (window.MathJax) {
                setTimeout(() => {
                    window.MathJax.typeset();
                }, 1);
                
                setTimeout(() => {
                    window.MathJax.typeset();
                }, 2);
                setTimeout(() => {
                    window.MathJax.typeset();
                }, 5);
                setTimeout(() => {
                    window.MathJax.typeset();
                }, 50);
            }
        } catch (error) {
            console.error("Error loading problem:", error);
        }
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <label htmlFor="problem-select" className="font-medium text-white">
                    Select Problem:
                </label>
                <select
                    id="problem-select"
                    className="bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedProblem}
                    onChange={handleProblemChange}
                >
                    <option value="">Choose a problem...</option>
                    {problems.map((problem) => (
                        <option key={problem} value={problem}>
                            {problem}
                        </option>
                    ))}
                </select>
            </div>
            
            <article className="prose prose-invert mx-auto lg:prose-lg p-6 bg-slate-800 rounded-lg border border-slate-600">
                <div
                    dangerouslySetInnerHTML={{
                        __html: problemTex,
                    }}
                />
            </article>
        </>
    );
}

// Add TypeScript interface for the MathJax global
declare global {
    interface Window {
        MathJax: {
            typeset: () => void;
        };
    }
}