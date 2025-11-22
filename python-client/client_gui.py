#!/usr/bin/env python3
"""
Elhaykal Image Encryption Client - Python GUI
Simple Tkinter interface for uploading images and receiving encrypted results
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import socket
import time
import os
import threading
from pathlib import Path

try:
    import grpc
    import job_pb2
    import job_pb2_grpc
    GRPC_AVAILABLE = True
except ImportError:
    GRPC_AVAILABLE = False
    print("Warning: gRPC modules not found. Please run:")
    print("  python3 -m pip install grpcio grpcio-tools")
    print("  python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. job.proto")


# Constants
ANNOUNCE_LISTEN_ADDR = ('0.0.0.0', 10002)
CLIENT_CALLBACK_PORT = 50070
MAX_IMAGE_BYTES = 25 * 1024 * 1024
RECEIVED_DIR = "received"


class ImageEncryptionClient:
    """Main client application with GUI"""

    def __init__(self, root):
        self.root = root
        self.root.title("Elhaykal Image Encryption Client")
        self.root.geometry("800x600")
        self.root.configure(bg='#2b2b2b')

        # State variables
        self.selected_image_path = None
        self.selected_image = None
        self.received_image_path = None
        self.received_image = None
        self.is_busy = False
        self.leader_ip = None
        self.leader_port = None
        self.callback_server_thread = None

        # Create received directory
        self.output_dir = Path.cwd() / RECEIVED_DIR
        self.output_dir.mkdir(exist_ok=True)

        self.setup_ui()

        # Start background tasks
        if GRPC_AVAILABLE:
            self.start_background_tasks()
        else:
            self.log_message("ERROR: gRPC not available. Please install dependencies.", "error")

    def setup_ui(self):
        """Setup the user interface"""
        # Header
        header_frame = tk.Frame(self.root, bg='#1e1e1e', height=80)
        header_frame.pack(fill=tk.X, padx=10, pady=10)
        header_frame.pack_propagate(False)

        title = tk.Label(
            header_frame,
            text="Elhaykal Image Encryption Client",
            font=("Arial", 20, "bold"),
            bg='#1e1e1e',
            fg='#ffffff'
        )
        title.pack(pady=5)

        subtitle = tk.Label(
            header_frame,
            text="Upload images for secure encryption",
            font=("Arial", 10),
            bg='#1e1e1e',
            fg='#888888'
        )
        subtitle.pack()

        # Main content area
        main_frame = tk.Frame(self.root, bg='#2b2b2b')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # Left panel - Image selection and preview
        left_panel = tk.Frame(main_frame, bg='#353535', width=400)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)

        # Image selection section
        select_frame = tk.LabelFrame(
            left_panel,
            text="Select Image to Encrypt",
            font=("Arial", 12, "bold"),
            bg='#353535',
            fg='#ffffff',
            padx=10,
            pady=10
        )
        select_frame.pack(fill=tk.X, padx=10, pady=10)

        self.file_path_var = tk.StringVar(value="No file selected")
        path_label = tk.Label(
            select_frame,
            textvariable=self.file_path_var,
            bg='#353535',
            fg='#cccccc',
            font=("Arial", 9)
        )
        path_label.pack(pady=5)

        browse_btn = tk.Button(
            select_frame,
            text="Browse Image",
            command=self.browse_image,
            bg='#0078d4',
            fg='#ffffff',
            font=("Arial", 11, "bold"),
            padx=20,
            pady=8,
            cursor="hand2"
        )
        browse_btn.pack(pady=5)

        # Image preview section
        preview_frame = tk.LabelFrame(
            left_panel,
            text="Image Preview",
            font=("Arial", 12, "bold"),
            bg='#353535',
            fg='#ffffff',
            padx=10,
            pady=10
        )
        preview_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.preview_label = tk.Label(
            preview_frame,
            text="No image selected",
            bg='#353535',
            fg='#888888',
            font=("Arial", 10, "italic")
        )
        self.preview_label.pack(expand=True)

        # Send button
        self.send_btn = tk.Button(
            left_panel,
            text="Send for Encryption",
            command=self.send_image,
            bg='#0078d4',
            fg='#ffffff',
            font=("Arial", 14, "bold"),
            padx=30,
            pady=12,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.send_btn.pack(pady=10)

        self.status_label = tk.Label(
            left_panel,
            text="Ready",
            bg='#353535',
            fg='#cccccc',
            font=("Arial", 9)
        )
        self.status_label.pack(pady=5)

        # Right panel - Received image and log
        right_panel = tk.Frame(main_frame, bg='#353535', width=350)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5)

        # Received image section
        received_frame = tk.LabelFrame(
            right_panel,
            text="Encrypted Image Received",
            font=("Arial", 12, "bold"),
            bg='#2d4a2d',
            fg='#66ff66',
            padx=10,
            pady=10
        )
        received_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.received_label = tk.Label(
            received_frame,
            text="Waiting for encrypted image...",
            bg='#2d4a2d',
            fg='#888888',
            font=("Arial", 10, "italic")
        )
        self.received_label.pack(expand=True)

        self.open_btn = tk.Button(
            received_frame,
            text="Open File Location",
            command=self.open_file_location,
            bg='#00b400',
            fg='#ffffff',
            font=("Arial", 10),
            padx=15,
            pady=5,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.open_btn.pack(pady=5)

        # Activity log section
        log_frame = tk.LabelFrame(
            right_panel,
            text="Activity Log",
            font=("Arial", 12, "bold"),
            bg='#353535',
            fg='#ffffff',
            padx=10,
            pady=10
        )
        log_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Scrolled text for log
        log_scroll = tk.Scrollbar(log_frame)
        log_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        self.log_text = tk.Text(
            log_frame,
            height=10,
            bg='#1e1e1e',
            fg='#cccccc',
            font=("Courier", 9),
            yscrollcommand=log_scroll.set,
            state=tk.DISABLED
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)
        log_scroll.config(command=self.log_text.yview)

        # Configure text tags for colored log messages
        self.log_text.tag_config("info", foreground="#c8c8c8")
        self.log_text.tag_config("success", foreground="#66ff66")
        self.log_text.tag_config("error", foreground="#ff6666")
        self.log_text.tag_config("warning", foreground="#ffcc66")

    def log_message(self, message, level="info"):
        """Add a message to the activity log"""
        icons = {"info": "ℹ", "success": "✓", "error": "✗", "warning": "⚠"}
        icon = icons.get(level, "•")

        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"{icon} {message}\n", level)
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

    def browse_image(self):
        """Open file dialog to select an image"""
        filetypes = [
            ("Image files", "*.png *.jpg *.jpeg *.bmp *.tiff"),
            ("All files", "*.*")
        ]

        filepath = filedialog.askopenfilename(
            title="Select an image",
            filetypes=filetypes
        )

        if filepath:
            self.selected_image_path = filepath
            self.file_path_var.set(os.path.basename(filepath))
            self.load_image_preview(filepath)
            self.send_btn.config(state=tk.NORMAL)
            self.log_message(f"Selected: {os.path.basename(filepath)}", "info")

    def load_image_preview(self, filepath):
        """Load and display image preview"""
        try:
            img = Image.open(filepath)
            img.thumbnail((350, 250), Image.Resampling.LANCZOS)
            photo = ImageTk.PhotoImage(img)

            self.selected_image = photo
            self.preview_label.config(image=photo, text="")
            self.preview_label.image = photo
        except Exception as e:
            self.log_message(f"Error loading image: {e}", "error")

    def load_received_image_preview(self, filepath):
        """Load and display received encrypted image preview"""
        try:
            img = Image.open(filepath)
            img.thumbnail((300, 200), Image.Resampling.LANCZOS)
            photo = ImageTk.PhotoImage(img)

            self.received_image = photo
            self.received_label.config(image=photo, text="")
            self.received_label.image = photo
            self.open_btn.config(state=tk.NORMAL)
        except Exception as e:
            self.log_message(f"Error loading received image: {e}", "error")

    def send_image(self):
        """Send image to leader for encryption"""
        if not GRPC_AVAILABLE:
            messagebox.showerror("Error", "gRPC is not available. Please install dependencies.")
            return

        if self.is_busy:
            return

        if not self.selected_image_path or not os.path.exists(self.selected_image_path):
            messagebox.showerror("Error", "Please select a valid image file")
            return

        self.is_busy = True
        self.send_btn.config(state=tk.DISABLED)
        self.status_label.config(text="Processing...", fg='#ffcc66')
        self.log_message(f"Sending {os.path.basename(self.selected_image_path)} for encryption...", "info")

        # Run in background thread
        thread = threading.Thread(target=self._send_image_thread, daemon=True)
        thread.start()

    def _send_image_thread(self):
        """Background thread for sending image"""
        try:
            # Discover leader if not already found
            if not self.leader_ip or not self.leader_port:
                self.log_message("Discovering leader...", "info")
                if not self.discover_leader_blocking():
                    raise Exception("Failed to discover leader")

            # Read image file
            with open(self.selected_image_path, 'rb') as f:
                image_data = f.read()

            # Check size
            if len(image_data) > MAX_IMAGE_BYTES:
                raise Exception(f"Image too large: {len(image_data)} bytes (max {MAX_IMAGE_BYTES})")

            # Get local IP
            client_ip = self.get_local_ip()

            # Create job request
            job_id = f"job-{int(time.time() * 1000)}"
            filename = os.path.basename(self.selected_image_path)

            self.log_message(f"Submitting {job_id} to leader {self.leader_ip}:{self.leader_port}", "info")

            # Connect to leader and send job
            channel = grpc.insecure_channel(
                f"{self.leader_ip}:{self.leader_port}",
                options=[
                    ('grpc.max_send_message_length', MAX_IMAGE_BYTES),
                    ('grpc.max_receive_message_length', MAX_IMAGE_BYTES),
                ]
            )
            stub = job_pb2_grpc.LeaderStub(channel)

            request = job_pb2.JobRequest(
                job_id=job_id,
                filename=filename,
                image_data=image_data,
                client_ip=client_ip,
                client_port=CLIENT_CALLBACK_PORT
            )

            response = stub.SubmitImage(request)

            channel.close()

            if response.accepted:
                self.log_message(response.message, "success")
                self.log_message("Waiting for encrypted image from worker...", "info")
            else:
                raise Exception(response.message)

        except Exception as e:
            self.log_message(f"Error: {e}", "error")
            self.root.after(0, self._reset_ui)

    def _reset_ui(self):
        """Reset UI after send completes"""
        self.is_busy = False
        self.send_btn.config(state=tk.NORMAL)
        self.status_label.config(text="Ready", fg='#cccccc')

    def discover_leader_blocking(self):
        """Discover leader via UDP broadcast (blocking, with timeout)"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(ANNOUNCE_LISTEN_ADDR)
            sock.settimeout(10.0)  # 10 second timeout

            self.log_message(f"Listening for leader broadcast on {ANNOUNCE_LISTEN_ADDR[0]}:{ANNOUNCE_LISTEN_ADDR[1]}", "info")

            while True:
                data, addr = sock.recvfrom(512)
                message = data.decode('utf-8').strip()

                parts = message.split()
                if len(parts) == 4 and parts[0] == "LEADER" and parts[2] == "PORT":
                    self.leader_ip = parts[1]
                    self.leader_port = int(parts[3])
                    self.log_message(f"Discovered leader {self.leader_ip}:{self.leader_port}", "success")
                    sock.close()
                    return True
                else:
                    self.log_message(f"Ignoring unexpected announcement from {addr}", "warning")

        except socket.timeout:
            self.log_message("Timeout waiting for leader broadcast", "error")
            return False
        except Exception as e:
            self.log_message(f"Error discovering leader: {e}", "error")
            return False

    def get_local_ip(self):
        """Get local IP address"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"

    def start_background_tasks(self):
        """Start background tasks (callback server, etc)"""
        # Start callback server in background thread
        self.callback_server_thread = threading.Thread(
            target=self._run_callback_server,
            daemon=True
        )
        self.callback_server_thread.start()

        self.log_message(f"Callback server starting on 0.0.0.0:{CLIENT_CALLBACK_PORT}", "info")
        self.log_message(f"Saving encrypted images to: {self.output_dir}", "info")
        self.log_message("Ready to send image", "success")

    def _run_callback_server(self):
        """Run gRPC callback server to receive encrypted images"""
        try:
            from concurrent import futures

            class ClientServicer(job_pb2_grpc.ClientServicer):
                def __init__(self, gui):
                    self.gui = gui

                def DeliverImage(self, request, context):
                    try:
                        # Save the encrypted image
                        safe_filename = os.path.basename(request.filename)
                        final_name = f"{request.job_id}_{safe_filename}"
                        output_path = self.gui.output_dir / final_name

                        with open(output_path, 'wb') as f:
                            f.write(request.image_data)

                        # Update GUI
                        self.gui.root.after(0, lambda: self.gui._on_image_received(
                            request.job_id,
                            request.processed_by,
                            str(output_path)
                        ))

                        return job_pb2.DeliveryAck(
                            accepted=True,
                            message="stored"
                        )
                    except Exception as e:
                        return job_pb2.DeliveryAck(
                            accepted=False,
                            message=str(e)
                        )

            server = grpc.server(
                futures.ThreadPoolExecutor(max_workers=10),
                options=[
                    ('grpc.max_send_message_length', MAX_IMAGE_BYTES),
                    ('grpc.max_receive_message_length', MAX_IMAGE_BYTES),
                ]
            )
            job_pb2_grpc.add_ClientServicer_to_server(ClientServicer(self), server)
            server.add_insecure_port(f'0.0.0.0:{CLIENT_CALLBACK_PORT}')
            server.start()

            self.root.after(0, lambda: self.log_message(
                f"Callback server listening on 0.0.0.0:{CLIENT_CALLBACK_PORT}",
                "success"
            ))

            server.wait_for_termination()

        except Exception as e:
            self.root.after(0, lambda: self.log_message(
                f"Callback server error: {e}",
                "error"
            ))

    def _on_image_received(self, job_id, processed_by, path):
        """Handle received encrypted image (called from main thread)"""
        self.log_message(f"Received encrypted image {job_id} from {processed_by}", "success")
        self.log_message(f"Saved to: {path}", "info")

        self.received_image_path = path
        self.load_received_image_preview(path)

        self._reset_ui()

    def open_file_location(self):
        """Open the folder containing the received image"""
        if self.received_image_path and os.path.exists(self.received_image_path):
            try:
                # Linux
                os.system(f'xdg-open "{os.path.dirname(self.received_image_path)}"')
            except:
                self.log_message("Could not open file location", "error")


def main():
    """Main entry point"""
    if not GRPC_AVAILABLE:
        print("\n" + "="*60)
        print("ERROR: gRPC modules not found!")
        print("="*60)
        print("\nPlease install the required dependencies:")
        print("\n  1. Install Python packages:")
        print("     python3 -m pip install grpcio grpcio-tools Pillow")
        print("\n  2. Generate gRPC stubs:")
        print("     python3 -m grpc_tools.protoc -I. --python_out=. \\")
        print("         --grpc_python_out=. job.proto")
        print("\n" + "="*60 + "\n")

    root = tk.Tk()
    app = ImageEncryptionClient(root)
    root.mainloop()


if __name__ == "__main__":
    main()
