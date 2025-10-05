"use client";

import { Moon, Sun } from "lucide-react";
import React, { useState, useEffect } from "react";

interface HeaderProps {
  sidebarWidth?: number;
}

export default function Header({ sidebarWidth = 240 }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header
      className={`h-16 flex items-center justify-between px-6 shadow-md fixed top-0 z-50 w-full max-w-full overflow-hidden transition-all duration-300 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
      style={{ left: sidebarWidth, width: `calc(100vw - ${sidebarWidth}px)` }}
    >
      <div className="flex items-center gap-2 min-w-0"></div>
      <div className="flex items-center gap-4 min-w-0">
        <button
          className={`px-4 py-2 cursor-pointer rounded-full font-semibold transition whitespace-nowrap ${
            darkMode
              ? "bg-primary text-black hover:bg-blue-300"
              : "bg-primary text-white hover:bg-blue-400"
          }`}
        >
          Download
        </button>
        <button
          className={
            "px-4 py-2 rounded-full font-semibold transition whitespace-nowrap cursor-pointer"
          }
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Moon /> : <Sun />}
        </button>
        <button
          className={`bg-transparent cursor-pointer ${
            darkMode ? "text-white" : "text-black"
          } p-2 rounded-full hover:bg-white/10 transition`}
        >
          <span className="relative">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-bell"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
          </span>
        </button>
        <button
          className={`bg-transparent cursor-pointer ${
            darkMode ? "text-white" : "text-black"
          } p-2 rounded-full hover:bg-white/10 transition`}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-file"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </button>
        <button
          className={`bg-transparent cursor-pointer ${
            darkMode ? "text-white" : "text-black"
          } p-2 rounded-full hover:bg-white/10 transition`}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-heart"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
