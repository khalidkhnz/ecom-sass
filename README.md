# E-commerce Project with Next.js and Drizzle ORM

This is an e-commerce project built with Next.js and Drizzle ORM for PostgreSQL database management.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud-based service like Neon, Supabase, Vercel Postgres)

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd ecom
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

Create a `.env` file in the root directory with the following:

```
DATABASE_URL="postgres://username:password@localhost:5432/ecom_db"
```

Replace with your actual PostgreSQL database credentials.

### Database Setup

1. Generate migrations from your schema:

```bash
npm run db:generate
```

2. Apply migrations to your database:

```bash
npm run db:migrate
```

3. (Optional) Seed your database with sample data:

```bash
npm run db:seed
```

4. (Optional) Use Drizzle Studio to view and edit your data:

```bash
npm run db:studio
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Structure

The project uses Drizzle ORM with the following tables:

- **users**: User accounts and authentication
- **products**: Product catalog
- **orders**: Customer orders
- **orderItems**: Items within each order (join table)

## API Endpoints

- `/api/db-test` - Test the database connection and get a list of products

## Drizzle Commands

- `npm run db:generate` - Generate SQL migrations
- `npm run db:push` - Push schema changes directly to the database
- `npm run db:migrate` - Apply migrations to the database
- `npm run db:studio` - Open Drizzle Studio to view/edit data

## Technologies

- [Next.js](https://nextjs.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
