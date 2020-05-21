#!/bin/bash

# build
sudo npm run dist

#package
# npm run package

# sudo rm -rf "./Eisen-$BUILD-x64/Eisen.app/Contents/Resources/app" && echo "Removed vulnerable app file."

# sign
# sudo codesign --deep --verbose --force --sign "3rd Party Mac Developer Application: Philipp Eibl (LM2ZWJRF67)" Eisen-$BUILD-x64/Eisen.app

# verify
# sudo codesign --verify -vvvv Eisen-$BUILD-x64/Eisen.app

# Name of your app.
APP="Eisen"
TARGET="mas"
# TARGET="mas-dev"

# The path of your app to sign.
APP_PATH="./dist/$TARGET/$APP.app"
# The path to the location you want to put the signed package.
RESULT_PATH="./dist/$TARGET/$APP.pkg"
# The name of certificates you requested.
APP_KEY="3rd Party Mac Developer Application: Philipp Eibl (LM2ZWJRF67)"
INSTALLER_KEY="3rd Party Mac Developer Installer: Philipp Eibl (LM2ZWJRF67)"
# The path of your plist files.
CHILD_PLIST="./child.plist"
PARENT_PLIST="./parent.plist"
LOGINHELPER_PLIST="./loginhelper.plist"

FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"

codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Electron Framework"
codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libffmpeg.dylib"
codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libnode.dylib"
codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework"
codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/Contents/MacOS/$APP Helper"
codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/"
codesign -s "$APP_KEY" -f --deep --entitlements "$LOGINHELPER_PLIST" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/Contents/MacOS/$APP Login Helper"
codesign -s "$APP_KEY" -f --deep --entitlements "$LOGINHELPER_PLIST" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/"
codesign -s "$APP_KEY" -f --deep --entitlements "$LOGINHELPER_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/Contents/MacOS/$APP Helper"
codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$APP_PATH/Contents/MacOS/$APP"
codesign -s "$APP_KEY" -f --deep --entitlements "$PARENT_PLIST" "$APP_PATH"

echo "Signing Helpers..."

sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper (GPU).app"
sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper (Plugin).app"
sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper (Renderer).app"
sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper (GPU).app/Contents/MacOS/$APP Helper (GPU)"
sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper (Plugin).app/Contents/MacOS/$APP Helper (Plugin)"
sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper (Renderer).app/Contents/MacOS/$APP Helper (Renderer)"
sudo codesign -s "$APP_KEY" -f --deep --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libnode.dylib"

productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_KEY" "$RESULT_PATH"
