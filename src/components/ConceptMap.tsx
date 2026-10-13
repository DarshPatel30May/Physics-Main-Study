import { useMemo } from 'react';
import { ReactFlow, Background, Controls, type Edge, type Node, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ModuleContent } from '@/content/types';
import { useStore } from '@/lib/store';

const KIND_CLASS: Record<string, string> = {
  core: 'border-accent bg-accent/15',
  law: 'border-warn bg-warn/10',
  app: 'border-good bg-good/10',
  default: 'border-line bg-panel',
};

/** Interactive concept map (pan/zoom). Node positions are authored in the module content. */
export default function ConceptMap({ map, colour }: { map: ModuleContent['conceptMap']; colour: string }) {
  const { prefs } = useStore();
  const nodes: Node[] = useMemo(
    () =>
      map.nodes.map((n) => ({
        id: n.id,
        position: { x: n.x, y: n.y },
        data: { label: n.label },
        className: `!rounded-xl !border-2 !px-3 !py-2 !text-[13px] !font-medium !text-ink !shadow-none ${KIND_CLASS[n.kind ?? 'default']}`,
        style: { width: 170, background: undefined, color: undefined },
        draggable: true,
      })),
    [map],
  );
  const edges: Edge[] = useMemo(
    () =>
      map.edges.map(([s, t, label], i) => ({
        id: `e${i}`,
        source: s,
        target: t,
        label,
        labelStyle: { fill: 'rgb(var(--muted))', fontSize: 11 },
        labelBgStyle: { fill: 'rgb(var(--panel))' },
        style: { stroke: `rgb(var(--${colour}))`, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: `rgb(var(--${colour}))` },
      })),
    [map, colour],
  );
  return (
    <div className="h-[460px] overflow-hidden rounded-xl border border-line bg-bg/40" aria-label="Concept map (drag to pan, scroll or pinch to zoom)">
      <ReactFlow nodes={nodes} edges={edges} fitView colorMode={prefs.theme} proOptions={{ hideAttribution: true }} nodesConnectable={false} minZoom={0.3}>
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
