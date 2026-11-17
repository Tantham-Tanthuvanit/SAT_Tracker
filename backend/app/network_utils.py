import socket
from typing import List, Dict

def get_lan_ips() -> List[str]:
    """Finds all IPv4 addresses reachable on the local area network."""
    ips = []
    
    # Method 1: Connect a UDP socket to an external non-routable address (standard Python idiom)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        s.connect(('10.254.254.254', 1))
        primary_ip = s.getsockname()[0]
        s.close()
        if primary_ip and not primary_ip.startswith("127."):
            ips.append(primary_ip)
    except Exception:
        pass

    # Method 2: Inspect host by name
    try:
        hostname = socket.gethostname()
        host_ips = socket.gethostbyname_ex(hostname)[2]
        for ip in host_ips:
            if not ip.startswith("127.") and ip not in ips:
                ips.append(ip)
    except Exception:
        pass

    if not ips:
        ips.append("127.0.0.1")

    return ips

def get_network_details(port: int = 8000) -> Dict:
    hostname = socket.gethostname()
    ips = get_lan_ips()
    access_urls = [f"http://{ip}:{port}" for ip in ips]
    # Ensure localhost is included
    if "http://localhost:8000" not in access_urls:
        access_urls.append(f"http://localhost:{port}")
    return {
        "hostname": hostname,
        "port": port,
        "local_ips": ips,
        "access_urls": access_urls
    }
