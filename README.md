# Ideathon - Collaborative Idea Management Platform

A modern web application built with Next.js 14, Prisma, and PostgreSQL for managing and collaborating on ideas.

## Features

- 🔐 Authentication with NextAuth.js
- 💡 Idea creation and management
- 👥 Team collaboration
- 🎯 Skill-based matching
- 📊 Kanban board for project management
- 🎨 Modern UI with TailwindCSS and Shadcn/ui

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** TailwindCSS
- **UI Components:** Shadcn/ui
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub account (for authentication)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ideathon"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ideathon.git
   cd ideathon
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ideathon/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── (routes)/       # Application routes
├── components/         # React components
├── lib/               # Utility functions
├── prisma/            # Database schema and migrations
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
