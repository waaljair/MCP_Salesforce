import jsforce from "jsforce";

export class SalesforceClient {
  private conn: any;

  constructor() {
    const loginUrl = process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com";
    this.conn = new jsforce.Connection({
      loginUrl,
    });
  }

  async connect(): Promise<void> {
    const username = process.env.SALESFORCE_USERNAME;
    const password = process.env.SALESFORCE_PASSWORD;
    const securityToken = process.env.SALESFORCE_SECURITY_TOKEN;

    if (!username || !password) {
      throw new Error("SALESFORCE_USERNAME and SALESFORCE_PASSWORD must be set");
    }

    try {
      const passwordWithToken = securityToken ? `${password}${securityToken}` : password;
      await this.conn.login(username, passwordWithToken);
      console.error("Successfully connected to Salesforce");
    } catch (error) {
      throw new Error(`Failed to connect to Salesforce: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchAccounts(query: string, limit: number = 10) {
    try {
      const soqlQuery = `
        SELECT Id, Name, Industry, Phone, Website, BillingCity, BillingState, BillingCountry, 
               Type, Description, NumberOfEmployees, AnnualRevenue, CreatedDate
        FROM Account 
        WHERE Name LIKE '%${query}%' 
           OR Industry LIKE '%${query}%' 
           OR BillingCity LIKE '%${query}%'
           OR Type LIKE '%${query}%'
        ORDER BY Name
        LIMIT ${limit}
      `;

      const result = await this.conn.query(soqlQuery);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalSize: result.totalSize,
              records: result.records,
              message: `Found ${result.totalSize} accounts matching "${query}"`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to search accounts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchContacts(query: string, limit: number = 10) {
    try {
      const soqlQuery = `
        SELECT Id, FirstName, LastName, Email, Phone, Title, Department, AccountId, Account.Name,
               MailingCity, MailingState, MailingCountry, CreatedDate
        FROM Contact 
        WHERE FirstName LIKE '%${query}%' 
           OR LastName LIKE '%${query}%' 
           OR Email LIKE '%${query}%'
           OR Title LIKE '%${query}%'
           OR Department LIKE '%${query}%'
           OR Account.Name LIKE '%${query}%'
        ORDER BY LastName, FirstName
        LIMIT ${limit}
      `;

      const result = await this.conn.query(soqlQuery);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalSize: result.totalSize,
              records: result.records,
              message: `Found ${result.totalSize} contacts matching "${query}"`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to search contacts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchOpportunities(query: string, limit: number = 10) {
    try {
      const soqlQuery = `
        SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, Account.Name,
               Type, Description, ForecastCategoryName, CreatedDate
        FROM Opportunity 
        WHERE Name LIKE '%${query}%' 
           OR StageName LIKE '%${query}%' 
           OR Account.Name LIKE '%${query}%'
           OR Type LIKE '%${query}%'
        ORDER BY CloseDate DESC
        LIMIT ${limit}
      `;

      const result = await this.conn.query(soqlQuery);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalSize: result.totalSize,
              records: result.records,
              message: `Found ${result.totalSize} opportunities matching "${query}"`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to search opportunities: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchLeads(query: string, limit: number = 10) {
    try {
      const soqlQuery = `
        SELECT Id, FirstName, LastName, Email, Phone, Title, Company, Status, LeadSource,
               City, State, Country, Industry, CreatedDate
        FROM Lead 
        WHERE FirstName LIKE '%${query}%' 
           OR LastName LIKE '%${query}%' 
           OR Email LIKE '%${query}%'
           OR Company LIKE '%${query}%'
           OR Title LIKE '%${query}%'
           OR Industry LIKE '%${query}%'
        ORDER BY CreatedDate DESC
        LIMIT ${limit}
      `;

      const result = await this.conn.query(soqlQuery);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalSize: result.totalSize,
              records: result.records,
              message: `Found ${result.totalSize} leads matching "${query}"`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to search leads: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAccountDetails(accountId: string) {
    try {
      const soqlQuery = `
        SELECT Id, Name, Industry, Phone, Website, BillingStreet, BillingCity, BillingState, 
               BillingPostalCode, BillingCountry, Type, Description, NumberOfEmployees, 
               AnnualRevenue, CreatedDate, LastModifiedDate, OwnerId, Owner.Name
        FROM Account 
        WHERE Id = '${accountId}'
      `;

      const result = await this.conn.query(soqlQuery);
      
      if (result.totalSize === 0) {
        throw new Error(`Account with ID ${accountId} not found`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              account: result.records[0],
              message: `Account details for ${result.records[0].Name}`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get account details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getContactDetails(contactId: string) {
    try {
      const soqlQuery = `
        SELECT Id, FirstName, LastName, Email, Phone, Title, Department, AccountId, Account.Name,
               MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry,
               CreatedDate, LastModifiedDate, OwnerId, Owner.Name, Description
        FROM Contact 
        WHERE Id = '${contactId}'
      `;

      const result = await this.conn.query(soqlQuery);
      
      if (result.totalSize === 0) {
        throw new Error(`Contact with ID ${contactId} not found`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              contact: result.records[0],
              message: `Contact details for ${result.records[0].FirstName} ${result.records[0].LastName}`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get contact details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getOpportunityDetails(opportunityId: string) {
    try {
      const soqlQuery = `
        SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, Account.Name,
               Type, Description, ForecastCategoryName, CreatedDate, LastModifiedDate, 
               OwnerId, Owner.Name, LeadSource, NextStep
        FROM Opportunity 
        WHERE Id = '${opportunityId}'
      `;

      const result = await this.conn.query(soqlQuery);
      
      if (result.totalSize === 0) {
        throw new Error(`Opportunity with ID ${opportunityId} not found`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              opportunity: result.records[0],
              message: `Opportunity details for ${result.records[0].Name}`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get opportunity details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateAccount(accountId: string, updates: any) {
    try {
      const result = await this.conn.sobject("Account").update({
        Id: accountId,
        ...updates
      });

      const resultArray = Array.isArray(result) ? result : [result];
      const firstResult = resultArray[0];

      if (!firstResult.success) {
        throw new Error(`Failed to update account: ${firstResult.errors?.join(", ")}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              id: firstResult.id,
              message: `Account ${accountId} updated successfully`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to update account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateContact(contactId: string, updates: any) {
    try {
      const result = await this.conn.sobject("Contact").update({
        Id: contactId,
        ...updates
      });

      const resultArray = Array.isArray(result) ? result : [result];
      const firstResult = resultArray[0];

      if (!firstResult.success) {
        throw new Error(`Failed to update contact: ${firstResult.errors?.join(", ")}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              id: firstResult.id,
              message: `Contact ${contactId} updated successfully`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to update contact: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateOpportunity(opportunityId: string, updates: any) {
    try {
      const result = await this.conn.sobject("Opportunity").update({
        Id: opportunityId,
        ...updates
      });

      const resultArray = Array.isArray(result) ? result : [result];
      const firstResult = resultArray[0];

      if (!firstResult.success) {
        throw new Error(`Failed to update opportunity: ${firstResult.errors?.join(", ")}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              id: firstResult.id,
              message: `Opportunity ${opportunityId} updated successfully`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to update opportunity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRecentActivities(recordId: string, limit: number = 10) {
    try {
      const taskQuery = `
        SELECT Id, Subject, Description, Status, Priority, ActivityDate, WhoId, WhatId, 
               Who.Name, What.Name, CreatedDate, Type
        FROM Task 
        WHERE WhatId = '${recordId}' OR WhoId = '${recordId}'
        ORDER BY CreatedDate DESC
        LIMIT ${limit}
      `;

      const eventQuery = `
        SELECT Id, Subject, Description, StartDateTime, EndDateTime, WhoId, WhatId,
               Who.Name, What.Name, CreatedDate, Type
        FROM Event 
        WHERE WhatId = '${recordId}' OR WhoId = '${recordId}'
        ORDER BY CreatedDate DESC
        LIMIT ${limit}
      `;

      const [tasks, events] = await Promise.all([
        this.conn.query(taskQuery),
        this.conn.query(eventQuery)
      ]);

      const activities = [
        ...tasks.records.map((task: any) => ({ ...task, ActivityType: 'Task' })),
        ...events.records.map((event: any) => ({ ...event, ActivityType: 'Event' }))
      ].sort((a: any, b: any) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime())
       .slice(0, limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalActivities: activities.length,
              activities: activities,
              message: `Found ${activities.length} recent activities for record ${recordId}`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get recent activities: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createTask(taskData: any) {
    try {
      const task = {
        Subject: taskData.subject,
        Description: taskData.description,
        WhoId: taskData.whoId,
        WhatId: taskData.whatId,
        ActivityDate: taskData.dueDate,
        Priority: taskData.priority || 'Normal',
        Status: 'Not Started'
      };

      const result = await this.conn.sobject("Task").create(task);

      const resultArray = Array.isArray(result) ? result : [result];
      const firstResult = resultArray[0];

      if (!firstResult.success) {
        throw new Error(`Failed to create task: ${firstResult.errors?.join(", ")}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              id: firstResult.id,
              message: `Task "${taskData.subject}" created successfully`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchAllRecords(query: string, limit: number = 20) {
    try {
      const soslQuery = `
        FIND {${query}} IN ALL FIELDS 
        RETURNING Account(Id, Name, Industry, Phone), 
                 Contact(Id, FirstName, LastName, Email, Phone, Account.Name), 
                 Opportunity(Id, Name, StageName, Amount, CloseDate, Account.Name),
                 Lead(Id, FirstName, LastName, Email, Company, Status)
        LIMIT ${limit}
      `;

      const result = await this.conn.search(soslQuery);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              searchResults: result,
              message: `Global search results for "${query}"`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to search all records: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}