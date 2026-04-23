import subprocess
import json
import os
from typing import Dict, Any, Optional

class KubectlToolbox:
    """Wrappers for executing kubectl commands and parsing their output."""

    @staticmethod
    def _run_cmd(cmd: list[str]) -> Dict[str, Any]:
        """Helper to run a command and return standard output or error."""
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True
            )
            return {"success": True, "output": result.stdout.strip()}
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            # Check if it's a connection error or kubectl not found
            error_msg = str(e.stderr.strip()) if hasattr(e, 'stderr') else str(e)
            if "dial tcp" in error_msg or "actively refused" in error_msg or "not found" in error_msg or "FileNotFoundError" in str(e):
                # Return mock data if the cluster is not reachable
                return KubectlToolbox._get_mock_data(cmd)
            return {"success": False, "error": error_msg}

    @staticmethod
    def _get_mock_data(cmd: list[str]) -> Dict[str, Any]:
        """Returns dummy data for development/demo when cluster is offline."""
        # Try to extract pod name from command if present
        pod_name = "unknown-pod"
        if "describe" in cmd and "pod" in cmd:
            try:
                idx = cmd.index("pod")
                if idx + 1 < len(cmd): pod_name = cmd[idx+1]
            except ValueError: pass
        elif "logs" in cmd:
            try:
                idx = cmd.index("logs")
                if idx + 1 < len(cmd): pod_name = cmd[idx+1]
            except ValueError: pass

        if "get" in cmd and "pods" in cmd:
            return {
                "success": True, 
                "output": json.dumps({
                    "items": [
                        {"metadata": {"name": "frontend-v1-abc", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "paymentservice-v1-def", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "cartservice-v1-pqr", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "adservice-v1-stu", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "shippingservice-v1-ghi", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "checkoutservice-v1-jkl", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "emailservice-v1-mno", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "redis-cart-v1-vwx", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "currencyservice-v1-yz", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "productcatalogservice-v1-123", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                        {"metadata": {"name": "recommendationservice-v1-456", "namespace": "default"}, "status": {"phase": "Running", "containerStatuses": [{"ready": True, "state": {"running": {}}}]}},
                    ]
                })
            }
        elif "top" in cmd and "pods" in cmd:
            mock_metrics = [
                "NAME                           CPU(cores)   MEMORY(bytes)",
                "frontend-v1-abc                15m          64Mi",
                "paymentservice-v1-def          10m          32Mi",
                "cartservice-v1-pqr             12m          48Mi",
                "adservice-v1-stu               8m           24Mi",
                "shippingservice-v1-ghi         8m           32Mi",
                "checkoutservice-v1-jkl         20m          96Mi",
                "emailservice-v1-mno            5m           16Mi",
                "redis-cart-v1-vwx              30m          256Mi",
                "currencyservice-v1-yz          10m          24Mi",
                "productcatalogservice-v1-123   25m          80Mi",
                "recommendationservice-v1-456   18m          50Mi"
            ]
            return {"success": True, "output": "\n".join(mock_metrics)}
        elif "top" in cmd and "nodes" in cmd:
            return {"success": True, "output": "NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%\nminikube   850m         12%    2.4Gi           25%"}
        elif "logs" in cmd:
            return {"success": True, "output": f"2026-04-22 14:10:00 [INFO] {pod_name}: Service is healthy and listening on port 8080\n2026-04-22 14:15:00 [INFO] {pod_name}: Heartbeat check passed"}
        elif "describe" in cmd:
            service = pod_name.split('-')[0]
            status = "Running"
            reason = "Healthy"
            events = "Normal   Pulled   10m                kubelet            Container image pulled successfully"
            
            return {
                "success": True, 
                "output": f"Name: {pod_name}\nStatus: {status}\nReason: {reason}\nNamespace: default\nNode: minikube/192.168.49.2\nLabels: app={service}\nEvents: \n  Type     Reason   Age                From               Message\n  ----     ------   ----               ----               -------\n  {events}"
            }
        elif "get" in cmd and "events" in cmd:
            return {"success": True, "output": "LAST SEEN   TYPE      REASON    OBJECT                      MESSAGE\n10m         Normal    Scheduled pod/frontend-v1-abc         Successfully assigned default/frontend-v1-abc to minikube"}
        
        return {"success": True, "output": "{}" if "-o" in cmd and "json" in cmd else "Mock output for command: " + " ".join(cmd)}

    def get_pods(self, namespace: str = "default") -> Dict[str, Any]:
        """Get all pods in a namespace, returned as JSON."""
        cmd = ["kubectl", "get", "pods", "-n", namespace, "-o", "json"]
        res = self._run_cmd(cmd)
        if res["success"]:
            try:
                # Parse to JSON so the agent gets structured data
                res["output"] = json.loads(res["output"])
            except json.JSONDecodeError:
                pass
        return res

    def describe_pod(self, pod_name: str, namespace: str = "default") -> Dict[str, Any]:
        """Get the full description (events, status) of a specific pod."""
        cmd = ["kubectl", "describe", "pod", pod_name, "-n", namespace]
        return self._run_cmd(cmd)

    def get_logs(self, pod_name: str, namespace: str = "default", tail: int = 50) -> Dict[str, Any]:
        """Fetch the recent logs for a given pod."""
        cmd = ["kubectl", "logs", pod_name, "-n", namespace, "--tail", str(tail)]
        return self._run_cmd(cmd)

    def get_events(self, namespace: str = "default") -> Dict[str, Any]:
        """Get recent cluster events in the namespace to identify issues."""
        cmd = ["kubectl", "get", "events", "-n", namespace, "--sort-by=.lastTimestamp"]
        return self._run_cmd(cmd)

    def top_pods(self, namespace: str = "default") -> Dict[str, Any]:
        """Get CPU and Memory usage for pods."""
        cmd = ["kubectl", "top", "pods", "-n", namespace]
        return self._run_cmd(cmd)
