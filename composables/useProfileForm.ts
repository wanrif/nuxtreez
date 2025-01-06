import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

export type ProfileFormData = {
  name: string
  email: string
  phone: string
  location: string
  website: string
  bio: string
}

export const useProfileForm = (initialValues: ProfileFormData, onSubmit: (_values: ProfileFormData) => void) => {
  const { t } = useI18n()

  const profileSchema = toTypedSchema(
    zod.object({
      name: zod.string().min(1, t('validation_name_required')),
      email: zod.string().min(1, t('validation_email_required')).email(t('validation_email_invalid')),
      phone: zod.string().min(10, t('validation_phone_length')).max(15).nullish().or(zod.literal('')),
      location: zod.string().nullish().or(zod.literal('')),
      website: zod.string().url(t('validation_website_invalid')).nullish().or(zod.literal('')),
      bio: zod.string().max(250, t('validation_bio_max')).nullish().or(zod.literal('')),
    })
  )

  const { handleSubmit, errors, isSubmitting, meta, resetForm } = useForm<ProfileFormData>({
    validationSchema: profileSchema,
    initialValues,
  })

  const fields = {
    name: useField<string>('name'),
    email: useField<string>('email'),
    phone: useField<string>('phone'),
    location: useField<string>('location'),
    website: useField<string>('website'),
    bio: useField<string>('bio'),
  } as const

  const submit = handleSubmit(onSubmit)

  return {
    fields,
    errors,
    isSubmitting,
    meta,
    submit,
    resetForm,
  } as const
}
