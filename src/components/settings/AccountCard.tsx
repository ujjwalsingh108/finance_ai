"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CopyIcon, Pencil } from "lucide-react";

export function AccountCard() {
  const uid = "user-sA6uEHzdEGx0JsIq7qvQ";
  const email = "usingh2051@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(uid);
  };

  return (
    <Card className="">
      <CardContent className="p-6 space-y-6">
        {/* Profile Picture + UID */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm text-muted-foreground mb-1">
              Profile Picture
            </h2>
            <div className="text-sm flex items-center gap-2">
              <span className="text-xs text-muted-foreground break-all">
                UID: {uid}
              </span>
              <CopyIcon
                className="w-4 h-4 cursor-pointer"
                onClick={handleCopy}
              />
            </div>
          </div>
          <Avatar className="h-16 w-16 self-center sm:self-auto">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">User Name</h3>
            <div className="flex items-center justify-between">
              <span className="truncate">{email}</span>
              <Pencil className="w-4 h-4 cursor-pointer" />
            </div>
          </div>

          <div>
            <h3 className="text-sm text-muted-foreground">Email</h3>
            <span>{email}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm text-muted-foreground">Password</h3>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Set Password
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="flex justify-end pt-4">
          <Button variant="destructive" className="w-full sm:w-auto">
            Log Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
