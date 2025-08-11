# Family Calendar Frontend

This is the frontend application for the Family Calendar, built with React, Ant Design, and react-big-calendar.

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
# or
yarn
```

2. Start the development server:
```bash
npm start
# or
yarn start
```

3. Access the application at http://localhost:3000

### Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

- `public/`: Static assets
- `src/`: Source code
  - `components/`: React components
    - `Calendar/`: Calendar-related components
    - `Layout/`: Layout components
    - `iCalManager/`: iCal feed management components
  - `services/`: API services
  - `styles/`: CSS styles
  - `utils/`: Utility functions
  - `App.js`: Main application component
  - `index.js`: Application entry point

## Features

- Display events from multiple iCal feeds in a single calendar
- Color-coded events based on calendar source
- Add, remove, and refresh iCal feeds
- Month, week, and day calendar views
- Responsive design with collapsible sidebar

## Connecting to the Backend

The frontend is configured to connect to the backend API at `/api` through a proxy setting in `package.json`. This allows the frontend to make requests to the backend without CORS issues during development.

In production, you may need to configure a reverse proxy (like Nginx) to route requests appropriately.

## Customization

- Color scheme: Edit the theme configuration in `App.js`
- Calendar views: Modify the `CalendarView.js` component
- Styling: Update the CSS in `index.css`
