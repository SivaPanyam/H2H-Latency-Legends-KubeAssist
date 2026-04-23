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
  { id: 'frontend', position: { x: 400, y: 50 }, data: { label: 'frontend' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'cartservice', position: { x: 200, y: 150 }, data: { label: 'cartservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'redis-cart', position: { x: 200, y: 250 }, data: { label: 'redis-cart' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'checkoutservice', position: { x: 400, y: 150 }, data: { label: 'checkoutservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'paymentservice', position: { x: 300, y: 250 }, data: { label: 'paymentservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'shippingservice', position: { x: 500, y: 250 }, data: { label: 'shippingservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'emailservice', position: { x: 600, y: 250 }, data: { label: 'emailservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'productcatalogservice', position: { x: 600, y: 150 }, data: { label: 'productcatalogservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'recommendationservice', position: { x: 800, y: 150 }, data: { label: 'recommendationservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'currencyservice', position: { x: 400, y: 350 }, data: { label: 'currencyservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
  { id: 'adservice', position: { x: 800, y: 50 }, data: { label: 'adservice' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 'bold' } },
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
  podStatuses?: Record<string, string>;
  onNodeClick?: (nodeId: string) => void;
}

export default function ClusterMap({ activeService, podStatuses = {}, onNodeClick }: ClusterMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = (_: any, node: any) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  // Update node styles based on activeService and podStatuses
  useMemo(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const isActive = activeService && (
          n.id.toLowerCase().includes(activeService.toLowerCase()) || 
          activeService.toLowerCase().includes(n.id.toLowerCase())
        );
        
        const nodeId = n.id.toLowerCase();
        const status = podStatuses[nodeId] || 'Running';
        
        let bgColor = '#0284c7'; // Default Running Blue
        let borderColor = '#38bdf8';
        
        if (status.includes('BackOff') || status.includes('Error') || status.includes('Failed') || status.includes('Terminated') || status.includes('OOM')) {
          bgColor = '#ef4444'; // Red for failures
          borderColor = '#f87171';
        } else if (status.includes('Pending') || status.includes('Creating') || status.includes('Waiting')) {
          bgColor = '#eab308'; // Yellow for waiting
          borderColor = '#facc15';
        }

        if (isActive) {
          return {
            ...n,
            style: { 
              ...n.style, 
              background: isActive ? (bgColor === '#0284c7' ? '#0ea5e9' : bgColor) : bgColor, 
              borderColor: borderColor, 
              boxShadow: `0 0 25px ${bgColor}cc`,
              zIndex: 1000 
            },
          };
        }
        return {
          ...n,
          style: { 
            ...n.style, 
            background: bgColor, 
            borderColor: borderColor, 
            boxShadow: 'none',
            zIndex: 1
          },
        };
      })
    );
  }, [activeService, podStatuses, setNodes]);

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
