# Iowa DNR Enforcement Order Scraper

This project scrapes enforcement orders from the Iowa Department of Natural Resources (DNR) website, extracts penalty information from PDFs, and stores the data in a SQLite database using Drizzle ORM.

## Features

- Crawls through the Iowa DNR enforcement orders search pages
- Downloads PDF documents for each enforcement order
- Extracts penalty amounts from PDFs using OCR
- Stores order information in a structured database
- Supports parallel processing to speed up data collection

## Prerequisites

You'll need to install ImageMagick on your system:

- For macOS: `brew install imagemagick`
- For Ubuntu/Debian: `sudo apt-get install imagemagick`
- For Windows: Download and install from the [ImageMagick website](https://imagemagick.org/script/download.php)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

3. Create a `.env` file based on the provided `.example.env`:

```
DB_FILE_NAME=file:enforcement_orders.db
HEADLESS=false
MAX_SPAWN_CHUNK_SIZE=5
MAX_PAGE_LOOKUP=66
```

## Configuration Options

- `DB_FILE_NAME`: Path to the SQLite database file
- `HEADLESS`: Set to "true" for headless browser mode, "false" to see the browser UI
- `MAX_SPAWN_CHUNK_SIZE`: Maximum number of parallel page scrapes (default: 5)
- `MAX_PAGE_LOOKUP`: Maximum number of pages to scrape (default: 66)

## Usage

Run the scraper with:

```bash
yarn scrape
```

For development testing:

```bash
yarn test
```

## Project Structure

- `src/crawler.ts`: Main crawler implementation for navigating the Iowa DNR site
- `src/pdf_extractor.ts`: Handles PDF downloading and OCR text extraction
- `src/database/`: Contains Drizzle ORM entities and database configuration
- `src/logger.ts`: Simple logging utility
- `src/index.ts`: Entry point that orchestrates the scraping process

## Database Schema

The scraped data is stored in an `enforcement_orders` table with the following columns:

- `id`: Auto-incrementing primary key
- `defendant`: Name of the entity receiving the order
- `plaintiff`: Issuing agency (Iowa DoNR)
- `year`: Year the order was issued
- `settlement`: Extracted penalty amount
- `violationType`: Type of violation
- `dataSourceLink`: URL source of the data

## OCR Process

The project uses Tesseract.js for Optical Character Recognition (OCR) to extract penalty amounts from PDFs. The process involves:

1. Downloading the PDF file
2. Converting PDF pages to images using ImageMagick
3. Applying OCR to extract text
4. Searching for penalty patterns in the extracted text
5. Cleaning up temporary files

## Development

To modify the project:

1. Make changes to the TypeScript files in the `src` directory
2. Build the project:

```bash
yarn build
```

3. Run the scraper:

```bash
node dist/index.js
```

## Improvements

There are a few things we can consider to improve the codebase, and those are:

- Add [async_pool](https://www.npmjs.com/package/tiny-async-pool) to better handle chunks and parallelism 
- Read only the first page of the converted PDF to save on time as most records appear to have it there, but just for safety it was left to check all
- Add option to spawn multiple instances of browser for faster execution. Then current spawn flow works, but issues with imagick can happen due to parallel calls.
- Allow passing in multiple cli arguments to run multiple child processes, allow passing in start and end page so that we can have multiple dedicated browser instances to scrape