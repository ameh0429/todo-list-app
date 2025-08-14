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

// export async function sendDueTaskNotifications() {
//   const now = new Date();

//   // Find tasks due in the next minute
//   const dueTasks = await Task.find({
//     dueDate: { $lte: now },
//     isCompleted: false
//   }).populate("userId");

//   for (let task of dueTasks) {
//     const subscriptions = await Subscription.find({ userId: task.user._id });

//     for (let sub of subscriptions) {
//       try {
//         await webPush.sendNotification(
//           sub.subscription,
//           JSON.stringify({
//             title: "Task Due Reminder",
//             body: `Your task "${task.title}" is due now.`,
//             icon: "/icons/icon-192x192.png",
//             data: { url: "/tasks" }
//           })
//         );
//       } catch (err) {
//         console.error("Push error:", err);
//       }
//     }
//   }
// }

// export async function sendDueTaskNotifications() {
//   const now = new Date();

//   // Find tasks due in the next minute
//   const dueTasks = await Task.find({
//     dueDate: { $lte: now },
//     isCompleted: false
//   }).populate("userId"); // Populate the actual field in your schema

//   for (let task of dueTasks) {
//     if (!task.userId) {
//       console.warn(`Task ${task._id} has no associated user`);
//       continue;
//     }

//     const subscriptions = await Subscription.find({ userId: task.userId._id });

//     for (let sub of subscriptions) {
//       try {
//         await webPush.sendNotification(
//           sub.subscription,
//           JSON.stringify({
//             title: "Task Due Reminder",
//             body: `Your task "${task.title}" is due now.`,
//             icon: "/icons/icon-192x192.png",
//             data: { url: "/tasks" }
//           })
//         );
//       } catch (err) {
//         console.error("Push error:", err);
//       }
//     }
//   }
// }

export async function sendDueTaskNotifications() {
  const now = new Date();

  // Find tasks due in the next minute
  const dueTasks = await Task.find({
    dueDate: { $lte: now },
    isCompleted: false
  }).populate("userId");

  for (let task of dueTasks) {
    if (!task.userId || !task.userId._id) {
      console.warn(`Skipping task "${task.title}" — missing user info.`);
      continue;
    }

    const subscriptions = await Subscription.find({ userId: task.userId._id });

    for (let sub of subscriptions) {
      const subscriptionData = sub.subscription || sub; // try both cases

      if (!subscriptionData || !subscriptionData.endpoint) {
        console.warn(
          `Skipping subscription for user ${task.userId._id} — invalid or missing endpoint.`
        );
        continue;
      }

      try {
        await webPush.sendNotification(
          subscriptionData,
          JSON.stringify({
            title: "Task Due Reminder",
            body: `Your task "${task.title}" is due now.`,
            icon: "/icons/icon-192x192.png",
            data: { url: "/tasks" }
          })
        );
        console.log(`Push sent to user ${task.userId._id} for task "${task.title}".`);
      } catch (err) {
        console.error("Push error:", err);
      }
    }
  }
}
