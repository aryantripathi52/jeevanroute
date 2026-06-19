-- ============================================
-- GoldenHour — Supabase Schema + Seed Data
-- Run this in the Supabase SQL Editor
-- ============================================

-- Hospitals table
create table if not exists hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat float not null,
  lng float not null,
  specialties text[],
  icu_available boolean default true,
  available_beds int default 10,
  blood_types_available text[]
);

-- Cases table
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  patient_condition text,
  severity int,
  age int,
  blood_group text,
  allergies text,
  pickup_lat float,
  pickup_lng float,
  current_lat float,
  current_lng float,
  ai_triage_result jsonb,
  status text default 'active',
  assigned_hospital_id uuid references hospitals(id),
  declined_hospitals uuid[] default '{}'
);

-- Alerts table
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id),
  hospital_id uuid references hospitals(id),
  status text default 'pending',
  decline_reason text,
  created_at timestamp default now(),
  responded_at timestamp
);

-- Enable Realtime on alerts
alter publication supabase_realtime add table alerts;

-- ============================================
-- SEED: 15 Delhi/NCR Hospitals
-- ============================================
insert into hospitals (name, address, lat, lng, specialties, icu_available, available_beds, blood_types_available) values
(
  'AIIMS Delhi',
  'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
  28.5672, 77.2100,
  ARRAY['Cardiology', 'Neurology', 'Trauma Surgery', 'Burns', 'Oncology'],
  true, 12,
  ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
),
(
  'Safdarjung Hospital',
  'Safdarjung Enclave, New Delhi - 110029',
  28.5680, 77.2068,
  ARRAY['Trauma Surgery', 'Orthopedics', 'General Surgery', 'Neurology'],
  true, 8,
  ARRAY['A+', 'B+', 'O+', 'O-', 'AB+']
),
(
  'Fortis Escorts Heart Institute',
  'Okhla Road, New Delhi - 110025',
  28.5495, 77.2646,
  ARRAY['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
  true, 6,
  ARRAY['A+', 'A-', 'B+', 'O+', 'O-', 'AB+']
),
(
  'Max Super Speciality Hospital Saket',
  'Press Enclave Marg, Saket, New Delhi - 110017',
  28.5285, 77.2196,
  ARRAY['Neurology', 'Neurosurgery', 'Cardiology', 'Oncology', 'Orthopedics'],
  true, 15,
  ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
),
(
  'Apollo Hospital Sarita Vihar',
  'Mathura Road, Sarita Vihar, New Delhi - 110076',
  28.5215, 77.2817,
  ARRAY['Trauma Surgery', 'Burns', 'Plastic Surgery', 'Cardiology'],
  true, 10,
  ARRAY['A+', 'B+', 'B-', 'O+', 'O-', 'AB+']
),
(
  'Sir Ganga Ram Hospital',
  'Rajinder Nagar, New Delhi - 110060',
  28.6380, 77.1895,
  ARRAY['Cardiology', 'Gastroenterology', 'Neurology', 'Maternity'],
  true, 7,
  ARRAY['A+', 'A-', 'B+', 'O+', 'O-']
),
(
  'Lok Nayak Hospital',
  'Jawaharlal Nehru Marg, New Delhi - 110002',
  28.6391, 77.2367,
  ARRAY['Trauma Surgery', 'General Medicine', 'Orthopedics', 'Burns'],
  true, 20,
  ARRAY['A+', 'B+', 'O+', 'O-', 'AB+', 'AB-']
),
(
  'Medanta - The Medicity',
  'CH Baktawar Singh Rd, Sector 38, Gurugram - 122001',
  28.4421, 77.0463,
  ARRAY['Cardiology', 'Neurology', 'Oncology', 'Transplant', 'Respiratory'],
  true, 18,
  ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
),
(
  'Artemis Hospital',
  'Sector 51, Gurugram - 122001',
  28.4201, 77.0467,
  ARRAY['Trauma Surgery', 'Orthopedics', 'Neurosurgery', 'Cardiology'],
  true, 9,
  ARRAY['A+', 'B+', 'O+', 'O-', 'AB+']
),
(
  'Fortis Memorial Research Institute',
  'Sector 44, Gurugram - 122002',
  28.4550, 77.0610,
  ARRAY['Neurology', 'Neurosurgery', 'Cardiac Surgery', 'Oncology'],
  true, 11,
  ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-']
),
(
  'Max Hospital Patparganj',
  'W-3, Sector 1, Patparganj Industrial Area, Delhi - 110092',
  28.6193, 77.3041,
  ARRAY['Maternity', 'Neonatology', 'Gynecology', 'Cardiology'],
  true, 8,
  ARRAY['A+', 'A-', 'B+', 'O+', 'AB+']
),
(
  'Safdarjung Enclave Hospital',
  'B-Block, Safdarjung Enclave, New Delhi - 110029',
  28.5649, 77.2008,
  ARRAY['Respiratory', 'Pulmonology', 'General Medicine', 'ICU'],
  false, 4,
  ARRAY['A+', 'B+', 'O+', 'O-']
),
(
  'Holy Family Hospital',
  'Okhla Road, New Delhi - 110025',
  28.5536, 77.2717,
  ARRAY['Maternity', 'Pediatrics', 'General Surgery', 'Orthopedics'],
  true, 6,
  ARRAY['A+', 'B+', 'O+', 'AB+']
),
(
  'GTB Hospital Dilshad Garden',
  'Dilshad Garden, Delhi - 110095',
  28.6785, 77.3146,
  ARRAY['Burns', 'Trauma Surgery', 'Orthopedics', 'General Medicine'],
  true, 14,
  ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+']
),
(
  'Venkateshwar Hospital',
  'Sector 18A, Dwarka, New Delhi - 110075',
  28.5921, 77.0413,
  ARRAY['Cardiology', 'Neurology', 'Maternity', 'Orthopedics', 'Respiratory'],
  true, 13,
  ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
);
