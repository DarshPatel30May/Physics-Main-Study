import type { ReactElement } from 'react';

export interface DiagramDef {
  title: string;
  caption: string;
  render: () => ReactElement;
}
