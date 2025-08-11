// models/Subscription.js
import mongoose from 'mongoose';

// const subscriptionSchema = new mongoose.Schema({
//   endpoint: String,
//   keys: {
//     p256dh: String,
//     auth: String
//   }
// });

const subscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  }
});


const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;