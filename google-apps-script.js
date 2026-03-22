/**
 * ShopOnline — Google Apps Script
 * ==========================================
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com → New Project
 * 2. Paste this entire file
 * 3. Replace SHEET_ID with your Google Sheet ID
 *    (from the sheet URL: .../d/SHEET_ID/edit)
 * 4. Click Deploy → New Deployment
 * 5. Type: Web App
 *    Execute as: Me
 *    Who has access: Anyone
 * 6. Copy the Web App URL and paste it in
 *    site.json → features.googleSheetsWebhook
 * ==========================================
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Leads'; // Tab name in your sheet

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
                  || SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'ID', 'Name', 'Shop Name', 'Category',
        'WhatsApp', 'Email', 'Location',
        'Pages Required', 'Custom Pages',
        'Google Maps', 'Social Media', 'Chatbot', 'Maintenance',
        'SEO', 'UPI Payments', 'WhatsApp Ordering', 'Multi-Language',
        'Budget', 'Timeline', 'Additional Requirements',
        'Reference URL', 'Status', 'Prompt Summary'
      ]);
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, 24);
      headerRange.setBackground('#c85a2a');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }

    const features = data.features || {};

    sheet.appendRow([
      new Date(data.timestamp || Date.now()),
      data.id || '',
      data.name || '',
      data.shopName || '',
      data.category || '',
      data.whatsapp || '',
      data.email || '',
      data.location || '',
      (data.pages || []).join(', '),
      data.customPages || '',
      features.googleMaps ? 'Yes' : 'No',
      features.socialMedia ? 'Yes' : 'No',
      features.chatbot ? 'Yes' : 'No',
      features.maintenance ? 'Yes' : 'No',
      features.seo ? 'Yes' : 'No',
      features.upiPayments ? 'Yes' : 'No',
      features.whatsappOrdering ? 'Yes' : 'No',
      features.multiLanguage ? 'Yes' : 'No',
      data.budget || '',
      data.timeline || '',
      data.additionalRequirements || '',
      data.referenceUrl || '',
      'New',
      data.promptSummary || ''
    ]);

    // Optional: send email notification
    sendEmailNotification(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Saved to sheet' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Health check endpoint
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'ShopOnline webhook active' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendEmailNotification(data) {
  try {
    const NOTIFY_EMAIL = 'hello@shoponline.in'; // Change to your email
    const subject = `🛒 New Lead: ${data.shopName} (${data.category})`;
    const body = `
New ShopOnline enquiry received!

Shop: ${data.shopName}
Name: ${data.name}
Category: ${data.category}
Location: ${data.location}
WhatsApp: ${data.whatsapp}
Email: ${data.email}
Budget: ${data.budget}
Timeline: ${data.timeline}

Pages Required: ${(data.pages || []).join(', ')}
Additional: ${data.additionalRequirements || 'None'}

--- AUTO-GENERATED BRIEF ---
${data.promptSummary || 'N/A'}
    `.trim();

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch(e) {
    // Email sending is optional — don't fail the whole function
    console.log('Email failed:', e.message);
  }
}
