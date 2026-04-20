import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Add the project root to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, project_root)

from backend.tools.kubectl_toolbox import KubectlToolbox
from backend.tools.gitops_toolbox import GitOpsToolbox

def test_kubectl_get_pods_success():
    """Verify kubectl get pods handles success and JSON parsing."""
    toolbox = KubectlToolbox()
    mock_stdout = '{"items": []}'
    with patch("subprocess.run") as mock_run:
        mock_run.return_value = MagicMock(stdout=mock_stdout, stderr="", returncode=0)
        res = toolbox.get_pods("default")
        assert res["success"] is True
        assert res["output"] == {"items": []}

def test_kubectl_get_pods_failure():
    """Verify kubectl get pods handles command failure."""
    toolbox = KubectlToolbox()
    import subprocess
    with patch("subprocess.run") as mock_run:
        mock_run.side_effect = subprocess.CalledProcessError(1, "kubectl", stderr="Namespace not found")
        res = toolbox.get_pods("non-existent")
        assert res["success"] is False
        assert res["error"] == "Namespace not found"

def test_gitops_apply_patch():
    """Verify the recursive patch logic in GitOpsToolbox."""
    toolbox = GitOpsToolbox()
    target = {
        "spec": {
            "template": {
                "spec": {
                    "containers": [
                        {"name": "server", "image": "v1", "resources": {"limits": {"cpu": "100m"}}}
                    ]
                }
            }
        }
    }
    patch_data = {
        "spec": {
            "template": {
                "spec": {
                    "containers": [
                        {"name": "server", "resources": {"limits": {"memory": "256Mi"}}}
                    ]
                }
            }
        }
    }
    toolbox._apply_patch(target, patch_data)
    container = target["spec"]["template"]["spec"]["containers"][0]
    assert container["image"] == "v1"
    assert container["resources"]["limits"]["cpu"] == "100m"
    assert container["resources"]["limits"]["memory"] == "256Mi"
