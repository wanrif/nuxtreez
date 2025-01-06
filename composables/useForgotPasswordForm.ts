import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

type ForgotPasswordFormData = {
  email: string
}

export const useForgotPasswordForm = () => {
  const { t } = useI18n()
  const error = ref('')
  const success = ref(false)
  const auth = useAuthStore()

  const forgotPasswordSchema = toTypedSchema(
    zod.object({
      email: zod.string().min(1, t('validation_email_required')).email(t('validation_email_invalid')),
    })
  )

  const { handleSubmit, errors, isSubmitting, meta } = useForm<ForgotPasswordFormData>({
    validationSchema: forgotPasswordSchema,
  })

  const fields = {
    email: useField<string>('email'),
  } as const

  const submit = handleSubmit(async (values) => {
    try {
      error.value = ''
      await auth.forgotPassword(values.email)
      success.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      error.value = t('forgot_password_failed')
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
