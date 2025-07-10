import { useState } from "react";
import { useDiary } from "@/hooks/useDiary";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Heart,
  BookOpen,
  Clock,
  Target,
  Award,
  Download,
  Filter,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

export default function Analytics() {
  const { entries } = useDiary();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const handleNewEntry = () => {
    // Navigate to dashboard with editor open
    window.location.href = "/dashboard";
  };

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "90d":
        return { start: subDays(now, 90), end: now };
      case "1y":
        return { start: subDays(now, 365), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  // Filter entries by date range
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    return entryDate >= dateStart && entryDate <= dateEnd;
  });

  // Mood distribution data
  const moodData = filteredEntries.reduce(
    (acc, entry) => {
      if (entry.mood) {
        const existing = acc.find((item) => item.name === entry.mood!.name);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({
            name: entry.mood.name,
            value: 1,
            color: entry.mood.color,
            emoji: entry.mood.emoji,
          });
        }
      }
      return acc;
    },
    [] as { name: string; value: number; color: string; emoji: string }[],
  );

  // Daily writing activity
  const dailyActivity = eachDayOfInterval({
    start: dateStart,
    end: dateEnd,
  }).map((date) => {
    const dayEntries = filteredEntries.filter(
      (entry) =>
        format(new Date(entry.createdAt), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd"),
    );
    return {
      date: format(date, "MMM dd"),
      entries: dayEntries.length,
      words: dayEntries.reduce(
        (sum, entry) => sum + entry.content.split(" ").length,
        0,
      ),
    };
  });

  // Weekly mood trends
  const weeklyMoodTrends = (() => {
    const weeks = [];
    let currentDate = new Date(dateStart);

    while (currentDate <= dateEnd) {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);

      const weekEntries = filteredEntries.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      const avgMood =
        weekEntries.reduce((sum, entry) => sum + (entry.mood?.value || 3), 0) /
        (weekEntries.length || 1);

      weeks.push({
        week: format(weekStart, "MMM dd"),
        mood: Number(avgMood.toFixed(1)),
        entries: weekEntries.length,
      });

      currentDate = new Date(weekEnd.getTime() + 1);
    }

    return weeks.slice(-8); // Last 8 weeks
  })();

  // Tag frequency
  const tagFrequency = filteredEntries
    .flatMap((entry) => entry.tags)
    .reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const topTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Calculate statistics
  const stats = {
    totalEntries: filteredEntries.length,
    totalWords: filteredEntries.reduce(
      (sum, entry) => sum + entry.content.split(" ").length,
      0,
    ),
    avgWordsPerEntry: Math.round(
      filteredEntries.reduce(
        (sum, entry) => sum + entry.content.split(" ").length,
        0,
      ) / (filteredEntries.length || 1),
    ),
    longestStreak: 5, // Placeholder - would need more complex calculation
    currentStreak: 3, // Placeholder
    avgMood:
      filteredEntries.reduce(
        (sum, entry) => sum + (entry.mood?.value || 3),
        0,
      ) / (filteredEntries.length || 1),
    mostUsedMood: moodData.sort((a, b) => b.value - a.value)[0],
    topTag: topTags[0],
  };

  const exportData = () => {
    const dataToExport = {
      summary: stats,
      entries: filteredEntries.length,
      timeRange,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memovault-analytics-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider>
      <AppSidebar onNewEntry={handleNewEntry} />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportData} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Entries
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.avgWordsPerEntry} avg words per entry
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Words Written
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalWords.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  ~{Math.round(stats.totalWords / 250)} pages written
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Mood
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {stats.avgMood.toFixed(1)}/5
                  {stats.mostUsedMood && (
                    <span className="text-lg">{stats.mostUsedMood.emoji}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most common: {stats.mostUsedMood?.name || "None"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Writing Streak
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.currentStreak} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Best: {stats.longestStreak} days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="moods">Mood Analysis</TabsTrigger>
              <TabsTrigger value="writing">Writing Patterns</TabsTrigger>
              <TabsTrigger value="tags">Tag Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Writing Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="entries"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="moods" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyMoodTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {moodData.map((mood) => (
                  <Card key={mood.name}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <div className="font-semibold">{mood.name}</div>
                      <div className="text-2xl font-bold text-primary">
                        {mood.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((mood.value / filteredEntries.length) * 100).toFixed(
                          1,
                        )}
                        % of entries
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="writing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Words Written Per Day</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="words" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topTags.map((item, index) => (
                      <div
                        key={item.tag}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{item.tag}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Rank #{index + 1}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {item.count} uses
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
