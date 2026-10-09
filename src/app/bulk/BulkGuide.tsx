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
            Strict formatting conventions for the bulk insertion payload.
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed">

        {/* Section 1 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-lg text-m3-primary dark:text-m3-primary-dark mb-3">
            <span className="bg-m3-primary/10 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Top-Level Structure
          </h3>
          <p className="mb-3">Your payload should be a <span className="font-bold text-gray-900 dark:text-white">JSON Array</span> of bandish objects.</p>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{`[
  {
    "id": "e2f89c62-...",
    "title": "Jhananana Jhananana Jhana Jhana",
    "raag": "Deepak",
    "taal": "Ada Chautala",
    "lay": ["Drut"],
    "composer": "unknown",
    "lyrics": { ... },
    "youtube_renditions": [ ... ],
    "contributor": "Anonymous"
  }
]`}</code>
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
              { field: "id", type: "UUID", desc: "A valid UUID v4 string." },
              { field: "title", type: "String", desc: "Capitalize the first letter of each word (Title Case)." },
              { field: "raag", type: "String", desc: "Must match an existing Raag name exactly (e.g., \"Puriya Kalyan\")." },
              { field: "taal", type: "String", desc: "Just the taal name (e.g., \"Tintal\", \"Ada Chautala\")." },
              { field: "lay", type: "Array of Strings", desc: "Array of lay names (e.g., [\"Vilambit\"], [\"Madhyalay\", \"Drut\"])." },
              { field: "composer", type: "String", desc: "If unknown, use exactly \"unknown\". Otherwise, Name followed by mudra in single-quotes." },
              { field: "contributor", type: "String", desc: "The name of the user or agent adding the entry. Can be configured for your account in the Editor Dashboard." }
            ].map((item, idx) => (
              <div key={idx} className="bg-m3-surface dark:bg-m3-surface-dark p-4 rounded-2xl border border-m3-surface-high dark:border-m3-surface-high-dark flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <div className="flex items-center gap-2 shrink-0 sm:w-32">
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
          <h3 className="flex items-center gap-2 font-bold text-lg text-m3-error dark:text-m3-error-dark mb-3">
            <span className="bg-m3-error/10 dark:bg-m3-error-dark/20 text-m3-error dark:text-m3-error-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            The lyrics Object (CRITICAL)
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">Must contain exactly two keys: <code className="text-m3-primary dark:text-m3-primary-dark">english</code> and <code className="text-m3-primary dark:text-m3-primary-dark">devanagari</code>.</p>
          <ul className="space-y-2 mb-4 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li><strong className="text-gray-900 dark:text-white">Lowercase:</strong> English must be strictly all lowercase.</li>
            <li><strong className="text-gray-900 dark:text-white">Line Breaks:</strong> Separate each line with a single newline (<code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">\n</code>).</li>
            <li><strong className="text-gray-900 dark:text-white">Stanza Separation:</strong> Separate Sthayi and Antara with a double newline (<code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">\n\n</code>).</li>
            <li><strong className="text-gray-900 dark:text-white">No Mukhda Repeats:</strong> Do not repeat the first line at the end of stanzas.</li>
          </ul>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{`"lyrics": {
  "english": "payal ki jhankar bairaniya\\njhan jhan baje kaisi mori\\npiya se milan ko jaun jab main\\n\\nbirha se tan taap tapat hai\\nang ang sab laag rahi la\\nsada rangeele uthat jiya hook",
  "devanagari": "पायल की झंकार बैरनिया\\nझन झन बाजे कैसी मोरी\\nपिया से मिलन को जाउं जब मैं\\n\\nबिरहा से तन ताप तपत है\\nअंग अंग सब लाग रही ल\\nसदा रंगीले उठत जिया हूक"
}`}</code>
            </pre>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-lg text-m3-primary dark:text-m3-primary-dark mb-3">
            <span className="bg-m3-primary/10 dark:bg-m3-primary-dark/20 text-m3-primary dark:text-m3-primary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            The youtube_renditions Array
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">An array of valid working YouTube links. Empty array <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">[]</code> if none exist.</p>
          <ul className="space-y-2 mb-4 list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
            <li><strong className="text-gray-900 dark:text-white">Valid URLs:</strong> Ensure the <code className="text-m3-primary dark:text-m3-primary-dark">url</code> is a valid, working YouTube link.</li>
            <li className="leading-loose"><strong className="text-gray-900 dark:text-white">Title Convention:</strong> The <code className="text-m3-primary dark:text-m3-primary-dark">title</code> should generally follow the pattern <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded box-decoration-clone break-words">[Year] - [Album] - [Bandish 1] - [Bandish 2]...[Bandish n] - [Video (If the rendition is one)]</code> depending on what information is available.</li>
            <li><strong className="text-gray-900 dark:text-white">Artist:</strong> The full name of the performer without a title like Pt., Dr., etc.</li>
          </ul>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{`"youtube_renditions": [
  {
    "url": "https://www.youtube.com/watch?v=gc3XUmP44vk",
    "title": "1983 - Jhananana Jhananana Jhana Jhana - Jhanana Baaje - Video",
    "artist": "Example Person"
  }
]`}</code>
            </pre>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-lg text-m3-tertiary dark:text-m3-tertiary-dark mb-3">
            <span className="bg-m3-tertiary/10 dark:bg-m3-tertiary-dark/20 text-m3-tertiary dark:text-m3-tertiary-dark w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
            Complete Example Payload
          </h3>
          <div className="bg-white dark:bg-[#1a181d] rounded-2xl p-4 sm:p-5 border border-m3-surface-high dark:border-m3-surface-high-dark overflow-x-auto m3-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300">
              <code>{`[
  {
    "id": "c09a4db1-8f0d-44dc-aa1d-4314f2a2f161",
    "title": "Jhananan Jhan Jhananan Jhan Baaje",
    "raag": "Deshkar",
    "taal": "Tintal Madhyalay",
    "composer": "unknown",
    "lyrics": {
      "english": "jhananan jhan jhananan jhan baaje paayaliya\\npiyaa se milan chali aaj kaminiya\\n\\namiy halaahal madbhare shwet shyam ratanaar\\njiyat marat jhuki jhuki parat jehi chitawat ek baar",
      "devanagari": "झनणन झन झनणन झन बाजे पायलिया\\nपिया से मिलन चली आज कामिनिया\\n\\nअमिय हलाहल मदभरे श्वेत श्याम रतनार\\nजियत मरत झुकी झुकी परत जेही चितवत एक बार"
    },
    "youtube_renditions": [
      {
        "url": "https://www.youtube.com/watch?v=gc3XUmP44vk",
        "title": "Jhanana Jhanana Baje",
        "artist": "Pandit Bhimsen Joshi"
      }
    ],
    "contributor": "Google Gemini"
  }
]`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
