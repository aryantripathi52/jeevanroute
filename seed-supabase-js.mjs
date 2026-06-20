import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Manually read .env.local
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Env variables missing!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const mockHospitals = [
  {
    name: 'AIIMS Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
    lat: 28.5672,
    lng: 77.2100,
    specialties: ['Cardiology', 'Neurology', 'Trauma Surgery', 'Burns', 'Oncology'],
    icu_available: true,
    available_beds: 12,
    blood_types_available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  {
    name: 'Safdarjung Hospital',
    address: 'Safdarjung Enclave, New Delhi - 110029',
    lat: 28.5680,
    lng: 77.2068,
    specialties: ['Trauma Surgery', 'Orthopedics', 'General Surgery', 'Neurology'],
    icu_available: true,
    available_beds: 8,
    blood_types_available: ['A+', 'B+', 'O+', 'O-', 'AB+']
  },
  {
    name: 'Fortis Escorts Heart Institute',
    address: 'Okhla Road, New Delhi - 110025',
    lat: 28.5495,
    lng: 77.2646,
    specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
    icu_available: true,
    available_beds: 6,
    blood_types_available: ['A+', 'A-', 'B+', 'O+', 'O-', 'AB+']
  },
  {
    name: 'Max Super Speciality Hospital Saket',
    address: 'Press Enclave Marg, Saket, New Delhi - 110017',
    lat: 28.5285,
    lng: 77.2196,
    specialties: ['Neurology', 'Neurosurgery', 'Cardiology', 'Oncology', 'Orthopedics'],
    icu_available: true,
    available_beds: 15,
    blood_types_available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  {
    name: 'Apollo Hospital Sarita Vihar',
    address: 'Mathura Road, Sarita Vihar, New Delhi - 110076',
    lat: 28.5215,
    lng: 77.2817,
    specialties: ['Trauma Surgery', 'Burns', 'Plastic Surgery', 'Cardiology'],
    icu_available: true,
    available_beds: 10,
    blood_types_available: ['A+', 'B+', 'B-', 'O+', 'O-', 'AB+']
  },
  {
    name: 'Sir Ganga Ram Hospital',
    address: 'Rajinder Nagar, New Delhi - 110060',
    lat: 28.6380,
    lng: 77.1895,
    specialties: ['Cardiology', 'Gastroenterology', 'Neurology', 'Maternity'],
    icu_available: true,
    available_beds: 7,
    blood_types_available: ['A+', 'A-', 'B+', 'O+', 'O-']
  },
  {
    name: 'Lok Nayak Hospital',
    address: 'Jawaharlal Nehru Marg, New Delhi - 110002',
    lat: 28.6391,
    lng: 77.2367,
    specialties: ['Trauma Surgery', 'General Medicine', 'Orthopedics', 'Burns'],
    icu_available: true,
    available_beds: 20,
    blood_types_available: ['A+', 'B+', 'O+', 'O-', 'AB+', 'AB-']
  },
  {
    name: 'Medanta - The Medicity',
    address: 'CH Baktawar Singh Rd, Sector 38, Gurugram - 122001',
    lat: 28.4421,
    lng: 77.0463,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Transplant', 'Respiratory'],
    icu_available: true,
    available_beds: 18,
    blood_types_available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  {
    name: 'Artemis Hospital',
    address: 'Sector 51, Gurugram - 122001',
    lat: 28.4201,
    lng: 77.0467,
    specialties: ['Trauma Surgery', 'Orthopedics', 'Neurosurgery', 'Cardiology'],
    icu_available: true,
    available_beds: 9,
    blood_types_available: ['A+', 'B+', 'O+', 'O-', 'AB+']
  },
  {
    name: 'Fortis Memorial Research Institute',
    address: 'Sector 44, Gurugram - 122002',
    lat: 28.4550,
    lng: 77.0610,
    specialties: ['Neurology', 'Neurosurgery', 'Cardiac Surgery', 'Oncology'],
    icu_available: true,
    available_beds: 11,
    blood_types_available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-']
  },
  {
    name: 'Max Hospital Patparganj',
    address: 'W-3, Sector 1, Patparganj Industrial Area, Delhi - 110092',
    lat: 28.6193,
    lng: 77.3041,
    specialties: ['Maternity', 'Neonatology', 'Gynecology', 'Cardiology'],
    icu_available: true,
    available_beds: 8,
    blood_types_available: ['A+', 'A-', 'B+', 'O+', 'AB+']
  },
  {
    name: 'Safdarjung Enclave Hospital',
    address: 'B-Block, Safdarjung Enclave, New Delhi - 110029',
    lat: 28.5649,
    lng: 77.2008,
    specialties: ['Respiratory', 'Pulmonology', 'General Medicine', 'ICU'],
    icu_available: false,
    available_beds: 4,
    blood_types_available: ['A+', 'B+', 'O+', 'O-']
  },
  {
    name: 'Holy Family Hospital',
    address: 'Okhla Road, New Delhi - 110025',
    lat: 28.5536,
    lng: 77.2717,
    specialties: ['Maternity', 'Pediatrics', 'General Surgery', 'Orthopedics'],
    icu_available: true,
    available_beds: 6,
    blood_types_available: ['A+', 'B+', 'O+', 'AB+']
  },
  {
    name: 'GTB Hospital Dilshad Garden',
    address: 'Dilshad Garden, Delhi - 110095',
    lat: 28.6785,
    lng: 77.3146,
    specialties: ['Burns', 'Trauma Surgery', 'Orthopedics', 'General Medicine'],
    icu_available: true,
    available_beds: 14,
    blood_types_available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+']
  },
  {
    name: 'Venkateshwar Hospital',
    address: 'Sector 18A, Dwarka, New Delhi - 110075',
    lat: 28.5921,
    lng: 77.0413,
    specialties: ['Cardiology', 'Neurology', 'Maternity', 'Orthopedics', 'Respiratory'],
    icu_available: true,
    available_beds: 13,
    blood_types_available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  }
]

async function seed() {
  console.log('Clearing existing hospitals...')
  const { error: delError } = await supabase.from('hospitals').delete().neq('name', '')
  if (delError) {
    console.error('Error clearing hospitals:', delError)
  }

  console.log('Inserting mock hospitals...')
  const { data, error } = await supabase.from('hospitals').insert(mockHospitals).select()
  if (error) {
    console.error('Error seeding hospitals:', error)
  } else {
    console.log(`Successfully seeded ${data.length} hospitals!`)
  }
}

seed()
