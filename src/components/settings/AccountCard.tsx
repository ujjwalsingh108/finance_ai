"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CopyIcon, SquarePen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";

export function AccountCard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }

        let membership = null;
        if (data?.user) {
          const { data: memberData, error: memberError } = await supabase
            .from("organization_members")
            .select("organization_id, organizations(name)")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (memberError) {
            console.error("Error fetching membership:", memberError);
          } else {
            membership = memberData;
          }
        }

        setUser(data?.user || null);
        setMember(membership);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        // ✅ Always stop loading
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  const handleCopy = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id).then(() => {
        toast("Copied successfully!");
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error("Error setting password: " + error.message);
    } else {
      toast.success("Password has been set. Please log in again.");
      setDialogOpen(false);
      setNewPassword("");
      await handleLogout();
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {loading ? (
          <Loading message="Loading account..." />
        ) : (
          <>
            {/* Profile Picture + UID */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col justify-center">
                <h2 className="text-sm text-muted-foreground mb-1">
                  Profile Picture
                </h2>
                <div className="text-sm flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground break-all">
                    UID: {user?.id ?? "—"}
                  </span>
                  <CopyIcon
                    className="w-4 h-4 cursor-pointer"
                    onClick={handleCopy}
                  />
                </div>
              </div>

              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 cursor-pointer">
                <AvatarFallback>
                  {!user?.user_metadata?.picture
                    ? user.email[0].toUpperCase()
                    : user?.user_metadata?.picture}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="my-6 border-t" />

            <div className="space-y-4">
              {/* Username */}
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-muted-foreground">User Name</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm">
                    {member?.organizations?.name ?? "—"}
                  </span>
                  <SquarePen className="w-3 h-3 cursor-pointer" />
                </div>
              </div>

              <div className="my-6 border-t" />

              {/* Email */}
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-muted-foreground">Email</h3>
                <span className="text-sm">{user?.email ?? "—"}</span>
              </div>

              <div className="my-6 border-t" />

              {/* Password with Dialog */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-muted-foreground">Password</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Set Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Set a New Password</DialogTitle>
                      <DialogDescription>
                        Please enter your new password below. This will replace
                        your old one.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSetPassword}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="my-6 border-t" />
            </div>

            {/* Logout */}
            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                className="w-full sm:w-auto cursor-pointer"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
