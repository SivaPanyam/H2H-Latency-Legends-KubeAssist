import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'frontend', position: { x: 400, y: 50 }, data: { label: 'frontend' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'cartservice', position: { x: 200, y: 150 }, data: { label: 'cartservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'redis-cart', position: { x: 200, y: 250 }, data: { label: 'redis-cart' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'checkoutservice', position: { x: 400, y: 150 }, data: { label: 'checkoutservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'paymentservice', position: { x: 300, y: 250 }, data: { label: 'paymentservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'shippingservice', position: { x: 500, y: 250 }, data: { label: 'shippingservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'emailservice', position: { x: 600, y: 250 }, data: { label: 'emailservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'productcatalogservice', position: { x: 600, y: 150 }, data: { label: 'productcatalogservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'recommendationservice', position: { x: 800, y: 150 }, data: { label: 'recommendationservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'currencyservice', position: { x: 400, y: 350 }, data: { label: 'currencyservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
  { id: 'adservice', position: { x: 800, y: 50 }, data: { label: 'adservice' }, style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px' } },
];

const initialEdges = [
  { id: 'e-front-cart', source: 'frontend', target: 'cartservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-front-checkout', source: 'frontend', target: 'checkoutservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-front-product', source: 'frontend', target: 'productcatalogservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-front-recommend', source: 'frontend', target: 'recommendationservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-front-ad', source: 'frontend', target: 'adservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-cart-redis', source: 'cartservice', target: 'redis-cart', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-check-cart', source: 'checkoutservice', target: 'cartservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-check-payment', source: 'checkoutservice', target: 'paymentservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-check-shipping', source: 'checkoutservice', target: 'shippingservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-check-email', source: 'checkoutservice', target: 'emailservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-check-currency', source: 'checkoutservice', target: 'currencyservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
  { id: 'e-recommend-product', source: 'recommendationservice', target: 'productcatalogservice', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, style: { stroke: '#a1a1aa' } },
];

interface ClusterMapProps {
  activeService?: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function ClusterMap({ activeService, onNodeClick }: ClusterMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = (_: any, node: any) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  // Update node styles based on activeService
  useMemo(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const isActive = activeService && (
          n.id.toLowerCase().includes(activeService.toLowerCase()) || 
          activeService.toLowerCase().includes(n.id.toLowerCase())
        );
        if (isActive) {
          return {
            ...n,
            style: { ...n.style, background: '#0284c7', borderColor: '#38bdf8', boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)' },
          };
        }
        return {
          ...n,
          style: { ...n.style, background: '#27272a', borderColor: '#3f3f46', boxShadow: 'none' },
        };
      })
    );
  }, [activeService, setNodes]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        colorMode="dark"
      >
        <Background color="#3f3f46" gap={16} />
      </ReactFlow>
    </div>
  );
}
