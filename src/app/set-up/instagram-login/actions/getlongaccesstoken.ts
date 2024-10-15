"use server"
import ENuser from '@/app/models/ENuser-model'
import { connectDb } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

export default async function GetLongAccessToken(short_insta_access_token : any ,client_secret: any ) {
  const short_token = short_insta_access_token

  const long_access_token = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${client_secret}&access_token=${short_token}`,{method: "GET"})
    .then(
        (res) => res.json(),
    )
  await connectDb()
  const user = await currentUser();
  const enuser = await ENuser.findOne({ userId: user?.id! });
    if (enuser){
    // adding code to DB 
        const long_access_tokenpush = await ENuser.updateOne( { userId: user?.id! }, 
            { $set: {long_insta_access_token: long_access_token.access_token , 
                    token_type: long_access_token.token_type, 
                    long_insta_access_token_expires_in: long_access_token.expires_in,
                    long_insta_access_token_createdAt: new Date().toLocaleString(),
                }
            }
        )
        
        
        return long_access_tokenpush.acknowledged
    }else {
        return "something error in GetLongAccessToken 18line "
    }

}
