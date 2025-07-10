import { useState } from "react";
import { Mood, DEFAULT_MOODS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MoodTrackerProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
  className?: string;
}

export const MoodTracker = ({
  selectedMood,
  onMoodSelect,
  className,
}: MoodTrackerProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-foreground">
        How are you feeling today?
      </label>

      <div className="grid grid-cols-4 gap-2">
        {DEFAULT_MOODS.map((mood) => {
          const isSelected = selectedMood?.id === mood.id;
          const isHovered = hoveredMood === mood.id;

          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => onMoodSelect(mood)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/50 hover:bg-accent",
              )}
              style={{
                borderColor: isSelected || isHovered ? mood.color : undefined,
                backgroundColor: isSelected ? `${mood.color}15` : undefined,
              }}
            >
              <span className="text-2xl mb-1" role="img" aria-label={mood.name}>
                {mood.emoji}
              </span>
              <span className="text-xs font-medium text-center leading-tight">
                {mood.name}
              </span>
            </button>
          );
        })}
      </div>

      {selectedMood && (
        <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
          <span className="text-lg" role="img" aria-label={selectedMood.name}>
            {selectedMood.emoji}
          </span>
          <span className="text-sm font-medium">
            Feeling {selectedMood.name.toLowerCase()} today
          </span>
        </div>
      )}
    </div>
  );
};
