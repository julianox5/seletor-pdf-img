export type NaturalSize = { width: number; height: number };

export type Selection = {
  id: string;
  page: number;
  x: number; y: number; w: number; h: number; // coordenadas em tamanho "natural"
};

export type SelectionExport = Selection & {
  x_norm: number; y_norm: number; w_norm: number; h_norm: number;
};
