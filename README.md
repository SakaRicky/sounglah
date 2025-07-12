# Sounglah Translation App

A full-stack translation application with React frontend and Flask backend.

## Quick Start

### Option 1: Using npm (Recommended)
```bash
# Install dependencies
npm run install:all

# Run both client and server
npm run dev
```

### Option 2: Using Python script
```bash
# Run both client and server
python run_dev.py
```

### Option 3: Using batch script (Windows)
```bash
# Run both client and server
run_dev.bat
```

### Option 4: Using shell script (Linux/Mac)
```bash
# Make script executable
chmod +x run_dev.sh

# Run both client and server
./run_dev.sh
```

## Manual Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip

### Installation

1. **Install client dependencies:**
   ```bash
   cd sounglah-client-vite
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd sounglah-server
   pip install -r requirements.txt
   ```

### Running Individually

**Start the Flask server:**
```bash
cd sounglah-server
python main.py
```
Server will be available at: http://localhost:5000

**Start the React client:**
```bash
cd sounglah-client-vite
npm run dev
```
Client will be available at: http://localhost:5173

## Development

- **Client**: React + Vite + TypeScript
- **Server**: Flask + Python
- **Translation**: Hugging Face Transformers

## Available Scripts

### Root level (package.json)
- `npm run dev` - Start both client and server
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run install:all` - Install all dependencies
- `npm run build` - Build the client for production

### Client (sounglah-client-vite/package.json)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run storybook` - Start Storybook
