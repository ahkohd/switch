cp -R ./libuiohook ./node_modules/iohook/
cd ./node_modules/iohook && chmod +x ./libuiohook/bootstrap.sh && cmake-js compile -r node -v 10.16.0