import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    // Create Supabase client with RLS enforced
    const supabase = createSupabaseClient()

    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Set the auth token for this request
    const token = authHeader.replace('Bearer ', '')
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '' // Not needed for this use case
    })

    // Query organizations - RLS will automatically filter to only orgs this user is a member of
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('*')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Return the organizations (will only include orgs the user is a member of thanks to RLS!)
    return NextResponse.json({ organizations })

  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}