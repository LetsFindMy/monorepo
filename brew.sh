# Breew will gracefully handle (ignore) reinstalls, allowing for new/update functionality

# Prerequisite. gnupg is required for binary signature verification
brew install gnupg
# Next, install using brew (use `doppler update` for subsequent updates)
brew install dopplerhq/cli/doppler
doppler --version
doppler update
