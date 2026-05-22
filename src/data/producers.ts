import type { Producer, Cooperative } from '@/types/producer'

export const cooperatives: Cooperative[] = [
  { id: 'coop-1', name: 'Coopérative Kaolack Maïs' },
]

export const producers: Producer[] = [
  { id: 'prod-1',  name: 'Mamadou Diallo',    cooperativeId: 'coop-1' },
  { id: 'prod-2',  name: 'Fatou Ndao',         cooperativeId: 'coop-1' },
  { id: 'prod-3',  name: 'Ibrahima Sy',        cooperativeId: 'coop-1' },
  { id: 'prod-4',  name: 'Aissatou Faye',      cooperativeId: 'coop-1' },
  { id: 'prod-5',  name: 'Ousmane Thiam',      cooperativeId: 'coop-1' },
  { id: 'prod-6',  name: 'Mariama Diallo',     cooperativeId: 'coop-1' },
  { id: 'prod-7',  name: 'Cheikh Guèye',       cooperativeId: 'coop-1' },
  { id: 'prod-8',  name: 'Rokhaya Ndiaye',     cooperativeId: 'coop-1' },
  { id: 'prod-9',  name: 'Alioune Fall',       cooperativeId: 'coop-1' },
  { id: 'prod-10', name: 'Ndèye Mbaye',        cooperativeId: 'coop-1' },
  { id: 'prod-11', name: 'Modou Diop',         cooperativeId: 'coop-1' },
  { id: 'prod-12', name: 'Awa Sarr',           cooperativeId: 'coop-1' },
]
