#!/bin/bash

# Enable exit on error
set -e

# Install Node.js dependencies if node_modules not cached
if [ ! -d "node_modules" ]; then
  echo "Installing Node.js dependencies..."
  npm install
else
  echo "Node.js dependencies already installed. Skipping..."
fi

# Install Python dependencies if venv not cached
if [ ! -d "venv" ]; then
  echo "Creating virtual environment and installing Python packages..."
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
else
  echo "Using cached Python virtual environment..."
  source venv/bin/activate
fi

# You can start your app after this in your render start command
