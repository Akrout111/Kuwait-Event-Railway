"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { User } from "@prisma/client";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleLabels: Record<string, string> = {
    ATTENDEE: t("roleAttendee"),
    ORGANIZER: t("roleOrganizer"),
    ADMIN: t("roleAdmin"),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("profileUpdated"));
      } else {
        toast.error(data.error?.message || tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("accountInfo")}</CardTitle>
          <CardDescription>
            {t("accountInfoDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                type="text"
                value={user.name}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t("nameChangeNote")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("role")}</Label>
            <Badge
              variant={
                user.role === "ADMIN"
                  ? "default"
                  : user.role === "ORGANIZER"
                    ? "secondary"
                    : "outline"
              }
              className="text-sm"
            >
              {roleLabels[user.role] || user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Editable Fields Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("editProfile")}</CardTitle>
          <CardDescription>{t("editProfileDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="965XXXXXXXX"
                dir="ltr"
                className="text-start"
              />
              <p className="text-xs text-muted-foreground">
                {t("phoneHint")}
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : t("saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
