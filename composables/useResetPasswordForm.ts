import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

type ResetPasswordFormData = {
  password: string
  confirmPassword: string
}

export const useResetPasswordForm = (token: string) => {
  const { t } = useI18n()
  const router = useRouter()
  const auth = useAuthStore()
  const error = ref('')
  const success = ref(false)

  const resetPasswordSchema = toTypedSchema(
    zod
      .object({
        password: zod
          .string()
          .min(8, t('validation_password_min'))
          .regex(/[A-Z]/, t('validation_password_uppercase'))
          .regex(/[a-z]/, t('validation_password_lowercase'))
          .regex(/[0-9]/, t('validation_password_number')),
        confirmPassword: zod.string().min(1, t('validation_confirm_password_required')),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t('passwords_not_match'),
        path: ['confirmPassword'],
      })
  )

  const { handleSubmit, errors, meta, isSubmitting } = useForm<ResetPasswordFormData>({
    validationSchema: resetPasswordSchema,
  })

  const fields = {
    password: useField<string>('password'),
    confirmPassword: useField<string>('confirmPassword'),
  } as const

  const submit = handleSubmit(async (values) => {
    try {
      error.value = ''
      await auth.resetPassword(token, values.password)
      success.value = true
      setTimeout(() => router.push('/login'), 3000)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      error.value = t('reset_password_failed')
    }
  })

  return {
    fields,
    errors,
    isSubmitting,
    meta,
    error,
    success,
    submit,
  } as const
}
