"use client";

import { useState } from "react";

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 hover:text-m3-primary dark:hover:text-m3-primary-dark hover:border-m3-primary/30 transition-colors"
      title="Copy to clipboard"
    >
      <span className="material-symbols-rounded text-sm">
        {copied ? "check" : "content_copy"}
      </span>
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const TOP_LEVEL_SNIPPET = `[
  {
    "title": "Jhananana Jhananana Jhana Jhana",
    "raag": "Deepak",
    "taal": "Ada Chautala",
    "lay": ["Drut"],
    "composer": "unknown",
    "lyrics": { ... },
    "youtube_renditions": [ ... ],
    "contributor": "Anonymous"
  }
]`;

const LYRICS_SNIPPET = `"lyrics": {
  "english": "payal ki jhankar bairaniya\\njhan jhan baje kaisi mori\\npiya se milan ko jaun jab main\\n\\nbirha se tan taap tapat hai\\nang ang sab laag rahi la\\nsada rangeele uthat jiya hook",
  "devanagari": "पायल की झंकार बैरनिया\\nझन झन बाजे कैसी मोरी\\nपिया से मिलन को जाउं जब मैं\\n\\nबिरहा से तन ताप तपत है\\nअंग अंग सब लाग रही ल\\nसदा रंगीले उठत जिया हूक"
}`;

const RENDITIONS_SNIPPET = `"youtube_renditions": [
  {
    "url": "https://www.youtube.com/watch?v=gc3XUmP44vk",
    "artist": "Example Person",
    "year": "1983",
    "isVideo": true,
    "bandishes": ["Jhananana Jhananana Jhana Jhana", "Jhanana Baaje"]
  }
]`;

const FULL_EXAMPLE_SNIPPET = `[
  {
    "id": "c09a4db1-8f0d-44dc-aa1d-4314f2a2f161",
    "title": "Jhananan Jhan Jhananan Jhan Baaje",
    "raag": "Deshkar",
    "taal": "Tintal Madhyalay",
    "lay": ["Madhyalay"],
    "composer": "unknown",
    "lyrics": {
      "english": "jhananan jhan jhananan jhan baaje paayaliya\\npiyaa se milan chali aaj kaminiya\\n\\namiy halaahal madbhare shwet shyam ratanaar\\njiyat marat jhuki jhuki parat jehi chitawat ek baar",
      "devanagari": "झनणन झन झनणन झन बाजे पायलिया\\nपिया से मिलन चली आज कामिनिया\\n\\nअमिय हलाहल मदभरे श्वेत श्याम रतनार\\nजियत मरत झुकी झुकी परत जेही चितवत एक बार"
    },
    "youtube_renditions": [
      {
        "url": "https://www.youtube.com/watch?v=gc3XUmP44vk",
        "artist": "Pandit Bhimsen Joshi",
        "year": "1970s",
        "isVideo": true,
        "bandishes": ["Jhananana Jhananana Jhana Jhana"]
      }
    ],
    "contributor": "Google Gemini"
  }
]`;

