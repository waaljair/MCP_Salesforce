#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { SalesforceClient } from "./salesforce-client.js";

const server = new Server(
  {
    name: "mcp-salesforce",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let salesforceClient: SalesforceClient;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_accounts",
        description: "Search for Salesforce accounts by name, industry, or other criteria",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for account name or other fields",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "search_contacts",
        description: "Search for Salesforce contacts by name, email, or other criteria",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for contact name, email, or other fields",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "search_opportunities",
        description: "Search for Salesforce opportunities by name, stage, or other criteria",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for opportunity name, stage, or other fields",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "search_leads",
        description: "Search for Salesforce leads by name, company, or other criteria",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for lead name, company, or other fields",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_account_details",
        description: "Get detailed information about a specific Salesforce account",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "The Salesforce Account ID",
            },
          },
          required: ["accountId"],
        },
      },
      {
        name: "get_contact_details",
        description: "Get detailed information about a specific Salesforce contact",
        inputSchema: {
          type: "object",
          properties: {
            contactId: {
              type: "string",
              description: "The Salesforce Contact ID",
            },
          },
          required: ["contactId"],
        },
      },
      {
        name: "get_opportunity_details",
        description: "Get detailed information about a specific Salesforce opportunity",
        inputSchema: {
          type: "object",
          properties: {
            opportunityId: {
              type: "string",
              description: "The Salesforce Opportunity ID",
            },
          },
          required: ["opportunityId"],
        },
      },
      {
        name: "update_account",
        description: "Update a Salesforce account with new information",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "The Salesforce Account ID",
            },
            updates: {
              type: "object",
              description: "Fields to update on the account",
              properties: {
                Name: { type: "string" },
                Industry: { type: "string" },
                Phone: { type: "string" },
                Website: { type: "string" },
                Description: { type: "string" },
              },
            },
          },
          required: ["accountId", "updates"],
        },
      },
      {
        name: "update_contact",
        description: "Update a Salesforce contact with new information",
        inputSchema: {
          type: "object",
          properties: {
            contactId: {
              type: "string",
              description: "The Salesforce Contact ID",
            },
            updates: {
              type: "object",
              description: "Fields to update on the contact",
              properties: {
                FirstName: { type: "string" },
                LastName: { type: "string" },
                Email: { type: "string" },
                Phone: { type: "string" },
                Title: { type: "string" },
                Department: { type: "string" },
              },
            },
          },
          required: ["contactId", "updates"],
        },
      },
      {
        name: "update_opportunity",
        description: "Update a Salesforce opportunity with new information",
        inputSchema: {
          type: "object",
          properties: {
            opportunityId: {
              type: "string",
              description: "The Salesforce Opportunity ID",
            },
            updates: {
              type: "object",
              description: "Fields to update on the opportunity",
              properties: {
                Name: { type: "string" },
                StageName: { type: "string" },
                Amount: { type: "number" },
                CloseDate: { type: "string" },
                Description: { type: "string" },
                Probability: { type: "number" },
              },
            },
          },
          required: ["opportunityId", "updates"],
        },
      },
      {
        name: "get_recent_activities",
        description: "Get recent activities (tasks, events, calls) for an account or contact",
        inputSchema: {
          type: "object",
          properties: {
            recordId: {
              type: "string",
              description: "The Salesforce Record ID (Account, Contact, or Opportunity)",
            },
            limit: {
              type: "number",
              description: "Maximum number of activities to return (default: 10)",
              default: 10,
            },
          },
          required: ["recordId"],
        },
      },
      {
        name: "create_task",
        description: "Create a new task in Salesforce",
        inputSchema: {
          type: "object",
          properties: {
            subject: {
              type: "string",
              description: "Task subject/title",
            },
            description: {
              type: "string",
              description: "Task description",
            },
            whoId: {
              type: "string",
              description: "Contact or Lead ID this task is related to",
            },
            whatId: {
              type: "string",
              description: "Account, Opportunity, or other record ID this task is related to",
            },
            dueDate: {
              type: "string",
              description: "Due date in YYYY-MM-DD format",
            },
            priority: {
              type: "string",
              description: "Task priority (High, Normal, Low)",
              enum: ["High", "Normal", "Low"],
            },
          },
          required: ["subject"],
        },
      },
      {
        name: "create_account",
        description: "Create a new Salesforce account",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Account name (required)",
            },
            industry: {
              type: "string",
              description: "Account industry",
            },
            phone: {
              type: "string",
              description: "Account phone number",
            },
            website: {
              type: "string",
              description: "Account website URL",
            },
            billingStreet: {
              type: "string",
              description: "Billing street address",
            },
            billingCity: {
              type: "string",
              description: "Billing city",
            },
            billingState: {
              type: "string",
              description: "Billing state/province",
            },
            billingPostalCode: {
              type: "string",
              description: "Billing postal code",
            },
            billingCountry: {
              type: "string",
              description: "Billing country",
            },
            description: {
              type: "string",
              description: "Account description",
            },
            numberOfEmployees: {
              type: "number",
              description: "Number of employees",
            },
            annualRevenue: {
              type: "number",
              description: "Annual revenue",
            },
            type: {
              type: "string",
              description: "Account type (e.g., Customer, Partner, Prospect)",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "create_contact",
        description: "Create a new Salesforce contact",
        inputSchema: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
              description: "Contact first name",
            },
            lastName: {
              type: "string",
              description: "Contact last name (required)",
            },
            email: {
              type: "string",
              description: "Contact email address",
            },
            phone: {
              type: "string",
              description: "Contact phone number",
            },
            title: {
              type: "string",
              description: "Contact job title",
            },
            department: {
              type: "string",
              description: "Contact department",
            },
            accountId: {
              type: "string",
              description: "Associated account ID",
            },
            mailingStreet: {
              type: "string",
              description: "Mailing street address",
            },
            mailingCity: {
              type: "string",
              description: "Mailing city",
            },
            mailingState: {
              type: "string",
              description: "Mailing state/province",
            },
            mailingPostalCode: {
              type: "string",
              description: "Mailing postal code",
            },
            mailingCountry: {
              type: "string",
              description: "Mailing country",
            },
            description: {
              type: "string",
              description: "Contact description",
            },
          },
          required: ["lastName"],
        },
      },
      {
        name: "create_opportunity",
        description: "Create a new Salesforce opportunity",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Opportunity name (required)",
            },
            accountId: {
              type: "string",
              description: "Associated account ID (required)",
            },
            stageName: {
              type: "string",
              description: "Opportunity stage (required)",
            },
            closeDate: {
              type: "string",
              description: "Close date in YYYY-MM-DD format (required)",
            },
            amount: {
              type: "number",
              description: "Opportunity amount",
            },
            probability: {
              type: "number",
              description: "Probability percentage (0-100)",
            },
            type: {
              type: "string",
              description: "Opportunity type (e.g., New Business, Existing Business)",
            },
            description: {
              type: "string",
              description: "Opportunity description",
            },
            leadSource: {
              type: "string",
              description: "Lead source",
            },
            nextStep: {
              type: "string",
              description: "Next step in the sales process",
            },
          },
          required: ["name", "accountId", "stageName", "closeDate"],
        },
      },
      {
        name: "search_all_records",
        description: "Search across all Salesforce records using SOSL (global search)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query to find across all records",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 20)",
              default: 20,
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!salesforceClient) {
      salesforceClient = new SalesforceClient();
      await salesforceClient.connect();
    }

    if (!args) {
      throw new McpError(ErrorCode.InvalidParams, "Missing arguments");
    }

    const typedArgs = args as any;

    switch (name) {
      case "search_accounts":
        return await salesforceClient.searchAccounts(typedArgs.query, typedArgs.limit);

      case "search_contacts":
        return await salesforceClient.searchContacts(typedArgs.query, typedArgs.limit);

      case "search_opportunities":
        return await salesforceClient.searchOpportunities(typedArgs.query, typedArgs.limit);

      case "search_leads":
        return await salesforceClient.searchLeads(typedArgs.query, typedArgs.limit);

      case "get_account_details":
        return await salesforceClient.getAccountDetails(typedArgs.accountId);

      case "get_contact_details":
        return await salesforceClient.getContactDetails(typedArgs.contactId);

      case "get_opportunity_details":
        return await salesforceClient.getOpportunityDetails(typedArgs.opportunityId);

      case "update_account":
        return await salesforceClient.updateAccount(typedArgs.accountId, typedArgs.updates);

      case "update_contact":
        return await salesforceClient.updateContact(typedArgs.contactId, typedArgs.updates);

      case "update_opportunity":
        return await salesforceClient.updateOpportunity(typedArgs.opportunityId, typedArgs.updates);

      case "get_recent_activities":
        return await salesforceClient.getRecentActivities(typedArgs.recordId, typedArgs.limit);

      case "create_task":
        return await salesforceClient.createTask(typedArgs);

      case "create_account":
        return await salesforceClient.createAccount(typedArgs);

      case "create_contact":
        return await salesforceClient.createContact(typedArgs);

      case "create_opportunity":
        return await salesforceClient.createOpportunity(typedArgs);

      case "search_all_records":
        return await salesforceClient.searchAllRecords(typedArgs.query, typedArgs.limit);

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing ${name}: ${errorMessage}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Salesforce server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});