# Hotel Reviews Dashboard

A Vue 3 dashboard application for viewing and analyzing hotel reviews with advanced filtering, pagination, sorting, and interactive data visualization.

## Features

### Reviews List Page (`/reviews`)
- ✅ **Dual View Modes**: Toggle between table view (default) and card view
- ✅ **Advanced Filtering**:
  - Country (dynamically fetched from API)
  - Traveler Type
  - Source (platform)
  - Sentiment
  - Score Range (1-5) with validation to prevent invalid combinations
  - Keyword Search (debounced 500ms)
- ✅ **Comprehensive Sorting**: Sort by date, score, hotel name, country, traveler type, source, or sentiment (ascending/descending)
  - Table view: Clickable column headers for sorting
  - Card view: Dropdown selector
  - Client-side fallback for fields not supported by API
- ✅ **Pagination**: Server-side pagination with configurable page size (10, 20, 50, 100)
- ✅ **Searchable Dropdowns**: All filter dropdowns support typing/searching with keyboard navigation
- ✅ **URL Synchronization**: All filters, pagination, sorting, and view mode synced to URL query parameters for shareability
- ✅ **Session Storage**: Filter states persist across navigation (only reset on page refresh)
- ✅ **Active Filter Indicators**: Visual chips showing active filters with count badge
- ✅ **Input Validation**: Score range validation prevents min > max and values outside 1-5 range
- ✅ **Loading States**: Skeleton loaders for better UX
- ✅ **Empty & Error States**: Helpful messages when no data or errors occur
- ✅ **Click to Navigate**: Click any review to view full details

### Review Detail Page (`/reviews/:id`)
- ✅ Full review details including title, content, score, sentiment, metadata
- ✅ Topics display
- ✅ Back navigation to reviews list with preserved filters

### Dashboard Page (`/dashboard`)
- ✅ **5 Interactive Charts**:
  - Bar chart: Review count by country (sorted by volume)
  - Doughnut chart: Traveler type distribution
  - Doughnut chart: Sentiment breakdown (positive/neutral/negative)
  - Doughnut chart: Reviews by source/platform
  - Line chart: Average score and review count by month (dual-axis)
- ✅ **Animated Stat Cards**: 4 summary cards with gradient backgrounds
- ✅ **Period Selector**: Filter data by time range (7, 30, 90, 365 days)
- ✅ **Chart Animations**: Smooth transitions and animations on data updates
- ✅ **URL Synchronization**: Period filter synced to URL query parameters
- ✅ **Session Storage**: Period preference persists across navigation
- ✅ **Interactive Tooltips**: Detailed information on hover
- ✅ **Responsive Design**: Charts adapt to container size

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Vue Router** for navigation and URL state management
- **Chart.js** with vue-chartjs for data visualization
- **Tailwind CSS** for styling and responsive design
- **Axios** for API requests
- **Session Storage** for client-side state persistence

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ (for the backend API)
- The backend API running on `http://localhost:8080`

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```
   
   **Note**: If `vue-tsc` fails during build, you can run the Vite build directly:
   ```bash
   npx vite build
   ```
   The production build will work correctly regardless of the type checker.

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Backend API Setup

Make sure the backend API is running before starting the frontend:

```bash
# In the backend directory
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8080
```

The API should be accessible at `http://localhost:8080`

### API Proxy Configuration

The frontend uses a Vite proxy to mask the backend API URL. All API requests are made to `/api/*`, which is automatically proxied to `http://localhost:8080/*`. This configuration is defined in `vite.config.ts`:

- **Development**: Requests to `/api` are proxied to `http://localhost:8080`
- **Production**: You'll need to configure your production server (e.g., nginx) to proxy `/api` requests to your backend API

This ensures the backend API URL is not exposed in the browser's network console.

## Project Structure

```
src/
├── components/           # Reusable components organized by domain
│   ├── common/          # Shared components
│   │   ├── SearchableSelect.vue  # Searchable dropdown with keyboard navigation
│   │   └── SortIcon.vue          # Sort indicator icon
│   ├── dashboard/       # Dashboard-specific components
│   │   ├── BarChart.vue
│   │   ├── PieChart.vue
│   │   └── LineChart.vue
│   └── reviews/         # Reviews-specific components
│       ├── FilterPanel.vue        # Filter inputs with validation
│       ├── ReviewCard.vue         # Card view item
│       ├── ReviewTable.vue        # Table container
│       ├── ReviewTableRow.vue     # Table row item
│       └── TableHeader.vue        # Sortable table header
├── composables/         # API composables for data fetching
│   └── useApi.ts
├── router/              # Vue Router configuration
│   └── index.ts
├── types/               # TypeScript type definitions
│   └── api.ts
├── utils/               # Utility functions
│   └── sessionStorage.ts  # Session storage helpers
├── views/               # Page components
│   ├── Dashboard.vue
│   ├── ReviewsList.vue
│   └── ReviewDetail.vue
├── App.vue              # Root component
├── main.ts              # Application entry point
└── style.css            # Global styles
```

