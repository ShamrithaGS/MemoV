import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDiary } from "@/hooks/useDiary";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Palette,
  Bell,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Lock,
  Fingerprint,
  Save,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { user, updatePreferences, logout } = useAuth();
  const { entries } = useDiary();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewEntry = () => {
    window.location.href = "/dashboard";
  };

  const handleExportData = () => {
    const exportData = {
      user: user,
      entries: entries,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memovault-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = () => {
    localStorage.clear();
    logout();
  };

  const updateSetting = async (setting: string, value: any) => {
    setIsLoading(true);
    try {
      await updatePreferences({ [setting]: value });
    } catch (error) {
      console.error("Failed to update setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar onNewEntry={handleNewEntry} />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Username cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      placeholder="Add your email for backup purposes"
                      onChange={(e) => {
                        // In a real app, this would update the user email
                        console.log("Email update:", e.target.value);
                      }}
                    />
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Account Statistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {entries.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Entries
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {Math.ceil(
                            (new Date().getTime() -
                              new Date(user.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Days Active
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {entries.reduce(
                            (sum, entry) =>
                              sum + entry.content.split(" ").length,
                            0,
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Words Written
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        onClick={() => setTheme("system")}
                        className="gap-2"
                      >
                        <Monitor className="h-4 w-4" />
                        System
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select
                      value={user.preferences.fontSize}
                      onValueChange={(value: "small" | "medium" | "large") =>
                        updateSetting("fontSize", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium (Default)</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p
                      className={`
                        ${user.preferences.fontSize === "small" ? "text-sm" : ""}
                        ${user.preferences.fontSize === "medium" ? "text-base" : ""}
                        ${user.preferences.fontSize === "large" ? "text-lg" : ""}
                      `}
                    >
                      This is how your diary entries will appear with the
                      selected font size.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Lock</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically lock the app when inactive
                      </p>
                    </div>
                    <Switch
                      checked={user.preferences.autoLock}
                      onCheckedChange={(checked) =>
                        updateSetting("autoLock", checked)
                      }
                    />
                  </div>

                  {user.preferences.autoLock && (
                    <div className="space-y-2 ml-4">
                      <Label>Auto-Lock Delay</Label>
                      <Select
                        value={user.preferences.autoLockDelay.toString()}
                        onValueChange={(value) =>
                          updateSetting("autoLockDelay", parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minute</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4" />
                        Biometric Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Use fingerprint or face recognition (coming soon)
                      </p>
                    </div>
                    <Switch
                      checked={user.preferences.biometricEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("biometricEnabled", checked)
                      }
                      disabled
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium">Data Security</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your diary entries are encrypted and stored locally on
                      your device. We never have access to your personal data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded to write in your diary
                      </p>
                    </div>
                    <Switch
                      checked={user.preferences.reminderEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("reminderEnabled", checked)
                      }
                    />
                  </div>

                  {user.preferences.reminderEnabled && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="reminderTime">Reminder Time</Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={user.preferences.reminderTime || "20:00"}
                        onChange={(e) =>
                          updateSetting("reminderTime", e.target.value)
                        }
                        className="w-48"
                      />
                      <p className="text-xs text-muted-foreground">
                        You'll receive a gentle reminder at this time each day
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-accent rounded-lg">
                    <Badge variant="secondary" className="mb-2">
                      Coming Soon
                    </Badge>
                    <p className="text-sm">
                      Push notifications, writing streak alerts, and mood
                      check-in reminders will be available in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup your data to cloud storage
                      </p>
                    </div>
                    <Switch
                      checked={user.preferences.backupEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("backupEnabled", checked)
                      }
                      disabled
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Export & Import</h4>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleExportData}
                        className="gap-2"
                        variant="outline"
                      >
                        <Download className="h-4 w-4" />
                        Export All Data
                      </Button>

                      <Button className="gap-2" variant="outline" disabled>
                        <Upload className="h-4 w-4" />
                        Import Data
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Export includes all your entries, settings, and account
                      information in JSON format.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-destructive">
                      Danger Zone
                    </h4>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete All Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove all your diary
                            entries from this device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllData}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
