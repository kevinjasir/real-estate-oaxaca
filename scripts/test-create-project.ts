import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fenarzhhpgwzrietytvx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbmFyemhocGd3enJpZXR5dHZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5MTg3NSwiZXhwIjoyMDg1NTY3ODc1fQ.r4V1h9029pWZGjwUMe5Or6uTuYh6AuG_ozfkkYacdfA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCreateProject() {
  console.log('🚀 Testing project creation...')

  // First, let's check the current projects
  const { data: existingProjects, error: listError } = await supabase
    .from('projects')
    .select('id, name, slug, status')
    .limit(5)

  console.log('\n📋 Existing projects:')
  if (listError) {
    console.error('Error listing projects:', listError)
  } else {
    console.log(existingProjects)
  }

  // Now let's check what columns exist
  const { data: cols, error: colError } = await supabase
    .from('projects')
    .select('*')
    .limit(1)

  if (cols && cols.length > 0) {
    console.log('\n📊 Project columns:', Object.keys(cols[0]))
  }

  // Check if city_id, state_id, country_id are required
  console.log('\n🔍 Checking required columns...')

  // Try creating a minimal project first
  const testProject = {
    name: 'Proyecto Test Directo',
    slug: 'proyecto-test-directo-' + Date.now(),
    status: 'draft',
  }

  console.log('\n🧪 Attempting to create project with minimal data:', testProject)

  const { data: newProject, error: insertError } = await supabase
    .from('projects')
    .insert(testProject)
    .select()
    .single()

  if (insertError) {
    console.error('\n❌ Insert error:', insertError)
    console.log('\nError details:')
    console.log('  - Code:', insertError.code)
    console.log('  - Message:', insertError.message)
    console.log('  - Details:', insertError.details)
    console.log('  - Hint:', insertError.hint)

    // If foreign key error, let's check what's needed
    if (insertError.code === '23503' || insertError.message?.includes('foreign key')) {
      console.log('\n⚠️ Foreign key constraint violation. Checking required references...')

      // Check countries, states, cities tables
      const { data: countries } = await supabase.from('countries').select('*').limit(3)
      console.log('\nCountries:', countries)

      const { data: states } = await supabase.from('states').select('*').limit(3)
      console.log('States:', states)

      const { data: cities } = await supabase.from('cities').select('*').limit(3)
      console.log('Cities:', cities)
    }
  } else {
    console.log('\n✅ Project created successfully!')
    console.log('Project ID:', newProject.id)
    console.log('Project slug:', newProject.slug)

    // Clean up test project
    console.log('\n🧹 Cleaning up test project...')
    await supabase.from('projects').delete().eq('id', newProject.id)
    console.log('Test project deleted.')
  }
}

testCreateProject().catch(console.error)
