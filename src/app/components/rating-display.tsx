type RatingDisplayProps = {
    rating: number;
};

export default function RatingDisplay({ rating }: RatingDisplayProps) {
    return (
        <div className="bg-slate-800 shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-2 text-white">Your Rating</h2>
            <div className="text-3xl font-bold text-blue-400">{rating}</div>
        </div>
    );
}