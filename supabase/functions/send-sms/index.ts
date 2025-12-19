import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, feedbackId } = await req.json();

    console.log('SMS request received:', { phone, feedbackId, messagePreview: message?.substring(0, 50) });

    if (!phone || !message) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number (remove spaces, ensure +998 format)
    let normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.startsWith('998')) {
        normalizedPhone = '+' + normalizedPhone;
      } else if (normalizedPhone.startsWith('9')) {
        normalizedPhone = '+998' + normalizedPhone;
      } else {
        normalizedPhone = '+998' + normalizedPhone;
      }
    }

    console.log('Normalized phone:', normalizedPhone);

    // Check for SMS API key
    const smsApiKey = Deno.env.get('SMS_API_KEY');
    const smsApiUrl = Deno.env.get('SMS_API_URL');

    if (!smsApiKey || !smsApiUrl) {
      console.log('SMS API not configured, logging message instead');
      // Log the SMS for development/testing
      console.log('📱 SMS would be sent:');
      console.log(`   To: ${normalizedPhone}`);
      console.log(`   Message: ${message}`);
      console.log(`   Feedback ID: ${feedbackId}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS logged (API not configured)',
          phone: normalizedPhone,
          feedbackId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If SMS API is configured, send the actual SMS
    console.log('Sending SMS via API...');
    
    const smsResponse = await fetch(smsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smsApiKey}`,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message: message,
      }),
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('SMS API error:', errorText);
      throw new Error(`SMS API returned ${smsResponse.status}: ${errorText}`);
    }

    const smsResult = await smsResponse.json();
    console.log('SMS sent successfully:', smsResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        result: smsResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-sms function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});