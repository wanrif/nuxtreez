import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

type LoginFormData = {
  email: string
  password: string
}

export const useLoginForm = (onSuccess: () => void) => {
  const { t } = useI18n()
  const error = ref('')
  const auth = useAuthStore()

  const loginSchema = toTypedSchema(
    zod.object({
      email: zod.string().min(1, t('validation_email_required')).email(t('validation_email_invalid')),
      password: zod.string().min(8, t('validation_password_min')),
    })
  )

  const { handleSubmit, errors, isSubmitting, meta } = useForm<LoginFormData>({
    validationSchema: loginSchema,
  })

  const fields = {
    email: useField<string>('email'),
    password: useField<string>('password'),
  } as const

  const submit = handleSubmit(async (values) => {
    try {
      error.value = ''
      await auth.login(values)
      onSuccess()
    } catch (e) {
      error.value = e instanceof Error ? e.message : t('login_failed')
    }
  })

  return {
    fields,
    errors,
    isSubmitting,
    meta,
    error,
    submit,
  } as const
}
