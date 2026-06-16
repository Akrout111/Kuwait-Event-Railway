"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  useAdminUsers,
  useChangeUserRole,
  useToggleUserActive,
} from "@/hooks/use-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Search, Shield, UserCheck, UserX } from "lucide-react";
import type { ChangeUserRoleInput, ToggleUserActiveInput } from "@/lib/validators/admin-schema";

interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "ATTENDEE" | "ORGANIZER" | "ADMIN";
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  eventsCount: number;
  bookingsCount: number;
  reviewsCount: number;
}

const roleColors: Record<string, string> = {
  ATTENDEE: "bg-info/10 text-info",
  ORGANIZER: "bg-success/10 text-success",
  ADMIN: "bg-warning/10 text-warning",
};

interface ConfirmDialogState {
  type: "role" | "active";
  userId: string;
  userName: string;
  newValue: string | boolean;
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    limit: 20,
  });

  const changeRole = useChangeUserRole();
  const toggleActive = useToggleUserActive();

  const users: AdminUser[] = data?.data?.users ?? [];
  const roleStats: Record<string, number> = data?.data?.roleStats ?? {};

  const handleConfirm = () => {
    if (!confirmDialog) return;

    if (confirmDialog.type === "role") {
      changeRole.mutate(
        {
          userId: confirmDialog.userId,
          data: { role: confirmDialog.newValue as ChangeUserRoleInput["role"] },
        },
        { onSuccess: () => setConfirmDialog(null) }
      );
    } else {
      toggleActive.mutate(
        {
          userId: confirmDialog.userId,
          data: { isActive: confirmDialog.newValue as ToggleUserActiveInput["isActive"] },
        },
        { onSuccess: () => setConfirmDialog(null) }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("users.title")}</h1>
        <p className="text-gray-500 mt-1">{t("users.subtitle")}</p>
      </div>

      {/* Role Stats */}
      <div className="flex gap-4 text-sm">
        <Badge variant="secondary">
          {t("users.attendees")}: {roleStats.ATTENDEE ?? 0}
        </Badge>
        <Badge variant="secondary">
          {t("users.organizers")}: {roleStats.ORGANIZER ?? 0}
        </Badge>
        <Badge variant="secondary">
          {t("users.admins")}: {roleStats.ADMIN ?? 0}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("users.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("users.allRoles")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("users.allRoles")}</SelectItem>
            <SelectItem value="ATTENDEE">{t("users.role.ATTENDEE")}</SelectItem>
            <SelectItem value="ORGANIZER">{t("users.role.ORGANIZER")}</SelectItem>
            <SelectItem value="ADMIN">{t("users.role.ADMIN")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("users.table.name")}</TableHead>
              <TableHead>{t("users.table.email")}</TableHead>
              <TableHead>{t("users.table.role")}</TableHead>
              <TableHead>{t("users.table.status")}</TableHead>
              <TableHead>{t("users.table.events")}</TableHead>
              <TableHead>{t("users.table.bookings")}</TableHead>
              <TableHead>{t("users.table.joined")}</TableHead>
              <TableHead className="text-end">{t("users.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={!user.isActive ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={roleColors[user.role] || ""}>
                    {t(`users.role.${user.role}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                    {user.isActive ? t("users.active") : t("users.inactive")}
                  </Badge>
                </TableCell>
                <TableCell>{user.eventsCount}</TableCell>
                <TableCell>{user.bookingsCount}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")}
                </TableCell>
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Role Changes */}
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmDialog({
                            type: "role",
                            userId: user.id,
                            userName: user.name,
                            newValue: "ORGANIZER",
                          })
                        }
                        disabled={user.role === "ORGANIZER"}
                      >
                        <Shield className="h-4 w-4 me-2" />
                        {t("users.makeOrganizer")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmDialog({
                            type: "role",
                            userId: user.id,
                            userName: user.name,
                            newValue: "ATTENDEE",
                          })
                        }
                        disabled={user.role === "ATTENDEE"}
                      >
                        <UserCheck className="h-4 w-4 me-2" />
                        {t("users.makeAttendee")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmDialog({
                            type: "role",
                            userId: user.id,
                            userName: user.name,
                            newValue: "ADMIN",
                          })
                        }
                        disabled={user.role === "ADMIN"}
                      >
                        <Shield className="h-4 w-4 me-2" />
                        {t("users.makeAdmin")}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Active Toggle */}
                      {user.isActive ? (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            setConfirmDialog({
                              type: "active",
                              userId: user.id,
                              userName: user.name,
                              newValue: false,
                            })
                          }
                        >
                          <UserX className="h-4 w-4 me-2" />
                          {t("users.deactivate")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              type: "active",
                              userId: user.id,
                              userName: user.name,
                              newValue: true,
                            })
                          }
                        >
                          <UserCheck className="h-4 w-4 me-2" />
                          {t("users.activate")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("users.confirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {confirmDialog?.type === "role"
              ? t("users.confirmRoleChange", {
                  name: confirmDialog?.userName ?? "",
                  role: t(`users.role.${confirmDialog?.newValue}`),
                })
              : confirmDialog?.newValue
              ? t("users.confirmActivate", { name: confirmDialog?.userName ?? "" })
              : t("users.confirmDeactivate", { name: confirmDialog?.userName ?? "" })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={confirmDialog?.newValue === false ? "destructive" : "default"}
              disabled={changeRole.isPending || toggleActive.isPending}
            >
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
