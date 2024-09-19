import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface Update {
  // Define the properties of an update object here
  event: string;
  timestamp: number;
  // ... other properties
}

// const token = process.env.TOKEN || 'token';
const received_updates: Update[] = []; // Change to array for type safety

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case 'GET':
      if (req.url === '/') {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(received_updates);
      }
      return res.status(404).json({ error: 'Not Found' });
    case 'POST':
      const signature = req.headers['x-hub-signature'];
      const calculatedSignature = crypto.createHmac('sha1', process.env.APP_SECRET || '')
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (!signature || signature !== `sha1=${calculatedSignature}`) {
        console.log('Warning - request header X-Hub-Signature not present or invalid');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`Request body for ${req.url}:`);
      console.log(req.body);

      received_updates.unshift(req.body);
      return res.status(200).json({});
    default:
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}