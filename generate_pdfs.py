#!/usr/bin/env python3
"""
Generate PDF files from HTML using macOS native capabilities.
Uses cupsfilter to convert HTML to PDF.
"""

import os
import subprocess
import sys

PROJECT_DIR = "/Users/sakethvelamuri/Desktop/Startups. /Short term/Valueskins."

files_to_convert = [
    "FORM_1A_EXAM_REQUEST.html",
    "FORM_3_DECLARATION_INVENTORSHIP.html",
    "FORM_5_FULL_PATENT_APPLICATION.html",
    "PATENT_DRAWINGS_DIAGRAMS.html",
]

def convert_html_to_pdf(html_file):
    """Convert HTML file to PDF using available system tools."""

    html_path = os.path.join(PROJECT_DIR, html_file)
    pdf_path = os.path.join(PROJECT_DIR, html_file.replace('.html', '.pdf'))

    if not os.path.exists(html_path):
        print(f"❌ File not found: {html_path}")
        return False

    print(f"📄 Converting: {html_file}")

    try:
        # Try using macOS's built-in print-to-PDF
        # Method 1: Try cupsfilter (CUPS utility)
        result = subprocess.run(
            ['cupsfilter', '-m', 'application/pdf', html_path],
            capture_output=True,
            timeout=10
        )

        if result.returncode == 0 and result.stdout:
            with open(pdf_path, 'wb') as f:
                f.write(result.stdout)
            print(f"   ✅ Created: {pdf_path}")
            return True

    except (subprocess.TimeoutExpired, FileNotFoundError) as e:
        print(f"   ⚠️  cupsfilter failed: {e}")

    try:
        # Method 2: Try using wkhtmltopdf if available
        result = subprocess.run(
            ['wkhtmltopdf', '--quiet', html_path, pdf_path],
            capture_output=True,
            timeout=15
        )

        if result.returncode == 0 and os.path.exists(pdf_path):
            print(f"   ✅ Created: {pdf_path}")
            return True

    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    try:
        # Method 3: Try using system print command with SaveAsPDF plugin
        subprocess.run(
            ['lp', '-d', 'Save as PDF', '-o', f'OutputFile={pdf_path}', html_path],
            capture_output=True,
            timeout=10
        )

        if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 100:
            print(f"   ✅ Created: {pdf_path}")
            return True

    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    print(f"   ⚠️  Could not convert {html_file}")
    return False

def main():
    print("\n🔄 Converting patent documents to PDF...\n")

    os.chdir(PROJECT_DIR)

    success_count = 0
    for html_file in files_to_convert:
        if convert_html_to_pdf(html_file):
            success_count += 1

    print(f"\n✅ Conversion complete: {success_count}/{len(files_to_convert)} files")
    print(f"📁 Files saved to: {PROJECT_DIR}\n")

    # List created PDF files
    print("📋 Created PDF files:")
    for html_file in files_to_convert:
        pdf_file = html_file.replace('.html', '.pdf')
        pdf_path = os.path.join(PROJECT_DIR, pdf_file)
        if os.path.exists(pdf_path):
            size_kb = os.path.getsize(pdf_path) / 1024
            print(f"   ✅ {pdf_file} ({size_kb:.1f} KB)")
        else:
            print(f"   ❌ {pdf_file} (not created)")

if __name__ == '__main__':
    main()
