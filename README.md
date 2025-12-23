# PhoenixBuild - Construction Company Website

A modern, responsive website for PhoenixBuild construction company, built with React and Tailwind CSS.

## Features

- **Header**: Navigation with logo and contact button
- **Hero Section**: Eye-catching hero with call-to-action
- **Services**: Grid display of construction services
- **About**: Company information with image
- **Gallery**: Image gallery showcasing projects
- **Contact**: Contact form and information
- **Footer**: Copyright information

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
SEBAWEB_2/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Services.jsx
│   │   ├── About.jsx
│   │   ├── Gallery.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Technologies Used

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

## Design

This website is based on a Figma design and implements:
- Custom color palette matching the design system
- Poppins and Righteous fonts
- Responsive layout structure
- Image assets from Figma design

## Notes

- Image assets are currently loaded from localhost URLs provided by Figma. You may need to download and host these images locally for production use.
- The design uses specific color tokens defined in `tailwind.config.js` to match the Figma design system.

