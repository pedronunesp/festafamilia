# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to Firebase Hosting (Free Tier)

This project is configured to be deployed using the free **Firebase Hosting** service.

1.  **Install the Firebase CLI:** If you don't have it, install the Firebase command-line tool by running `npm install -g firebase-tools`.
2.  **Login to Firebase:** Run `firebase login` to authenticate with your Firebase account.
3.  **Initialize Firebase:** In your project's root directory, run `firebase init hosting`.
    *   Select 'Use an existing project' and choose your `festa-familia2` project.
    *   When asked about the public directory, **press Enter** to accept the default.
    *   When asked to configure as a single-page app, enter **N** (No).
    *   When asked to set up automatic builds and deploys with GitHub, enter **N** (No) for now.firebase deploy --only hosting
4.  **Deploy:** Run ``.

This will deploy your site to a public URL on Firebase Hosting, using the free Spark plan.
