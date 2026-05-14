import { useCallback, useRef, useState } from "react";

const ICONS = {
  pdf: (
    <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  image: (
    <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  type = "pdf",         // "pdf" | "image"
  files,                // array of File objects (controlled)
  onChange,             // (files: File[]) => void
  maxFiles = 1,
  maxSizeMB = 10,
  label,
  hint,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const accept = type === "pdf" ? ".pdf" : ".jpg,.jpeg,.png,.webp";
  const multiple = maxFiles > 1;

  const validate = useCallback(
    (fileList) => {
      const valid = [];
      let err = "";

      for (const f of fileList) {
        if (type === "pdf" && !f.type.includes("pdf")) {
          err = "Carica solo file PDF.";
          continue;
        }
        if (type === "image" && !f.type.startsWith("image/")) {
          err = "Carica solo immagini (JPG, PNG).";
          continue;
        }
        if (f.size > maxSizeMB * 1024 * 1024) {
          err = `Il file "${f.name}" supera i ${maxSizeMB} MB consentiti.`;
          continue;
        }
        valid.push(f);
      }

      if (files.length + valid.length > maxFiles) {
        err = `Massimo ${maxFiles} file consentiti.`;
        return { valid: valid.slice(0, maxFiles - files.length), err };
      }

      return { valid, err };
    },
    [type, maxSizeMB, maxFiles, files]
  );

  const handleFiles = useCallback(
    (fileList) => {
      const arr = Array.from(fileList);
      const { valid, err } = validate(arr);
      setError(err);
      if (valid.length > 0) {
        onChange(multiple ? [...files, ...valid] : [valid[0]]);
      }
    },
    [validate, onChange, files, multiple]
  );

  const onInputChange = (e) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setError("");
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}

      {/* Drop zone */}
      {(files.length < maxFiles) && (
        <div
          className={`dropzone ${dragOver ? "drag-over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            {ICONS[type] || ICONS.pdf}
            <p className="text-sm font-medium text-gray-600">
              Trascina qui il file oppure{" "}
              <span className="text-verde-italia font-semibold">sfoglia</span>
            </p>
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-gray-700 truncate">{f.name}</span>
                <span className="text-xs text-gray-400 shrink-0">{formatBytes(f.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Rimuovi file"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
