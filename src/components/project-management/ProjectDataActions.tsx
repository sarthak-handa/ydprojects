"use client";

import { useRef, useState } from "react";

interface ProjectDataActionsProps {
  projectId: number;
}

export default function ProjectDataActions({
  projectId,
}: ProjectDataActionsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  async function handleImport(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setIsImporting(true);
    await fetch("/api/import", {
      method: "POST",
      body: formData,
    });
    setIsImporting(false);
    window.location.reload();
  }

  return (
    <>
      <a className="btn btn-outline" href={`/api/export/${projectId}`}>
        Export Planning
      </a>
      <button
        className="btn btn-primary"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {isImporting ? "Importing..." : "Import Planning"}
      </button>
      <input
        ref={inputRef}
        hidden
        accept=".xlsx"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImport(file);
          }
        }}
      />
    </>
  );
}
