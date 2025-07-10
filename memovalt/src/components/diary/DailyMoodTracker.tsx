import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_MOODS, Mood } from "@/lib/types";
import { Heart, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodEntry {
  id: string;
  mood: Mood;
  timestamp: string;
  note?: string;
}

interface DailyMoodTrackerProps {
  className?: string;
}

export const DailyMoodTracker = ({ className }: DailyMoodTrackerProps) => {
  const [todaysMoods, setTodaysMoods] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  useEffect(() => {
    // Load today's moods from localStorage
    const today = new Date().toISOString().split("T")[0];
    const savedMoods = localStorage.getItem(`daily_moods_${today}`);
    if (savedMoods) {
      setTodaysMoods(JSON.parse(savedMoods));
    }
  }, []);

  const saveTodaysMoods = (moods: MoodEntry[]) => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`daily_moods_${today}`, JSON.stringify(moods));
    setTodaysMoods(moods);
  };

  const addMoodEntry = (mood: Mood) => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood,
      timestamp: new Date().toISOString(),
    };

    const updatedMoods = [...todaysMoods, newEntry];
    saveTodaysMoods(updatedMoods);
    setSelectedMood(null);
  };

  const getAverageMood = () => {
    if (todaysMoods.length === 0) return 3;
    return (
      todaysMoods.reduce((sum, entry) => sum + entry.mood.value, 0) /
      todaysMoods.length
    );
  };

  const getMoodTrend = () => {
    if (todaysMoods.length < 2) return "stable";
    const recent = todaysMoods.slice(-2);
    if (recent[1].mood.value > recent[0].mood.value) return "improving";
    if (recent[1].mood.value < recent[0].mood.value) return "declining";
    return "stable";
  };

  const averageMood = getAverageMood();
  const moodTrend = getMoodTrend();

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5" />
          Today's Mood Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-accent rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {averageMood.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Average Mood</div>
          </div>
          <div className="text-center p-3 bg-accent rounded-lg">
            <div className="text-xl">
              {moodTrend === "improving" && "📈"}
              {moodTrend === "declining" && "📉"}
              {moodTrend === "stable" && "➖"}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {moodTrend}
            </div>
          </div>
          <div className="text-center p-3 bg-accent rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {todaysMoods.length}
            </div>
            <div className="text-xs text-muted-foreground">Check-ins</div>
          </div>
        </div>

        {/* Mood Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Mood Level</span>
            <span>{averageMood.toFixed(1)}/5</span>
          </div>
          <Progress value={(averageMood / 5) * 100} className="h-2" />
        </div>

        {/* Quick Mood Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            How are you feeling right now?
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_MOODS.slice(0, 8).map((mood) => (
              <button
                key={mood.id}
                onClick={() => addMoodEntry(mood)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border transition-all",
                  "hover:scale-105 hover:border-primary/50",
                  selectedMood?.id === mood.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="text-lg mb-1">{mood.emoji}</span>
                <span className="text-xs text-center">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Mood Timeline */}
        {todaysMoods.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today's Timeline
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {todaysMoods
                .slice()
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-2 bg-accent rounded"
                  >
                    <span className="text-lg">{entry.mood.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {entry.mood.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{ borderColor: entry.mood.color }}
                    >
                      {entry.mood.value}/5
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {todaysMoods.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quick Insight</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {averageMood >= 4
                ? "You're having a great day! Keep up the positive energy."
                : averageMood >= 3
                  ? "You're doing well today. Remember to take care of yourself."
                  : "Take some time for self-care. Every day has its challenges."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
