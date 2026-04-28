"use client";

import React, { useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function PinInput({ length = 6, value, onChange, className }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newVal = value.split("");
      if (value[index]) {
        // Clear current box if there's a char
        newVal[index] = "";
        onChange(newVal.join(""));
      } else if (index > 0) {
        // Clear previous box and focus it
        newVal[index - 1] = "";
        onChange(newVal.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.slice(-1);
    if (!/^[0-9]$/.test(char)) return; // Only numbers

    const newVal = value.split("");
    newVal[index] = char;
    onChange(newVal.join(""));

    // Move to next box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData.padEnd(length, "").slice(0, length));
      // Focus last filled box
      const targetIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }} // Ensure it returns void using {}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={value[i] ? 2 : 1}
          value={value[i] || ""}
          onChange={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold font-display rounded-xl border border-black/10 dark:border-white/20 bg-white/50 dark:bg-black/40 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-inner"
        />
      ))}
    </div>
  );
}
