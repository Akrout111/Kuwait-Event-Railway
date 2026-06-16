"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/validators/auth-schema";
import { useSafeAuth } from "@/hooks/use-safe-auth";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Calendar, Mail, Lock, User, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { signUp } = useSafeAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  async function onSubmit(data: SignUpInput) {
    if (!signUp) return;
    setIsLoading(true);
    try {
      await signUp(data.name, data.email, data.password, data.phone || undefined);
      toast.success(t("signUpSuccess"));
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("signUpFailed");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-6 group"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Calendar className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="gradient-text text-2xl font-bold tracking-tight">
              {tCommon("appName")}
            </span>
          </Link>
        </div>

        <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/20">
          <CardHeader className="text-center pb-2 pt-6 px-6">
            <h1 className="text-2xl font-bold text-white">
              {t("createAccount")}
            </h1>
            <p className="text-white/50 text-sm mt-1.5">
              {t("signUpSubtitle")}
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">
                        {t("name")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input
                            {...field}
                            placeholder={t("namePlaceholder")}
                            className="ps-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">
                        {t("email")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@example.com"
                            dir="ltr"
                            className="ps-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Phone (optional) */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">
                        {t("phoneOptional")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input
                            {...field}
                            placeholder="965XXXXXXXX"
                            dir="ltr"
                            className="ps-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">
                        {t("password")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            dir="ltr"
                            className="ps-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                      <p className="text-white/25 text-[11px] mt-1">
                        {t("passwordRequirements")}
                      </p>
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">
                        {t("confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            dir="ltr"
                            className="ps-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full glow-gold bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold transition-all"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    t("signUpButton")
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-transparent text-white/30">
                  {t("orSeparator")}
                </span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <span className="text-white/40 text-sm">
                {t("hasAccount")}{" "}
              </span>
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {t("hasAccountLink")}
              </Link>
            </div>

            {/* Back to home */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/50 text-xs transition-colors"
              >
                <BackArrow className="h-3 w-3" />
                {tCommon("home")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
