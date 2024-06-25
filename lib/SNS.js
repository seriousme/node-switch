import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import Debug from "debug";

const debug = Debug("triggerSNS");
// debug.enabled = true;

class SNS {
	constructor() {
		this.snsClient = new SNSClient();
	}

	async publish(TopicArn, Message) {
		const publication = {
			Subject: "HomeSwitch notification message",
			Message,
			TopicArn,
		};
		debug({ publication });
		const response = await this.snsClient.send(new PublishCommand(publication));
		debug({ response });
	}
}

export const sns = new SNS();
