import subprocess
import json
import concurrent.futures
from typing import Dict, Any, List, Optional
import os

class ClusterScanner:
    """Orchestrates comprehensive cluster data gathering for one-shot audit."""

    def __init__(self, namespace: str = "default"):
        self.namespace = namespace

    def _run_cmd(self, cmd: list[str]) -> Dict[str, Any]:
        """Helper to run a command and return standard output or error."""
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True
            )
            return {"success": True, "output": result.stdout.strip()}
        except subprocess.CalledProcessError as e:
            return {"success": False, "error": e.stderr.strip()}

    def gather_k8s_resources(self) -> Dict[str, Any]:
        """Gathers all standard Kubernetes resources in the namespace."""
        resources = ["pods", "deployments", "services", "ingresses", "pvc", "events"]
        results = {}
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_res = {
                executor.submit(self._run_cmd, ["kubectl", "get", res, "-n", self.namespace, "-o", "json"]): res 
                for res in resources
            }
            for future in concurrent.futures.as_completed(future_to_res):
                res_name = future_to_res[future]
                res_data = future.result()
                if res_data["success"]:
                    try:
                        results[res_name] = json.loads(res_data["output"])
                    except json.JSONDecodeError:
                        results[res_name] = res_data["output"]
                else:
                    results[res_name] = f"Error: {res_data['error']}"
        
        return results

    def gather_metrics(self) -> Dict[str, Any]:
        """Gathers CPU/Memory metrics using kubectl top."""
        results = {}
        results["nodes"] = self._run_cmd(["kubectl", "top", "nodes"])
        results["pods"] = self._run_cmd(["kubectl", "top", "pods", "-n", self.namespace])
        return results

    def run_security_scan(self) -> Dict[str, Any]:
        """Runs Trivy K8s scan on the namespace and parses the JSON report."""
        # Check if trivy is installed
        try:
            subprocess.run(["trivy", "--version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            return {"success": False, "error": "Trivy CLI not found. Please install trivy to enable security scanning."}

        cmd = ["trivy", "k8s", "--namespace", self.namespace, "--report", "summary", "--format", "json"]
        res = self._run_cmd(cmd)
        if res["success"]:
            try:
                return {"success": True, "report": json.loads(res["output"])}
            except json.JSONDecodeError:
                return {"success": False, "error": "Failed to parse Trivy output as JSON."}
        return res

    def get_full_cluster_context(self) -> Dict[str, Any]:
        """Compiles everything into a single massive context dictionary."""
        return {
            "resources": self.gather_k8s_resources(),
            "metrics": self.gather_metrics(),
            "security": self.run_security_scan()
        }
