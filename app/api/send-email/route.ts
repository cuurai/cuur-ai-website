// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

const ses = new AWS.SES();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;
    console.log("Received email:", email);

    const params = {
      Source: "info@cuur.ai", // Replace with your verified SES email address
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Waitlist Confirmation",
        },
        Body: {
          Text: {
            Data: "You have been added to the waitlist! You will be notified when the platform goes live.",
          },
          Html: {
            Data: "<p>You have been added to the waitlist! You will be notified when the platform goes live.</p>",
          },
        },
      },
    };

    try {
      console.log("Sending email to:", email);
      const result = await ses.sendEmail(params).promise();
      console.log("Email sent successfully:", result);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Failed to process request", error: error.message },
      { status: 500 }
    );
  }
}
