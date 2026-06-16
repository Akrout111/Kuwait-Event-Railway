# منصة فعاليات الكويت — Kuwait Events Platform

منصة كاملة لاكتشاف وحجز الفعاليات في الكويت، مع دعم اللغتين العربية والإنجليزية (RTL/LTR)، نظام مصادقة مزدوج (Clerk + مخصّص)، بوابة دفع KNet، وتخزين Cloudflare R2.

هذا الريبو **جاهز للديبلوي مباشرة على Railway** — كل ملفات الإعداد معدّة ومختبرة.

---

## ✨ المميزات

- **Next.js 16** (App Router) + React 19 + TypeScript
- **PostgreSQL** عبر Supabase (مع Prisma 6 ORM)
- **مصادقة مزدوجة**: Clerk + JWT مخصّص (bcryptjs)
- **بوابة دفع KNet** (Mock mode للتجربة)
- **تخزين Cloudflare R2** للصور
- **البريد الإلكتروني** عبر Resend + React Email
- **i18n** عربي/إنجليزي مع دعم RTL كامل
- **Rate Limiting** عبر Upstash Redis (مع fallback في الذاكرة)
- **حماية CSRF** لكل طلبات الـ API
- **Docker** multi-stage build (Bun runtime)

---

## 🚀 الديبلوي على Railway

### المتطلبات المسبقة

قبل البدء، تأكد من إنشاء حسابات على:
1. **[Railway](https://railway.app)** — منصة الاستضافة
2. **[Supabase](https://supabase.com)** — قاعدة بيانات PostgreSQL
3. **[Clerk](https://clerk.com)** — خدمة المصادقة
4. (اختياري) **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — تخزين الصور
5. (اختياري) **[Resend](https://resend.com)** — البريد الإلكتروني
6. (اختياري) **[Upstash](https://upstash.com)** — Redis لـ Rate Limiting

### خطوات الديبلوي

#### 1️⃣ اربط الريبو بـ Railway

1. سجّل الدخول إلى [Railway](https://railway.app)
2. اضغط **New Project** → **Deploy from GitHub repo**
3. اختر الريبو `Akrout111/Kuwait-Event-Railway`
4. Railway سيكتشف الـ Dockerfile تلقائياً ويبدأ البناء

#### 2️⃣ أضف متغيرات البيئة

في صفحة المشروع على Railway، اذهب إلى تبويب **Variables** وأضف المتغيرات من ملف `.env.example`:

**الحد الأدنى المطلوب لبدء التشغيل:**

| المتغير | القيمة | المصدر |
|---------|--------|--------|
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres` | Supabase → Settings → Database |
| `DIRECT_URL` | نفس `DATABASE_URL` (للهجرات) | Supabase |
| `JWT_SECRET` | سلسلة عشوائية ≥ 32 حرفاً | شغّل: `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_APP.up.railway.app` | Railway (بعد أول ديبولي) |
| `NODE_ENV` | `production` | ثابت |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Clerk Dashboard |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk Dashboard |

**متغيرات إضافية (اختيارية لكن موصى بها):**

| المتغير | الوصف |
|---------|--------|
| `CLERK_WEBHOOK_SECRET` | من Clerk → Webhooks |
| `KNET_*` | بيانات بوابة KNet |
| `R2_*` | بيانات Cloudflare R2 |
| `RESEND_API_KEY` | مفتاح Resend |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | بيانات Upstash |

#### 3️⃣ احصل على رابط Railway

بعد إضافة المتغيرات، اضغط **Settings** → **Networking** → **Generate Domain**.
ستحصل على رابط مثل: `https://kuwait-events-production.up.railway.app`

⚠️ **مهم**: بعد الحصول على الرابط، عُد إلى المتغيرات وحدّث:
- `NEXT_PUBLIC_APP_URL` → رابط Railway الجديد
- `KNET_CALLBACK_URL` → `https://YOUR_RAILWAY_DOMAIN.up.railway.app/api/v1/payments/callback`

#### 4️⃣ إعداد Clerk Webhook (للمزامنة)

1. في Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://YOUR_RAILWAY_DOMAIN.up.railway.app/api/v1/webhooks/clerk`
3. الأحداث المطلوبة: `user.created`, `user.updated`, `user.deleted`
4. انسخ **Signing Secret** وأضفه كـ `CLERK_WEBHOOK_SECRET` في Railway

#### 5️⃣ إعداد قاعدة البيانات

عند أول إقلاع، الـ Dockerfile سيشغّل تلقائياً:
```
bunx prisma migrate deploy
```
هذا سينشئ كل الجداول في Supabase تلقائياً. ✅

**لتعبئة البيانات الأولية (Seed):**
```bash
# في Railway → Settings → Commands → Run Command:
bunx tsx prisma/seed.ts
```

---

## 🛠️ التشغيل محلياً (للتطوير)

```bash
# 1. تثبيت الحزم
bun install

# 2. نسخ ملف البيئة
cp .env.example .env
# ثم عدّل القيم في .env

# 3. توليد Prisma Client
bun run db:generate

# 4. تشغيل الهجرة (يتطلب DATABASE_URL في .env)
bun run db:migrate:deploy

# 5. (اختياري) تعبئة البيانات الأولية
bun run db:seed

# 6. تشغيل خادم التطوير
bun run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 📁 هيكل المشروع

```
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema (مفعّل)
│   ├── migrations/                # ملفات الهجرة (PostgreSQL)
│   └── seed.ts                    # البيانات الأولية
├── src/
│   ├── app/                       # Next.js App Router
│   ├── components/                # مكونات React
│   ├── lib/                       # أدوات ومكتبات
│   ├── hooks/                     # React Hooks
│   ├── emails/                    # قوالب البريد
│   ├── i18n/                      # إعدادات التوطين
│   └── proxy.ts                   # Next.js 16 Proxy (CSRF + Auth)
├── public/                        # ملفات ثابتة
├── Dockerfile                     # Railway-ready multi-stage build
├── railway.json                   # إعدادات Railway
├── next.config.ts                 # Next.js config (standalone output)
└── package.json
```

---

## 🔒 ملاحظات أمنية

- `JWT_SECRET` يجب أن يكون ≥ 32 حرفاً وعشوائياً تماماً
- `CLERK_SECRET_KEY` لا تكشفها لأحد
- في الإنتاج، تأكد أن `NODE_ENV=production` (Railway يضبط هذا تلقائياً)
- الـ Dockerfile يعمل بـ non-root user لأسباب أمنية

---

## 📞 الدعم

- **الريبو**: [github.com/Akrout111/Kuwait-Event-Railway](https://github.com/Akrout111/Kuwait-Event-Railway)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)

---

صُنع بـ ❤️ لفعاليات الكويت
