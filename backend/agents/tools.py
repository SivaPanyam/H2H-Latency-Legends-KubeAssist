from langchain.tools import tool
from backend.tools.kubectl_toolbox import KubectlToolbox
from backend.tools.gitops_toolbox import GitOpsToolbox

kube_toolbox = KubectlToolbox()
gitops_toolbox = GitOpsToolbox()

@tool
def get_pods(namespace: str = "default"):
    """Get all pods in a namespace, returned as JSON."""
    return kube_toolbox.get_pods(namespace)

@tool
def describe_pod(pod_name: str, namespace: str = "default"):
    """Get the full description (events, status) of a specific pod."""
    return kube_toolbox.describe_pod(pod_name, namespace)

@tool
def get_logs(pod_name: str, namespace: str = "default", tail: int = 50):
    """Fetch the recent logs for a given pod."""
    return kube_toolbox.get_logs(pod_name, namespace, tail)

@tool
def get_events(namespace: str = "default"):
    """Get recent cluster events in the namespace to identify issues."""
    return kube_toolbox.get_events(namespace)

@tool
def top_pods(namespace: str = "default"):
    """Get CPU and Memory usage for pods."""
    return kube_toolbox.top_pods(namespace)

@tool
def generate_fix_diff(resource_type: str, resource_name: str, patch_data: dict):
    """
    Generates a git diff for a proposed fix by patching the local YAML manifest.
    patch_data should be a dictionary representing the changes to be merged into the manifest.
    Example: {"spec": {"template": {"spec": {"containers": [{"name": "server", "resources": {"limits": {"memory": "256Mi"}}}]}}}}
    """
    return gitops_toolbox.generate_patch_diff(resource_type, resource_name, patch_data)

@tool
def propose_pull_request(title: str, description: str, diff_content: str):
    """
    Proposes a Pull Request with the specified title, description and diff content.
    This should be called ONLY after generate_fix_diff has been used to create a valid diff.
    """
    return gitops_toolbox.propose_pull_request(title, description, diff_content)

all_tools = [
    get_pods, 
    describe_pod, 
    get_logs, 
    get_events, 
    top_pods, 
    generate_fix_diff, 
    propose_pull_request
]
