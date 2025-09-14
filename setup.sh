#!/bin/bash
# Setup script for Phoenix CRM

echo "Setting up Phoenix CRM..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Creating .env.example file if not exists..."
if [ ! -f ".env.example" ]; then
    cat > .env.example << EOL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Phoenix CRM
NEXT_PUBLIC_COMPANY_NAME=Phoenix Solutions
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
EOL
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ".env file does not exist. Creating from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your actual values."
fi

echo "Setup complete!"
echo ""
echo "⚠️ IMPORTANT: You need to set up your Supabase credentials ⚠️"
echo "1. Go to https://app.supabase.io"
echo "2. Select your project"
echo "3. Go to Settings > API"
echo "4. Copy the URL and paste it as NEXT_PUBLIC_SUPABASE_URL in your .env file"
echo "5. Copy the anon key and paste it as NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file"
echo "6. Copy the service_role key and paste it as SUPABASE_SERVICE_KEY in your .env file"
echo ""
echo "Next steps:"
echo "1. Edit your .env file with the proper credentials"
echo "2. Run 'npm run seed' to populate the database"
echo "3. Run 'npm run dev' to start the development server"