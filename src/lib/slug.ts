import { db } from "./db";

const MAX_TRIES = 100;

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function generateUniqueSlug(
  titleAr: string,
  titleEn?: string
): Promise<string> {
  const baseSlug = titleEn ? toSlug(titleEn) : toSlug(titleAr);
  let slug = baseSlug || `event-${Date.now().toString(36)}`;
  let counter = 1;
  let tries = 0;

  while (await db.event.findUnique({ where: { slug } })) {
    tries++;
    if (tries >= MAX_TRIES) {
      return `${baseSlug}-${Date.now().toString(36)}`;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
