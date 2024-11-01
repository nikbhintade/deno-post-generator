export async function fetchDataAndSave(
    apiUrl: string,
    outputFolderPath: string,
) {
    Deno.mkdirSync(outputFolderPath, { recursive: true });

    const today = new Date().toISOString().split("T")[0];

    for (let page = 1; page <= 3; page++) {
        try {
            const url = `${apiUrl}?page=${page}&limit=20`;
            console.log(`Requesting data from url: ${url}`);
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                },
            });
            console.log(`Response status code: ${response.status}`);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch data for page ${page}: ${response.statusText}`,
                );
            }

            const data = await response.json();

            const filename = `${today}_page${page}.json`;
            const filePath = `${outputFolderPath}/${filename}`;

            await Deno.writeTextFile(filePath, JSON.stringify(data, null, 4));
            console.log(
                `Data for page ${page} successfully saved to ${filePath}`,
            );
        } catch (error) {
            console.error(`Error fetching data for page ${page}:`, error);
        }
    }
}
