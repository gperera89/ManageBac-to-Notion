require("dotenv").config(); // Load environment variables from .env
const axios = require("axios");

// Load API keys from environment variables
const MANAGEBAC_API_KEY = process.env.MANAGEBAC_API_KEY;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Function to introduce a delay between API calls
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to get yesterday's date in ISO format
function getYesterdayDate() {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return yesterday.toISOString().split("T")[0] + "T00:00:00+08:00"; // Set time to 00:00 in China (UTC+08:00)
}

// Function to add a behavior note to Notion
async function addNoteToNotion(note) {
	const notionUrl = "https://api.notion.com/v1/pages";

	try {
		// First create the page in the Notion database
		const response = await axios.post(
			notionUrl,
			{
				parent: { database_id: NOTION_DATABASE_ID }, // Ensure database_id is defined here
				properties: {
					Name: {
						title: [
							{
								text: {
									content: `${note.first_name} ${note.last_name}`,
								},
							},
						],
					},
					"Student ID": {
						rich_text: [
							{
								text: { content: note.student_id },
							},
						],
					},
					"Year Level": {
						select: {
							name: note.grade, // Make sure this matches the select field in your Notion database
						},
					},
					"Behaviour Type": {
						select: {
							name: note.behavior_type, // Make sure this matches exactly with Notion property name
						},
					},
					"Incident Time": {
						date: {
							start: note.incident_time, // Make sure the property exists as "Incident Time"
						},
					},
					"Next Step": {
						rich_text: [
							{
								text: { content: note.next_step },
							},
						],
					},
					"Reported By": {
						rich_text: [
							{
								text: { content: note.reported_by }, // Ensure this matches the "Reported By" property in Notion
							},
						],
					},
				},
			},
			{
				headers: {
					Authorization: `Bearer ${NOTION_API_KEY}`,
					"Content-Type": "application/json",
					"Notion-Version": "2022-06-28",
				},
			}
		);

		if (response.status === 200) {
			const pageId = response.data.id;
			console.log(
				`Successfully added note for ${note.first_name} ${note.last_name} to Notion.`
			);

			// Now add the Notes as a block in the created page
			await addNotesBlockToPage(pageId, note.notes);
		}
	} catch (error) {
		console.error("Error adding note to Notion:", error.message);
		console.error("Error Details:", error.response.data); // Log detailed error response
	}
}

// Function to add Notes as a block to a Notion page
async function addNotesBlockToPage(pageId, notesContent) {
	const notionBlocksUrl = `https://api.notion.com/v1/blocks/${pageId}/children`;

	try {
		const response = await axios.patch(
			notionBlocksUrl,
			{
				children: [
					{
						object: "block",
						type: "paragraph",
						paragraph: {
							rich_text: [
								{
									text: {
										content: notesContent.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags
									},
								},
							],
						},
					},
				],
			},
			{
				headers: {
					Authorization: `Bearer ${NOTION_API_KEY}`,
					"Content-Type": "application/json",
					"Notion-Version": "2022-06-28",
				},
			}
		);

		if (response.status === 200) {
			console.log("Notes successfully added as a block inside the page.");
		}
	} catch (error) {
		console.error("Error adding notes block to the page:", error.message);
		console.error("Error Details:", error.response.data);
	}
}

// Function to fetch behaviour notes from ManageBac, filtered by the previous day's date
async function fetchBehaviourNotes(page = 1) {
	try {
		const url = "https://api.managebac.cn/v2/behavior/notes";

		const yesterday = getYesterdayDate(); // Get yesterday's date in ISO format

		const response = await axios.get(url, {
			headers: {
				"auth-token": MANAGEBAC_API_KEY,
				"Content-Type": "application/json",
			},
			params: {
				modified_since: yesterday, // Fetch records from the previous day
				per_page: 100,
				page: page,
			},
		});

		if (response.status === 200) {
			const filteredNotes = response.data.behavior_notes.filter((note) => {
				const grade = note.grade;
				const yearNumber = parseInt(grade.replace("Year ", ""), 10);
				return yearNumber >= 7 && yearNumber <= 13;
			});

			// Add each filtered note to Notion
			for (const note of filteredNotes) {
				await addNoteToNotion(note);
			}

			// Handle pagination: if there are more pages, fetch the next page with a delay to avoid throttling
			if (page < response.data.meta.total_pages) {
				await sleep(2000); // Introduce a delay of 2 seconds between page requests to prevent throttling
				await fetchBehaviourNotes(page + 1);
			} else {
				console.log("All pages fetched, filtered, and added to Notion.");
			}

			return filteredNotes;
		} else {
			console.error(
				"Failed to fetch behaviour notes from ManageBac:",
				response.status
			);
		}
	} catch (error) {
		console.error(
			"Error fetching behaviour notes from ManageBac:",
			error.message
		);
	}
}

// Call the function to fetch the data starting from page 1
fetchBehaviourNotes();
