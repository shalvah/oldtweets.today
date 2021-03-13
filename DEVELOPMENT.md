# Development Guide

## Setting up
1. Install the Serverless Framework: `npm i -g serverless`

2. Install dependencies: `npm i`


## Running it locally
This project has two main components: the HTML web page and the API, hosted on Google CLoud Functions.

1. To run the HTML page locally, just open `docs/index.html` in your browser. You can interact with the page fully, and it will talk to my hosted API on Google Cloud Functions. If you're only making changes to the UI, this is all you need to do.

2. If you want to make changes to the API, you'll need to run the cloud function locally. For that, we use [coppa](https://github.com/rametta/coppa):

```bash
npm run coppa
```

Then visit http://localhost:9010/tweeted-on-this-day-getTweetsOnThisDay?username=your-username to fetch tweets for `your-username`. Note that the HTML page will still be pointed to my hosted Google Cloud Function, so if you want to test your API from the UI, you should replace the URL in `docs/index.html` (look for the `baseApiUrl` variable).

## Deploying
Before you can deploy, you'll need to have a Google Cloud Platform account. Then create a service account on GCP with the following roles:
- Cloud Functions Developer
- Deployment Manager Editor
- Logging Admin
- Storage Admin

Download a JSON key file for this service account and place it in the root of the project as `keyfile.json`. See https://serverless.com/framework/docs/providers/google/guide/credentials/.


### Deploying a new service
If you're starting from scratch (ie not updating an existing service), run `serverless deploy` to deploy.

After deploying a new cloud function, you need to set it to be accessible on the public internet. Currently, the Serverless Framework doesn't support setting this, so you'll have to do this manually whenever you deploy a new function, either [via the Cloud Console](https://cloud.google.com/functions/docs/securing/managing-access-iam#allowing_unauthenticated_function_invocation), or by using `gcloud` (make sure to use the correct project ID):

```
gcloud functions add-iam-policy-binding tweeted-on-this-day-dev-getTweetsOnThisDay --region=europe-west1 --member=allUsers --role=roles/cloudfunctions.invoker --project=tweetedonthisday
```

### Updating an existing service
To update an already deployed serverless function, run `serverless deploy`.

The deployed URL remains the same.