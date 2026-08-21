"use client";

import { useId, useState, useRef, DragEvent } from "react";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onUpload: (file: File) => Promise<void>;
}

export default function FileUpload({
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 5,
  onUpload,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const statusId = `${inputId}-status`;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  async function processFile(file: File) {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext || "")) {
      setError("Only PDF and Word documents are supported.");
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        aria-describedby={`${helpId} ${statusId}`}
      />
      <button
        type="button"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 dark:focus-visible:ring-forest-muted/40 ${
          isDragging
            ? "border-forest dark:border-forest-muted bg-forest/5 dark:bg-forest-muted/5"
            : "border-border dark:border-border-dark hover:border-forest/50 dark:hover:border-forest-muted/50 hover:bg-surface-warm dark:hover:bg-surface-dark-warm"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-forest dark:text-forest-muted animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
              <p className="text-sm text-muted dark:text-muted-dark">Uploading your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-deep dark:bg-surface-dark-deep flex items-center justify-center">
              <svg className="w-6 h-6 text-muted dark:text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-ink dark:text-ink-dark mb-1">
                Drop your resume here or click to browse
              </p>
              <p id={helpId} className="text-xs text-muted dark:text-muted-dark">
                PDF or Word document, up to {maxSizeMB}MB. You can also drag and drop a file here.
              </p>
            </div>
          </div>
        )}
      </button>

      <p id={statusId} className="sr-only" aria-live="polite">
        {uploading ? "Uploading your resume" : error || ""}
      </p>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
