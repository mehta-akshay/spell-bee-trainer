import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { 
  Volume2, Check, X, ArrowRight, RefreshCw, Trophy, 
  Edit3, Play, FastForward, Mic, MicOff, Square 
} from 'lucide-react';
import './index.css';

// --- Type Definitions ---
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionError {
  error: string;
}

// Define a flexible interface for the recognition instance since it's experimental
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
}

const DEFAULT_WORDS: string[] = [
  // Page 1
  "tag", "twigs", "insects", "moment", "send", "taffy", "teeth", "ajar", 
  "deck", "comfy", "shortcut", "basil", "stuck", "stretch", "bait", "triple", 
  "snug", "tight", "lure", "satin", "fish", "candy", "cluster", "ahoy", 
  "hold", "scrunch", "forest", "signal", "mind", "ruby", "hollow", "answer", 
  "stay", "close", "spinning", "shuffle", "scrub", "tackle", "baffling", "dollop", 
  "draw", "wire", "sizzling", "minnows", "brown", "skater", "hoist", "silver", 
  "cozy", "giant", "search", "before", "bucket", "remind", "circus", "tint", 
  "chance", "mango", "writing", "milk", "baskets", "coral", "kitchen", "yawn", 
  "tender", "jangle", "sugar", "tank", "paste", "shimmer", "awkward", "want", 
  "melon", "blossoms", "seep", "crowd", "farmer", "swampy", "sweet", "pond", 
  "parent", "studded", "wheels", "skirt", "tail", "focus", "faint", "sharks", 
  "hockey", "distress", "fruit", "quilt", "slime", "lessons", "roam",
  
  // Page 2
  "goats", "disability", "avocado", "woozy", "incredible", "valentine", "limbs", 
  "leather", "February", "ahead", "countess", "formation", "señor", "nervous", 
  "especially", "unicorn", "peppercorn", "faraway", "cartwheel", "heater", "raise", 
  "pirates", "weather", "understand", "zooming", "wooden", "attacked", "leaning", 
  "turnout", "breakfast", "eaten", "window", "streetlights", "acrobat", "journey", 
  "chocolate", "message", "courtyard", "shouting", "forepaw", "asleep", "elephant", 
  "curious", "hedgehog", "dinosaur", "recipe", "brilliant", "garbage", "vacuum", 
  "surprise", "gorgeous", "mermaid", "monsoon", "bombarded", "dangerous",

  // Page 3
  "hesitate", "Buffalo", "dubious", "dissolving", "scorcher", "sequins", "ebony", 
  "nomad", "scavenger", "fragments", "gallop", "fabulous", "foreign", "billowed", 
  "paltry", "skewer", "deflated", "lanky", "verdict", "Berlin", "unleash", "fluently", 
  "garbled", "lunacy", "ration", "mysterious", "encourages", "conjure", "cosmetics", 
  "brandished", "imitation", "bracken", "crawdad", "sardines", "miniature", "noggin", 
  "frustration", "anguish", "receptionist", "neon", "unruly", "conical", "preamble", 
  "rakish", "mascot", "rickety", "plausible", "hypnosis", "aroma", "lilt", "reprimanding", 
  "rotunda", "moustache", "pediatric", "commotion", "gusto", "porridge", "oblivion", 
  "toiletries", "artifacts", "democracy", "immigrants", "gleaned", "rummage", "steeple", 
  "jeered", "perfume", "beige", "spectators", "winsome", "sinister", "ancestral", 
  "lanyards", "prattling", "tuxedo", "grimace", "suspicious", "galore", "discoveries", 
  "gaunt", "parchment", "emporium", "lurches", "enormous", "ramshackle", "atrium", 
  "language", "geranium", "fugitive", "eccentric", "prognosis", "nautical", "heron", "savant",

  // Page 4
  "almanac", "talcum", "hippies", "samosas", "tranquilizer", "equestrian", "chignon", 
  "pheromone", "campaign", "plaited", "galleon", "magnanimous", "pistachio", "monsieur", 
  "chartreuse", "mosque", "manticores", "wainscoting", "zombielike", "prestigious", "Nehru", 
  "warlock", "fraidycat", "colossus", "guttural", "convulsively", "lo mein", "dimensional", 
  "courier", "garishly", "sans serif", "graffitist", "psyche", "Everest", "stucco", 
  "dexterity", "Frankenstein", "cavorting", "schema", "marauder", "et cetera", "conscience", 
  "vidimus", "battlements", "delphine", "deferential", "slough", "albatross", "archipelago", 
  "khaki", "serape", "opalescent", "asphalt", "puissance", "Yiddish", "pinioning",

  // Page 5
  "gangly", "comrades", "ultimatum", "swaggering", "sporadic", "whinnying", "prototype", 
  "cravenly", "chimneys", "promenade", "squalor", "mulberry", "riveted", "repugnant", 
  "memoirs", "hypocritical", "plaid", "invincible", "cylinders", "chlorine", "dirge", 
  "renowned", "ominous", "traumatic", "zeal", "parachute", "muffler", "receipts", "whittled", 
  "laborious", "syndrome", "solemnly", "depots", "appointment", "premises", "begrudge", 
  "fiberglass", "foreseeable", "safari", "contentious", "salvaged", "ratify", "lasagna", 
  "precocious", "fissures", "scalpel", "substantially", "ensemble", "enthusiastic", 
  "reclusive", "mercantile", "cadre", "discipline", "compassionate", "formidable", "lye", 
  "unfamiliar", "bulletin", "propaganda", "belfry", "scurrying", "alfalfa", "marquee", 
  "lacrosse", "dignitaries", "officially", "proficient", "sluice", "pizzeria", "crematorium", 
  "compunction", "cajolery", "dismissal", "bayonet", "emphatically", "vigilance", "skittish", 
  "amicable", "hyperventilated", "residuals", "careened", "exuberant", "ostracism", 
  "boutique", "nomination", "beautician", "onslaught", "peroxide", "opportunist", "equations", 
  "ruefully", "aristocracy", "dictatorship", "assignment", "misanthrope", "apocalypse",

  // Page 6
  "tuberculosis", "patriarchs", "boll weevil", "barricade", "chandelier", "camphor", 
  "confreres", "dulce", "Tucson", "Oswego", "diphtheria", "baklava", "anonymously", 
  "concierge", "paparazzi", "corbels", "unparalleled", "latticework", "pumpernickel", 
  "trebuchets", "barrette", "hibiscus", "pogrom", "Kilimanjaro", "chassis", "tamale", 
  "bursitis", "fräulein", "junket", "maracas", "pâtisserie", "protégé", "quandary", 
  "gyroplane", "cycads", "hors d'oeuvres", "Erie", "burpees", "sarsaparilla", "maquisards", 
  "gingham", "Adriatic", "maître d'", "Aubusson", "silhouette", "piccolo", "cannelloni", 
  "Charolais", "auxiliary", "au revoir", "thesaurus", "tulle", "bronchitis"
];

