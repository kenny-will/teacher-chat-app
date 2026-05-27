"use client"

import { useState, useEffect, useRef } from "react"
import { GlobeIcon, CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Language catalog ─────────────────────────────────────────────

const LANGUAGES = [
  { code: "en",    flag: "🇺🇸", native: "English",    english: "English"    },
  { code: "es",    flag: "🇪🇸", native: "Español",    english: "Spanish"    },
  { code: "fr",    flag: "🇫🇷", native: "Français",   english: "French"     },
  { code: "de",    flag: "🇩🇪", native: "Deutsch",    english: "German"     },
  { code: "pt",    flag: "🇧🇷", native: "Português",  english: "Portuguese" },
  { code: "it",    flag: "🇮🇹", native: "Italiano",   english: "Italian"    },
  { code: "ru",    flag: "🇷🇺", native: "Русский",    english: "Russian"    },
  { code: "zh-CN", flag: "🇨🇳", native: "中文",        english: "Chinese"    },
  { code: "ja",    flag: "🇯🇵", native: "日本語",      english: "Japanese"   },
  { code: "ko",    flag: "🇰🇷", native: "한국어",      english: "Korean"     },
  { code: "ar",    flag: "🇸🇦", native: "العربية",    english: "Arabic"     },
  { code: "hi",    flag: "🇮🇳", native: "हिन्दी",      english: "Hindi"      },
]

// ─── Helpers ──────────────────────────────────────────────────────

function readCookieLang(): string {
  if (typeof document === "undefined") return "en"
  const c = document.cookie.split("; ").find((r) => r.startsWith("googtrans="))
  if (!c) return "en"
  const code = c.split("/")[2] ?? "en"
  return code === "en" ? "en" : code
}

function applyLanguage(code: string) {
  if (code === "en") {
    // Clear the googtrans cookie on both host and root domain, then reload
    const host = window.location.hostname
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    window.location.reload()
    return
  }
  // Manipulate the hidden Google Translate select element
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null
  if (select) {
    select.value = code
    select.dispatchEvent(new Event("change"))
  } else {
    // Widget hasn't initialised yet — set cookie and reload
    document.cookie = `googtrans=/en/${code}; path=/`
    window.location.reload()
  }
}

// ─── Language Switcher ────────────────────────────────────────────

interface LanguageSwitcherProps {
  /** "landing" = pill button for the light landing navbar;
   *  "dashboard" = icon button for the dark dashboard header */
  variant?: "landing" | "dashboard"
}

export function LanguageSwitcher({ variant = "dashboard" }: LanguageSwitcherProps) {
  const [open, setOpen]       = useState(false)
  const [current, setCurrent] = useState("en")
  const ref = useRef<HTMLDivElement>(null)

  // Hydrate from cookie after mount
  useEffect(() => { setCurrent(readCookieLang()) }, [])

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  function select(code: string) {
    setCurrent(code)
    setOpen(false)
    applyLanguage(code)
  }

  const lang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]

  const isDashboard = variant === "dashboard"

  // ── Landing variant ────────────────────────────────────────────

  // if (variant === "landing") {
  //   return (
  //     <div ref={ref} className="relative">
  //       <button
  //         onClick={() => setOpen((o) => !o)}
  //         aria-label="Change language"
  //         className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 h-9 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
  //       >
  //         <span className="text-[16px] leading-none">{lang.flag}</span>
  //         <span className="hidden sm:inline">{lang.native}</span>
  //         <ChevronDownIcon
  //           className={cn("h-3 w-3 text-gray-400 transition-transform duration-200", open && "rotate-180")}
  //         />
  //       </button>

  //       {open && (
  //         <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-gray-200 bg-white shadow-[0_8px_32px_-8px_rgba(10,12,18,.18),0_2px_6px_rgba(10,12,18,.06)] overflow-hidden z-[200]">
  //           <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
  //             <GlobeIcon className="h-3.5 w-3.5 text-gray-400" />
  //             <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Language</span>
  //           </div>
  //           <div className="max-h-72 overflow-y-auto py-1">
  //             {LANGUAGES.map((l) => (
  //               <button
  //                 key={l.code}
  //                 onClick={() => select(l.code)}
  //                 className={cn(
  //                   "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
  //                   current === l.code
  //                     ? "bg-blue-50 text-blue-600"
  //                     : "text-gray-700 hover:bg-gray-50"
  //                 )}
  //               >
  //                 <span className="text-[18px] leading-none shrink-0">{l.flag}</span>
  //                 <span className="flex-1 text-[13px] font-medium">{l.native}</span>
  //                 <span className="text-[11px] text-gray-400 shrink-0">{l.english}</span>
  //                 {current === l.code && <CheckIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
  //               </button>
  //             ))}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   )
  // }

  // ── Dashboard variant (icon button) ───────────────────────────

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        title="Change language"
        className={cn(
          "h-9 w-9 grid place-items-center rounded-lg border border-gray-200 dark:border-white/10",
          "text-gray-600 dark:text-gray-400 hover:bg-green-600 dark:hover:bg-white/8 transition-colors relative",
          open && "bg-gray-50 dark:bg-white/8 border-gray-300 dark:border-white/20"
        )}
      >
        <GlobeIcon className="h-4 w-4 text-white " />
        {current !== "en" && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-[#2A5CFF] text-[10px] text-white font-bold leading-none pointer-events-none">
            {lang.flag}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-[0_12px_40px_-12px_rgba(0,0,0,.35)] overflow-hidden z-[200]">
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-white/8 flex items-center gap-2">
            <GlobeIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Language
            </span>
            {current !== "en" && (
              <span className="ml-auto text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                {lang.native} active
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => select(l.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                  current === l.code
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <span className="text-[18px] leading-none shrink-0">{l.flag}</span>
                <span className="flex-1 text-[13px] font-medium">{l.native}</span>
                {current === l.code
                  ? <CheckIcon className="h-3.5 w-3.5 shrink-0" />
                  : <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{l.english}</span>
                }
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
