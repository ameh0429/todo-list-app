// pushService.js
import webPush from "web-push";
import Task from "../models/Task.js"; // Your Task model
import Subscription from "../models/Subscription.js"; // Subscription model
import dotenv from "dotenv";
dotenv.config();


// VAPID keys - generate once using webPush.generateVAPIDKeys()
webPush.setVapidDetails(
  "mailto:amehmathiasejeh40@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

export async function sendDueTaskNotifications() {
  const now = new Date();

  // Find tasks due in the next minute
  const dueTasks = await Task.find({
    dueDate: { $lte: now },
    isCompleted: false
  }).populate("user");

  for (let task of dueTasks) {
    const subscriptions = await Subscription.find({ userId: task.user._id });

    for (let sub of subscriptions) {
      try {
        await webPush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: "Task Due Reminder",
            body: `Your task "${task.title}" is due now.`,
            icon: "/icons/icon-192x192.png",
            data: { url: "/tasks" }
          })
        );
      } catch (err) {
        console.error("Push error:", err);
      }
    }
  }
}
