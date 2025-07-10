import { useState, useRef } from "react";
import { DiaryEntry, Mood } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MoodTracker } from "./MoodTracker";
import { Save, X, Tag, Image, Mic, Paperclip, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntryEditorProps {
  entry?: DiaryEntry;
  onSave: (entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  className?: string;
}

export const EntryEditor = ({
  entry,
  onSave,
  onCancel,
  className,
}: EntryEditorProps) => {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(
    entry?.mood,
  );
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    entry?.date || new Date().toISOString().split("T")[0],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      alert("Please add a title or content to save your entry");
      return;
    }

    onSave({
      title: title.trim() || "Untitled Entry",
      content: content.trim(),
      date: selectedDate,
      mood: selectedMood,
      tags,
      attachments: [], // For demo purposes
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const isFormValid = title.trim() || content.trim();

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {entry ? "Edit Entry" : "New Entry"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isFormValid}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Input
          placeholder="What's on your mind today?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />
      </div>

      {/* Mood Tracker */}
      <MoodTracker selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

      {/* Content */}
      <div className="space-y-2">
        <Textarea
          placeholder="Tell your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="flex-1"
          />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(tag)}
              >
                #{tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAttachment}
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => alert("Voice recording coming soon!")}
          className="flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          Voice
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAttachment}
          className="flex items-center gap-2"
        >
          <Paperclip className="h-4 w-4" />
          File
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,audio/*,*"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            alert("File attachment feature coming soon!");
          }
        }}
      />
    </Card>
  );
};
