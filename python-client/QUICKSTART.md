# Quick Start Guide

## For Users Without pip Installed

If you don't have pip installed yet, follow these steps:

### 1. Install Python dependencies
```bash
sudo apt update
sudo apt install python3-pip python3-tk python3-pil python3-pil.imagetk
```

### 2. Install gRPC tools
```bash
python3 -m pip install --user grpcio grpcio-tools
```

### 3. Generate gRPC stubs
```bash
cd python-client
python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. job.proto
```

### 4. Run the client
```bash
python3 client_gui.py
```

## For Users With pip Already Installed

```bash
cd python-client
./setup.sh
python3 client_gui.py
```

## Using the Client

1. **Start the Leader and Workers** - Make sure your Elhaykal service is running
   ```bash
   # In one terminal - start the leader
   cd Elhaykal-service
   cargo run

   # In another terminal - start workers
   # (follow your service's worker startup process)
   ```

2. **Run the Python Client**
   ```bash
   cd python-client
   python3 client_gui.py
   ```

3. **Send an Image**
   - Click "Browse Image" and select an image file
   - Preview will show in the left panel
   - Click "Send for Encryption"
   - Wait for the encrypted image to appear in the right panel

4. **View Results**
   - Encrypted images are saved to the `received/` folder
   - Click "Open File Location" to see the saved file
   - Activity log shows all operations in real-time

## Architecture

```
┌──────────────┐      UDP Broadcast       ┌──────────────┐
│ Python Client│◄──────────────────────────│    Leader    │
│    (GUI)     │                           │   Service    │
└──────┬───────┘                           └──────┬───────┘
       │                                          │
       │ 1. Submit Image (gRPC)                  │
       │────────────────────────────────────────►│
       │                                          │
       │                                    ┌─────▼──────┐
       │                                    │   Worker   │
       │                                    │  Service   │
       │                                    └─────┬──────┘
       │                                          │
       │ 2. Encrypted Image (gRPC Callback)      │
       │◄─────────────────────────────────────────┘
       │
   ┌───▼────┐
   │received│
   │ folder │
   └────────┘
```

## Troubleshooting

**Client says "gRPC not available"**
- Install dependencies: `./setup.sh`
- Or manually: `python3 -m pip install --user grpcio grpcio-tools Pillow`

**Can't discover leader**
- Make sure the leader is running and broadcasting on UDP port 10002
- Check firewall settings

**No encrypted image received**
- Make sure workers are connected to the leader
- Check that port 50070 is not blocked
- Look at the activity log for error messages

## Features

✓ Simple and clean GUI interface
✓ Image preview before sending
✓ Real-time activity log with color coding
✓ Automatic leader discovery
✓ Display encrypted image results
✓ One-click access to saved files
✓ Direct gRPC communication with backend

Enjoy using Elhaykal Image Encryption Client!
