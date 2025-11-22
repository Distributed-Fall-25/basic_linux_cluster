# Installation Instructions

## Prerequisites

Before running the Python client, you need to install the required dependencies.

## Step 1: Install System Packages

Install Python 3 and pip using your system package manager:

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip python3-tk
```

### On Fedora/RHEL/CentOS:
```bash
sudo dnf install python3 python3-pip python3-tkinter
```

## Step 2: Install Python Dependencies

```bash
cd python-client
python3 -m pip install --user grpcio grpcio-tools Pillow
```

Or install system-wide (requires sudo):
```bash
sudo apt install python3-grpcio python3-pil python3-pil.imagetk  # Ubuntu/Debian
```

## Step 3: Generate gRPC Stubs

```bash
cd python-client
python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. job.proto
```

This will generate:
- `job_pb2.py` - Protocol buffer message definitions
- `job_pb2_grpc.py` - gRPC service definitions

## Step 4: Run the Client

```bash
python3 client_gui.py
```

## Quick Setup (if pip is available)

If you already have pip installed, simply run:

```bash
cd python-client
./setup.sh
python3 client_gui.py
```

## Alternative: Use the Rust Client

If you prefer not to set up Python dependencies, you can use the Rust client instead:

```bash
cd Elhaykal-client
cargo run
```

The Rust client has the same functionality with a more modern UI.

## Verifying Installation

To verify everything is installed correctly:

```bash
python3 -c "import grpc, PIL; print('All dependencies OK')"
```

You should see "All dependencies OK" if successful.