export default function App() {
  // State
  const [wordList] = useState<string[]>(DEFAULT_WORDS);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect" | "revealed">("idle");
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [autoAdvance] = useState(true);
  const [autoListen, setAutoListen] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkSpellingRef = useRef<((inputOverride?: string | null) => void) | null>(null);
  const currentWordRef = useRef<string | null>(null);
  const manualStopRef = useRef(false);
  const spelledInputRef = useRef<string>("");
  const lastDisplayRef = useRef<string>("");



  // Initialize Voices & Speech Recognition
  useEffect(() => {
    // Voices
    const loadVoices = () => {
      const availVoices = window.speechSynthesis.getVoices();
      setVoices(availVoices);
      const preferred = availVoices.find(v => v.name.includes("Google US English")) || 
                        availVoices.find(v => v.lang === "en-US") || 
                        availVoices[0];
      setVoice(preferred || null);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Speech Recognition Support Check
    // Cast window to any to allow checking for non-standard SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setHasSpeechSupport(true);
    }
  }, []);

  const speak = useCallback((text: string, onEndCallback: (() => void) | null = null) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
  }, [voice]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || (target as HTMLElement | null)?.isContentEditable;

      if (event.code === 'Space' && !isTyping) {
        event.preventDefault();
        if (currentWord) speak(currentWord);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, speak]);

  // Speech Recognition Logic
  const startListening = useCallback(() => {
    if (!hasSpeechSupport) return;
    
    // Safety check
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
    }
    
    // Cast window to any to access the constructors
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor() as ISpeechRecognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      spelledInputRef.current = "";
      lastDisplayRef.current = "";
      setUserInput(""); 
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resetSilenceTimer();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (!text) continue;

        if (result.isFinal) {
          console.log('Final transcript:', text);

          const words = text.split(/\s+/).filter(w => w.length > 0);
          const MAX_LETTER_LENGTH = 4;
          const letterTokens = words.filter(word => word.length <= MAX_LETTER_LENGTH);
          const longWords = words.filter(word => word.length > MAX_LETTER_LENGTH);

          if (longWords.length > 0) {
            console.log('🚫 Ignoring long words:', longWords.join(', '));
          }

          if (letterTokens.length === 0) {
            continue;
          }

          const append = letterTokens.join('');
          spelledInputRef.current = spelledInputRef.current
            ? `${spelledInputRef.current}${append}`
            : append;
        }
      }

      const display = spelledInputRef.current;
      if (display !== lastDisplayRef.current) {
        lastDisplayRef.current = display;
        setUserInput(display);
      }
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      console.log("Speech recognition error", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        setMicPermissionGranted(false);
      }
      // Safari iOS sometimes throws 'no-speech' or 'aborted' - don't treat as fatal
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if user didn't manually stop and we're in idle state
      // This helps with Safari iOS which sometimes stops recognition unexpectedly
      if (!manualStopRef.current && currentWordRef.current && autoListen) {
        setTimeout(() => {
          if (!manualStopRef.current && recognitionRef.current === null) {
            startListening();
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSpeechSupport]); // omitting resetSilenceTimer from dependency to avoid cycles, it's a ref-based helper

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const getRandomWord = () => {
    if (wordList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
  };

  const handleNewWord = useCallback(() => {
    const word = getRandomWord();
    if (word) {
      setCurrentWord(word);
      setUserInput("");
      setStatus("idle");
      manualStopRef.current = false;
      stopListening(); 
      
      speak(word);
      // Only auto-start mic if user has explicitly granted permission by clicking mic before
      if (autoListen && micPermissionGranted) {
        setTimeout(() => {
          startListening();
        }, 400);
      }
      
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordList, speak, startListening, stopListening, autoListen, micPermissionGranted]);

  // Effect for Auto-Advance
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (status === 'correct' && autoAdvance) {
      timeoutId = setTimeout(() => {
        handleNewWord();
      }, 2500); 
    }
    return () => clearTimeout(timeoutId);
  }, [status, autoAdvance, handleNewWord]);

  // The Logic to Check Spelling
  const checkSpelling = useCallback((inputOverride: string | null = null) => {
    if (!currentWord || status === "correct") return;

    const textToCheck = inputOverride !== null ? inputOverride : userInput;
    const normalize = (str: string) => str.replace(/[\s\W_]+/g, '').toLowerCase();
    
    const normInput = normalize(textToCheck);
    const normTarget = normalize(currentWord);

    stopListening(); // Stop listening once we check

    if (normInput === normTarget) {
      setStatus("correct");
      setStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1
      }));
      speak("Correct! " + currentWord);
    } else {
      setStatus("incorrect");
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        streak: 0
      }));
      speak("Let's try again.");
      // Reset for retry and auto-restart listening if enabled
      spelledInputRef.current = "";
      lastDisplayRef.current = "";
      setUserInput("");
      
      // Only auto-restart if autoListen is on AND user haven't manually stopped the mic for this word
      if (autoListen && !manualStopRef.current) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    }
  }, [currentWord, status, userInput, speak, stopListening, autoListen, startListening]);

  // Keep refs updated
  useEffect(() => {
    checkSpellingRef.current = checkSpelling;
    currentWordRef.current = currentWord;
  }, [checkSpelling, currentWord]);

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    silenceTimerRef.current = setTimeout(() => {
      // 3 Seconds of silence AFTER speaking starts -> Submit
      stopListening();
      setTimeout(() => {
        const hasSpelledInput = spelledInputRef.current.trim().length > 0;
        if (!hasSpelledInput) {
          // User never started spelling; do not mark incorrect
          return;
        }
        if (checkSpellingRef.current) checkSpellingRef.current();
      }, 100);
    }, 3000);
  };

  const handleMicToggle = () => {
    if (isListening) {
      manualStopRef.current = true;
      stopListening();
    } else {
      manualStopRef.current = false;
      setMicPermissionGranted(true); // User explicitly clicked mic
      startListening();
    }
  };

  const handleManualCheck = (e?: FormEvent) => {
    e?.preventDefault();
    if (isListening) {
      stopListening();
      setTimeout(() => {
         if (checkSpellingRef.current) checkSpellingRef.current();
      }, 100);
    } else {
      checkSpelling();
    }
  };

  const handleReveal = () => {
    stopListening();
    setStatus("revealed");
    setStats(prev => ({ ...prev, streak: 0 }));
    if (currentWord) speak(`The word is ${currentWord}`);
  };

  return (
    <div className="app-root min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans text-gray-800">
      
      {/* Header & Stats */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <Edit3 size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">SpellMaster</h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex flex-col items-end">
            <span className="text-green-600 flex items-center gap-1">
              <Check size={14} /> {stats.correct}/{stats.total}
            </span>
            <span className="text-orange-500 flex items-center gap-1">
              <Trophy size={14} /> Streak: {stats.streak}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      <div className="app-card w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        {/* Game Content */}
        {!currentWord ? (
          <div className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Volume2 size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to Practice?</h2>
            <p className="text-gray-500 mb-8">
              <span className="text-xs text-gray-400 mt-2 block">
                {autoAdvance ? "Auto-advance is ON" : "Auto-advance is OFF"}
              </span>
            </p>
            <button
              onClick={handleNewWord}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Play size={20} fill="currentColor" /> Start Quiz
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col h-full">
            
            {/* Top Bar Indicators */}
            <div className="flex justify-end items-start">
               <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2">
                   {autoAdvance && (
                     <div className="flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                       <FastForward size={10} /> Auto-Next
                     </div>
                   )}
                   <label className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                     <input
                       type="checkbox"
                       checked={autoListen}
                       onChange={(e) => setAutoListen(e.target.checked)}
                       className="w-3 h-3 text-blue-600 rounded"
                     />
                     Auto-Listen
                   </label>
                 </div>
                 {voices.length > 1 && (
                   <select
                     value={voice ? `${voice.name}|||${voice.lang}` : ""}
                     onChange={(e) => {
                       const selected = voices.find(v => `${v.name}|||${v.lang}` === e.target.value);
                       setVoice(selected || null);
                     }}
                     className="text-[10px] text-gray-600 bg-white px-2 py-1 rounded border border-gray-200"
                   >
                     {voices.map((v) => (
                       <option key={`${v.name}|||${v.lang}`} value={`${v.name}|||${v.lang}`}>
                         {v.name}
                       </option>
                     ))}
                   </select>
                 )}
               </div>
            </div>

            {/* Audio Control */}
            <div className="flex justify-center mb-6 mt-4 relative">
              <button
                onClick={() => currentWord && speak(currentWord)}
                className="relative group w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                title="Replay Audio"
              >
                <Volume2 size={40} className="text-white" />
                <span className="absolute -bottom-8 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Replay Word
                </span>
              </button>
              
              {/* Mic Button positioned to the right of the main button */}
              {hasSpeechSupport && (
                <button
                  onClick={handleMicToggle}
                  disabled={status === "correct" || status === "revealed"}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all
                    ${isListening 
                      ? "bg-red-500 text-white animate-pulse ring-4 ring-red-100" 
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={isListening ? "Stop Microphone" : "Speak Answer"}
                >
                  {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}
                </button>
              )}
            </div>

            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => currentWord && speak(currentWord)}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
              >
                Repeat Word
              </button>
            </div>

            {/* Status Feedback */}
            <div className="h-8 mb-2 flex justify-center items-center">
              {isListening ? (
                 <span className="text-blue-600 font-semibold flex items-center gap-2 animate-pulse text-sm">
                   Listening... {userInput ? "(Speak to reset timer)" : "(Thinking...)"}
                 </span>
              ) : (
                <>
                  {status === "correct" && (
                    <span className="text-green-600 font-bold flex items-center gap-2 animate-bounce">
                      <Check size={20} /> Correct!
                    </span>
                  )}
                  {status === "incorrect" && (
                    <span className="text-red-500 font-bold flex items-center gap-2 animate-pulse">
                      <X size={20} /> Incorrect, try again
                    </span>
                  )}
                  {status === "revealed" && (
                    <span className="text-yellow-600 font-bold flex items-center gap-2">
                       The word is: {currentWord}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleManualCheck} className="flex flex-col gap-4">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type what you hear..."}
                disabled={status === "correct" || status === "revealed"}
                className={`w-full text-center text-2xl p-4 border-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-300
                  ${status === "correct" 
                    ? "border-green-500 bg-green-50 text-green-700" 
                    : status === "incorrect" 
                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500" 
                      : isListening
                        ? "border-blue-400 bg-blue-50 ring-4 ring-blue-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  }
                `}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(status === "correct" || status === "revealed") ? (
                  <button
                    type="button"
                    onClick={handleNewWord}
                    autoFocus
                    className="col-span-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {autoAdvance && status === 'correct' ? (
                      <>Nice</>
                    ) : (
                      <>Next Word <ArrowRight size={20} /></>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleReveal}
                      disabled={isListening}
                      className="py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                      I Give Up
                    </button>
                    <button
                      type="submit"
                      disabled={(!userInput && !isListening)}
                      className={`py-3 text-white rounded-xl font-bold shadow-md transition-all
                        ${isListening 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                      `}
                    >
                      {isListening ? "Stop & Check" : "Check Spelling"}
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
               <button 
                 onClick={handleNewWord} 
                 className="text-xs text-gray-400 hover:text-blue-500 flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                 <RefreshCw size={12} /> Skip to new word
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-gray-400 text-xs max-w-xs">
        <div className="flex items-center justify-center gap-2 mb-1">
          {hasSpeechSupport ? <Mic size={12} /> : <MicOff size={12} />}
          <span>{hasSpeechSupport ? "Voice input supported (Chrome/Safari)" : "Voice input not supported in this browser"}</span>
        </div>
        Make sure your volume is up.
      </div>
    </div>
  );
}