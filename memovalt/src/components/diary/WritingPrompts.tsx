import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RefreshCw, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingPrompt {
  id: string;
  category: string;
  prompt: string;
  tags: string[];
}

const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "1",
    category: "Gratitude",
    prompt: "What are three things you're grateful for today?",
    tags: ["gratitude", "positivity"],
  },
  {
    id: "2",
    category: "Reflection",
    prompt: "What challenged you today and how did you overcome it?",
    tags: ["challenge", "growth"],
  },
  {
    id: "3",
    category: "Dreams",
    prompt: "Describe a goal you're working towards and why it matters to you.",
    tags: ["goals", "motivation"],
  },
  {
    id: "4",
    category: "Memory",
    prompt: "Write about a moment today that made you smile.",
    tags: ["happiness", "memory"],
  },
  {
    id: "5",
    category: "Future",
    prompt: "What are you looking forward to tomorrow?",
    tags: ["anticipation", "planning"],
  },
  {
    id: "6",
    category: "Creativity",
    prompt: "If you could create anything today, what would it be?",
    tags: ["creativity", "imagination"],
  },
  {
    id: "7",
    category: "Connection",
    prompt: "Write about someone who made a positive impact on your day.",
    tags: ["relationships", "appreciation"],
  },
  {
    id: "8",
    category: "Learning",
    prompt: "What's something new you learned or discovered today?",
    tags: ["learning", "discovery"],
  },
  {
    id: "9",
    category: "Self-Care",
    prompt: "How did you take care of yourself today?",
    tags: ["self-care", "wellness"],
  },
  {
    id: "10",
    category: "Adventure",
    prompt: "If you could go anywhere right now, where would you go and why?",
    tags: ["travel", "adventure"],
  },
];

interface WritingPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

export const WritingPrompts = ({
  onSelectPrompt,
  className,
}: WritingPromptsProps) => {
  const [currentPrompt, setCurrentPrompt] = useState(
    WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...new Set(WRITING_PROMPTS.map((p) => p.category)),
  ];

  const filteredPrompts =
    selectedCategory === "all"
      ? WRITING_PROMPTS
      : WRITING_PROMPTS.filter((p) => p.category === selectedCategory);

  const getRandomPrompt = () => {
    const availablePrompts =
      selectedCategory === "all" ? WRITING_PROMPTS : filteredPrompts;
    const randomPrompt =
      availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Gratitude":
        return <Heart className="h-4 w-4" />;
      case "Creativity":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Writing Prompts
          </CardTitle>
          <Button variant="outline" size="sm" onClick={getRandomPrompt}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>
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

        {/* Current Prompt */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getCategoryIcon(currentPrompt.category)}
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  {currentPrompt.category}
                </Badge>
                <p className="text-foreground font-medium leading-relaxed">
                  {currentPrompt.prompt}
                </p>
                <div className="flex gap-2 mt-3">
                  {currentPrompt.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  className="mt-4"
                  onClick={() => onSelectPrompt(currentPrompt.prompt)}
                >
                  Use This Prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Prompts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Quick Prompts
          </h4>
          <div className="grid gap-2">
            {filteredPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt.prompt)}
                className="text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {prompt.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{prompt.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
