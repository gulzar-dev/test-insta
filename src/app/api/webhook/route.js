import Stripe from "stripe";
import {  NextResponse } from "next/server";
import ENuser from "@/app/models/ENuser-model";
import { CreateLogs } from "@/app/modules/createlogs";
import RefreshLongLivedToken from "@/app/set-up/instagram-login/actions/refreshlonglivedtoken";
import { connectDb } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const webhookHandler = async (req) => {
  try {
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`❌ Webhook Error message: ${errorMessage}`);
      return NextResponse.json(
        { error: { message: `Webhook Error: ${errorMessage}` } },
        { status: 400 }
      );
    }

    // Successfully constructed event.
    console.log("✅ Success:", event.id, event.type);

    // getting to the data we want from the event
    const subscription = event.data.object ;
    const itemId = subscription.items.data[0].price.product;
    const trial_period_days = subscription.items.data[0].plan.trial_period_days;

    // Fetch the product (plan) details
    const product = await stripe.products.retrieve(itemId);

    const planName = product.name;

    // do changes for credits 
    let EmailsCredits = 0 ;

    // if (planName === "freemium") {
    //   EmailsCredits = 500;
    // } else if (planName === "basic") {
    //   EmailsCredits = 1000;
    // } else if (planName === "premium") {
    //   EmailsCredits = 10000;
    // } else {
    //   // Handle invalid plan names (optional)
    //   console.warn("Invalid plan name:", planName);
    //   EmailsCredits = 0; // Or set a default value for unknown plans
    // }

      switch (event.type) {
        
        case "customer.subscription.created":
          // customer subscription created
          await CreateLogs(subscription.customer, event.type, event.data )
          const enuser = await ENuser.findOne({
            stripeCustomerId: subscription.customer,
          });

          if (enuser) {
            await ENuser.updateOne(
              {
                stripeCustomerId: subscription.customer,
              },
              { $set: { plan: planName, credits: EmailsCredits } }
            )
            // .then(() => {
            //   console.log("subscription.created", res)
            // });
          }
          break;
        case "customer.subscription.updated":
          // customer subscription created
          await CreateLogs(subscription.customer, event.type, event.data )
          const ENuserUpdate = await ENuser.findOne({
            stripeCustomerId: subscription.customer,
          });

          if (ENuserUpdate) {
            await ENuser.updateOne(
              {
                stripeCustomerId: subscription.customer,
              },
              { $set: { plan: planName, credits: EmailsCredits, trial_period_days: trial_period_days } }
            )
            // .then((res) => {
            //   console.log("subscription.updated")
            // });
          }
          break;
        case "customer.subscription.deleted":
          // subscription deleted 
          await CreateLogs(subscription.customer, event.type, event.data )
          const ENuserdeleted = await ENuser.findOne({
            stripeCustomerId: subscription.customer,
          });

          if (ENuserdeleted) {
            await ENuser.updateOne(
              {
                stripeCustomerId: subscription.customer,
              },
              { $set: { plan: planName, credits: 0, trial_period_days: trial_period_days } }
            )
            // .then((res) => {
            //   console.log("subscription.deleted")
            // });
          }
          break;
        case "invoice.created":
            await  CreateLogs(subscription.customer, event.type, event.data )
            await connectDb()
            const GetLonginstaAccessToken = await ENuser.findOne({ stripeCustomerId: subscription.customer });
            const refreshlonglivedtoken = await RefreshLongLivedToken(GetLonginstaAccessToken.long_insta_access_token, subscription.customer)
            console.log(`🤷‍♀️ RefreshedLongLivedToken : ${refreshlonglivedtoken}`);
          break;
        default:

          await CreateLogs(subscription.customer, event.type, event.data )

          console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
          break;
      }

    // Return a response to acknowledge receipt of the event.
    // console.log(`🤷‍♀️ customer: ${subscription.customer}`)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Unexpected Error: ", error);
    return NextResponse.json(
      { error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
};

export { webhookHandler as POST };




// {
//   "id": "evt_1MqqbKLt4dXK03v5qaIbiNCC",
//   "object": "event",
//   "api_version": "2024-09-30.acacia",
//   "created": 1680064028,
//   "type": "customer.subscription.updated",
//   "data": {
//     "object": {
//       "id": "sub_1Mqqb6Lt4dXK03v50OA219Ya",
//       "object": "subscription",
//       "application": null,
//       "application_fee_percent": null,
//       "automatic_tax": {
//         "enabled": false
//       },
//       "billing_cycle_anchor": 1680668814,
//       "billing_thresholds": null,
//       "cancel_at": null,
//       "cancel_at_period_end": false,
//       "canceled_at": null,
//       "cancellation_details": {
//         "comment": null,
//         "feedback": null,
//         "reason": null
//       },
//       "collection_method": "charge_automatically",
//       "created": 1680064014,
//       "currency": "usd",
//       "current_period_end": 1683260814,
//       "current_period_start": 1680668814,
//       "customer": "cus_Nc4kL4EPtG5SKe",
//       "days_until_due": null,
//       "default_payment_method": null,
//       "default_source": null,
//       "default_tax_rates": [],
//       "description": "A test subscription",
//       "discount": null,
//       "ended_at": null,
//       "invoice_customer_balance_settings": {
//         "consume_applied_balance_on_void": true
//       },
//       "items": {
//         "object": "list",
//         "data": [
//           {
//             "id": "si_Nc4kEcMHd3vRTS",
//             "object": "subscription_item",
//             "billing_thresholds": null,
//             "created": 1680064014,
//             "metadata": {},
//             "plan": {
//               "id": "price_1Mqqb5Lt4dXK03v5cK9prani",
//               "object": "plan",
//               "active": true,
//               "aggregate_usage": null,
//               "amount": 4242,
//               "amount_decimal": "4242",
//               "billing_scheme": "per_unit",
//               "created": 1680064015,
//               "currency": "usd",
//               "interval": "month",
//               "interval_count": 1,
//               "livemode": false,
//               "metadata": {},
//               "nickname": null,
//               "product": "prod_Nc4kjj2XYpywZV",
//               "tiers": null,
//               "tiers_mode": null,
//               "transform_usage": null,
//               "trial_period_days": null,
//               "usage_type": "licensed"
//             },
//             "price": {
//               "id": "price_1Mqqb5Lt4dXK03v5cK9prani",
//               "object": "price",
//               "active": true,
//               "billing_scheme": "per_unit",
//               "created": 1680064015,
//               "currency": "usd",
//               "custom_unit_amount": null,
//               "livemode": false,
//               "lookup_key": null,
//               "metadata": {},
//               "migrate_to": null,
//               "nickname": null,
//               "product": "prod_Nc4kjj2XYpywZV",
//               "recurring": {
//                 "aggregate_usage": null,
//                 "interval": "month",
//                 "interval_count": 1,
//                 "trial_period_days": null,
//                 "usage_type": "licensed"
//               },
//               "tax_behavior": "unspecified",
//               "tiers_mode": null,
//               "transform_quantity": null,
//               "type": "recurring",
//               "unit_amount": 4242,
//               "unit_amount_decimal": "4242"
//             },
//             "quantity": 1,
//             "subscription": "sub_1Mqqb6Lt4dXK03v50OA219Ya",
//             "tax_rates": []
//           }
//         ],
//         "has_more": false,
//         "total_count": 1,
//         "url": "/v1/subscription_items?subscription=sub_1Mqqb6Lt4dXK03v50OA219Ya"
//       },
//       "latest_invoice": "in_1MqqbILt4dXK03v5cbbciqFZ",
//       "livemode": false,
//       "metadata": {},
//       "next_pending_invoice_item_invoice": null,
//       "on_behalf_of": null,
//       "pause_collection": null,
//       "payment_settings": {
//         "payment_method_options": null,
//         "payment_method_types": null,
//         "save_default_payment_method": "off"
//       },
//       "pending_invoice_item_interval": null,
//       "pending_setup_intent": null,
//       "pending_update": null,
//       "plan": {
//         "id": "price_1Mqqb5Lt4dXK03v5cK9prani",
//         "object": "plan",
//         "active": true,
//         "aggregate_usage": null,
//         "amount": 4242,
//         "amount_decimal": "4242",
//         "billing_scheme": "per_unit",
//         "created": 1680064015,
//         "currency": "usd",
//         "interval": "month",
//         "interval_count": 1,
//         "livemode": false,
//         "metadata": {},
//         "nickname": null,
//         "product": "prod_Nc4kjj2XYpywZV",
//         "tiers": null,
//         "tiers_mode": null,
//         "transform_usage": null,
//         "trial_period_days": null,
//         "usage_type": "licensed"
//       },
//       "quantity": 1,
//       "schedule": null,
//       "start_date": 1680064014,
//       "status": "active",
//       "tax_percent": null,
//       "test_clock": "clock_1Mqqb4Lt4dXK03v5NOFiPg4R",
//       "transfer_data": null,
//       "trial_end": 1680668814,
//       "trial_settings": {
//         "end_behavior": {
//           "missing_payment_method": "create_invoice"
//         }
//       },
//       "trial_start": 1680064014
//     },
//     "previous_attributes": {
//       "current_period_end": 1680668814,
//       "current_period_start": 1680064014,
//       "latest_invoice": "in_1Mqqb6Lt4dXK03v5Xn79tY8i",
//       "status": "trialing"
//     }
//   },
//   "livemode": false,
//   "pending_webhooks": 1,
//   "request": {
//     "id": null,
//     "idempotency_key": null
//   }
// }