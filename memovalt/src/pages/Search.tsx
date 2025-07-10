import { useState, useEffect } from "react";
import { useDiary } from "@/hooks/useDiary";
import { DiaryEntry, DEFAULT_MOODS } from "@/lib/types";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/diary/EntryCard";
import { EntryEditor } from "@/components/diary/EntryEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  Tag,
  Heart,
  X,
  SortAsc,
  SortDesc,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Search() {
  const { entries, updateEntry, deleteEntry } = useDiary();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | undefined>();

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setShowEditor(true);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setShowEditor(true);
  };

  const handleSaveEntry = async (
    entryData: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, entryData);
    }
    setShowEditor(false);
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(id);
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags)));

  // Filter entries based on search criteria
  const filteredEntries = entries.filter((entry) => {
    // Text search
    const matchesSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Mood filter
    const matchesMood =
      selectedMoods.length === 0 ||
      (entry.mood && selectedMoods.includes(entry.mood.id));

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => entry.tags.includes(tag));

    // Date filter
    const entryDate = new Date(entry.date);
    const matchesDateFrom = !dateFrom || entryDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || entryDate <= new Date(dateTo);

    return (
      matchesSearch &&
      matchesMood &&
      matchesTags &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  // Sort entries
  const sortedEntries = filteredEntries.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      case "mood":
        return (b.mood?.value || 0) - (a.mood?.value || 0);
      default:
        return 0;
    }
  });

  const toggleMood = (moodId: string) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((id) => id !== moodId)
        : [...prev, moodId],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMoods([]);
    setSelectedTags([]);
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedMoods.length > 0 ||
    selectedTags.length > 0 ||
    dateFrom ||
    dateTo;

  if (showEditor) {
    return (
      <SidebarProvider>
        <AppSidebar onNewEntry={handleNewEntry} />
        <SidebarInset>
          <div className="p-6">
            <EntryEditor
              entry={editingEntry}
              onSave={handleSaveEntry}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar onNewEntry={handleNewEntry} />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SearchIcon className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Search & Filter</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "gap-2",
                  hasActiveFilters && "border-primary text-primary",
                )}
              >
                <Filter className="h-4 w-4" />
                Filters{" "}
                {hasActiveFilters &&
                  `(${
                    [
                      searchQuery,
                      ...selectedMoods,
                      ...selectedTags,
                      dateFrom,
                      dateTo,
                    ].filter(Boolean).length
                  })`}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="dateFrom"
                        className="text-sm text-muted-foreground"
                      >
                        From
                      </Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="dateTo"
                        className="text-sm text-muted-foreground"
                      >
                        To
                      </Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Mood Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Moods
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DEFAULT_MOODS.map((mood) => (
                      <div
                        key={mood.id}
                        className={cn(
                          "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all",
                          selectedMoods.includes(mood.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50",
                        )}
                        onClick={() => toggleMood(mood.id)}
                      >
                        <Checkbox
                          id={mood.id}
                          checked={selectedMoods.includes(mood.id)}
                          onChange={() => toggleMood(mood.id)}
                        />
                        <Label
                          htmlFor={mood.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span>{mood.emoji}</span>
                          <span className="text-sm">{mood.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={
                            selectedTags.includes(tag) ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Sort by</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-4 w-4" />
                          Newest first
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-4 w-4" />
                          Oldest first
                        </div>
                      </SelectItem>
                      <SelectItem value="title">Alphabetical</SelectItem>
                      <SelectItem value="mood">Mood (best first)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Search Results ({sortedEntries.length})
              </h2>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Filtered from {entries.length} total entries</span>
                </div>
              )}
            </div>

            {sortedEntries.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="max-w-sm mx-auto space-y-4">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold mb-2">No entries found</h3>
                    <p className="text-muted-foreground text-sm">
                      {hasActiveFilters
                        ? "Try adjusting your search criteria or filters"
                        : "Start your digital diary journey by creating your first entry"}
                    </p>
                  </div>
                  {hasActiveFilters ? (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={handleNewEntry} className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Create First Entry
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
