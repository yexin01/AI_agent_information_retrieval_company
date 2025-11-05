# 🤖 AI Company Information Retriever

An **autonomous AI-powered system** for automatically retrieving, extracting, and visualizing **structured company information** from the web.  
Built by Xin Ye, with **Google AI Studio**, a **Python/Node backend**, and a simple **web-based dashboard**.

## DEMO Video

[![Watch the video](https://img.youtube.com/vi/uKeqqTn9tkk/hqdefault.jpg)](https://www.youtube.com/watch?v=uKeqqTn9tkk)

---

## Overview

This project enables users to type the name of any **public company** and automatically receive a structured company profile containing:

- Financial data (revenue, profit, debt, cashflow, growth)
- Number of employees
- Headquarters
- Founding year
- Economic performance indicators

Once retrieved, the company profile is **stored in a backend database**, allowing for faster access later.  
Users can also **refresh** the data to trigger a new retrieval from the web.

### Components:
- **AI Agent** → Retrieves and extracts company information using Gemini / LangChain pipelines.  
- **Backend API** → Manages search requests, database caching, and data formatting.  
- **Database** → Stores structured JSON objects of company profiles.  
- **WebApp** → Displays company details and metrics in a clean dashboard interface.

---

## 📦 Example Output

**Input:** `Tesla`

**Output JSON:**
```json
{
  "company_name": "Tesla, Inc.",
  "founded_year": 2003,
  "headquarters": "Austin, Texas, USA",
  "employees": 140473,
  "revenue": "81.5B USD",
  "net_income": "12.6B USD",
  "debt": "5.5B USD",
  "growth_rate": "15%",
  "cashflow": "13.1B USD",
  "last_updated": "2025-11-05"
}
```
---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
