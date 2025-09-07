# bn_announcement_notifier

This project fetches new announcements from a given source and sends notifications via Telegram.

# Setup

1.  **Install dependencies:**
    ```
    $ npm install
    ```

2.  **Set up GitHub Secrets:**
    This project uses GitHub Actions to run periodically. To send Telegram notifications, you need to configure the following secrets in your GitHub repository secrets:
    - `TG_BOT_TOKEN`: Your Telegram bot token.
    - `TG_CHAT_ID`: The chat ID where you want to receive notifications.

3.  **Adjust the schedule (optional):**
    You can change the schedule by editing the `cron` in `.github/workflows/scheduler.yml`