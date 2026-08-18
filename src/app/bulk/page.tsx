"use client";

import { useState } from "react";
import { bulkAddBandishesSecurely } from "@/app/actions";

export default function BulkUpload() {
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState("");

  // PASTE YOUR 20+ BANDISHES IN THIS ARRAY
  const myBulkData = [
    {
      id: "demo-bandish-1",
      title: "First Bulk Bandish",
      raag: "Yaman",
      taal: "Tintal",
      composer: "Traditional",
      lyrics: {
        english: "Line one...\nLine two...",
        devanagari: "लाइन एक...\nलाइन दो..."
      }
    },
    {
      id: "demo-bandish-2",
      title: "Second Bulk Bandish",
      raag: "Bhairav",
      taal: "Ektaal",
      composer: "Sadrang",
      lyrics: {
        english: "Another line...\nMore text...",
        devanagari: "..."
      }
    }
    // ... add as many as you want here!
  ];

  const handleBulkUpload = async () => {
    setStatus("Uploading...");
    
    const response = await bulkAddBandishesSecurely(myBulkData, passcode);
    
    if (response.success) {
      setStatus(`Success! Added ${myBulkData.length} bandishes.`);
    } else {
      setStatus(`Error: ${response.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8FD] dark:bg-[#141218] p-12 text-[#1D1B20] dark:text-[#E6E0E9]">
      <div className="max-w-xl mx-auto bg-[#FEF7FF] dark:bg-[#1D1B20] p-8 rounded-3xl border border-[#EADDFF] dark:border-[#332D41]">
        <h1 className="text-3xl font-bold mb-6">Bulk Uploader</h1>
        
        <p className="mb-6 opacity-80">
          Ready to upload <strong>{myBulkData.length}</strong> bandishes to Supabase.
        </p>

        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Admin Passcode"
          className="w-full bg-[#F3EDF7] dark:bg-[#332D41] px-6 py-4 rounded-full mb-4 focus:outline-none focus:ring-4 ring-[#6750A4]/30"
        />

        <button
          onClick={handleBulkUpload}
          className="w-full bg-[#6750A4] text-white py-4 rounded-full font-bold hover:bg-[#4F378B] transition-colors"
        >
          Execute Bulk Insert
        </button>

        {status && (
          <div className="mt-6 p-4 bg-[#EADDFF] dark:bg-[#4A4458] rounded-xl font-bold text-center">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}