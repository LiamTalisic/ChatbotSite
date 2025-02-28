import { useState } from "react";

function ModelDropdown({ setSelectedModel, selectedModel }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const models = ["gpt-4o", "gpt-4o-mini", "gpt-4.5-preview", "o1-mini", "o3-mini"];

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative">
            <div className="flex hover:text-gray-300 duration-150 pl-3 pr-1 py-2 gap-2 bg-gray-100 rounded">
                {/* make this whole div a button instead */}
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>{selectedModel}</button>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`icon-md text-token-text-tertiary transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            {isDropdownOpen && (
                <div className="absolute mt-2 bg-white border border-gray-200 rounded shadow-lg z-10 w-48">
                    <ul>
                        {models.map((model) => (
                            <li key={model} onClick={() => handleModelSelect(model)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                {model}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ModelDropdown;
