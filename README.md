# C++ Primer Progress Tracker

A simple web application for tracking study progress through the C++ Primer book. Built for Khare and Roy to monitor their learning journey together.

## Features

- **Two-column layout**: Khare's progress on the left, Roy's on the right
- **Real-time updates**: Checkbox interactions update progress instantly
- **Progress visualization**: Overall and chapter-level progress bars
- **Responsive design**: Works on desktop and mobile devices
- **Persistent storage**: Progress saved to JSON file on server
- **Simple API**: RESTful endpoints for data management

## Tech Stack

- **Frontend**: HTML, Bootstrap CSS, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Database**: Flat JSON file storage
- **Hosting**: Render (Free tier)

## Project Structure

```
track_progress/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # Custom CSS styles
│   └── script.js          # Frontend JavaScript
├── progress.json          # Progress data file
├── server.js              # Express server
├── package.json           # Node.js dependencies
├── render.yaml            # Render deployment config
└── README.md              # This file
```

## Local Development

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Setup

1. **Clone or download the project**
   ```bash
   cd track_progress
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Commands

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## API Endpoints

### GET /progress
Returns the complete progress data.

**Response:**
```json
{
  "users": ["Khare", "Roy"],
  "book": [
    {
      "chapter": "Chapter 1: Getting Started",
      "subtopics": [
        {
          "id": "1.1",
          "title": "Writing a Simple C++ Program",
          "Khare": true,
          "Roy": false
        }
      ]
    }
  ]
}
```

### POST /progress/update
Updates a specific subtopic for a user.

**Request Body:**
```json
{
  "user": "Khare",
  "subtopicId": "1.1",
  "status": true
}
```

**Response:** Updated chapter data

## Deployment on Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
2. **Connect your repository to Render**
3. **Render will automatically detect the render.yaml file**
4. **Deploy both services automatically**

### Option 2: Manual Setup

#### Backend Service
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add a persistent disk (1GB) for data storage

#### Frontend Service
1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Set publish directory: `public`
4. Set build command: `echo "Static site"`

## Data Model

The `progress.json` file contains:

- **users**: Array of user names
- **book**: Array of chapters
  - **chapter**: Chapter title
  - **subtopics**: Array of subtopics
    - **id**: Unique identifier
    - **title**: Subtopic title
    - **Khare**: Boolean completion status
    - **Roy**: Boolean completion status

## User Interface

### Layout
- **Header**: Application title and description
- **Overall Progress**: Top-level progress bars for both users
- **Main Content**: Two-column layout with user-specific progress
- **Chapter Sections**: Each chapter with its own progress bar
- **Subtopic Rows**: Individual topics with checkboxes

### Features
- **Responsive Design**: Adapts to different screen sizes
- **Visual Feedback**: Toast notifications for updates
- **Progress Bars**: Real-time progress visualization
- **Hover Effects**: Interactive UI elements
- **Error Handling**: Graceful error messages

## Customization

### Adding New Chapters
Edit `progress.json` to add new chapters and subtopics:

```json
{
  "chapter": "New Chapter Title",
  "subtopics": [
    {
      "id": "new.1",
      "title": "New Subtopic",
      "Khare": false,
      "Roy": false
    }
  ]
}
```

### Styling Changes
Modify `public/styles.css` to customize the appearance.

### Adding Users
Update the `users` array in `progress.json` and add corresponding properties to each subtopic.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `server.js` or kill the existing process

2. **CORS errors**
   - Ensure the backend is running and accessible

3. **Data not persisting**
   - Check file permissions for `progress.json`
   - Verify the file path in `server.js`

### Development Tips

- Use browser developer tools to debug JavaScript
- Check server logs for backend errors
- Test API endpoints with tools like Postman

## Future Enhancements

- Real-time WebSocket updates
- User authentication
- Progress analytics and charts
- Export functionality
- Notes and comments per subtopic
- Mobile app version

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.
