# Build and install the app
cd .\android\
.\gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk