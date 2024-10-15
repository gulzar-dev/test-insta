import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import { useState } from 'react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"  
import { connectDb } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import ENuser from '@/app/models/ENuser-model';
import GetLongAccessToken from './actions/getlongaccesstoken';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export default async function InstagramLogin() {
  const router = useRouter();
  const { toast } = useToast()
  const [ Loading , SetLoding] = useState<any>("Loading...")
  const searchParams = useSearchParams()
  const codeHas = searchParams.has("code")
  const code = searchParams.get("code")?.slice(0,-2);
  const error = searchParams.get("error");
  const error_reason = searchParams.get("error_reason");
  const error_description = searchParams.get("error_description");
//   const insta_base_url = "https://api.instagram.com/oauth/access_token"


  const GetShortAccessToken  = async ()  =>{
    SetLoding("GetingAccessToken")
    const client_id = process.env.CLIENT_ID
    const client_secret = process.env.CLIENT_SECRET
    const grant_type = "authorization_code"
    const redirect_uri  = process.env.REDIRECT_URL
    
    const short_access_token = await fetch(`https://api.instagram.com/oauth/access_token?client_id =${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&redirect_uri=${redirect_uri}&code=${code}`)
        .then(
            (res) => res.json(),
        )
    //pushed the Short AccessToken to database 
    await connectDb()
    const user = await currentUser();
    const enuser = await ENuser.findOne({ userId: user?.id! });
    if (enuser){
        // pushing short_access_token to DB
        const short_access_tokenpush = await ENuser.updateOne({ userId: user?.id! }, { $set: {short_insta_access_token: short_access_token?.data.access_token, short_insta_user_id: short_access_token?.data.user_id, user_insta_permissions: short_access_token?.data.permissions}})
        console.log( "insta code pushed to DB: "+ short_access_tokenpush)
    }else {
        console.log( "something error in instagram-login 45line ")
    }
    return short_access_token
  }

  const pushCodeDB = async () => {
    await connectDb()
    const user = await currentUser();
    const enuser = await ENuser.findOne({ userId: user?.id! });
    if (enuser){
        // adding code to DB 
        const codepush = await ENuser.updateOne( { userId: user?.id! }, { $set: {short_insta_code: code}})
        return "insta code pushed to DB: "+ codepush
    }else {
        return "something error in instagram-login 50line "
    }
  }

  await connectDb()
  const user = await currentUser();
//   const enuser = await ENuser.findOne({ userId: user?.id! });
  if (codeHas) {
    await pushCodeDB()
    // console.log(codepush)
    const ShortAccessToken = await GetShortAccessToken()
    // console.log(ShortAccessToken)
    if (ShortAccessToken.data){
        const client_secret = process.env.CLIENT_SECRET
        const LongAccessToken = await GetLongAccessToken(ShortAccessToken.data.access_token, client_secret!)
        if (LongAccessToken){ 
            SetLoding("got the AccessToken") 
            toast({
                description: "got the AccessToken",
            })
            router.push("/dashboard")
        }
        else { 
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
                action: <ToastAction onClick={ () => router.push("/set-up")} altText="Try again">Try again</ToastAction>,
            })
        }
    }else {
        SetLoding(`error_type: ${ShortAccessToken.error_type} "<br>"Error Code: ${ShortAccessToken.code} "<br>" error_message: ${ShortAccessToken.error_message}`)
        toast({
            variant: "destructive",
            title: `Uh oh! Something went wrong. Error Code: ${ShortAccessToken.code}`,
            description: `Error Message: ${ShortAccessToken.error_message}`,
            action: <ToastAction onClick={ () => GetShortAccessToken() } altText="Try again">Try again</ToastAction>,
        })
    }
  }else{
    toast({
        variant: "destructive",
        title: `Uh oh! No Code: Something went wrong. Error: ${error}`,
        description: `Error Description: ${error_description} || Error Reason :${error_reason}`,
        action: <ToastAction onClick={ () => router.push("/set-up")} altText="Try again">Try again</ToastAction>,
    })
    // SetLoding(`error: ${error} "<br>" error_description: ${error_description} "<br>" error_reason :${error_reason}`)
  }

  return (
    <div className='h-[100vh] w-full px-10'>
        <div className="w-full m-auto h-full py-20 space-y-10">
            <Card className='sm:w-[50%] m-auto'>
                <CardHeader className='flex flex-row gap-4 justify-center items-center'>
                    <div className="flex flex-col justify-center items-center space-y-2">
                        <CardTitle>{Loading}</CardTitle>
                        <CardDescription>
                            <div role="status">
                                <svg aria-hidden="true" className="w-full h-20 text-center text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">{Loading}</span>
                            </div>
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
        
    </div>
  );
}