# Elhaykal Python Client

A simple Python GUI client for the Elhaykal Image Encryption service.

## Features

- **Simple Tkinter GUI** - Easy-to-use graphical interface
- **Image Upload** - Browse and select images to encrypt
- **Image Preview** - View selected images before sending
- **Encrypted Result Display** - Automatically displays received encrypted images
- **Activity Log** - Real-time status updates with color-coded messages
- **Auto-Discovery** - Automatically discovers the leader node via UDP broadcast
- **gRPC Backend** - Communicates directly with the Elhaykal service via gRPC

## Requirements

- Python 3.6 or higher
- Tkinter (usually comes with Python)
- gRPC libraries
- Pillow (PIL) for image handling

## Installation

### Quick Setup

Run the setup script to automatically install dependencies and generate gRPC stubs:

```bash
cd python-client
./setup.sh
```

### Manual Setup

If you prefer to install manually:

1. Install Python dependencies:
```bash
python3 -m pip install --user grpcio grpcio-tools Pillow
```

2. Generate gRPC stubs from proto file:
```bash
python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. job.proto
```

## Usage

1. Make sure the Elhaykal service (leader and workers) is running
2. Run the Python client:
```bash
python3 client_gui.py
```

3. Click "Browse Image" to select an image file
4. Preview the image in the left panel
5. Click "Send for Encryption" to submit the image
6. Wait for the encrypted image to be received and displayed

## How It Works

1. **Leader Discovery**: The client listens for UDP broadcasts from the leader node
2. **Image Upload**: When you send an image, the client uploads it to the leader via gRPC
3. **Worker Processing**: The leader distributes the job to an available worker
4. **Callback**: The worker sends the encrypted image back to the client via gRPC callback
5. **Display**: The encrypted image is automatically displayed and saved to the `received/` directory

## Configuration

You can modify these constants in `client_gui.py`:

- `ANNOUNCE_LISTEN_ADDR`: UDP address for leader discovery (default: `('0.0.0.0', 10002)`)
- `CLIENT_CALLBACK_PORT`: Port for receiving encrypted images (default: `50070`)
- `MAX_IMAGE_BYTES`: Maximum image size in bytes (default: 25 MB)
- `RECEIVED_DIR`: Directory to save received encrypted images (default: `received`)

## File Structure

```
python-client/
├── client_gui.py       # Main GUI application
├── job.proto           # Protocol buffer definition
├── job_pb2.py          # Generated protobuf code (created by setup.sh)
├── job_pb2_grpc.py     # Generated gRPC code (created by setup.sh)
├── requirements.txt    # Python dependencies
├── setup.sh            # Setup script
└── README.md           # This file
```

## Troubleshooting

### "gRPC modules not found" error

Run the setup script:
```bash
./setup.sh
```

Or manually install:
```bash
python3 -m pip install --user grpcio grpcio-tools Pillow
python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. job.proto
```

### "Failed to discover leader" error

Make sure:
1. The leader node is running
2. The leader is broadcasting on UDP port 10002
3. There are no firewall rules blocking UDP broadcasts

### "Connection refused" error

Make sure:
1. The leader's gRPC server is running
2. The leader port matches what's being broadcast
3. There are no firewall rules blocking the gRPC port

### Images not receiving

Make sure:
1. Worker nodes are running and registered with the leader
2. Port 50070 is not blocked by firewall
3. The client's IP address is reachable from the worker nodes

## License

Part of the Elhaykal distributed image processing system.
