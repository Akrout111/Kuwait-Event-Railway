import { z } from "zod";

/** Sign In validation schema */
export const signInSchema = z.object({
  email: z
    .string({ message: "البريد الإلكتروني مطلوب" })
    .min(1, { message: "البريد الإلكتروني مطلوب" })
    .email({ message: "يرجى إدخال بريد إلكتروني صالح" }),
  password: z
    .string({ message: "كلمة المرور مطلوبة" })
    .min(1, { message: "كلمة المرور مطلوبة" })
    .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

/** Sign Up validation schema */
export const signUpSchema = z.object({
  name: z
    .string({ message: "الاسم مطلوب" })
    .min(1, { message: "الاسم مطلوب" })
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الاسم يجب أن يكون أقل من 100 حرف" }),
  email: z
    .string({ message: "البريد الإلكتروني مطلوب" })
    .min(1, { message: "البريد الإلكتروني مطلوب" })
    .email({ message: "يرجى إدخال بريد إلكتروني صالح" }),
  password: z
    .string({ message: "كلمة المرور مطلوبة" })
    .min(1, { message: "كلمة المرور مطلوبة" })
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .regex(/[A-Z]/, { message: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل" })
    .regex(/[a-z]/, { message: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل" })
    .regex(/[0-9]/, { message: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" }),
  confirmPassword: z
    .string({ message: "يرجى تأكيد كلمة المرور" })
    .min(1, { message: "يرجى تأكيد كلمة المرور" }),
  phone: z
    .string({ message: "رقم الهاتف مطلوب" })
    .regex(/^965\d{8}$/, { message: "رقم الهاتف يجب أن يبدأ بـ 965 ويتكون من 11 رقم" })
    .optional()
    .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

/** Forgot Password validation schema */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "البريد الإلكتروني مطلوب" })
    .min(1, { message: "البريد الإلكتروني مطلوب" })
    .email({ message: "يرجى إدخال بريد إلكتروني صالح" }),
});

/** Reset Password validation schema */
export const resetPasswordSchema = z.object({
  password: z
    .string({ message: "كلمة المرور مطلوبة" })
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .regex(/[A-Z]/, { message: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل" })
    .regex(/[a-z]/, { message: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل" })
    .regex(/[0-9]/, { message: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" }),
  confirmPassword: z
    .string({ message: "يرجى تأكيد كلمة المرور" })
    .min(1, { message: "يرجى تأكيد كلمة المرور" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
