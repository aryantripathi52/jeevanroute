import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let value = match[2] || ''
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1)
    }
    env[key] = value.trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  const { data, error } = await supabase.from('cases').insert({
    patient_condition: 'Cardiac arrest test',
    severity: 9,
    age: 45,
    blood_group: 'AB+',
    pickup_lat: 28.56,
    pickup_lng: 77.21,
    current_lat: 28.56,
    current_lng: 77.21,
    status: 'active'
  }).select()

  if (error) {
    console.error('Insert failed:', error)
  } else {
    console.log('Insert succeeded! Row:', data)
  }
}

testInsert()
