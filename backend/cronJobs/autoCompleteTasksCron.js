// autoCompleteTasksCron.js
import cron from "node-cron";
import Task from "../models/Task.js";

// This runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const buffer = new Date(now.getTime() + 1000);

    const overdueTasks = await Task.find({
      dueDate: { $lte: now },
      isCompleted: false
    });

    if (overdueTasks.length > 0) {
      const result = await Task.updateMany(
        { dueDate: { $lte: buffer }, isCompleted: false },
        { $set: { isCompleted: true } }
      );

      console.log(`[${new Date().toISOString()}] Auto-complete triggered`);
      console.log(`Overdue tasks updated: ${result.modifiedCount}`);
    }
  } catch (error) {
    console.error("Auto-complete error:", error);
  }
});
