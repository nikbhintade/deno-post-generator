import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";

export async function transformData(
    folderPath: string,
    transformedDataFilePath: string,
) {
    try {
        if (!existsSync(folderPath)) {
            throw new Error(`Input folder not found: ${folderPath}`);
        }

        const files = await readdir(folderPath);
        console.log(files);

        const allTransformedData = [];
        const cutoffTime = Date.now() - 48 * 60 * 60 * 1000; // 48 hours in milliseconds
        let totalJobsCount = 0;
        let filteredJobsCount = 0;

        for (const file of files) {
            const filePath = `${folderPath}/${file}`;
            const fileData = await readFile(filePath, "utf-8");
            const fileDataInJSON = JSON.parse(fileData);

            const records = fileDataInJSON.data;
            totalJobsCount += records.length; // Increment total jobs count

            const transformedData = records
                .filter((record: any) => {
                    const isOldEnough =
                        new Date(record.timestamp).getTime() < cutoffTime;
                    if (isOldEnough) filteredJobsCount++; // Increment filtered jobs count if it passes the filter
                    return isOldEnough;
                })
                .map((record: any) => ({
                    url: record.url,
                    title: record.title,
                    location: record.location,
                    locationType: record.locationType,
                    timestamp: new Date(record.timestamp).toLocaleString(),
                    originalTimestamp: record.timestamp,
                    organization: record.organization.name,
                }));

            allTransformedData.push(...transformedData);
            console.log(
                `Processed ${file}: ${transformedData.length} records transformed.`,
            );
        }

        console.log(`Total jobs: ${totalJobsCount}`);
        console.log(
            `Filtered jobs (posted before 48 hours): ${filteredJobsCount}`,
        );

        allTransformedData.sort((a, b) =>
            b.originalTimestamp - a.originalTimestamp
        );

        await writeFile(
            transformedDataFilePath,
            JSON.stringify(allTransformedData, null, 4),
        );

        console.log(
            `All transformed data successfully saved to ${transformedDataFilePath}`,
        );
    } catch (error) {
        console.error(`Error in processing fetched data: ${error}`);
    }
}
