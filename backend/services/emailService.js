import nodemailer from 'nodemailer';
import Task from '../models/Task.js';
import User from '../models/User.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send task creation confirmation
export const sendTaskCreationEmail = async (user, task) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Task Created Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Task Created Successfully!</h2>
          <p>Hi ${user.name},</p>
          <p>Your new task has been created successfully:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">${task.title}</h3>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
            <p><strong>Priority:</strong> <span style="color: ${task.priority === 'High' ? '#f44336' : task.priority === 'Medium' ? '#ff9800' : '#4CAF50'}">${task.priority}</span></p>
            ${task.dueDate ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <p>Good luck with your task!</p>
          <p>Best regards,<br>DTT App Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Task creation email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending task creation email:', error);
  }
};

// Send daily reminders for tasks due tomorrow
export const sendUpcomingTaskReminders = async () => {
  try {
    const now = new Date();
    const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // Find tasks due in the next 30 minutes that are not completed and not already reminded
    const tasksDueSoon = await Task.find({
      dueDate: {
        $gte: now,
        $lte: thirtyMinsFromNow
      },
      isCompleted: false,
      reminderSent: { $ne: true }
    }).populate('userId', 'name email');

    if (tasksDueSoon.length === 0) {
      console.log('No tasks due in the next 30 minutes - no reminder emails to send');
      return;
    }

    // Group tasks by user
    const tasksByUser = tasksDueSoon.reduce((acc, task) => {
      const userId = task.userId._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: task.userId,
          tasks: []
        };
      }
      acc[userId].tasks.push(task);
      return acc;
    }, {});

    const transporter = createTransporter();

    // Send reminder email to each user
    for (const userId in tasksByUser) {
      const { user, tasks } = tasksByUser[userId];

      const tasksList = tasks.map(task => `
        <li style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid ${task.priority === 'High' ? '#f44336' : task.priority === 'Medium' ? '#ff9800' : '#4CAF50'};">
          <strong>${task.title}</strong>
          ${task.description ? `<br><span style="color: #666;">${task.description}</span>` : ''}
          <br><small style="color: #999;">Priority: ${task.priority}</small>
        </li>
      `).join('');

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Task Reminder - Tasks Due Soon',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color:#ff9800;">Upcoming Task Reminder</h2>
            <p>Hi ${user.name},</p>
            <p>You have <strong>${tasks.length}</strong> task${tasks.length > 1 ? 's' : ''} due in the next 30 minutes:</p>
            
            <ul style="list-style: none; padding: 0;">
              ${tasksList}
            </ul>
            
            <p>Don't forget to complete ${tasks.length > 1 ? 'these tasks' : 'this task'} on time!</p>
            <p>Best regards,<br>DTT App Team</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${user.email} for ${tasks.length} task(s)`);
        // Mark tasks as reminded
        await Task.updateMany(
          { _id: { $in: tasks.map(t => t._id) } },
          { $set: { reminderSent: true } }
        );
      } catch (error) {
        console.error(`Failed to send reminder email to ${user.email}:`, error);
      }
    }

    console.log(`Sent 30-minute reminder emails to ${Object.keys(tasksByUser).length} user(s)`);
  } catch (error) {
    console.error('Error in sendUpcomingTaskReminders:', error);
  }
};