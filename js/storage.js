export const STORAGE_KEYS = { CHARACTER: 'cpr_character', GROUP: 'cpr_group', VEHICLES: 'cpr_vehicles' };
export function saveCharacter(char) { localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(char)); }
export function loadCharacter() { const saved = localStorage.getItem(STORAGE_KEYS.CHARACTER); return saved ? JSON.parse(saved) : null; }
export function saveGroup(group) { localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(group)); }
export function loadGroup() { const saved = localStorage.getItem(STORAGE_KEYS.GROUP); return saved ? JSON.parse(saved) : null; }
export function saveVehicles(vehicles) { localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles)); }
export function loadVehicles() { const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES); return saved ? JSON.parse(saved) : null; }