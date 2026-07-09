import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ apiVersion: "2015-10-07" });

export const handler = async (event) => {
  console.log(JSON.stringify(event));

  await eventbridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: "org.prx.cloudtrail-toolkit",
          DetailType: "Slack Message Relay Message Payload",
          Detail: JSON.stringify({
            channel: "G2QH13X62", // #ops-fatal
            username: "AWS CloudTrail",
            icon_emoji: ":ops-cloudtrail:",
            blocks: [
              {
                type: "container",
                width: "full",
                title: {
                  type: "plain_text",
                  text: `Root account event detected: ${event["detail-type"]}`
                },
                child_blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: [
                        `*Event Time:* \`${event.detail.eventTime}\``,
                        `*Account:* \`${event.account}\` | \`${event.detail.awsRegion}\``,
                        "\n",
                        `*AWS Service:* \`${event.detail.eventSource}\``,
                        `*API Action:* \`${event.detail.eventName}\``,
                        "\n",
                        `*IP Address:* \`<https://ip.me/ip/${event.detail.sourceIPAddress}|${event.detail.sourceIPAddress}>\``,
                        `*Identity ARN:* \`${event.detail.userIdentity.arn}\``,
                        "\n",
                        `*Event ID:* \`${event.detail.eventID}\``,
                        `*Request ID:* \`${event.detail.requestID}\``,
                        "\n",
                        "*User Agent:*"
                      ].join("\n")
                    }
                  },
                  {
                    type: "rich_text",
                    elements: [
                      {
                        type: "rich_text_preformatted",
                        elements: [
                          {
                            type: "text",
                            text: event.detail.userAgent
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }),
        },
      ],
    }),
  );
};
