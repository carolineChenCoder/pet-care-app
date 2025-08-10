#!/bin/bash

# Script to generate Android keystore for EAS build
echo "Generating Android keystore for Pet Care Assistant..."

# Use expect to automate the interactive keystore generation
expect << 'EOF'
spawn eas credentials:configure --platform android

# Wait for platform selection if needed
expect {
    "Select platform" {
        send "Android\r"
        exp_continue
    }
    "Generate a new Android Keystore?" {
        send "Y\r"
        exp_continue
    }
    "What would you like to do?" {
        send "1\r"
        exp_continue
    }
    eof
}
EOF

echo "Keystore generation completed!"