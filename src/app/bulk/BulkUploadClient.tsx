"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { bulkAddBandishesSecurely } from "@/app/actions";
import BulkGuide from "./BulkGuide";

interface NormalizedBandish {
  id: string;
  title: string;
  raag: string;
  taal?: string;
  lay?: string[];
  composer?: string;
  lyrics?: {
    english?: string;
    devanagari?: string;
  };
  youtube_renditions?: Array<{
    url: string;
    artist: string;
    year?: string;
    isVideo?: boolean;
    bandishes?: string[];
  }>;
  contributor?: string;
  [key: string]: any;
}

interface ValidationItem {
  bandish: NormalizedBandish;
  isValid: boolean;
  issues: string[];
}

const SAMPLE_PAYLOAD: NormalizedBandish[] = [
  {
    id: "c09a4db1-8f0d-44dc-aa1d-4314f2a2f161",
    title: "Jhananan Jhan Jhananan Jhan Baaje",
    raag: "Deshkar",
    taal: "Tintal Madhyalay",
    lay: ["Madhyalay"],
    composer: "unknown",
    tradition: "Gwalior",
    lyrics: {
      english: "jhananan jhan jhananan jhan baaje paayaliya\npiyaa se milan chali aaj kaminiya",
      devanagari: "झनणन झन झनणन झन बाजे पायलिया\nपिया से मिलन चली आज कामिनिया"
    },
    youtube_renditions: [
      {
        url: "https://www.youtube.com/watch?v=gc3XUmP44vk",
        artist: "Pandit Bhimsen Joshi",
        year: "1970s",
        isVideo: true,
        bandishes: ["Jhananan Jhan Jhananan Jhan Baaje"]
      }
    ],
    contributor: "Archivist Team"
  },
  {
    id: "a18b3ec2-9e1e-45fa-bb2e-5425f3b3f272",
    title: "Eri Aali Piya Bina",
    raag: "Yaman",
    taal: "Tintal Madhyalay",
    lay: ["Madhyalay"],
    composer: "Sadarang",
    tradition: "Kirana",
    lyrics: {
      english: "eri aali piya bina sakhi kal na parat mohe ghari pal chhin din",
      devanagari: "एरी आली पिया बिना सखी कल न परत मोहे घरी पल छिन दिन"
    },
    youtube_renditions: [
      {
        url: "https://www.youtube.com/watch?v=example123",
        artist: "Ustad Amir Khan",
        year: "1962",
        isVideo: false,
        bandishes: ["Eri Aali Piya Bina"]
      }
    ],
    contributor: "Archivist Team"
  }
];

