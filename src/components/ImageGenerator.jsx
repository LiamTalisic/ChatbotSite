import { useState, useRef, useEffect } from "react";
import { auth } from "../firebaseConfig"; // ✅ Import Firebase auth

const API_URL = import.meta.env.VITE_BACKEND_URL; // Load backend URL from environment

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);
    const maxHeight = 150;

    const generateImage = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError("Please log in to generate images.");
                setLoading(false);
                return;
            }

            const token = await user.getIdToken(); // Get Firebase token

            const response = await fetch(`${API_URL}/generate-image`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            setImageUrl(data.imageUrl);

        } catch (err) {
            setError("Error generating image. Please try again.");
            console.error("Image generation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            generateImage();
        }
    };

    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [prompt]);

    return (
        <div className="flex flex-col w-full mx-auto p-2 rounded-lg shadow-md shadow-gray-300 border border-gray-200 bg-white">
            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe an image... (Shift+Enter for new line)"
                className="flex-1 p-2 rounded-lg outline-none resize-none overflow-y-auto max-h-[400px] min-h-[40px]
                            [&::-webkit-scrollbar]:w-2 
                            [&::-webkit-scrollbar-track]:bg-gray-100  [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full"
            />

            <button
                onClick={generateImage}
                className={`ml-2 w-10 h-10 text-white rounded-full flex items-center justify-center duration-200 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-400"
                }`}
                disabled={loading}
            >
                {loading ? (
                    <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8"></path>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
                            fill="currentColor"
                        />
                    </svg>
                )}
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {imageUrl && (
                <div className="mt-4 w-full flex justify-center">
                    <img src={imageUrl} alt="Generated" className="rounded-lg shadow-md w-full max-w-[300px]" />
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;
