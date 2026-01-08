"use client";

import { useEffect } from "react";
// IMPORT THE REAL FORM WE JUST BUILT
import { TransactionForm } from "./TransactionForm";

export function SidePanelOverlay({
  open,
  mode, // This will basically always be "createEscrow" now
  onClose,
  onAfterSubmit,
}) {
  const isCreate = mode === "createEscrow";

  // Lock body scroll when panel is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex font-mono" aria-modal="true" role="dialog">
      {/* 1. Backdrop (Click to close) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in transition-opacity"
        onClick={onClose}
      />

      {/* 2. Sliding Panel */}
      <div className="relative ml-auto h-full w-full max-w-md shadow-2xl">
        <div
          className="h-full bg-slate-950 border-l border-slate-800 
                     animate-slide-in-right flex flex-col p-6 text-sm text-slate-200"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isCreate ? "Create Escrow" : "Details"}
            </h2>
            <button
              type="button"
              className="text-slate-400 hover:text-white transition-colors p-2"
              onClick={onClose}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto">
            {isCreate ? (
              /* Pass the onClose handler so the Success screen can close the panel */
              <TransactionForm onClose={onClose} onAfterSubmit={onAfterSubmit} />
            ) : (
              <div className="text-slate-500">Unknown Mode</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
