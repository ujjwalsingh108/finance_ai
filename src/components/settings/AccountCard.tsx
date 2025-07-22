"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CopyIcon, SquarePen } from "lucide-react";

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
          <Avatar className="h-16 w-16 self-center sm:self-auto cursor-pointer">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        {/* User Info */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-muted-foreground">User Name</h3>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm">{email}</span>
              <SquarePen className="w-3 h-3 cursor-pointer" />
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t" />

          <div className="flex justify-between items-center">
            <h3 className="text-sm text-muted-foreground">Email</h3>
            <span className="text-sm">{email}</span>
          </div>

          {/* Divider */}
          <div className="my-6 border-t" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm text-muted-foreground">Password</h3>
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto cursor-pointer"
            >
              Set Password
            </Button>
          </div>

          {/* Divider */}
          <div className="my-6 border-t" />
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
