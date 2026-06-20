export async function triagePatient({
  condition,
  severity,
  age,
  blood_group,
  allergies
}: {
  condition: string
  severity: number
  age: number
  blood_group: string
  allergies?: string
}) {
  const map: Record<string, any> = {
    'Cardiac': {
      required_specialty: 'Cardiology',
      urgency: severity >= 8 ? 'critical' : 'high',
      equipment_needed: ['Defibrillator', 'ECG Machine', 'Cardiac Monitor', 'IV Line'],
      blood_required: blood_group || 'any',
      prep_instructions: [
        'Activate cardiac emergency team immediately',
        'Prepare defibrillator and ECG machine',
        'Clear ICU bay and have crash cart ready',
        'Ensure cardiologist is on standby',
        'Set up IV access and cardiac medications',
        'Prepare oxygen supply',
        'Alert cath lab if STEMI suspected'
      ]
    },
    'Trauma': {
      required_specialty: 'Trauma Surgery',
      urgency: 'critical',
      equipment_needed: ['Trauma Bay', 'Blood Transfusion Kit', 'Ventilator', 'X-Ray'],
      blood_required: blood_group || 'O-',
      prep_instructions: [
        'Activate trauma team immediately',
        'Prepare trauma bay',
        'Have O- blood units ready',
        'Ensure trauma surgeon available',
        'Set up rapid infusion system',
        'Prepare X-ray and CT scanner',
        'Alert OR for possible emergency surgery'
      ]
    },
    'Neurological': {
      required_specialty: 'Neurology',
      urgency: severity >= 7 ? 'critical' : 'high',
      equipment_needed: ['CT Scanner', 'MRI', 'Neuro Monitor', 'Ventilator'],
      blood_required: blood_group || 'any',
      prep_instructions: [
        'Alert neurology team immediately',
        'Prepare CT scanner for immediate use',
        'Set up neuro ICU bay',
        'Ensure neurosurgeon on standby',
        'Prepare anticonvulsant medications',
        'Have intubation equipment ready',
        'Clear MRI suite if stroke suspected'
      ]
    },
    'Burns': {
      required_specialty: 'Burns',
      urgency: severity >= 7 ? 'critical' : 'high',
      equipment_needed: ['Burns Unit', 'Sterile Dressings', 'IV Fluids', 'Pain Management'],
      blood_required: blood_group || 'any',
      prep_instructions: [
        'Activate burns team',
        'Prepare sterile burns dressing kit',
        'Set up IV fluid resuscitation',
        'Ensure burns ICU bed available',
        'Prepare morphine for pain management',
        'Have airway management kit ready',
        'Alert plastic surgery if needed'
      ]
    },
    'Maternity': {
      required_specialty: 'Maternity',
      urgency: severity >= 7 ? 'critical' : 'high',
      equipment_needed: ['Delivery Room', 'Neonatal Kit', 'Fetal Monitor', 'Blood'],
      blood_required: blood_group || 'any',
      prep_instructions: [
        'Alert OB/GYN team immediately',
        'Prepare delivery room',
        'Have neonatal resuscitation kit ready',
        'Set up fetal heart monitor',
        'Alert NICU team to standby',
        'Prepare emergency C-section team if needed',
        'Ensure blood bank has O- available'
      ]
    },
    'Respiratory': {
      required_specialty: 'Respiratory',
      urgency: severity >= 7 ? 'critical' : 'high',
      equipment_needed: ['Ventilator', 'Oxygen', 'Nebulizer', 'Pulse Oximeter'],
      blood_required: blood_group || 'any',
      prep_instructions: [
        'Prepare ventilator and oxygen supply',
        'Alert pulmonology team',
        'Set up nebulization station',
        'Ensure pulse oximeter and ABG kit ready',
        'Prepare bronchodilator medications',
        'Clear respiratory ICU bay',
        'Have intubation trolley on standby'
      ]
    },
    'Other': {
      required_specialty: 'General Surgery',
      urgency: severity >= 8 ? 'high' : 'moderate',
      equipment_needed: ['General Bay', 'IV Line', 'Basic Monitors'],
      blood_required: blood_group || 'any',
      prep_instructions: [
        'Prepare general emergency bay',
        'Set up basic monitoring equipment',
        'Alert on-call physician',
        'Have IV access equipment ready',
        'Prepare basic resuscitation kit',
        'Ensure blood typing equipment available',
        'Alert relevant specialist based on symptoms'
      ]
    }
  }

  const result = { ...(map[condition] || map['Other']) }

  if (severity >= 9) result.urgency = 'critical'
  else if (severity <= 3) result.urgency = 'moderate'

  return result
}
