import { useState } from "react";
import { useDiary } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { DiaryEntry } from "@/lib/types";
import { EntryEditor } from "@/components/diary/EntryEditor";
import { EntryCard } from "@/components/diary/EntryCard";
import { WritingPrompts } from "@/components/diary/WritingPrompts";
import { EntryTemplates } from "@/components/diary/EntryTemplates";
import { DailyMoodTracker } from "@/components/diary/DailyMoodTracker";
import { QuickNote } from "@/components/diary/QuickNote";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  BookOpen,
  TrendingUp,
  Heart,
  Lightbulb,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const { entries, addEntry, updateEntry, deleteEntry, getMoodStats } =
    useDiary();
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [entryTitle, setEntryTitle] = useState<string>("");

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      !filterTag || entry.tags.includes(filterTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const recentEntries = filteredEntries.slice(0, 6);
  const moodStats = getMoodStats();
  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags)),
  ).slice(0, 10);

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setSelectedTemplate("");
    setSelectedPrompt("");
    setEntryTitle("");
    setShowEditor(true);
  };

  const handleSelectTemplate = (template: string, title: string) => {
    setSelectedTemplate(template);
    setEntryTitle(title);
    setEditingEntry(undefined);
    setShowEditor(true);
  };

  const handleSelectPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    setSelectedTemplate("");
    setEntryTitle("Daily Reflection");
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
    } else {
      await addEntry(entryData);
    }
    setShowEditor(false);
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(id);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (showEditor) {
    return (
      <SidebarProvider>
        <AppSidebar onNewEntry={handleNewEntry} />
        <SidebarInset>
          <div className="p-6">
            <EntryEditor
              entry={
                editingEntry || selectedTemplate || selectedPrompt
                  ? {
                      ...editingEntry,
                      title: entryTitle || editingEntry?.title || "",
                      content:
                        selectedTemplate ||
                        selectedPrompt ||
                        editingEntry?.content ||
                        "",
                    }
                  : editingEntry
              }
              onSave={handleSaveEntry}
              onCancel={() => {
                setShowEditor(false);
                setSelectedTemplate("");
                setSelectedPrompt("");
                setEntryTitle("");
              }}
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {user?.username}!
              </h1>
              <p className="text-muted-foreground">
                Ready to capture today's moments?
              </p>
            </div>
            <Button onClick={handleNewEntry} className="gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Entries
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entries.length}</div>
                <p className="text-xs text-muted-foreground">
                  Your digital memories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    entries.filter((entry) => {
                      const entryDate = new Date(entry.createdAt);
                      const now = new Date();
                      return (
                        entryDate.getMonth() === now.getMonth() &&
                        entryDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Entries this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Days in a row</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterTag("")}
                className={cn(
                  !filterTag && "bg-primary text-primary-foreground",
                )}
              >
                All
              </Button>
              {allTags.slice(0, 4).map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterTag(tag)}
                  className={cn(
                    filterTag === tag && "bg-primary text-primary-foreground",
                  )}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Mood Tracking and Quick Note */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DailyMoodTracker />
            <QuickNote />
            {moodStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Mood Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {moodStats.map((stat) => (
                      <Badge
                        key={stat.mood}
                        variant="outline"
                        style={{ borderColor: stat.color }}
                        className="px-3 py-1"
                      >
                        {stat.mood}: {stat.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Writing Assistance */}
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Entries</TabsTrigger>
              <TabsTrigger value="prompts">Writing Prompts</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="prompts">
              <WritingPrompts onSelectPrompt={handleSelectPrompt} />
            </TabsContent>

            <TabsContent value="templates">
              <EntryTemplates onSelectTemplate={handleSelectTemplate} />
            </TabsContent>

            <TabsContent value="recent">
              {/* Recent Entries */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {filterTag || searchQuery
                      ? "Filtered Entries"
                      : "Recent Entries"}
                  </h2>
                  {filteredEntries.length > 6 && (
                    <Button variant="outline" size="sm">
                      View All ({filteredEntries.length})
                    </Button>
                  )}
                </div>

                {recentEntries.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="font-semibold mb-2">
                          {searchQuery || filterTag
                            ? "No entries found"
                            : "No entries yet"}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {searchQuery || filterTag
                            ? "Try adjusting your search or filters"
                            : "Start your digital diary journey by creating your first entry"}
                        </p>
                      </div>
                      {!searchQuery && !filterTag && (
                        <Button onClick={handleNewEntry} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create First Entry
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentEntries.map((entry) => (
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
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
