export const FLOORS = [
  { id: 'home',         label: 'Home',      icon: '🏠' },
  { id: 'first_floor',  label: '1st Floor', icon: '🪜' },
  { id: 'second_floor', label: '2nd Floor', icon: '🛏️' },
  { id: 'outdoor',      label: 'Outdoor',   icon: '🌿' },
  { id: 'basement',     label: 'Basement',  icon: '🏚️' },
]

export const ROOMS = {
  // ── First Floor ──────────────────────────────────────
  family_room: {
    label: 'Family Room', icon: '🛋️', floor: 'first_floor',
    entities: {
      lights:      ['light.family_room'],
      fan:         'fan.family_room_fan',
      temperature: 'sensor.family_room_temperature',
      occupancy:   'binary_sensor.family_room_occupancy',
      media:       'media_player.family_room',
      switches:    ['switch.family_room_hallway_lights_switch'],
      scenes:      ['scene.family_room_bright','scene.family_room_concentrate','scene.family_room_relax','scene.family_room_dimmed','scene.family_room_nightlight','scene.family_room_energize'],
    },
  },
  kitchen: {
    label: 'Kitchen', icon: '🍳', floor: 'first_floor',
    entities: {
      lights:   ['light.kitchen'],
      switches: ['switch.kitchen_pendant_light_switch'],
      scenes:   ['scene.kitchen_bright','scene.kitchen_concentrate','scene.kitchen_relax','scene.kitchen_dimmed','scene.kitchen_nightlight','scene.kitchen_energize'],
    },
  },
  foyer: {
    label: 'Foyer', icon: '🚪', floor: 'first_floor',
    entities: {
      lights:   ['light.foyer'],
      switches: ['switch.foyer_chandelier_switch','switch.foyer_holiday_lights'],
      scenes:   ['scene.foyer_bright','scene.foyer_dimmed','scene.foyer_nightlight','scene.foyer_energize'],
    },
  },
  library: {
    label: 'Library', icon: '📚', floor: 'first_floor',
    entities: {
      lights:  ['light.library'],
      scenes:  ['scene.library_bright','scene.library_dimmed','scene.library_energize','scene.library_nightlight'],
    },
  },
  office: {
    label: 'Office', icon: '💼', floor: 'first_floor',
    entities: {
      lights:      ['light.office','light.office_front'],
      temperature: 'sensor.arun_office_temperature',
      occupancy:   'binary_sensor.arun_office_occupancy',
      scenes:      ['scene.office_bright','scene.office_concentrate','scene.office_relax','scene.office_dimmed','scene.office_nightlight'],
    },
  },
  sun_room: {
    label: 'Sun Room', icon: '☀️', floor: 'first_floor',
    entities: {
      lights:    ['light.sun_room'],
      switches:  ['switch.sunroom_led_light'],
      occupancy: 'binary_sensor.sun_room_motion',
      scenes:    ['scene.sun_room_bright','scene.sun_room_dimmed','scene.sun_room_nightlight'],
    },
  },
  laundry: {
    label: 'Laundry', icon: '🧺', floor: 'first_floor',
    entities: {
      switches: ['switch.laundry_room_light_switch'],
    },
  },

  // ── Second Floor ─────────────────────────────────────
  master_bedroom: {
    label: 'Master Bedroom', icon: '🛏️', floor: 'second_floor',
    entities: {
      lights:  ['light.master_bedroom'],
      fan:     'fan.master_bedroom_fan',
      media:   'media_player.bedroom_tv',
      scenes:  ['scene.master_bedroom_bright','scene.master_bedroom_relax','scene.master_bedroom_dimmed','scene.master_bedroom_nightlight','scene.master_bedroom_concentrate'],
    },
  },
  akshit_bedroom: {
    label: "Akshit's Bedroom", icon: '🛏️', floor: 'second_floor',
    entities: {
      lights:      ['light.akshitfan_light'],
      fan:         'fan.akshitfan_fan',
      temperature: 'sensor.akshit_bedroom_temperature',
      occupancy:   'binary_sensor.akshit_bedroom_occupancy',
    },
  },
  ami_bedroom: {
    label: "Ami's Bedroom", icon: '🛏️', floor: 'second_floor',
    entities: {
      lights:      ['light.amifan_light','light.ami_bedroom_led'],
      fan:         'fan.amifan_fan',
      temperature: 'sensor.ami_bedroom_temperature',
      occupancy:   'binary_sensor.ami_bedroom_occupancy',
      media:       'media_player.ami_bedroom_speaker',
    },
  },
  guest_bedroom: {
    label: 'Guest Bedroom', icon: '🛏️', floor: 'second_floor',
    entities: {
      lights: ['light.guestbedroom_light'],
      fan:    'fan.guestbedroom_fan',
    },
  },

  // ── Basement ─────────────────────────────────────────
  basement_main: {
    label: 'Basement', icon: '🏚️', floor: 'basement',
    entities: {
      sensors: [
        'sensor.airthings_basement_airthings_temperature',
        'sensor.airthings_basement_airthings_humidity',
        'sensor.airthings_basement_airthings_radon',
        'sensor.airthings_basement_airthings_radon_long_term',
      ],
    },
  },

  // ── Outdoor ──────────────────────────────────────────
  front_porch: {
    label: 'Front Porch', icon: '🏡', floor: 'outdoor',
    entities: {
      lights:  ['light.front_porche'],
      scenes:  ['scene.front_porche_bright','scene.front_porche_dimmed','scene.front_porche_nightlight'],
    },
  },
  driveway: {
    label: 'Driveway', icon: '🚗', floor: 'outdoor',
    entities: {
      lights:   ['light.driveway'],
      switches: ['switch.driveway_smart_plug'],
      scenes:   ['scene.driveway_bright','scene.driveway_energize'],
    },
  },
  garage: {
    label: 'Garage', icon: '🚘', floor: 'outdoor',
    entities: {
      lights:  ['light.garage_1','light.garage_2','light.garage_out'],
      scenes:  ['scene.garage_out_bright','scene.garage_out_dimmed','scene.garage_out_energize','scene.garage_out_nightlight'],
    },
  },
  deck: {
    label: 'Deck', icon: '🪑', floor: 'outdoor',
    entities: {
      switches: ['switch.deck_smart_plug'],
    },
  },
  front_yard: {
    label: 'Front Yard', icon: '🌳', floor: 'outdoor',
    entities: {
      lights:   ['light.lamp_post'],
      switches: ['switch.front_yard_smart_plug_left','switch.front_yard_smart_plug_right'],
    },
  },
}

export const FLOOR_ROOMS = Object.entries(ROOMS).reduce((acc, [id, room]) => {
  if (!acc[room.floor]) acc[room.floor] = []
  acc[room.floor].push(id)
  return acc
}, {})

// Entities used in the Home tab
export const HOME_ENTITIES = {
  weather:   'weather.openweathermap',
  climate:   ['climate.first_floor', 'climate.second_floor'],
  occupancy: Object.entries(ROOMS)
    .filter(([, r]) => r.entities.occupancy)
    .map(([id, r]) => ({ roomId: id, label: r.label, entity: r.entities.occupancy })),
  allLights: [...new Set(Object.values(ROOMS).flatMap(r => r.entities.lights || []))],
  allSwitches: [...new Set(Object.values(ROOMS).flatMap(r => r.entities.switches || []))],
}
