import { sns } from "../lib/SNS.js";
import ConfigJson from "../.config.json" with { type: "json" };

const TopicArn = ConfigJson.SNS.TopicArn;
sns.publish(TopicArn, "This is a test message");
