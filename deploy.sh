#!/bin/bash

# Run build
npm run build:prod
mv dist/ dist-backup
mv dist-temp/ dist/
rm -rf dist-backup
pm2 reload "Campaign Manager" --update-env
pm2 status
