# Setup Instructions

## Prerequisites

You need to install Node.js and npm to run this application locally.

### Installing Node.js on macOS

#### Option 1: Using Homebrew (Recommended)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

#### Option 2: Using the Official Installer
1. Visit https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer and follow the instructions

#### Option 3: Using nvm (Node Version Manager)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run
source ~/.zshrc

# Install Node.js
nvm install --lts
nvm use --lts
```

### Verify Installation
```bash
node --version
npm --version
```

## Running the Application

Once Node.js is installed:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## Alternative: Deploy to Render (No Local Setup Required)

If you don't want to install Node.js locally, you can deploy directly to Render:

1. **Push this code to GitHub**
2. **Sign up for Render** (https://render.com)
3. **Connect your GitHub repository**
4. **Deploy using the render.yaml configuration**

The application will be available at your Render URL.

## Troubleshooting

### If npm install fails:
- Make sure you have Node.js version 14 or higher
- Try clearing npm cache: `npm cache clean --force`
- Check your internet connection

### If the server won't start:
- Check if port 3000 is already in use
- Try a different port by setting the PORT environment variable
- Make sure all files are in the correct locations
