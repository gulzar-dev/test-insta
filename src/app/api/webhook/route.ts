import { NextApiRequest, NextApiResponse } from 'next';

const token = process.env.TOKEN || 'token';
const received_updates = Array; // Change to array for type safety

export async function subscribe(req: NextApiRequest, res: NextApiResponse) {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === token
  ) {
    res.status(200).json({ challenge: req.query['hub.challenge'] });
  } else {
    res.status(400).send('Invalid request'); // More informative message
  }
}

export async function instagram(req: NextApiRequest, res: NextApiResponse) {
  console.log('Instagram request body:');
  console.log(req.body);

  // Process the Instagram updates here
  received_updates(req.body);
  res.status(200).json({}); // Empty response for consistency
}
