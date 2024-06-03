const AWS = require('aws-sdk');
const SES = new AWS.SES();

exports.handler = async (event) => {
    const email = JSON.parse(event.body).email;
    const params = {
        Destination: {
            ToAddresses: [process.env.SES_EMAIL]
        },
        Message: {
            Body: {
                Text: { Data: `You have a new message from: ${email}` }
            },
            Subject: { Data: 'New Contact Form Submission' }
        },
        Source: process.env.SES_EMAIL
    };

    try {
        await SES.sendEmail(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