## Implementation Details

### Data Handling
- **Composables**: Clean separation of API logic using Vue composables (`useApi`)
- **State Management**: Reactive state for loading, error, and data with Vue 3 Composition API
- **Pagination**: Server-side pagination with configurable page size (10, 20, 50, 100)
- **Filtering**: 
  - Multiple filter types with proper query parameter handling
  - Dynamic country list fetched from analytics API
  - Input validation for score range (prevents min > max, enforces 1-5 range)
  - Auto-correction for invalid score combinations
- **Sorting**: 
  - Multiple sort fields (date, score, hotel name, country, traveler type, source, sentiment)
  - Client-side fallback for fields not supported by API
  - Table header click sorting in table view
- **Debouncing**: Filter changes debounced (500ms) to reduce API calls
- **API Proxy**: Vite proxy configured to mask backend API URL (`/api` → `http://localhost:8080`)

### URL & State Persistence
- **URL Synchronization**: All filters, pagination, sorting, and view mode synced to URL query parameters
  - Shareable URLs that restore exact view state
  - URL parameters take priority over session storage
- **Session Storage**: Filter states persist across navigation
  - Filters retained when navigating between pages
  - Only reset on full page refresh
  - URL updated to reflect session storage values on mount

### Charts
- **Chart.js Integration**: Using vue-chartjs wrapper for Vue 3
- **Animations**: Explicit animation configuration with smooth transitions
  - Duration and easing configured for appealing visuals
  - Key-based re-rendering triggers animations on data changes
- **Data Mapping**: Properly mapped API responses to chart data structures
- **Tooltips**: Custom tooltips showing count, percentage, and average scores
- **Responsive**: Charts adapt to container size
- **Dual-axis**: Line chart uses dual y-axes for score and count
- **Color Schemes**: Custom color palettes for different chart types

### Component Architecture
- **Atomic Design**: Components organized by domain (common, dashboard, reviews)
- **Reusability**: 
  - `SearchableSelect`: Searchable dropdown used across all filters
  - `SortIcon`: Reusable sort indicator
  - Chart components: Consistent API and styling
- **Separation of Concerns**: 
  - `FilterPanel`: Encapsulates all filter logic and validation
  - `ReviewTable` & `ReviewCard`: Separate view implementations
  - `TableHeader`: Individual sortable header component

### UX Features
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Loading States**: Skeleton loaders for better perceived performance
- **Error Handling**: Clear error messages for failed requests (including 422 validation errors)
- **Empty States**: Helpful messages when no data is available
- **Smooth Navigation**: Router-based navigation with preserved state
- **Visual Feedback**: 
  - Color-coded badges for scores and sentiments
  - Active filter chips with count indicators
  - Hover states and transitions
- **Keyboard Navigation**: Full keyboard support in searchable dropdowns
- **Input Validation**: Real-time validation with error messages and auto-correction

## Trade-offs & Decisions

1. **Chart Library**: Chose Chart.js over ECharts for simplicity and good Vue integration. Chart.js is lighter and easier to customize for this use case. Added explicit animations for better visual appeal.

2. **State Management**: Used composables instead of Pinia/Vuex for simplicity. The app is small enough that composables provide sufficient state management. Combined with session storage for persistence.

3. **URL Query Params**: ✅ **Implemented** - All filters, pagination, sorting, and view modes are synced to URL for shareability and bookmarking.

4. **Request Caching**: Not implemented. Could add caching with a library like SWR or TanStack Query for better performance, but debouncing provides sufficient optimization for this use case.

5. **Testing**: Focused on core functionality. Would add unit tests for composables and component tests for critical paths in production.

6. **Styling**: Used Tailwind CSS utility classes for rapid development. Components are well-organized into atomic, reusable pieces.

7. **Component Organization**: Organized components into `common`, `dashboard`, and `reviews` folders following atomic design principles for better maintainability.

8. **API Proxy**: Implemented Vite proxy to hide backend API URL from browser network console for security.

9. **Input Validation**: Implemented client-side validation for score range to prevent API errors (422) and improve UX with immediate feedback.

10. **View Modes**: Implemented both table and card views to accommodate different user preferences, with table as default for data density.

## Future Enhancements

- [ ] Request caching with stale-while-revalidate
- [ ] Unit tests for composables
- [ ] Component tests for critical user flows
- [ ] Export charts as images
- [ ] Advanced filtering with date ranges
- [ ] Multi-select filters for better UX
- [ ] Dark mode support
- [ ] Advanced analytics (trends, comparisons)
- [ ] Export filtered data to CSV/Excel
- [ ] Real-time data updates (WebSocket)

## License

This is a take-home project for evaluation purposes.
