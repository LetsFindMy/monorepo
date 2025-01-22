#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
  echo -e "${BLUE}   $1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════${NC}\n"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print progress messages
print_progress() {
  echo -e "${YELLOW}⟳ $1${NC}"
}

# Function to count directories
count_dirs() {
  find . -type d -name "$1" | wc -l
}

# Start cleaning process
print_header "Starting Clean Process"

# Clean build directories
print_progress "Scanning for build directories..."
cache_count=$(count_dirs ".cache")
next_count=$(count_dirs ".next")
strapi_count=$(count_dirs ".strapi")
turbo_count=$(count_dirs ".turbo")
build_count=$(count_dirs "build")
dist_count=$(count_dirs "dist")

echo -e "Found:"
[ $cache_count -gt 0 ] && echo -e "${YELLOW}  ▸ ${cache_count} .cache directories${NC}"
[ $next_count -gt 0 ] && echo -e "${YELLOW}  ▸ ${next_count} .next directories${NC}"
[ $strapi_count -gt 0 ] && echo -e "${YELLOW}  ▸ ${strapi_count} .strapi directories${NC}"
[ $turbo_count -gt 0 ] && echo -e "${YELLOW}  ▸ ${turbo_count} .turbo directories${NC}"
[ $build_count -gt 0 ] && echo -e "${YELLOW}  ▸ ${build_count} build directories${NC}"
[ $dist_count -gt 0 ] && echo -e "${YELLOW}  ▸ ${dist_count} dist directories${NC}"

print_progress "Removing build directories..."
rm -rf $(find . -type d -name .cache)
rm -rf $(find . -type d -name .eslintcache)
rm -rf $(find . -type d -name .next)
rm -rf $(find . -type d -name .strapi)
rm -rf $(find . -type d -name .turbo)
rm -rf $(find . -type d -name .yarn)
rm -rf $(find . -type d -name "*.log")
rm -rf $(find . -type d -name build)
rm -rf $(find . -type d -name coverage)
rm -rf $(find . -type d -name dist)
rm -rf $(find . -type d -name generated)
rm -rf $(find . -type d -name storybook-static)
print_success "Build directories removed"

# Clean node_modules
print_progress "Scanning for node_modules..."
node_modules_count=$(count_dirs "node_modules")
echo -e "Found ${YELLOW}${node_modules_count}${NC} node_modules directories"

print_progress "Removing node_modules..."
rm -rf $(find . -type d -name node_modules)
print_success "node_modules removed"

# Clean pnpm
print_progress "Cleaning pnpm cache..."
pnpm store prune
rm -rf pnpm-lock.yaml
print_success "pnpm cache cleaned"

print_header "Clean Process Complete"
echo -e "${GREEN}You can now run 'pnpm install' to reinstall dependencies${NC}\n"
