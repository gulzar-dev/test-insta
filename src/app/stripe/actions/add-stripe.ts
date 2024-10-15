"use server";

import ENuser from "@/app/models/ENuser-model";
import { connectDb } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const addStripe = async () => {
  try {
    await connectDb();

    const user = await currentUser();

    const enuser = await ENuser.findOne({ userId: user?.id! });

    if (enuser) {
      return;
    } else {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2024-06-20",
      });

      await stripe.customers
        .create({
          email: user?.emailAddresses[0].emailAddress,
          name: user?.firstName! + user?.lastName,
        })
        .then(async (customer) => {
          
          const StartSubscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
              {
                price: 'price_1Q2WxxSJaDkH3rNrGL1uN7fF',
              },
            ],
            trial_period_days: 15,
            payment_settings: {
              save_default_payment_method: 'on_subscription',
            },
            trial_settings: {
              end_behavior: {
                missing_payment_method: 'create_invoice',
              },
            },
          });

          await enuser.create({
            userId: user?.id,
            stripeCustomerId: customer.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            setup:0,
            subscription: StartSubscription,
            trial_period_days: 15,
            // do changes here for plan name and Credits changes 
          })
        });

    }
  } catch (error) {
    console.log(error);
  }
};