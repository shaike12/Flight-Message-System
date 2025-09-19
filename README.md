# Flight Message System

A professional flight message management system built with React, Firebase, and Material UI.

## Features

- 🛫 **Flight Message Generation**: Create and manage flight delay/cancellation messages
- 📝 **Template Management**: Create, edit, and manage message templates
- 🌍 **Multi-language Support**: Hebrew and English interface
- 🎨 **Modern UI**: Beautiful Material UI design with dark mode support
- 🔐 **Authentication**: Secure user authentication with Firebase
- 📊 **Statistics**: Track message history and user activity
- 🗺️ **Route Management**: Manage flight routes and destinations
- ⚙️ **Admin Panel**: Advanced features for administrators

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flight-message-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase configuration in `.env.local`. See [Environment Setup Guide](ENVIRONMENT_SETUP.md) for detailed instructions.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Setup

This application requires Firebase configuration. Please see the [Environment Setup Guide](ENVIRONMENT_SETUP.md) for detailed instructions on:

- Setting up Firebase project
- Configuring environment variables
- Security considerations
- Production deployment

## Security

- All sensitive data (API keys, passwords) are stored in environment variables
- `.env.local` is automatically ignored by Git
- Firebase security rules protect your data
- User authentication is handled securely

## Project Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, Language, Theme)
├── firebase/           # Firebase configuration and services
├── locales/            # Internationalization files
├── store/              # Redux store and slices
├── theme/              # Material UI theme configuration
└── types/              # TypeScript type definitions
```

## Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Material UI** - UI components
- **Firebase** - Backend services (Auth, Firestore)
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first CSS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
