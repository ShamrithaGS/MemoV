import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Star, Calendar, Target, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  tags: string[];
  icon: React.ReactNode;
}

const ENTRY_TEMPLATES: EntryTemplate[] = [
  {
    id: "1",
    name: "Daily Reflection",
    description: "A structured daily review template",
    category: "Daily",
    template: `# Today's Reflection

## How I'm Feeling
[Describe your current mood and emotions]

## Today's Highlights
- [What went well today?]
- [What am I grateful for?]
- [What made me smile?]

## Challenges & Lessons
- [What was difficult today?]
- [What did I learn?]
- [How can I grow from this?]

## Tomorrow's Focus
[What do I want to focus on tomorrow?]`,
    tags: ["reflection", "daily", "structure"],
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: "2",
    name: "Gratitude Journal",
    description: "Focus on appreciation and positive moments",
    category: "Wellness",
    template: `# Gratitude Journal

## Three Things I'm Grateful For
1. [Something big or small that brought joy]
2. [A person who made a difference]
3. [An experience or moment to cherish]

## Why I'm Grateful
[Expand on why these things matter to you]

## Spreading Gratitude
[How can you show appreciation to others?]

## Reflection
[How does focusing on gratitude make you feel?]`,
    tags: ["gratitude", "positivity", "wellness"],
    icon: <Heart className="h-4 w-4" />,
  },
  {
    id: "3",
    name: "Goal Progress",
    description: "Track progress towards your objectives",
    category: "Productivity",
    template: `# Goal Progress Check

## Current Goal
[What goal are you working on?]

## Today's Actions
- [What specific steps did you take?]
- [What obstacles did you encounter?]
- [What worked well?]

## Progress Assessment
[How close are you to achieving this goal?]

## Next Steps
- [What will you do tomorrow?]
- [What do you need to adjust?]
- [Who can help you?]

## Motivation Reminder
[Why is this goal important to you?]`,
    tags: ["goals", "progress", "productivity"],
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: "4",
    name: "Creative Expression",
    description: "Unleash your creativity and imagination",
    category: "Creative",
    template: `# Creative Expression

## Today's Inspiration
[What sparked your creativity today?]

## Creative Activity
[What did you create, imagine, or explore?]

## Process & Discovery
[How did the creative process feel?]
[What did you discover about yourself?]

## Ideas for Tomorrow
[What creative pursuits are calling to you?]

## Creative Affirmation
[Write something positive about your creative abilities]`,
    tags: ["creativity", "expression", "art"],
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: "5",
    name: "Free Form",
    description: "Open template for spontaneous writing",
    category: "General",
    template: `# [Your Title Here]

[Write freely about whatever is on your mind...]

---

## Tags
[Add relevant tags to organize this entry]

## Mood
[How are you feeling while writing this?]`,
    tags: ["freeform", "open", "flexible"],
    icon: <FileText className="h-4 w-4" />,
  },
];

interface EntryTemplatesProps {
  onSelectTemplate: (template: string, title: string) => void;
  className?: string;
}

export const EntryTemplates = ({
  onSelectTemplate,
  className,
}: EntryTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...new Set(ENTRY_TEMPLATES.map((t) => t.category)),
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? ENTRY_TEMPLATES
      : ENTRY_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Entry Templates
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a template to structure your thoughts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/50"
              onClick={() => onSelectTemplate(template.template, template.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onSelectTemplate("", "New Entry")}
          >
            Start with Blank Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
