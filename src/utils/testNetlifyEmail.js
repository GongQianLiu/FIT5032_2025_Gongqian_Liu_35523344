// Test Netlify Functions for External Email Sending (Postmark)
// Internal emails still use Firebase directly
export const testNetlifyEmail = async () => {
  try {
    console.log('📧 Testing EXTERNAL email via Netlify Functions (Postmark)...')
    console.log('📧 Note: Internal emails still use Firebase directly')

    const testEmailData = {
      to: 'test@example.com',
      subject: 'Test External Email from Netlify Functions',
      content: 'This is a test EXTERNAL email to verify that Netlify Functions are working correctly with Postmark for external email delivery.',
      senderInfo: {
        name: 'Test User',
        email: 'noreply@evergreenway.com'
      }
    }

    // Determine the correct endpoint
    const endpoint = import.meta.env.PROD 
      ? '/.netlify/functions/send-email'
      : 'http://localhost:8888/.netlify/functions/send-email'

    console.log('📧 Using endpoint:', endpoint)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEmailData)
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log('✅ Netlify Functions email test successful!')
      console.log('Message ID:', result.messageId)
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully via Netlify Functions'
      }
    } else {
      console.error('❌ Netlify Functions email test failed:', result.error)
      return {
        success: false,
        error: result.error || 'Unknown error'
      }
    }

  } catch (error) {
    console.error('❌ Error testing Netlify Functions email:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Test function availability
export const testNetlifyFunctionAvailability = async () => {
  try {
    const endpoint = import.meta.env.PROD 
      ? '/.netlify/functions/send-email'
      : 'http://localhost:8888/.netlify/functions/send-email'

    console.log('🔍 Testing Netlify Functions availability at:', endpoint)

    const response = await fetch(endpoint, {
      method: 'OPTIONS'
    })

    if (response.ok) {
      console.log('✅ Netlify Functions endpoint is available')
      return { success: true, endpoint }
    } else {
      console.log('❌ Netlify Functions endpoint not available:', response.status)
      return { success: false, status: response.status, endpoint }
    }

  } catch (error) {
    console.error('❌ Error testing Netlify Functions availability:', error)
    return { success: false, error: error.message }
  }
}

// Export to global for console testing
if (typeof window !== 'undefined') {
  window.testNetlifyEmail = testNetlifyEmail
  window.testNetlifyFunctionAvailability = testNetlifyFunctionAvailability
  
  console.log('🔧 Netlify email testing utilities loaded:')
  console.log('  - window.testNetlifyEmail() - Test email sending')
  console.log('  - window.testNetlifyFunctionAvailability() - Test function availability')
}

export default {
  testNetlifyEmail,
  testNetlifyFunctionAvailability
}
