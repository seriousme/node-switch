import { sns } from "../lib/SNS.js";
import { ConfigJson } from "../lib/config.js";

const TopicArn = ConfigJson.SNS.TopicArn;
sns.publish(TopicArn, "This is a test message");
