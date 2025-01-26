import type { ConfigurableAnnotation, StateAnnotation, Therapist } from "@/graph/state";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { OpenAI } from "@langchain/openai";
import { getLogger } from "@local/utils";

const openAiClientsMap = new Map<string, OpenAI>();

/**
 * Get an OpenAI instance using a cache pattern with API key as the unique identifier.
 * @param apiKey - The API key for OpenAI.
 * @returns An instance of OpenAI.
 */
export const getOpenAiClient = (apiKey: string): OpenAI => {
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

const responseSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "The outreach message for the therapist",
      maxLength: 500, // Ensuring it stays relatively brief
    },
    error: {
      type: "string",
      description: "Error message if the request cannot be fulfilled",
    },
  },
  required: ["message"],
  additionalProperties: false,
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

Your response must conform to this JSON schema:
${JSON.stringify(responseSchema, null, 2)}

Ensure your response is valid JSON and matches the schema exactly.
`;
};

/**
 * Adds an outreach message to each therapist using OpenAI's Langchain Tool
 * @param therapist - The therapist to add the outreach message to.
 * @returns The updated therapist with the outreach message.
 */
const addMessageToTherapist = async (therapist: Therapist, openAiClient: OpenAI): Promise<Therapist> => {
  const result = await openAiClient.invoke([
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
