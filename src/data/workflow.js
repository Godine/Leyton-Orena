// Canonical claim-cycle workflow used by the fire-streak system.
// A "stage advance" is any move from one stage to the next in this order.
// Earning the daily fire requires ≥1 such advance happening on a given day.

export const STAGES = [
  'Handover completed',
  'Overview completed',
  'First Scoping',
  'Scoping completed',
  'Technical Report drafted',
  'Technical Report reviewed',
  'Costs Received',
  'Assessment drafted',
  'Assessment reviewed',
  'Invoiced',
]

// Short labels for tight UI surfaces.
export const STAGE_SHORT = {
  'Handover completed':        'Handover',
  'Overview completed':        'Overview',
  'First Scoping':             'First Scoping',
  'Scoping completed':         'Scoping',
  'Technical Report drafted':  'Tech Draft',
  'Technical Report reviewed': 'Tech Reviewed',
  'Costs Received':            'Costs',
  'Assessment drafted':        'Assessment Draft',
  'Assessment reviewed':       'Assessment Reviewed',
  'Invoiced':                  'Invoiced',
}

// A pool of plausible-sounding client codenames so each move has a concrete
// claim to point at on the UI without needing a real client list.
export const CLIENT_POOL = [
  'Anchor Labs',     'BluePeak Devices',  'Cinder Robotics',  'Delta Forge',
  'Echo Materials',  'Falcon Bioscience', 'Glint Optics',     'Halcyon Energy',
  'Iron & Oak',      'Juno Telematics',   'Krait Cybersec',   'Loft Aerospace',
  'Maven Health',    'Nimbus Cloudworks', 'Onyx Industrial',  'Praxis Mobility',
  'Quorum Logistics','Reverb Audio',      'Sable Pharma',     'Tessera Robotics',
  'Umbra Networks',  'Vector Marine',     'Whisper Labs',     'Xenon Sensors',
  'Yarrow Foods',    'Zenith Composites', 'Atlas Genomics',   'Borealis Power',
  'Cipher AI',       'Drift Analytics',
]

export function clientsForConsultant(idx, count = 4) {
  return Array.from({ length: count }, (_, i) => CLIENT_POOL[(idx * count + i) % CLIENT_POOL.length])
}
