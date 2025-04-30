// This file is a wrapper for our ESM module to work with Netlify Functions
exports.handler = async (event, context) => {
  try {
    // Dynamically import the ESM module
    const { handler } = await import('../../dist/netlify.js');
    // Call the ESM handler with the event and context
    return await handler(event, context);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 