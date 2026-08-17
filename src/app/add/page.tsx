"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBandishSecurely } from "@/app/actions";

export default function AddBandish() {
  const router = useRouter();
  
  // Form States
  const [title, setTitle] = useState("");
  const [raag, setRaag] = useState("");
  const [taal, setTaal] = useState("");
  const [composer, setComposer] = useState("Traditional"); // Default value!
  const [devanagari, setDevanagari] = useState("");
  const [english, setEnglish] = useState("");
  const [passcode, setPasscode] = useState("");
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({ text: "", type: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    setIsSubmitting(true);
    setMessage({ text: "", type: null });

    // 1. Generate a unique ID (e.g., "hori-khelan-ko-8432")
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);

    // 2. Format the payload to perfectly match our Supabase columns
    const newBandish = {
      id,
      title,
      raag,
      taal,
      composer,
      lyrics: {
        devanagari,
        english
      }
    };

    // 3. Send it to our secure server action!
    const response = await addBandishSecurely(newBandish, passcode);

    setIsSubmitting(false);

    if (!response.success) {
      setMessage({ text: response.error || "An error occurred", type: "error" });
    } else {
      setMessage({ text: "Success! The bandish was added to the Wiki.", type: "success" });
      
      // Clear out the form so it's ready for another one
      setTitle("");
      setRaag("");
      setTaal("");
      setComposer("Traditional");
      setDevanagari("");
      setEnglish("");
      setPasscode("");
      
      // Send the user back to the home page after 2 seconds to see their work
      setTimeout(() => router.push('/'), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDF8FD] dark:bg-[#141218] transition-colors duration-500 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center p-3 bg-[#EADDFF] dark:bg-[#332D41] hover:bg-[#D0BCFF] dark:hover:bg-[#4A4458] text-[#21005D] dark:text-[#E6E0E9] rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1D1B20] dark:text-[#E6E0E9]">
              Add New Bandish
            </h1>
            <p className="text-[#4F378B] dark:text-[#CAC4D0] mt-1 font-medium">
              Contribute to the Wiki database.
            </p>
          </div>
        </div>

        {/* The Form Card */}
        <div className="bg-[#FEF7FF] dark:bg-[#1D1B20] rounded-[2.5rem] p-8 md:p-12 border border-[#EADDFF] dark:border-[#332D41] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-2 pl-4">
                Title
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hori Khelan Ko"
                className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] text-lg px-6 py-4 rounded-full focus:outline-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 ring-[#6750A4]/30"
              />
            </div>

            {/* Raag, Taal, Composer Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-2 pl-4">
                  Raag
                </label>
                <input
                  required
                  type="text"
                  value={raag}
                  onChange={(e) => setRaag(e.target.value)}
                  placeholder="e.g. Des"
                  className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] px-6 py-3.5 rounded-full focus:outline-none transition-all duration-300 focus:ring-4 ring-[#6750A4]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-2 pl-4">
                  Taal
                </label>
                <input
                  required
                  type="text"
                  value={taal}
                  onChange={(e) => setTaal(e.target.value)}
                  placeholder="e.g. Tintal"
                  className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] px-6 py-3.5 rounded-full focus:outline-none transition-all duration-300 focus:ring-4 ring-[#6750A4]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-2 pl-4">
                  Composer
                </label>
                <input
                  required
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] px-6 py-3.5 rounded-full focus:outline-none transition-all duration-300 focus:ring-4 ring-[#6750A4]/30"
                />
              </div>
            </div>

            {/* Lyrics Section */}
            <div className="pt-4 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-2 pl-4">
                  English Transliteration (Required)
                </label>
                <textarea
                  required
                  rows={5}
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  placeholder="Enter the phonetic lyrics here..."
                  className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] text-lg px-6 py-4 rounded-3xl focus:outline-none transition-all duration-300 focus:ring-4 ring-[#6750A4]/30 m3-scrollbar resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-wider mb-2 pl-4">
                  Devanagari Script (Optional)
                </label>
                <textarea
                  rows={5}
                  value={devanagari}
                  onChange={(e) => setDevanagari(e.target.value)}
                  placeholder="होली खेलन को चले कन्हैयाँ..."
                  className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] text-lg px-6 py-4 rounded-3xl focus:outline-none transition-all duration-300 focus:ring-4 ring-[#6750A4]/30 m3-scrollbar resize-none"
                />
              </div>
            </div>

            {/* Master Passcode */}
            <div className="pt-4 border-t border-[#EADDFF] dark:border-[#332D41]">
              <label className="block text-sm font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2 pl-4">
                <span className="material-symbols-rounded text-[0.6rem] align-middle mr-1">lock</span>
                Admin Passcode
              </label>
              <input
                required
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter the secret password to publish"
                className="w-full bg-[#F3EDF7] dark:bg-[#332D41] text-[#1D1B20] dark:text-[#E6E0E9] px-6 py-4 rounded-full focus:outline-none transition-all duration-300 focus:ring-4 ring-red-500/30"
              />
            </div>

            {/* Status Messages */}
            {message.type && (
              <div className={`p-4 rounded-2xl font-bold text-center ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#6750A4] hover:bg-[#4F378B] dark:bg-[#D0BCFF] dark:hover:bg-[#EADDFF] text-white dark:text-[#381E72] py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="material-symbols-rounded animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-rounded">cloud_upload</span>
                )}
                {isSubmitting ? "Saving to Database..." : "Publish to Wiki"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}   