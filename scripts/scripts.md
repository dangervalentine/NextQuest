# Build and install the app
cd .\android\
.\gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk


Please analyze all the changes made to the codebase since the last commit and provide me with a comprehensive git commit message. Include:

1. A concise title line that summarizes the main changes
2. A detailed description of all significant changes, organized by component/feature
3. Any technical details that would be helpful for future reference
4. The impact of these changes on the application

Format the commit message according to conventional commit standards with appropriate type (feat, fix, refactor, etc.) and scope if applicable.