# Rust Docker LAN Setup (Dynamic Scaling)

This Docker Compose setup creates a scalable LAN environment with Ubuntu-based containers running Rust, configured as client and server machines with dynamic IP assignment.

## Directory Structure

```
.
├── docker-compose.yaml
├── Dockerfile.server
├── Dockerfile.client
├── server_code/          # Mount point for server Rust projects
└── client_code/          # Mount point for client Rust projects
```

## Network Configuration

- **Network**: `rust_lan` (bridge network with dynamic IP assignment)
- **Server ports**: 8080 (HTTP), 443 (HTTPS) - dynamically mapped to host
- Containers get automatic IP addresses from Docker's DHCP

## Setup Instructions

1. **Create required directories**:
```bash
mkdir -p server_code client_code
```

2. **Build and start containers**:
```bash
docker-compose up -d
```

## Scaling

### Scale servers
```bash
# Start 3 server instances
docker-compose up -d --scale server=3

# Start 5 server instances
docker-compose up -d --scale server=5
```

### Scale clients
```bash
# Start 4 client instances
docker-compose up -d --scale client=4

# Scale both servers and clients
docker-compose up -d --scale server=3 --scale client=5
```

### Check running containers
```bash
docker-compose ps
```

## Finding Container Information

### Get IP addresses of all servers
```bash
docker-compose ps -q server | xargs -I {} docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' {}
```

### Get IP addresses of all clients
```bash
docker-compose ps -q client | xargs -I {} docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' {}
```

### Get port mappings for servers
```bash
docker-compose ps server
```

### List all containers with IPs and names
```bash
docker network inspect rust-docker-lan_rust_lan | grep -A 3 "Containers"
```

## Usage

### Access a specific container
```bash
# List all containers
docker-compose ps

# Access by container name (e.g., rust-docker-lan_server_1)
docker exec -it rust-docker-lan_server_1 bash

# Or use scale index
docker exec -it $(docker-compose ps -q server | sed -n '1p') bash
```

### Test network connectivity between containers
```bash
# Get server IP
SERVER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rust-docker-lan_server_1)

# Ping from client
docker exec -it rust-docker-lan_client_1 ping $SERVER_IP
```

### Create a discovery script
Save this as `discover.sh` to find all service IPs:

```bash
#!/bin/bash
echo "=== SERVERS ==="
docker-compose ps -q server | while read container; do
    ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $container)
    name=$(docker inspect -f '{{.Name}}' $container | sed 's/\///')
    echo "$name: $ip"
done

echo -e "\n=== CLIENTS ==="
docker-compose ps -q client | while read container; do
    ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $container)
    name=$(docker inspect -f '{{.Name}}' $container | sed 's/\///')
    echo "$name: $ip"
done
```

Run it:
```bash
chmod +x discover.sh
./discover.sh
```

### Create a Rust project
```bash
# In server container
docker exec -it rust-docker-lan_server_1 bash
cd /workspace
cargo new my_server
cd my_server
cargo build
```

### Access HTTP/HTTPS ports from host

When you scale servers, each gets random host ports mapped. Find them with:
```bash
docker-compose ps server
```

Example output:
```
NAME                      STATUS    PORTS
rust-docker-lan_server_1  running   0.0.0.0:32768->8080/tcp, 0.0.0.0:32769->443/tcp
rust-docker-lan_server_2  running   0.0.0.0:32770->8080/tcp, 0.0.0.0:32771->443/tcp
```

Access from host: `curl http://localhost:32768`

## Service Discovery Pattern

For Rust applications that need to discover other services, you can:

### Option 1: Use DNS
Docker provides automatic DNS resolution:
```rust
// In client code - connect to any server instance
let addresses: Vec<SocketAddr> = "server:8080"
    .to_socket_addrs()?
    .collect();
```

### Option 2: Environment Variables
Add to docker-compose.yaml under client service:
```yaml
environment:
  - SERVER_HOSTS=server:8080
```

### Option 3: Query Docker API
Install Docker CLI in containers and query the network.

## Example Rust Server (HTTP)

Create in `server_code/`:

```toml
# Cargo.toml
[dependencies]
tokio = { version = "1", features = ["full"] }
warp = "0.3"
```

```rust
// src/main.rs
use warp::Filter;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let port = std::env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("Invalid port");
    
    let addr: SocketAddr = ([0, 0, 0, 0], port).into();
    
    let hello = warp::path::end()
        .map(|| warp::reply::html("Hello from Rust server!"));
    
    println!("Server listening on {}", addr);
    warp::serve(hello).run(addr).await;
}
```

## Stopping and Cleaning Up

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

## Environment Variables

### Server containers
- `RUST_LOG=info` - Rust logging level
- `SERVER_PORT=8080` - HTTP port
- `HTTPS_PORT=443` - HTTPS port

### Client containers
- `RUST_LOG=info` - Rust logging level

## Installed Tools

Each container includes:
- Rust (latest stable via rustup)
- Cargo
- Build essentials (gcc, g++, make)
- OpenSSL development libraries
- Git
- Network tools (ping, netstat, ifconfig)
- vim editor

## Tips

1. **Load Balancing**: Use a reverse proxy like nginx or traefik in front of scaled servers
2. **Service Discovery**: Implement health checks and service registration
3. **Persistent Data**: Add named volumes for data that should persist across restarts
4. **Logging**: Use `docker-compose logs -f server` to tail logs from all server instances
