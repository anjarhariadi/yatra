"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updatePassword } from '../api/auth-client'
import { newPasswordSchema, type NewPasswordInput } from '../validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

export function NewPasswordForm() {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
  })

  const onSubmit = async (data: NewPasswordInput) => {
    try {
      await updatePassword(data)
      router.push('/')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
          <p className="text-sm text-center">
            <Link href="/login" className="underline">
              Back to Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
