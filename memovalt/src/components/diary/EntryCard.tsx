import { DiaryEntry } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Lock,
  Calendar,
  Tag as TagIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EntryCardProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const EntryCard = ({
  entry,
  onEdit,
  onDelete,
  className,
}: EntryCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary",
        className,
      )}
      style={{
        borderLeftColor: entry.mood?.color || "hsl(var(--primary))",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDate(entry.date)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(entry.createdAt)}
              </span>
              {entry.isLocked && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <h3 className="font-semibold text-lg leading-tight truncate">
              {entry.title}
            </h3>

            {entry.mood && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className="text-lg"
                  role="img"
                  aria-label={entry.mood.name}
                >
                  {entry.mood.emoji}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.mood.name}
                </span>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(entry.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed mb-3">
          {truncateContent(entry.content)}
        </p>

        {entry.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <TagIcon className="h-3 w-3 text-muted-foreground" />
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5"
              >
                #{tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{entry.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {entry.attachments.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">
              {entry.attachments.length} attachment
              {entry.attachments.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
