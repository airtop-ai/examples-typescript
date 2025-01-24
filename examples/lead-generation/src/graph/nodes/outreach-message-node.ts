import type { Therapist, TherapistState } from "@/graph/state";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OpenAI } from "@langchain/openai";
import { getLogger } from "@local/utils";

const openAiClientsMap = new Map<string, OpenAI>();

/**
 * Get an OpenAI instance using a cache pattern with API key as the unique identifier.
 * @param apiKey - The API key for OpenAI.
 * @returns An instance of OpenAI.
 */
const getOpenaiClient = (apiKey: string): OpenAI => {
  if (!openAiClientsMap.has(apiKey)) {
    openAiClientsMap.set(
      apiKey,
      new OpenAI({
        apiKey,
      }),
    );
  }
  return openAiClientsMap.get(apiKey)!;
};

// Optional: Cleanup function to remove unused clients
export const removeOpenAiClient = (apiKey: string): void => {
  openAiClientsMap.delete(apiKey);
};

const outreachMessagePrompt = (therapist: Therapist) => {
  return `
Generate a small outreach message for the following therapist:
${therapist.name}

Use the following information to generate the message:
${therapist.summary}

The message should be a small message that is 100 words or less.
The goal of the message is to connect with the therapist to sell them an app that serves as a 
companion for their practice.

Return the message in the following JSON format:
{{
    "message": "The outreach message for the therapist",
    "error": "If you cannot fulfill the request, use this field to report the problem."
}}
    `;
};

/**
 * Adds an outreach message to each therapist using OpenAI's Langchain Tool
 * @param therapist - The therapist to add the outreach message to.
 * @returns The updated therapist with the outreach message.
 */
const addMessageToTherapist = async (therapist: Therapist): Promise<Therapist> => {
  const openai = getOpenaiClient(process.env.OPENAI_API_KEY!);

  const result = await openai.invoke([
    new SystemMessage("You are an AI assistant that generates outreach messages for therapists."),
    new HumanMessage(outreachMessagePrompt(therapist)),
  ]);

  const parsedMessage = JSON.parse(result);

  if (parsedMessage.message) {
    return {
      ...therapist,
      outreachMessage: parsedMessage.message,
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
export const outreachMessageNode = async (state: TherapistState) => {
  const log = getLogger().withPrefix("[outreachMessageNode]");
  log.debug("Adding outreach messages to therapists");

  const therapistsWithOutreachMessage = await Promise.all(state.therapists.map(addMessageToTherapist));

  return {
    ...state,
    therapists: therapistsWithOutreachMessage,
  };
};
