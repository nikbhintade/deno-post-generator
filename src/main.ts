// required imports
import { load } from "@std/dotenv";

import { fetchDataAndSave } from "./fetchDataAndSave.ts";
import { transformData } from "./transformData.ts";

import { readFile, writeFile } from "node:fs/promises";

// Function to generate Markdown for jobs posted in the last 24 hours
async function generateMarkdownForRecentJobs(filePath: string) {
  // Read and parse the JSON file
  const jsonData = await readFile(filePath, "utf-8");
  const jobs = JSON.parse(jsonData);

  if (jobs.length === 0) {
    console.log("No jobs posted in the last 24 hours.");
    return;
  }

  // Format the date for the header
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // Generate the Markdown content
  let markdownContent = `🚀 Crypto Jobs Roundup for ${date}! 🚀\n\n`;
  markdownContent +=
    `Looking for your next role in the blockchain/crypto world? Check out these new roles in crypto 👇\n\n`;

  jobs.forEach((job: any, index: number) => {
    // Determine the location: either from `job.location` or a formatted `job.locationType`
    let location: string | undefined;

    if (job.location) {
      location = job.location; // Use location if it exists
    } else if (job.locationType) {
      // Capitalize first letter of locationType and lowercase the rest
      location = job.locationType.charAt(0).toUpperCase() +
        job.locationType.slice(1).toLowerCase();
    }

    // Only add the entry if a location is found
    if (location) {
      // Prepare to build the job entry
      markdownContent += `${
        index + 1
      }. **${job.title}** at **${job.organization}**\n\n`;
      markdownContent += `    Location: ${location}\n\n`;
      markdownContent += `    Link: [Apply Here](${job.url})\n\n`;
    }
  });

  // Define the output file path
  const outputFilePath = `./jobs_roundup_${date.replace(/\s+/g, "_")}.md`;

  // Write the Markdown content to a file
  await writeFile(outputFilePath, markdownContent);
  console.log(`Markdown file created at ${outputFilePath}`);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await load({
    export: true,
  });

  const APIURL = Deno.env.get("APIURL");
  const outputFolderPath = "data";
  const transformedDataFilePath = "transformed-data.json";

  if (!APIURL) {
    console.error("Error: APIURL is not defined in the environment variables.");
    Deno.exit(1);
  }

  // await fetchDataAndSave(APIURL, outputFolderPath);

  // await transformData(outputFolderPath, transformedDataFilePath);

  await generateMarkdownForRecentJobs(transformedDataFilePath);
}
