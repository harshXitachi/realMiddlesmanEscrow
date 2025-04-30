// This is a special handler for API routes, particularly authentication
exports.handler = async (event, context) => {
  try {
    // Set up CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PINGOTHER',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request (preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers,
        body: ''
      };
    }

    // Extract the path from the event to route appropriately
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Dynamically import the ESM module
    const { handler } = await import('../../dist/netlify.js');
    
    // Create a modified event with the corrected path for authentication routes
    const modifiedEvent = {
      ...event,
      path: path || '/api/user',
      rawPath: path || '/api/user'
    };
    
    // Call the ESM handler with the modified event and context
    const response = await handler(modifiedEvent, context);
    
    // Add CORS headers to the response
    const finalResponse = {
      ...response,
      headers: { ...response.headers, ...headers }
    };
    
    return finalResponse;
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        path: event.path
      })
    };
  }
}; 