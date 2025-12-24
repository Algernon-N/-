
export interface WishResponse {
  message: string;
  sentiment: 'magical' | 'cyberpunk' | 'warm';
}

export enum TreeLayer {
  Leaves = 'leaves',
  Decorations = 'decorations',
  Ribbon = 'ribbon'
}
