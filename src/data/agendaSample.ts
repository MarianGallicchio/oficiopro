import { AgendaEvent } from '../types';

function dayOffset(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
}

export const INITIAL_AGENDA_EVENTS: AgendaEvent[] = [
  {
    id: 'evt-demo-1',
    title: 'Instalación eléctrica — Estudio Belgrano',
    date: dayOffset(1),
    time: '09:00',
    durationMinutes: 180,
    color: 'sky',
    notes: 'Llevar ponchadora y plaquetas.',
    reminderMinutes: 60,
  },
  {
    id: 'evt-demo-2',
    title: 'Editar: cinta métrica completa',
    date: dayOffset(2),
    time: '14:00',
    durationMinutes: 45,
    color: 'violet',
    reminderMinutes: 30,
  },
  {
    id: 'evt-demo-3',
    title: 'Cobro presencial — Cocina Belgrano',
    date: dayOffset(3),
    time: '17:30',
    durationMinutes: 30,
    color: 'emerald',
    notes: 'Cobrar saldo Factura C #0001. Alias MP cargado.',
  },
  {
    id: 'evt-demo-4',
    title: 'Reunión: presupuesto de iluminación',
    date: dayOffset(5),
    time: '11:00',
    durationMinutes: 60,
    color: 'amber',
  },
];
