// This file is a wrapper for our ESM module to work with Netlify Functions
exports.handler = async (event, context) => {
  try {
    // Set up CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    // Handle OPTIONS request (preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers,
        body: ''
      };
    }

    // Make sure environment variables are available
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    // Dynamically import the ESM module
    const { handler } = await import('../../dist/netlify.js');
    
    // Call the ESM handler with the event and context
    const response = await handler(event, context);
    
    // Add CORS headers to the response
    if (response && response.headers) {
      response.headers = { ...response.headers, ...headers };
    } else if (response) {
      response.headers = headers;
    }
    
    return response;
  } catch (error) {
    console.error('Error in Netlify function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify({ 
        error: error.message, 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      })
    };
  }
}; 