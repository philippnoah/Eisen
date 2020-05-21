const {notarize} = require("electron-notarize");

exports.default = async function notarizing(context) {
  const {electronPlatformName, appOutDir} = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: "com.philippeibl.eisen",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "philipp.eibl@outlook.com",
    appleIdPassword: "Noc3ption"
  });
};
