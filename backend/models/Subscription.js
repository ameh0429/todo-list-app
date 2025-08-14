// // models/Subscription.js
// import mongoose from 'mongoose';

// const subscriptionSchema = new mongoose.Schema({
//   endpoint: { type: String, required: true, unique: true },
//   keys: {
//     p256dh: { type: String, required: true },
//     auth: { type: String, required: true }
//   }
// });


// const Subscription = mongoose.model('Subscription', subscriptionSchema);
// export default Subscription;



// models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // optional, but handy for lookups
    required: true
  },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  }
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);