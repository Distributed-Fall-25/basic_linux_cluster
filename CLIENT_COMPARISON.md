# Elhaykal Client Comparison

You now have **TWO** client options for the Elhaykal Image Encryption service!

## Option 1: Rust Client (Modern UI)

**Location:** `Elhaykal-client/`

### Features
- ✨ Modern dark theme with egui framework
- 🖼️ Large image previews (both original and encrypted)
- 📊 Two-column layout with detailed activity log
- 🎨 Color-coded status messages with icons
- 🚀 High performance native application
- 📦 Self-contained executable

### To Run
```bash
cd Elhaykal-client
cargo run
```

### Pros
- No external dependencies (everything compiled in)
- Fast and responsive
- Beautiful modern UI
- Large window (900x700)

### Cons
- Requires Rust toolchain to build
- Longer initial compile time

---

## Option 2: Python Client (Simple UI)

**Location:** `python-client/`

### Features
- 🐍 Simple Python + Tkinter interface
- 🖼️ Image preview and encrypted result display
- 📝 Activity log with color-coded messages
- 🔍 Auto-discover leader via UDP
- 📂 One-click file location access
- ⚡ Quick to set up and modify

### To Run
```bash
cd python-client
./setup.sh          # First time only
python3 client_gui.py
```

### Pros
- Easy to understand and modify
- No compilation needed
- Standard Python libraries
- Quick setup

### Cons
- Requires Python dependencies (gRPC, PIL)
- Tkinter has basic styling

---

## Comparison Table

| Feature | Rust Client | Python Client |
|---------|-------------|---------------|
| **UI Framework** | egui (modern) | Tkinter (classic) |
| **Window Size** | 900x700 | 800x600 |
| **Image Preview** | ✓ Large | ✓ Medium |
| **Encrypted Display** | ✓ Large | ✓ Medium |
| **Activity Log** | ✓ Detailed | ✓ Color-coded |
| **Leader Discovery** | ✓ UDP | ✓ UDP |
| **gRPC Backend** | ✓ Direct | ✓ Direct |
| **Dependencies** | None (compiled) | grpcio, Pillow |
| **Startup Time** | Instant | Instant |
| **Build Time** | ~20 seconds | N/A |
| **Modifiable** | Rust source | Python script |
| **Cross-platform** | ✓ | ✓ |

---

## How They Work (Both Identical)

```
1. Client starts and listens for leader UDP broadcast (port 10002)
2. User selects image file
3. Client discovers leader IP and port
4. Client sends image to leader via gRPC (SubmitImage)
5. Leader assigns job to available worker
6. Worker processes image (encryption/steganography)
7. Worker sends encrypted image back to client via gRPC (DeliverImage)
8. Client displays and saves encrypted image to 'received/' folder
```

---

## Which One Should You Use?

### Use the **Rust Client** if:
- ✓ You want a modern, polished UI
- ✓ You have Rust installed
- ✓ You prefer native performance
- ✓ You want larger image previews

### Use the **Python Client** if:
- ✓ You want to quickly modify the code
- ✓ You're more comfortable with Python
- ✓ You want simpler dependencies
- ✓ You need to customize the UI easily

---

## Files Structure

### Rust Client
```
Elhaykal-client/
├── src/
│   └── main.rs          # Enhanced with image preview & modern UI
├── proto/
│   └── job.proto
├── Cargo.toml           # Dependencies with image crate
└── build.rs
```

### Python Client
```
python-client/
├── client_gui.py        # Main GUI application (19 KB)
├── job.proto            # Proto definition
├── requirements.txt     # Python dependencies
├── setup.sh             # Auto-setup script
├── README.md            # Full documentation
├── INSTALL.md           # Installation guide
└── QUICKSTART.md        # Quick start guide
```

---

## Setup Summary

### Rust Client Setup
```bash
cd Elhaykal-client
cargo build              # First time only
cargo run
```

### Python Client Setup
```bash
cd python-client
sudo apt install python3-pip python3-tk python3-pil  # If needed
./setup.sh
python3 client_gui.py
```

---

## Both Clients Support

✓ Image upload and selection
✓ Real-time image preview
✓ Encrypted image display
✓ Activity logging
✓ Leader auto-discovery
✓ gRPC communication
✓ File saving to `received/` directory
✓ Error handling and status updates

---

## Next Steps

1. **Choose your preferred client**
2. **Follow the setup instructions** (see QUICKSTART.md or cargo run)
3. **Start the Elhaykal service** (leader + workers)
4. **Run the client**
5. **Upload an image and watch it get encrypted!**

Enjoy using the Elhaykal Image Encryption system! 🚀
