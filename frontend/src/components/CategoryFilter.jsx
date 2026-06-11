// ============================================================
// CategoryFilter.jsx — Filtro de categoría compartido (Tabs)
// ============================================================
// POR QUÉ: el filtro Todos/Senior/Junior estaba copiado y pegado
// en 3 páginas (Home, Equipos, Jugadores) con botones a mano.
// PARA QUÉ: un único componente reutilizable sobre shadcn <Tabs>,
// que además es el componente semánticamente correcto (rol de
// tablist/tab para lectores de pantalla, navegación por flechas).
// Contrato: value '' = todas las categorías (igual que antes).
// ============================================================

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Junior', label: 'Junior' },
];

// Tabs necesita un value no vacío, así que mapeamos '' <-> 'all'.
const CategoryFilter = ({ value, onChange }) => (
  <Tabs value={value || 'all'} onValueChange={(v) => onChange(v === 'all' ? '' : v)}>
    <TabsList className="bg-nba-dark border border-nba-border h-9 p-1">
      {CATEGORIES.map((c) => (
        <TabsTrigger
          key={c.value}
          value={c.value}
          className="px-4 text-[0.7rem] font-bold uppercase tracking-[0.8px] cursor-pointer text-nba-gray hover:text-nba-white data-active:bg-nba-blue data-active:text-white dark:data-active:bg-nba-blue dark:data-active:text-white dark:data-active:border-transparent"
        >
          {c.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default CategoryFilter;
