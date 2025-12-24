"use client";
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

const SignInWithGoogleButton = () => {
  const supabase = createClient()

  const handleGoogleSignIn = useCallback(async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google sign-in failed', error.message)
    }
  }, [supabase])

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
    >
      Login with Google
    </Button>
  );
};

export default SignInWithGoogleButton;