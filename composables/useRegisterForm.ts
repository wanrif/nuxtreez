import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const useRegisterForm = () => {
  const { t } = useI18n()
  const error = ref('')
  const auth = useAuthStore()
  const router = useRouter()

  const registerSchema = toTypedSchema(
    zod
      .object({
        name: zod.string().min(2, t('validation_name_min')),
        email: zod.string().min(1, t('validation_email_required')).email(t('validation_email_invalid')),
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

  const { handleSubmit, errors, isSubmitting, meta } = useForm<RegisterFormData>({
    validationSchema: registerSchema,
  })

  const fields = {
    name: useField<string>('name'),
    email: useField<string>('email'),
    password: useField<string>('password'),
    confirmPassword: useField<string>('confirmPassword'),
  } as const

  const handleRegisterSuccess = async () => {
    await router.push('/login')
  }

  const submit = handleSubmit(async (values) => {
    try {
      error.value = ''
      await auth.register(values)
      await handleRegisterSuccess()
    } catch (e) {
      error.value = e instanceof Error ? e.message : t('register_failed')
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
