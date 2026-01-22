import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { 
  Volume2, Check, RefreshCw, Trophy, 
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
  const [shownWords, setShownWords] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<'all' | 1 | 2 | 3 | 4 | 5 | 6>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
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
  const shouldAutoRestartRef = useRef(true);
  const restartAttemptCountRef = useRef(0);
  const [silenceCountdown, setSilenceCountdown] = useState(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);



  // Initialize Voices & Speech Recognition
  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('spellmaster_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }

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

    const extractLetterTokens = (raw: string) => {
      const tokens = raw
        .split(/\s+/)
        .map(token => token.replace(/[^a-z]/gi, ''))
        .filter(Boolean);
      const letterTokens = tokens.filter(token => /^[a-z]$/i.test(token));
      const longWords = tokens.filter(token => token.length > 1);
      return { letterTokens, longWords };
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resetSilenceTimer();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (!text) continue;

        if (result.isFinal) {
          console.log('Final transcript:', text);

          const { letterTokens, longWords } = extractLetterTokens(text);

          if (longWords.length > 0) {
            console.log('🚫 Ignoring long words (full words):', longWords.join(', '));
          }

          if (letterTokens.length === 0) {
            continue;
          }

          const append = letterTokens.join('');
          spelledInputRef.current = spelledInputRef.current
            ? `${spelledInputRef.current}${append}`
            : append;
        } else {
          // Show interim results only if they look like letter spelling (short tokens)
          if (text.length > 0) {
            const { letterTokens, longWords } = extractLetterTokens(text);
            
            // Only show interim if it looks like letter spelling, not full words
            if (letterTokens.length > 0 && longWords.length === 0) {
              const interim = letterTokens.join('');
              setUserInput(interim);
            }
            // If user is speaking full words, ignore completely - don't update textbox
          }
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
      let errorMsg = "Microphone error";
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = "Microphone permission denied";
        setIsListening(false);
        setMicPermissionGranted(false);
        shouldAutoRestartRef.current = false;
        manualStopRef.current = true;
      } else if (event.error === 'no-speech') {
        errorMsg = "No speech detected - please try again";
        shouldAutoRestartRef.current = true;
      } else if (event.error === 'aborted') {
        shouldAutoRestartRef.current = false;
      } else if (event.error === 'network') {
        errorMsg = "Network error - check internet connection";
      } else {
        restartAttemptCountRef.current += 1;
        if (restartAttemptCountRef.current > 2) {
          errorMsg = "Mic failed repeatedly - click to restart";
          shouldAutoRestartRef.current = false;
        }
      }
      if (errorMsg && event.error !== 'aborted') {
        setErrorMessage(errorMsg);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Only auto-restart if:
      // 1. User didn't manually stop
      // 2. We have a current word
      // 3. Auto-listen is enabled
      // 4. We haven't hit errors that prevent restart
      // 5. Permission was previously granted
      if (!manualStopRef.current && currentWordRef.current && autoListen && 
          shouldAutoRestartRef.current && micPermissionGranted && 
          restartAttemptCountRef.current < 3) {
        setTimeout(() => {
          if (!manualStopRef.current && recognitionRef.current === null) {
            startListening();
          }
        }, 500);
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

  const handleRepeatWord = useCallback(() => {
    if (!currentWord) return;
    const wasListening = isListening;
    if (wasListening) stopListening();
    speak(currentWord, () => {
      if (wasListening && autoListen && micPermissionGranted && !manualStopRef.current) {
        startListening();
      }
    });
  }, [currentWord, isListening, stopListening, speak, autoListen, micPermissionGranted, startListening]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || (target as HTMLElement | null)?.isContentEditable;

      if (event.code === 'Space' && !isTyping) {
        event.preventDefault();
        handleRepeatWord();
      }
      
      // Enter key to submit
      if (event.code === 'Enter' && isTyping && tag === 'input') {
        event.preventDefault();
        handleManualCheck();
      }
      
      // Escape to stop listening
      if (event.code === 'Escape' && isListening) {
        event.preventDefault();
        manualStopRef.current = true;
        shouldAutoRestartRef.current = false;
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRepeatWord, isListening, stopListening]);

  const getFilteredWordList = () => {
    if (difficulty === 'all') return wordList;
    const pageSize = Math.ceil(wordList.length / 6);
    const start = (difficulty - 1) * pageSize;
    const end = start + pageSize;
    return wordList.slice(start, end);
  };

  const getRandomWord = () => {
    const filteredList = getFilteredWordList();
    const availableWords = filteredList.filter(w => !shownWords.has(w));
    if (availableWords.length === 0) {
      // Reset if all words have been shown
      setShownWords(new Set());
      return filteredList[Math.floor(Math.random() * filteredList.length)] || null;
    }
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const word = availableWords[randomIndex];
    setShownWords(prev => new Set([...prev, word]));
    return word;
  };

  const handleNewWord = useCallback(() => {
    const word = getRandomWord();
    if (word) {
      setCurrentWord(word);
      setUserInput("");
      setStatus("idle");
      setWrongAttempts(0);
      setShowHint(false);
      manualStopRef.current = false;
      shouldAutoRestartRef.current = true;
      restartAttemptCountRef.current = 0;
      stopListening(); 
      
      speak(word, () => {
        // Only auto-start mic if user has explicitly granted permission by clicking mic before
        if (autoListen && micPermissionGranted && !manualStopRef.current) {
          startListening();
        }
      });
      
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
    // Normalize: lowercase, remove extra spaces, but keep accents and hyphens/apostrophes
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    
    const normInput = normalize(textToCheck);
    const normTarget = normalize(currentWord);
    // Also try without special chars as fallback for user convenience
    const stripSpecial = (s: string) => s.replace(/[^a-z0-9\s]/g, '');
    const stripInput = stripSpecial(normInput);
    const stripTarget = stripSpecial(normTarget);

    stopListening(); // Stop listening once we check

    if (normInput === normTarget || stripInput === stripTarget) {
      setStatus("correct");
      setStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1
      }));
      speak("Correct! " + currentWord);
    } else {
      setStatus("incorrect");
      setWrongAttempts(prev => prev + 1);
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
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setSilenceCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    silenceTimerRef.current = setTimeout(() => {
      setSilenceCountdown(0);
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
      shouldAutoRestartRef.current = false;
      stopListening();
    } else {
      manualStopRef.current = false;
      shouldAutoRestartRef.current = true;
      restartAttemptCountRef.current = 0;
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
      
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {errorMessage}
        </div>
      )}
      
      {/* Header & Stats */}
      <div className="w-full max-w-md flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pt-2 sm:pt-4 gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <Edit3 size={20} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">SpellMaster</h1>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-4 text-xs sm:text-sm font-medium">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-green-600 flex items-center gap-1" aria-label={`Correct: ${stats.correct} out of ${stats.total}`}>
              <Check size={16} /> {stats.correct}/{stats.total}
            </span>
            <span className="text-orange-500 flex items-center gap-1 mt-1" aria-label={`Streak: ${stats.streak}`}>
              <Trophy size={16} /> Streak: {stats.streak}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      <div className="app-card w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        {/* Game Content */}
        {!currentWord ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
              <Volume2 size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to Practice?</h2>
            
            {/* Difficulty Selector */}
            <div className="mb-4 sm:mb-6 w-full">
              <label htmlFor="difficulty" className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">Select Level:</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as any);
                  setShownWords(new Set());
                }}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm font-medium touch-manipulation"
              >
                <option value="all">All (1-6)</option>
                <option value="1">Page 1 (Easy)</option>
                <option value="2">Page 2</option>
                <option value="3">Page 3</option>
                <option value="4">Page 4</option>
                <option value="5">Page 5</option>
                <option value="6">Page 6 (Hard)</option>
              </select>
            </div>
            
            <p className="text-gray-500 mb-6 sm:mb-8 text-xs sm:text-sm">
              <span className="text-xs text-gray-400 mt-2 block">
                {autoAdvance ? "Auto-advance is ON" : "Auto-advance is OFF"}
              </span>
            </p>
            <button
              onClick={handleNewWord}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 touch-manipulation"
              aria-label="Start quiz"
            >
              <Play size={20} fill="currentColor" /> Start
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 flex flex-col h-full">
            
            {/* Top Bar Indicators - Stack on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-3 gap-2">
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  {autoAdvance && (
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                      <FastForward size={10} /> Auto-Next
                    </div>
                  )}
                  <label className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200 whitespace-nowrap touch-manipulation">
                    <input
                      type="checkbox"
                      checked={autoListen}
                      onChange={(e) => setAutoListen(e.target.checked)}
                      className="w-3 h-3 text-blue-600 rounded cursor-pointer"
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
                    className="text-[9px] sm:text-[10px] text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 font-medium touch-manipulation"
                    aria-label="Select voice"
                  >
                    {voices.map((v) => (
                      <option key={`${v.name}|||${v.lang}`} value={`${v.name}|||${v.lang}`}>
                        {v.name.split(/\s+/).slice(0, 2).join(' ')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Audio Control */}
            <div className="flex flex-col sm:flex-row justify-center items-center mb-4 sm:mb-6 mt-2 sm:mt-4 gap-4">
              <button
                onClick={handleRepeatWord}
                className="relative group w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer touch-manipulation"
                title="Replay Audio"
                aria-label="Replay word"
              >
                <Volume2 size={36} className="text-white" />
              </button>
              
              {/* Mic Button */}
              {hasSpeechSupport && (
                <button
                  onClick={handleMicToggle}
                  disabled={status === "correct" || status === "revealed"}
                  className={`w-16 h-16 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md transition-all touch-manipulation
                    ${isListening 
                      ? "bg-red-500 text-white animate-pulse ring-4 ring-red-100" 
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={isListening ? "Stop Microphone" : "Speak Answer"}
                  aria-label={isListening ? "Stop microphone" : "Start microphone"}
                >
                  {isListening ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
                </button>
              )}
            </div>

            <div className="flex justify-center mb-3 sm:mb-4">
              <button
                type="button"
                onClick={handleRepeatWord}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors touch-manipulation"
                aria-label="Repeat word"
              >
                Repeat
              </button>
            </div>

            {/* Hint Section */}
            {wrongAttempts >= 1 && !showHint && status !== "correct" && status !== "revealed" && (
              <div className="mb-3 text-center">
                <button
                  onClick={() => setShowHint(true)}
                  className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors touch-manipulation"
                  aria-label="Show hint"
                >
                  💡 Show Hint
                </button>
              </div>
            )}
            {showHint && currentWord && status !== "correct" && status !== "revealed" && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700 font-medium mb-1">Hint:</p>
                <p className="text-lg font-mono tracking-wider text-yellow-900">
                  {currentWord.slice(0, Math.ceil(currentWord.length / 2))}
                  <span className="text-yellow-400">{"_".repeat(Math.floor(currentWord.length / 2))}</span>
                </p>
              </div>
            )}

            {/* Status Feedback */}
            <div className="min-h-[48px] sm:min-h-[56px] mb-2 flex flex-col justify-center items-center gap-1">
              {isListening ? (
                <>
                   <span className="text-blue-600 font-semibold flex items-center gap-2 animate-pulse text-xs sm:text-sm" role="status" aria-live="polite">
                     Listening... {userInput ? "(Speaking)" : "(Waiting)"}
                   </span>
                   {silenceCountdown > 0 && (
                     <span className="text-xs text-blue-500 font-medium">Submit in {silenceCountdown}s</span>
                   )}
                </>
              ) : (
                <>
                  {status === "correct" && (
                    <span className="text-green-600 font-bold flex items-center gap-1 sm:gap-2 animate-bounce text-sm sm:text-base" role="status" aria-live="assertive">
                      ✓ Correct!
                    </span>
                  )}
                  {status === "incorrect" && (
                    <span className="text-red-500 font-bold flex items-center gap-1 sm:gap-2 animate-pulse text-sm sm:text-base" role="status" aria-live="assertive">
                      ✗ Try again
                    </span>
                  )}
                  {status === "revealed" && (
                    <span className="text-yellow-600 font-bold text-sm sm:text-base" role="status" aria-live="assertive">
                       Word: {currentWord}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleManualCheck} className="flex flex-col gap-3 sm:gap-4">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                disabled={status === "correct" || status === "revealed"}
                className={`w-full text-center text-xl sm:text-2xl p-3 sm:p-4 border-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-300 touch-manipulation
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
                aria-label="Spelling input"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1 sm:mt-2">
                {(status === "correct" || status === "revealed") ? (
                  <button
                    type="button"
                    onClick={handleNewWord}
                    autoFocus
                    className="col-span-2 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm sm:text-lg shadow-md transition-all touch-manipulation"
                    aria-label="Next word"
                  >
                    {autoAdvance && status === 'correct' ? 'Next' : 'Next Word'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleReveal}
                      disabled={isListening}
                      className="py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-semibold transition-colors disabled:opacity-50 touch-manipulation text-sm sm:text-base"
                      aria-label="Give up"
                    >
                      Give Up
                    </button>
                    <button
                      type="submit"
                      disabled={(!userInput && !isListening)}
                      className={`py-3 text-white rounded-xl font-bold shadow-md transition-all touch-manipulation text-sm sm:text-base
                        ${isListening 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                      `}
                      aria-label={isListening ? "Stop and check" : "Check spelling"}
                    >
                      {isListening ? "Stop" : "Check"}
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
               <button 
                 onClick={handleNewWord} 
                 className="text-xs text-gray-400 hover:text-blue-500 flex items-center justify-center gap-1 mx-auto transition-colors touch-manipulation"
                 aria-label="Skip to new word"
                >
                 <RefreshCw size={12} /> Skip
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm max-w-xs space-y-1">
        <div className="flex items-center justify-center gap-2">
          {hasSpeechSupport ? <Mic size={14} className="text-green-600" /> : <MicOff size={14} className="text-red-600" />}
          <span>{hasSpeechSupport ? "✓ Voice OK" : "✗ No voice"}</span>
        </div>
        <div className="text-xs text-gray-500">
          <p>💡 Enter to submit • Esc to stop</p>
        </div>
      </div>
    </div>
  );
}