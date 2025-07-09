# MCP Salesforce Server

A Model Context Protocol (MCP) server for Salesforce integration, designed for sales, marketing, and C-suite teams to seamlessly search, view, and update Salesforce records through Claude.

## Features

- **Search Functionality**: Search across Accounts, Contacts, Opportunities, and Leads
- **Record Management**: View detailed information and update records
- **Activity Management**: Track recent activities and create new tasks
- **Global Search**: Search across all Salesforce records simultaneously
- **Executive Dashboard**: Access key metrics and data for decision-making

## Prerequisites

- Node.js 18.0.0 or higher
- A Salesforce account with API access
- Connected App configured in Salesforce (see setup instructions below)

## Salesforce Setup

### 1. Create a Connected App

1. Log into your Salesforce org
2. Go to **Setup** → **App Manager**
3. Click **New Connected App**
4. Fill in the basic information:
   - **Connected App Name**: MCP Salesforce Integration
   - **API Name**: MCP_Salesforce_Integration
   - **Contact Email**: Your email address
5. Enable OAuth Settings:
   - Check **Enable OAuth Settings**
   - **Callback URL**: `https://login.salesforce.com/services/oauth2/success`
   - **Selected OAuth Scopes**: Add these scopes:
     - Access and manage your data (api)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
     - Access your basic information (id, profile, email, address, phone)
6. Click **Save**
7. Wait for the Connected App to be created (may take 2-10 minutes)

### 2. Get Your Credentials

After creating the Connected App:

1. Go to **Setup** → **App Manager**
2. Find your Connected App and click **View**
3. Copy the **Consumer Key** (this is your `CLIENT_ID`)
4. Copy the **Consumer Secret** (this is your `CLIENT_SECRET`)

### 3. Get Your Security Token

1. Go to your personal settings by clicking your profile picture → **Settings**
2. In the left sidebar, click **Reset My Security Token**
3. Click **Reset Security Token**
4. Check your email for the security token

### 4. Test Your Credentials

You can test your credentials using the Salesforce login:
- **Username**: Your Salesforce username (usually your email)
- **Password**: Your Salesforce password
- **Security Token**: The token you received via email

## Installation and Usage

### Option 1: Using npx (Recommended)

1. Configure your Claude Desktop `mcp_settings.json` file:

```json
{
  "mcpServers": {
    "MCP_Salesforce": {
      "command": "npx",
      "args": ["github:waaljair/MCP_Salesforce"],
      "env": {
        "SALESFORCE_LOGIN_URL": "https://login.salesforce.com",
        "SALESFORCE_CLIENT_ID": "your_consumer_key_here",
        "SALESFORCE_CLIENT_SECRET": "your_consumer_secret_here",
        "SALESFORCE_USERNAME": "your_salesforce_username",
        "SALESFORCE_PASSWORD": "your_salesforce_password",
        "SALESFORCE_SECURITY_TOKEN": "your_security_token_here"
      }
    }
  }
}
```

2. Restart Claude Desktop

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/waaljair/MCP_Salesforce.git
cd MCP_Salesforce
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure your environment variables (create a `.env` file):
```env
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_SECURITY_TOKEN=your_security_token_here
```

5. Configure Claude Desktop to use the local server:
```json
{
  "mcpServers": {
    "MCP_Salesforce": {
      "command": "node",
      "args": ["/path/to/MCP_Salesforce/dist/index.js"],
      "env": {
        "SALESFORCE_LOGIN_URL": "https://login.salesforce.com",
        "SALESFORCE_CLIENT_ID": "your_consumer_key_here",
        "SALESFORCE_CLIENT_SECRET": "your_consumer_secret_here",
        "SALESFORCE_USERNAME": "your_salesforce_username",
        "SALESFORCE_PASSWORD": "your_salesforce_password",
        "SALESFORCE_SECURITY_TOKEN": "your_security_token_here"
      }
    }
  }
}
```

## Available Tools

### Search Tools
- `search_accounts` - Search for accounts by name, industry, or other criteria
- `search_contacts` - Search for contacts by name, email, or other criteria  
- `search_opportunities` - Search for opportunities by name, stage, or other criteria
- `search_leads` - Search for leads by name, company, or other criteria
- `search_all_records` - Global search across all Salesforce records

### Detail Tools
- `get_account_details` - Get detailed information about a specific account
- `get_contact_details` - Get detailed information about a specific contact
- `get_opportunity_details` - Get detailed information about a specific opportunity

### Update Tools
- `update_account` - Update account information
- `update_contact` - Update contact information
- `update_opportunity` - Update opportunity information

### Create Tools
- `create_account` - Create new Salesforce accounts
- `create_contact` - Create new Salesforce contacts
- `create_opportunity` - Create new Salesforce opportunities

### Activity Tools
- `get_recent_activities` - Get recent activities for any record
- `create_task` - Create new tasks in Salesforce

## Usage Examples

### For Sales Teams
- "Search for all opportunities in the 'Negotiation' stage"
- "Show me details for the Acme Corp account"
- "Update the close date for opportunity XYZ to next month"
- "Create a follow-up task for contact John Doe"
- "Create a new opportunity for the Tech Solutions account"
- "Create a new contact for the marketing director at Acme Corp"

### For Marketing Teams
- "Find all leads from the technology industry"
- "Search for contacts at companies with 'Software' in their name"
- "Show me recent activities for our key accounts"
- "Create a new account for the prospect company we just met"
- "Create a new contact for the lead that just signed up"

### For C-Suite
- "Search for all opportunities over $100,000"
- "Find accounts in the financial services industry"
- "Show me recent activities across all major accounts"
- "Create a new strategic account for our enterprise prospect"

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SALESFORCE_LOGIN_URL` | Salesforce login URL (usually https://login.salesforce.com) | Yes |
| `SALESFORCE_CLIENT_ID` | Connected App Consumer Key | Yes |
| `SALESFORCE_CLIENT_SECRET` | Connected App Consumer Secret | Yes |
| `SALESFORCE_USERNAME` | Your Salesforce username | Yes |
| `SALESFORCE_PASSWORD` | Your Salesforce password | Yes |
| `SALESFORCE_SECURITY_TOKEN` | Your Salesforce security token | Yes |

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your username and password are correct
   - Ensure your security token is current (regenerate if needed)
   - Check that your Connected App is properly configured

2. **Permission Errors**
   - Ensure your user has appropriate permissions for the records you're trying to access
   - Check that your Connected App has the correct OAuth scopes

3. **Connection Issues**
   - Verify the `SALESFORCE_LOGIN_URL` is correct
   - For sandbox environments, use `https://test.salesforce.com`

### Getting Help

If you encounter issues:
1. Check the Claude Desktop logs for error messages
2. Verify all environment variables are set correctly
3. Test your Salesforce credentials in the Salesforce web interface
4. Ensure your Connected App is active and properly configured

## Security Considerations

- Never commit your Salesforce credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your security token
- Monitor your Connected App usage in Salesforce

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Jair Waal

## Repository

https://github.com/waaljair/MCP_Salesforce