import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if they are already in a team
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)

  if (teamMembers && teamMembers.length > 0) {
    redirect('/')
  }

  async function createTeam(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const teamName = formData.get('teamName') as string

    // Insert new team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({ name: teamName, owner_id: user.id })
      .select()
      .single()

    if (teamError || !team) {
      console.error(teamError)
      return
    }

    // Insert team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, user_id: user.id, role: 'owner' })
      
    if (memberError) {
      console.error("Member Insert Error:", memberError)
    }

    const cookieStore = await cookies()
    cookieStore.set('active_team_id', team.id, { path: '/' })

    revalidatePath('/', 'layout')
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 border border-border p-8 rounded-xl bg-card shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your Personal Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Let's set up your personal space. You can always invite others later to turn this into a Team.
          </p>
        </div>
        
        <form action={createTeam} className="flex flex-col gap-4 mt-4">
          <div className="grid gap-2">
            <label htmlFor="teamName" className="text-sm font-medium leading-none">Your Name / Workspace Name</label>
            <input 
              id="teamName" 
              name="teamName" 
              type="text" 
              required 
              placeholder="e.g. John's Space"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <button 
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
          >
            Launch Workspace
          </button>
        </form>
      </div>
    </div>
  )
}
