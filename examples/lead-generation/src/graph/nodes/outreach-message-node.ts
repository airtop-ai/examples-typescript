import type { ConfigurableAnnotation, StateAnnotation, Therapist } from "@/graph/state";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { ChatOpenAI } from "@langchain/openai";
import { getLogger } from "@local/utils";
import { z } from "zod";

const responseSchema = z.object({
  message: z.string().describe("The outreach message for the therapist"),
  error: z.string().optional().describe("Error message if the request cannot be fulfilled"),
});

const outreachMessagePrompt = (therapist: Therapist) => {
  return `
Generate a small outreach message for the following therapist:
${therapist.name}

Use the following information to generate the message:
${therapist.summary}

The message should be a small message that is 100 words or less.
The goal of the message is to connect with the therapist to sell them an app that serves as a 
companion for their practice.
`;
};

/**
 * Adds an outreach message to each therapist using OpenAI's Langchain Tool
 * @param therapist - The therapist to add the outreach message to.
 * @returns The updated therapist with the outreach message.
 */
const addMessageToTherapist = async (therapist: Therapist, openAiClient: ChatOpenAI): Promise<Therapist> => {
  const result = await openAiClient
    .withStructuredOutput(responseSchema)!
    .invoke([
      new SystemMessage("You are an AI assistant that generates outreach messages for therapists."),
      new HumanMessage(outreachMessagePrompt(therapist)),
    ]);

  if (result.message) {
    return {
      ...therapist,
      outreachMessage: result.message,
    };
  }

  return therapist;
};

// Name of the outreach message node
export const OUTREACH_MESSAGE_NODE_NAME = "outreach-message-node";

/**
 * Node that adds an outreach message to each therapist using OpenAI's Langchain Tool
 * @param state - The state of the therapist node.
 * @returns The updated state of the therapist node with the outreach messages.
 */
export const outreachMessageNode = async (
  state: typeof StateAnnotation.State,
  config: RunnableConfig<typeof ConfigurableAnnotation.State>,
) => {
  const log = getLogger().withPrefix("[outreachMessageNode]");
  log.debug("Adding outreach messages to therapists");

  const openAiClient = config.configurable?.openAiClient!;

  const therapistsWithOutreachMessage = await Promise.all(
    state.therapists.map((therapist) => addMessageToTherapist(therapist, openAiClient)),
  );

  return {
    ...state,
    therapists: therapistsWithOutreachMessage,
  };
};
