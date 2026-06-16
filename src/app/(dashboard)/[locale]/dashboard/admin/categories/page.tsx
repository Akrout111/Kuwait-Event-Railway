"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface CategoryItem {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  iconUrl: string | null;
  description: string | null;
  eventsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const { data, isLoading } = useAdminCategories();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<CategoryItem | null>(null);

  // Form state
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditingCategory(null);
    setNameAr("");
    setNameEn("");
    setSlug("");
    setIconUrl("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setNameAr(category.nameAr);
    setNameEn(category.nameEn || "");
    setSlug(category.slug);
    setIconUrl(category.iconUrl || "");
    setDescription(category.description || "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateCategory.mutate(
        {
          categoryId: editingCategory.id,
          data: {
            nameAr,
            nameEn: nameEn || undefined,
            slug,
            iconUrl: iconUrl || undefined,
            description: description || undefined,
          },
        },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCategory.mutate(
        {
          nameAr,
          nameEn: nameEn || undefined,
          slug,
          iconUrl: iconUrl || undefined,
          description: description || undefined,
        },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const categories: CategoryItem[] = data?.data?.categories ?? [];

  // Auto-generate slug from nameEn or nameAr
  const generateSlug = () => {
    const source = nameEn || nameAr;
    if (!source) return;
    const generated = source
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
    setSlug(generated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("categories.title")}</h1>
          <p className="text-gray-500 mt-1">{t("categories.subtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 me-2" />
          {t("categories.create")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("categories.table.nameAr")}</TableHead>
              <TableHead>{t("categories.table.nameEn")}</TableHead>
              <TableHead>{t("categories.table.slug")}</TableHead>
              <TableHead>{t("categories.table.events")}</TableHead>
              <TableHead className="text-end">
                {t("categories.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.nameAr}</TableCell>
                <TableCell className="text-gray-600">
                  {category.nameEn || "—"}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {category.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.eventsCount}</Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => setDeleteDialog(category)}
                      disabled={category.eventsCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? t("categories.editCategory")
                : t("categories.createCategory")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("categories.nameAr")} *
                </label>
                <Input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: موسيقى"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("categories.nameEn")}
                </label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Music"
                  onBlur={generateSlug}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("categories.slug")} *
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="music"
                dir="ltr"
                className="font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("categories.iconUrl")}
              </label>
              <Input
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://cdn.example.com/icons/music.svg"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("categories.description")}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !nameAr.trim() ||
                !slug.trim() ||
                createCategory.isPending ||
                updateCategory.isPending
              }
            >
              {editingCategory ? t("save") : t("categories.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("categories.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {t("categories.deleteConfirm", { name: deleteDialog?.nameAr ?? "" })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog) {
                  deleteCategory.mutate(deleteDialog.id, {
                    onSuccess: () => setDeleteDialog(null),
                  });
                }
              }}
              disabled={deleteCategory.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
