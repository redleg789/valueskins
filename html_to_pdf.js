#!/usr/bin/env node
/**
 * Convert HTML files to PDF using Google Chrome
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = '/Users/sakethvelamuri/Desktop/Startups. /Short term/Valueskins.';

const files = [
  'FORM_1A_EXAM_REQUEST.html',
  'FORM_3_DECLARATION_INVENTORSHIP.html',
  'FORM_5_FULL_PATENT_APPLICATION.html',
  'PATENT_DRAWINGS_DIAGRAMS.html',
];

async function convertToPDF(htmlFile) {
  const htmlPath = path.join(projectDir, htmlFile);
  const pdfPath = path.join(projectDir, htmlFile.replace('.html', '.pdf'));

  if (!fs.existsSync(htmlPath)) {
    console.log(`❌ File not found: ${htmlPath}`);
    return false;
  }

  console.log(`📄 Converting: ${htmlFile}`);

  return new Promise((resolve) => {
    // Use Chrome's print-to-PDF via command line
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    // Create a temporary HTML file with print styling
    const tempHtml = path.join(projectDir, `.temp_${htmlFile}`);
    let content = fs.readFileSync(htmlPath, 'utf-8');

    // Add print styling
    content = content.replace(
      '</head>',
      `<style>
        @media print {
          * { margin: 0; padding: 0; }
          body { background: white; }
        }
      </style>
      </head>`
    );

    fs.writeFileSync(tempHtml, content);

    const args = [
      `--headless=new`,
      `--disable-gpu`,
      `--print-to-pdf=${pdfPath}`,
      `--print-to-pdf-no-header`,
      `file://${tempHtml}`
    ];

    const chrome = spawn(chromePath, args, { stdio: 'pipe' });

    let timeout = setTimeout(() => {
      chrome.kill();
      console.log(`   ✅ Created: ${pdfPath}`);
      fs.unlinkSync(tempHtml);
      resolve(true);
    }, 5000);

    chrome.on('close', (code) => {
      clearTimeout(timeout);
      if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 100) {
        console.log(`   ✅ Created: ${pdfPath}`);
        if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
        resolve(true);
      } else {
        console.log(`   ⚠️  Failed to create: ${pdfPath}`);
        if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
        resolve(false);
      }
    });

    chrome.on('error', (err) => {
      clearTimeout(timeout);
      console.log(`   ⚠️  Chrome error: ${err.message}`);
      if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
      resolve(false);
    });
  });
}

async function main() {
  console.log('\n🔄 Converting patent documents to PDF...\n');

  let successCount = 0;
  for (const file of files) {
    const success = await convertToPDF(file);
    if (success) successCount++;
    await new Promise(r => setTimeout(r, 500)); // Small delay between conversions
  }

  console.log(`\n✅ Conversion complete: ${successCount}/${files.length} files`);
  console.log(`📁 Files saved to: ${projectDir}\n`);

  // List created PDF files
  console.log('📋 Created PDF files:');
  for (const file of files) {
    const pdfFile = file.replace('.html', '.pdf');
    const pdfPath = path.join(projectDir, pdfFile);
    if (fs.existsSync(pdfPath)) {
      const sizeKb = (fs.statSync(pdfPath).size / 1024).toFixed(1);
      console.log(`   ✅ ${pdfFile} (${sizeKb} KB)`);
    } else {
      console.log(`   ❌ ${pdfFile} (not created)`);
    }
  }
}

main().catch(console.error);
