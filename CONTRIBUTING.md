## General contribution Guidelines

- If you're making a change to the UI, please include "Before" and "After" screenshots as a GitHub comment in your pull request. Mobile and desktop should both be included if the change affects both views.

- Your PR should have a description, where you explain what the change is and why it should be accepted. This can be anything from a single line to several paragraphs as needed. For major changes, it's recommended to open an issue first, so it can be discussed and vetted. If your PR fixes an existing issue, please reference it in the description of the PR (by using #<issue-number> e.g. #30).

- Your PR title should be a summary of this description.

Here's an example of a good PR: https://github.com/shalvah/oldtweets.today/pull/11

## Setting up
1. Install the Serverless Framework: `npm i -g serverless`

2. Install dependencies: `npm i`

3. Ensure you have a Google service account with the following roles:
  - Cloud Functions Developer
  - Deployment Manager Editor
  - Logging Admin
  - Storage Admin

  Download a JSON key file for this account and place it in the root of the project as keyfile.json. See https://serverless.com/framework/docs/providers/google/guide/credentials/.

## Deploying
### Deploying a new service
If you're starting from scratch (ie not updating an existing service), run `serverless deploy` to deploy.

After deploying a new cloud function, you need to set it to be accessible on the public internet. Currently, the Serverless Framework doesn't support setting this, so you'll have to do this manually whenever you deploy a new function, either [via the Cloud Console](https://cloud.google.com/functions/docs/securing/managing-access-iam#allowing_unauthenticated_function_invocation), or by using `gcloud` (make sure to use the correct project ID):

```
gcloud functions add-iam-policy-binding tweeted-on-this-day-dev-getTweetsOnThisDay --region=europe-west1 --member=allUsers --role=roles/cloudfunctions.invoker --project=tweetedonthisday
```

### Updating an existing service
To update an already deployed serverless function, run `serverless deploy`.

The deployed URL remains the same.

## Local testing
I haven't really optimized this for local testing yet.