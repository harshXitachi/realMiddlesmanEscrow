# Set your SendGrid API key here
# 
# If you're seeing a "401 Unauthorized" error, you need to create a new API key:
# 1. Go to https://app.sendgrid.com/settings/api_keys
# 2. Click "Create API Key"
# 3. Name it "Middlesman App"
# 4. Set permissions to include "Mail Send" at minimum
# 5. Click "Create & View" and copy the new key below
#
# IMPORTANT: Don't commit API keys to version control!
# This is just a placeholder - you should set your actual API key locally
# or use a secure method like environment variables or a .env file not tracked by git
$env:SENDGRID_API_KEY = "YOUR_API_KEY_GOES_HERE"

# Start the application in development mode
npm run dev 