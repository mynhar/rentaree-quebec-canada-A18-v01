import { PropertyType } from '../../core/models/database.types';

export interface PropertyFilters {
  text: string;              // ciudad, dirección o barrio
  types: PropertyType[];
  priceMin: number | null;
  priceMax: number | null;
  onlyMine: boolean;         // solo las propiedades del usuario
}

export const EMPTY_FILTERS: PropertyFilters = {
  text: '',
  types: [],
  priceMin: null,
  priceMax: null,
  onlyMine: false,
};
