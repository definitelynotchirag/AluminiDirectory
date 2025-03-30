# AlumniDirectory

This project is an alumni directory website that displays profiles of graduates from my college. The application uses Next.js and features a LinkedIn-inspired design to showcase alumni information, their current positions, education details, and contact information.

## Features

- **Alumni Profiles**: Display comprehensive information about each alumni including:
  - Name, profile picture, and headline
  - Current company and position
  - Education history (degrees, field of study)
  - Location information
  - Contact information (LinkedIn profile, email)

- **Advanced Filtering**: Filter alumni by:
  - Global search across multiple fields
  - Company name
  - Current role/position
  - Field of study (Computer Science, IT, Electronics, Management)
  - Further education status

- **Statistics Dashboard**: View aggregated data about alumni including:
  - Total number of alumni
  - Average years of experience
  - Number of unique companies where alumni work

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Axios for data fetching
- **Backend**: API endpoint at `/api/scrap` that provides alumni data

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd linkedinnextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a .env.local file with required environment variables (if any)

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

- app: Main application code
  - `/components`: Reusable UI components
  - `/api`: API routes
  - `/types`: TypeScript type definitions
- public: Static assets
- lib: Utility functions
- config: Configuration files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

