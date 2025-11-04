/**
 * Image Uploader Component
 * Handles file selection and preview
 * Separation of concerns: User interface for file input
 */

export class ImageUploader {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedFile = null;
    this.onFileSelected = null;
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="uploader-wrapper">
        <div class="upload-area" id="uploadArea">
          <div class="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>Upload Image to Encrypt</h3>
          <p>Drag and drop or click to select</p>
          <p class="file-info">Supported formats: JPG, PNG, GIF, WebP (Max 50MB)</p>
          <input
            type="file"
            id="fileInput"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            hidden
          />
        </div>

        <div class="preview-container" id="previewContainer" style="display: none;">
          <h3>Selected Image</h3>
          <div class="preview-wrapper">
            <img id="previewImage" alt="Preview" />
          </div>
          <div class="file-details" id="fileDetails"></div>
          <button class="btn btn-secondary" id="clearBtn">Clear Selection</button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const clearBtn = document.getElementById('clearBtn');

    // Click to upload
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFileSelect(file);
      }
    });

    // Clear selection
    clearBtn.addEventListener('click', () => {
      this.clearSelection();
    });
  }

  handleFileSelect(file) {
    this.selectedFile = file;
    this.showPreview(file);

    if (this.onFileSelected) {
      this.onFileSelected(file);
    }
  }

  showPreview(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const previewImage = document.getElementById('previewImage');
      const previewContainer = document.getElementById('previewContainer');
      const uploadArea = document.getElementById('uploadArea');
      const fileDetails = document.getElementById('fileDetails');

      previewImage.src = e.target.result;
      previewContainer.style.display = 'block';
      uploadArea.style.display = 'none';

      // Show file details
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      fileDetails.innerHTML = `
        <p><strong>File name:</strong> ${file.name}</p>
        <p><strong>Size:</strong> ${sizeInMB} MB</p>
        <p><strong>Type:</strong> ${file.type}</p>
      `;
    };

    reader.readAsDataURL(file);
  }

  clearSelection() {
    this.selectedFile = null;
    const previewContainer = document.getElementById('previewContainer');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    previewContainer.style.display = 'none';
    uploadArea.style.display = 'flex';
    fileInput.value = '';
  }

  getSelectedFile() {
    return this.selectedFile;
  }

  setFileSelectedCallback(callback) {
    this.onFileSelected = callback;
  }
}
