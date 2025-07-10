import { useState } from "react";
import { useDiary } from "@/hooks/useDiary";
import { DiaryEntry } from "@/lib/types";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/diary/EntryCard";
import { EntryEditor } from "@/components/diary/EntryEditor";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";

export default function Calendar() {
  const { entries, addEntry, updateEntry, deleteEntry } = useDiary();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for full weeks
  const firstDayOfWeek = monthStart.getDay();
  const lastDayOfWeek = monthEnd.getDay();
  const paddingStart = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });
  const paddingEnd = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allCalendarDays = [...paddingStart, ...calendarDays, ...paddingEnd];

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => isSameDay(new Date(entry.date), date));
  };

  const selectedDateEntries = selectedDate
    ? getEntriesForDate(selectedDate)
    : [];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1),
    );
    setSelectedDate(null);
  };

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
              <CalendarIcon className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Calendar View</h1>
            </div>
            <Button onClick={handleNewEntry} className="gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {format(currentDate, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {allCalendarDays.map((date, index) => {
                    const dayEntries = getEntriesForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isToday = isSameDay(date, new Date());
                    const isSelected =
                      selectedDate && isSameDay(date, selectedDate);
                    const hasEntries = dayEntries.length > 0;

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "relative p-2 h-16 text-left border border-border rounded-lg transition-all hover:bg-accent",
                          !isCurrentMonth &&
                            "text-muted-foreground bg-muted/20",
                          isToday && "ring-2 ring-primary",
                          isSelected && "bg-primary text-primary-foreground",
                          hasEntries && "bg-accent/50",
                        )}
                      >
                        <div className="text-sm font-medium">
                          {format(date, "d")}
                        </div>

                        {hasEntries && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="flex gap-1 flex-wrap">
                              {dayEntries.slice(0, 3).map((entry, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      entry.mood?.color ||
                                      "hsl(var(--primary))",
                                  }}
                                />
                              ))}
                              {dayEntries.length > 3 && (
                                <div className="text-xs">
                                  +{dayEntries.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedDate
                    ? format(selectedDate, "MMMM d, yyyy")
                    : "Select a Date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {selectedDateEntries.length} entries
                      </span>
                      <Button
                        size="sm"
                        onClick={handleNewEntry}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Entry
                      </Button>
                    </div>

                    {selectedDateEntries.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedDateEntries.map((entry) => (
                          <div key={entry.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {entry.mood && (
                                  <span className="text-lg">
                                    {entry.mood.emoji}
                                  </span>
                                )}
                                <h4 className="font-medium text-sm">
                                  {entry.title}
                                </h4>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditEntry(entry)}
                                  className="h-6 w-6 p-0"
                                >
                                  ✏️
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="h-6 w-6 p-0 text-destructive"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {entry.content}
                            </p>

                            {entry.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {entry.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <hr className="border-border" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No entries for this date
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={handleNewEntry}
                        >
                          Create First Entry
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click on any date to view or add entries
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendar Legend */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Selected date</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span>Has entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-border ring-2 ring-primary rounded-full"></div>
                  <span>Today</span>
                </div>
                <div className="text-muted-foreground">
                  Colored dots represent mood indicators
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
