import nodemailer from "nodemailer";

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  lowStock: (items) => ({
    subject: `🚨 Low Stock Alert: ${items.length} Item(s) Need Attention`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Low Stock Alert</h2>
        <p>The following items are below their minimum stock levels and need restocking:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Item</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Current Stock</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Minimum Required</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${item.name}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${item.currentQuantity} ${item.unit}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${item.minQuantity} ${item.unit}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; color: #dc3545;">CRITICAL</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p>Please take appropriate action to restock these items.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated message from ${
            process.env.APP_NAME || "City Inventory Management System"
          }.
        </p>
      </div>
    `,
  }),

  requisitionStatus: (requisition, action) => ({
    subject: `📋 Requisition ${action}: ${requisition.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${
          action === "APPROVED" ? "#28a745" : "#dc3545"
        };">Requisition ${action}</h2>
        <p>Your requisition <strong>"${
          requisition.title
        }"</strong> has been <strong>${action.toLowerCase()}</strong>.</p>
        ${
          requisition.reasonForRejection
            ? `
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Reason:</strong> ${requisition.reasonForRejection}
          </div>
        `
            : ""
        }
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Requisition Details:</strong><br>
          - ID: ${requisition.id}<br>
          - Department: ${requisition.department.name}<br>
          - Status: ${requisition.status}<br>
          - Processed By: ${requisition.processedBy.firstName} ${
      requisition.processedBy.lastName
    }<br>
          - Processed At: ${new Date(requisition.processedAt).toLocaleString()}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated message from ${
            process.env.APP_NAME || "City Inventory Management System"
          }.
        </p>
      </div>
    `,
  }),

  serviceRequestStatus: (serviceRequest, action) => ({
    subject: `🔧 Service Request ${action}: ${serviceRequest.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${
          action === "APPROVED" ? "#28a745" : "#dc3545"
        };">Service Request ${action}</h2>
        <p>Your service request <strong>"${
          serviceRequest.title
        }"</strong> has been <strong>${action.toLowerCase()}</strong>.</p>
        ${
          serviceRequest.reasonForRejection
            ? `
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Reason:</strong> ${serviceRequest.reasonForRejection}
          </div>
        `
            : ""
        }
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Request Details:</strong><br>
          - ID: ${serviceRequest.id}<br>
          - Department: ${serviceRequest.department.name}<br>
          - Status: ${serviceRequest.status}<br>
          - Processed By: ${serviceRequest.processedBy.firstName} ${
      serviceRequest.processedBy.lastName
    }<br>
          - Processed At: ${new Date(
            serviceRequest.processedAt
          ).toLocaleString()}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated message from ${
            process.env.APP_NAME || "City Inventory Management System"
          }.
        </p>
      </div>
    `,
  }),

  newRequisition: (requisition, recipient) => ({
    subject: `📥 New Requisition for Approval: ${requisition.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">New Requisition Requires Approval</h2>
        <p>A new requisition has been submitted and requires your review.</p>
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Requisition Details:</strong><br>
          - Title: ${requisition.title}<br>
          - Department: ${requisition.department.name}<br>
          - Submitted By: ${requisition.createdBy.firstName} ${
      requisition.createdBy.lastName
    }<br>
          - Items: ${requisition.items.length} item(s)<br>
          - Submitted At: ${new Date(requisition.createdAt).toLocaleString()}
        </div>
        <p>Please log in to the system to review and take action on this requisition.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated message from ${
            process.env.APP_NAME || "City Inventory Management System"
          }.
        </p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (to, templateName, data) => {
  // Skip email sending if SMTP is not configured (development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("📧 Email not sent (SMTP not configured):", {
      to,
      template: templateName,
      data,
    });
    return true; // Return success for development
  }

  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateName](data);

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        `"Inventory System" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};

// Batch email sending for notifications
export const sendBulkEmail = async (recipients, templateName, data) => {
  const results = await Promise.all(
    recipients.map((recipient) =>
      sendEmail(recipient.email, templateName, { ...data, recipient })
    )
  );
  return results.every((result) => result);
};
