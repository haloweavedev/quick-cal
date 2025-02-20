"use client";
import { useState } from "react";

interface SyncButtonProps {
  accountId: string;
}

export default function SyncButton({ accountId }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch(`/api/accounts/${accountId}/sync`);
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      console.error("Error syncing:", error);
      setResult({ error: error.message });
    }
    setSyncing(false);
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          border: "2px solid black",
          background: "white",
          marginBottom: "10px",
        }}
      >
        {syncing ? "Syncing..." : "Sync Calendar"}
      </button>
      {result && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
