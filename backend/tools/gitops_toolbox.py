import os
import yaml
import difflib
import copy
from typing import Dict, Any, Optional, List

class GitOpsToolbox:
    """Wrappers for generating Pull Requests and managing GitOps workflows."""
    
    def __init__(self, k8s_dir: str = "k8s"):
        # Resolve the absolute path to the k8s directory relative to the project root
        self.project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.k8s_dir = os.path.join(self.project_root, k8s_dir)

    def _load_manifests(self, file_path: str) -> List[Dict[str, Any]]:
        """Loads all YAML documents from a file."""
        if not os.path.exists(file_path):
            return []
        with open(file_path, 'r') as f:
            return list(yaml.safe_load_all(f))

    def _save_manifests(self, manifests: List[Dict[str, Any]]) -> str:
        """Converts a list of manifests back to a multi-document YAML string."""
        return yaml.safe_dump_all(manifests, default_flow_style=False, sort_keys=False)

    def generate_patch_diff(self, resource_type: str, resource_name: str, patch_data: dict) -> Dict[str, Any]:
        """
        Reads the local YAML, applies a patch in-memory, and returns the diff.
        """
        yaml_file = os.path.join(self.k8s_dir, "online-boutique.yaml")
        
        if not os.path.exists(yaml_file):
            return {"success": False, "error": f"Manifest file not found: {yaml_file}"}

        original_manifests = self._load_manifests(yaml_file)
        patched_manifests = copy.deepcopy(original_manifests)
        found = False

        for doc in patched_manifests:
            if not doc: continue
            if doc.get("kind") == resource_type and doc.get("metadata", {}).get("name") == resource_name:
                self._apply_patch(doc, patch_data)
                found = True

        if not found:
            return {"success": False, "error": f"Resource {resource_type}/{resource_name} not found in {yaml_file}"}

        original_str = self._save_manifests(original_manifests)
        patched_str = self._save_manifests(patched_manifests)

        diff = difflib.unified_diff(
            original_str.splitlines(keepends=True),
            patched_str.splitlines(keepends=True),
            fromfile=f"a/k8s/online-boutique.yaml",
            tofile=f"b/k8s/online-boutique.yaml"
        )
        
        diff_text = "".join(diff)
        
        return {
            "success": True, 
            "diff": diff_text,
            "resource": f"{resource_type}/{resource_name}"
        }

    def _apply_patch(self, target: Dict[str, Any], patch: Dict[str, Any]):
        """Recursively applies a patch to a dictionary, handling K8s-style lists."""
        for key, value in patch.items():
            if key in target:
                if isinstance(value, dict) and isinstance(target[key], dict):
                    self._apply_patch(target[key], value)
                elif isinstance(value, list) and isinstance(target[key], list):
                    # Special handling for lists of named objects (containers, env, etc.)
                    for patch_item in value:
                        if isinstance(patch_item, dict) and "name" in patch_item:
                            match = next((item for item in target[key] if isinstance(item, dict) and item.get("name") == patch_item["name"]), None)
                            if match:
                                self._apply_patch(match, patch_item)
                            else:
                                target[key].append(patch_item)
                        else:
                            # For simple lists, just append if not already present
                            if patch_item not in target[key]:
                                target[key].append(patch_item)
                else:
                    target[key] = value
            else:
                target[key] = value

    def propose_pull_request(self, title: str, description: str, diff_content: str) -> Dict[str, Any]:
        """
        Simulates proposing a Pull Request to the git repository with the fix.
        """
        return {
            "success": True,
            "message": "Pull request successfully proposed.",
            "pr_url": "https://github.com/SivaPanyam/H2H-Latency-Legends-KubeAssist/pull/new/fix",
            "title": title,
            "description": description,
            "diff": diff_content
        }
