"use client";

import { useState } from "react";
import { bulkAddBandishesSecurely } from "@/app/actions";

export default function BulkUpload() {
  const [passcode, setPasscode] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [status, setStatus] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkUpload = async () => {
    if (!jsonData.trim()) {
      setStatus({ message: "Please paste your JSON data first.", type: 'error' });
      return;
    }

    let parsedData = [];
    try {
      parsedData = JSON.parse(jsonData);
      if (!Array.isArray(parsedData)) {
        throw new Error("JSON must be an array of bandish objects.");
      }
    } catch (e: any) {
      setStatus({ message: `Invalid JSON format: ${e.message}`, type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    
    const response = await bulkAddBandishesSecurely(parsedData);
    
    if (response.success) {
      setStatus({ message: `Success! Added ${parsedData.length} bandishes.`, type: 'success' });
      setJsonData(""); // clear on success
    } else {
      setStatus({ message: `Error: ${response.error}`, type: 'error' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-m3-surface dark:bg-m3-surface-dark p-6 md:p-12 text-gray-900 dark:text-white transition-colors duration-500 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-m3-surface-container dark:bg-m3-surface-container-dark p-8 md:p-10 rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark shadow-sm animate-modal-enter mt-12 md:mt-20">
        <div className="mb-8 text-center">
          <span className="material-symbols-rounded text-5xl text-m3-primary dark:text-m3-primary-dark mb-4 inline-block">library_add</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>Bulk Uploader</h1>
          <p className="text-m3-secondary dark:text-m3-secondary-dark font-medium">
            Paste a JSON array of bandishes to upload them securely.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider mb-2">JSON Payload</label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder='[\n  {\n    "title": "Example",\n    "raag": "Yaman",\n    ...\n  }\n]'
              className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 min-h-[250px] font-mono text-sm resize-y m3-scrollbar"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-m3-error dark:text-m3-error-dark uppercase tracking-wider mb-2">
              <span className="material-symbols-rounded text-[1.1rem]">lock</span> Admin Passcode (Optional)
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode if required"
              className="w-full bg-m3-error/10 dark:bg-m3-error-dark/10 text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-error dark:focus:ring-m3-error-dark transition-all duration-300 placeholder-m3-error/50 dark:placeholder-m3-error-dark/50"
            />
          </div>

          <button
            onClick={handleBulkUpload}
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 py-4 rounded-full font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <span className="material-symbols-rounded text-[1.4rem]">cloud_upload</span>
            {isSubmitting ? "Uploading..." : "Execute Bulk Insert"}
          </button>
        </div>

        {status && (
          <div className={`mt-6 px-6 py-4 rounded-xl font-bold flex items-center gap-3 border ${status.type === 'error' ? 'bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark border-m3-error-dark/30' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50'} animate-modal-enter`}>
            <span className="material-symbols-rounded">{status.type === 'error' ? 'error' : 'check_circle'}</span>
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}