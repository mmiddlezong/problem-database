import { MathJax, MathJaxContext } from "better-react-mathjax";
import MathJaxProvider from "./mathjax-provider";
import { problems } from "@/db/schema";
import { config, mathJaxConfig } from "../mathjax-config";

interface ProblemDisplayProps {
  problem: {
    id: string;
    source: string | null;
    contentPath: string;
    format: typeof problems.format.enumValues[number];
    rating: number | null;
  };
  problemTex: string;
}

export default function ProblemDisplay({ problem, problemTex }: ProblemDisplayProps) {
  return (
    <div className="bg-slate-900 shadow-lg rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4 text-slate-300 text-sm">
        <div className="px-3 py-1 bg-slate-700 rounded">
          Source: {problem.source || "Unknown"}
        </div>
        <div className="flex space-x-4">
          <div className="px-3 py-1 bg-slate-700 rounded">
            Format: {problem.format}
          </div>
          <div className="px-3 py-1 bg-slate-700 rounded">
            Rating: {problem.rating}
          </div>
        </div>
      </div>
      
      <MathJaxContext config={mathJaxConfig}>
        <article className="prose prose-invert mx-auto lg:prose-lg p-6 bg-slate-800 rounded-lg border border-slate-600">
          <MathJax dangerouslySetInnerHTML={{__html: problemTex}}></MathJax>
        </article>
      </MathJaxContext>
    </div>
  );
}