import React from 'react'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Facebook, Instagram } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server';
import { connectDb } from '@/lib/db';
import ENuser from '../models/ENuser-model';
import { addStripe } from '../stripe/actions/add-stripe';
  

export default async function SetUp() {
    const user = await currentUser();
    await connectDb();
    const enuser = await ENuser.findOne({ userId: user?.id! });
    if (enuser) {
        return;
    } else{
       await addStripe();
    //    console.log("stripe.customers creted, user added to DB")
    }
    //create stripe user and push user data to DB
    // console.log(user)
  return (
    <div className='h-[100vh] w-full px-10'>
        <div className="w-full m-auto h-full py-20 space-y-10">
            <h2 className='text-2xl text-center font-bold'>Set-Up Your Account</h2>
            {connections.map((connect, idx) => (
                <Card key={idx} className='sm:w-[50%] m-auto'>
                    <CardHeader className='flex sm:flex-row gap-4 items-center'>
                        {connect.icon}
                        <div className="flex flex-col space-y-2">
                            <CardTitle>{connect.name}</CardTitle>
                            <CardDescription>{connect.description}</CardDescription>
                        </div>
                        {/* <Link href={connect.link}>
                            <button className="px-8 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200">
                                Connect
                            </button>
                        </Link> */}
                    </CardHeader>
                </Card>
            ))}
            {/* <Card className='w-[50%] m-auto'>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card> */}
        </div>
    </div>
  )
}


const connections = [
    {
        name: "Instagram",
        icon: <Instagram />,
        description: "Instagram description",
        link: "https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=506293768669540&redirect_uri=https://test-insta-omega.vercel.app/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish",
    },
    {
        name: "Facebook",
        icon: <Facebook />,
        description: "Instagram description",
        link: "https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=506293768669540&redirect_uri=https://test-insta-omega.vercel.app/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish",
    },
]