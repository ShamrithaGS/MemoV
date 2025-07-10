import { useState } from "react";
import { useDiary } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Zap, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickNoteProps {
  className?: string;
}

export const QuickNote = ({ className }: QuickNoteProps) => {
  const { addEntry } = useDiary();
  const [note, setNote] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;

    setIsSaving(true);
    try {
      await addEntry({
        title: "Quick Note",
        content: note.trim(),
        date: new Date().toISOString().split("T")[0],
        tags: ["quick-note"],
        attachments: [],
      });

      setNote("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to save quick note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNote("");
    setIsExpanded(false);
  };

  const quickPrompts = [
    "What's on my mind right now...",
    "Today I noticed...",
    "I'm grateful for...",
    "Something that made me smile...",
    "A quick reminder to myself...",
  ];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Quick Note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isExpanded ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {quickPrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNote(prompt);
                    setIsExpanded(true);
                  }}
                  className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-accent transition-all text-sm text-muted-foreground hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsExpanded(true)}
            >
              Write a quick note...
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Quick Note
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {note.split(" ").filter(Boolean).length} words
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!note.trim() || isSaving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            💡 Perfect for capturing fleeting thoughts, reminders, or quick
            observations
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
