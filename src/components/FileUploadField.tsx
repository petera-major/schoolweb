"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

export default function FileUploadField({
  name,
  label,
  required = false,
  onFileChange,
}: {
  name: string;
  label: string;
  required?: boolean;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | null) {
    setError(null);
    if (!file) {
      setFileName(null);
      onFileChange(null);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a JPG, PNG, HEIC, or PDF file.");
      setFileName(null);
      onFileChange(null);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File is too large. Max size is 8MB.");
      setFileName(null);
      onFileChange(null);
      return;
    }
    setFileName(file.name);
    onFileChange(file);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    handleFile(null);
  }

  return (
    <div>
      <label className="font-bold text-sm mb-1.5 block">
        {label} {required && <span className="text-[var(--orange-dark)]">*</span>}
        {!required && <span className="opacity-50 font-normal"> (optional)</span>}
      </label>

      <div
        className={`relative wobble border-2 ${
          fileName ? "border-[var(--sky-dark)] bg-[var(--sky)]/15" : "border-dashed border-[var(--ink)]/20 bg-white"
        } px-4 py-3.5 flex items-center gap-3 transition-colors`}
      >
        {fileName ? (
          <FileCheck2 className="w-5 h-5 text-[var(--sky-dark)] flex-shrink-0" />
        ) : (
          <UploadCloud className="w-5 h-5 opacity-40 flex-shrink-0" />
        )}

        <span className="text-sm flex-1 truncate">
          {fileName ?? "Tap to take a photo or choose a file"}
        </span>

        {fileName ? (
          <button
            type="button"
            onClick={clear}
            aria-label={`Remove ${label}`}
            className="p-1 rounded-full hover:bg-[var(--ink)]/10 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          required={required}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-xs text-[var(--orange-dark)] font-bold mt-1.5">{error}</p>}
    </div>
  );
}
