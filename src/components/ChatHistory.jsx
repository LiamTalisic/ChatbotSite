import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatHistory = ({ messages }) => {
    const chatContainerRef = useRef(null);
    const [popupImage, setPopupImage] = useState(null);

    // Auto-scroll to the bottom only if the user is near the bottom
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const threshold = 175;
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight < threshold) {
            container.scrollTop = scrollHeight;
        }
    }, [messages]);

    // Custom components for ReactMarkdown rendering
    const components = {
        // Headings
        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold my-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold my-4" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl font-bold my-3" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-lg font-bold my-2" {...props} />,
        h5: ({ node, ...props }) => <h5 className="text-base font-bold my-2" {...props} />,
        h6: ({ node, ...props }) => <h6 className="text-sm font-bold my-1" {...props} />,

        // Paragraphs – avoid wrapping block-level divs (like code blocks) in a <p>
        p: ({ node, children, ...props }) => {
            if (children && children.length === 1 && typeof children[0] === "object" && children[0].type === "div") {
                return <span>{children}</span>;
            }
            return (
                <p className="my-0.5" {...props}>
                    {children}
                </p>
            );
        },

        // Blockquote
        blockquote: ({ node, children, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props}>
                {children}
            </blockquote>
        ),

        // Code – handles both block-level code and inline code.
        // For block-level code, we add a header with language and a copy button.
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const okaidiaBackground = {
                backgroundColor: okaidia['pre[class*="language-"]']?.background,
            };

            // CopyIcon component with state for temporary "Copied" feedback
            const CopyIcon = () => {
                const [copied, setCopied] = useState(false);

                const handleCopy = () => {
                    navigator.clipboard.writeText(codeContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                };

                return (
                    <span className="text-xs" data-state={copied ? "copied" : "closed"}>
                        <button className="flex gap-1 items-center select-none hover:bg-gray-600 rounded-md p-1 duration-250 cursor-pointer" onClick={handleCopy} aria-label="Copy">
                            {copied ? (
                                <>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                                    </svg>
                                    Copied
                                </>
                            ) : (
                                <>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </span>
                );
            };

            if (!inline && match) {
                return (
                    <div style={okaidiaBackground} className="rounded-t-xl rounded-b-md px-2 pb-0.5 my-1">
                        <div className="flex items-center justify-between pt-2 px-2 rounded-sm text-white">
                            <span className="italic">{match[1]}</span>
                            <CopyIcon />
                        </div>
                        <SyntaxHighlighter
                            language={match[1]}
                            style={okaidia}
                            className="text-white overflow-x-auto [&::-webkit-scrollbar]:h-2 
                        [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                            {...props}
                        >
                            {codeContent}
                        </SyntaxHighlighter>
                    </div>
                );
            } else {
                // fallback to inline code
                return <code className="bg-gray-100 text-purple-700 px-1 py-0.5 rounded font-mono shadow-sm">{children}</code>;
            }
        },

        // Unordered list
        ul: ({ node, children, ...props }) => (
            <ul className="list-disc ml-6 my-2" {...props}>
                {children}
            </ul>
        ),
        // Ordered list
        ol: ({ node, children, ...props }) => (
            <ol className="list-decimal ml-6 my-2" {...props}>
                {children}
            </ol>
        ),
        // List item
        li: ({ node, children, ...props }) => (
            <li className="ml-2 my-1" {...props}>
                {children}
            </li>
        ),

        // Links
        a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,

        // Images
        img: ({ node, ...props }) => <img className="max-w-full my-2" alt="" {...props} />,

        // Horizontal rule
        hr: ({ node, ...props }) => <hr className="my-4 border-0 h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent " {...props} />,

        // Table elements
        table: ({ node, ...props }) => <table className="min-w-full border-collapse my-4" {...props} />,
        thead: ({ node, ...props }) => <thead className="bg-gray-200" {...props} />,
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
        th: ({ node, ...props }) => <th className="p-2 text-left" {...props} />,
        td: ({ node, ...props }) => <td className="p-2" {...props} />,

        // Preformatted text (usually used with code blocks)
        pre: ({ node, ...props }) => <pre {...props} />,
    };

    return (
        <div
            ref={chatContainerRef}
            className="flex flex-col w-full mx-auto p-4 shadow-md shadow-gray-300 border border-gray-200 rounded-lg bg-white mb-5 overflow-y-auto
                [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
            <div className="flex flex-col gap-y-2">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`relative px-3 py-1.5 rounded-2xl max-w-[80%] break-words ${message.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}
                    >
                        {message.isImage ? (
                            <div className="flex flex-col items-start relative">
                                <div className="flex flex-row items-start justify-between w-full mb-1">
                                    <p className="text-sm text-gray-600 mb-1">AI Generated Image:</p>
                                </div>
                                <img
                                    src={message.text}
                                    alt="Generated content"
                                    className="max-w-full rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-102 duration-250"
                                    style={{ maxHeight: "300px", objectFit: "cover" }}
                                    onClick={() => setPopupImage(message.text)}
                                />
                            </div>
                        ) : message.sender === "user" ? (
                            // Render user messages as plain text
                            <div className="whitespace-pre-wrap">{message.text}</div>
                        ) : (
                            // Render bot messages as markdown
                            <div>
                                <ReactMarkdown components={components} className="overflow-x-auto">
                                    {message.text}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Image Popup (Centered, 80% width) */}
            {popupImage && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-md z-50" onClick={() => setPopupImage(null)}>
                    <img src={popupImage} alt="Enlarged preview" className="max-w-[80%] max-h-[80%] rounded-2xl shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default ChatHistory;
