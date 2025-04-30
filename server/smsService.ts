import { nanoid } from 'nanoid';

// Interface for messaging options
interface MessageOptions {
  to: string;
  text: string;
  channel?: 'sms' | 'whatsapp';
}

// Function to send SMS or WhatsApp (stub for now, would connect to real services like Twilio or WhatsApp Business API)
export async function sendMessage(options: MessageOptions): Promise<boolean> {
  try {
    const channel = options.channel || 'sms';
    
    // Stub for message sending - in production, this would use a service API
    console.log('\n*******************************************************');
    console.log(`*** SENDING ${channel.toUpperCase()} TO: ${options.to} ***`);
    console.log(`*** MESSAGE: ${options.text}`);
    console.log('*******************************************************\n');
    
    // In a real implementation, we would call the appropriate messaging API here
    // For testing purposes, always return success
    return true;
  } catch (error) {
    console.error(`${options.channel || 'SMS'} sending error:`, error);
    return false;
  }
}

// Legacy function for backward compatibility
export async function sendSMS(options: MessageOptions): Promise<boolean> {
  return sendMessage({ ...options, channel: 'sms' });
}

// Generate verification code
export function generateVerificationCode(): string {
  return nanoid(6).toUpperCase();
}

// Send verification through specified channel
export async function sendVerification(
  phoneNumber: string, 
  code: string, 
  username: string, 
  channel: 'sms' | 'whatsapp' = 'sms'
): Promise<boolean> {
  // Log the code prominently for testing purposes
  console.log(`\n********************************************************`);
  console.log(`****** VERIFICATION CODE FOR ${phoneNumber} ******`);
  console.log(`****** CODE: ${code} ******`);
  console.log(`****** CHANNEL: ${channel.toUpperCase()} ******`);
  console.log(`********************************************************\n`);
  
  // Create message based on channel
  const message = channel === 'whatsapp' 
    ? `*MM ESCROW* 🔐\n\nHi ${username},\n\nYour verification code is: *${code}*\n\nThis code will expire in 1 hour.`
    : `Hi ${username}, your Middlesman verification code is: ${code}. This code will expire in 1 hour.`;
    
  return await sendMessage({
    to: phoneNumber,
    text: message,
    channel
  });
}

// Legacy SMS verification function for backward compatibility
export async function sendVerificationSMS(phoneNumber: string, code: string, username: string): Promise<boolean> {
  return sendVerification(phoneNumber, code, username, 'sms');
}

// Send WhatsApp verification message
export async function sendVerificationWhatsApp(phoneNumber: string, code: string, username: string): Promise<boolean> {
  return sendVerification(phoneNumber, code, username, 'whatsapp');
}

// Send password reset through specified channel
export async function sendPasswordReset(
  phoneNumber: string, 
  code: string, 
  username: string,
  channel: 'sms' | 'whatsapp' = 'sms'
): Promise<boolean> {
  // Log the code prominently for testing purposes
  console.log(`\n********************************************************`);
  console.log(`****** PASSWORD RESET CODE FOR ${phoneNumber} ******`);
  console.log(`****** CODE: ${code} ******`);
  console.log(`****** CHANNEL: ${channel.toUpperCase()} ******`);
  console.log(`********************************************************\n`);
  
  // Create message based on channel
  const message = channel === 'whatsapp' 
    ? `*MM ESCROW* 🔑\n\nHi ${username},\n\nYour password reset code is: *${code}*\n\nThis code will expire in 1 hour.`
    : `Hi ${username}, your Middlesman password reset code is: ${code}. This code will expire in 1 hour.`;
    
  return await sendMessage({
    to: phoneNumber,
    text: message,
    channel
  });
}

// Legacy SMS password reset function for backward compatibility
export async function sendPasswordResetSMS(phoneNumber: string, code: string, username: string): Promise<boolean> {
  return sendPasswordReset(phoneNumber, code, username, 'sms');
}

// Send WhatsApp password reset message
export async function sendPasswordResetWhatsApp(phoneNumber: string, code: string, username: string): Promise<boolean> {
  return sendPasswordReset(phoneNumber, code, username, 'whatsapp');
}