import axios from 'axios';

/**
 * Send an email using EmailJS REST API
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.log('\n----------------------------------------');
    console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
    console.log('----------------------------------------\n');
    return true;
  }

  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey, // Required for backend calls
      template_params: {
        email: to, // Maps to {{email}} in your template
        otp: otp,  // Maps to {{otp}} in your template
      }
    };

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`[Email Sent via EmailJS] ${to} - Status: ${response.status}`);
    return true;
  } catch (error) {
    const errMsg = error?.response?.data || error.message;
    console.error('[EmailJS Error] Failed to send OTP:', errMsg);
    throw new Error('Failed to send OTP email');
  }
};
