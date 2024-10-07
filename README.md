# ManageBac to Notion Automation

This project automates the process of fetching behavior notes from ManageBac and uploading them into a Notion database. The script is written in Node.js and is scheduled to run daily at 5 AM (China time) using GitHub Actions.

## Project Overview

This automation will:
- Fetch behavior notes from ManageBac, filtered for Year 7 to Year 13 students.
- Upload the fetched notes to a Notion database, where each record is stored as a new page.
- Run daily at 5 AM (Perth time) for the previous day's notes, using GitHub Actions to schedule and execute the script automatically.

## Features

- **Daily Automation**: Runs daily at 5 AM using GitHub Actions, fetching behavior notes from ManageBac for the previous day.
- **Notion Integration**: The script adds the fetched data to Notion, organizing it by student with relevant information (e.g., grade, behavior type, incident time).
- **Error Handling and Logs**: The automation logs successes and errors in the GitHub Actions tab, allowing for easy troubleshooting.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime used for building the script.
- **Axios**: A promise-based HTTP client used to fetch data from the ManageBac API and interact with the Notion API.
- **GitHub Actions**: Automates the execution of the script, ensuring it runs daily at 5 AM.
- **Notion API**: Used to add the fetched behavior notes as pages in a Notion database.
- **ManageBac API**: Used to retrieve behavior notes from the school’s system.

## Environment Variables

You will need to set up your environment variables to use both the ManageBac and Notion APIs. These environment variables should be stored in a .env file in the root directory.

Create a .env file with the following contents:
- MANAGEBAC_API_KEY=your_managebac_api_key
- NOTION_API_KEY=your_notion_api_key
- NOTION_DATABASE_ID=your_notion_database_id

## How It Works

1.	Fetch Behavior Notes: The script uses the ManageBac API to fetch behavior notes for Year 7 to Year 13 students. It fetches data for the previous day.
2.	Upload to Notion: The script adds each behavior note to your Notion database, creating a new page with relevant fields (e.g., student name, behavior type, incident time).
3.	Scheduled Execution: The script runs automatically every day at 5 AM (China time) using GitHub Actions.

## Dependencies
- axios: For making HTTP requests to the ManageBac and Notion APIs.
- dotenv: For loading environment variables from the .env file.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
