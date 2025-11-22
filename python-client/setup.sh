#!/bin/bash
# Setup script for Elhaykal Python Client

echo "======================================"
echo "Elhaykal Python Client Setup"
echo "======================================"
echo ""

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 is not installed"
    exit 1
fi

echo "Step 1: Installing Python dependencies..."
python3 -m pip install --user grpcio grpcio-tools Pillow

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to install Python packages"
    echo "You may need to install pip first:"
    echo "  sudo apt install python3-pip  # On Ubuntu/Debian"
    exit 1
fi

echo ""
echo "Step 2: Generating gRPC stubs from proto file..."
python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. job.proto

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to generate gRPC stubs"
    exit 1
fi

echo ""
echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
echo ""
echo "To run the client:"
echo "  python3 client_gui.py"
echo ""
