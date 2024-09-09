import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';


const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    // Verify the webhook signature
    const hubSignature = req.headers['x-hub-signature'];
    const calculatedSignature = crypto.createHmac('sha1', process.env.APP_SECRET!).update(JSON.stringify(req.body)).digest('hex');

    if (hubSignature !== `sha1=${calculatedSignature}`) {
        return res.status(403).send('Invalid webhook signature');
    }

    // Process the webhook event
    const event = req.body.entry[0].changes[0];
    const object = event.object;

    switch (object) {
        case 'page':
            // Handle page events (e.g., comments, likes)
            console.log(object)
            break;
        case 'instagram_user':
            // Handle Instagram user events (e.g., new followers)
            console.log(object)
            break;
        default:
            console.error('Unhandled object:', object);
    }

    res.status(200).send('Webhook received');
});