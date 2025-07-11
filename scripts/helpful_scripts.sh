# Run the app on android
npx expo run:android

# Prebuild the app for android
npx expo prebuild -p android --clean
cd android && ./gradlew installDebug

# Build a production build of the app
npm run build:android-release