export default function BulkUploadClient() {
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);
  const [jsonData, setJsonData] = useState("");
  const [status, setStatus] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<"input" | "preview" | "success">("input");
  const [validatedItems, setValidatedItems] = useState<ValidationItem[]>([]);
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const [committedPayloadCopy, setCommittedPayloadCopy] = useState<string>("");
  const [activeMobileTab, setActiveMobileTab] = useState<"form" | "preview" | "guide">("form");
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalization & Validation Helper
  const processAndValidateJSON = (rawString: string): { items: ValidationItem[]; rawParsed: NormalizedBandish[] } => {
    let parsed: any;
    try {
      parsed = JSON.parse(rawString);
    } catch (e: any) {
      throw new Error(`Syntax Error: ${e.message}`);
    }

    const arrayData = Array.isArray(parsed) ? parsed : [parsed];

    if (arrayData.length === 0) {
      throw new Error("JSON array is empty. Please supply at least one composition.");
    }

    const items: ValidationItem[] = arrayData.map((item: any, idx: number) => {
      const issues: string[] = [];

      if (!item || typeof item !== "object") {
        return {
          bandish: { id: `item-${idx}`, title: `Item #${idx + 1}`, raag: "Unknown" },
          isValid: false,
          issues: ["Item is not a valid JSON object."]
        };
      }

      if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
        issues.push("Missing 'title'");
      }

      if (!item.raag || typeof item.raag !== "string" || !item.raag.trim()) {
        issues.push("Missing 'raag'");
      }

      // Auto-generate UUID if missing
      const id = item.id && typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `bandish-${Date.now()}-${idx}`);

      // Normalize lay to array
      let lay: string[] = [];
      if (Array.isArray(item.lay)) {
        lay = item.lay.map(String);
      } else if (typeof item.lay === "string" && item.lay.trim()) {
        lay = [item.lay.trim()];
      }

      const normalized: NormalizedBandish = {
        ...item,
        id,
        title: item.title ? String(item.title).trim() : `Untitled #${idx + 1}`,
        raag: item.raag ? String(item.raag).trim() : "Unknown",
        taal: item.taal ? String(item.taal).trim() : "Tintal",
        lay,
        composer: item.composer ? String(item.composer).trim() : "unknown",
        tradition: item.tradition ? String(item.tradition).trim() : "N/A",
        lyrics: item.lyrics && typeof item.lyrics === "object" ? {
          english: item.lyrics.english || "",
          devanagari: item.lyrics.devanagari || ""
        } : { english: "", devanagari: "" },
        youtube_renditions: Array.isArray(item.youtube_renditions) ? item.youtube_renditions : [],
        contributor: item.contributor ? String(item.contributor).trim() : "Anonymous"
      };

      return {
        bandish: normalized,
        isValid: issues.length === 0,
        issues
      };
    });

    const rawParsed = items.map((i) => i.bandish);
    return { items, rawParsed };
  };

  // Step 1: Transition to Review / Preview
  const handleProceedToPreview = () => {
    setStatus(null);
    if (!jsonData.trim()) {
      setStatus({ message: "Please paste or drop JSON data first.", type: "error" });
      return;
    }

    try {
      const { items } = processAndValidateJSON(jsonData);
      setValidatedItems(items);
      setActiveStep("preview");
      setActiveMobileTab("preview");
    } catch (e: any) {
      setStatus({ message: e.message, type: "error" });
    }
  };

  // Step 2: Commit Upload
  const handleBulkUpload = async () => {
    if (!passcode.trim()) {
      setPasscodeError(true);
      setStatus({ message: "Admin Passcode is required to commit changes.", type: "error" });
      return;
    }

    setPasscodeError(false);
    setIsSubmitting(true);
    setStatus(null);

    try {
      const payloadToUpload = validatedItems.map((v) => v.bandish);
      const response = await bulkAddBandishesSecurely(payloadToUpload, passcode);

      if (response.success) {
        setUploadedCount(payloadToUpload.length);
        setCommittedPayloadCopy(JSON.stringify(payloadToUpload, null, 2));
        setActiveStep("success");
        setStatus({ message: `Success! Added ${payloadToUpload.length} bandishes.`, type: "success" });
      } else {
        if (response.error?.toLowerCase().includes("passcode")) {
          setPasscodeError(true);
        }
        setStatus({ message: `Upload failed: ${response.error}`, type: "error" });
      }
    } catch (err: any) {
      setStatus({ message: `Unexpected error: ${err.message}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  };

  const readFile = (file: File) => {
    if (!file.name.endsWith(".json") && !file.name.endsWith(".txt")) {
      setStatus({ message: "Please upload a .json or .txt file.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setJsonData(content);
        setStatus(null);
      }
    };
    reader.onerror = () => {
      setStatus({ message: "Failed to read the file.", type: "error" });
    };
    reader.readAsText(file);
  };

  // Format / Prettify JSON
  const handleFormatJson = () => {
    if (!jsonData.trim()) return;
    try {
      const parsed = JSON.parse(jsonData);
      setJsonData(JSON.stringify(parsed, null, 2));
      setStatus(null);
    } catch (e: any) {
      setStatus({ message: `Cannot format invalid JSON: ${e.message}`, type: "error" });
    }
  };

  const handleLoadSample = () => {
    setJsonData(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
    setStatus(null);
  };

  const handleReset = () => {
    setActiveStep("input");
    setValidatedItems([]);
    setStatus(null);
  };

  const validCount = useMemo(() => validatedItems.filter((i) => i.isValid).length, [validatedItems]);
  const invalidCount = useMemo(() => validatedItems.filter((i) => !i.isValid).length, [validatedItems]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-12 flex justify-center">
      <div className="w-full max-w-[85rem] mt-4 md:mt-8">

        {/* Mobile/Tablet Segmented Control (< xl) */}
        <div className="xl:hidden mb-6 flex rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark p-1 animate-page-enter">
          <button
            type="button"
            onClick={() => setActiveMobileTab("form")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === "form"
                ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <span className="material-symbols-rounded text-base">edit_note</span>
            <span>Payload Editor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validatedItems.length > 0) {
                setActiveMobileTab("preview");
              } else {
                handleProceedToPreview();
              }
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === "preview"
                ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <span className="material-symbols-rounded text-base">table_view</span>
            <span>Review Table {validatedItems.length > 0 ? `(${validatedItems.length})` : ""}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMobileTab("guide")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === "guide"
                ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <span className="material-symbols-rounded text-base">menu_book</span>
            <span>Format Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Main Workspace Column */}
          <div
            className={`w-full xl:col-span-5 ${
              activeMobileTab === "form" ? "block" : "hidden xl:block"
            } xl:sticky xl:top-24 animate-page-enter animate-page-delay-1`}
          >
            <div className="bg-white dark:bg-m3-surface-container-dark p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark animate-modal-enter">
              {/* Header */}
              <div className="mb-6 text-center">
                <span className="material-symbols-rounded text-5xl text-m3-primary dark:text-m3-primary-dark mb-3 inline-block">
                  library_add
                </span>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white"
                  style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
                >
                  Bulk Uploader
                </h1>
                <p className="text-m3-secondary dark:text-m3-secondary-dark text-sm sm:text-base font-medium">
                  Add multiple compositions safely with validation and preview.
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeStep === "input"
                        ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                        : "bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Payload</span>
                </div>
                <div className="flex-1 h-0.5 mx-3 bg-m3-surface-high dark:bg-m3-surface-high-dark" />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeStep === "preview"
                        ? "bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900"
                        : activeStep === "success"
                        ? "bg-green-600 text-white"
                        : "bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Review</span>
                </div>
                <div className="flex-1 h-0.5 mx-3 bg-m3-surface-high dark:bg-m3-surface-high-dark" />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeStep === "success"
                        ? "bg-green-600 text-white"
                        : "bg-m3-surface-high dark:bg-m3-surface-high-dark text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Done</span>
                </div>
              </div>

              {/* STEP 1: INPUT */}
              {activeStep === "input" && (
                <div className="space-y-6">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark uppercase tracking-wider">
                      JSON Payload
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-xs font-bold text-m3-primary dark:text-m3-primary-dark hover:opacity-80 transition-opacity flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-sm">lightbulb</span>
                        <span>Load Sample</span>
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-sm">auto_fix_high</span>
                        Prettify
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-sm">upload_file</span>
                        Upload File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* Drop zone & Textarea */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative rounded-[1.5rem] border transition-colors ${
                      isDragOver
                        ? "border-m3-primary dark:border-m3-primary-dark bg-m3-primary/5"
                        : "border-m3-surface-high dark:border-m3-surface-high-dark"
                    }`}
                  >
                    <textarea
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleProceedToPreview();
                        }
                      }}
                      placeholder={`[\n  {\n    "title": "Example Composition",\n    "raag": "Yaman",\n    "taal": "Tintal",\n    "lay": ["Madhyalay"]\n  }\n]`}
                      className="w-full bg-m3-surface dark:bg-m3-surface-dark px-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-primary transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 min-h-[260px] font-mono text-sm resize-y m3-scrollbar leading-relaxed"
                      data-lenis-prevent="true"
                      onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                      onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
                    />

                    {isDragOver && (
                      <div className="absolute inset-0 bg-m3-primary/10 dark:bg-m3-primary-dark/10 rounded-[1.5rem] flex flex-col items-center justify-center pointer-events-none backdrop-blur-xs border-2 border-dashed border-m3-primary dark:border-m3-primary-dark">
                        <span className="material-symbols-rounded text-4xl text-m3-primary dark:text-m3-primary-dark mb-1 animate-pulse">
                          file_download
                        </span>
                        <span className="text-sm font-bold text-m3-primary dark:text-m3-primary-dark">
                          Drop .json or .txt file here
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>UUIDs will be auto-generated if omitted.</span>
                    <span>Press Ctrl + Enter to review</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToPreview}
                    className="w-full flex justify-center items-center gap-2 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 py-4 rounded-full font-bold transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-95"
                  >
                    <span className="material-symbols-rounded text-[1.3rem]">preview</span>
                    <span>Review & Validate Payload</span>
                  </button>
                </div>
              )}

              {/* STEP 2: PREVIEW & CONFIRMATION */}
              {activeStep === "preview" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Batch Overview</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {validatedItems.length} {validatedItems.length === 1 ? "composition" : "compositions"} ready for review
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep("input")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-m3-primary dark:text-m3-primary-dark hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-rounded text-base">edit</span>
                      <span>Edit JSON</span>
                    </button>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Valid Records</span>
                      <span className="text-xl font-bold text-green-700 dark:text-green-400">{validCount}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Issues Found</span>
                      <span
                        className={`text-xl font-bold ${
                          invalidCount > 0 ? "text-m3-error dark:text-m3-error-dark" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {invalidCount}
                      </span>
                    </div>
                  </div>

                  {/* Passcode input with neutral resting state */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span
                        className={`flex items-center gap-1.5 ${
                          passcodeError
                            ? "text-m3-error dark:text-m3-error-dark"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="material-symbols-rounded text-[1.1rem]">lock</span> Admin Passcode *
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors lowercase font-normal flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-sm">
                          {showPasscode ? "visibility_off" : "visibility"}
                        </span>
                        <span>{showPasscode ? "hide" : "show"}</span>
                      </button>
                    </label>

                    <input
                      type={showPasscode ? "text" : "password"}
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        if (passcodeError) setPasscodeError(false);
                      }}
                      placeholder="Enter admin passcode"
                      className={`w-full px-6 py-4 rounded-[1.5rem] transition-all duration-200 outline-none ${
                        passcodeError
                          ? "bg-m3-error/10 dark:bg-m3-error-dark/10 text-m3-error dark:text-m3-error-dark border-2 border-m3-error dark:border-m3-error-dark placeholder-m3-error/50"
                          : "bg-m3-surface dark:bg-m3-surface-dark text-gray-900 dark:text-white border border-m3-surface-high dark:border-m3-surface-high-dark focus:border-m3-primary dark:focus:border-m3-primary-dark placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep("input")}
                      disabled={isSubmitting}
                      className="px-5 py-4 rounded-full font-bold border border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 hover:bg-m3-surface-high/50 transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkUpload}
                      disabled={isSubmitting || invalidCount > 0}
                      className="flex-1 flex justify-center items-center gap-2 bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 py-4 rounded-full font-bold transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="material-symbols-rounded text-[1.4rem]">cloud_upload</span>
                      <span>{isSubmitting ? "Uploading..." : `Execute Bulk Insert (${validatedItems.length})`}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {activeStep === "success" && (
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 mx-auto flex items-center justify-center">
                    <span className="material-symbols-rounded text-4xl">check</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Successful!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                      Successfully saved <strong>{uploadedCount}</strong> compositions to the wiki database.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Link
                      href="/"
                      className="w-full py-3.5 rounded-full bg-m3-primary dark:bg-m3-primary-dark text-white dark:text-gray-900 font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-rounded text-lg">explore</span>
                      <span>Browse in Catalog</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full py-3 rounded-full border border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 font-bold hover:bg-m3-surface-high/50 transition-colors"
                    >
                      Upload Another Batch
                    </button>

                    {committedPayloadCopy && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(committedPayloadCopy);
                            setStatus({ message: "Payload JSON copied to clipboard for your records.", type: "success" });
                          } catch {
                            // ignore
                          }
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-m3-primary dark:hover:text-m3-primary-dark transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-rounded text-sm">content_copy</span>
                        <span>Copy Uploaded JSON Backup</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {status && (
                <div
                  className={`mt-6 px-5 py-4 rounded-2xl font-medium text-sm flex items-center gap-3 border transition-all ${
                    status.type === "error"
                      ? "bg-m3-error/10 dark:bg-m3-error-dark/15 text-m3-error dark:text-m3-error-dark border-m3-error/30 dark:border-m3-error-dark/30"
                      : "bg-green-100/70 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800/50"
                  }`}
                >
                  <span className="material-symbols-rounded shrink-0">
                    {status.type === "error" ? "error" : "check_circle"}
                  </span>
                  <span className="leading-snug">{status.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Review Table or Guide */}
          <div
            className={`w-full xl:col-span-7 ${
              activeMobileTab === "form" ? "hidden xl:block" : "block"
            } animate-page-enter animate-page-delay-2`}
          >
            {activeMobileTab === "guide" ? (
              <BulkGuide />
            ) : activeStep === "preview" ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-m3-surface-container-dark p-6 sm:p-8 rounded-[2.5rem] border border-m3-surface-high dark:border-m3-surface-high-dark">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2
                        className="text-2xl font-bold text-gray-900 dark:text-white"
                        style={{ fontVariationSettings: '"wght" 900, "wdth" 141, "ROND" 50' }}
                      >
                        Pre-Commit Review Table
                      </h2>
                      <p className="text-xs sm:text-sm text-m3-secondary dark:text-m3-secondary-dark mt-1 font-medium">
                        Verify the parsed metadata before executing the database commit.
                      </p>
                    </div>

                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-m3-surface dark:bg-m3-surface-dark border border-m3-surface-high dark:border-m3-surface-high-dark text-gray-700 dark:text-gray-300">
                      {validatedItems.length} Records
                    </span>
                  </div>

                  <div className="border border-m3-surface-high dark:border-m3-surface-high-dark rounded-2xl overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto m3-scrollbar overscroll-contain" data-lenis-prevent="true">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="sticky top-0 bg-m3-surface dark:bg-m3-surface-dark border-b border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold z-10">
                          <tr>
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Title</th>
                            <th className="py-3 px-4">Raag</th>
                            <th className="py-3 px-4">Taal & Lay</th>
                            <th className="py-3 px-4">Composer</th>
                            <th className="py-3 px-4 text-center">Renditions</th>
                            <th className="py-3 px-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-m3-surface-high dark:divide-m3-surface-high-dark bg-white dark:bg-m3-surface-container-dark">
                          {validatedItems.map((item, index) => (
                            <tr
                              key={item.bandish.id || index}
                              className="hover:bg-m3-surface/60 dark:hover:bg-m3-surface-dark/40 transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono text-gray-400 text-xs">{index + 1}</td>
                              <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white max-w-[200px] truncate">
                                {item.bandish.title}
                              </td>
                              <td className="py-3.5 px-4 text-m3-secondary dark:text-m3-secondary-dark font-medium">
                                {item.bandish.raag}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 text-xs">
                                <div>{item.bandish.taal}</div>
                                <div className="text-gray-400 text-[11px]">
                                  {Array.isArray(item.bandish.lay) && item.bandish.lay.length > 0
                                    ? item.bandish.lay.join(", ")
                                    : "No lay"}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 text-xs">
                                <div className="capitalize font-medium">{item.bandish.composer || "unknown"}</div>
                                {item.bandish.tradition && item.bandish.tradition !== "N/A" && (
                                  <div className="text-[11px] text-m3-tertiary dark:text-m3-tertiary-dark font-medium">
                                    {item.bandish.tradition} Gharana
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-600 dark:text-gray-300">
                                {item.bandish.youtube_renditions?.length || 0}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {item.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                                    <span className="material-symbols-rounded text-xs">check</span> Ready
                                  </span>
                                ) : (
                                  <span
                                    title={item.issues.join(", ")}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-m3-error dark:text-m3-error-dark bg-m3-error/10 dark:bg-m3-error-dark/20 px-2.5 py-1 rounded-full border border-m3-error/30"
                                  >
                                    <span className="material-symbols-rounded text-xs">warning</span> Issue
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile-only action shortcut under the table */}
                  <div className="xl:hidden mt-6 pt-6 border-t border-m3-surface-high dark:border-m3-surface-high-dark flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveMobileTab("form")}
                      className="flex-1 py-3.5 rounded-full font-bold border border-m3-surface-high dark:border-m3-surface-high-dark bg-m3-surface dark:bg-m3-surface-dark text-gray-700 dark:text-gray-300 hover:bg-m3-surface-high/50 transition-colors text-center text-sm"
                    >
                      Back to Editor / Commit Controls
                    </button>
                  </div>
                </div>

                {/* Collapsible reference guide below table on desktop */}
                <div className="hidden xl:block">
                  <BulkGuide />
                </div>
              </div>
            ) : (
              <BulkGuide />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}