### 👋 Thanks for opening a pull request!

If you are new, please check out the trimmed down summary of our deployment process below:

1. 👀 Observe the CI jobs and tests to ensure they are passing
1. ✔️ Obtain an approval/review on this pull request
1. 🚀 Branch deploy your pull request to production

    > Comment `.deploy` on this pull request to trigger a deploy. If anything goes wrong, rollback with `.deploy main`

1. 🎉 Merge!

---

Please note, this repository handles branch deployments a bit differently than our others. As soon as you open a pull request or push new commits, your branch is automatically deploy to **development**. This is by design to allow for rapid testing. To deploy to production, that part is all standard and you can follow the steps as seen above. Thanks!