export default function BulkGuide() {
  return (
    <div className="w-full bg-white dark:bg-m3-surface-container-dark p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark animate-modal-enter" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-rounded text-4xl text-m3-primary dark:text-m3-primary-dark shrink-0">menu_book</span>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white" style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}>
            Bulk JSON Guide
          </h2>
          <p className="text-m3-secondary dark:text-m3-secondary-dark text-sm sm:text-base font-medium mt-1">
            Formatting conventions and field definitions for bulk insertion.
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed">

        {/* Section 1 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-bold text-lg text-m3-primary dark:text-m3-primary-dark">
              <span className="bg-m3-primary/10 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Top-Level Structure
            </h3>
            <CopyCodeButton code={TOP_LEVEL_SNIPPET} />
          </div>
          <p className="mb-3 text-gray-700 dark:text-gray-300">Your payload should be a <span className="font-bold text-gray-900 dark:text-white">JSON Array</span> of bandish objects (or a single object, which will be automatically packaged into an array).</p>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{TOP_LEVEL_SNIPPET}</code>
            </pre>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-lg text-m3-primary dark:text-m3-primary-dark mb-4">
            <span className="bg-m3-primary/10 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Field Definitions & Rules
          </h3>
          <div className="grid gap-3 sm:gap-4">
            {[
              { field: "id", type: "UUID (Optional)", desc: "A valid UUID v4 string. If omitted, one will be generated automatically." },
              { field: "title", type: "String (Required)", desc: "Capitalize the first letter of each word (Title Case)." },
              { field: "raag", type: "String (Required)", desc: "Must match an existing Raag name (e.g. \"Yaman\", \"Bhairav\", \"Deshkar\")." },
              { field: "taal", type: "String (Required)", desc: "The rhythmic cycle name (e.g. \"Tintal\", \"Ektaal\", \"Jhaptal\")." },
              { field: "lay", type: "Array of Strings", desc: "Tempo designations (e.g. [\"Vilambit\"], [\"Madhyalay\"], [\"Drut\"])." },
              { field: "composer", type: "String (Optional)", desc: "If unknown, defaults to \"unknown\". Otherwise, composer name with optional mudra." },
              { field: "tradition", type: "String (Optional)", desc: "Gharana or musical tradition (e.g. \"Gwalior\", \"Agra\", \"Jaipur-Atrauli\")." },
              { field: "contributor", type: "String (Optional)", desc: "Contributor name or identifier. Defaults to \"Anonymous\"." }
            ].map((item, idx) => (
              <div key={idx} className="bg-m3-surface dark:bg-m3-surface-dark p-4 rounded-2xl border border-m3-surface-high dark:border-m3-surface-high-dark flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <div className="flex items-center gap-2 shrink-0 sm:w-36">
                  <span className="font-mono text-xs font-bold text-m3-secondary dark:text-m3-secondary-dark bg-m3-surface-container dark:bg-m3-surface-container-dark px-2 py-1 rounded-md">{item.field}</span>
                </div>
                <div className="flex-1">
                  <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mr-2 block sm:inline">{item.type}</span>
                  <span className="text-gray-700 dark:text-gray-300">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-bold text-lg text-m3-error dark:text-m3-error-dark">
              <span className="bg-m3-error/10 dark:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              The lyrics Object (Required)
            </h3>
            <CopyCodeButton code={LYRICS_SNIPPET} />
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">Must contain at least <code className="text-m3-primary dark:text-m3-primary-dark font-bold">english</code> transliteration and optional <code className="text-m3-primary dark:text-m3-primary-dark">devanagari</code>.</p>
          <ul className="space-y-2 mb-4 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li><strong className="text-gray-900 dark:text-white">Lowercase:</strong> English transliteration should be lowercase for phonetic consistency.</li>
            <li><strong className="text-gray-900 dark:text-white">Line Breaks:</strong> Separate each line with a single newline (<code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">\n</code>).</li>
            <li><strong className="text-gray-900 dark:text-white">Stanza Separation:</strong> Separate Sthayi and Antara with a double newline (<code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">\n\n</code>).</li>
            <li><strong className="text-gray-900 dark:text-white">No Mukhda Repeats:</strong> Do not repeat the opening refrain at the end of stanzas.</li>
          </ul>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{LYRICS_SNIPPET}</code>
            </pre>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-bold text-lg text-m3-primary dark:text-m3-primary-dark">
              <span className="bg-m3-primary/10 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              The youtube_renditions Array
            </h3>
            <CopyCodeButton code={RENDITIONS_SNIPPET} />
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">An array of YouTube performance objects (or empty array <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">[]</code> if none exist).</p>
          <ul className="space-y-2 mb-4 list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li><strong className="text-gray-900 dark:text-white">url:</strong> Valid YouTube watch link (<code className="text-xs">https://www.youtube.com/watch?v=...</code>).</li>
            <li><strong className="text-gray-900 dark:text-white">artist:</strong> Full name of the vocalist/artist without honorific prefixes.</li>
            <li><strong className="text-gray-900 dark:text-white">year:</strong> Optional recording year or decade as a string (e.g. "1975", "1980s").</li>
            <li><strong className="text-gray-900 dark:text-white">isVideo:</strong> Boolean indicating video vs audio-only upload.</li>
            <li className="leading-loose"><strong className="text-gray-900 dark:text-white">bandishes:</strong> Array of titles performed in the recording.</li>
          </ul>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{RENDITIONS_SNIPPET}</code>
            </pre>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-bold text-lg text-m3-tertiary dark:text-m3-tertiary-dark">
              <span className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/20 text-m3-tertiary dark:text-m3-tertiary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
              Complete Example Payload
            </h3>
            <CopyCodeButton code={FULL_EXAMPLE_SNIPPET} />
          </div>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{FULL_EXAMPLE_SNIPPET}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
