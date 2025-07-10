import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DiaryEntry, Mood, Attachment } from "@/lib/types";
import { loadSampleData } from "@/lib/sampleData";

interface DiaryContextType {
  entries: DiaryEntry[];
  isLoading: boolean;
  addEntry: (
    entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => DiaryEntry | undefined;
  getEntriesForDate: (date: string) => DiaryEntry[];
  searchEntries: (query: string) => DiaryEntry[];
  getEntriesByTag: (tag: string) => DiaryEntry[];
  getMoodStats: () => { mood: string; count: number; color: string }[];
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (context === undefined) {
    throw new Error("useDiary must be used within a DiaryProvider");
  }
  return context;
};

export const DiaryProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      // Load sample data for demo purposes
      loadSampleData();

      const savedEntries = localStorage.getItem("diary_entries");
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = (newEntries: DiaryEntry[]) => {
    localStorage.setItem("diary_entries", JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const addEntry = async (
    entryData: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newEntries = [newEntry, ...entries];
    saveEntries(newEntries);
  };

  const updateEntry = async (id: string, updates: Partial<DiaryEntry>) => {
    const newEntries = entries.map((entry) =>
      entry.id === id
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry,
    );
    saveEntries(newEntries);
  };

  const deleteEntry = async (id: string) => {
    const newEntries = entries.filter((entry) => entry.id !== id);
    saveEntries(newEntries);
  };

  const getEntry = (id: string): DiaryEntry | undefined => {
    return entries.find((entry) => entry.id === id);
  };

  const getEntriesForDate = (date: string): DiaryEntry[] => {
    return entries.filter((entry) => entry.date === date);
  };

  const searchEntries = (query: string): DiaryEntry[] => {
    const lowercaseQuery = query.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(lowercaseQuery) ||
        entry.content.toLowerCase().includes(lowercaseQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  };

  const getEntriesByTag = (tag: string): DiaryEntry[] => {
    return entries.filter((entry) =>
      entry.tags.some(
        (entryTag) => entryTag.toLowerCase() === tag.toLowerCase(),
      ),
    );
  };

  const getMoodStats = () => {
    const moodCounts: { [key: string]: { count: number; color: string } } = {};

    entries.forEach((entry) => {
      if (entry.mood) {
        if (moodCounts[entry.mood.name]) {
          moodCounts[entry.mood.name].count++;
        } else {
          moodCounts[entry.mood.name] = {
            count: 1,
            color: entry.mood.color,
          };
        }
      }
    });

    return Object.entries(moodCounts).map(([mood, data]) => ({
      mood,
      count: data.count,
      color: data.color,
    }));
  };

  return (
    <DiaryContext.Provider
      value={{
        entries,
        isLoading,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntry,
        getEntriesForDate,
        searchEntries,
        getEntriesByTag,
        getMoodStats,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};
