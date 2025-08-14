import Subscription from '../models/Subscription.js';

// export const saveSubscription = async (req, res) => {
//   try {
//     const { subscription } = req.body;

//     if (!subscription || !subscription.endpoint || !subscription.keys) {
//       return res.status(400).json({ error: 'Invalid subscription payload' });
//     }

//     const newSubscription = new Subscription({
//       endpoint: subscription.endpoint,
//       keys: {
//         p256dh: subscription.keys.p256dh,
//         auth: subscription.keys.auth
//       }
//     });

//     await newSubscription.save();
//     res.status(201).json({ message: 'Subscription saved successfully' });
//   } catch (error) {
//     console.error('Error saving subscription:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// routes/subscriptionRoutes.js
export const saveSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user?._id; // assuming you have auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    await Subscription.findOneAndUpdate(
      { userId },
      { ...subscription, userId },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
};


// Subscribe task for push notifications
export const subscribeTask = async (req, res) => {
  console.log('Incoming subscription:', req.body);

  const existing = await Subscription.findOne({ endpoint: req.body.endpoint });
  if (!existing) {
    await Subscription.create(req.body);
  }
  res.status(201).json({ message: 'Subscription saved' });
};