import ENuser from '@/app/models/ENuser-model'
import { connectDb } from '@/lib/db'

export default async function RefreshLongLivedToken(long_insta_access_token : string, customerId: any ) {
  const long_access_token = long_insta_access_token

  const refresh_access_token = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${long_access_token}`,{method: "GET"})
    .then(
        (res) => res.json(),
    )
  await connectDb()
  const enuser = await ENuser.findOne({ stripeCustomerId: customerId });
    if (enuser){
    // adding code to DB 
        await ENuser.updateOne( { stripeCustomerId: customerId }, 
            { $set: {long_insta_access_token: refresh_access_token.access_token , 
                    token_type: refresh_access_token.token_type, 
                    long_insta_access_token_expires_in: refresh_access_token.expires_in,
                    long_insta_access_token_createdAt: new Date().toLocaleString(),
                }
            }
        )
        
        
        return refresh_access_token
    }else {
        return "something error in RefreshLongLivedToken 18line "
    }

}
