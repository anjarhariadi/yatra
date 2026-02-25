"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { resetPassword } from '../api/auth-client'
import { resetPasswordSchema, type ResetPasswordInput } from '../validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

export function ResetPasswordForm() {
  const [success, setSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetPassword(data)
      setSuccess(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {success && (
            <p className="text-sm text-green-600">
              Check your email for the password reset link
            </p>
          )}
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                  disabled={success}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting || success}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <p className="text-sm text-center">
            Remember your password?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
