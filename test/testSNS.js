import ConfigJson from "../.config.json" with { type: "json" };
import { sns } from "../lib/SNS.js";

const TopicArn = ConfigJson.SNS.TopicArn;
sns.publish(TopicArn, "This is a test message");
