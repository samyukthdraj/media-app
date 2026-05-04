# EHAS PORTFOLIO — Media Library & Showcase

A premium, high-performance media portfolio and administration suite built with modern web technologies. This project is designed for creators who need a sophisticated, editorial-style showcase for their visual work (photos and videos) with a powerful back-office for content management.

---

## ✦ Why This Project?

Most portfolio templates are either too rigid or too complex to manage. **EHAS Portfolio** was built to solve this by providing:

1.  **Editorial Aesthetics**: A clean, grayscale-inspired design that lets the media speak for itself, utilizing premium typography and smooth transitions.
2.  **Zero-Friction Management**: An integrated admin dashboard that makes uploading, deleting, and reordering media as simple as a few clicks.
3.  **Performant Delivery**: Leveraging Next.js 15+ and modern image optimization to ensure lightning-fast load times even with high-resolution assets.
4.  **Hybrid Media Support**: Seamlessly handles both high-quality images and embedded video content in a unified gallery interface.

---

## 🛠 Technical Stack

This application is built on a cutting-edge, type-safe stack:

### **Core**
- **Next.js 15 (App Router)**: The foundation for the entire application, utilizing Server Components for speed and Client Components for interactivity.
- **React 19**: Utilizing the latest features of the React ecosystem for efficient rendering and state management.
- **TypeScript**: Ensuring end-to-end type safety across the frontend and backend.

### **Backend & Storage**
- **MongoDB & Mongoose**: A robust NoSQL database solution for storing media metadata, project titles, and administrative configurations.
- **UploadThing**: A developer-first file upload service used for secure, serverless media handling and storage.

### **UI & Experience**
- **Tailwind CSS v4**: Utilizing the latest iteration of Tailwind for high-performance styling with zero runtime overhead.
- **Framer Motion**: Powering fluid page transitions and micro-animations that enhance the "premium" feel.
- **Shadcn/UI & Radix UI**: A collection of accessible, high-quality primitive components for a polished interface.
- **@dnd-kit**: Providing a smooth drag-and-drop experience in the admin dashboard for reordering media.
- **Lucide React**: A beautiful and consistent icon set used throughout the application.

### **State & Data**
- **TanStack React Query**: Used for efficient data fetching, caching, and synchronization between the client and the database.

---

## 🚀 Key Features

- **Dynamic Gallery**: A responsive masonry or grid-style layout that adapts to various screen sizes while maintaining a professional look.
- **Admin Command Center**: A secure route (`/admin`) allowing administrators to:
    - Upload new photos and videos via drag-and-drop.
    - Live-reorder media items to curate the landing page experience.
    - Instant deletion of outdated content.
- **Interactive Tooltips**: Graceful handling of long filenames and metadata via smart truncation and hover states.
- **Smooth Navigation**: Custom page transitions that maintain the editorial flow as users explore the portfolio.
- **Mobile Optimized**: Fully responsive design ensuring the portfolio looks stunning on any device.

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd media-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following keys:
```env
MONGODB_URI=your_mongodb_connection_string
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
# Add any other required environment variables
```

### 4. Run the development server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```text
├── app/               # Next.js App Router (Pages, Layouts, API)
├── components/        # Reusable UI components
├── lib/               # Shared libraries and database schemas
├── public/            # Static assets
├── utils/             # Helper functions and configurations (e.g., UploadThing)
└── package.json       # Dependencies and scripts
```

---

Developed with precision for high-end visual showcases.
