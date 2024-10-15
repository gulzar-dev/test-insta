"use server"
import userlogs from "@/app/models/logs-model";
import { connectDb } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";


export const CreateLogs = async (stripecustomerid: any , eventType: any, eventData: any) =>  {
    try {

        await connectDb();

        const user = await currentUser();
        const now = new Date().toLocaleString()
        await connectDb();

        await userlogs.create({
            createdAt: now,
            userId: user?.id!,
            stripeCustomerId: stripecustomerid,
            firstName: user?.firstName,
            lastName: user?.lastName,
            eventType: eventType,
            eventData: eventData,
        // do changes here for plan name and Credits changes 
        })
        
    } catch (error) {
        console.log("creating logs Error" , error)
    }
  
}
