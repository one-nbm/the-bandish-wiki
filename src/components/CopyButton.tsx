"use client";
import { useState } from "react";

export default function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center justify-center p-1.5 text-gray-400 hover:text-m3-primary dark:hover:text-m3-primary-dark hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-dark rounded-full transition-colors duration-200"
      title="Copy to clipboard"
    >
      <span className="material-symbols-rounded text-[1.2rem]">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}

