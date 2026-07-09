import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ apiVersion: "2015-10-07" });

export const handler = async (event) => {
  console.log(JSON.stringify(event));

  const trailDashboardUrl = `https://${event.detail.awsRegion}.console.aws.amazon.com/cloudtrailv2/home?region=${event.detail.awsRegion}#/events?EventId=${event.detail.eventID}`;

  const deepLinkRoleName = "AdministratorAccess";
  const urlEncodedTrailDashboardUrl = encodeURIComponent(trailDashboardUrl);
  const deepTrailDashboardUrl = `https://aws.prx.tech/#/console?account_id=${event.account}&role_name=${deepLinkRoleName}&destination=${urlEncodedTrailDashboardUrl}`;

  await eventbridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: "org.prx.cloudtrail-toolkit",
          DetailType: "Slack Message Relay Message Payload",
          Detail: JSON.stringify({
            channel: "G2QH6NMEH", // #ops-error
            username: "AWS CloudTrail",
            icon_emoji: ":ops-cloudtrail:",
            blocks: [
              {
                type: "container",
                width: "full",
                title: {
                  type: "plain_text",
                  text: `Event detected: ${event["detail-type"]}`,
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
                        `*<https://ip.me/ip/${event.detail.sourceIPAddress}|IP Address>:* \`<https://ip.me/ip/${event.detail.sourceIPAddress}|${event.detail.sourceIPAddress}>\``,
                        `*Identity ARN:* \`${event.detail.userIdentity.arn}\``,
                        "\n",
                        `*<${deepTrailDashboardUrl}|Event ID>:* \`<${deepTrailDashboardUrl}|${event.detail.eventID}>\``,
                        `*Request ID:* \`${event.detail.requestID}\``,
                        "\n",
                        "*User Agent:*",
                      ].join("\n"),
                    },
                  },
                  {
                    type: "rich_text",
                    elements: [
                      {
                        type: "rich_text_preformatted",
                        elements: [
                          {
                            type: "text",
                            text: event.detail.userAgent,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        },
      ],
    }),
  );
};
