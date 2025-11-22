#!/usr/bin/env python3
"""
Generate job response data similar to jobresponse.xlsx but for 10,000 jobs.
Creates an Excel file with job_id and response_time_ms columns.
"""

import random
import time
import csv
import zipfile
import os
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def create_xlsx(filename, data):
    """
    Create an Excel (.xlsx) file from scratch without external dependencies.
    XLSX is a ZIP archive containing XML files.
    """

    # Create temporary directory for XML files
    import tempfile
    import shutil

    temp_dir = tempfile.mkdtemp()

    try:
        # Create directory structure
        os.makedirs(os.path.join(temp_dir, 'xl', 'worksheets'), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, '_rels'), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, 'xl', '_rels'), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, 'docProps'), exist_ok=True)

        # [Content_Types].xml
        content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''

        with open(os.path.join(temp_dir, '[Content_Types].xml'), 'w') as f:
            f.write(content_types)

        # _rels/.rels
        rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''

        with open(os.path.join(temp_dir, '_rels', '.rels'), 'w') as f:
            f.write(rels)

        # xl/_rels/workbook.xml.rels
        workbook_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>'''

        with open(os.path.join(temp_dir, 'xl', '_rels', 'workbook.xml.rels'), 'w') as f:
            f.write(workbook_rels)

        # xl/workbook.xml
        workbook = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <sheets>
        <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
    </sheets>
</workbook>'''

        with open(os.path.join(temp_dir, 'xl', 'workbook.xml'), 'w') as f:
            f.write(workbook)

        # docProps/core.xml
        core = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:creator>Job Generator</dc:creator>
    <cp:lastModifiedBy>Job Generator</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">2025-11-03T00:00:00Z</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">2025-11-03T00:00:00Z</dcterms:modified>
</cp:coreProperties>'''

        with open(os.path.join(temp_dir, 'docProps', 'core.xml'), 'w') as f:
            f.write(core)

        # docProps/app.xml
        app = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
    <Application>Job Generator</Application>
</Properties>'''

        with open(os.path.join(temp_dir, 'docProps', 'app.xml'), 'w') as f:
            f.write(app)

        # xl/worksheets/sheet1.xml - The actual data
        worksheet = Element('worksheet', {
            'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
        })

        sheetData = SubElement(worksheet, 'sheetData')

        for row_idx, row_data in enumerate(data, start=1):
            row = SubElement(sheetData, 'row', {'r': str(row_idx)})

            for col_idx, value in enumerate(row_data, start=1):
                col_letter = chr(64 + col_idx)  # A, B, C, etc.
                cell_ref = f"{col_letter}{row_idx}"

                if isinstance(value, str):
                    # String cell with inline string
                    cell = SubElement(row, 'c', {'r': cell_ref, 't': 'inlineStr'})
                    is_elem = SubElement(cell, 'is')
                    t_elem = SubElement(is_elem, 't')
                    t_elem.text = value
                else:
                    # Numeric cell
                    cell = SubElement(row, 'c', {'r': cell_ref})
                    v_elem = SubElement(cell, 'v')
                    v_elem.text = str(value)

        # Pretty print and save
        rough_string = tostring(worksheet, 'utf-8')
        reparsed = minidom.parseString(rough_string)

        with open(os.path.join(temp_dir, 'xl', 'worksheets', 'sheet1.xml'), 'w') as f:
            f.write(reparsed.toprettyxml(indent="  ", encoding='UTF-8').decode('utf-8'))

        # Create ZIP archive
        with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arcname)

    finally:
        # Clean up temp directory
        shutil.rmtree(temp_dir)


def generate_job_data(num_jobs=10000):
    """
    Generate job response data similar to the original file.

    Job ID format: job-{index}-{timestamp}
    Response time: Random value between 2000-25000 ms (2-25 seconds)
    """

    data = []

    # Header row
    data.append(['job_id', 'response_time_ms'])

    # Starting timestamp (similar to original data)
    base_timestamp = int(time.time() * 1000)  # Current time in milliseconds
    current_timestamp = base_timestamp

    print(f"Generating {num_jobs} jobs...")

    for i in range(num_jobs):
        # Generate job ID
        job_id = f"job-{i}-{current_timestamp}"

        # Generate response time (2-25 seconds, similar to original data)
        response_time = random.randint(2000, 25000)

        data.append([job_id, response_time])

        # Increment timestamp by response time for next job
        current_timestamp += response_time

        # Progress indicator
        if (i + 1) % 1000 == 0:
            print(f"  Generated {i + 1}/{num_jobs} jobs...")

    print(f"Generated {num_jobs} jobs successfully!")
    return data


def save_as_csv(filename, data):
    """Save data as CSV file (alternative format)."""
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(data)
    print(f"Saved CSV file: {filename}")


def main():
    print("=" * 60)
    print("Job Response Data Generator")
    print("=" * 60)

    # Generate data
    data = generate_job_data(num_jobs=10000)

    # Save as Excel file
    print("\nCreating Excel file...")
    create_xlsx('jobresponse_10k.xlsx', data)
    print(f"Created: jobresponse_10k.xlsx")

    # Also save as CSV for easy viewing/debugging
    print("\nCreating CSV file...")
    save_as_csv('jobresponse_10k.csv', data)

    # Print statistics
    print("\n" + "=" * 60)
    print("Statistics:")
    print("=" * 60)
    response_times = [row[1] for row in data[1:]]  # Exclude header
    print(f"Total jobs: {len(response_times)}")
    print(f"Min response time: {min(response_times)} ms")
    print(f"Max response time: {max(response_times)} ms")
    print(f"Avg response time: {sum(response_times) / len(response_times):.2f} ms")

    print("\nFirst 5 jobs:")
    for row in data[1:6]:
        print(f"  {row[0]}: {row[1]} ms")

    print("\nLast 5 jobs:")
    for row in data[-5:]:
        print(f"  {row[0]}: {row[1]} ms")

    print("\n" + "=" * 60)
    print("Done! Files created:")
    print("  - jobresponse_10k.xlsx (Excel format)")
    print("  - jobresponse_10k.csv (CSV format)")
    print("=" * 60)


if __name__ == '__main__':
    main()
