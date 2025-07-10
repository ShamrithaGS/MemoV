import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Keyboard, HelpCircle } from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    key: "Ctrl + K",
    description: "Open command palette",
    category: "Navigation",
  },
  {
    key: "Ctrl + N",
    description: "Create new entry",
    category: "Actions",
  },
  {
    key: "Ctrl + S",
    description: "Save current entry",
    category: "Actions",
  },
  {
    key: "Ctrl + F",
    description: "Search entries",
    category: "Navigation",
  },
  {
    key: "Esc",
    description: "Close dialogs/cancel actions",
    category: "Navigation",
  },
  {
    key: "Ctrl + /",
    description: "Show keyboard shortcuts",
    category: "Help",
  },
  {
    key: "Alt + 1",
    description: "Go to Dashboard",
    category: "Navigation",
  },
  {
    key: "Alt + 2",
    description: "Go to Calendar",
    category: "Navigation",
  },
  {
    key: "Alt + 3",
    description: "Go to Search",
    category: "Navigation",
  },
  {
    key: "Alt + 4",
    description: "Go to Analytics",
    category: "Navigation",
  },
];

interface KeyboardShortcutsProps {
  onNewEntry?: () => void;
  onSearch?: () => void;
}

export const KeyboardShortcuts = ({
  onNewEntry,
  onSearch,
}: KeyboardShortcutsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "n":
            event.preventDefault();
            onNewEntry?.();
            break;
          case "f":
            event.preventDefault();
            onSearch?.();
            break;
          case "/":
            event.preventDefault();
            setIsOpen(true);
            break;
          case "k":
            event.preventDefault();
            // TODO: Implement command palette
            console.log("Command palette (coming soon)");
            break;
        }
      }

      if (event.altKey) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            window.location.href = "/dashboard";
            break;
          case "2":
            event.preventDefault();
            window.location.href = "/calendar";
            break;
          case "3":
            event.preventDefault();
            window.location.href = "/search";
            break;
          case "4":
            event.preventDefault();
            window.location.href = "/analytics";
            break;
        }
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNewEntry, onSearch]);

  const groupedShortcuts = SHORTCUTS.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>,
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3 text-primary">{category}</h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Press{" "}
            <Badge variant="outline">Ctrl + /</Badge> to open this help dialog
            anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
