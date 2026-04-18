import subprocess
import json
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
        except subprocess.CalledProcessError as e:
            return {"success": False, "error": e.stderr.strip()}

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
